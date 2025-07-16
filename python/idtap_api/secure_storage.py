"""Secure token storage for Swara Studio API client.

This module provides secure storage for OAuth tokens using OS keyring services
with encrypted file fallback for environments where keyring is not available.
"""

import json
import getpass
import socket
import time
import hashlib
import base64
from typing import Dict, Any, Optional
from pathlib import Path

try:
    import keyring
    KEYRING_AVAILABLE = True
except ImportError:
    KEYRING_AVAILABLE = False

try:
    from cryptography.fernet import Fernet
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False

try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False


class SecureTokenStorage:
    """Secure storage for OAuth tokens with multiple backend support."""
    
    def __init__(self, service_name: str = "swara_studio"):
        """Initialize secure token storage.
        
        Args:
            service_name: Name of the service for keyring storage
        """
        self.service_name = service_name
        self.username = getpass.getuser()
        self._storage_method = None
        
    def store_tokens(self, tokens: Dict[str, Any]) -> bool:
        """Store tokens securely using the best available method.
        
        Args:
            tokens: Dictionary containing OAuth tokens and profile data
            
        Returns:
            bool: True if tokens were stored successfully, False otherwise
        """
        # Try OS keyring first (most secure)
        if KEYRING_AVAILABLE and self._try_keyring_storage(tokens):
            self._storage_method = "keyring"
            return True
            
        # Fallback to encrypted file storage
        if CRYPTOGRAPHY_AVAILABLE and self._store_encrypted_fallback(tokens):
            self._storage_method = "encrypted_file"
            return True
            
        # Last resort: warn user about plaintext storage
        print("⚠️  WARNING: Secure storage unavailable. Install 'keyring' and 'cryptography' packages for secure token storage.")
        if self._store_plaintext_fallback(tokens):
            self._storage_method = "plaintext"
            return True
            
        return False
    
    def load_tokens(self) -> Optional[Dict[str, Any]]:
        """Load tokens from secure storage.
        
        Returns:
            Optional[Dict[str, Any]]: Token data if found, None otherwise
        """
        # Try OS keyring first
        if KEYRING_AVAILABLE:
            tokens = self._load_from_keyring()
            if tokens:
                return tokens
        
        # Try encrypted file storage
        if CRYPTOGRAPHY_AVAILABLE:
            tokens = self._load_encrypted_fallback()
            if tokens:
                return tokens
                
        # Try plaintext fallback (legacy)
        return self._load_plaintext_fallback()
    
    def clear_tokens(self) -> bool:
        """Clear stored tokens from all storage backends.
        
        Returns:
            bool: True if tokens were cleared successfully
        """
        success = True
        
        # Clear from keyring
        if KEYRING_AVAILABLE:
            try:
                keyring.delete_password(self.service_name, self.username)
            except Exception:
                pass  # Token might not exist
        
        # Clear encrypted file
        encrypted_path = Path.home() / ".swara" / ".tokens.enc"
        if encrypted_path.exists():
            try:
                encrypted_path.unlink()
            except Exception:
                success = False
        
        # Clear plaintext file (legacy)
        plaintext_path = Path.home() / ".swara" / "token.json"
        if plaintext_path.exists():
            try:
                plaintext_path.unlink()
            except Exception:
                success = False
                
        return success
    
    def is_token_expired(self, tokens: Dict[str, Any]) -> bool:
        """Check if stored tokens are expired.
        
        Args:
            tokens: Token data dictionary
            
        Returns:
            bool: True if tokens are expired or invalid
        """
        if not JWT_AVAILABLE:
            # If we can't verify, assume expired after 1 hour
            stored_time = tokens.get("stored_at", 0)
            return time.time() - stored_time > 3600
            
        try:
            id_token = tokens.get("id_token")
            if not id_token:
                return True
                
            # Decode without verification to check expiration
            decoded = jwt.decode(id_token, options={"verify_signature": False})
            exp = decoded.get("exp", 0)
            
            # Add 5 minute buffer before expiration
            return time.time() > (exp - 300)
            
        except Exception:
            return True  # Assume expired if we can't decode
    
    def get_storage_info(self) -> Dict[str, Any]:
        """Get information about the storage method being used.
        
        Returns:
            Dict[str, Any]: Storage method and security information
        """
        return {
            "storage_method": self._storage_method,
            "keyring_available": KEYRING_AVAILABLE,
            "encryption_available": CRYPTOGRAPHY_AVAILABLE,
            "jwt_validation_available": JWT_AVAILABLE,
            "security_level": self._get_security_level()
        }
    
    def migrate_legacy_tokens(self) -> bool:
        """Migrate existing plaintext tokens to secure storage.
        
        Returns:
            bool: True if migration was successful or no migration needed
        """
        legacy_path = Path.home() / ".swara" / "token.json"
        
        if not legacy_path.exists():
            return True  # No migration needed
            
        try:
            with legacy_path.open("r", encoding="utf-8") as f:
                legacy_tokens = json.load(f)
            
            # Add migration timestamp
            legacy_tokens["migrated_at"] = time.time()
            
            # Store in secure storage
            if self.store_tokens(legacy_tokens):
                # Remove legacy file after successful migration
                legacy_path.unlink()
                print("✅ Successfully migrated tokens to secure storage")
                return True
            else:
                print("⚠️  Failed to migrate tokens - keeping legacy file")
                return False
                
        except Exception as e:
            print(f"❌ Token migration failed: {e}")
            return False
    
    def _try_keyring_storage(self, tokens: Dict[str, Any]) -> bool:
        """Try to store tokens using OS keyring."""
        try:
            tokens_with_timestamp = {**tokens, "stored_at": time.time()}
            keyring.set_password(
                self.service_name,
                self.username,
                json.dumps(tokens_with_timestamp)
            )
            return True
        except Exception:
            return False
    
    def _load_from_keyring(self) -> Optional[Dict[str, Any]]:
        """Load tokens from OS keyring."""
        try:
            stored_data = keyring.get_password(self.service_name, self.username)
            if stored_data:
                return json.loads(stored_data)
        except Exception:
            pass
        return None
    
    def _store_encrypted_fallback(self, tokens: Dict[str, Any]) -> bool:
        """Store tokens using encrypted file storage."""
        try:
            # Generate encryption key from user-specific data
            key_material = f"{self.username}:{self.service_name}:{self._get_machine_id()}"
            key = base64.urlsafe_b64encode(
                hashlib.pbkdf2_hmac('sha256', key_material.encode(), b'swara_salt', 100000)[:32]
            )
            
            fernet = Fernet(key)
            tokens_with_timestamp = {**tokens, "stored_at": time.time()}
            encrypted_data = fernet.encrypt(json.dumps(tokens_with_timestamp).encode())
            
            # Store in protected location
            secure_path = Path.home() / ".swara" / ".tokens.enc"
            secure_path.parent.mkdir(mode=0o700, exist_ok=True)
            
            with secure_path.open("wb") as f:
                f.write(encrypted_data)
            
            # Set restrictive permissions
            secure_path.chmod(0o600)
            return True
            
        except Exception:
            return False
    
    def _load_encrypted_fallback(self) -> Optional[Dict[str, Any]]:
        """Load tokens from encrypted file storage."""
        try:
            secure_path = Path.home() / ".swara" / ".tokens.enc"
            if not secure_path.exists():
                return None
                
            # Generate same encryption key
            key_material = f"{self.username}:{self.service_name}:{self._get_machine_id()}"
            key = base64.urlsafe_b64encode(
                hashlib.pbkdf2_hmac('sha256', key_material.encode(), b'swara_salt', 100000)[:32]
            )
            
            fernet = Fernet(key)
            
            with secure_path.open("rb") as f:
                encrypted_data = f.read()
            
            decrypted_data = fernet.decrypt(encrypted_data)
            return json.loads(decrypted_data.decode())
            
        except Exception:
            return None
    
    def _store_plaintext_fallback(self, tokens: Dict[str, Any]) -> bool:
        """Store tokens in plaintext as last resort (insecure)."""
        try:
            token_path = Path.home() / ".swara" / "token.json"
            token_path.parent.mkdir(mode=0o700, exist_ok=True)
            
            tokens_with_timestamp = {**tokens, "stored_at": time.time()}
            
            with token_path.open("w", encoding="utf-8") as f:
                json.dump(tokens_with_timestamp, f, indent=2)
            
            # Set restrictive permissions
            token_path.chmod(0o600)
            return True
            
        except Exception:
            return False
    
    def _load_plaintext_fallback(self) -> Optional[Dict[str, Any]]:
        """Load tokens from plaintext storage (legacy)."""
        try:
            token_path = Path.home() / ".swara" / "token.json"
            if not token_path.exists():
                return None
                
            with token_path.open("r", encoding="utf-8") as f:
                return json.load(f)
                
        except Exception:
            return None
    
    def _get_machine_id(self) -> str:
        """Get unique machine identifier for encryption key."""
        try:
            # Try various machine ID sources
            sources = [
                "/etc/machine-id",
                "/var/lib/dbus/machine-id",
                "/sys/class/dmi/id/product_uuid"
            ]
            for source in sources:
                source_path = Path(source)
                if source_path.exists():
                    return source_path.read_text().strip()
        except Exception:
            pass
        
        # Fallback to hostname + user
        return f"{socket.gethostname()}:{self.username}"
    
    def _get_security_level(self) -> str:
        """Determine the security level of current storage method."""
        if self._storage_method == "keyring":
            return "high"
        elif self._storage_method == "encrypted_file":
            return "medium"
        elif self._storage_method == "plaintext":
            return "low"
        else:
            return "unknown"


class AuthenticationError(Exception):
    """Exception raised for authentication-related errors."""
    pass