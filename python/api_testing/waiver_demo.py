#!/usr/bin/env python3
"""Demo script showing the proper waiver agreement flow."""

from idtap_api import SwaraClient

def demo_waiver_flow():
    """Demonstrate the research waiver agreement process."""
    print("🎯 IDTAP Research Waiver Demo")
    print("=" * 40)
    
    # Create client (this would normally trigger OAuth)
    print("1. Initializing IDTAP client...")
    client = SwaraClient(auto_login=False)
    
    # Simulate a new user
    client.user = {"_id": "demo-user", "email": "researcher@university.edu"}
    client.token = "demo-token"
    
    print(f"   User authenticated: {client.user['email']}")
    print(f"   Waiver status: {client.has_agreed_to_waiver()}")
    
    print("\n2. Attempting to access transcriptions...")
    try:
        transcriptions = client.get_viewable_transcriptions()
    except RuntimeError as e:
        print(f"   ❌ Access denied: {str(e)[:80]}...")
    
    print("\n3. Reading the research waiver...")
    waiver_text = client.get_waiver_text()
    print(f"   📋 Waiver Text:")
    print(f"   {waiver_text}")
    
    print("\n4. Attempting to agree without confirmation...")
    try:
        client.agree_to_waiver()  # Missing i_agree=True
    except RuntimeError as e:
        print(f"   ❌ Agreement failed: {str(e)[:80]}...")
    
    print("\n5. Properly agreeing to the waiver...")
    print("   [User has read and understood the waiver terms]")
    
    # Simulate proper agreement (this would call the server)
    client.user["waiverAgreed"] = True
    print("   ✅ Waiver agreement recorded")
    
    print(f"\n6. Final status:")
    print(f"   Waiver agreed: {client.has_agreed_to_waiver()}")
    print(f"   Access granted: Ready to use IDTAP transcription data!")
    
    print("\n🎉 Demo completed! Users can now access transcriptions.")

if __name__ == "__main__":
    demo_waiver_flow()