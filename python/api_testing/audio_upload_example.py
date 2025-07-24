#!/usr/bin/env python3
"""Example usage of the IDTAP audio upload functionality.

This script demonstrates how to:
1. Connect to the IDTAP API
2. Create comprehensive audio metadata
3. Upload audio files with full metadata support
4. Handle validation and errors
5. Associate uploads with audio events
"""

import os
from pathlib import Path
from idtap_api import (
    SwaraClient, 
    AudioMetadata, 
    Musician, 
    Location, 
    RecordingDate, 
    AudioRaga,
    PerformanceSection,
    Permissions,
    AudioEventConfig
)

def basic_audio_upload_example():
    """Basic audio upload with minimal metadata."""
    print("=== Basic Audio Upload Example ===")
    
    # Initialize client
    client = SwaraClient()
    
    # Create minimal metadata
    metadata = AudioMetadata(
        title="Raga Yaman - Alap",
        musicians=[
            Musician(
                name="Ravi Shankar",
                role="Soloist", 
                instrument="Sitar"
            )
        ],
        ragas=[
            AudioRaga(name="Yaman")
        ]
    )
    
    # Upload file (replace with actual audio file path)
    audio_file = "path/to/your/audio.mp3"
    if os.path.exists(audio_file):
        try:
            result = client.upload_audio(audio_file, metadata)
            print(f"✅ Upload successful!")
            print(f"   Audio ID: {result.audio_id}")
            print(f"   File: {result.file_info.name} ({result.file_info.size} bytes)")
            print(f"   Processing: {result.processing_status}")
        except Exception as e:
            print(f"❌ Upload failed: {e}")
    else:
        print(f"⚠️  Audio file not found: {audio_file}")

def comprehensive_audio_upload_example():
    """Comprehensive audio upload with full metadata."""
    print("\n=== Comprehensive Audio Upload Example ===")
    
    client = SwaraClient()
    
    # Create comprehensive metadata
    metadata = AudioMetadata(
        title="Raga Bhairav - Morning Performance",
        musicians=[
            Musician(
                name="Ustad Ali Akbar Khan",
                role="Soloist",
                instrument="Sarod",
                gharana="Maihar"
            ),
            Musician(
                name="Zakir Hussain", 
                role="Percussionist",
                instrument="Tabla"
            ),
            Musician(
                name="Pandit Swapan Chaudhuri",
                role="Accompanist", 
                instrument="Tanpura"
            )
        ],
        location=Location(
            continent="Asia",
            country="India", 
            city="Mumbai"
        ),
        date=RecordingDate(
            year=1995,
            month="March",
            day=15
        ),
        ragas=[
            AudioRaga(
                name="Bhairav",
                performance_sections=[
                    PerformanceSection(name="Alap", start=0.0, end=300.0),
                    PerformanceSection(name="Jor", start=300.0, end=600.0),
                    PerformanceSection(name="Jhala", start=600.0, end=900.0),
                    PerformanceSection(name="Gat", start=900.0, end=1200.0)
                ]
            )
        ],
        sa_estimate=220.0,  # A4 = 220 Hz
        permissions=Permissions(
            public_view=True,
            edit=["user123", "user456"],
            view=["collaborator789"]
        )
    )
    
    audio_file = "path/to/comprehensive_audio.wav"
    if os.path.exists(audio_file):
        try:
            # Validate metadata first
            validation = client.validate_metadata(metadata)
            if not validation.is_valid:
                print("❌ Metadata validation failed:")
                for error in validation.errors:
                    print(f"   - {error}")
                return
            
            if validation.warnings:
                print("⚠️  Metadata warnings:")
                for warning in validation.warnings:
                    print(f"   - {warning}")
            
            # Upload with progress tracking
            def progress_callback(progress):
                print(f"\r📤 Uploading... {progress:.1f}%", end="", flush=True)
            
            result = client.upload_audio(audio_file, metadata, progress_callback=progress_callback)
            print(f"\n✅ Comprehensive upload successful!")
            print(f"   Audio ID: {result.audio_id}")
            print(f"   File: {result.file_info.name}")
            print(f"   MIME Type: {result.file_info.mimetype}")
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
    else:
        print(f"⚠️  Audio file not found: {audio_file}")

