# Python API

The `idtap-api` package (published on PyPI, currently v0.1.43) is a Python client library for programmatic access to the IDTAP web application. It enables researchers, musicologists, and developers to access, analyze, and manipulate transcription data without using the web interface.

**Repository:** `UCSC-IDTAP/Python-API` (separate Git repo)
**Local path:** `/Users/jon/Documents/2026/idtap_project/Python-API/`

---

## Architecture Overview

The package has four major subsystems:

```
idtap/
├── client.py          # SwaraClient - HTTP client wrapping REST API (~43KB)
├── auth.py            # OAuth 2.0 flow with browser-based login
├── secure_storage.py  # Token storage (keyring/encrypted file/plaintext)
├── query.py           # Musical pattern query engine (~40KB)
├── query_types.py     # Query type definitions
├── sequence_utils.py  # Sequence matching utilities
├── spectrogram.py     # Spectrogram data access with matplotlib visualization
├── audio_models.py    # Dataclass models for audio upload metadata
├── enums.py           # Instrument types, TalaName
├── __init__.py        # Public API surface
└── classes/           # Musical data model classes (15 files)
    ├── piece.py       # Central container (~66.7KB)
    ├── phrase.py      # Musical phrase with trajectory grids (~26KB)
    ├── trajectory.py  # Continuous pitch contour (~41KB)
    ├── pitch.py       # Individual pitch point (~13.7KB)
    ├── raga.py        # Scale definition with tuning (~27.9KB)
    ├── meter.py       # Rhythmic cycle system (~49.5KB)
    ├── articulation.py
    ├── automation.py
    ├── chikari.py
    ├── group.py
    ├── section.py
    ├── assemblage.py
    ├── note_view_phrase.py
    └── musical_time.py
```

---

## SwaraClient

The HTTP client wrapping the `swara.studio` REST API. Key capabilities:

### Transcription Operations
- `get_piece(id)`: Fetch a transcription as a fully-hydrated `Piece` object
- `save_piece(piece)`: Persist changes back to the server
- `insert_new_transcription(piece)`: Create new transcription
- `clone_transcription(id)`: Duplicate an existing transcription
- `delete_transcription(id)`: Remove a transcription

### Data Export
- `excel_data(id)`: Generate Excel export
- `json_data(id)`: Generate JSON export

### Audio Operations
- `download_audio(id, path)`: Download audio file to local path
- `upload_audio(file, metadata)`: Upload with multipart encoding and progress callbacks

### Query Execution
- `single_query(piece, query)`: Execute a musical pattern query against a transcription
- `multiple_query(piece, queries, logic)`: Coordinate multiple queries with AND/OR logic

### Metadata
- `get_available_musicians()`: Browse musician database
- `get_available_ragas()`: Browse raga definitions
- `get_raga_rules(id)`: Get raga rule set details
- `get_location_hierarchy()`: Browse recording locations

### Research Waiver
- `_prompt_for_waiver_if_needed()`: Interactive consent prompt required for API access

---

## Authentication

**File:** `auth.py`

Server-mediated OAuth 2.0 flow:

1. Client hits `/oauth/authorize` on swara.studio to get a Google auth URL
2. Opens user's browser for Google authentication
3. Runs a local WSGI server on `localhost:8080` to capture the redirect
4. Exchanges authorization code via `/oauth/token` for JWT tokens
5. Stores tokens via `SecureTokenStorage`
6. CSRF protection via state parameter
7. Automatic token expiry checking

### Token Storage (`secure_storage.py`)

Three-tier storage with graceful fallback:
1. **OS keyring** (preferred): System credential store
2. **AES-256 encrypted file** (fallback): Machine-key-derived encryption
3. **Plaintext JSON** (legacy): For environments without keyring support

Includes migration logic to upgrade from plaintext to encrypted storage.

---

## Musical Data Model Classes

All classes follow a consistent pattern:
- Constructor takes an options dict
- `to_json()` outputs camelCase for the API
- `from_json()` is a classmethod accepting camelCase, converting via `pyhumps.decamelize()`
- Full functional parity with the TypeScript model classes

### Data Model Hierarchy

