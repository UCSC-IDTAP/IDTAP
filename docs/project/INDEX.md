# IDTAP Project Documentation

**Interactive Digital Transcription and Analysis Platform**

Comprehensive technical and historical documentation for the IDTAP project, developed at the University of California, Santa Cruz from 2022-2026. This documentation is intended to serve as a complete reference for future developers, researchers, and stakeholders.

**Principal Investigator:** Dard Neuman, Department of Music, UCSC
**Lead Developer:** Jonathan Myers, UCSC
**Funding:** NEH Grant HAA-290356-23 (Office of Digital Humanities), UCSC Office of Research

---

## Table of Contents

### Project Context
1. **[Project Overview](01-project-overview.md)** -- Mission, intellectual foundations, research context, funding history, and publications
2. **[Development History](02-development-history.md)** -- Chronological narrative of 4 years of development across 12 major phases, from prototype to production

### Technical Architecture
3. **[System Architecture](03-system-architecture.md)** -- Full-stack overview: frontend, backend, Python API, deployment infrastructure, and how the pieces connect
4. **[Domain Model](04-domain-model.md)** -- The musical data model: Piece, Phrase, Trajectory, Pitch, Raga, Meter/Tala, Assemblage, and the three-layer analytical framework
5. **[Spectrogram System](05-spectrogram-system.md)** -- The end-to-end spectrogram pipeline: Python CQ generation, Web Worker rendering, tile-based dispatching, lazy loading, and interactive colormaps
6. **[Audio Synthesis Engines](06-audio-synthesis.md)** -- Physical modeling synthesis via AudioWorklets: Karplus-Strong (sitar), bowed-string waveguide (sarangi), Klatt formant (voice), chikari drone strings, and polyphonic routing
7. **[Editor and Rendering](07-editor-and-rendering.md)** -- The transcription editor: D3-based trajectory rendering, drag dot system, chunked lazy loading, playhead animation, keyboard shortcuts, and the full UI feature inventory
8. **[Analysis and Query Systems](08-analysis-and-query.md)** -- Musical pattern query engine, pitch prevalence analysis, data extraction/export pipeline, and the assemblage analysis view
9. **[Database and Storage](09-database-and-storage.md)** -- MongoDB schema, document structure, permission system, audio file storage, backup infrastructure, and schema migration history

### Integration and Operations
10. **[Python API](10-python-api.md)** -- The `idtap-api` PyPI package: OAuth client, data model classes, query system, and integration with the web application
11. **[Deployment and Infrastructure](11-deployment-and-infrastructure.md)** -- Production server, CI/CD pipelines, automated deployment, backup cron jobs, and monitoring

### Future Development
12. **[Known Issues and Roadmap](12-known-issues-and-roadmap.md)** -- Categorized open issues, architectural debt, and recommendations for future development (including backend consolidation)
13. **[Onboarding Guide](13-onboarding-guide.md)** -- How a new developer would get started: local setup, key files to read, development workflow, and deployment procedures

---

## Quick Reference

| Component | Technology | Location |
|-----------|-----------|----------|
| Frontend | Vue 3 + TypeScript + D3.js + Web Audio API | `src/` |
| Backend | Node.js + Express + TypeScript | `server/` |
| Shared Types | TypeScript | `shared/` |
| Python API | Python 3.11 + PyPI package | Separate repo: `Python-API/` |
| Python Scripts | Audio analysis, visualization, backups | `python/` |
| Audio Worklets | JavaScript (AudioWorkletProcessor) | `src/audioWorklets/` |
| Database | MongoDB Atlas | Cloud-hosted |
| Production Server | DigitalOcean (137.184.90.119) | `swara.studio` |
| CI/CD | GitHub Actions | `.github/workflows/` |

## Research Publications

- **ISMIR 2025**: "Beyond Notation: A Digital Platform for Transcribing and Analyzing Oral Melodic Traditions" -- Myers & Neuman ([PDF](../../public/papers/ismir-paper.pdf))
- **NEH White Paper**: "A Platform for Digitally Transcribing and Archiving Hindustani Music -- Final White Paper" -- Neuman & Myers ([PDF](../../public/papers/neh-whitepaper.pdf))
