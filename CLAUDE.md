# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IDTAP (Interactive Digital Transcription and Analysis Platform) is a web application for transcribing, archiving, and analyzing musical recordings, with a focus on Hindustani music. It features a Vue.js frontend, Node.js/Express backend, Python audio processing components, and MongoDB database.

## Development Commands

### Frontend Development
- `npm run dev` - Start Vite development server (port 3000)
- `npm run build` - Build production bundle
- `npm run serve` - Preview production build
- `npm run lint` - Run ESLint with auto-fix

### Testing
- `npm test` - Run Vitest tests for TypeScript/JavaScript code
- `python -m pytest python/api/tests` - Run Python API tests (requires virtual environment)

### Python Environment Setup
```bash
python -m venv idtp_env
source idtp_env/bin/activate  # On Windows: idtp_env\Scripts\activate
pip install -r porting_requirements.txt
```

### Server Development
- `npm run buildExtract` - Bundle TypeScript extract module for server
- `npm run deployTSServer` - Build and deploy server files

## Architecture

### Frontend (Vue.js + TypeScript)
- **Entry point**: `src/main.ts` - Sets up Vue app with Vuex store, router, and global plugins
- **Components**: Organized in `src/comps/` by feature area:
  - `editor/` - Musical transcription editor with trajectory-based notation
  - `analysis/` - Data analysis tools and visualizations  
  - `audioRecordings/` - Audio upload and playback components
  - `collections/` - User collection management
  - `files/` - File management and piece registration
- **Model layer**: `src/ts/model/` - Core musical data structures (Pitch, Trajectory, Phrase, Raga, etc.)
- **Shared types**: `shared/types.ts` - Complex type definitions shared between frontend and backend

### Backend (Node.js/Express)
- **Server**: `server/server.ts` - Main Express server with MongoDB integration
- **Audio processing**: Spawns Python scripts for audio analysis and visualization
- **Database**: MongoDB with collections for audio recordings, transcriptions, users
- **File handling**: Audio upload, processing, and storage management

### Python Components
- **API classes**: `python/api/classes/` - Python ports of core TypeScript models
- **Audio processing**: Various scripts for pitch extraction, visualization, data management
- **Testing**: Pytest-based tests in `python/api/tests/`

### Key Concepts
- **Trajectories**: Core musical units representing melodic contours between pitches
- **Ragas**: Musical scales with specific tuning ratios and rules
- **Assemblages**: Collections of musical phrases organized into strands
- **Multi-instrument support**: Up to 4 overlaid instruments per transcription

## Path Aliases
- `@/` → `./src/`
- `@shared/` → `./shared/`
- `@model/` → `./src/ts/model/`

## Testing Strategy
- Vitest for frontend TypeScript/JavaScript unit tests
- Pytest for Python API components
- Test files located in `src/js/tests/` and `src/ts/tests/` for frontend, `python/api/tests/` for backend

## Development Notes
- Project uses Vite for fast development builds
- ESLint configured for Vue 3 + TypeScript
- Python components are being ported from TypeScript originals
- Audio worklets in `src/audioWorklets/` for real-time audio synthesis
- Custom synthesis engines for different instruments (sitar, sarangi, vocal)