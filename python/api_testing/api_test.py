from idtap_api.client import SwaraClient

s = SwaraClient()
transcriptions = s.get_viewable_transcriptions()
print(transcriptions)
print(len(transcriptions))

