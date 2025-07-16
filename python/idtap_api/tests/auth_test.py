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
    token_path = tmp_path / 'token.json'
    token_path.write_text(json.dumps({'token': 'abc', 'profile': {'_id': 'u1'}}))
    client = SwaraClient(token_path=token_path, auto_login=False)
    endpoint = BASE + 'pieceExists'
    responses.get(endpoint, json={'ok': 1}, status=200)
    client.piece_exists('1')
    assert responses.calls[0].request.headers['Authorization'] == 'Bearer abc'

@responses.activate
def test_no_token_header(tmp_path):
    client = SwaraClient(token_path=tmp_path / 'missing.json', auto_login=False)
    endpoint = BASE + 'pieceExists'
    responses.get(endpoint, json={'ok': 1}, status=200)
    client.piece_exists('1')
    assert 'Authorization' not in responses.calls[0].request.headers


@responses.activate
def test_auto_login(monkeypatch, tmp_path):
    calls = []

    def fake_login_google(client_secrets=None, base_url="https://swara.studio/", token_path=None, scopes=None):
        calls.append(client_secrets)
        Path(token_path).write_text(json.dumps({"token": "zzz", "profile": {"_id": "u9"}}))
        return {"_id": "u9"}

    monkeypatch.setattr('python.idtap_api.client.login_google', fake_login_google)
    token_path = tmp_path / 'token.json'
    client = SwaraClient(token_path=token_path)
    assert calls
    assert client.token == 'zzz'


@responses.activate
def test_login_google_registers(monkeypatch, tmp_path):
    class FakeFlow:
        credentials = object()

        def fetch_token(self, code=None):
            pass

    monkeypatch.setattr(
        'python.idtap_api.auth.InstalledAppFlow.from_client_config',
        lambda config, scopes=None: FakeFlow(),
    )
    monkeypatch.setattr(
        'python.idtap_api.auth._run_flow_get_code',
        lambda flow, host='localhost', port=8080: 'code',
    )

    class FakeSession:
        def __init__(self, creds):
            pass

        def get(self, url):
            class Resp:
                def json(self):
                    return {'sub': 's1', 'name': 'Alice'}

            return Resp()

    monkeypatch.setattr('python.idtap_api.auth.AuthorizedSession', FakeSession)

    responses.post(BASE + 'userLoginGoogle', json={'value': {'_id': 'u1', 'sub': 's1'}}, status=200)

    from python.idtap_api import auth as auth_mod

    profile = auth_mod.login_google(client_secrets={}, base_url=BASE, token_path=tmp_path / 'token.json')

    assert profile['_id'] == 'u1'
    saved = json.loads((tmp_path / 'token.json').read_text())
    assert saved['profile']['_id'] == 'u1'

