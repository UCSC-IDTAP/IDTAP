# Secure Token Storage for Swara Studio Python Client

This document describes the secure token storage implementation for the Swara Studio Python API client.

## Overview

The Python client now uses a multi-layered security approach for storing OAuth tokens:

1. **OS Keyring** (Primary) - Uses system keychain/credential manager
2. **Encrypted File** (Fallback) - AES encryption with machine-specific keys  
3. **Plaintext File** (Legacy) - Only used when other methods unavailable

## Security Levels

| Storage Method | Security Level | Description |
|----------------|----------------|-------------|
| OS Keyring | **High** | Platform-native encryption, requires OS authentication |
| Encrypted File | **Medium** | AES-256 encryption with PBKDF2 key derivation |
| Plaintext File | **Low** | Unencrypted storage (legacy compatibility only) |

## Installation

### Required Dependencies
```bash
pip install requests
```

### Recommended Security Dependencies
```bash
pip install keyring cryptography PyJWT
```

### Optional Linux Dependencies
```bash
pip install secretstorage  # For better Linux keyring support
```

## Usage

### Basic Usage (Automatic)
```python
from idtap_api.client import SwaraClient

# Client automatically uses secure storage
client = SwaraClient()

# Check authentication and storage info
auth_info = client.get_auth_info()
print(f"Security level: {auth_info['storage_info']['security_level']}")
```

### Advanced Usage (Manual Storage Management)
```python
from idtap_api.secure_storage import SecureTokenStorage
from idtap_api.auth import login_google, load_token

# Create secure storage instance
storage = SecureTokenStorage()

# Check storage capabilities
info = storage.get_storage_info()
print(f"Storage method: {info['storage_method']}")
print(f"Security level: {info['security_level']}")

# Manual authentication
login_google(storage=storage)

# Load tokens
tokens = load_token(storage=storage)
```

## Migration from Legacy Storage

The system automatically migrates existing plaintext tokens to secure storage:

1. **Automatic Migration**: Happens during first use of new client
2. **Backwards Compatibility**: Old token files are automatically detected and migrated
3. **Safe Cleanup**: Legacy files removed only after successful migration

### Manual Migration
```python
from idtap_api.secure_storage import SecureTokenStorage

storage = SecureTokenStorage()
success = storage.migrate_legacy_tokens()
print(f"Migration successful: {success}")
```

## Security Features

### Token Lifecycle Management
- **Expiration Detection**: Automatic detection of expired tokens
- **Secure Deletion**: Proper cleanup when clearing tokens
- **Cross-Platform**: Works on macOS, Windows, and Linux

### Encryption Details (Fallback Mode)
- **Algorithm**: AES-256 in Fernet mode (symmetric encryption)
- **Key Derivation**: PBKDF2-HMAC-SHA256 with 100,000 iterations
- **Key Material**: Username + service name + machine ID
- **Salt**: Fixed application salt for consistency

### State Management
- **CSRF Protection**: State parameter validation in OAuth flow
- **Secure Random**: Cryptographically secure token generation
- **Machine Binding**: Encryption keys tied to specific machine

## Platform-Specific Behavior

### macOS
- **Primary**: Keychain Services
- **Fallback**: Encrypted file in `~/.swara/.tokens.enc`
- **Permissions**: 0o600 (user read/write only)

### Windows  
- **Primary**: Windows Credential Manager
- **Fallback**: Encrypted file in `%USERPROFILE%\.swara\.tokens.enc`
- **Permissions**: User-only access

### Linux
- **Primary**: Secret Service (GNOME Keyring, KWallet)
- **Fallback**: Encrypted file in `~/.swara/.tokens.enc`
- **Permissions**: 0o700 directory, 0o600 file

## Troubleshooting

### Common Issues

#### "Secure storage unavailable" Warning
```
⚠️ WARNING: Secure storage unavailable. Install 'keyring' and 'cryptography' packages for secure token storage.
```

**Solution**: Install security dependencies
```bash
pip install keyring cryptography
```

#### Linux Keyring Issues
**Problem**: Keyring not available in headless environments

**Solution**: 
1. Install `secretstorage`: `pip install secretstorage`
2. Or use encrypted file fallback (automatic)

#### Token Expiration
**Problem**: "Stored tokens are expired" message

**Solution**: Re-authenticate
```python
from idtap_api.auth import login_google
login_google()  # Will overwrite expired tokens
```

### Testing Storage Security

Run the test suite to verify your installation:
```bash
cd python/
python test_secure_storage.py
```

### Checking Current Storage Method
```python
from idtap_api.client import SwaraClient

client = SwaraClient(auto_login=False)
auth_info = client.get_auth_info()

print(f"Storage method: {auth_info['storage_info']['storage_method']}")
print(f"Security level: {auth_info['storage_info']['security_level']}")
```

## Security Best Practices

1. **Install All Dependencies**: Use `keyring` and `cryptography` for maximum security
2. **Regular Updates**: Keep dependencies updated for security patches
3. **Environment Security**: Secure your development environment
4. **Token Rotation**: Re-authenticate periodically in production environments
5. **Audit Logging**: Monitor authentication events in production

## API Reference

### SecureTokenStorage Class

#### Methods
- `store_tokens(tokens: Dict[str, Any]) -> bool`: Store tokens securely
- `load_tokens() -> Optional[Dict[str, Any]]`: Load stored tokens
- `clear_tokens() -> bool`: Clear all stored tokens
- `is_token_expired(tokens: Dict[str, Any]) -> bool`: Check token expiration
- `get_storage_info() -> Dict[str, Any]`: Get storage method information
- `migrate_legacy_tokens() -> bool`: Migrate from plaintext storage

#### Properties
- `service_name`: Service identifier for keyring storage
- `username`: Current system username

### Authentication Functions

- `login_google(base_url, storage, host, port)`: Authenticate with Google OAuth
- `load_token(storage, token_path)`: Load tokens with backwards compatibility  
- `clear_token(storage, token_path)`: Clear tokens from all storage locations

## Contributing

When contributing to the secure storage implementation:

1. **Security Review**: All changes require security review
2. **Backwards Compatibility**: Maintain compatibility with existing token storage
3. **Cross-Platform Testing**: Test on macOS, Windows, and Linux
4. **Documentation**: Update security documentation for any changes

## Security Disclosure

If you discover security vulnerabilities in the token storage implementation, please report them responsibly:

1. **Do not** create public GitHub issues for security vulnerabilities
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for fixes before public disclosure