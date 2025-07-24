"""HTTP client for the Swara Studio API."""

from __future__ import annotations

from typing import Any, Dict, Optional, Union, List, Callable

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
        response = requests.post(url, json=payload, headers=headers, timeout=1800)  # 30 minutes
        response.raise_for_status()
        if response.content:
            return response.json()
        return None

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = self.base_url + endpoint
        headers = self._auth_headers()
        response = requests.get(url, params=params, headers=headers, timeout=1800)  # 30 minutes
        response.raise_for_status()
        ctype = response.headers.get("Content-Type", "")
        if ctype.startswith("application/json"):
            return response.json()
        return response.content

    # ---- API methods ----
    def get_piece(self, piece_id: str) -> Any:
        """Return transcription JSON for the given id."""
        # Check waiver and prompt if needed
        self._prompt_for_waiver_if_needed()
        return self._get(f"api/transcription/{piece_id}")

    def excel_data(self, piece_id: str) -> bytes:
        """Export transcription data as Excel file."""
        # Check waiver and prompt if needed
        self._prompt_for_waiver_if_needed()
        return self._get(f"api/transcription/{piece_id}/excel")

    def json_data(self, piece_id: str) -> bytes:
        """Export transcription data as JSON file."""
        # Check waiver and prompt if needed
        self._prompt_for_waiver_if_needed()
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

    def _prompt_for_waiver_if_needed(self) -> None:
        """Interactively prompt user to agree to waiver if not already agreed."""
        if self.has_agreed_to_waiver():
            return
            
        print("\n" + "=" * 60)
        print("📋 IDTAP RESEARCH WAIVER REQUIRED")
        print("=" * 60)
        print("\nBefore accessing transcription data, you must agree to the following terms:\n")
        
        waiver_text = self.get_waiver_text()
        print(waiver_text)
        
        print("\n" + "=" * 60)
        
        while True:
            response = input("Do you agree to these terms? (yes/no): ").strip().lower()
            
            if response == "yes":
                print("\nSubmitting waiver agreement...")
                try:
                    self.agree_to_waiver(i_agree=True)
                    print("✅ Waiver agreement successful! You now have access to transcription data.\n")
                    break
                except Exception as e:
                    print(f"❌ Error submitting waiver agreement: {e}")
                    raise
            elif response == "no":
                print("\n👋 You must agree to the waiver to access transcription data.")
                raise RuntimeError("Waiver agreement required but declined by user.")
            else:
                print("Please respond with 'yes' or 'no'.")

    def get_viewable_transcriptions(
        self,
        sort_key: str = "title",
        sort_dir: str | int = 1,
        new_permissions: Optional[bool] = None,
    ) -> Any:
        """Return transcriptions viewable by the user."""
        # Check waiver and prompt if needed
        self._prompt_for_waiver_if_needed()
            
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

    def has_agreed_to_waiver(self) -> bool:
        """Check if the current user has agreed to the research waiver.
        
        This makes a fresh API call to get the latest waiver status from the database.
        
        Returns:
            True if user has agreed to waiver, False otherwise
        """
        try:
            # Make a fresh API call to get current user data from database
            fresh_user_data = self._get("api/user")
            return fresh_user_data.get("waiverAgreed", False)
        except Exception:
            # Fall back to cached data if API call fails
            if not self.user:
                return False
            return self.user.get("waiverAgreed", False)

    def get_waiver_text(self) -> str:
        """Get the research waiver text that users must agree to.
        
        Returns:
            The full waiver text
        """
        return ("I agree to only use the IDTAP for scholarly and/or pedagogical purposes. "
                "I understand that any copyrighted materials that I upload to the IDTAP "
                "are liable to be taken down in response to a DMCA takedown notice.")

    def agree_to_waiver(self, i_agree: bool = False) -> Any:
        """Agree to the research waiver after reading it.
        
        You must first read the waiver text using get_waiver_text() and then
        explicitly set i_agree=True to confirm agreement.
        
        Args:
            i_agree: Must be True to confirm you have read and agree to the waiver
        
        Returns:
            Server response confirming waiver agreement
            
        Raises:
            RuntimeError: If not authenticated or if i_agree is not True
        """
        if not self.user_id:
            raise RuntimeError("Not authenticated: cannot agree to waiver")
        
        if not i_agree:
            waiver_text = self.get_waiver_text()
            raise RuntimeError(
                f"You must read and agree to the research waiver before accessing transcriptions.\n\n"
                f"WAIVER TEXT:\n{waiver_text}\n\n"
                f"If you agree to these terms, call: client.agree_to_waiver(i_agree=True)"
            )
            
        payload = {"userID": self.user_id}
        result = self._post_json("api/agreeToWaiver", payload)
        
        # Update local user object to reflect waiver agreement
        if self.user:
            self.user["waiverAgreed"] = True
        
        return result

    def upload_audio(
        self,
        file_path: str,
        metadata: "AudioMetadata",
        audio_event: Optional["AudioEventConfig"] = None,
        progress_callback: Optional[Callable[[float], None]] = None
    ) -> "AudioUploadResult":
        """Upload audio recording with comprehensive metadata.

        Requires the `requests-toolbelt` library for multipart encoding.
        
        Args:
            file_path: Path to the audio file to upload
            metadata: AudioMetadata object with recording information
            audio_event: Optional AudioEventConfig for associating with audio events
            progress_callback: Optional callback for upload progress (0-100)
            
        Returns:
            AudioUploadResult with upload status and file information
            
        Raises:
            FileNotFoundError: If the audio file doesn't exist
            ValueError: If the file is not a supported audio format
            RuntimeError: If upload fails
        """
        import os
        from pathlib import Path
        
        # Validate file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        file_path_obj = Path(file_path)
        
        # Check file extension
        supported_extensions = {'.mp3', '.wav', '.m4a', '.flac', '.opus', '.ogg'}
        if file_path_obj.suffix.lower() not in supported_extensions:
            raise ValueError(f"Unsupported audio format: {file_path_obj.suffix}. "
                           f"Supported formats: {', '.join(supported_extensions)}")
        
        # Prepare form data
        try:
            # Prepare data fields
            data = {
                'metadata': json.dumps(metadata.to_json()),
            }
            
            if audio_event:
                data['audioEventConfig'] = json.dumps(audio_event.to_json())
            
            # Open file and make request
            with open(file_path, 'rb') as f:
                files = {'audioFile': (file_path_obj.name, f, self._get_mimetype(file_path_obj.suffix))}
                
                from requests_toolbelt.multipart.encoder import MultipartEncoder, MultipartEncoderMonitor

                def progress_monitor(monitor):
                    progress_callback((monitor.bytes_read / monitor.len) * 100)

                fields = {
                    'metadata': json.dumps(metadata.to_json()),
                }
                if audio_event:
                    fields['audioEventConfig'] = json.dumps(audio_event.to_json())
                fields['audioFile'] = (
                    file_path_obj.name,
                    f,
                    self._get_mimetype(file_path_obj.suffix)
                )

                encoder = MultipartEncoder(fields=fields)
                payload = MultipartEncoderMonitor(encoder, progress_monitor) if progress_callback else encoder
                headers = {
                    **self._auth_headers(),
                    'Content-Type': payload.content_type,
                    'Content-Length': str(payload.len),
                }

                response = requests.post(
                    f"{self.base_url}api/uploadAudio",
                    data=payload,
                    headers=headers,
                    timeout=1800
                )
                response.raise_for_status()
                result_data = response.json()
                from .audio_models import AudioUploadResult
                return AudioUploadResult.from_api_response(result_data)
                
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Upload failed: {e}")
        except Exception as e:
            raise RuntimeError(f"Upload error: {e}")

    def _get_mimetype(self, extension: str) -> str:
        """Get MIME type for file extension."""
        mime_types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/m4a',
            '.flac': 'audio/flac',
            '.opus': 'audio/opus',
            '.ogg': 'audio/ogg'
        }
        return mime_types.get(extension.lower(), 'audio/mpeg')

    def get_available_musicians(self) -> List[Dict[str, Any]]:
        """Get list of musicians in database."""
        return self._get("api/musicians")

    def get_available_ragas(self) -> List[str]:
        """Get list of ragas in database."""
        return self._get("api/ragas")
        
    def get_available_instruments(self, melody_only: bool = False) -> List[str]:
        """Get list of instruments in database."""
        params = {'melody': 'true'} if melody_only else {}
        return self._get("api/instruments", params)
        
    def get_location_hierarchy(self) -> "LocationHierarchy":
        """Get continent/country/city structure."""
        data = self._get("api/locations")
        from .audio_models import LocationHierarchy
        return LocationHierarchy.from_api_response(data)
        
    def get_available_gharanas(self) -> List[Dict[str, Any]]:
        """Get list of gharanas in database."""
        return self._get("api/gharanas")
        
    def get_performance_sections(self) -> List[str]:
        """Get list of performance sections."""
        return self._get("api/performanceSections")
        
    def get_event_types(self) -> List[str]:
        """Get list of audio event types."""
        return self._get("api/eventTypes")
        
    def get_editable_audio_events(self) -> List[Dict[str, Any]]:
        """Get audio events the user can edit."""
        return self._get("api/audioEvents")

    def validate_metadata(self, metadata: "AudioMetadata") -> "ValidationResult":
        """Validate metadata against platform requirements."""
        from .audio_models import ValidationResult
        
        errors = []
        warnings = []
        
        # Get available data for validation
        try:
            available_musicians = [m.get('Full Name', '') for m in self.get_available_musicians()]
            available_ragas = self.get_available_ragas()
            available_instruments = self.get_available_instruments()
            location_hierarchy = self.get_location_hierarchy()
        except Exception as e:
            warnings.append(f"Could not fetch validation data: {e}")
            return ValidationResult(is_valid=True, warnings=warnings)
        
        # Validate musicians
        for musician in metadata.musicians:
            if not musician.name:
                errors.append("Musician name cannot be empty")
            elif musician.name not in available_musicians and musician.name != "Other":
                warnings.append(f"Musician '{musician.name}' not found in database")
            
            if musician.instrument not in available_instruments:
                warnings.append(f"Instrument '{musician.instrument}' not found in database")
        
        # Validate ragas
        for raga in metadata.ragas:
            if not raga.name:
                errors.append("Raga name cannot be empty")
            elif raga.name not in available_ragas:
                warnings.append(f"Raga '{raga.name}' not found in database")
        
        # Validate location
        if metadata.location:
            continents = location_hierarchy.get_continents()
            if metadata.location.continent not in continents:
                warnings.append(f"Continent '{metadata.location.continent}' not found in database")
            else:
                countries = location_hierarchy.get_countries(metadata.location.continent)
                if metadata.location.country not in countries:
                    warnings.append(f"Country '{metadata.location.country}' not found in database")
                elif metadata.location.city:
                    cities = location_hierarchy.get_cities(metadata.location.continent, metadata.location.country)
                    if cities and metadata.location.city not in cities:
                        warnings.append(f"City '{metadata.location.city}' not found in database")
        
        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

    def logout(self, confirm: bool = False) -> bool:
        """Log out the current user and clear all stored authentication tokens.
        
        This will:
        - Clear tokens from OS keyring, encrypted storage, and plaintext files
        - Reset the client's authentication state
        - Require re-authentication for future API calls
        
        Args:
            confirm: Set to True to confirm logout without interactive prompt
            
        Returns:
            True if logout was successful, False otherwise
        """
        if not confirm:
            print("🚪 Logging out will clear all stored authentication tokens.")
            print("You will need to re-authenticate to use the API again.")
            user_input = input("Are you sure you want to log out? (yes/no): ").strip().lower()
            if user_input != 'yes':
                print("Logout cancelled.")
                return False
        
        try:
            # Clear tokens from all storage backends
            success = self.secure_storage.clear_tokens()
            
            if success:
                # Reset client authentication state
                self.token = None
                self.user = None
                print("✅ Successfully logged out. All authentication tokens have been cleared.")
                return True
            else:
                print("⚠️  Logout partially successful - some tokens may not have been cleared.")
                return False
                
        except Exception as e:
            print(f"❌ Error during logout: {e}")
            return False

    def download_audio(self, audio_id: str, format: str = "wav") -> bytes:
        """Download audio recording by audio ID.
        
        Args:
            audio_id: The audio recording ID
            format: Audio format (wav, mp3, opus)
            
        Returns:
            Raw audio data as bytes
        """
        if format not in ["wav", "mp3", "opus"]:
            raise ValueError(f"Unsupported audio format: {format}. Use 'wav', 'mp3', or 'opus'")
        
        endpoint = f"audio/{format}/{audio_id}.{format}"
        return self._get(endpoint)

    def download_transcription_audio(self, piece: Union[Dict[str, Any], Piece], format: str = "wav") -> Optional[bytes]:
        """Download audio recording associated with a transcription.
        
        Args:
            piece: Transcription piece data (dict or Piece object)
            format: Audio format (wav, mp3, opus)
            
        Returns:
            Raw audio data as bytes, or None if no audio is associated
        """
        # Extract audio ID from piece
        if hasattr(piece, 'audio_id'):
            audio_id = piece.audio_id
        elif isinstance(piece, dict):
            audio_id = piece.get('audioID')
        else:
            raise TypeError(f"Expected Piece object or dict, got {type(piece)}")
        
        if not audio_id:
            return None
            
        return self.download_audio(audio_id, format)

    def save_audio_file(self, audio_data: bytes, filename: str, filepath: Optional[str] = None) -> str:
        """Save audio data to a file.
        
        Args:
            audio_data: Raw audio data from download_audio()
            filename: Output filename (should include extension)
            filepath: Directory to save file (defaults to user's Downloads folder)
            
        Returns:
            Full path to the saved file
        """
        import os
        from pathlib import Path
        
        if filepath is None:
            # Cross-platform default to Downloads folder
            if os.name == 'nt':  # Windows
                downloads_dir = Path.home() / 'Downloads'
            else:  # macOS, Linux, Unix
                downloads_dir = Path.home() / 'Downloads'
            filepath = str(downloads_dir)
        
        # Ensure directory exists
        Path(filepath).mkdir(parents=True, exist_ok=True)
        
        # Combine path and filename
        full_path = Path(filepath) / filename
        
        with open(full_path, 'wb') as f:
            f.write(audio_data)
            
        return str(full_path)

    def download_and_save_transcription_audio(self, piece: Union[Dict[str, Any], Piece], 
                                              format: str = "wav", 
                                              filepath: Optional[str] = None,
                                              filename: Optional[str] = None) -> Optional[str]:
        """Download and save audio recording associated with a transcription.
        
        Args:
            piece: Transcription piece data (dict or Piece object)
            format: Audio format (wav, mp3, opus)
            filepath: Directory to save file (defaults to Downloads folder)
            filename: Custom filename (defaults to transcription title + ID)
            
        Returns:
            Full path to saved file, or None if no audio is associated
        """
        # Download audio data
        audio_data = self.download_transcription_audio(piece, format)
        if not audio_data:
            return None
        
        # Generate filename if not provided
        if filename is None:
            if hasattr(piece, 'title') and hasattr(piece, '_id'):
                title = piece.title
                piece_id = piece._id
            elif isinstance(piece, dict):
                title = piece.get('title', 'untitled')
                piece_id = piece.get('_id', 'unknown')
            else:
                title = 'untitled'
                piece_id = 'unknown'
            
            # Clean title for filename
            clean_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
            filename = f"{clean_title}_{piece_id}.{format}"
        
        # Save file and return path
        return self.save_audio_file(audio_data, filename, filepath)

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
        if fill_duration and hasattr(piece, 'fill_remaining_duration') and hasattr(piece, 'dur_tot'):
            piece.fill_remaining_duration(piece.dur_tot)
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
        if hasattr(piece, 'solo_instrument') and not getattr(piece, 'solo_instrument', None):
            instrumentation = getattr(piece, 'instrumentation', [])
            piece.solo_instrument = instrumentation[0] if instrumentation else "Unknown Instrument"
        
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
