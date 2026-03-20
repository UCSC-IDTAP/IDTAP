# Deployment and Infrastructure

---

## Production Environment

### Server
- **Provider:** DigitalOcean
- **IP:** `137.184.90.119`
- **Domain:** `swara.studio`
- **OS:** Linux (Ubuntu)
- **Node.js:** Runs in tmux session with nodemon
- **Python:** 3.11 via uv-managed venv at `/opt/idtap-python/`
- **Web server:** Nginx serving static frontend at `/var/www/html/`

### Database
- **MongoDB Atlas** (cloud-hosted)
- **Database name:** `swara`
- Connection via MongoDB driver (connection string in server environment)

### File System Layout

```
/var/www/html/              # Frontend build (Vite output, served by Nginx)
/root/
├── server.ts               # Server source (deployed via rsync)
├── apiRoutes.ts
├── oauthRoutes.ts
├── tsconfig.json
├── extract.ts / extract.js
├── aggregations.js
├── package.json
├── pnpm-lock.yaml
├── node_modules/           # Server dependencies
├── shared/                 # Shared TypeScript types
├── audioEvents/            # Audio file storage
│   └── {audioFileId}/
│       ├── audio.wav
│       └── audio.opus (original)
├── spec_data/              # Spectrogram data (served statically)
│   └── {audioFileId}/
│       ├── spec_data.gz
│       └── spec_shape.json
├── melograph_data/         # Melograph pitch contours
│   └── {audioFileId}/
│       └── melograph_data.json
├── backups/                # Daily MongoDB backups
│   ├── backup_mongo.py     # Backup script (cron)
│   └── YYYY-M-D/
│       └── swara/          # BSON dumps per collection
└── nodemon.json            # Nodemon configuration
/opt/idtap-python/          # Python virtual environment
```

---

## CI/CD Pipelines (GitHub Actions)

### Frontend Deployment (`update-changelog.yml`)

**Trigger:** Push to `main` branch (ignoring Python-only changes)

```
Push to main → Generate changelog from conventional commits →
pnpm install → pnpm build (Vite) →
rsync dist/ to root@137.184.90.119:/var/www/html/
```

This is fully automated. Merging a PR to main deploys the frontend to production.

### PR Testing (`ci.yml`)

**Trigger:** Pull request to `main`

- **JavaScript tests:** Node 22.9.0, pnpm install, `pnpm test`
- **Python tests:** Python 3.11 via uv, `pytest`

### Claude Code Review (`claude-review.yml`)

**Trigger:** Comment `@claude review` on any PR

- AI-powered code review with sticky comment updates
- Read-only permissions

---

## Manual Deployment Commands

### Backend Server

```bash
pnpm deployTSServer
```

This single command:
1. Runs `esbuild` to compile `extract.ts` → `extract.js`
2. Rsyncs `shared/` directory
3. Rsyncs server TypeScript files + `aggregations.js` + `tsconfig.json`
4. Rsyncs `server/package.json`
5. Rsyncs `server/pnpm-lock.yaml`
6. SSHs into server and runs `pnpm install --frozen-lockfile`

Nodemon detects the file changes and automatically restarts the Node.js process.

### Python Scripts

Individual deploy commands for each script (defined in root `package.json`):

```bash
pnpm deployMakeExcel            # Excel export generator
pnpm deployProcessAudio          # Audio processing
pnpm deployGenerateSpectrograms  # Legacy spectrogram image generator
pnpm deployGenerateMelograph     # Melograph pitch contour extractor
pnpm deployMakeSpecData          # Spectrogram data generator
pnpm deployGeneratePeaks         # Peak data generator
pnpm deployVisualizationScripts  # All visualization scripts
pnpm deployMassUploadProcessAudio # Mass upload processor
pnpm deployDirectoryWatcher      # Automated file watcher
pnpm deployAggregations          # Database aggregation scripts
pnpm deployNodemonConfig         # Nodemon configuration
```

Each command is a simple `rsync -a` to the production server.

### Shared Types

```bash
pnpm deployShared
```

Rsyncs the `shared/` directory to the server.

---

## Server Management

### tmux Session

The Node.js server runs in a tmux session. **Never restart it without explicit permission.**

```bash
# Safe: list sessions
ssh root@137.184.90.119 "tmux ls"

# To connect (only when necessary):
ssh root@137.184.90.119
tmux attach -t <session-name>
```

Nodemon handles automatic restarts when files are deployed. Manual restarts should only be done by the project maintainer.

### Checking Server Health

```bash
# Check if the process is running
ssh root@137.184.90.119 "ps aux | grep node"

# Check tmux sessions
ssh root@137.184.90.119 "tmux ls"

# Check server logs (via tmux attach)
```

---

## Backup System

### Automated Backups

**Script:** `/root/backups/backup_mongo.py`
**Schedule:** Daily via cron
**Output:** `/root/backups/YYYY-M-D/swara/`

Each backup contains BSON dumps and metadata JSON for all MongoDB collections:
- `transcriptions.bson` / `.metadata.json`
- `audioFiles.bson`
- `users.bson`
- `musicians.bson`
- `ragas.bson`
- `collections.bson`

### Restoration Procedures

**Full database restoration (to test database first):**
```bash
mongorestore --uri 'mongodb+srv://export_robot:PASSWORD@swara.f5cuf.mongodb.net/test_restore_YYYY_MM_DD' \
             --drop /root/backups/YYYY-M-D/swara/
```

**Single document recovery:**
```bash
# Export from backup
mongoexport --uri 'mongodb+srv://...' --collection transcriptions \
            --query '{"_id": {"$oid": "DOC_ID"}}' --out /root/doc.json

# Import to live database
mongoimport --uri 'mongodb+srv://...' --collection transcriptions \
            --file /root/doc.json --upsert
```

**Search across backups:**
```bash
for backup in /root/backups/2025-*/swara/; do
    echo "Checking $backup"
    bsondump "$backup/transcriptions.bson" 2>/dev/null | grep "SEARCH_TERM"
done
```

### Best Practices
1. Always test restoration against a separate database first
2. Verify data in MongoDB Atlas web interface before applying to production
3. Check for schema changes (newer fields may not exist in older backups)
4. Coordinate with team to ensure no active editing during restoration

---

## Security

### Authentication
- **Web clients:** Google OAuth via vue3-google-login with server-side verification
- **Python API:** OAuth 2.0 authorization code flow with JWT token exchange
- **Research waiver:** Consent tracking required for programmatic API access

### Infrastructure Security
- CORS configured for allowed origins
- Request timeouts (10 minutes for analysis, shorter for standard)
- File upload limit: 1GB
- Input validation and MongoDB query parameter sanitization
- Automated dependency scanning via Dependabot
- Regular CVE patching (fast-xml-parser, axios, vite, etc.)

### Known Security Gap
- **Issue #888:** `cloneTranscription` endpoint lacks authentication check

---

## Monitoring

There is currently **no formal monitoring** in place. The server relies on:
- Nodemon for automatic restarts on crash
- tmux for session persistence
- Daily backups for data safety

**Recommended additions:**
- Uptime monitoring (e.g., UptimeRobot)
- Error logging aggregation
- Database connection monitoring
- Disk space alerts (audio files and backups accumulate)
