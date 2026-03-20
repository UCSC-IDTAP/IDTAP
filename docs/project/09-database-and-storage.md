# Database and Storage

---

## Database Overview

**Database:** `swara` on MongoDB Atlas (`swara.f5cuf.mongodb.net`)

**15 collections:**

| Collection | Purpose |
|-----------|---------|
| `transcriptions` | Musical transcription data (core data, deeply nested) |
| `audioEvents` | Audio event containers (concerts, sessions) holding multiple recordings |
| `audioRecordings` | Individual recording metadata (denormalized from audioEvents) |
| `audioFiles` | Legacy audio file metadata (rarely used) |
| `users` | User profiles with Google OAuth identity |
| `musicians` | Musician database with gharana (lineage) information |
| `ragas` | Raga definitions with rule sets and tuning |
| `collections` | User-curated groupings of transcriptions/recordings |
| `instruments` | Instrument definitions |
| `location` | Geographic location taxonomy (continents/countries/cities) |
| `performanceSections` | Performance section type vocabulary |
| `audioEventTypes` | Audio event type vocabulary |
| `phonemes` | IPA vowel and consonant definitions |
| `gharanas` | Musical lineage definitions |
| `settings` | Application settings |

**Note:** No custom database indexes exist beyond MongoDB's default `_id` index. No collection-level schema validation is configured. All data integrity is enforced in application code.

---

## Transcription Document Schema

The transcription document is the most complex structure. It serializes a `Piece` object with deeply nested phrases, trajectories, and pitches.

### Top-Level Fields

```javascript
{
  _id: ObjectId,
  title: string,
  dateCreated: Date,
  dateModified: Date,
  location: string,
  audioID: string,                    // linked audioRecording ObjectId
  userID: string,                     // owner user ObjectId
  name: string,                      // owner display name
  family_name: string,
  given_name: string,

  // Permission system (both old and new coexist)
  permissions: string,                // LEGACY: "Public" | "Publicly Editable" | "Private"
  explicitPermissions: {              // CURRENT
    edit: string[],                   // userID strings with edit access
    view: string[],                   // userID strings with view-only access
    publicView: boolean,
  },

  // Musical framework
  raga: {
    name: string,
    fundamental: number,              // Hz (e.g., 261.63)
    ratios: number[],                 // flattened tuning ratios
    tuning: TuningType,               // structured per-degree tuning
  },
  instrumentation: Instrument[],      // e.g., ["Sitar"] or ["Sitar", "Vocal (M)"]
  trackTitles: string[],
  soloist: string | null,
  soloInstrument: string | null,
  meters: Meter[],                    // tala/rhythmic structures
  excerptRange: ExcerptRange | null,  // optional time sub-range

  // Core musical data (multi-track grids)
  phraseGrid: Phrase[][],             // [track][phraseIdx]
  durArrayGrid: number[][],           // [track][phraseIdx] → proportional duration
  durTot: number,                     // total duration in seconds
  sectionCatGrid: SecCatType[][],     // [track][sectionIdx] → categorization
  adHocSectionCatGrid: string[][][],  // [track][sectionIdx][fieldIdx]

  // Assemblage system
  assemblageDescriptors: AssemblageDescriptor[],
}
```

### Phrase (nested in phraseGrid)

```javascript
{
  durTot: number,
  durArray: number[],
  startTime: number,
  uniqueId: string,                   // UUID v4
  isSectionStart: boolean,            // replaces legacy sectionStartsGrid
  instrumentation: string[],
  trajectoryGrid: Trajectory[][],     // [stringIdx][trajIdx]
  chikaris: { [timeKey]: Chikari },
  groupsGrid: Group[][],
  categorizationGrid: PhraseCatType[],
  adHocCategorizationGrid: string[],
}
```

### Trajectory (nested in trajectoryGrid)

```javascript
{
  id: number,                         // 0-13 archetype type
  pitches: Pitch[],
  durTot: number,
  durArray: number[],
  slope: number,
  startTime: number,
  num: number,
  uniqueId: string,                   // UUID v4
  fundID12: number,                   // fundamental for silent trajectories
  articulations: { [timeKey]: Articulation },
  vibObj: VibObjType,                 // vibrato parameters
  automation: Automation,             // volume envelope
  vowel: string,                      // ISO 15919
  startConsonant: string,
  endConsonant: string,
  // Plus Hindi/IPA/EngTrans variants of vowel/consonant
  groupId: string,
  // STRIPPED in PR #887: name, instrumentation, tags
}
```

### Pitch (nested in pitches)

```javascript
{
  swara: number,                      // 0-6 (sa, re, ga, ma, pa, dha, ni)
  raised: boolean,                    // suddha/tivra vs komal
  oct: number,                        // octave offset from center
  logOffset: number,                  // microtonal cents offset
  // STRIPPED in PR #887: ratios, fundamental (reconstructed from Raga)
}
```

---

## Permission System Evolution

