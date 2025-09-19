# Recordings Interface Instructions

## Overview

The **Recordings Interface** is your central hub for managing audio files in IDTAP. This interface allows you to upload new recordings, manage metadata, generate visualizations, and organize your audio collection. All recordings serve as the foundation for creating transcriptions and performing musical analysis.

## Interface Layout

### Main Table View

The recordings are displayed in a sortable, filterable table with the following columns:

- **Soloist** - Primary performer name
- **Solo Instrument** - Main instrument being played
- **Raag** - Musical framework/mode
- **Performance Section** - Part of the performance (e.g., Alap, Jor, Jhala)
- **Title** - Recording title or event name
- **Duration** - Length of the recording
- **Owner** - User who uploaded the recording
- **Visibility** - Public or private status

### Audio Player

Located at the bottom of the interface, the audio player provides:

- Play/pause controls
- Progress bar with scrubbing
- Time display (current/total)
- Volume control
- Next track functionality for sequential playback

## Core Functions

### Uploading Recordings

#### Starting an Upload

1. **Right-click** in the table area or use the upload button
2. Select **"Upload Recording"** from the context menu
3. The upload modal will appear

#### Upload Process

1. **Select File**:
   - Click "Choose File" to browse your computer
   - Supported formats: MP3, WAV, M4A, FLAC, OGG, and most audio formats
   - Maximum file size: 1GB

2. **Audio Event Options**:
   - **Add to Audio Event** - Associate with existing concert/session
   - **Create New Audio Event** - Start a new concert/session
   - **No Audio Event** - Upload as standalone recording

3. **Upload Progress**:
   - Click "Upload" to start
   - Progress bar shows upload status
   - Processing begins automatically after upload
   - Audio preview available when complete

#### Post-Upload Processing

After successful upload, the system automatically:
- Converts audio to standard formats (MP3 for playback, WAV for analysis)
- Generates initial metadata
- Creates database entry
- Prepares for spectrogram generation

### Editing Recording Metadata

#### Accessing Metadata Editor

1. **Right-click** on any recording you own
2. Select **"Edit Recording Metadata"**
3. Metadata editor opens with current information

#### Metadata Fields

**Basic Information**:
- **Title** - Name of the recording or performance
- **Performance Section** - Alap, Jor, Jhala, Gat, etc.
- **Raag** - Select from existing or add new
- **Tala** - Rhythmic cycle (if applicable)

**Musicians**:
1. Set **Number of Musicians** (0-6)
2. For each musician, specify:
   - **Name** - Select from database or enter "Other" for new
   - **Instrument** - Primary instrument played
   - **Role** - Soloist, Accompanist, Tanpura, Tabla, etc.
   - **Gharana** - Musical lineage/school (optional)

**Additional Details**:
- **Recording Date** - When the performance was recorded
- **Event/Venue** - Concert name or recording location
- **Notes** - Any additional information
- **Sa (Tonic)** - Base pitch in Hz (can be set with tuner)

### Sa Tuner Tool

The Sa Tuner helps identify and set the tonic pitch:

1. **Access**: Right-click recording → "Open Sa Tuner"
2. **Usage**:
   - Play a sustained Sa note in the recording
   - Click "Detect" while the note is playing
   - System analyzes pitch and suggests frequency
   - Fine-tune manually if needed
   - Click "Save" to update recording

3. **Manual Entry**:
   - Enter frequency directly in Hz
   - Common Sa frequencies: C (261.63 Hz), C# (277.18 Hz), D (293.66 Hz)

### Generating Spectrograms

Spectrograms provide visual frequency analysis:

1. **Generate**: Right-click → "Generate Spectrogram"
2. **Processing**:
   - May take 1-5 minutes depending on file length
   - Runs in background - you can continue working
   - Notification when complete

3. **Viewing**:
   - Spectrograms appear in the Editor interface
   - Multiple colormap options available
   - Zoom and pan for detailed analysis

### Managing Permissions

Control who can access your recordings:

1. **Access Permissions**: Right-click → "Permissions"
2. **Visibility Options**:
   - **Private** - Only you can access
   - **Public** - Anyone can view
   - **Shared** - Specific users have access

3. **User Permissions**:
   - Add users by email
   - Set individual view/edit rights
   - Remove access as needed

## Table Features

### Searching and Filtering

1. **Search Bar**:
   - Type to search across all visible columns
   - Real-time filtering as you type
   - Clear button to reset

2. **Column Filters**:
   - Click column headers to sort (ascending/descending)
   - Drag column edges to resize
   - Columns auto-adjust to content

### Sorting

- **Click** column header to sort by that field
- **Click again** to reverse sort order
- **Arrow indicators** show current sort direction
- Multi-level sorting by holding Shift (some browsers)

### Selection and Navigation

- **Single-click** - Select recording
- **Double-click** - Play recording
- **Right-click** - Open context menu
- **Arrow keys** - Navigate table (when focused)

