import os
import sys
import json
from pathlib import Path

sys.path.insert(0, os.path.abspath('.'))

import responses
from python.api.client import SwaraClient

BASE = 'https://swara.studio/'

@responses.activate
def test_authorization_header(tmp_path):
    token_path = tmp_path / 'token.json'
    token_path.write_text(json.dumps({'token': 'abc', 'profile': {'_id': 'u1'}}))
    client = SwaraClient(token_path=token_path)
    endpoint = BASE + 'pieceExists'
    responses.get(endpoint, json={'ok': 1}, status=200)
    client.piece_exists('1')
    assert responses.calls[0].request.headers['Authorization'] == 'Bearer abc'

@responses.activate
def test_no_token_header(tmp_path):
    client = SwaraClient(token_path=tmp_path / 'missing.json')
    endpoint = BASE + 'pieceExists'
    responses.get(endpoint, json={'ok': 1}, status=200)
    client.piece_exists('1')
    assert 'Authorization' not in responses.calls[0].request.headers
