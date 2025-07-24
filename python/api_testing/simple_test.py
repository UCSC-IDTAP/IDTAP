#!/usr/bin/env python3
"""Simple test to experience the waiver flow as a new user would."""

from idtap_api import SwaraClient

print("🎵 Testing IDTAP Python API")
print("Connecting to platform...")

client = SwaraClient()
print(f"✅ Connected as: {client.user.get('name', 'Unknown')}")

print("\nAttempting to browse transcriptions...")
transcriptions = client.get_viewable_transcriptions()

print(f"🎉 Success! Found {len(transcriptions)} transcriptions")
if transcriptions:
    print(f"First transcription: {transcriptions[0].get('title', 'Untitled')}")