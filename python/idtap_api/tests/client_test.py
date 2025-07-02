import os
import sys
sys.path.insert(0, os.path.abspath('.'))

import responses
import pytest

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
