# Domain Model

IDTAP's data model is a deeply domain-specific hierarchy for representing Indian classical music. It maps to the three-layer analytical framework described in the NEH whitepaper: **Framework Objects** (Raga, Meter), **Elemental Musical Objects** (Pitch, Articulation, Automation), and **Formal-Temporal Objects** (Trajectory, Phrase, Section, Piece).

---

## Hierarchy Overview

```
Piece
├── Raga (melodic framework)
├── Meter[] (rhythmic framework)
├── phraseGrid: Phrase[][] (indexed by instrument track)
│   └── Phrase
│       ├── trajectoryGrid: Trajectory[][] (indexed by string)
│       │   └── Trajectory
│       │       ├── Pitch[] (anchor pitches)
│       │       ├── Articulation{} (keyed by time position)
│       │       ├── Automation (volume envelope)
│       │       └── vibObj (vibrato parameters)
│       ├── chikariGrid: Chikari{}[] (drone string events)
│       ├── groupsGrid: Group[][] (copy/paste units)
│       └── categorizationGrid (phrase-level labels)
├── assemblageDescriptors: AssemblageDescriptor[]
│   └── Assemblage (reconstructed on demand)
│       └── Strand[] (named phrase groupings)
└── instrumentation: Instrument[]
```

---

## Piece

**File:** `src/ts/model/piece.ts`

The top-level container representing a complete musical transcription. Holds metadata (title, dates, permissions, audio references) and the core musical data organized in grids indexed by instrument track.

| Field | Type | Description |
|-------|------|-------------|
| `phraseGrid` | `Phrase[][]` | 2D: track index → ordered phrases |
| `durArrayGrid` | `number[][]` | Proportional phrase durations per track |
| `sectionCatGrid` | `SecCatType[][]` | Hierarchical section categorization |
| `assemblageDescriptors` | `AssemblageDescriptor[]` | Lightweight serializable assemblage pointers |
| `meters` | `Meter[]` | Rhythmic structures overlaid on performance |
| `instrumentation` | `Instrument[]` | Which instruments occupy which track indices |
| `raga` | `Raga` | The melodic framework for the transcription |

The `phrases` and `durArray` getters are aliases for `phraseGrid[0]`, maintaining backward compatibility with single-track code. The computed `sectionStartsGrid` is derived from `phrase.isSectionStart` flags rather than stored separately (legacy field migration).

**Instrument-specific trajectory availability** (`possibleTrajs`):
- Sitar: All 14 trajectory types (0-13)
- Vocal: Lacks krintin/slide types (7-11)
- Harmonium: Limited to fixed and vibrato (0, 12, 13)

---

## Phrase

**File:** `src/ts/model/phrase.ts`

A musically meaningful segment containing melodic content, drone events, and analytical metadata.

| Field | Type | Description |
|-------|------|-------------|
| `trajectoryGrid` | `Trajectory[][]` | Index 0 = main string, index 1 = second string |
| `chikariGrid` | `{[key: string]: Chikari}[]` | Chikari strokes per string, keyed by time offset |
| `groupsGrid` | `Group[][]` | Adjacent trajectory groups per string |
| `categorizationGrid` | `PhraseCatType[]` | Per-string phrase labels |
| `adHocCategorizationGrid` | `string[]` | Free-form labels |
| `durTot` | `number` | Total duration (max across all strings) |
| `durArray` | `number[]` | Proportional sub-durations for each trajectory |
| `isSectionStart` | `boolean` | Marks beginning of a new section |

**Phrase categorization taxonomy:**
- Structural: Mohra, Mukra, Asthai, Antara, Sanchari, Abhog
- Elaboration: Vistar (slow exploration), Barhat (ascending development), Tan (fast melodic run), Tihai (rhythmic cadence pattern)
- Vocal articulation types

**Duration calculation:** `durTotFromTrajectories()` takes the maximum duration across all strings. `assignStartTimes()` independently calculates timing for each string's trajectory sequence.

**Consolidation:** `consolidateSilentTrajs()` merges consecutive silent trajectories on both strings. `consolidateContinuousTrajectories()` merges consecutive fixed-pitch trajectories on string 2 that share the same pitch and lack initial pluck articulations.

