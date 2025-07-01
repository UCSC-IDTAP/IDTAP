"""HTTP client for the Swara Studio API."""

from __future__ import annotations

from typing import Any, Dict, Optional, Union

import json
from pathlib import Path

import requests
import os

from .auth import login_google


class SwaraClient:
    """Minimal client wrapping the public API served at https://swara.studio."""

    def __init__(
        self,
        base_url: str = "https://swara.studio/",
        token_path: str | Path | None = None,
        client_secrets: Optional[Union[str, Dict[str, Any]]] = None,
        auto_login: bool = True,
    ) -> None:
        self.base_url = base_url.rstrip("/") + "/"
        self.token_path = Path(token_path or os.environ.get("SWARA_TOKEN_PATH", "~/.swara/token.json")).expanduser()
        self.client_secrets = client_secrets or os.environ.get("SWARA_CLIENT_SECRETS")
        self.auto_login = auto_login
        self.token: Optional[str] = None
        self.user: Optional[Dict[str, Any]] = None
        self.load_token()
        if self.token is None and self.auto_login:
            try:
                login_google(self.client_secrets, base_url=self.base_url, token_path=self.token_path)
                self.load_token()
            except Exception:
                pass

    # ---- auth utilities ----
    def load_token(self, token_path: Optional[str | Path] = None) -> None:
        """Load saved token and profile information if available."""
        path = Path(token_path or self.token_path)
        if not path.exists():
            return
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return
        self.token = data.get("token")
        self.user = data.get("profile") or data.get("user")

    def _auth_headers(self) -> Dict[str, str]:
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    def _post_json(self, endpoint: str, payload: Dict[str, Any]) -> Any:
        url = self.base_url + endpoint
        headers = self._auth_headers()
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        if response.content:
            return response.json()
        return None

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = self.base_url + endpoint
        headers = self._auth_headers()
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        ctype = response.headers.get("Content-Type", "")
        if ctype.startswith("application/json"):
            return response.json()
        return response.content

    # ---- API methods ----
    def get_piece(self, piece_id: str) -> Any:
        """Return transcription JSON for the given id."""
        return self._post_json("getOneTranscription", {"_id": piece_id})

    def piece_exists(self, piece_id: str) -> Any:
        return self._get("pieceExists", params={"_id": piece_id})

    def excel_data(self, piece_id: str) -> bytes:
        return self._get("excelData", params={"_id": piece_id})

    def json_data(self, piece_id: str) -> bytes:
        return self._get("jsonData", params={"_id": piece_id})

    def get_audio_db_entry(self, _id: str) -> Any:
        return self._post_json("getAudioDBEntry", {"_id": _id})

    def save_piece(self, piece: Dict[str, Any]) -> Any:
        return self._post_json("updateTranscription", piece)

    def get_all_pieces(
        self,
        user_id: str,
        sort_key: str = "title",
        sort_dir: str | int = 1,
        new_permissions: Optional[bool] = None,
    ) -> Any:
        params = {
            "userID": user_id,
            "sortKey": sort_key,
            "sortDir": sort_dir,
            "newPermissions": new_permissions,
        }
        # remove None values
        params = {k: str(v) for k, v in params.items() if v is not None}
        return self._get("getAllTranscriptions", params=params)

    def update_visibility(
        self,
        artifact_type: str,
        _id: str,
        explicit_permissions: Dict[str, Any],
    ) -> Any:
        payload = {
            "artifactType": artifact_type,
            "_id": _id,
            "explicitPermissions": explicit_permissions,
        }
        return self._post_json("updateVisibility", payload)
