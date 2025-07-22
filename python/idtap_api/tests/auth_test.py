import os
import sys
import json
from pathlib import Path

sys.path.insert(0, os.path.abspath('.'))

import responses
from python.idtap_api.client import SwaraClient

BASE = 'https://swara.studio/'

@responses.activate
def test_authorization_header(tmp_path):
    client = SwaraClient(auto_login=False)
    # Directly set token and user to bypass secure storage complexity
    client.token = 'abc'
    client.user = {'_id': 'u1'}
    
    endpoint = BASE + 'api/transcription/1'
    responses.get(endpoint, json={'_id': '1'}, status=200)
    client.get_piece('1')
    assert responses.calls[0].request.headers['Authorization'] == 'Bearer abc'

@responses.activate
def test_no_token_header(tmp_path):
    client = SwaraClient(token_path=tmp_path / 'missing.json', auto_login=False)
    endpoint = BASE + 'api/transcription/1'
    responses.get(endpoint, json={'_id': '1'}, status=200)
    client.get_piece('1')
    assert 'Authorization' not in responses.calls[0].request.headers



