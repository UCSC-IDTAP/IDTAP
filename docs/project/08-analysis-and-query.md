# Analysis and Query Systems

IDTAP includes a sophisticated analysis suite for computational musicology research. This document covers the musical pattern query engine, pitch prevalence analysis, pattern frequency analysis, the data extraction/export pipeline, and the assemblage analysis view.

---

## Musical Pattern Query Engine

**File:** `src/js/query.ts` (1,058 lines)

The `Query` class is a pattern-matching engine that searches within musical transcription data. It operates on a `Piece` object and supports composable, multi-dimensional queries.

### Segmentation Modes

How the transcription is sliced for searching:

| Mode | Description |
|------|-------------|
| `phrase` | User-defined phrase boundaries (the musicologist's segmentation) |
| `group` | Sub-phrase groupings (adjacent trajectories marked as a group) |
| `sequenceOfTrajectories` | Fixed-length sliding windows of N consecutive trajectories |
| `connectedSequenceOfTrajectories` | Sequences split at silences, searching within connected melodic fragments |

### Query Categories

What musical attribute to search for:

| Category | Description |
|----------|-------------|
| `pitch` | Single pitch presence (by numbered pitch encoding swara + octave) |
| `trajectoryID` | Trajectory shape type (Fixed, Bend, Krintin, Slide, Vibrato, etc.) |
| `pitchSequenceStrict` | Exact contiguous pitch sequence matching |
| `pitchSequenceLoose` | Subsequence matching (elements in order but not necessarily contiguous) |
| `trajSequenceStrict` / `trajSequenceLoose` | Same strict/loose matching for trajectory-type sequences |
| `vowel` | Vowel phoneme matching (vocal instruments) |
| `startingConsonant` / `endingConsonant` / `anyConsonant` | Consonant phoneme matching |
| `sectionTopLevel` | Section type filter (Pre-Chiz Alap, Alap, Composition, Improvisation, Other) |
| `alapSection` / `compType` / `compSecTempo` / `tala` | Deeper section categorization filters |
| `phraseType` / `elaborationType` / `vocalArtType` / `instArtType` / `incidental` | Phrase-level label filters |

### Designators

| Designator | Description |
|------------|-------------|
| `includes` | The segment contains the specified element |
| `excludes` | The segment does not contain it |
| `startsWith` | The segment begins with it |
| `endsWith` | The segment ends with it |

### Multiple Query Composition

`Query.multiple()` combines an array of queries with boolean logic:
- **`every: true`** (AND): Only segments matching ALL queries are returned (set intersection)
- **`every: false`** (OR): Segments matching ANY query are returned (set union)
- Duration filtering via `minDur` / `maxDur` (in seconds)

### Query Results

Each result includes: title (human-readable location like "Phrase 5 Traj 2-8"), start/end times, duration, the matched trajectories, and an identifier.

### Query Persistence

Queries can be saved to and loaded from the server via `saveMultiQuery` / `loadQueries`, enabling researchers to bookmark and share complex search configurations.

### Query Controls UI

**File:** `src/comps/analysis/QueryControls.vue`

The full query builder provides:
- Segmentation selection, query count (multiple queries with Every/Some logic)
- Duration filters (min/max), Common Pitch Range toggle
- Per-query: category selection, designator, and category-specific parameter inputs
- Save/Load query persistence (server-backed)
- Download results as ZIP of PNG images

---

## Pitch Prevalence Analysis

**Files:** `src/comps/analysis/PitchPrevalence.vue`, `src/js/analysis.ts`

Answers: "What percentage of time is spent on each pitch across different segments of a performance?"

### Segmentation Modes
- **Section**: Each formal section of the performance
- **Phrase**: Each phrase (with rich filtering by section type, phrase type, elaboration, articulation)
- **Duration**: Fixed-duration time windows (configurable, e.g., 30 seconds)

### Pitch Representation Modes
- **Fixed Pitch**: Duration of time at each fixed pitch level
- **Pitch Onsets**: Duration attributed to pitch onsets only, collapsing repeated pitches. Uses a "fade time" parameter: silences shorter than `fadeTime` are absorbed into the preceding pitch's duration.

### Display Options
- **Pitch Chroma**: Collapse octaves (mod 12)
- **Condensed**: Use the raga's scale degrees instead of chromatic pitch numbers. This is the **emic** mode -- analyzing the music using the raga's own pitch space rather than imposing 12-TET chromatic categories.
- **Heatmap**: Black-to-white gradient encoding percentage values

### Visualization
D3.js SVG charts with:
- Y-axis: Sargam labels with octave indicators
- X-axis: Segments with metadata (section number, start time, duration, section type, phrase type, elaboration)
- Percentage values inside grid cells
- Mode (most prevalent pitch) highlighted
- Horizontal octave boundary lines
- Responsive layout with frozen Y-axis and horizontally scrollable content

### Phrase-Level Filtering
When using Phrase segmentation, include/exclude by:
- Phrase type (Mohra, Tan, Tihae, etc.)
- Elaboration type
- Articulation type
- Incidental type (Tuning, etc.)
- Section type

---

## Pattern Frequency Analysis

**File:** `src/js/analysis.ts` (`patternCounter` function)

Finds all recurring pitch patterns of specified sizes across a transcription.

### Algorithm
1. Extracts pitch sequences from trajectories
2. Removes adjacent duplicates (unless re-articulated)
3. Absorbs short silences (below `maxLagTime`) while long silences reset the pattern window
4. Uses a sliding window to build a trie-like nested dictionary of pattern occurrences
5. Flattens the trie to produce `{ pattern, count }` objects sorted by frequency

### Configuration
- **Pattern sizes**: 2-10, multiple sizes simultaneously
- **Target pitch**: Filter patterns ending on a specific pitch
- **Minimum count threshold**: Filter out infrequent patterns
- **Pitch Chroma**: Search in octave-collapsed space
- **Fade Time**: Max silence duration before pattern breaks

### Visualization
D3.js SVG with:
- Each pattern size in its own column group
- Color-coded pitch cells (12 distinct colors mapped to chroma values)
- Optional melodic contour plots underneath each pattern
- Segmentation by Section, Phrase, Duration, or full Transcription

---

## DN_Extractor Data Extraction Pipeline

**File:** `server/extract.ts` (1,046 lines)

The `DN_Extractor` (named for PI Dard Neuman) is a server-side data extraction and Excel export system.

### Segmentation Methods

| Method | Description |
|--------|-------------|
| UserDefined | Phrases as marked by the transcriber |
| Silence | Split at silent trajectories (id 12) |
| Chikari | Split at chikari strokes (Sitar-only) |
| MelodicDiscontinuity | Split where ending pitch differs from next starting pitch |

### Pitch Representations

Chroma, PitchNumber, SargamLetter, OctavedSargamLetter, ScaleDegree, OctavedScaleDegree

### Novel Analysis: Back-Propagated Ending Analysis

The `backPropagatedFromEndsPitchSubSegments` property implements a novel analytical technique:
1. Groups segments by their shared ending pitch patterns
2. Works **backward** from the ending sequence
3. Recursively splits the preceding pitches at repetition points
4. Reveals the internal structure of melodic phrases relative to their cadential patterns

This is particularly useful for studying how Hindustani melodic phrases converge on characteristic ending formulas.

### Excel Export

The `createWorkbook` method generates multi-sheet Excel files via ExcelJS:

1. **Segments separated**: One pitch per cell, left-aligned
2. **Segments separated end aligned**: Right-aligned so endings line up
3. **Segments combined**: All pitches in a single comma-separated cell
4. **Ending Sequences**: Segments grouped by shared ending pattern, with vertical separator marking the ending
5. **Aligned Segmented Ending Sequences with Inserts**: Back-propagated sub-segments with alignment

Each sheet includes boilerplate: Soloist, Raag, Transcription ID (with hyperlink), Segmentation Method, Pitch Representation.

### Legacy Excel Export

**File:** `python/cleanJson/make_excel.py`

An older, more granular export using `xlsxwriter` that generates raw-data spreadsheets directly from MongoDB, including per-trajectory details (id, name, duration, articulations, pitches, chikari timings).

### UI

**File:** `src/comps/analysis/ExcelDatasets.vue`

Admin-only interface for configuring DN_Extractor parameters (pitch representation, segmentation method, end sequence length) and downloading results.

---

## Segment Display

**File:** `src/comps/analysis/SegmentDisplay.vue`

A D3.js SVG renderer for individual query result segments:
- Melodic trajectory curves with time on X-axis and log-frequency on Y-axis
- Sargam pitch reference lines with octave-aware styling
- Articulation markers: pluck (triangle), hammer-on/off (arrowed lines), slide (vertical arrow), dampen (bracket), consonant (diamond)
- Vowel/consonant phoneme labels (Latin, IPA, or Devanagari)
- Polyphonic support: renders second-string trajectories for Sitar and Sarangi
- Right-click context menu: Open in Editor, Open in new tab, Download Image
- Click-to-play audio playback (in AssemblageDisplay context)

---

## Assemblage Analysis

**Files:** `src/ts/model/assemblage.ts`, `src/comps/analysis/AssemblageDisplay.vue`

Enables comparative musicological analysis by organizing phrases into named "strands."

### Display
- **Column layout**: Each strand gets a vertical column
- **Rows**: Phrase indices -- if a strand contains a phrase at a given index, a SegmentDisplay is rendered; empty cells otherwise
- **Shared pitch range**: Computed across all strands for visual comparability
- **Audio**: Supports click-to-play individual phrases and sequential strand playback with cross-fade and auto-scrolling
- **Browser detection**: Safari gets MP3, others get Opus

### Use Cases
- Identifying recurring melodic motifs across a performance
- Comparing phrase structure between sections
- Documenting motivic development patterns
- Studying how specific melodic gestures are varied and transformed

---

## Python API Query Parity

**File:** `Python-API/idtap/query.py` (~40KB)

The Python API mirrors the TypeScript query system with exact behavioral compatibility:
- Same segmentation types, category types, designator types
- Same validation logic, filter execution, duration filtering
- Python enums and structured types
- Utility functions in `sequence_utils.py`

This enables researchers to run the same queries programmatically in Python notebooks that they can run interactively in the web UI.

---

## What Makes This Analysis Suite Unique

1. **Emic pitch representation**: The "condensed" mode analyzes music using the raga's own scale degrees rather than 12-TET chromatic pitch, respecting the theoretical framework of the music being studied.

2. **Continuous trajectory model**: Unlike MIDI-based systems, trajectories encode continuous pitch curves with 14 shape types, capturing the ornamental vocabulary of Indian music.

3. **Multi-dimensional query composition**: Combining content queries (pitch, trajectory shape), formal structure queries (section type, phrase type), and phonemic queries (vowel, consonant) in a single Boolean system.

4. **Back-propagation ending analysis**: A novel technique for studying cadential patterns by working backward from endings and recursively splitting at pitch repetitions.

5. **Chikari-based segmentation**: Using drone string articulation patterns as segment boundaries -- derived from performance practice rather than imposed externally.

6. **Assemblage strand analysis**: Visual comparative framework with synchronized audio playback for identifying structural patterns.

7. **Cross-platform parity**: TypeScript and Python implementations maintain exact behavioral compatibility.

---

## Key Files

| Component | Path |
|-----------|------|
| Query engine | `src/js/query.ts` |
| Analysis functions | `src/js/analysis.ts` |
| Pitch Prevalence UI | `src/comps/analysis/PitchPrevalence.vue` |
| Query Controls UI | `src/comps/analysis/QueryControls.vue` |
| Segment Display | `src/comps/analysis/SegmentDisplay.vue` |
| Assemblage Display | `src/comps/analysis/AssemblageDisplay.vue` |
| Excel Datasets UI | `src/comps/analysis/ExcelDatasets.vue` |
| DN_Extractor | `server/extract.ts` |
| Legacy Excel export | `python/cleanJson/make_excel.py` |
| Python query engine | `Python-API/idtap/query.py` |
