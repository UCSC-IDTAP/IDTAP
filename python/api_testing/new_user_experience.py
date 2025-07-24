#!/usr/bin/env python3
"""
Simple script demonstrating how a new researcher would use the IDTAP Python API.

This script simulates a typical workflow: authenticate, browse transcriptions, 
and download some data for analysis.
"""

from idtap_api import SwaraClient, Piece

def main():
    """Basic IDTAP usage example."""
    print("🎵 IDTAP Python API - Transcription Analysis")
    print("=" * 50)
    
    # Step 1: Connect to IDTAP platform
    print("Connecting to IDTAP platform...")
    client = SwaraClient()
    
    print(f"Connected as: {client.user.get('name', 'Unknown User')}")
    
    # Step 2: Browse available transcriptions
    print("\nFetching available transcriptions...")
    transcriptions = client.get_viewable_transcriptions()
    
    print(f"Found {len(transcriptions)} transcriptions available")
    
    # Step 3: Show first few transcriptions
    print("\nAvailable transcriptions:")
    for i, trans in enumerate(transcriptions[:5]):
        title = trans.get('title', 'Untitled')
        instrument = trans.get('instrumentation', 'Unknown')
        raga = trans.get('raga', {}).get('name', 'Unknown') if trans.get('raga') else 'Unknown'
        print(f"  {i+1}. {title} - {instrument} - Raga: {raga}")
    
    # Step 4: Load a transcription for analysis
    if transcriptions:
        first_trans = transcriptions[0]
        trans_id = first_trans['_id']
        title = first_trans.get('title', 'Untitled')
        
        print(f"\nLoading transcription: {title}")
        piece_data = client.get_piece(trans_id)
        piece = Piece.from_json(piece_data)
        
        # Step 5: Basic analysis
        print(f"\nTranscription Analysis:")
        print(f"  Title: {piece.title}")
        print(f"  Duration: {piece.dur_tot:.1f} seconds")
        print(f"  Number of phrases: {len(piece.phrases)}")
        
        total_trajectories = sum(len(phrase.trajectories) for phrase in piece.phrases)
        print(f"  Total trajectories: {total_trajectories}")
        
        if piece.raga:
            print(f"  Raga: {piece.raga.name}")
        
        print(f"  Instrumentation: {piece.instrumentation}")
        
        # Step 6: Export data
        print(f"\nExporting data for: {title}")
        excel_data = client.excel_data(trans_id)
        print(f"  Excel export: {len(excel_data)} bytes")
        
        print("\n✅ Analysis complete! Ready for research.")
    
    else:
        print("\nNo transcriptions available.")

if __name__ == "__main__":
    main()