### Legacy Format (string field, still present on old documents)
```javascript
permissions: "Public" | "Publicly Editable" | "Private"
```

### Current Format
```javascript
explicitPermissions: {
  publicView: boolean,
  edit: string[],      // userID strings
  view: string[],      // userID strings
}
```

The server queries **both** formats. In `getAllTranscriptions`, a `newPermissions` flag switches between legacy `$or` query using `permissions: "Public"` and the new `explicitPermissions.publicView` query. The API routes exclusively use `explicitPermissions`.

Permission updates cascade: updating an audioEvent's permissions propagates to all its child audioRecordings.

**Migration note:** The old `permissions` field is never cleaned up -- it's just ignored when the new format is present. When restoring from old backups, you may need to migrate:
```javascript
// Old:  { permissions: "Public" }
// New:  { explicitPermissions: { edit: [], view: [], publicView: true } }
```

---

## Audio Events / Audio Recordings Relationship

This is a two-tier system:

### audioEvents (container documents)
```javascript
{
  _id: ObjectId,
  name: string,
  userID: string,
  permissions: "Public",
  explicitPermissions: { publicView, edit, view },
  recordings: {
    "0": {
      audioFileId: ObjectId,
      duration: number,
      saEstimate: number,
      saVerified: boolean,
      octOffset: number,
      date: {},
      location: {},
      musicians: {},
      raags: {},
      dateModified: string,
      explicitPermissions: {...},
      userID: string,
    },
    "1": { ... }
  }
}
```

### audioRecordings (denormalized/flattened)
```javascript
{
  _id: ObjectId,          // same as audioEvent.recordings[n].audioFileId
  duration: number,
  saEstimate: number,
  saVerified: boolean,
  octOffset: number,
  musicians: {},
  raags: {},
  date: {},
  location: {},
  title: string,
  parentID: string,       // audioEvent._id
  parentTitle: string,
  parentTrackNumber: string,
  userID: string,
  collections: string[],
  dateModified: string,
  explicitPermissions: { publicView, edit, view },
}
```

An aggregation pipeline (`server/aggregations.js`) uses `$objectToArray`, `$unwind`, and `$merge` to keep `audioRecordings` in sync with `audioEvents`. It runs after metadata saves. The system is transitioning away from relying on this aggregation -- new upload code writes directly to both collections.

---

## Other Collection Schemas

### users
```javascript
{
  _id: ObjectId,
  sub: string,                     // Google OAuth subject ID (unique lookup key)
  name: string,
  family_name: string,
  given_name: string,
  email: string,
  picture: string,
  transcriptions: ObjectId[],     // owned transcription IDs
  multiQueries: [{                // saved analysis queries
    _id: ObjectId,
    queries: any,
    dateCreated: Date,
    options: any,
    transcriptionID: string,
    title: string,
  }],
  savedSettings: [{ uniqueId, ...settings }],
  defaultSettingsID: string,
  waiverAgreed: boolean,          // research consent
  collections: string[],
  transcriptionsViewed: { [transcriptionID]: Date },
}
```

### musicians
```javascript
{
  _id: ObjectId,
  "Initial Name": string,
  "First Name": string,
  "Last Name": string,
  "Middle Name": string,
  "Full Name": string,
  Gharana: string,
  Instrument: string,
  "Solo Instrument": string,
}
```

### ragas
```javascript
{
  _id: ObjectId,
  name: string,
  rules: RuleSetType,    // { sa: true, re: {lowered, raised}, ... }
  updatedDate: string,
}
```

### collections
```javascript
{
  _id: ObjectId,
  userID: string,
  userName: string,
  dateCreated: Date,
  dateModified: Date,
  audioRecordings: string[],
  transcriptions: string[],
  audioEvents: string[],
  permissions: { edit: string[], view: string[] },
  inviteCode: string,
}
```

---

## Audio File Storage (Filesystem)

Audio files are organized on the production server:

```
/root/
├── audioEvents/{objectId}/
│   ├── audio.wav                    # Primary format (44100 Hz)
│   └── audio.opus                   # Original upload (if opus)
├── audio/
│   ├── wav/{objectId}.wav           # Alternative location
│   ├── mp3/{objectId}.mp3           # Compressed
│   └── opus/{objectId}.opus         # Opus compressed
├── spec_data/{objectId}/
│   ├── spec_data.gz                 # Gzipped uint8 CQ data
│   └── spec_shape.json              # [height, width]
├── melograph_data/{objectId}/
│   └── melograph_data.json          # Pitch contour chunks
├── peaks/{objectId}.json            # Waveform peak data for UI
└── spectrograms/{objectId}/0/       # Legacy tile images
```

### Upload Pipeline
1. File uploaded to `uploads/` directory
2. Essentia extracts duration and estimates tonic (Sa) frequency
3. Duration and tonic written to both `audioEvents` and `audioRecordings`
4. Audio converted to WAV (44100 Hz), MP3 (192k), and Opus formats
5. Peak data generated and saved as JSON
6. Spectrogram data and melograph generated asynchronously

