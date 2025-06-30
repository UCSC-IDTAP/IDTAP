"""HTTP client for the Swara Studio API."""

from __future__ import annotations

from typing import Any, Dict, Optional

import requests


class SwaraClient:
    """Minimal client wrapping the public API served at https://swara.studio."""

    def __init__(self, base_url: str = "https://swara.studio/") -> None:
        self.base_url = base_url.rstrip("/") + "/"

    def _post_json(self, endpoint: str, payload: Dict[str, Any]) -> Any:
        url = self.base_url + endpoint
        response = requests.post(url, json=payload)
        response.raise_for_status()
        if response.content:
            return response.json()
        return None

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = self.base_url + endpoint
        response = requests.get(url, params=params)
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