---

## Trajectory

**File:** `src/ts/model/trajectory.ts`

The atomic melodic unit -- a continuous pitch gesture with a specific archetype shape and duration. This is the fundamental innovation of IDTAP: rather than discrete notes, music is represented as typed melodic motions.

### The 14 Trajectory Archetypes

| ID | Name | Pitches | Description |
|----|------|---------|-------------|
| 0 | Fixed | 1 | Sustained pitch (constant frequency) |
| 1 | Bend: Simple | 2 | Smooth pitch transition (half-cosine interpolation) |
| 2 | Bend: Sloped Start | 2 | Quick departure, asymptotic arrival: `(a-b)(1-x)^slope + b` |
| 3 | Bend: Sloped End | 2 | Slow departure, quick arrival: `(b-a)x^slope + a` |
| 4 | Bend: Ladle | 3 | Scoop-shaped: quick bend then smooth return |
| 5 | Bend: Reverse Ladle | 3 | Setup-shaped: smooth approach then quick departure |
| 6 | Bend: Yoyo | N | Series of smooth bends through N pitches |
| 7 | Krintin | 2 | Hammer articulation (step function between pitches) |
| 8 | Krintin Slide | 3 | Three-pitch sequence (hammer-off, slide) |
| 9 | Krintin Slide Hammer | 4 | Four-pitch ornamental sequence |
| 10 | Dense Krintin Slide Hammer | 6 | Six-pitch ornamental figure |
| 11 | Slide | 2+ | Glide between pitches (same as id7 but with slide articulation) |
| 12 | Silent | 0 | Rest/silence |
| 13 | Vibrato | 1 | Oscillating pitch (cosine wave with configurable parameters) |

The `compute(x)` method evaluates the archetype function at normalized position `x ∈ [0,1]`, returning a frequency. IDs 2-5 use the `slope` exponent parameter for curvature control.

### Other Trajectory Fields

| Field | Type | Description |
|-------|------|-------------|
| `durTot` | `number` | Duration in seconds |
| `durArray` | `number[]` | Proportional sub-durations for multi-pitch archetypes |
| `slope` | `number` | Curvature exponent for sloped bends |
| `articulations` | `{[key: string]: Articulation}` | Keyed by normalized time ("0.00", "1.00") |
| `vibObj` | `VibObjType` | Vibrato: periods, extent, direction, vertical offset |
| `automation` | `Automation` | Volume envelope (DAW-style breakpoint) |
| `groupId` | `string` | Reference to parent Group |
| `uniqueId` | `string` | UUID for cross-referencing |
| `vowel` | `string` | Vowel annotation (ISO 15919) |
| `startConsonant` / `endConsonant` | `string` | Consonant annotations |
| `tags` | `string[]` | User-defined tags |

---

## Pitch

**File:** `src/ts/model/pitch.ts`

A single pitch point defined in the sargam (Indian solfege) system.

| Field | Type | Description |
|-------|------|-------------|
| `swara` | `number` | Scale degree 0-6 (Sa, Re, Ga, Ma, Pa, Dha, Ni) |
| `raised` | `boolean` | Sharp/natural variant (Komal vs Suddha; Tivra for Ma) |
| `oct` | `number` | Octave offset from center Sa |
| `fundamental` | `number` | Hz of center Sa (default 261.63) |
| `ratios` | `(number\|number[])[]` | 7-element tuning array |
| `logOffset` | `number` | Microtonal deviation in log2 units |

**Frequency calculation:** `ratio * fundamental * 2^oct * 2^logOffset`

**Display representations:**
- **Sargam**: S R G M P D N (case indicates raised/lowered)
- **Solfege**: Do Re Mi Fa Sol La Ti
- **Western pitch**: C D E F G A B
- **Pitch number**: MIDI-like integer centered on 0

The `numberedPitch` getter returns a linear integer representation where Sa=0 and each semitone is 1, allowing arithmetic operations on pitch intervals.

---

## Raga

**File:** `src/ts/model/raga.ts`

The melodic framework defining which pitches are available and how they are tuned.

