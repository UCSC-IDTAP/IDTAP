# Onboarding Guide

This guide is for a new developer taking over IDTAP development. It covers local setup, key files to read first, the development workflow, and deployment procedures.

---

## Prerequisites

- **Node.js** 22+ with **pnpm** 10+
- **Python** 3.11+ with **uv** (Python package manager)
- **MongoDB Atlas** access (credentials in server environment)
- **Git** with **Git LFS** (for research papers and large files)
- **SSH access** to the production server (`root@137.184.90.119`)
- **Google OAuth** credentials (for authentication)

---

## Local Development Setup

### 1. Clone the Repositories

```bash
# Main web application
git clone https://github.com/UCSC-IDTAP/IDTAP.git
cd IDTAP
git lfs pull  # Fetch LFS-tracked files (papers, etc.)

# Python API (separate repo)
cd ..
git clone https://github.com/UCSC-IDTAP/Python-API.git
```

### 2. Install Dependencies

```bash
# Frontend + root
cd IDTAP
pnpm install

# Server
cd server
pnpm install

# Python environment (for server-side scripts)
cd ../python
uv venv
uv pip install -r requirements.txt
```

### 3. Environment Configuration

The server requires environment variables for MongoDB connection and Google OAuth. These are configured on the production server; for local development, you'll need:
- MongoDB Atlas connection string
- Google OAuth client ID and secret
- File paths for audio storage

### 4. Run Development Server

```bash
pnpm dev         # Vite dev server (frontend)
# Server runs on production only via tmux + nodemon
```

---

## Key Files to Read First

Read these files in this order to build a mental model of the system:

### 1. Configuration and Types
- `CLAUDE.md` -- Project conventions and rules (read this first!)
- `shared/types.ts` -- The entire type contract (1,337 lines)
- `shared/enums.ts` -- All enumerations

### 2. Data Model
- `src/ts/model/pitch.ts` -- Start here: simplest model class
- `src/ts/model/trajectory.ts` -- The core innovation (14 archetypes)
- `src/ts/model/phrase.ts` -- Container for trajectories
- `src/ts/model/piece.ts` -- Top-level container
- `src/ts/model/raga.ts` -- Melodic framework

### 3. Editor (the main UI)
- `src/comps/editor/EditorComponent.vue` -- Orchestrator (2,992 lines)
- `src/comps/editor/renderer/Renderer.vue` -- Layout and scales
- `src/comps/editor/renderer/TranscriptionLayer.vue` -- All rendering (8,056 lines -- skim the structure)

### 4. Backend
- `server/server.ts` -- All routes (2,344 lines)
- `server/apiRoutes.ts` -- Python API endpoints
- `server/extract.ts` -- Data extraction/export

### 5. Audio
- `src/comps/editor/audioPlayer/Synths.vue` -- Audio graph construction
- `src/audioWorklets/karplusStrong2.worklet.js` -- Simplest synthesis engine

---

## Development Workflow

### Branching Strategy
**Never push directly to main.** Always use feature branches and PRs:

```bash
git checkout -b feature/your-feature-name
# ... make changes ...
git add <specific files>
git commit -m "feat: your changes"
git push -u origin feature/your-feature-name
gh pr create
```

Main branch pushes trigger **automatic frontend deployment** to production.

### Commit Convention
Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). These drive automated changelog generation.

### Testing
```bash
pnpm test          # Vitest (frontend + model tests)
cd python && pytest  # Python tests (server-side scripts)
```

### Code Quality
```bash
pnpm lint          # ESLint
# TypeScript strict mode is enforced
```

---

## Deployment

### Frontend (Automated)
Pushing to `main` triggers GitHub Actions:
1. `pnpm install` → `pnpm build` (Vite production build)
2. Rsync to `root@137.184.90.119:/var/www/html/`
3. Changelog auto-generated from conventional commits

### Backend (Manual)
```bash
pnpm deployTSServer
```
This runs `esbuild` to compile `extract.ts`, then rsyncs server files + `package.json` + `pnpm-lock.yaml` to the production server, and runs `pnpm install --frozen-lockfile` remotely. Nodemon detects file changes and restarts the Node.js process automatically.

