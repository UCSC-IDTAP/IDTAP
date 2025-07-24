#!/usr/bin/env python3
"""Multi-format audio upload test script.

This script tests audio upload functionality across all supported formats:
WAV, MP3, M4A, FLAC, and OGG/Opus.
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add the parent directory to Python path to import idtap_api
sys.path.insert(0, str(Path(__file__).parent.parent))

from idtap_api import (
    SwaraClient,
    AudioMetadata, 
    Musician,
    AudioRaga,
    Location,
    RecordingDate,
    Permissions
)

# All supported audio formats
SUPPORTED_FORMATS = [
    ('babul_mora_excerpt.wav', 'WAV'),
    ('babul_mora_excerpt.mp3', 'MP3'),
    ('babul_mora_excerpt.m4a', 'M4A'),
    ('babul_mora_excerpt.flac', 'FLAC'),
    ('babul_mora_excerpt.opus', 'Opus')
]

def create_test_metadata(filename: str, format_name: str) -> AudioMetadata:
    """Create metadata for test uploads with 'test' in all fields."""
    return AudioMetadata(
        title=f"TEST FORMAT {format_name} - Babul Mora Excerpt",
        musicians=[
            Musician(
                name="TEST Artist - Begum Akhtar",
                role="Soloist",
                instrument="Vocal (Female)"
            )
        ],
        ragas=[
            AudioRaga(name="Bhairavi")  # Traditional raga for this piece
        ],
        location=Location(
            continent="Asia",
            country="India",
            city="Delhi"
        ),
        date=RecordingDate(
            year=2024,
            month="January",
            day=24  # Today's date
        ),
        permissions=Permissions(
            public_view=False,  # Keep test uploads private
            edit=[],
            view=[]
        )
    )

def test_single_format_upload(client: SwaraClient, audio_file: str, format_name: str) -> bool:
    """Test uploading a single audio format."""
    print(f"\n🎵 Testing {format_name} Format Upload")
    print("-" * 50)
    
    if not os.path.exists(audio_file):
        print(f"❌ Audio file not found: {audio_file}")
        return False
    
    try:
        # Create test metadata with format name in title
        metadata = create_test_metadata(Path(audio_file).name, format_name)
        
        # Validate metadata
        print("🔍 Validating metadata...")
        validation = client.validate_metadata(metadata)
        
        if validation.errors:
            print("❌ Validation errors:")
            for error in validation.errors:
                print(f"   - {error}")
            return False
        
        if validation.warnings:
            print("⚠️  Validation warnings:")
            for warning in validation.warnings:
                print(f"   - {warning}")
        
        print("✅ Metadata validation passed")
        
        # Get file info
        file_size = os.path.getsize(audio_file)
        print(f"📁 File: {Path(audio_file).name} ({file_size:,} bytes)")
        
        # Upload with progress tracking
        print(f"📤 Uploading {format_name} format...")
        
        def progress_callback(progress):
            bar_length = 30
            filled_length = int(bar_length * progress // 100)
            bar = '█' * filled_length + '-' * (bar_length - filled_length)
            print(f"\r   [{bar}] {progress:.1f}%", end="", flush=True)
        
        result = client.upload_audio(
            audio_file, 
            metadata,
            progress_callback=progress_callback
        )
        
        print()  # New line after progress
        print("✅ Upload successful!")
        print(f"   Audio ID: {result.audio_id}")
        print(f"   File: {result.file_info.name}")
        print(f"   Size: {result.file_info.size:,} bytes")
        print(f"   MIME Type: {result.file_info.mimetype}")
        print(f"   Processing Status:")
        print(f"     - Audio processed: {result.processing_status.audio_processed}")
        print(f"     - Melograph generated: {result.processing_status.melograph_generated}") 
        print(f"     - Spectrogram generated: {result.processing_status.spectrogram_generated}")
        
        return True
        
    except FileNotFoundError as e:
        print(f"❌ File error: {e}")
        return False
    except ValueError as e:
        print(f"❌ Validation error: {e}")
        return False
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

def test_all_formats():
    """Test uploading all supported audio formats."""
    print("🎵 IDTAP Multi-Format Audio Upload Test Suite")
    print("=" * 60)
    print("This test will upload the same audio in all supported formats")
    print("All uploads will be marked as TEST and set to private visibility")
    print("=" * 60)
    
    try:
        # Initialize client
        client = SwaraClient()
        
        # Check authentication
        auth_info = client.get_auth_info()
        if not auth_info['authenticated']:
            print("❌ Not authenticated. Please login first.")
            return False
        
        print(f"✅ Authenticated as: {auth_info.get('user_email', 'Unknown')}")
        
        # Test metadata endpoints first
        print("\n🔍 Testing Metadata Discovery")
        print("-" * 40)
        
        print("📋 Fetching available data...")
        musicians = client.get_available_musicians()
        ragas = client.get_available_ragas()
        instruments = client.get_available_instruments()
        locations = client.get_location_hierarchy()
        
        print(f"   Musicians: {len(musicians)}")
        print(f"   Ragas: {len(ragas)}")
        print(f"   Instruments: {len(instruments)}")
        print(f"   Continents: {len(locations.get_continents())}")
        print("✅ All metadata endpoints working")
        
        # Test each format
        results = []
        audio_dir = Path(__file__).parent / "audio"
        
        for filename, format_name in SUPPORTED_FORMATS:
            audio_file = audio_dir / filename
            success = test_single_format_upload(client, str(audio_file), format_name)
            results.append((format_name, success))
            
            if success:
                print(f"✅ {format_name} format upload successful")
            else:
                print(f"❌ {format_name} format upload failed")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 UPLOAD TEST SUMMARY")
        print("=" * 60)
        
        successful = 0
        failed = 0
        
        for format_name, success in results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"   {format_name:>6}: {status}")
            if success:
                successful += 1
            else:
                failed += 1
        
        print(f"\nResults: {successful} passed, {failed} failed")
        
        if failed == 0:
            print("🎉 All format tests passed!")
            print("\n📝 Next Steps:")
            print("   1. Check https://swara.studio for your test uploads")
            print("   2. Verify all formats uploaded correctly")
            print("   3. Clean up test recordings (they're marked with 'TEST')")
            print("   4. All test recordings are set to private visibility")
        else:
            print("⚠️  Some format tests failed. Check the output above.")
        
        return failed == 0
        
    except Exception as e:
        print(f"❌ Test suite error: {e}")
        return False

def test_specific_format():
    """Test a specific format from command line argument."""
    if len(sys.argv) < 2:
        print("Usage for specific format: python test_audio_upload.py <format>")
        print("Available formats: wav, mp3, m4a, flac, opus")
        return False
    
    format_arg = sys.argv[1].lower()
    format_map = {
        'wav': ('babul_mora_excerpt.wav', 'WAV'),
        'mp3': ('babul_mora_excerpt.mp3', 'MP3'),
        'm4a': ('babul_mora_excerpt.m4a', 'M4A'),
        'flac': ('babul_mora_excerpt.flac', 'FLAC'),
        'opus': ('babul_mora_excerpt.opus', 'Opus')
    }
    
    if format_arg not in format_map:
        print(f"❌ Unsupported format: {format_arg}")
        print("Available formats: wav, mp3, m4a, flac, opus")
        return False
    
    filename, format_name = format_map[format_arg]
    audio_dir = Path(__file__).parent / "audio"
    audio_file = audio_dir / filename
    
    print(f"🎵 IDTAP {format_name} Format Upload Test")
    print("=" * 50)
    
    try:
        client = SwaraClient()
        auth_info = client.get_auth_info()
        if not auth_info['authenticated']:
            print("❌ Not authenticated. Please login first.")
            return False
        
        print(f"✅ Authenticated as: {auth_info.get('user_email', 'Unknown')}")
        return test_single_format_upload(client, str(audio_file), format_name)
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def main():
    """Run the appropriate test based on command line arguments."""
    if len(sys.argv) > 1:
        # Test specific format
        success = test_specific_format()
    else:
        # Test all formats
        success = test_all_formats()
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)