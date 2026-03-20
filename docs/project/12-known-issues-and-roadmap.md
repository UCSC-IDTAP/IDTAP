# Known Issues and Roadmap

This document catalogs the ~105 open GitHub issues (as of March 2026), organized by category and priority, along with architectural recommendations for future development.

---

## Critical and High-Priority Issues

### Security
- **#888** [OPEN] `cloneTranscription` endpoint: missing field assignments, no authentication check, no UUID regeneration -- this is an active security gap that should be addressed immediately

### Bugs Affecting Usability
- **#854** [OPEN] Audio playback crash from ultra-short trajectories
- **#807** [OPEN] Trajectory selection broken after deleting phrase division
- **#844** [OPEN] Left/right arrow keys not working on Windows
- **#550** [OPEN] Playhead stops working after first play/pause
- **#648** [OPEN] Page unresponsiveness after ~25 minutes of transcribing (memory/performance)
- **#628** [OPEN] Resizing window makes transcription info disappear
- **#610** [OPEN] Pressing `p` to adjust pluck doesn't always work
- **#812** [OPEN] Nudging doesn't adhere to meter magnet

### High-Value Missing Features
- **#255** / **#645** [OPEN] **Undo/redo** -- the most frequently requested feature, open since early in the project's history. Would dramatically improve the transcription experience.
- **#837** [OPEN] Extract business logic from UI components into service layer -- important for maintainability
- **#804** [OPEN] Polyphonic Individual Instrumentality technical specs (partially implemented)

---

## Open Issues by Category

### Editor / Trajectory Manipulation (~25 open)

**Core editing:**
- #578 [OPEN] Manipulating multiple trajectories at once
- #546 [OPEN] If two drag dots attached, should move together
- #510 [OPEN] Reduce minimum dragpoint distance for tanas work
- #492 [OPEN] Use key commands to select consonants/vowels
- #385 [OPEN] Slope adjustments for trajectories 1, 4, 5
- #282 [OPEN] Deselect trajectory from multi-select by shift clicking

**New trajectory types:**
- #81 [OPEN] New trajectory: krintin double-slide
- #60 [OPEN] Andolan vs Vibrato distinction
- #92 [OPEN] New archetype: scraping across frets

**Instrument-specific:**
- #620 [OPEN] Sarangi articulation for changing bow direction
- #450 [OPEN] Harmonic/extended technique for sarangi
- #652 [OPEN] Novel way of representing bow intensity
- #263 [OPEN] Drone (harmonium) support
- #287 [OPEN] Code for jora string

### Polyphonic / Multi-String (~3 open)
- #804 [OPEN] Polyphonic Individual Instrumentality technical specs
- #813 [OPEN] Multiple instruments overlay handling
- #287 [OPEN] Code for jora string

### Display / Rendering (~5 open)
- #825 [OPEN] Assemblage display when no audio
- #628 [OPEN] Resizing window makes transcription info disappear
- #612 [OPEN] "Pitch patterns" label in analyzer broken
- #566 [OPEN] Diacritical marks display issues on Windows

### Cross-Platform (~3 open)
- #844 [OPEN] Left/right arrow not working on Windows
- #161 [OPEN] Transposer playback glitches in Windows Chrome
- #646 [OPEN] Login page issue in Brave browser

### Audio/Playback (~3 open)
- #854 [OPEN] Audio playback crash from ultra-short trajectories
- #550 [OPEN] Playhead stops working after first play/pause
- #522 [OPEN] Clipping when recording and synth gains are both up

### Meter (~2 open)
- #812 [OPEN] Nudging doesn't adhere to meter magnet
- #231 [OPEN] Offsetting pulse bug

### Analysis and Visualization (~10 open)
- #616 [OPEN] Analysis: trajectory counting
- #577 [OPEN] Polar coordinate view of cyclical rhythm rubato
- #549 [OPEN] Scrolling for analysis
- #499 [OPEN] Analyzer: multiple tracks
- #403 [OPEN] Morphological Metrics
- #392 [OPEN] Additional Analytics: Permutation Combinations
- #391 [OPEN] Additional Analytics: Measuring articulation length
- #309 [OPEN] Exploratory: producing figures/charts

### UI/UX (~10 open)
- #795 [OPEN] Cluttered screen (UI simplification)
- #630 [OPEN] File menu in editor
- #559 [OPEN] View "published" transcriptions without signing in
- #489 [OPEN] Sharing options for transcriptions
- #468 [OPEN] Add to collection directly from editor
- #464 [OPEN] Waveform display in editor
- #442 [OPEN] Hide permissions decision in new transcription
- #407 [OPEN] Question mark icon throughout app (help system)

### Audio/Recording (~5 open)
- #500 [OPEN] Upload many recordings (batch)
- #295 [OPEN] Add recordings from YouTube
- #52 [OPEN] Add audio formats for upload
- #45 [OPEN] Pitch shifting
- #441 [OPEN] Add "collector/collection source" field

### Notation / Musicology (~8 open)
- #651 [OPEN] Automate representation of repeated swaras
- #595 [OPEN] "Universal" IPA beyond Devanagari
- #579 [OPEN] Conical changes to vibrato
- #435 [OPEN] Provide notes for all raags
- #383 [OPEN] Etic and articulation based phrase markings
- #360 [OPEN] Extended nasalization
- #56 [OPEN] Raag variants