```
Piece
├── Raga (melodic framework)
├── Meter[] (rhythmic framework)
├── phrase_grid: Phrase[][] (indexed by instrument track)
│   └── Phrase
│       ├── trajectory_grid: Trajectory[][] (indexed by string)
│       │   └── Trajectory
│       │       ├── Pitch[] (anchor pitches)
│       │       ├── Articulation{} (keyed by time position)
│       │       ├── Automation (volume envelope)
│       │       └── vib_obj (vibrato parameters)
│       ├── chikari_grid
│       ├── groups_grid
│       └── categorization_grid
├── assemblage_descriptors
└── instrumentation
```

The Python classes mirror the TypeScript model exactly -- the same 14 trajectory archetypes, the same `compute(x)` evaluation, the same raga/tuning system, the same meter hierarchy.

---

## Query System

**Files:** `query.py` (~40KB), `query_types.py`, `sequence_utils.py`

A Python port of the TypeScript query engine with exact functional parity:

### Query Categories
- Trajectory ID queries
- Pitch queries (specific pitch, pitch range)
- Vowel/consonant queries
- Pitch sequence patterns (strict and loose matching)
- Trajectory ID sequence patterns
- Section type queries
- Phrase categorization queries
- Elaboration type queries
- Articulation type queries
- Duration filtering

### Designators
- `includes`, `excludes`, `startsWith`, `endsWith`

### Segmentation Modes
- Phrase-level
- Group-level
- Sequence of trajectories
- Connected sequence of trajectories

### Multiple Query Coordination
AND/OR logic for combining multiple queries.

---

## Spectrogram Data Access

**File:** `spectrogram.py` (~19.8KB)

Client-side access to Constant-Q spectrogram data with matplotlib visualization. Supports all 50+ colormaps available in the web interface.

---

## Current State and Pending Work

### Serialization Sync (In Progress)

The main IDTAP web app (PR #887) stripped redundant fields from serialization to reduce database bloat. A detailed spec exists at `Python-API/SERIALIZATION_SYNC_SPEC.md` describing required Python-side changes:

- **Already done**: `Pitch.to_json()` strips `ratios`/`fundamental`; `Pitch.from_json()` accepts optional params
- **Still needed**: `Trajectory.to_json()` (strip `name`/`instrumentation`/`tags`), `Phrase.to_json()` (strip `raga`), threading ratios/fundamental through the `from_json()` chain

### Test Suite

23 test files in `idtap/tests/` plus integration tests in `api_testing/`:
- Unit tests use `responses` library for HTTP mocking
- Integration tests require browser-based OAuth
- Test fixture at `idtap/tests/fixtures/serialization_test.json` contains old-format data
- pytest configured via `pyproject.toml`

---

## CI/CD and Publishing

Three GitHub Actions workflows:
- **`test-pr.yml`**: Tests + builds + uploads to TestPyPI on every PR
- **`release.yml`**: On merge to main: tests, version bump (patch-only via python-semantic-release), build, PyPI publish via OIDC trusted publisher, GitHub release
- **`claude-code-review.yml`**: AI code review on PRs

Version maintained in three locations (auto-updated by semantic-release): `idtap/__init__.py`, `pyproject.toml`, `docs/conf.py`.

---

## Integration with Main Web App

The Python API is a **read-heavy client** of the web application's REST API:

| Aspect | Integration Point |
|--------|------------------|
| Authentication | Same Google OAuth infrastructure (server-mediated) |
| Data access | REST endpoints on swara.studio (not direct DB) |
| Write-back | `save_piece()`, `insert_new_transcription()` |
| Audio upload | Same upload pipeline as web client |
| Query system | Port of TypeScript query system, identical results |
| Naming convention | camelCase↔snake_case conversion via `pyhumps` |
| Data models | Mirror TypeScript classes exactly |

---

## Architectural Consideration: Backend Consolidation

The current architecture has **two backends** serving different purposes:
- **Node.js/Express** (TypeScript): The primary web server handling all routing, MongoDB access, and Python script spawning
- **Python scripts**: Server-side audio analysis (Essentia), spectrogram generation, melograph generation, data management

The Python API client adds a third Python component that duplicates the data model. This creates maintenance burden: changes to the model must be synchronized across TypeScript (frontend + server), Python scripts (server-side), and the Python API (PyPI package).

A **unified backend** (likely Python with FastAPI or similar) could:
- Eliminate model duplication
- Simplify deployment (one language, one runtime)
- Enable the Python analysis tools to access data directly
- Reduce the complexity of the deployment pipeline

This is discussed further in [Known Issues and Roadmap](12-known-issues-and-roadmap.md).
