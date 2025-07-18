#!/usr/bin/env python3
"""
test_audio_download.py

Test downloading audio recordings associated with transcriptions.
"""

from idtap_api.client import SwaraClient
from idtap_api.classes.piece import Piece
import os


def main():
    # Initialize client (will prompt for login if needed)
    client = SwaraClient()

    # Download existing transcription
    transcription_id = "645ff354deeaf2d1e33b3c44" # babul mora
    print(f"Downloading transcription {transcription_id}...")
    
    try:
        transcription_data = client.get_piece(transcription_id)
        print(f"✅ Downloaded transcription: {transcription_data.get('title', 'untitled')}")
    except Exception as e:
        print(f"❌ Failed to download transcription: {e}")
        return

    # Convert to Piece object
    piece = Piece.from_json(transcription_data)
    
    # Check if transcription has associated audio
    if not piece.audioID:
        print("❌ No audio recording associated with this transcription")
        return
    
    print(f"Audio ID found: {piece.audioID}")

    # Test downloading in different formats
    formats = ["wav", "mp3", "opus"]
    
    for format in formats:
        print(f"\nDownloading audio in {format.upper()} format...")
        try:
            # Download audio data
            audio_data = client.download_transcription_audio(piece, format=format)
            
            if audio_data:
                filename = f"{piece.title}_{transcription_id}.{format}"
                # Clean filename for filesystem
                filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_', '.')).rstrip()
                
                # Save to file
                client.save_audio_file(audio_data, filename)
                file_size = len(audio_data) / 1024 / 1024  # Size in MB
                print(f"✅ Saved {filename} ({file_size:.2f} MB)")
            else:
                print(f"❌ No audio data received for {format}")
                
        except Exception as e:
            print(f"❌ Failed to download {format}: {e}")

    # Alternative: Download by audio ID directly
    print(f"\nAlternative: Direct download by audio ID...")
    try:
        audio_data = client.download_audio(piece.audioID, format="wav")
        filename = f"direct_download_{piece.audioID}.wav"
        client.save_audio_file(audio_data, filename)
        print(f"✅ Direct download saved as {filename}")
    except Exception as e:
        print(f"❌ Direct download failed: {e}")


if __name__ == '__main__':
    main()