def audio_event_upload_example():
    """Upload audio and associate with an audio event."""
    print("\n=== Audio Event Upload Example ===")
    
    client = SwaraClient()
    
    # Create metadata
    metadata = AudioMetadata(
        title="Concert Recording - Song 1",
        musicians=[
            Musician(name="Pandit Jasraj", role="Soloist", instrument="Vocal (Male)")
        ],
        ragas=[AudioRaga(name="Malkauns")]
    )
    
    # Create new audio event
    audio_event = AudioEventConfig(
        mode="create",
        name="Mumbai Concert Series 2024",
        event_type="Concert"
    )
    
    audio_file = "path/to/concert_recording.mp3"
    if os.path.exists(audio_file):
        try:
            result = client.upload_audio(
                audio_file, 
                metadata, 
                audio_event=audio_event
            )
            print(f"✅ Audio event upload successful!")
            print(f"   Audio ID: {result.audio_id}")
            print(f"   Associated with new audio event")
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
    else:
        print(f"⚠️  Audio file not found: {audio_file}")

def metadata_discovery_example():
    """Discover available metadata options from the platform."""
    print("\n=== Metadata Discovery Example ===")
    
    client = SwaraClient()
    
    try:
        print("🎼 Available Musicians:")
        musicians = client.get_available_musicians()
        for musician in musicians[:5]:  # Show first 5
            name = musician.get('Full Name', 'Unknown')
            instrument = musician.get('Instrument', 'Unknown')
            print(f"   - {name} ({instrument})")
        print(f"   ... and {len(musicians) - 5} more")
        
        print("\n🎵 Available Ragas:")
        ragas = client.get_available_ragas()
        for raga in ragas[:10]:  # Show first 10
            print(f"   - {raga}")
        print(f"   ... and {len(ragas) - 10} more")
        
        print("\n🎻 Available Instruments:")
        instruments = client.get_available_instruments()
        for instrument in instruments[:8]:  # Show first 8
            print(f"   - {instrument}")
        
        print("\n🌍 Location Hierarchy:")
        locations = client.get_location_hierarchy()
        continents = locations.get_continents()
        for continent in continents[:3]:  # Show first 3
            countries = locations.get_countries(continent)
            print(f"   {continent}:")
            for country in countries[:3]:  # Show first 3 countries
                print(f"     - {country}")
        
    except Exception as e:
        print(f"❌ Error fetching metadata: {e}")

def error_handling_example():
    """Demonstrate error handling and validation."""
    print("\n=== Error Handling Example ===")
    
    client = SwaraClient()
    
    # Example with invalid file
    print("Testing with non-existent file:")
    try:
        metadata = AudioMetadata(title="Test")
        client.upload_audio("nonexistent.mp3", metadata)
    except FileNotFoundError as e:
        print(f"✅ Correctly caught FileNotFoundError: {e}")
    
    # Example with unsupported format
    print("\nTesting with unsupported format:")
    try:
        # Create a temporary file with unsupported extension
        temp_file = Path("temp_test.xyz")
        temp_file.write_text("fake audio data")
        
        metadata = AudioMetadata(title="Test")
        client.upload_audio(str(temp_file), metadata)
        
    except ValueError as e:
        print(f"✅ Correctly caught ValueError: {e}")
    finally:
        if temp_file.exists():
            temp_file.unlink()
    
    # Example with invalid metadata
    print("\nTesting metadata validation:")
    try:
        metadata = AudioMetadata(
            musicians=[
                Musician(name="", role="Soloist", instrument="Sitar")  # Empty name
            ]
        )
        validation = client.validate_metadata(metadata)
        if not validation.is_valid:
            print("✅ Validation correctly failed:")
            for error in validation.errors:
                print(f"   - {error}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def main():
    """Run all examples."""
    print("🎵 IDTAP Audio Upload Examples")
    print("=" * 50)
    
    try:
        # Check if client can authenticate
        client = SwaraClient()
        user_info = client.get_auth_info()
        if not user_info['authenticated']:
            print("❌ Not authenticated. Please run the login process first.")
            return
        
        print(f"✅ Authenticated as: {user_info.get('user_email', 'Unknown')}")
        
        # Run examples
        basic_audio_upload_example()
        comprehensive_audio_upload_example() 
        audio_event_upload_example()
        metadata_discovery_example()
        error_handling_example()
        
        print("\n" + "=" * 50)
        print("✅ All examples completed!")
        print("\n📚 Next Steps:")
        print("   1. Replace 'path/to/your/audio.mp3' with actual audio files")
        print("   2. Customize metadata to match your recordings")
        print("   3. Explore the validation and helper methods")
        print("   4. Check the uploaded files in the IDTAP web interface")
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")
        print("   Make sure you're authenticated and have network access.")

if __name__ == "__main__":
    main()