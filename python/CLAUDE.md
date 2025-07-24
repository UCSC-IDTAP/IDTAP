# IDTAP Python Server Scripts

## Overview
This directory contains server-side Python scripts for the IDTAP (Interactive Digital Transcription and Analysis Platform), including audio processing, visualization generation, and database management utilities.

**Note:** The Python client API (`idtap_api`) has been moved to a separate repository: https://github.com/UCSC-IDTAP/Python-API

## Server Components

### Audio Processing (`essentia/`)
- **make_spectrogram.py** - Generate spectrogram visualizations
- **make_melograph.py** - Generate melodic contour analysis
- **make_images.py** - General audio visualization processing
- **update_all_tonics.py** - Update tonic frequency annotations

### Visualization Tools (`visualization_tools/`)
- **generate_log_spectrograms.py** - High-quality spectrogram generation
- **make_spec_data.py** - Spectral data processing for frontend
- **make_all_*.py** - Batch processing scripts
- **webps/** - Colormap visualization assets

### Database Management (`dataManagement/`)
- **build_musicians_db.py** - Musician database initialization
- **build_raga_db.py** - Raga taxonomy setup
- **aggregations/** - Database migration and update scripts

### Auto-Transcription (`auto_transcribe/`)
- **extract.py** - Audio feature extraction pipeline
- **segment.py** - Audio segmentation algorithms
- **melodic_contour.py** - Pitch trajectory analysis
- **onsets.py** - Note onset detection

### Backup & Mass Upload (`backup_scripts/`, `mass_upload/`)
- **backup_mongo.py** - Database backup utilities
- **mass_upload.py** - Batch audio file processing
- **directory_watcher.py** - Automated file monitoring

## Usage Patterns

### Called from Node.js Server
These scripts are typically invoked by the main Node.js server in `/server/` via child processes:
```javascript
// Example server call to Python script
const result = spawn('python', ['python/essentia/make_spectrogram.py', audioId]);
```

## Development Guidelines

### Code Conventions
- **snake_case** for Python code
- **Type hints** encouraged for new scripts
- **Minimal dependencies** - prefer stdlib where possible
- **Error handling** for production server integration

### File Organization
```
python/
├── essentia/          # Audio analysis scripts
├── visualization_tools/ # Spectrogram/melograph generation  
├── dataManagement/    # Database utilities
├── auto_transcribe/   # ML transcription pipeline
├── backup_scripts/    # Maintenance utilities
├── mass_upload/       # Batch processing
└── CLAUDE.md         # This documentation
```

### Integration with Main Server
- Scripts are called via Node.js `child_process.spawn()`
- Input/output typically via command line arguments and JSON files
- Shared data directory for audio files and generated visualizations
- Database access via direct MongoDB connection

### Common Patterns
- **Audio file paths**: Usually passed as ObjectId strings
- **Output formats**: JSON for data, PNG/WebP for images
- **Error handling**: Exit codes and stderr for server integration
- **Configuration**: Environment variables for database connections

This collection of scripts provides the computational backend for IDTAP's audio analysis and visualization capabilities.