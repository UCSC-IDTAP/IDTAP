import json
import os
import webbrowser
from pathlib import Path
from typing import Any, Dict, Optional, Union
from urllib.parse import parse_qs, urlparse

import requests
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import AuthorizedSession

DEFAULT_TOKEN_PATH = Path(os.environ.get("SWARA_TOKEN_PATH", "~/.swara/token.json")).expanduser()

# Default OAuth client configured on the Swara server. Using these credentials
# means users can simply call :func:`login_google` without supplying their own
# client secrets.
def get_default_client_secrets() -> Dict[str, Any]:
    """Get OAuth client secrets from environment variables or fallback to defaults."""
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "324767655055-crhq76mdupavvrcedtde986glivug1nm.apps.googleusercontent.com")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "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")
    
    return {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

DEFAULT_CLIENT_SECRETS: Dict[str, Any] = get_default_client_secrets()


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
    wsgiref.simple_server.WSGIServer.allow_reuse_address = True
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
        The user document returned by the Swara API, including the ``_id``
        field assigned by the server.
    """
    # Request scopes as full URIs to match Google's returned scope format
    scopes = scopes or [
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
    ]
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
    # Exchange the authorization code for credentials
    flow.fetch_token(code=auth_code)

    # Fetch profile directly from Google
    authed_session = AuthorizedSession(flow.credentials)
    profile = authed_session.get("https://www.googleapis.com/oauth2/v3/userinfo").json()

    # Register or login with the Swara server to obtain the user document
    try:
        resp = requests.post(base_url.rstrip("/") + "/userLoginGoogle", json=profile)
        resp.raise_for_status()
        result = resp.json()
        server_profile = result.get("value") or result
    except Exception:
        # Fallback to the Google profile if the server call fails
        server_profile = profile

    token_path = Path(token_path).expanduser()
    token_path.parent.mkdir(parents=True, exist_ok=True)
    # Safely attempt to retrieve token credentials
    try:
        creds = flow.credentials
        token = getattr(creds, "id_token", None)  # Use ID token for server verification
        refresh_token = getattr(creds, "refresh_token", None)
    except Exception:
        token = None
        refresh_token = None
    data = {
        "token": token,
        "refresh_token": refresh_token,
        "profile": server_profile,
    }

    with token_path.open("w", encoding="utf-8") as f:
        json.dump(data, f)

    return server_profile
