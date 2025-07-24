#!/usr/bin/env python3
"""
Test script to demonstrate the logout functionality.

This script shows how to:
1. Connect to IDTAP
2. Check authentication status
3. Log out properly
4. Verify logout worked
"""

from idtap_api import SwaraClient

def main():
    """Demonstrate logout functionality."""
    print("🔐 IDTAP Python API - Logout Functionality Test")
    print("=" * 50)
    
    # Step 1: Connect to IDTAP platform
    print("Connecting to IDTAP platform...")
    try:
        client = SwaraClient()
        print(f"✅ Connected as: {client.user.get('name', 'Unknown User')}")
        print(f"   User ID: {client.user_id}")
        print(f"   Storage method: {client.secure_storage.get_storage_info()['storage_method']}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("💡 You may need to authenticate first. Try running new_user_experience.py")
        return
    
    # Step 2: Show some API functionality works
    print("\n📊 Testing API access...")
    try:
        transcriptions = client.get_viewable_transcriptions()
        print(f"✅ API access working - found {len(transcriptions)} transcriptions")
    except Exception as e:
        print(f"❌ API access failed: {e}")
    
    # Step 3: Demonstrate logout
    print("\n🚪 Testing logout functionality...")
    
    # Show interactive logout (will prompt for confirmation)
    print("Interactive logout (will prompt for confirmation):")
    logout_success = client.logout()
    
    if logout_success:
        print("\n🔍 Verifying logout...")
        
        # Step 4: Verify logout worked
        try:
            # Try to create a new client - should fail or require re-auth
            new_client = SwaraClient()
            if new_client.user:
                print("❌ Logout verification failed - user still authenticated")
            else:
                print("✅ Logout verified - no stored authentication found")
        except Exception as e:
            print(f"✅ Logout verified - authentication required: {e}")
        
        # Try API call - should fail
        try:
            transcriptions = client.get_viewable_transcriptions()
            print("❌ Logout verification failed - API still accessible")
        except Exception as e:
            print("✅ Logout verified - API access properly blocked")
    
    print("\n" + "=" * 50)
    print("💡 To log back in, run: python new_user_experience.py")

def demo_programmatic_logout():
    """Demonstrate programmatic logout without user prompts."""
    print("\n🤖 Demonstrating programmatic logout...")
    
    try:
        client = SwaraClient()
        if client.user:
            print(f"Currently logged in as: {client.user.get('name')}")
            
            # Logout without interactive prompt
            success = client.logout(confirm=True)
            if success:
                print("✅ Programmatic logout successful")
            else:
                print("❌ Programmatic logout failed")
        else:
            print("No user currently logged in")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    main()
    
    # Uncomment to test programmatic logout
    # demo_programmatic_logout()