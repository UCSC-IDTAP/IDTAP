# Spectrogram System

The spectrogram system is one of IDTAP's most innovative technical achievements. Unlike typical web-based spectrogram viewers that serve pre-rendered images, IDTAP separates **data generation** (Python/server) from **visual rendering** (browser/Web Worker), enabling users to dynamically change colormaps, intensity curves, and frequency ranges without any server round-trips.

---

## Architecture Overview

```
Audio Upload → Python CQ Transform → Gzipped uint8 data → Server static files
                                                                    ↓
Browser: Fetch + Decompress → Web Worker (3-stage pipeline) → ImageData transfer
                                                                    ↓
Vue Component: Multi-canvas tiling → IntersectionObserver lazy loading → Display
```

---

## Stage 1: Python Data Generation (Server-Side)

**Key file:** `python/visualization_scripts/make_spec_data.py`

When audio is uploaded, the Node.js server spawns a Python process that generates spectrogram **data** (not images):

1. **Audio loading**: Essentia's `EasyLoader` reads the WAV file.

2. **Constant-Q Transform**: Uses Essentia's `NSGConstantQ` (Non-Stationary Gabor Constant-Q Transform):
   - `minFrequency`: 75 Hz
   - `maxFrequency`: 2400 Hz
   - `binsPerOctave`: **72** (6 bins per semitone -- extraordinary frequency resolution for microtonal music)
   - `gamma`: 20 (controls time-frequency tradeoff)
   - Processes audio in 600-second chunks to manage memory, then horizontally concatenates results

3. **Log-amplitude conversion**: `log10` of absolute CQ magnitudes (with zero-replacement to avoid log(0)).

4. **Quantization to uint8**: Normalizes the entire spectrogram to 0-255 range. This is a critical design decision -- the full spectrogram becomes a single-channel grayscale intensity matrix, maximally compact.

5. **Gzip compression**: The raw bytes are gzip-compressed and written to `spec_data.gz`.

6. **Shape metadata**: The 2D shape `[height, width]` is written to `spec_shape.json`.

**Why 72 bins per octave:** Indian classical music uses microtonal ornamentations (gamakas, meends) spanning intervals smaller than a semitone. At 72 bins/octave (~17-cent resolution), these fine pitch movements are visible in the spectrogram, which is essential for spectrogram-guided transcription.

**Output:** Two files served statically:
- `https://swara.studio/spec_data/{audioID}/spec_data.gz`
- `https://swara.studio/spec_data/{audioID}/spec_shape.json`

---

## Stage 2: Web Worker Rendering Pipeline

**Key file:** `src/ts/workers/spectrogramWorker.ts`

A dedicated Web Worker handles the entire rendering pipeline off the main thread, using a **three-stage processing model** with a tile-based dispatcher.

### Data Loading

On initialization, the worker:
1. Fetches `spec_data.gz` and `spec_shape.json` in parallel
2. Decompresses the gzip data using **pako** (JavaScript zlib implementation)
3. Wraps the raw bytes in an **ndarray** (NumPy-like n-dimensional array for JavaScript)
4. If an excerpt range is specified, crops the time axis via `ndarray.lo().hi()`

### The Three-Stage Pipeline

Each pixel passes through three sequential transformations, each operating on tile columns:

**Stage 1 -- Scale (`scaleCol`):** Bilinear interpolation from CQ data dimensions to display dimensions. Proper 2D interpolation with fractional pixel weights:
```
val = (1-a) * ((1-b) * y1x1 + b * y1x2) + a * ((1-b) * y2x1 + b * y2x2)
```
This enables smooth zooming without pixelation.

**Stage 2 -- Intensify (`intensifyCol`):** Power-law intensity mapping via a 256-entry lookup table (LUT). Each pixel value `v` maps to `floor(v^power / maxVal^power * 255)`. This lets users boost quiet signals or compress dynamic range. When `power === 1`, it's a simple copy (optimized fast path).

