from idtap_api.client import SwaraClient

s = SwaraClient()

# Test getting a specific transcription with permission checking
transcription_id = '685c11ad80dc6827daaf017d'

try:
    print(f"Attempting to get transcription {transcription_id}...")
    transcription = s.get_piece(transcription_id)
    print(f"✅ Successfully retrieved transcription: {transcription.get('title', 'No title')}")
    print(f"   Owner: {transcription.get('userID', 'Unknown')}")
    print(f"   Public view: {transcription.get('explicitPermissions', {}).get('publicView', False)}")
except Exception as e:
    print(f"❌ Failed to retrieve transcription: {e}")

# Also test with a transcription the user should have access to
print("\n" + "="*50)
print("Testing with user's accessible transcriptions...")

transcriptions = s.get_viewable_transcriptions()
if transcriptions:
    # Get the first accessible transcription
    test_transcription = transcriptions[0]
    test_id = test_transcription['_id']
    
    try:
        print(f"Testing get_piece with accessible transcription {test_id}...")
        result = s.get_piece(test_id)
        print(f"✅ Successfully retrieved: {result.get('title', 'No title')}")
        
        # Verify we got the same data
        if result.get('_id') == test_id:
            print("✅ ID matches - permission checking working correctly")
        else:
            print("❌ ID mismatch - something went wrong")
            
    except Exception as e:
        print(f"❌ Failed to retrieve accessible transcription: {e}")
else:
    print("❌ No accessible transcriptions found")