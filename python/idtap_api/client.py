"""HTTP client for the Swara Studio API."""

from __future__ import annotations

from typing import Any, Dict, Optional, Union

import json
from pathlib import Path

import requests
import os

from idtap_api.classes.piece import Piece

from .auth import login_google, load_token
from .secure_storage import SecureTokenStorage


class SwaraClient:
    """Minimal client wrapping the public API served at https://swara.studio."""

    def __init__(
        self,
        base_url: str = "https://swara.studio/",
        token_path: str | Path | None = None,
        auto_login: bool = True,
    ) -> None:
        self.base_url = base_url.rstrip("/") + "/"
        
        # Initialize secure storage
        self.secure_storage = SecureTokenStorage()
        
        # Keep token_path for backwards compatibility
        self.token_path = Path(token_path or os.environ.get("SWARA_TOKEN_PATH", "~/.swara/token.json")).expanduser() if token_path else None
        
        self.auto_login = auto_login
        self.token: Optional[str] = None
        self.user: Optional[Dict[str, Any]] = None
        self.load_token()
        
        if self.token is None and self.auto_login:
            try:
                login_google(base_url=self.base_url, storage=self.secure_storage)
                self.load_token()
            except Exception as e:
                print(f"Failed to log in to Swara Studio: {e}")
                raise
                
    @property
    def user_id(self) -> Optional[str]:
        """Return the user ID if available, otherwise ``None``."""
        if self.user:
            return self.user.get("_id") or self.user.get("sub")
        return None

    # ---- auth utilities ----
    def load_token(self, token_path: Optional[str | Path] = None) -> None:
        """Load saved token and profile information from secure storage."""
        try:
            # Use the new secure storage with backwards compatibility
            legacy_path = Path(token_path or self.token_path) if (token_path or self.token_path) else None
            data = load_token(storage=self.secure_storage, token_path=legacy_path)
            
            if data:
                # Check if tokens are expired and need refresh
                if self.secure_storage.is_token_expired(data):
                    print("⚠️  Stored tokens are expired. Please re-authenticate.")
                    # Clear expired tokens
                    self.secure_storage.clear_tokens()
                    self.token = None
                    self.user = None
                    return
                
                self.token = data.get("id_token") or data.get("token")
                self.user = data.get("profile") or data.get("user")
            else:
                self.token = None
                self.user = None
        except Exception as e:
            print(f"Failed to load tokens: {e}")
            self.token = None
            self.user = None

    def get_auth_info(self) -> Dict[str, Any]:
        """Get information about the current authentication and storage setup.
        
        Returns:
            Dict containing authentication status and storage information
        """
        storage_info = self.secure_storage.get_storage_info()
        return {
            "authenticated": self.token is not None,
            "user_id": self.user_id,
            "user_email": self.user.get("email") if self.user else None,
            "storage_info": storage_info,
            "token_expired": self.secure_storage.is_token_expired(
                self.secure_storage.load_tokens() or {}
            ) if self.token else None
        }

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
        return self._get(f"api/transcription/{piece_id}")

    def excel_data(self, piece_id: str) -> bytes:
        return self._get(f"api/transcription/{piece_id}/excel")

    def json_data(self, piece_id: str) -> bytes:
        return self._get(f"api/transcription/{piece_id}/json")

    def save_piece(self, piece: Dict[str, Any]) -> Any:
        """Save transcription using authenticated API route."""
        return self._post_json("api/transcription", piece)

    def insert_new_transcription(self, piece: Dict[str, Any]) -> Any:
        """Insert a new transcription document as the current authenticated user."""
        if not self.user_id:
            raise RuntimeError("Not authenticated: cannot insert new transcription")
        payload = dict(piece)
        payload["userID"] = self.user_id
        return self._post_json("insertNewTranscription", payload)

    def get_viewable_transcriptions(
        self,
        sort_key: str = "title",
        sort_dir: str | int = 1,
        new_permissions: Optional[bool] = None,
    ) -> Any:
        """Return transcriptions viewable by the user."""
        params = {
            "sortKey": sort_key,
            "sortDir": sort_dir,
            "newPermissions": new_permissions,
        }
        # remove None values
        params = {k: str(v) for k, v in params.items() if v is not None}
        return self._get("api/transcriptions", params=params)


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
        return self._post_json("api/visibility", payload)

    def save_transcription(self, piece: Piece, fill_duration: bool = True) -> Any:
        """Save a transcription piece to the server.
        
        Handles both new transcriptions (without _id) and existing transcriptions (with _id).
        
        Args:
            piece: The Piece object or dict to save
            fill_duration: Whether to automatically fill remaining duration with silence
            
        Returns:
            Server response from the save operation
        """
        # Convert Piece object to dict if needed
        if hasattr(piece, 'to_json'):
            payload = piece.to_json()
        elif isinstance(piece, dict):
            payload = dict(piece)
        else:
            raise TypeError(f"Expected Piece object with to_json() method or dict, got {type(piece)}")
        
        # Fill remaining duration with silence if requested
        if fill_duration and hasattr(piece, 'fill_remaining_duration') and hasattr(piece, 'durTot'):
            piece.fill_remaining_duration(piece.durTot)
            payload = piece.to_json()
        
        # Set transcriber information from authenticated user if not already set
        if hasattr(piece, 'given_name') and self.user:
            if not getattr(piece, 'given_name', None):
                piece.given_name = self.user.get("given_name", "")
            if not getattr(piece, 'family_name', None):
                piece.family_name = self.user.get("family_name", "")
            if not getattr(piece, 'name', None):
                piece.name = self.user.get("name", "")
        
        # Set default soloist and instrument information if not already set
        if hasattr(piece, 'soloist') and not getattr(piece, 'soloist', None):
            piece.soloist = None
        if hasattr(piece, 'soloInstrument') and not getattr(piece, 'soloInstrument', None):
            instrumentation = getattr(piece, 'instrumentation', [])
            piece.soloInstrument = instrumentation[0] if instrumentation else "Unknown Instrument"
        
        # Regenerate payload after setting user info
        if hasattr(piece, 'to_json'):
            payload = piece.to_json()
        else:
            payload = dict(piece)
        
        # Determine if this is a new or existing transcription
        has_id = payload.get("_id") is not None
        
        if has_id:
            # Existing transcription - use save_piece
            print(f"Updating existing transcription: {payload.get('title', 'untitled')}")
            try:
                response = self.save_piece(payload)
                print("✅ Updated transcription:", response)
                return response
            except Exception as e:
                print("❌ Failed to update transcription:", e)
                raise
        else:
            # New transcription - remove any null _id and use insert_new_transcription
            payload.pop("_id", None)
            print(f"Inserting new transcription: {payload.get('title', 'untitled')}")
            try:
                response = self.insert_new_transcription(payload)
                print("✅ Inserted transcription:", response)
                return response
            except Exception as e:
                print("❌ Failed to insert transcription:", e)
                raise