**Stage 3 -- Colorize (`colorizeCol`):** Maps each 0-255 intensity value to RGB via a precomputed 256-entry colormap LUT built from d3-scale-chromatic interpolation functions.

### The Dispatcher: Tile-Based Task Scheduling

The `Dispatcher` class divides the full-width spectrogram into **tiles** of 1000 pixels each (the `maxCanvasWidth` constant, shared with the Vue component).

**Task matrix:** Each tile tracks which stages have been completed:
```typescript
{ scaled: boolean, intensified: boolean, colorized: boolean, width: number, startX: number }
```

**Two queues with priority:**
- **Priority queue**: Visible or requested tiles -- processed immediately through all three stages
- **Background queue**: Pre-scheduled work for all tiles, processed when idle

**Cascade invalidation -- the key optimization:**
When parameters change, only the necessary stages are re-run:

| Change | Stages re-run | Cost |
|--------|--------------|------|
| Colormap change | Colorize only | Cheap (LUT lookups) |
| Intensity power change | Intensify + Colorize | Medium |
| Zoom/resize | Scale + Intensify + Colorize | Full rebuild |
| Frequency range crop | Re-crop + full rebuild | Full rebuild |

This means changing a colormap is near-instantaneous even for a 30-minute recording, because the expensive bilinear interpolation from Stage 1 is reused.

### ImageData Transfer

After all stages complete for a tile, the result is posted back to the main thread. The array buffer is **transferred** (not copied) via `self.postMessage(msg, [slice.buffer])` -- a zero-copy operation for maximum performance.

---

## Stage 3: Vue Component (Canvas Rendering and Lazy Loading)

**Key file:** `src/comps/editor/renderer/SpectrogramLayer.vue`

### Multi-Canvas Tiling

The spectrogram is rendered across **multiple adjacent canvas elements**, each up to 1000 pixels wide, laid out in a horizontal flex container. This design:
- Avoids browser canvas size limits (long recordings at high zoom can be tens of thousands of pixels wide)
- Enables per-tile lazy loading
- Aligns with the worker's tile-based dispatcher

### IntersectionObserver-Based Lazy Loading

An `IntersectionObserver` monitors all canvases. When a canvas enters the viewport:
1. A cooldown check prevents thrashing (1000ms `CANVAS_RELOAD_COOLDOWN_MS`)
2. A `requestRenderData` message is sent to the worker with the canvas index
3. The worker's dispatcher adds the tile to its priority queue
4. When processing completes, `ImageData` is posted back and written via `ctx.putImageData()`

### Bidirectional Memory Management

The system actively **unloads** distant canvases to free GPU/memory resources:

- **Unload threshold**: Tiles beyond ±10 of the viewport are cleared (canvas dimensions reset to force GPU memory release, then re-registered with the observer)
- **Preloading**: 2 tiles ahead and 2 behind the viewport are preloaded for smooth scrolling
- **Preload batching**: Processed at 2 canvases per `requestAnimationFrame` to prevent main-thread blocking
- **Scroll throttling**: `checkForDistantCanvases()` is throttled to 50ms

### Resize Handling

When dimensions change (from zoom):
1. All canvases are destroyed and recreated at new dimensions
2. A `scale` message is sent to the worker, which reallocates internal buffers and rebuilds the task matrix
3. IntersectionObserver re-observes the new canvases, triggering lazy rendering

---

## Stage 4: User Controls

**Key file:** `src/comps/editor/audioPlayer/SpectrogramControls.vue`

### Colormap Selection

A `SwatchSelect` component generates SVG gradient swatches for all **36 colormaps** from d3-scale-chromatic, including:
- Perceptually uniform sequential: Viridis, Magma, Inferno, Plasma, Cividis
- Diverging: RdBu, PiYG, PRGn, BrBG
- Sequential single-hue: Blues, Greens, Reds, Greys
- Multi-hue: YlOrRd, YlGnBu, BuPu
- Cyclic: Rainbow, Sinebow
- Specialty: Turbo, Warm, Cool, CubehelixDefault