### Rule Set
Defines which pitches exist in the raga. Sa and Pa are boolean (present/absent; Sa is always true). The five variable degrees (Re, Ga, Ma, Dha, Ni) each have `{ lowered: boolean, raised: boolean }`:

```
Example (Yaman): All raised, no lowered → Sa, Re♯, Ga♯, Ma♯, Pa, Dha♯, Ni♯
Example (Bhairavi): All lowered, no raised → Sa, Re♭, Ga♭, Ma, Pa, Dha♭, Ni♭
```

### Tuning
Frequency ratios for each pitch relative to the fundamental. Default is 12-TET (`2^(n/12)`). Each degree has either a single ratio (Sa, Pa) or a `{ lowered, raised }` pair. Ratios can be customized per-transcription for just intonation or performer-specific tuning.

The `stratifiedRatios` getter converts tuning into the 7-element array format expected by Pitch constructors.

### Key Operations
- `getPitches({ low, high })`: Generates all Pitch objects within a frequency range
- `pitchFromLogFreq(logFreq)`: Quantizes continuous log-frequency to nearest raga pitch, storing microtonal remainder in `logOffset`
- `chikariPitches`: Returns 4-element array [Sa(oct2), Sa(oct1), Pa-or-null, Ga-or-null], with Pa/Ga inclusion conditional on raga membership

---

## Meter / Tala System

**File:** `src/js/meter.ts` (2,629 lines)

A hierarchical pulse structure system modeling Indian rhythmic cycles (tala).

### Three-Tier Structure

1. **Pulse**: A single time point with `realTime` (seconds), `corporeal` flag (visible/active vs placeholder), and `affiliations` to PulseStructures

2. **PulseStructure**: Evenly-spaced group of Pulses at a given tempo. Characterized by `tempo` (BPM), `size`, `pulseDur`, and `layer` (hierarchy depth). Supports `proportionalOffsets` for micro-timing (rubato)

3. **Meter**: Top-level container defined by a `hierarchy` array, parameterized by `startTime`, `tempo`, and `repetitions` (number of tala cycles)

### Hierarchy Specification

```
[4, 4]       → 2 layers: 4 beats at layer 0, subdivided into 4 (16 total)
[[4,4,4,4],4] → layer 0 has 4 vibhags of size 4 = 16 matras; layer 1 subdivides into 4
```

### Tala Presets (14 standard)

| Tala | Structure | Vibhaga |
|------|-----------|---------|
| Tintal | [4,4,4,4] | X 2 O 3 |
| Ektal | [2,2,2,2,2,2] | X O 2 O 3 4 |
| Jhaptal | [2,3,2,3] | X 2 O 3 |
| Rupak | [3,2,2] | X 2 3 |
| Keherwa | [4,4] | Simple |
| Dadra | [3,3] | X 2 |
| Plus 8 others | ... | ... |

Vibhaga markings: X = sam (first beat), O = khali (empty), numbers = tali positions.

### Musical Time

```typescript
interface MusicalTime {
  cycleNumber: number;
  hierarchicalPosition: number[];  // index at each layer
  fractionalBeat: number;          // sub-pulse position
}
```

### Key Operations
- `growCycle()` / `shrinkCycle()`: Add/remove tala cycle repetitions
- `addTimePoints()`: Extend by tapping real-time positions (tap-to-pulse)
- `adjustProportionalOffsets()`: Micro-timing for rubato
- `limitRelTemporalCorporeality()`: Hide pulses before/after time boundary

---

## Assemblage System

**Files:** `src/ts/model/assemblage.ts`, `src/comps/editor/AssemblageEditor.vue`, `src/comps/analysis/AssemblageDisplay.vue`

### What Problem It Solves

An Assemblage groups selected phrases into named categories called **Strands**. This solves the problem of cross-cutting analytical concerns: a transcription may contain recurring melodic patterns, motivic relationships, or structural parallels that don't map to the linear phrase/section hierarchy. Assemblages let researchers tag arbitrary phrases with semantic labels to express relationships like "these five non-contiguous phrases share the same motivic kernel."

### Architecture

```typescript
Assemblage {
  phrases: Phrase[]          // all phrases in this assemblage
  strands: Strand[]          // named groupings
  instrument: Instrument     // which track
  name: string
  id: string
}

Strand {
  label: string
  phraseIDs: string[]        // UUID references, resolved lazily
}
```

