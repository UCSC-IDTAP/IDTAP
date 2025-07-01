# IDTAP

An Interactive Digital Transcription and Analysis Platform (IDTAP) that enables transcription, archiving, sharing, and analysis of audio recordings of oral melodic and improvisation traditions, with a first focus on Hindustani music.

Visit the platform at [swara.studio](https://swara.studio)

### Musical Transcription

Intuitive and flexible transcription tools and notation system designed to better represent the finely calibrated glissandi (continuous melodic contours across and between pitches) that appear in many musical traditions outside of the European and U.S. keyboard and staff oriented paradigms of music.

### Theoretical Identity

The IDTAP is organized around a succession of “trajectories”: formally specified, flexible basic units of musical continuity that follow archetypal paths or curves from one pitch to another, or among a series of pitches. Trajectories can be marked and expressed with a variety of instrument-specific articulations, allowing transcriptions to capture the performance practices of specific traditions / idioms.

### Synthesis

The IDTAP Editor includes custom synthesis engines associated with each supported instrument, allowing the user to aurally verify the accuracy of their transcription as measured up against the original recording.

### Analysis

The IDTAP includes a suite of analysis tools that allow users to analyze their transcriptions quantitatively and computationally, at a large scale across a range of performances (diachronically or synchronically), or at a small scale through specific measurements within a single performance, or even a single phrase.

# Features and Functionality

### Audio Archive & Upload

Easily upload, document, and listen to recordings, building a digital archive accessible for research and pedagogy.

### Interactive Transcription Editor:

- Transcribe melodic contours using unique “trajectories” that capture glissandi and microtonal movements.
- Adjust tuning at both macro (entire transcription) and micro (individual pivot points) scales.
- Overlay spectrograms and melographs for precise alignment with the audio.
- Transcribe up to four overlaid instruments in a single transcription
- Test transcription accuracy with synthesized audio playback using algorithms based on models like the Klatt synthesizer for vocals and Karplus-Strong for plucked instruments.
- Support for looping, pitch-shifting, and time stretching.
- Fully customizable color and colormap settings for all visual elements.

## Project Team

- **Dard Neuman** - Associate Professor of Music, UC Santa Cruz (Project Director)
- **Jon Myers** - Assistant Researcher in Systematic Musicology, UC Santa Cruz (Project Co-Director)
- **Balakrishnan Raghavan** - Graduate Student Researcher
- **Shreyas Anand** - Project Intern

For questions, support, or collaboration inquiries, please contact us via:
-	Email: DNeuman@ucsc.edu / JBMyers@ucsc.edu
-	GitHub Issues: Please open an issue in this repository.

For more information, and for citing this project, please see our [preprint article](https://osf.io/preprints/osf/jx3pk_v1). 

This project has been supported by grants from the National Endowment for the Humanities Office of Digital Humanities, the Arts Research Institute at UC Santa Cruz, and the Hasan & Ali Akbar Khan Endowment for Classical Indian Music.

This project is tested with BrowserStack

## Python API

The `python/api` package provides data classes and a small client for
interacting with the API served at [swara.studio](https://swara.studio).
Install it with `pip` and the provided `pyproject.toml`:

```bash
pip install -e python/api
```

Basic usage:

```python
from python.api import SwaraClient, Piece
client = SwaraClient()
piece_json = client.get_piece("abc123")
```

Unit tests can be run with `pytest`:

```bash
pytest python/api/tests
```
