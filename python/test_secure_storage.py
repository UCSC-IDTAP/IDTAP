#!/usr/bin/env python3
"""Test script for secure token storage implementation."""

import json
import sys
from pathlib import Path

# Add the package to the path
sys.path.insert(0, str(Path(__file__).parent))

from idtap_api.secure_storage import SecureTokenStorage
from idtap_api.client import SwaraClient


def test_secure_storage():
    """Test the secure storage functionality."""
    print("🔧 Testing Secure Token Storage Implementation")
    print("=" * 50)
    
    # Test 1: Storage creation and info
    print("\n1. Testing storage initialization...")
    storage = SecureTokenStorage()
    info = storage.get_storage_info()
    
    print(f"   Storage method: {info.get('storage_method', 'not set')}")
    print(f"   Security level: {info.get('security_level', 'unknown')}")
    print(f"   Keyring available: {info.get('keyring_available', False)}")
    print(f"   Encryption available: {info.get('encryption_available', False)}")
    print(f"   JWT validation available: {info.get('jwt_validation_available', False)}")
    
    # Test 2: Token storage and retrieval
    print("\n2. Testing token storage and retrieval...")
    test_tokens = {
        "access_token": "test_access_token_12345",
        "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.test_signature",
        "refresh_token": "test_refresh_token_67890",
        "profile": {
            "sub": "1234567890",
            "name": "Test User",
            "email": "test@test.com"
        }
    }
    
    # Store tokens
    if storage.store_tokens(test_tokens):
        print("   ✅ Tokens stored successfully")
    else:
        print("   ❌ Failed to store tokens")
        return False
    
    # Retrieve tokens
    retrieved_tokens = storage.load_tokens()
    if retrieved_tokens:
        print("   ✅ Tokens retrieved successfully")
        print(f"   Retrieved profile: {retrieved_tokens.get('profile', {}).get('name', 'N/A')}")
    else:
        print("   ❌ Failed to retrieve tokens")
        return False
    
    # Test 3: Token expiration check
    print("\n3. Testing token expiration validation...")
    is_expired = storage.is_token_expired(retrieved_tokens)
    print(f"   Token expired: {is_expired}")
    
    # Test 4: Legacy migration test
    print("\n4. Testing legacy token migration...")
    legacy_path = Path.home() / ".swara" / "test_legacy_token.json"
    legacy_path.parent.mkdir(exist_ok=True, parents=True)
    
    # Create a fake legacy token file
    legacy_tokens = {
        "id_token": "legacy_id_token_12345",
        "profile": {"name": "Legacy User", "email": "legacy@test.com"}
    }
    
    with legacy_path.open("w") as f:
        json.dump(legacy_tokens, f)
    
    print(f"   Created test legacy file: {legacy_path}")
    
    # Test storage instance with migration
    storage2 = SecureTokenStorage()
    
    # Manually test migration (normally this happens automatically)
    if legacy_path.exists():
        try:
            with legacy_path.open("r") as f:
                legacy_data = json.load(f)
            
            if storage2.store_tokens(legacy_data):
                legacy_path.unlink()  # Remove test file
                print("   ✅ Legacy migration simulation successful")
            else:
                print("   ❌ Legacy migration simulation failed")
        except Exception as e:
            print(f"   ❌ Legacy migration error: {e}")
    
    # Test 5: Clear tokens
    print("\n5. Testing token clearing...")
    if storage.clear_tokens():
        print("   ✅ Tokens cleared successfully")
    else:
        print("   ❌ Failed to clear tokens")
    
    # Verify tokens are gone
    cleared_tokens = storage.load_tokens()
    if cleared_tokens is None:
        print("   ✅ Confirmed tokens are cleared")
    else:
        print("   ⚠️  Some tokens may still exist")
    
    print("\n" + "=" * 50)
    print("✅ Secure storage test completed successfully!")
    return True


def test_client_integration():
    """Test the client integration with secure storage."""
    print("\n🔧 Testing Client Integration")
    print("=" * 50)
    
    print("\n1. Testing client initialization...")
    try:
        # Create client without auto-login to test storage setup
        client = SwaraClient(auto_login=False)
        print("   ✅ Client initialized successfully")
        
        # Get auth info
        auth_info = client.get_auth_info()
        print(f"   Authenticated: {auth_info['authenticated']}")
        print(f"   Storage method: {auth_info['storage_info']['storage_method']}")
        print(f"   Security level: {auth_info['storage_info']['security_level']}")
        
        if not auth_info['authenticated']:
            print("   ℹ️  No stored authentication found (expected for fresh install)")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Client initialization failed: {e}")
        return False


if __name__ == "__main__":
    print("🔐 Swara Studio Secure Token Storage Test Suite")
    print("=" * 60)
    
    # Check dependencies
    try:
        import keyring
        print("✅ keyring package available")
    except ImportError:
        print("⚠️  keyring package not available - will use fallback storage")
    
    try:
        import cryptography
        print("✅ cryptography package available")
    except ImportError:
        print("⚠️  cryptography package not available - limited fallback options")
    
    try:
        import jwt
        print("✅ PyJWT package available")
    except ImportError:
        print("⚠️  PyJWT package not available - limited token validation")
    
    # Run tests
    storage_success = test_secure_storage()
    client_success = test_client_integration()
    
    print("\n" + "=" * 60)
    if storage_success and client_success:
        print("🎉 All tests passed! Secure storage implementation is working.")
        print("\n💡 Next steps:")
        print("   1. Install optional dependencies: pip install keyring cryptography PyJWT")
        print("   2. Test authentication flow with: python -c \"from idtap_api.client import SwaraClient; SwaraClient()\"")
        print("   3. Check storage security with client.get_auth_info()")
    else:
        print("❌ Some tests failed. Check the output above for details.")
        sys.exit(1)