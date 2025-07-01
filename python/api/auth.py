import json
import os
import webbrowser
from pathlib import Path
from typing import Any, Dict, Optional, Union
from urllib.parse import parse_qs, urlparse

import requests
from google_auth_oauthlib.flow import InstalledAppFlow

DEFAULT_TOKEN_PATH = Path(os.environ.get("SWARA_TOKEN_PATH", "~/.swara/token.json")).expanduser()

# Default OAuth client configured on the Swara server. Using these credentials
# means users can simply call :func:`login_google` without supplying their own
# client secrets.
DEFAULT_CLIENT_SECRETS: Dict[str, Any] = {
    "installed": {
        "client_id": "324767655055-crhq76mdupavvrcedtde986glivug1nm.apps.googleusercontent.com",
        "client_secret": "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",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}


def _run_flow_get_code(flow: InstalledAppFlow, host: str = "localhost", port: int = 8080) -> str:
    """Run OAuth flow locally and return the authorization ``code``."""
    import wsgiref.simple_server
    import wsgiref.util

    class _RedirectWSGIApp:
        def __init__(self) -> None:
            self.last_request_uri: Optional[str] = None

        def __call__(self, environ: Dict[str, Any], start_response):
            start_response("200 OK", [("Content-type", "text/plain; charset=utf-8")])
            self.last_request_uri = wsgiref.util.request_uri(environ)
            return [b"Authentication complete. You may close this window."]

    class _WSGIRequestHandler(wsgiref.simple_server.WSGIRequestHandler):
        def log_message(self, fmt: str, *args: Any) -> None:
            pass

    wsgi_app = _RedirectWSGIApp()
    wsgiref.simple_server.WSGIServer.allow_reuse_address = False
    local_server = wsgiref.simple_server.make_server(host, port, wsgi_app, handler_class=_WSGIRequestHandler)

    try:
        flow.redirect_uri = f"http://{host}:{local_server.server_port}/"
        auth_url, _ = flow.authorization_url()
        webbrowser.open(auth_url, new=1, autoraise=True)
        local_server.handle_request()
        redirect_uri = wsgi_app.last_request_uri or ""
    finally:
        local_server.server_close()

    query = urlparse(redirect_uri).query
    params = parse_qs(query)
    if "code" not in params:
        raise RuntimeError("No code returned from Google OAuth flow")
    return params["code"][0]


def login_google(
    client_secrets: Optional[Union[str, Dict[str, Any]]] = None,
    base_url: str = "https://swara.studio/",
    token_path: Path = DEFAULT_TOKEN_PATH,
    scopes: Optional[list[str]] = None,
) -> Dict[str, Any]:
    """Authenticate with Google and store token/profile information.

    Args:
        client_secrets: Path to the client secrets JSON file or the loaded JSON
            object. If ``None``, a default client configured on the Swara
            server will be used.
        base_url: Swara Studio API base URL.
        token_path: Location to store the resulting token information.
        scopes: OAuth scopes to request.

    Returns:
        The profile information returned by the Swara API.
    """
    scopes = scopes or ["openid", "email", "profile"]
    config: Dict[str, Any]
    if client_secrets is None:
        config = DEFAULT_CLIENT_SECRETS
    elif isinstance(client_secrets, str):
        flow = InstalledAppFlow.from_client_secrets_file(client_secrets, scopes=scopes)
        config = None  # type: ignore[assignment]
    else:
        config = client_secrets

    if config is not None:
        flow = InstalledAppFlow.from_client_config(config, scopes=scopes)

    auth_code = _run_flow_get_code(flow)

    payload = {"authCode": auth_code, "redirectURL": flow.redirect_uri}
    resp = requests.post(base_url.rstrip("/") + "/handleGoogleAuthCode", json=payload)
    resp.raise_for_status()
    profile = resp.json()

    token_path = Path(token_path).expanduser()
    token_path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "token": getattr(flow.credentials, "token", None),
        "refresh_token": getattr(flow.credentials, "refresh_token", None),
        "profile": profile,
    }
    with token_path.open("w", encoding="utf-8") as f:
        json.dump(data, f)

    return profile