### Research / Data (~5 open)
- #498 [OPEN] Disconnect vowel/consonant track from melodic trajectories
- #482 [OPEN] Octave center of multi-instrument transcriptions
- #433 [OPEN] Family Tree (gharana visualization)
- #345 [OPEN] Label and Filter System
- #288 [OPEN] Transform Dagar Todi sitar to vocal

### Infrastructure (~5 open)
- #880 [OPEN] Modernize Python deployment with uv and Python 3.11+
- #845 [OPEN] Implement tiered backup retention policy
- #835 [OPEN] Comprehensive Test Coverage Expansion Initiative
- #418 [OPEN] Test server (staging environment)
- #95 [OPEN] Deploy all server files via npm

### Documentation (~5 open)
- #197 [OPEN] Update instructions
- #243 [OPEN] Naming, branding for citations
- #283 [OPEN] Code documentation (auto-generate)
- #389 [OPEN] IDTP → IDTAP naming fix
- #135 [OPEN] Update readme

---

## Recurring Problem Areas

### 1. Editor / Trajectory System (~100+ total issues, largest area)
The trajectory editing system spans fundamental interactions (click, drag, selection), specialized types (vibrato, krintin, slides), and articulation markers. Many bugs stem from interaction edge cases, particularly around phrase boundaries and polyphonic string coordination.

### 2. Phrase/Section Division (~20 total issues, including a "Critical" fix)
Section categorization and phrase division operations have been a persistent source of data loss and inconsistency. Issue #826 (categorization data loss) was labeled "Critical" and required multiple PRs to fix.

### 3. Cross-Platform Compatibility (~15 total issues)
Windows and Safari repeatedly surface rendering, scrolling, and keyboard shortcut issues. Several remain open.

### 4. Performance / Memory (~5 issues)
DOM accumulation (#851, closed) and page unresponsiveness (#648, open) indicate the editor struggles with extended sessions or large transcriptions. The recent serialization bloat stripping (#887) addressed data size but not runtime memory.

---

## Architectural Recommendations

### 1. Backend Consolidation (High Impact)

**Current state:** Three separate codebases maintain the same data model:
- TypeScript (frontend + server): `src/ts/model/` + `src/js/classes.ts` + `shared/types.ts`
- Python server scripts: `python/` (uses raw JSON, no model classes)
- Python API package: `Python-API/idtap/classes/` (full model port)

**Problem:** Every model change must be synchronized across all three. The recent serialization stripping (PR #887) required a separate sync spec document (`SERIALIZATION_SYNC_SPEC.md`) and handoff to another developer/AI instance.

**Recommendation:** Consolidate to a **single Python backend** (FastAPI or similar):
- Eliminate TypeScript model duplication
- Enable Python analysis tools to access data directly (no child_process.spawn)
- Simplify deployment to one language/runtime
- The Python API package's data model becomes the canonical model
- The Vue frontend would call the Python API directly

**Migration path:** This is a major undertaking. A phased approach would be:
1. Move server routes from Express to FastAPI one endpoint at a time
2. Use the existing Python data model classes as the canonical model
3. Keep the Vue frontend unchanged (just point API calls at the new backend)
4. Eventually retire `server.ts`, `apiRoutes.ts`, `oauthRoutes.ts`

### 2. Eliminate Dual Model Layer (Medium Impact)

Even without full backend consolidation, the duplicate model in `src/js/classes.ts` (4,165 lines) should be eliminated. The `server/extract.ts` data extraction code should import from `src/ts/model/` directly.

### 3. Editor Component Decomposition (Medium Impact)

`TranscriptionLayer.vue` at 8,056 lines and `EditorComponent.vue` at 2,992 lines are difficult to maintain. Issue #837 proposes extracting business logic into a service layer. Key candidates:
- Drag dot logic → composable function
- Keyboard shortcut handling → composable function
- Trajectory rendering → separate rendering module
- Selection management → separate state module

### 4. Undo/Redo System (High Impact, High Effort)

Issues #255 and #645 request undo/redo. This would require:
- Command pattern or state snapshot system
- Integration with the Piece model's mutation methods
- Careful handling of compound operations (e.g., phrase division affects multiple strings)

### 5. Staging Environment (Medium Impact)

Issue #418 requests a test server. Currently there's no staging -- the only way to test is locally or on production. A staging environment would reduce deployment risk.

### 6. Backup Retention Policy (Low Priority)

Issue #845 proposes tiered backup retention. Currently, daily backups accumulate indefinitely on the server.

---

## Resolved Problem Areas (for historical context)

These areas saw significant issues that have been largely resolved:

- **Safari visual bugs** (#406) -- CSS fixes
- **Section categorization data loss** (#826) -- multi-PR fix in late 2025
- **DOM element accumulation** (#851) -- fixed with proper cleanup
- **Non-supported instruments causing corruption** (#852) -- validation added
- **Download JSON/Excel broken** (#635) -- fixed
- **Logged out users accessing editor** (#411) -- auth check added
