# IDTAP Web Development Guide

## Overview
IDTAP (Interactive Digital Transcription and Analysis Platform) is a sophisticated full-stack web application for musical transcription and analysis, specifically focused on Indian classical music. The system combines modern web technologies with specialized audio processing and visualization capabilities.

**Note:** This CLAUDE.md covers the web development aspects. For Python API development, see `/python/CLAUDE.md`.

## Technology Stack

### Frontend
- **Vue 3** with TypeScript - Main application framework
- **Vite** - Build tool and development server  
- **Vue Router 4** - Client-side routing
- **Vuex 4** - State management
- **D3.js** - Data visualization and interactive graphics
- **GSAP** - Animations
- **Web Audio API** with AudioWorklets - Real-time audio processing
- **Google OAuth** (vue3-google-login) - Authentication

### Backend  
- **Node.js** with **TypeScript** - Modern server runtime (legacy CommonJS server being phased out)
- **Express.js** - Web server framework
- **MongoDB** (Atlas) - Primary database
- **Google OAuth 2.0** with **JWT** - Authentication (enhanced for Python API integration)
- **Python 3** integration - Audio processing and visualization generation
- **FFmpeg** - Audio format conversion

### Key Dependencies
- Audio: @soundtouchjs/audio-worklet, rubberband-web, soundtouchjs
- Music notation: vexflow
- Data: lodash, d3, exceljs, jszip, pako
- Scientific: tensorflow.js, ndarray libraries

## Database Structure (MongoDB)

### Core Collections
- **transcriptions** - Musical transcription data with complex nested structures
- **audioFiles** - Audio file metadata
- **users** - User profiles and authentication
- **musicians** - Musician database with gharana information
- **ragas** - Raga definitions and musical rules
- **collections** - User-created collections of transcriptions/recordings

### Permission System
- Public/private visibility levels
- Explicit permissions with granular edit/view access
- Owner-based access control
- Collection-based permission inheritance

## API Architecture

### Authentication Endpoints
- `/userLoginGoogle` - Google OAuth login
- `/handleGoogleAuthCode` - Token exchange
- Modern `/oauth/*` routes with JWT for Python API clients

### Transcription Management
- `/insertNewTranscription` - Create new transcription
- `/updateTranscription` - Update existing
- `/getAllTranscriptions` - List with permissions
- `/api/transcription/:id` - RESTful single transcription access
- Clone, delete, and permission update endpoints

### Audio Processing
- `/newUploadFile` - Upload with progress tracking
- `/makeSpectrograms` - Generate visualizations via Python
- `/makeMelograph` - Generate melodic contour analysis
- Audio format conversion pipeline (opus → wav)

### Data Export
- `/excelData` - Excel export generation
- `/jsonData` - JSON export
- `/DNExtractExcel` - Advanced data extraction

## Frontend Architecture

### Component Organization
```
src/
├── Editor/              # Main transcription editor
├── AudioRecordings/     # Audio management interface
├── Collections/         # Collection management
├── Analysis/           # Data analysis tools
└── Files/              # File management
```

### Key Components
- **EditorComponent.vue** - Main editor interface with complex state management
- **Renderer.vue** - Canvas-based visualization renderer
- **EditorAudioPlayer.vue** - Custom audio player with Web Audio API
- **TranscriptionLayer.vue** - Musical notation rendering
- **SpectrogramLayer.vue** - Real-time spectrogram visualization

### State Management
- Vuex store for authentication state
- Component-level reactive state
- Event bus (mitt) for cross-component communication
- Local storage for user preferences

## Audio Processing System

### Synthesis Engines
- **Karplus-Strong** - Plucked string synthesis (sitar)
- **Klatt synthesizer** - Vocal synthesis
- **Sarangi** - Physical modeling synthesis
- **Chikari** - Drone string synthesis
- Real-time parameter control via AudioWorklet

### Audio Pipeline
1. Client upload with progress tracking
2. Server processing with express-fileupload
3. FFmpeg format conversion
4. Python analysis pipeline
5. Automatic visualization generation
6. File storage organization

## Development Workflow

### Build Commands
```bash
pnpm dev             # Vite development server
pnpm build           # Production build  
pnpm serve           # Preview production build
pnpm test            # Vitest test runner
```