### Cleanup
`deleteFiles()` in `server.ts` removes all associated files when a recording is deleted. The `delete_unlinked_audio.py` cron script cleans orphaned MP3/WAV files (but not opus, spectrograms, peaks, or spec_data).

---

## Backup System

### Architecture
- **Script:** `/root/backups/backup_mongo.py` (runs daily via node-cron in server.ts)
- **Output:** `/root/backups/YYYY-M-D/swara/` containing `.bson` and `.metadata.json` per collection
- **Retention:** No automated cleanup -- backups accumulate indefinitely
- **Credential:** Hardcoded `export_robot` user in the script (not environment variable)

### Daily Cron Jobs (server.ts, lines 148-155)
1. `delete_unlinked_audio.py` -- orphaned audio file cleanup
2. `backups/backup_mongo.py` -- MongoDB dump

### Restoration Procedures

**Full database (to test database first):**
```bash
mongorestore --uri 'mongodb+srv://export_robot:PASSWORD@swara.f5cuf.mongodb.net/test_restore_YYYY_MM_DD' \
             --drop /root/backups/YYYY-M-D/swara/
```

**Single document recovery:**
```bash
mongoexport --uri '...' --collection transcriptions \
            --query '{"_id": {"$oid": "DOC_ID"}}' --out /root/doc.json
mongoimport --uri '...' --collection transcriptions \
            --file /root/doc.json --upsert
```

**Search across backups:**
```bash
for backup in /root/backups/2025-*/swara/; do
    bsondump "$backup/transcriptions.bson" 2>/dev/null | grep "SEARCH_TERM"
done
```

---

## Schema Migration History

### One-Off Migration Scripts

Located in `python/dataManagement/aggregations/`:

| Script | Purpose |
|--------|---------|
| `add_names_to_transcriptions.py` | Denormalized user names onto transcriptions |
| `add_transcription_ids.py` | Built `users.transcriptions[]` by scanning all transcriptions |
| `add_empty_collections_arrs.py` | Added `collections: []` to users, transcriptions, recordings |
| `add_date_to_recordings.py` | Added `dateModified` to all recordings |
| `add_userid_to_ae_recs.py` | Added `userID` to nested audioEvent recordings |
| `add_musicians.py` | Populated musicians collection from recording metadata |
| `add_soloist_info_to_transcriptions.py` | Added `soloist`/`soloInstrument` from linked recordings |
| `remove_extra_sec_cats.py` | Fixed array length mismatches in section categorization |
| `fix_durations.py` | Corrected durations by reading actual WAV file lengths |

### In-Server Migration (Active)

On every `updateTranscription` save (server.ts, lines 295-300), legacy fields are removed:
```javascript
'$unset': {
  'sectionStartsGrid': '',      // → phrase.isSectionStart
  'sectionStarts': '',           // even older format
  'phrases': '',                 // → phraseGrid[0]
  'sectionCategorization': '',   // → sectionCatGrid[0]
  'durArray': '',                // → durArrayGrid[0]
}
```

### PR #887 Serialization Strip (2026)

Removed redundant fields to reduce document size:
- **Pitch:** stripped `ratios` and `fundamental` (reconstructed from Raga context)
- **Trajectory:** stripped `name` (derived from `id`), `instrumentation` (inherited), `tags` (defaults `[]`)
- **Phrase:** stripped `raga` (passed via context)
- **Piece:** stripped `durArray`, `sectionCategorization`, `sectionStartsGrid` (computed/duplicates)

---

## Data Integrity Concerns

### Known Issues

1. **No custom indexes**: Permission queries and user lookups do full collection scans. Adding indexes on `userID`, `sub`, and `explicitPermissions.publicView` would improve query performance.

2. **Dual-source truth for recordings**: Both `audioEvents.recordings` and `audioRecordings` store the same data. Updates don't always propagate bidirectionally.

3. **String vs ObjectId inconsistency**: `userID` is stored as a string in transcriptions, but `users.transcriptions[]` stores ObjectId objects. `audioFileId` is ObjectId in audioEvents but string in some references.

4. **Orphan cleanup gaps**: The cleanup script only checks MP3/WAV files -- orphaned peaks, spectrograms, melographs, opus files, and spec_data are not cleaned.

5. **Permission field coexistence**: Both legacy `permissions` (string) and `explicitPermissions` (object) exist on documents. The old field is never removed.

6. **Hardcoded backup credentials**: The backup script contains database credentials in source code.

### Recommendations

- Add indexes for common query patterns (userID, permissions, audioID)
- Consolidate audioEvents/audioRecordings into a single source of truth
- Standardize ObjectId usage (always string or always ObjectId)
- Extend orphan cleanup to cover all file types
- Move backup credentials to environment variables
- Implement collection-level schema validation for critical collections