### Python Scripts (Manual)
Individual deploy commands exist for each script:
```bash
pnpm deployMakeExcel
pnpm deployGenerateSpectrograms
pnpm deployGenerateMelograph
# etc. -- see package.json for full list
```

---

## Production Server

### Accessing
```bash
ssh root@137.184.90.119
```

### Server Process
The Node.js server runs in a **tmux session** with **nodemon**:
```bash
tmux ls                    # List sessions
tmux attach -t <session>   # Attach to server session
# NEVER kill or restart the server without explicit permission
```

### File Locations on Server
```
/var/www/html/             # Frontend build output (Nginx serves this)
/root/                     # Server files (server.ts, apiRoutes.ts, etc.)
/root/shared/              # Shared types
/root/node_modules/        # Server dependencies
/root/audioEvents/         # Audio file storage (organized by ID)
/root/spec_data/           # Spectrogram data
/root/melograph_data/      # Melograph data
/root/backups/             # Daily MongoDB backups
/opt/idtap-python/         # Python virtual environment
```

### Backup System
- Daily MongoDB backups via `backup_mongo.py` cron job
- Stored at `/root/backups/YYYY-M-D/swara/`
- Includes all collections as BSON dumps
- See [Database and Storage](09-database-and-storage.md) for restoration procedures

---

## Common Tasks

### Adding a New Trajectory Type
1. Add the archetype function in `src/ts/model/trajectory.ts` (in the `compute()` method)
2. Add the ID to `possibleTrajs` in `src/ts/model/piece.ts` for relevant instruments
3. Update `TrajSelectPanel.vue` to show the new type
4. Add rendering logic in `TranscriptionLayer.vue`
5. Port to Python API: `Python-API/idtap/classes/trajectory.py`
6. Add tests in both TypeScript and Python

### Adding a New Instrument
1. Add to `Instrument` enum in `shared/enums.ts`
2. Create AudioWorklet processor(s) in `src/audioWorklets/`
3. Add synthesis routing in `Synths.vue`
4. Add to `possibleTrajs` in `piece.ts`
5. Update `InstrumentMeta` for display name and color

### Modifying the Database Schema
1. Update TypeScript types in `shared/types.ts`
2. Update model classes in `src/ts/model/`
3. Write a migration script in `python/dataManagement/aggregations/`
4. Handle backward compatibility (old documents may lack new fields)
5. Update `$unset` in `updateTranscription` if removing fields
6. Sync changes to Python API

### Adding a New API Endpoint
1. Add route in `server/server.ts` or `server/apiRoutes.ts`
2. Add corresponding method in `Python-API/idtap/client.py`
3. Add tests for both

---

## Architecture Gotchas

1. **No state management for the editor**: Despite Vuex being present, the editor manages its own state via component-level reactivity. Vuex is only for auth.

2. **TranscriptionLayer is massive**: 8,056 lines. When making changes, search carefully for related code.

3. **Two model implementations**: `src/ts/model/` (clean) vs `src/js/classes.ts` (legacy). Use the clean model. The legacy one is used only by `extract.ts`.

4. **Server is monolithic**: All routes in one file. Search by endpoint name.

5. **Shared types import Vue components**: `shared/types.ts` imports Vue component types for template refs. This creates frontend coupling in the "shared" layer.

6. **AudioWorklets are plain JavaScript**: Not TypeScript. They run on the audio thread and communicate via AudioParams and `port.postMessage`.

7. **Three Python codebases**: Server-side scripts, the Python API package, and they don't share code. Model changes must be synced manually.

8. **Permission field evolution**: Old documents use `"permissions": "Public"` (string). New documents use `"explicitPermissions": { edit: [], view: [], publicView: true }` (object). Both must be handled.

---

## Getting Help

- **Project documentation**: This `docs/project/` directory
- **CLAUDE.md**: Development conventions and rules
- **GitHub Issues**: Feature requests and bug reports at `UCSC-IDTAP/IDTAP`
- **Research papers**: `public/papers/ismir-paper.pdf` and `public/papers/neh-whitepaper.pdf`
- **Python API docs**: `Python-API/CLAUDE.md` and `Python-API/docs/`