## Context Menu Options

Right-clicking on a recording provides:

- **Play** - Start audio playback
- **Edit Recording Metadata** - Modify recording information
- **New Transcription from Recording** - Create transcription
- **Generate Spectrogram** - Create frequency visualization
- **Open Sa Tuner** - Set tonic pitch
- **Permissions** - Manage access control
- **Add to Collection** - Organize in collections
- **Remove from Collection** - Remove from collections
- **Delete** - Permanently remove recording (owner only)
- **Upload Recording** - Add new recording

## Collections Integration

### Adding to Collections

1. Select recording(s)
2. Right-click → "Add to Collection"
3. Choose existing collection or create new
4. Recordings are linked, not moved

### Removing from Collections

1. Select recording in collection view
2. Right-click → "Remove from Collection"
3. Choose which collections to remove from
4. Recording remains in main library

## Playback Features

### Audio Player Controls

- **Play/Pause** - Space bar or click button
- **Scrubbing** - Click and drag on progress bar
- **Volume** - Adjust with slider
- **Time Display** - Shows current/total time
- **Auto-advance** - Plays next recording in list

### Keyboard Shortcuts

- **Space** - Play/pause
- **Arrow Left/Right** - Skip backward/forward (when player focused)
- **Arrow Up/Down** - Volume control (when player focused)
- **Escape** - Close any open modal

## Working with Transcriptions

### Creating Transcriptions

From a recording, you can:
1. Right-click → "New Transcription from Recording"
2. System creates transcription linked to audio
3. Opens in Editor for transcription work

### Viewing Related Transcriptions

To see all transcriptions of a recording:
1. Look for transcription count in table
2. Click to view list of related transcriptions
3. Double-click to open in Editor

## Best Practices

### File Preparation

Before uploading:
1. **Trim silence** from beginning/end
2. **Normalize levels** for consistent volume
3. **Use high quality** (minimum 128kbps MP3 or better)
4. **Name files descriptively** before upload

### Metadata Management

1. **Complete metadata immediately** after upload
2. **Use consistent naming** for musicians and raags
3. **Include performance section** for classical recordings
4. **Set Sa (tonic)** for pitch-accurate transcription

### Organization

1. **Use collections** to group related recordings
2. **Set appropriate permissions** for collaboration
3. **Generate spectrograms** for recordings you'll transcribe
4. **Regular backups** - export important metadata

## Troubleshooting

### Upload Issues

**Problem**: Upload fails or stalls
- Check internet connection stability
- Ensure file size is under 1GB
- Try different browser if persistent
- Convert to MP3 if using uncommon format

**Problem**: Processing takes too long
- Large files may take several minutes
- Check server status
- Refresh page and check if complete

### Playback Problems

**Problem**: Audio won't play
- Check browser audio permissions
- Ensure speakers/headphones connected
- Try refreshing the page
- Clear browser cache

**Problem**: Audio skips or stutters
- Check internet connection speed
- Let file buffer before playing
- Close other bandwidth-heavy applications

### Metadata Issues

**Problem**: Can't edit metadata
- Ensure you're the owner
- Check if you have edit permissions
- Refresh page to reload permissions

**Problem**: Musicians not appearing in dropdown
- New musicians must be added to database first
- Use "Other" option for one-time entries
- Contact admin to add to permanent database

## Advanced Features

### Batch Operations

For multiple recordings:
1. **Select multiple** with Ctrl/Cmd+click
2. **Right-click** for batch options
3. Available batch operations:
   - Add to collection
   - Set permissions
   - Generate spectrograms

### Export and Import

**Exporting Metadata**:
1. Select recordings to export
2. Right-click → "Export Metadata"
3. Choose format (JSON or CSV)
4. Save to local computer

**Importing** (Admin only):
- Bulk import via CSV
- Maintains relationships and permissions
- Validates data before import

### API Access

For programmatic access:
- Use Python `idtap-api` package
- Authenticate with OAuth
- Upload recordings via API
- Retrieve metadata and audio URLs

## Tips for Efficiency

### Quick Actions

1. **Double-click** to play immediately
2. **Tab key** to navigate between fields
3. **Enter key** to confirm dialogs
4. **Escape key** to cancel operations

### Workflow Optimization

1. **Upload in batches** during off-peak hours
2. **Set metadata** while files process
3. **Generate spectrograms** overnight
4. **Use templates** for similar recordings

### Performance Tips

1. **Filter large lists** to improve responsiveness
2. **Close unused tabs** when uploading large files
3. **Clear browser cache** periodically
4. **Use wired connection** for large uploads

## Security and Privacy

### Access Control

- Recordings are private by default
- Only owners can delete recordings
- Shared access is revocable
- Public recordings remain attributed to owner

### Data Protection

- All uploads are encrypted in transit
- Files stored securely in cloud
- Automatic backups maintained
- GDPR-compliant data handling

---

*For additional help, see the General Instructions or contact support.*