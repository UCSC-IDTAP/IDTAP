#!/usr/bin/env python3
"""Quick test script to verify waiver handling works correctly."""

from idtap_api import SwaraClient

def test_waiver_flow():
    """Test the waiver agreement flow."""
    print("🧪 Testing waiver flow...")
    
    # Create client without auto-login to test manually
    client = SwaraClient(auto_login=False)
    
    # Mock a user without waiver agreed
    client.user = {"_id": "test-user", "email": "test@example.com"}
    client.token = "mock-token"
    
    # Test waiver check
    print(f"Waiver agreed: {client.has_agreed_to_waiver()}")  # Should be False
    
    # Test error on protected endpoint
    try:
        client.get_viewable_transcriptions()
        print("❌ Expected RuntimeError for missing waiver")
    except RuntimeError as e:
        print(f"✅ Correctly blocked access: {str(e)[:50]}...")
    
    # Simulate waiver agreement
    client.user["waiverAgreed"] = True
    print(f"After waiver agreed: {client.has_agreed_to_waiver()}")  # Should be True
    
    print("✅ Waiver flow test completed")

if __name__ == "__main__":
    test_waiver_flow()