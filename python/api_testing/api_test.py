from idtap_api.client import SwaraClient

s = SwaraClient()

# Get a specific transcription
transcription_id = '685c11ad80dc6827daaf017d'
print(f"Getting transcription {transcription_id}...")
transcription = s.get_piece(transcription_id)
print(f"Retrieved transcription: {transcription.get('title', 'No title')}")

# Save it back to the server (this will test the new API route with permissions)
print(f"Saving transcription back to server...")
result = s.save_piece(transcription)
print(f"Save result: {result}")