Phrases can also be "loose" -- belonging to the assemblage but not assigned to any strand.

### Serialization

Assemblages are NOT stored directly in the Piece. Instead, `Piece.assemblageDescriptors` stores lightweight descriptors (instrument, name, id, strand labels with phraseIDs). The computed `Piece.assemblages` getter reconstructs live Assemblage objects on demand by resolving UUID references back to actual Phrase objects from `phraseGrid`.

### Editor UI

- Dropdown to select existing assemblages or create new ones
- Per-assemblage: add named strands, manage phrases
- `EditorMode.AssemblagePhrasePick` mode: click phrases in the transcription view to add them
- Move phrases between strands or to "loose"
- Inline strand name editing

### Analysis Display

Columnar grid where each strand is a column, phrases are rows. Includes "Play Strand" for sequential audio playback with auto-scrolling.

---

## Articulation

**File:** `src/ts/model/articulation.ts`

Instrument-specific event markers:
- **Pluck** (sitar): Da/Ra strokes with optional stroke nicknames
- **Hammer-on/Hammer-off** (sitar): Pitch articulations without pluck
- **Slide** (sitar): Continuous pitch connection
- **Dampen** (sitar): Palm muting
- **Consonant** (vocal): Start/end consonants in multiple scripts

Multi-script text: Hindi/Devanagari, IPA, English transliteration, ISO 15919.

---

## Automation

**File:** `src/ts/model/automation.ts`

DAW-style piecewise-linear volume envelope over normalized time [0,1] with values in [0,1].

- Default: constant full volume `[(0,1), (1,1)]`
- `addValue(normTime, value)`: Insert/update breakpoints
- `valueAtX(x)`: Linear interpolation between breakpoints
- `generateValueCurve()`: Samples into Float32Array for Web Audio `setValueCurveAtTime()`
- `partition(durArray)`: Splits envelope proportionally (for trajectory splitting)
- `compress(automations, durArray)`: Merges envelopes, removing redundant collinear points (for trajectory joining)

---

## Phonemic Annotation System

Trajectories carry rich phonemic annotation for vocal transcription:

**11 vowels** (ISO 15919): a, aa, i, ii, u, uu, ee, ai, oo, au, underscore (silent)

**33 consonants**: Full Devanagari consonant inventory (5 rows of stops/nasals: velar, palatal, retroflex, dental, labial; plus semivowels, sibilants, h)

Each phoneme is stored in **4 representations**: ISO 15919 romanization, IPA, Devanagari, and English transliteration. The `Piece.allDisplayVowels()` method computes combined consonant+vowel display text in all three scripts.

---

## Group

**File:** `src/ts/model/group.ts`

A collection of 2+ adjacent trajectories within a phrase, usable for copy-paste operations. Groups enforce adjacency (consecutive `num` values within the same `phraseIdx`). Each trajectory stores a `groupId` back-reference.

---

## Chikari

**File:** `src/ts/model/chikari.ts`

A sympathetic/drone string stroke event. Default tuning: Sa (oct 2), Sa (oct 1), Pa (oct 0), Ga (oct 0). Third and fourth pitches derived from raga (see Raga section above).

---

## Three-Layer Framework Mapping

The data model implements the analytical framework described in the NEH whitepaper:

| Layer | Objects | Role |
|-------|---------|------|
| **Framework** | Raga, Meter/Tala | Define the theoretical space: available pitches, tuning, rhythmic cycle structure. Relatively static. |
| **Elemental** | Trajectory (14 archetypes), Pitch, Articulation, Automation | The vocabulary of moment-to-moment musical utterance. Mathematical functions operating on anchor pitches. |
| **Formal-Temporal** | Piece > Section > Phrase > Trajectory sequence, Assemblage | Hierarchical containment and analytical labeling. Gives meaning to sequences of elemental events. |

The layers interact: Framework constrains Elemental (raga defines available pitches, meter defines temporal grid); Elemental fills Formal-Temporal (trajectories populate phrases which populate sections); Formal-Temporal gives meaning to Elemental sequences (labeling them as Alap vs. Bandish, Tihai vs. Tan).
