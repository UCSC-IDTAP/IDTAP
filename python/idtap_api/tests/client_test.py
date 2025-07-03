import os
import sys
sys.path.insert(0, os.path.abspath('.'))

import responses
import pytest
import json

from python.idtap_api.client import SwaraClient

BASE = 'https://swara.studio/'

@responses.activate
def test_get_piece():
    client = SwaraClient()
    endpoint = BASE + 'getOneTranscription'
    responses.post(endpoint, json={'_id': '1'}, status=200)
    result = client.get_piece('1')
    assert result == {'_id': '1'}

@responses.activate
def test_piece_exists():
    client = SwaraClient()
    endpoint = BASE + 'pieceExists'
    responses.get(endpoint, json={'exists': True}, status=200)
    result = client.piece_exists('1')
    assert result == {'exists': True}

@responses.activate
def test_save_piece():
    client = SwaraClient()
    endpoint = BASE + 'updateTranscription'
    responses.post(endpoint, json={'ok': 1}, status=200)
    result = client.save_piece({'_id': '1'})
    assert result == {'ok': 1}


@responses.activate
def test_user_id_prefers_id(tmp_path):
    token_path = tmp_path / 'token.json'
    token_path.write_text(json.dumps({'token': 'abc', 'profile': {'_id': 'u1', 'sub': 's1'}}))
    client = SwaraClient(token_path=token_path, auto_login=False)
    assert client.user_id == 'u1'


@responses.activate
def test_user_id_fallback_sub(tmp_path):
    token_path = tmp_path / 'token.json'
    token_path.write_text(json.dumps({'token': 'abc', 'profile': {'sub': 's1'}}))
    client = SwaraClient(token_path=token_path, auto_login=False)
    assert client.user_id == 's1'

