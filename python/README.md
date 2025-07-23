# IDTAP Python API

[![PyPI version](https://badge.fury.io/py/idtap-api.svg)](https://badge.fury.io/py/idtap-api)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Python client library for **IDTAP** (Interactive Digital Transcription and Analysis Platform) - a web-based research platform developed at UC Santa Cruz for transcribing, analyzing, and archiving Hindustani (North Indian classical) music recordings using trajectory-based notation designed specifically for oral melodic traditions.

## About IDTAP

IDTAP represents a paradigm shift in musical transcription and analysis. Rather than forcing oral traditions into Western notational frameworks, it uses **trajectories** as the fundamental musical unit—archetypal paths between pitches that capture the continuous melodic movement central to Hindustani music.

**Key Innovation**: Instead of discrete notes, IDTAP models music through:
- **Trajectory-based notation** - Continuous pitch contours rather than fixed notes
- **Microtonal precision** - Cent-based tuning with flexible raga systems  
- **Idiomatic articulations** - Performance techniques specific to each instrument
- **Hierarchical segmentation** - Phrases, sections, and formal structures

## Features

- **Trajectory-Based Data Access** - Load and analyze transcriptions using the trajectory notation system
- **Hindustani Music Analysis** - Work with raga-aware transcriptions and microtonal pitch data
- **Audio Download** - Retrieve associated audio recordings in multiple formats
- **Secure Authentication** - OAuth integration with encrypted token storage

## Installation

```bash
pip install idtap-api
```

### Optional Dependencies

For enhanced Linux keyring support:
```bash
pip install idtap-api[linux]
```

For development:
```bash
pip install idtap-api[dev]
```

## Quick Start

### Authentication & Basic Usage

```python
from idtap_api import SwaraClient, Piece, Instrument

# Initialize client - connects to swara.studio platform
client = SwaraClient()  # Automatic OAuth via Google

# Browse available transcriptions
transcriptions = client.get_viewable_transcriptions()
print(f"Found {len(transcriptions)} transcriptions")

# Load a Hindustani music transcription
piece_data = client.get_piece("transcription-id")
piece = Piece.from_json(piece_data)

print(f"Transcription: {piece.title}")
print(f"Raga: {piece.raga.name if piece.raga else 'Unknown'}")
print(f"Instrument: {piece.instrumentation}")
print(f"Trajectories: {sum(len(p.trajectories) for p in piece.phrases)}")
```

### Working with Trajectory-Based Transcriptions

```python
# Analyze trajectory-based musical structure
for phrase in piece.phrases:
    print(f"Phrase {phrase.phrase_number}: {len(phrase.trajectories)} trajectories")
    
    # Examine individual trajectories (fundamental units of IDTAP)
    for traj in phrase.trajectories:
        if traj.pitch_array:
            # Each trajectory contains continuous pitch movement
            start_pitch = traj.pitch_array[0].pitch_number
            end_pitch = traj.pitch_array[-1].pitch_number
            print(f"  Trajectory {traj.traj_number}: {start_pitch:.2f} → {end_pitch:.2f}")
            
            # Check for articulations (performance techniques)
            if traj.articulation:
                techniques = [art.stroke for art in traj.articulation if art.stroke]
                print(f"    Articulations: {', '.join(techniques)}")

# Raga analysis (theoretical framework)
if piece.raga:
    print(f"Raga: {piece.raga.name}")
    if hasattr(piece.raga, 'aroha') and piece.raga.aroha:
        print(f"Aroha (ascending): {piece.raga.aroha}")
    if hasattr(piece.raga, 'avaroha') and piece.raga.avaroha:  
        print(f"Avaroha (descending): {piece.raga.avaroha}")
```

### Audio Handling

```python
# Download audio in different formats
audio_bytes = client.download_audio("audio-id", format="wav")
with open("recording.wav", "wb") as f:
    f.write(audio_bytes)

# Download all audio associated with a transcription
client.download_and_save_transcription_audio(piece, directory="./audio/")
```

### Data Export

```python
# Export transcription data
excel_data = client.excel_data(piece_id)
with open("analysis.xlsx", "wb") as f:
    f.write(excel_data)

json_data = client.json_data(piece_id)
with open("transcription.json", "wb") as f:
    f.write(json_data)
```

### Working with Hindustani Music Data

```python
from idtap_api import Piece, Phrase, Trajectory, Pitch, Raga, Instrument

# Example: Analyze a sitar transcription
sitar_pieces = [t for t in transcriptions if t.get('instrumentation') == 'Sitar']

for trans_meta in sitar_pieces[:3]:  # First 3 sitar pieces
    piece = Piece.from_json(client.get_piece(trans_meta['_id']))
    
    # Count different types of trajectories (IDTAP's innovation)
    trajectory_types = {}
    for phrase in piece.phrases:
        for traj in phrase.trajectories:
            traj_type = getattr(traj, 'curve_type', 'straight')
            trajectory_types[traj_type] = trajectory_types.get(traj_type, 0) + 1
    
    print(f"{piece.title}:")
    print(f"  Raga: {piece.raga.name if piece.raga else 'Unknown'}")
    print(f"  Trajectory types: {trajectory_types}")
    
    # Analyze articulation patterns (performance techniques)  
    articulations = []
    for phrase in piece.phrases:
        for traj in phrase.trajectories:
            if traj.articulation:
                articulations.extend([art.stroke for art in traj.articulation])
    
    unique_arts = list(set(articulations))
    print(f"  Articulations used: {', '.join(unique_arts[:5])}")  # First 5
```

## Key Classes

### SwaraClient
The main HTTP client for interacting with the IDTAP server.

**Key Methods:**
- `get_viewable_transcriptions()` - List accessible transcriptions
- `get_piece(id)` - Load transcription data
- `save_piece(data)` - Save transcription
- `excel_data(id)` / `json_data(id)` - Export data
- `download_audio(id, format)` - Download audio files
- `agree_to_waiver()` - Accept research waiver (required for first-time users)
- `has_agreed_to_waiver()` - Check if waiver has been accepted

### Musical Data Models

- **`Piece`** - Central transcription container with metadata, audio association, and musical content
- **`Phrase`** - Musical phrase containing trajectory data and categorizations
- **`Trajectory`** - Detailed pitch movement data with timing and articulations
- **`Pitch`** - Individual pitch points with frequency and timing information
- **`Raga`** - Indian musical scale/mode definitions with theoretical rules
- **`Section`** - Large structural divisions (alap, composition, etc.)
- **`Meter`** - Rhythmic cycle and tempo information
- **`Articulation`** - Performance technique annotations (meend, andolan, etc.)

### Specialized Features

- **Microtonal Pitch System** - Precise cent-based pitch representation
- **Hindustani Music Theory** - Raga rules, sargam notation, gharana traditions
- **Performance Analysis** - Ornament detection, phrase categorization
- **Multi-Track Support** - Simultaneous transcription of melody and drone

## Authentication

The client uses OAuth 2.0 flow with Google authentication. On first use, it will:

1. Open a browser for Google OAuth login
2. Securely store the authentication token using:
   - OS keyring (preferred)
   - Encrypted local file (fallback)
   - Plain text (legacy, discouraged)

### Research Waiver Requirement

**First-time users must agree to a research waiver** before accessing transcription data. If you haven't agreed yet, you'll see an error when trying to access transcriptions:

```python
client = SwaraClient()
transcriptions = client.get_viewable_transcriptions()  # Will raise RuntimeError

# Agree to waiver first
client.agree_to_waiver()
transcriptions = client.get_viewable_transcriptions()  # Now works

# Check waiver status
if client.has_agreed_to_waiver():
    print("Waiver agreed - full access available")
```

### Manual Token Management

```python
# Initialize without auto-login
client = SwaraClient(auto_login=False)

# Login manually when needed
from idtap_api import login_google
login_google()
```

## Advanced Usage

### Batch Processing

```python
# Process multiple transcriptions
transcriptions = client.get_viewable_transcriptions()

for trans in transcriptions:
    if trans.get('instrumentation') == 'Sitar':
        piece = Piece.from_json(client.get_piece(trans['_id']))
        
        # Analyze sitar-specific features
        total_meends = sum(
            len([art for art in traj.articulation if art.stroke == 'meend'])
            for phrase in piece.phrases
            for traj in phrase.trajectories
        )
        print(f"{piece.title}: {total_meends} meends")
```

### Research Applications

```python
# Raga analysis across corpus
raga_stats = {}
for trans in transcriptions:
    piece = Piece.from_json(client.get_piece(trans['_id']))
    if piece.raga:
        raga_name = piece.raga.name
        raga_stats[raga_name] = raga_stats.get(raga_name, 0) + 1

print("Raga distribution:", raga_stats)
```

## Development

### Running Tests

```bash
# Unit tests
pytest idtap_api/tests/

# Integration tests (requires authentication)
python api_testing/api_test.py
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Documentation

- **API Reference**: Full documentation of all classes and methods
- **Musical Concepts**: Guide to Hindustani music terminology and theory
- **Research Examples**: Academic use cases and analysis workflows

## Platform Access

- **IDTAP Web Platform**: [swara.studio](https://swara.studio)
- **Source Code**: [github.com/jon-myers/idtap](https://github.com/jon-myers/idtap)
- **Research Paper**: "Beyond Notation: A Digital Platform for Transcribing and Analyzing Oral Melodic Traditions" (ISMIR 2025)

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/jon-myers/idtap/issues)
- **Research Contact**: Jonathan Myers & Dard Neuman, UC Santa Cruz
- **Platform**: [swara.studio](https://swara.studio)

## License

MIT License - see LICENSE file for details.

## Citation

If you use IDTAP in academic research, please cite the ISMIR 2025 paper:

```bibtex
@inproceedings{myers2025beyond,
  title={Beyond Notation: A Digital Platform for Transcribing and Analyzing Oral Melodic Traditions},
  author={Myers, Jonathan and Neuman, Dard},
  booktitle={Proceedings of the 26th International Society for Music Information Retrieval Conference},
  pages={},
  year={2025},
  address={Daejeon, South Korea},
  url={https://swara.studio}
}
```

---

**IDTAP** was developed at UC Santa Cruz with support from the National Endowment for the Humanities. The platform challenges Western-centric approaches to music representation by creating tools designed specifically for oral melodic traditions, enabling scholars to study Hindustani music on its own terms while applying cutting-edge computational methodologies.
