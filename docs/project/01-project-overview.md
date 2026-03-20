# Project Overview

## Mission

IDTAP (Interactive Digital Transcription and Analysis Platform) is a web-based platform for transcribing, analyzing, and archiving Indian classical music performances. It addresses a fundamental problem in computational musicology: the dominant systems for representing music digitally -- staff notation, MIDI, and piano-roll representations -- are rooted in Western music theory's discretization of pitch into twelve equally tempered categories and rhythm into quantized grid positions. These representations cannot adequately capture the continuous pitch movements (meend, gamak, andolan), microtonal inflections, and flexible rhythmic phrasing that define Hindustani (North Indian) classical music and many other oral melodic traditions worldwide.

IDTAP replaces fixed-pitch note events with **trajectories** -- formally specified archetypal paths between pitches that represent finely calibrated glissandi and melodic gestures. This continuous pitch representation, combined with a raga-based theoretical framework and hierarchical tala-based meter system, creates a transcription medium that is both computationally precise and musically authentic.

## Intellectual Foundations

The project grows out of PI Dard Neuman's decades of research on caste, class, and musical creativity in Hindustani music. His fieldwork with hereditary musicians (particularly the Dagar family of Dhrupad singers) revealed how marginalized hereditary musicians reappropriated classical Sanskrit precepts as instruments of creative innovation. Traditional transcription methods -- whether handwritten staff notation or numerical encoding in spreadsheets -- could not capture the melodic subtleties central to this creative practice.

The platform is positioned as both a **methodological intervention** against Western-centric music representation paradigms and a **practical research instrument** for computational musicology. It makes non-Western musical knowledge computationally legible without forcing it through the filter of equal-tempered pitch quantization.

## Research Context

### The Transcription Problem

The "musicological turn" of the 1980s-90s decentered music theory in U.S. musicology departments, and with it, the practice of detailed melodic transcription. While ethnomusicology moved toward cultural studies approaches, the empirical analysis of melodic and rhythmic content declined. IDTAP is intended as a corrective: a tool that makes detailed transcription accessible to scholars who may not read staff notation, while preserving the analytical precision that systematic transcription enables.

### Trajectories as Middle-Level Representation

IDTAP's trajectory system occupies a middle ground between two extremes:
- **Too granular**: Raw fundamental frequency (F0) data from pitch tracking algorithms -- accurate but overwhelming, noisy, and lacking musical interpretation
- **Too coarse**: MIDI/staff notation -- interpretable but lossy, flattening the expressive features that distinguish one performance from another

Trajectories encode **archetypal melodic motion** -- the 14 trajectory types (sustained tones, various bend shapes, ornamental figures, silence, vibrato) capture the vocabulary of melodic movement in Indian music at a level that is both computationally manipulable and musically meaningful.

## Funding and Institutional History

### Phase 1: Prototype (2012-2019)
PI Neuman developed handwritten notation systems and Excel-based numerical encoding for Dhrupad vocal music transcription. These early systems demonstrated the need for a purpose-built digital platform.

### Phase 2: ARI-Funded Web Platform (2021-2022)
UCSC's Academic Research Initiative funded the initial web implementation by Neuman and Myers. This prototype supported single-track sitar transcription with basic trajectory editing and spectrogram display.

### Phase 3: NEH Digital Humanities Grant (2023-2024)
NEH Grant HAA-290356-23 funded the transformation of the prototype into a full-featured collaborative platform. Key deliverables included multi-track transcription, multi-instrument support (sitar, sarangi, voice), the analysis suite, the collections system, and the audio synthesis engines. Jonathan Myers served as lead (and sole) developer.

### Phase 4: UCSC Office of Research (2025-present)
Continued funding from UCSC's Office of Research. Myers formally became Assistant Researcher and co-PI. This phase saw the Python API, CI/CD automation, polyphonic dual-string support, the assemblage system, and comprehensive test coverage.

## Impact and Adoption

As of mid-2025:
- **80+ unique users** across academic institutions
- **165 uploaded recordings** in the archive
- **111 transcription documents** created
- **44+ hours of audio** ingested and analyzed
- Adopted in classrooms at **UCSC, UCLA, and University of Michigan**
- Used in research labs at **UCSC and MIT**
- Presentations delivered in the **US, Canada, Italy, Spain, and India**
- Published **PyPI package** (`idtap-api`) for programmatic access
- **ISMIR 2025** conference paper accepted and presented

## Publications

### ISMIR 2025 Paper
**"Beyond Notation: A Digital Platform for Transcribing and Analyzing Oral Melodic Traditions"**
Jonathan Myers and Dard Neuman. Proceedings of the 26th International Society for Music Information Retrieval Conference, Daejeon, South Korea, 2025.

A 9-page conference paper aimed at the MIR research community. Describes the platform's architecture, the trajectory representation, the editor, and the analysis suite. Positions IDTAP against five categories of prior work: automated MIR pipelines, open archives, notation frameworks, educational tools, and annotation software.

Available at: `public/papers/ismir-paper.pdf`

### NEH Final White Paper
**"A Platform for Digitally Transcribing and Archiving Hindustani Music -- Final White Paper"**
Dard Neuman and Jonathan Myers. NEH Grant HAA-290356-23, 2024.

A comprehensive 28-page report covering the project's intellectual genealogy, the three-layer data model (Framework, Elemental, Formal-Temporal objects), detailed technical infrastructure, and evidence of impact. Provides rich historical and disciplinary framing that contextualizes the platform within broader debates about music representation and cultural knowledge systems.

Available at: `public/papers/neh-whitepaper.pdf`

## Dedication

The ISMIR 2025 paper is dedicated to the memory of **Larry Polansky**, a pioneering figure in computational music theory and a formative influence on the project's intellectual approach.
