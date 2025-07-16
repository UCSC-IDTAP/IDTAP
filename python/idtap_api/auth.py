import json
import os
import secrets
import webbrowser
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import parse_qs, urlencode, urlparse
import wsgiref.simple_server
import wsgiref.util

import requests

DEFAULT_TOKEN_PATH = Path(os.environ.get("SWARA_TOKEN_PATH", "~/.swara/token.json")).expanduser()


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


def _run_local_server(host: str = "localhost", port: int = 8080) -> str:
    """Run a local server to capture the OAuth redirect and return the full redirect URI."""
    wsgi_app = _RedirectWSGIApp()
    wsgiref.simple_server.WSGIServer.allow_reuse_address = True
    local_server = wsgiref.simple_server.make_server(host, port, wsgi_app, handler_class=_WSGIRequestHandler)
    
    try:
        local_server.handle_request()
        return wsgi_app.last_request_uri or ""
    finally:
        local_server.server_close()


def login_google(
    base_url: str = "https://swara.studio/",
    token_path: Path = DEFAULT_TOKEN_PATH,
    host: str = "localhost",
    port: int = 8080,
) -> Dict[str, Any]:
    """Authenticate with Google via the Swara server and store token/profile information.
    
    This function implements a server-based OAuth flow where the Python client
    redirects to the Swara server's OAuth endpoints instead of directly to Google.
    This is more secure as OAuth credentials are only stored on the server.

    Args:
        base_url: Swara Studio API base URL.
        token_path: Location to store the resulting token information.
        host: Local host for OAuth redirect.
        port: Local port for OAuth redirect.

    Returns:
        The user document returned by the Swara API, including the ``_id``
        field assigned by the server.
    """
    # Generate state parameter for security
    state = secrets.token_urlsafe(32)
    redirect_uri = f"http://{host}:{port}/"
    
    # Step 1: Get authorization URL from Swara server
    auth_params = {
        'redirect_uri': redirect_uri,
        'state': state
    }
    
    try:
        auth_response = requests.get(
            f"{base_url.rstrip('/')}/oauth/authorize",
            params=auth_params,
            timeout=30
        )
        auth_response.raise_for_status()
        auth_data = auth_response.json()
        auth_url = auth_data['auth_url']
    except Exception as e:
        raise RuntimeError(f"Failed to get authorization URL from server: {e}")
    
    # Step 2: Open browser for user authentication
    print(f"Opening browser for authentication: {auth_url}")
    webbrowser.open(auth_url, new=1, autoraise=True)
    
    # Step 3: Run local server to capture redirect
    redirect_uri_with_code = _run_local_server(host, port)
    
    # Step 4: Extract authorization code from redirect
    query = urlparse(redirect_uri_with_code).query
    params = parse_qs(query)
    
    if "code" not in params:
        error = params.get("error", ["Unknown error"])[0]
        raise RuntimeError(f"OAuth flow failed: {error}")
    
    auth_code = params["code"][0]
    returned_state = params.get("state", [None])[0]
    
    # Verify state parameter
    if returned_state != state:
        raise RuntimeError("State parameter mismatch - possible CSRF attack")
    
    # Step 5: Exchange authorization code for tokens via Swara server
    token_data = {
        'code': auth_code,
        'redirect_uri': redirect_uri
    }
    
    try:
        token_response = requests.post(
            f"{base_url.rstrip('/')}/oauth/token",
            json=token_data,
            timeout=30
        )
        token_response.raise_for_status()
        result = token_response.json()
    except Exception as e:
        raise RuntimeError(f"Failed to exchange code for tokens: {e}")
    
    # Step 6: Store tokens and profile locally
    token_path = Path(token_path).expanduser()
    token_path.parent.mkdir(parents=True, exist_ok=True)
    
    storage_data = {
        "access_token": result.get("access_token"),
        "id_token": result.get("id_token"),
        "refresh_token": result.get("refresh_token"),
        "profile": result.get("profile")
    }
    
    with token_path.open("w", encoding="utf-8") as f:
        json.dump(storage_data, f, indent=2)
    
    print(f"Authentication successful! Token saved to {token_path}")
    return result.get("profile", {})


def load_token(token_path: Path = DEFAULT_TOKEN_PATH) -> Optional[Dict[str, Any]]:
    """Load stored authentication token and profile.
    
    Args:
        token_path: Path to the stored token file.
        
    Returns:
        Dictionary containing token and profile information, or None if not found.
    """
    token_path = Path(token_path).expanduser()
    if not token_path.exists():
        return None
    
    try:
        with token_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def clear_token(token_path: Path = DEFAULT_TOKEN_PATH) -> None:
    """Clear stored authentication token.
    
    Args:
        token_path: Path to the stored token file.
    """
    token_path = Path(token_path).expanduser()
    if token_path.exists():
        token_path.unlink()