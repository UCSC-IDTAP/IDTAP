# IDTAP Python API Development Guide

## Overview
The Python API (`idtap_api`) is a sophisticated client library for interacting with the IDTAP (Interactive Digital Transcription and Analysis Platform) server, specifically designed for transcribing, analyzing, and managing Hindustani music recordings.

## Key Development Points

### Dependencies Management
- **Keep `Pipfile` and `pyproject.toml` in sync** - this is critical!
- Add new packages: `pipenv install package-name`
- Then manually add to `pyproject.toml` dependencies array
- Core deps: requests, pyhumps, keyring, cryptography, PyJWT, pymongo, google-auth-oauthlib

### Testing
- **Unit tests**: `pytest python/idtap_api/tests/` (uses `responses` for HTTP mocking)
- **Integration tests**: `python python/api_testing/api_test.py` (requires live server auth)
- Test structure: Complete coverage of data models, client functionality, and authentication

### Build/Package/Publish
```bash
python -m build
python -m twine upload dist/*  # or --repository testpypi for testing
```

## Architecture

### Main Components
- **`SwaraClient`** (`client.py`) - Main HTTP client with OAuth authentication
- **Data Models** (`/classes/`) - Rich musical transcription classes (Piece, Phrase, Trajectory, etc.)
- **Authentication** (`auth.py` + `secure_storage.py`) - OAuth flow with secure token storage
- **Utils** (`utils.py`) - camelCase ↔ snake_case conversion

### Key Classes
- **`Piece`**: Central transcription container with multi-track support, sections, audio association
- **`SwaraClient`**: API interface with methods for transcription CRUD, audio download, permissions
- **Musical Elements**: Phrase, Trajectory, Pitch, Raga, Section, Meter, Articulation

### Security/Authentication
- **OAuth Flow**: Server-based OAuth (not direct Google) → local HTTP server → secure storage
- **Storage Layers**: OS Keyring (primary) → AES-256 encrypted file (fallback) → plaintext (legacy)
- **CSRF Protection**: State parameter validation
- **Permissions**: User-based access control with public/private visibility

## Development Patterns

### Code Conventions
- **snake_case** for Python code
- **camelCase ↔ snake_case** conversion via `pyhumps` for API communication
- **Type hints** throughout
- **Backwards compatibility** maintained (especially token storage migration)

### Serialization Pattern
```python
class DataModel:
    def to_json(self) -> Dict[str, Any]:
        # Convert to dict with camelCase keys for API
        
    @staticmethod 
    def from_json(obj: Dict[str, Any]) -> 'DataModel':
        # Parse from API response with snake_case conversion
```

### Package Structure
```
python/idtap_api/
├── __init__.py           # Public API exports
├── client.py             # HTTP client (SwaraClient)
├── auth.py               # OAuth authentication
├── secure_storage.py     # Token security layers
├── enums.py              # Instrument types, etc.
├── utils.py              # camelCase conversion utilities
├── classes/              # Musical data models
└── tests/                # Unit tests
```

## API Endpoints (via SwaraClient)
- **Transcriptions**: GET/POST `/api/transcription/{id}`, GET `/api/transcriptions`
- **Data Export**: GET `/api/transcription/{id}/json`, `/api/transcription/{id}/excel`
- **Audio**: GET `/audio/{format}/{id}.{format}`
- **Permissions**: POST `/api/visibility`
- **OAuth**: GET `/oauth/authorize`, POST `/oauth/token`

## Musical Domain Knowledge
- **Hindustani Music Focus**: Transcription system for Indian classical music
- **Complex Data Models**: Supports microtonal pitches, ragas, articulations, meter cycles
- **Multi-instrument**: Sitar, Vocal (Male/Female) with instrument-specific features
- **Analytical Tools**: Trajectory categorization, phrase grouping, temporal analysis

## Development Workflow
1. **Data Model Development**: Create/modify classes in `/classes/` with proper serialization
2. **Client Method Development**: Add HTTP methods in `client.py` with authentication
3. **Testing**: Write unit tests (mocked) + integration tests (live API)  
4. **Sync Dependencies**: Update both `Pipfile` and `pyproject.toml`
5. **Build/Test/Publish**: Use standard Python packaging tools

## Installation Commands
```bash
# Development
pip install -e python/
pipenv install --dev

# Testing  
pytest python/idtap_api/tests/
python python/api_testing/api_test.py

# Package management
pipenv install package-name  # then manually add to pyproject.toml
```

This API provides a production-ready foundation for complex musical transcription analysis with modern security practices and comprehensive testing coverage.