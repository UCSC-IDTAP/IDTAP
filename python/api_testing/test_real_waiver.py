#!/usr/bin/env python3
"""Test the waiver flow with a real Google account that hasn't signed the waiver yet."""

from idtap_api import SwaraClient

def test_real_waiver_flow():
    """Test the complete waiver flow with a real account."""
    print("🧪 Testing REAL waiver flow with fresh Google account")
    print("=" * 60)
    
    print("Step 1: Initializing client (will trigger Google OAuth)...")
    print("🔐 Browser will open for Google login...")
    
    # This will trigger OAuth flow
    client = SwaraClient()
    
    print(f"✅ Authenticated as: {client.user.get('email') if client.user else 'Unknown'}")
    print(f"📊 User ID: {client.user_id}")
    print(f"📋 Waiver status: {client.has_agreed_to_waiver()}")
    
    print("\nStep 2: Attempting to access transcriptions (should fail)...")
    try:
        transcriptions = client.get_viewable_transcriptions()
        print("❌ UNEXPECTED: Access granted without waiver!")
        print(f"   Found {len(transcriptions)} transcriptions")
    except RuntimeError as e:
        print(f"✅ EXPECTED: Access properly blocked")
        print(f"   Error: {str(e)[:100]}...")
    
    print("\nStep 3: Reading the waiver text...")
    waiver_text = client.get_waiver_text()
    print("📋 Research Waiver:")
    print("-" * 40)
    print(waiver_text)
    print("-" * 40)
    
    print("\nStep 4: Testing agreement without i_agree=True (should fail)...")
    try:
        client.agree_to_waiver()
        print("❌ UNEXPECTED: Agreement succeeded without explicit consent!")
    except RuntimeError as e:
        print("✅ EXPECTED: Agreement properly blocked")
        print(f"   Error: {str(e)[:100]}...")
    
    print("\nStep 5: Now let's properly agree to the waiver...")
    user_input = input("Do you agree to the waiver terms above? (type 'yes' to continue): ")
    
    if user_input.lower() == 'yes':
        print("📝 Submitting waiver agreement to server...")
        try:
            result = client.agree_to_waiver(i_agree=True)
            print(f"✅ Waiver agreement successful!")
            print(f"   Server response: {result}")
            
            print("\nStep 6: Testing access after waiver agreement...")
            transcriptions = client.get_viewable_transcriptions()
            print(f"🎉 SUCCESS! Access granted - found {len(transcriptions)} transcriptions")
            
            # Show a few examples
            if transcriptions:
                print("\nFirst few transcriptions:")
                for i, trans in enumerate(transcriptions[:3]):
                    title = trans.get('title', 'Untitled')
                    instrumentation = trans.get('instrumentation', 'Unknown')
                    print(f"   {i+1}. {title} ({instrumentation})")
            
        except Exception as e:
            print(f"❌ Waiver agreement failed: {e}")
    else:
        print("👋 Waiver not agreed - stopping test")
    
    print(f"\nFinal waiver status: {client.has_agreed_to_waiver()}")
    print("🏁 Real waiver test completed!")

if __name__ == "__main__":
    test_real_waiver_flow()