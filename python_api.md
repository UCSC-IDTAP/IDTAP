# Python API & Server Overview

This document captures the high‑level structure of the IDTAP server API (TypeScript) and the
Python client library (`idtap_api`), so you (the developer/agent) can refer to it when working
on the Python side of the project.

---

## 1. Server‑Side API (TypeScript)

All server code lives under `server/`.  Key pieces:

- **`server/apiRoutes.ts`**
  - Defines authenticated `/api/...` endpoints, e.g.:
    - `GET /api/transcriptions`
    - `GET /api/transcription/:id`
    - `GET /api/transcription/:id/json`
    - `GET /api/transcription/:id/excel`
    - `POST /api/transcription`
    - `POST /api/visibility`

- **`server/oauthRoutes.ts`**
  - Defines unauthenticated `/oauth/...` endpoints for Python/other clients:
    - `GET  /oauth/authorize` → returns Google OAuth URL (`auth_url`).
    - `POST /oauth/token`     → exchanges code for tokens and user profile.

- **`server/server.ts`**
  - Bootstraps Express, middleware (CORS, bodyParser, Google token verification),
    MongoDB connections, and mounts `apiRoutes` and `oauthRoutes`.

---

## 2. Python Client Library (`idtap_api`)

The Python package lives under `python/idtap_api/` and is packaged via `setup.py` / `pyproject.toml`.
It provides:

1. **`auth.py`** (OAuth flow via server):
   - `login_google()`: opens browser, captures redirect, then POSTs to `/oauth/token`.
   - `load_token()` / `clear_token()`: migrate & retrieve stored tokens (keyring, encrypted, legacy).

2. **`secure_storage.py`** (secure token storage):
   - Preferred: OS keyring;
   - Fallback: encrypted file (`~/.swara/.tokens.enc`);
   - Legacy: plaintext (`~/.swara/token.json`).

3. **`client.py`** (HTTP client wrapper):
   - `SwaraClient`: handles token loading/auto‑login and wraps server routes:
     - `.get_piece(id)`, `.excel_data(id)`, `.json_data(id)`
     - `.save_piece(piece_dict)`
     - `.insert_new_transcription(piece_dict)` — insert a new transcription for the current user
     - `.get_viewable_transcriptions(...)`
     - `.update_visibility(artifactType, _id, explicitPermissions)`

4. **Data classes** under `python/idtap_api/classes/`:
   - `Articulation`, `Automation`, `Assemblage`, `Chikari`, `Group`, `Meter`,
     `NoteViewPhrase`, `Piece`, `Phrase`, `Pitch`, `Raga`, `Section`, `Trajectory`.
   - Enums in `python/idtap_api/enums.py` (e.g. `Instrument`).

---

## 3. Installation & Tests

```bash
# Install editable package
pip install -e python

# Run secure storage tests
pytest python/test_secure_storage.py
```

```python
from idtap_api import SwaraClient, Piece

client = SwaraClient(base_url="https://swara.studio/")
# auto‑login via browser/OAuth
data = client.get_piece("abc123")
```

---

_Keep this file updated as the server routes or Python client methods evolve._