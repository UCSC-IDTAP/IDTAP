# Development History

IDTAP's codebase spans **4,010 commits** over 3.5 years (August 2022 -- March 2026), with approximately **890 pull requests** merged. The project was developed almost entirely by a single developer (Jonathan Myers, ~95% of commits), with 8 commits from a student contributor and automated changelog generation accounting for the remainder.

This document traces the major phases of development chronologically.

---

## Phase 1: Prototype and Foundation (Aug -- Oct 2022)

**First commit:** August 18, 2022

The project began as a Vue 3 + Vite application with rapid prototyping of core musical transcription features:

- Custom audio player built within days of initial commit
- Chikari (drone string) editing: add, delete, save
- Region box and looping for audio playback
- **Trajectory morphing** -- the first implementation of the continuous melodic contour system that would become the heart of the application (September 30, 2022)
- Phrase divisions for segmenting transcriptions
- Google OAuth integration (PR #5)
- MongoDB integration for audio events and transcription persistence
- Lazy loading to manage dist chunk sizes

Early development used casual commit messages ("current", "working on it") and was driven by rapid iteration rather than formal processes.

## Phase 2: Core Editor Buildout (Nov 2022 -- Feb 2023)

Intense feature development established the transcription editor's fundamental capabilities:

- **Spectrogram layer integration** -- Python-generated spectrograms displayed alongside transcriptions, enabling spectrogram-guided transcription workflow
- **Melograph generation** -- melodic contour analysis via Essentia's pitch tracking
- **Permissions system** -- public/private visibility with explicit edit/view permissions
- **MongoDB backup system** (PR #85) -- automated daily backups, a system still in use today
- **Vibrato trajectories** -- adding vibrato as a trajectory type with configurable periods, extent, and direction
- **Phrase navigation** -- Tab/Shift+Tab to move between phrases; phrase index in URL for deep linking
- Clone transcription functionality
- Pitch class system and raga editor foundations
- Instructions tab for in-app documentation

## Phase 3: Multi-Track and Instrumentation (Mar -- May 2023)

A major architectural leap from single-track to multi-track transcription:

- **`trajectories` to `trajectoryGrid[0]` refactor** (March 2, 2023) -- this single architectural change laid the groundwork for both multi-track and later polyphonic support. The flat trajectory array became a 2D grid indexed by string, and phrases became containers for multiple trajectory timelines.
- **Instrumentation system** -- trajectory types tied to specific instruments (Sitar, Sarangi, Vocal)
- **Vowels and consonants** for vocal trajectories with multi-script support (IPA, Devanagari, English transliteration)
- **Karplus-Strong synthesis engine** -- physical modeling of plucked sitar strings via AudioWorklet
- **Klatt vocal synthesizer** -- full formant synthesis for vocal tracks
- **Sarangi physical modeling** -- bowed-string synthesis with body resonance modeling
- **Pitch prevalence analysis** and pitch frequency graphs
- Octave shift functionality

## Phase 4: Analysis, Tempo, and TypeScript Port (Jun -- Sep 2023)

- **TypeScript port initiated** -- a long-running effort to migrate the codebase from JavaScript to TypeScript with strict mode
- **Pulse/tempo system** -- meter entry, pulse visualization, tempo tracking for Indian tala cycles
- Instrument synthesis refinements -- "reset audio" button, fallback mechanisms
- **Analysis visualization** -- segment visualization, strict/loose pitch sequence matching for musical pattern queries
- **Sargam notation rendering** -- Indian musical notation (Sa, Re, Ga, etc.) overlaid on trajectories
- **MIDI export** capabilities
- Melograph overlay system
- Landing page design
- First security fixes

## Phase 5: Collections and Maturation (Oct 2023 -- Jan 2024)

- **Collections system** (PR #382) -- user-created collections of transcriptions and recordings, with permission inheritance
- Raga editor improvements
- **Section categorization system** -- structured taxonomy covering Dhrupad, Bandish, Thumri, and other performance practice categories
- Critical bug fixes (infinite loop on new transcriptions, database recovery scripts)
- Permission system refinements -- self-assignment of editor/viewer roles

## Phase 6: Python API and Data Architecture (Feb -- May 2024)

- **Python Pitch class** implemented by Shreyas Anand (February 2024) -- the first non-Myers code contribution
- **Python Raga class** methods
- **Filterable table component** (PR #429) -- search, sort, drag/resize columns for the transcription and recording management interfaces
- **Soloist metadata** added to the transcription model
- **Excel export system** -- `make_excel.py` and `extract.ts` for structured data export (the "DN Extractor", named after PI Dard Neuman)
- **Gharana database** -- musical lineage tracking for musicians
- **esbuild integration** for server compilation

## Phase 7: Editor Rewrite and D3 Visualization (Jun -- Oct 2024)

A massive rewrite of the editor's rendering architecture:

- **Canvas/SVG hybrid rendering overhaul** -- moving from direct DOM manipulation to D3.js data-driven rendering
- **D3.js integration** for trajectory drawing, interaction, and data binding
- **Sargam lines** -- visual reference lines for scale degree positions
- **Drag dot system** -- interactive control points for manipulating trajectory anchor points with smoothed animation
- **Layer system redesign** -- transcription, spectrogram, and melograph as composable, independently scrollable layers
- **Dampen controls** and per-string volume control
- **Chikari reimplementation** with raga-derived tuning
- **Tooltip system** for trajectory metadata
- **Performance optimizations** -- drag dots on every other animation frame, lazy loading via IntersectionObserver with bidirectional preloading and unloading

## Phase 8: CI/CD, Automation, and Annotations (Nov 2024 -- Apr 2025)

The project matured operationally and moved from the `jon-myers` personal GitHub organization to `UCSC-IDTAP`:

- **Conventional commits** adopted (`feat:`, `fix:`, `chore:`) enabling automated changelog generation
- **Automated changelog** via GitHub Actions
- **Automated frontend deployment** -- pushes to main trigger Vite build and rsync to the production server
- **Collection invitations** system for sharing
- **Permission-denied redirect** for unauthorized access attempts
- **Custom annotation system** (PR #600) -- user annotations on phrases and trajectories
- Scrolling throttle for performance

## Phase 9: Assemblage, Python API, and Test Coverage (May -- Jul 2025)

- **Assemblage editor** (PR #644) -- a novel analytical tool for grouping phrases into named "strands" to express cross-cutting musical relationships (motivic patterns, structural parallels)
- **Statistics gathering** for grant proposals
- **Massive test coverage campaign** -- dozens of PRs (PRs #682-#782+) adding unit tests for Pitch, Trajectory, Raga, Articulation, Piece, Group, Automation, Meter, and more. This was the first major use of AI-assisted development (Codex), dramatically increasing test coverage.
- **Python API client** -- full data model port to Python, published as `idtap-api` on PyPI
- **Sarangi bowed-string model redesign**
- Python test suite mirroring TypeScript tests

## Phase 10: Research Integration and OAuth (Aug -- Oct 2025)

- **ISMIR 2025 paper** and **NEH whitepaper** linked from landing page
- **Timing display toggle** -- switch between excerpt time and real (absolute) time
- **Claude PR review** workflow added for AI-assisted code review
- **Pulse-based `getMusicalTime()`** -- converts wall-clock time to tala-relative position (cycle number, hierarchical beat position)
- **OAuth 2.0 authorization** for Python API clients with JWT token exchange
- **Research waiver system** -- consent tracking required for programmatic API access
- **Polyphonic Individual Instrumentality** (PR #804 and related) -- dual-string support for Sitar (main + jor string) and Sarangi (main + second string), including:
  - String-indexed trajectory grids
  - Automatic silent trajectory synchronization
  - Cross-string coordination for phrase divisions
  - String-aware editing operations
  - Separate AudioWorklet nodes per string with mixed output
  - Visual differentiation (darker color, thinner stroke for second string)

## Phase 11: Meter System and Query Navigation (Nov -- Dec 2025)

- **Tala-based meter system** -- default to Tintal, vibhag/matra layer naming, 14 preset talas
- **Pulse tap recording** -- tap along with audio to record tempo, with configurable tap-to-beat subdivision
- **Metronome** with vibhag-distinguished sounds (woodblock synthesis with pitch/amplitude differentiation)
- **Audio output latency compensation** in pulse detection
- **Query parameter navigation** -- `?t=`, `?pIdx=`, `?inst=` URL params for deep linking to specific positions in a transcription

## Phase 12: Optimization and Maintenance (Jan -- Mar 2026)

- **Security updates** -- regular dependabot fixes for CVEs in dependencies (axios, vite, fast-xml-parser, urllib3, qs)
- **Python modernization** -- Python 3.11 with uv-managed virtual environment, comprehensive Python test suite
- Legacy Pipfile removal
- **Chikari raga derivation** -- chikari pitches derived from raga's rule set instead of hardcoded intervals
- **Serialization bloat stripping** -- removing redundant fields from Pitch, Trajectory, Phrase, and Piece serialization to reduce MongoDB document sizes
- **Python API serialization sync** to match the stripped format
- **Deploy script improvements** -- server lockfile sync and remote `pnpm install`

---

## Development Patterns and Evolution

### Commit Style
Early commits used casual messages ("current", "fixed"). By late 2024, conventional commit format (`feat:`, `fix:`, `chore:`) was adopted, enabling automated changelog generation and semantic versioning.

### AI-Assisted Development
Starting mid-2025, AI tools became integral to development:
- **Codex** generated dozens of test-writing PRs, dramatically increasing coverage
- **Claude** integration for PR review (GitHub Actions workflow) and development assistance
- The Python API client was partially AI-generated

### Single-Developer Project
Jon Myers authored approximately 95% of all 4,010 commits. The 209 bot-generated changelog commits and 8 student contributions (Python Pitch and Raga classes) account for the remainder. This is a remarkably ambitious scope for a single developer -- a full-stack web application with custom DSP synthesis engines, D3-based visualization, a domain-specific data model, Python analysis pipelines, a PyPI package, CI/CD automation, and production deployment infrastructure.

### No Version Tags
The project tracks progress through PR numbers (currently at #890) rather than semantic version releases. The Python API package uses semantic versioning (v0.1.43 as of March 2026).

### Continuous Deployment
The project moved from manual deployments to automated GitHub Actions deployment by early 2025. Frontend changes pushed to main trigger automatic build and rsync to the production server. Backend deployment remains manual via `pnpm deployTSServer`.
