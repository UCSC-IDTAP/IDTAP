# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IDTAP (Interactive Digital Transcription and Analysis Platform) is a web application for transcribing, archiving, and analyzing musical recordings, with a focus on Hindustani music. It features a Vue.js frontend, Node.js/Express backend, Python audio processing components, and MongoDB database.

**Core Philosophy**: Provides an alternative to Western staff notation and MIDI representation, designed to accurately capture the finely calibrated glissandi, microtonal configurations, and expressive nuances found in oral melodic traditions. Uses trajectory-based transcription to avoid the limitations and cultural bias of traditional notation systems.

## Development Commands

### Frontend Development
- `pnpm dev` - Start Vite development server (port 3000)
- `pnpm build` - Build production bundle
- `pnpm serve` - Preview production build
- `pnpm lint` - Run ESLint with auto-fix

### Testing
- `pnpm test` - Run Vitest tests for TypeScript/JavaScript code
- `python -m pytest python/api/tests` - Run Python API tests (requires virtual environment)

### Python Environment Setup
```bash
python -m venv idtp_env
source idtp_env/bin/activate  # On Windows: idtp_env\Scripts\activate
pip install -r porting_requirements.txt
```

### Server Development
- `pnpm buildExtract` - Bundle TypeScript extract module for server
- `pnpm deployTSServer` - Build and deploy server files

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
- **Audio processing**: Spawns Python scripts for pitch extraction, spectrogram generation, and melograph creation
- **Database**: MongoDB with collections for audio recordings, transcriptions, users, musicians, ragas
- **File handling**: Audio upload, processing, and storage management
- **Analysis tools**: Query system for filtering transcriptions, pitch prevalence visualization, pitch pattern analysis

### Python Components
- **API classes**: `python/api/classes/` - Python ports of core TypeScript models
- **Audio processing**: Various scripts for pitch extraction, visualization, data management
- **Testing**: Pytest-based tests in `python/api/tests/`

### Key Concepts
- **Trajectories**: Core musical units representing archetypal paths between pitches, across pitches, or on fixed pitches. These provide a middle-level representation that captures finely calibrated glissandi while avoiding over-granular fundamental frequency data or over-simplified MIDI representation
- **Ragas**: Musical scales with specific tuning ratios and rules, supporting microtonal configurations
- **Assemblages**: Collections of musical phrases organized into strands
- **Multi-instrument support**: Up to 4 overlaid instruments per transcription
- **Articulations**: Instrument-specific performance techniques (plucking, bowing, vocal IPA phonemes)
- **Shrutis**: Microtones or spaces between scale tones
- **Andolans**: Movements between scale tones and microtones

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
- Python components are being ported from TypeScript originals (see `PORTING_README.md`)
- Audio worklets in `src/audioWorklets/` for real-time audio synthesis
- Custom synthesis engines for different instruments:
  - **Sitar**: Karplus-Strong algorithm for plucked strings
  - **Sarangi**: Custom bowed string synthesis with feedback loops and resonant filtering
  - **Vocal**: Klatt formant synthesizer for human speech and vocal timbres
- Supports flexible tuning systems with microtonal adjustments
- Logarithmic frequency scale representation for pitch
- Trajectory-based transcription system designed to avoid Western notation bias