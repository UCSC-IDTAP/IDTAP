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
    
    # Test waiver text display
    waiver_text = client.get_waiver_text()
    print(f"✅ Waiver text retrieved: {len(waiver_text)} characters")
    
    # Test error on protected endpoint
    try:
        client.get_viewable_transcriptions()
        print("❌ Expected RuntimeError for missing waiver")
    except RuntimeError as e:
        print(f"✅ Correctly blocked access: {str(e)[:80]}...")
    
    # Test that agree_to_waiver requires i_agree=True
    try:
        client.agree_to_waiver()  # Should fail without i_agree=True
        print("❌ Expected RuntimeError for missing i_agree")
    except RuntimeError as e:
        print(f"✅ Correctly requires explicit agreement: {str(e)[:80]}...")
    
    # Simulate waiver agreement
    client.user["waiverAgreed"] = True
    print(f"After waiver agreed: {client.has_agreed_to_waiver()}")  # Should be True
    
    print("✅ Waiver flow test completed")

if __name__ == "__main__":
    test_waiver_flow()