### Intensity Power Control

A numeric input (1.0 to 5.0, step 0.1) controls the power-law exponent. Higher values compress dynamic range, making quiet features more visible.

### Frequency Range (Pitch Cropping)

The user selects min/max pitches from **raga-derived pitch options** (not raw Hz). The system:
1. Gets all pitches in the current raga between 40 Hz and 2400 Hz
2. Sends a `crop` message to the worker with `logMin` and `logMax` in log2 frequency space
3. The worker crops the original data array using ndarray operations

This ties the spectrogram visualization directly to the musical theory framework -- the frequency axis is defined by the raga being analyzed, and bounds are selected using sargam notation (Sa, Re, Ga, etc.) rather than raw Hz values.

### Sa Reference Frequency

An oscillator node provides an audible reference tone at the fundamental frequency. The slider works in log2 space for perceptually uniform pitch adjustment.

### Display Settings Persistence

Users can save and load complete display configurations (colormap, intensity, pitch range, zoom factors) to the server, identified by UUID.

---

## Performance Characteristics

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| Data/rendering separation | Server sends raw uint8, not images | All visual params change without network requests |
| Off-main-thread processing | Web Worker pipeline | UI stays responsive during rendering |
| LUT-based operations | 256-entry lookup tables | Per-pixel work reduced to array indexing |
| Tile architecture | 1000px tiles | Progressive rendering, memory management |
| Cascade invalidation | Stage-tracking per tile | Colormap changes skip expensive interpolation |
| Zero-copy transfer | Transferable ArrayBuffers | No memory copying between threads |
| Gzip compression | Server-side compression, client-side pako decompression | Reduced download size |
| ndarray | NumPy-like strided array operations | Efficient N-dimensional data manipulation |
| Bidirectional preloading | 2 tiles ahead + 2 behind | Smooth scrolling experience |
| Throttled scroll handling | 50ms throttle on scroll checks | Prevents computation storms |

---

## What Makes This Innovative

1. **Most spectrogram viewers pre-render images.** IDTAP sends raw intensity data and renders entirely client-side. This is the fundamental architectural insight that makes everything else possible.

2. **The three-stage pipeline with selective invalidation** is unusual. Most systems re-render everything when any parameter changes. IDTAP's stage-tracking means a colormap change only re-runs the cheapest stage (array lookups), not the expensive bilinear interpolation.

3. **The Constant-Q Transform at 72 bins/octave** provides musically meaningful frequency resolution with logarithmic spacing -- native to musical pitch perception. Standard FFT spectrograms have linear frequency spacing and would require enormous FFTs to achieve comparable low-frequency resolution.

4. **Raga-aware pitch-range cropping** ties visualization directly to musical theory. Users select frequency bounds using sargam notation, not raw Hz values.

5. **The memory management strategy** (unloading distant tiles, preloading nearby ones, cooldown-based thrashing prevention) solves a real problem for long recordings. A 30-minute raga performance at high zoom could produce thousands of tiles.

6. **The dispatcher's priority queue** ensures user-visible content is always processed first, with background rendering filling in the rest.

---

## Key Files

| Component | Path |
|-----------|------|
| Python data generator | `python/visualization_scripts/make_spec_data.py` |
| Melograph generator | `python/visualization_scripts/generate_melograph.py` |
| Web Worker (pipeline + dispatcher) | `src/ts/workers/spectrogramWorker.ts` |
| Worker singleton manager | `src/ts/workers/workerManager.ts` |
| SpectrogramLayer (canvas tiling) | `src/comps/editor/renderer/SpectrogramLayer.vue` |
| SpectrogramControls (UI) | `src/comps/editor/audioPlayer/SpectrogramControls.vue` |
| SwatchSelect (colormap picker) | `src/comps/SwatchSelect.vue` |
| Shared types (CMap enum) | `shared/types.ts` (lines 722-790) |
| Legacy image generator | `python/visualization_tools/generate_log_spectrograms.py` |
