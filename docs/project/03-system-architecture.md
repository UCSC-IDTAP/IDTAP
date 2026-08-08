# System Architecture

IDTAP is a full-stack web application spanning multiple languages, runtimes, and repositories. This document provides a holistic view of how the pieces connect.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                           │
│                                                                     │
│  Vue 3 + TypeScript          D3.js SVG Rendering     Web Audio API  │
│  ├── Editor Components       ├── TranscriptionLayer  ├── KS Synth   │
│  ├── Analysis Views          ├── SpectrogramLayer    ├── Sarangi    │
│  ├── Collections Manager     └── MelographLayer      ├── Klatt      │
│  ├── Audio Recordings                                ├── Chikari    │
│  └── File Manager            Web Workers             └── Capture    │
│                              └── Spectrogram Worker                 │
├─────────────────────────────────────────────────────────────────────┤
│                        REST API (HTTPS)                              │
├─────────────────────────────────────────────────────────────────────┤
│                    Node.js + Express Server                          │
│                                                                     │
│  server.ts (2344 lines)      apiRoutes.ts             oauthRoutes.ts│
│  ├── Transcription CRUD      ├── Python API endpoints ├── OAuth flow│
│  ├── Audio upload/serve      ├── Audio upload API     ├── JWT tokens│
│  ├── Python script spawn     └── Metadata endpoints   └── Waiver    │
│  ├── Spectrogram serve                                              │
│  └── Excel/JSON export       extract.ts (1046 lines)                │
│                              └── DN_Extractor data export           │
├─────────────────────────────────────────────────────────────────────┤
│           MongoDB Atlas              Python Scripts (Server-Side)    │
│                                                                     │
│  Collections:                 visualization_scripts/                │
│  ├── transcriptions           ├── make_spec_data.py                 │
│  ├── audioFiles               ├── generate_melograph.py             │
│  ├── users                    visualization_tools/                  │
│  ├── musicians                ├── generate_log_spectrograms.py      │
│  ├── ragas                    ├── make_all_spectrograms.py          │
│  ├── collections              auto_transcribe/                      │
│  └── settings                 ├── melodic_contour.py                │
│                               ├── onsets.py                         │
│  File System:                 dataManagement/                       │
│  └── /root/audioEvents/{id}/  ├── aggregations/ (10 migration      │
│      ├── audio.wav            │   scripts)                          │
│      ├── spec_data/           └── backup_mongo.py                   │
│      └── melograph_data/                                            │
├─────────────────────────────────────────────────────────────────────┤
│              Python API Client (PyPI: idtap-api)                     │
│              Separate repo: UCSC-IDTAP/Python-API                    │
│              ├── SwaraClient (HTTP client)                           │
│              ├── Data model classes (mirrors TypeScript)              │
│              ├── OAuth authentication                                │
│              └── Query system (port of TypeScript)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend (Vue 3 + TypeScript)

### Technology Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict mode
- **Vite** for build and dev server
- **Vue Router 4** for client-side routing
- **Vuex 4** for authentication state (editor state is component-local)
- **D3.js** for data visualization and SVG rendering
- **Web Audio API** with AudioWorklets for real-time synthesis
- **GSAP** for animations
- **Google OAuth** (vue3-google-login)

### Source Organization
```
src/
├── comps/
│   ├── editor/              # Main transcription editor
│   │   ├── renderer/        # TranscriptionLayer, SpectrogramLayer, MelographLayer
│   │   ├── audioPlayer/     # EditorAudioPlayer, Synths, SpectrogramControls
│   │   ├── AssemblageEditor.vue
│   │   ├── TrajSelectPanel.vue
│   │   └── ModeSelector.vue
│   ├── analysis/            # Pitch prevalence, query, assemblage display
│   ├── AudioRecordings/     # Audio file management
│   ├── Collections/         # Collection management
│   └── Files/               # File browser
├── ts/
│   ├── model/               # Clean TypeScript data model
│   │   ├── piece.ts, phrase.ts, trajectory.ts, pitch.ts
│   │   ├── raga.ts, assemblage.ts, automation.ts
│   │   └── group.ts, chikari.ts, section.ts, articulation.ts
│   └── workers/             # Web Worker code
│       ├── spectrogramWorker.ts
│       └── workerManager.ts
├── js/
│   ├── classes.ts           # Legacy duplicate model layer (4165 lines)
│   ├── meter.ts             # Meter/tala system (2629 lines)
│   └── query.ts             # Musical pattern query engine (1058 lines)
├── audioWorklets/           # AudioWorkletProcessor implementations
│   ├── karplusStrong2.worklet.js
│   ├── sarangi2.worklet.js
│   ├── chikaris4.worklet.js
│   ├── klattSynth2.worklet.js
│   └── captureAudio.worklet.js
└── synths/
    └── woodblock.ts         # Metronome synth
```

### Dual Model Layer (Known Technical Debt)

There are **two implementations** of the domain model:
- `src/ts/model/` -- the "clean" TypeScript model used by the frontend
- `src/js/classes.ts` (4,165 lines) -- an older duplicate used by `server/extract.ts` for data extraction

The `classes.ts` file imports from `@/ts/model` and re-exports, but also contains `Meter` integration. This is a legacy artifact being phased out.

