#!/usr/bin/env python3
"""
How to handle the research waiver requirement when using IDTAP Python API.

Run this after getting the waiver error from new_user_experience.py
"""

from idtap_api import SwaraClient, Piece

def main():
    """Handle waiver agreement and then proceed with analysis."""
    print("🎵 IDTAP Python API - Handling Research Waiver")
    print("=" * 55)
    
    # Step 1: Connect to IDTAP platform
    print("Connecting to IDTAP platform...")
    client = SwaraClient()
    
    print(f"Connected as: {client.user.get('name', 'Unknown User')}")
    
    # Step 2: Check waiver status
    print(f"Waiver agreed: {client.has_agreed_to_waiver()}")
    
    if not client.has_agreed_to_waiver():
        print("\n📋 Research Waiver Required")
        print("=" * 30)
        
        # Step 3: Display waiver text
        waiver_text = client.get_waiver_text()
        print("You must agree to the following terms to use IDTAP:\n")
        print(waiver_text)
        
        # Step 4: Get user agreement
        print("\n" + "=" * 55)
        user_response = input("Do you agree to these terms? (yes/no): ").strip().lower()
        
        if user_response == 'yes':
            print("\nSubmitting waiver agreement...")
            try:
                client.agree_to_waiver(i_agree=True)
                print("✅ Waiver agreement successful!")
            except Exception as e:
                print(f"❌ Error submitting waiver: {e}")
                return
        else:
            print("👋 Waiver not agreed. Cannot access transcription data.")
            return
    
    # Step 5: Now proceed with normal workflow
    print("\n🎵 Proceeding with transcription analysis...")
    print("-" * 40)
    
    # Browse transcriptions
    print("Fetching available transcriptions...")
    transcriptions = client.get_viewable_transcriptions()
    print(f"Found {len(transcriptions)} transcriptions")
    
    # Show some examples
    if transcriptions:
        print("\nFirst few transcriptions:")
        for i, trans in enumerate(transcriptions[:3]):
            title = trans.get('title', 'Untitled')
            instrument = trans.get('instrumentation', 'Unknown')
            print(f"  {i+1}. {title} ({instrument})")
        
        # Load and analyze first transcription
        first_id = transcriptions[0]['_id']
        print(f"\nAnalyzing: {transcriptions[0].get('title', 'Untitled')}")
        
        piece_data = client.get_piece(first_id)
        piece = Piece.from_json(piece_data)
        
        print(f"  Duration: {piece.dur_tot:.1f}s")
        print(f"  Phrases: {len(piece.phrases)}")
        print(f"  Trajectories: {sum(len(p.trajectories) for p in piece.phrases)}")
        
        print("\n🎉 Success! You now have full access to IDTAP transcription data.")
    
    else:
        print("No transcriptions available.")

if __name__ == "__main__":
    main()