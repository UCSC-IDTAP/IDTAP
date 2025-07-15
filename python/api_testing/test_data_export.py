from idtap_api.client import SwaraClient

s = SwaraClient()

# Find a transcription that the user can access
transcriptions = s.get_viewable_transcriptions()
if not transcriptions:
    print("❌ No accessible transcriptions found")
    exit(1)

# Use the first accessible transcription for testing
test_transcription = transcriptions[0]
test_id = test_transcription['_id']
print(f"Testing data export with transcription: {test_id} - {test_transcription.get('title', 'No title')}")

# Test JSON data export
print("\n" + "="*50)
print("Testing JSON data export...")
try:
    json_data = s.json_data(test_id)
    print(f"✅ JSON export successful - received {len(json_data)} bytes")
    print(f"   Data type: {type(json_data)}")
    # Check if it looks like a file download
    if hasattr(json_data, '__len__') and len(json_data) > 0:
        print("   Content appears to be valid file data")
    else:
        print("   ⚠️  Content appears empty or invalid")
except Exception as e:
    print(f"❌ JSON export failed: {e}")

# Test Excel data export
print("\n" + "="*50)
print("Testing Excel data export...")
try:
    excel_data = s.excel_data(test_id)
    print(f"✅ Excel export successful - received {len(excel_data)} bytes")
    print(f"   Data type: {type(excel_data)}")
    # Check if it looks like a file download
    if hasattr(excel_data, '__len__') and len(excel_data) > 0:
        print("   Content appears to be valid file data")
    else:
        print("   ⚠️  Content appears empty or invalid")
except Exception as e:
    print(f"❌ Excel export failed: {e}")

# Test with a transcription the user should NOT have access to (if available)
print("\n" + "="*50)
print("Testing permission checking with potentially inaccessible transcription...")
restricted_id = '685c11ad80dc6827daaf017d'  # This one was previously failing permission checks

try:
    json_data = s.json_data(restricted_id)
    print(f"⚠️  Unexpectedly got access to restricted transcription JSON ({len(json_data)} bytes)")
except Exception as e:
    print(f"✅ Permission check working - JSON access properly denied: {e}")

try:
    excel_data = s.excel_data(restricted_id)
    print(f"⚠️  Unexpectedly got access to restricted transcription Excel ({len(excel_data)} bytes)")
except Exception as e:
    print(f"✅ Permission check working - Excel access properly denied: {e}")