### Testing Setup
- **Vitest** for unit testing
- Component testing for Vue components
- API route testing with supertest
- Coverage reporting with @vitest/coverage-v8

### Code Quality
- **ESLint** for JavaScript/TypeScript linting
- **TypeScript** strict mode enforcement
- Vue 3 Composition API patterns

## Security Implementation

### Authentication Flow
- Client-side Google OAuth via vue3-google-login
- Server-side token verification with google-auth-library
- JWT-based API authentication for Python clients
- Automatic user registration/login

### Security Measures
- CORS configuration
- Request timeouts (10 minutes for analysis)
- File upload limits (1GB)
- Input validation and sanitization
- MongoDB query parameter sanitization

## Visualization System

### Rendering Architecture
- SVG/Canvas hybrid rendering approach
- D3.js for data binding and transformations
- 50+ scientific colormaps for spectrogram visualization
- Interactive zoom and pan functionality
- Real-time audio-visual synchronization

### Musical Transcription Features
- Continuous melodic trajectory system
- Microtonal pitch representation
- Multi-instrument simultaneous transcription
- Raga-based theoretical framework
- Spectrogram-guided transcription workflow

## Deployment

### Build Process
- Vite handles ES module bundling
- TypeScript compilation with strict typing
- Audio worklet assets handling
- Source maps for debugging

### Deployment

#### Automated Deployment (GitHub Actions)
**Frontend deployment** is fully automated via GitHub Actions:
- **Triggers**: Push to `main` branch (ignoring Python-only changes)
- **Build**: `pnpm install` → `pnpm build` (Vite production build)
- **Deploy**: Rsync to `root@137.184.90.119:/var/www/html/`
- **Changelog**: Automatically generated from conventional commits (`feat:`, `fix:`, etc.)

#### Manual Deployment (Server Components)
```bash
pnpm deployTSServer     # TypeScript server deployment (manual)
pnpm deployShared       # Deploy shared TypeScript types (manual)
# Python scripts deployed separately via individual deploy commands
```

#### Current Hybrid Workflow
1. **Frontend changes**: Commit to main → **automatic build & deployment**
2. **Backend changes**: Manual `pnpm deployTSServer` → commit to main
3. **Full-stack changes**: Deploy backend manually first, then push frontend for auto-deployment

#### Build Process for Server
- **esbuild** compiles `extract.ts` → `extract.js` for data processing
- **TypeScript compilation** with ES2020/CommonJS output
- **Modular server architecture**: `server.ts`, `apiRoutes.ts`, `oauthRoutes.ts`
- **Legacy server.js** being phased out in favor of TypeScript version

#### Deployment Infrastructure
- **Primary server**: `137.184.90.119` - Main application server
- **Production domain**: `swara.studio` - Python processing scripts
- **CI/CD**: GitHub Actions with SSH key authentication
- **Rsync-based deployment** for both automated and manual deployments

## Key Patterns and Conventions

### Frontend Patterns
- Vue 3 Composition API with `<script setup>`
- TypeScript interfaces for type safety
- Composable functions for reusable logic
- Event-driven architecture
- Reactive data binding with computed properties

### Backend Patterns
- Express middleware for authentication
- MongoDB aggregation pipelines
- Async/await error handling
- RESTful API design principles
- Microservice integration with Python

### Data Flow
- Client → Server → MongoDB for persistence
- Client → Python scripts for analysis
- Real-time audio processing in browser
- File system integration for audio/visualization

## Performance Optimizations

- Web Workers for heavy computation
- AudioWorklet for low-latency audio processing  
- Canvas-based rendering for smooth graphics
- Lazy loading of visualizations
- Efficient MongoDB queries with proper indexing
- Progressive Web App capabilities

## Integration Points

### Python Integration
- Server calls Python scripts for audio analysis
- Spectrogram and melograph generation
- Audio format conversion via FFmpeg
- Data exchange via JSON serialization

### File System
- Organized audio storage by ID
- Generated visualization caching
- User-uploaded file management
- Temporary file cleanup

This architecture provides a sophisticated platform for musical transcription and analysis, balancing research-grade analytical capabilities with intuitive user interfaces for both academic and practical applications.