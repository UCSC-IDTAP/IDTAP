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
    client = SwaraClient(auto_login=False)
    endpoint = BASE + 'api/transcription/1'
    responses.get(endpoint, json={'_id': '1'}, status=200)
    result = client.get_piece('1')
    assert result == {'_id': '1'}


@responses.activate
def test_save_piece():
    client = SwaraClient(auto_login=False)
    endpoint = BASE + 'api/transcription'
    responses.post(endpoint, json={'ok': 1}, status=200)
    result = client.save_piece({'_id': '1'})
    assert result == {'ok': 1}


@responses.activate
def test_user_id_prefers_id(tmp_path):
    client = SwaraClient(auto_login=False)
    client.token = 'abc'
    client.user = {'_id': 'u1', 'sub': 's1'}
    assert client.user_id == 'u1'


@responses.activate
def test_user_id_fallback_sub(tmp_path):
    client = SwaraClient(auto_login=False)
    client.token = 'abc'
    client.user = {'sub': 's1'}
    assert client.user_id == 's1'