---

## Backend (Node.js + Express)

### Server Architecture
The server is **monolithic** -- `server.ts` is 2,344 lines with most routes inline. The only separation:
- `apiRoutes.ts`: REST endpoints for the Python API client
- `oauthRoutes.ts`: OAuth 2.0 flow for Python API authentication

### Key Endpoints

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Auth | `/userLoginGoogle`, `/handleGoogleAuthCode` | Google OAuth for web |
| Auth | `/oauth/authorize`, `/oauth/token` | OAuth for Python API |
| Transcription | `/insertNewTranscription`, `/updateTranscription`, `/getAllTranscriptions` | CRUD |
| Audio | `/newUploadFile`, `/api/audio/upload` | Upload with progress |
| Visualization | `/makeSpectrograms`, `/makeMelograph` | Spawn Python scripts |
| Export | `/excelData`, `/jsonData`, `/DNExtractExcel` | Data extraction |
| API | `/api/transcription/:id`, `/api/agreeToWaiver` | Python API endpoints |

### Python Script Integration

The Node.js server spawns Python processes for analysis tasks:
- `make_spec_data.py`: Spectrogram data generation
- `generate_melograph.py`: Pitch contour extraction
- `make_excel.py`: Excel export generation
- Processing uses `child_process.spawn` with the server's `uv`-managed Python venv (`/opt/idtap-python/bin/python`)

---

## Shared Type Contract

**Files:** `shared/types.ts` (1,337 lines), `shared/enums.ts` (148 lines)

These two files define the entire data contract between frontend and server. Notable: `types.ts` imports Vue component types directly (for typed template refs), creating a coupling between the shared type layer and the frontend.

---

## Python Scripts (Server-Side)

```
python/
├── visualization_scripts/    # Analysis and visualization
│   ├── make_spec_data.py     # Constant-Q spectrogram data generation
│   └── generate_melograph.py # Pitch contour extraction
├── visualization_tools/      # Batch processing
│   ├── generate_log_spectrograms.py  # Legacy image-based spectrograms
│   ├── make_all_spectrograms.py      # Batch spectrogram generation
│   └── make_all_melographs.py
├── auto_transcribe/          # ML-based auto-transcription (emerging)
│   ├── melodic_contour.py    # Essentia-based pitch extraction
│   ├── onsets.py             # Onset detection with neural classifier
│   ├── segment.py            # Audio segmentation
│   └── extract.py            # Feature extraction pipeline
├── cleanJson/
│   └── make_excel.py         # Excel export generation
├── dataManagement/
│   └── aggregations/         # 10 database migration scripts
├── mass_upload/              # Batch audio ingestion
│   ├── mass_upload.py
│   └── directory_watcher.py
└── backup_scripts/
```

---

## Database (MongoDB Atlas)

### Core Collections
- **transcriptions**: Musical transcription documents (nested Piece→Phrase→Trajectory hierarchy)
- **audioFiles**: Audio file metadata (filename, duration, musician, raga, etc.)
- **users**: User profiles with Google OAuth identity
- **musicians**: Musician database with gharana (lineage) information
- **ragas**: Raga definitions with rule sets and tuning
- **collections**: User-created collections of transcriptions/recordings

See [Database and Storage](09-database-and-storage.md) for detailed schema documentation.

---

## Deployment Infrastructure

### Production Server
- **DigitalOcean droplet**: `137.184.90.119` / `swara.studio`
- **Node.js server**: Runs in tmux session with nodemon for auto-restart
- **Python**: uv-managed venv at `/opt/idtap-python/`
- **Nginx**: Serves static frontend files from `/var/www/html/`
- **Daily cron**: MongoDB backup and orphaned audio cleanup

### CI/CD (GitHub Actions)
- **`update-changelog.yml`**: Push to main → changelog generation → Vite build → rsync deploy to production
- **`ci.yml`**: PR testing (Node 22.9.0 + Python 3.11)
- **`claude-review.yml`**: Manual `@claude review` on PRs

### Deployment Commands
```bash
pnpm build              # Vite production build (automated via CI)
pnpm deployTSServer     # Manual: build extract.ts + rsync server files + pnpm install on server
pnpm deployShared       # Manual: rsync shared types
```

See [Deployment and Infrastructure](11-deployment-and-infrastructure.md) for full details.

---

## Data Flow Patterns

### Transcription Editing
```
User interaction → Vue component → Piece model mutation → Cmd+S →
POST /updateTranscription → MongoDB upsert (with legacy field $unset)
```

### Audio Upload
```
File selection → multipart upload with progress → server express-fileupload →
FFmpeg opus→wav conversion → Python spawn (make_spec_data.py, generate_melograph.py) →
spec_data.gz + melograph JSON written to filesystem → client notified
```

### Spectrogram Display
```
Component mount → fetch spec_data.gz + spec_shape.json → Web Worker decompress →
IntersectionObserver detects visible tiles → Worker renders (scale→intensify→colorize) →
ImageData transferred to main thread → canvas.putImageData()
```

### Python API Access
```
idtap-api client → OAuth browser flow → JWT token → REST API calls →
server.ts/apiRoutes.ts → MongoDB query → JSON response → Python data classes
```
