# Vocal Separation Feature - Feasibility Analysis

## Executive Summary

**Recommendation: PROCEED WITH CAUTION - Client-side processing preferred over server-side**

While technically feasible, running Demucs on the current production server presents significant resource constraints. A hybrid approach with **optional client-side processing** or **queue-based batch processing** would be more sustainable.

---

## 1. Server Resource Analysis

### Current Infrastructure (137.184.90.119)
- **CPU**: 4 cores (Intel, no GPU)
- **RAM**: 7.8 GB total, ~5.9 GB available
- **Storage**: 92 GB available (42% used)
- **Python**: 3.8.10 (no PyTorch/Demucs installed)

### Demucs Requirements

**Demucs v4 (htdemucs_ft) - Two-stem model:**
- **RAM**: 3-4 GB per job (CPU mode)
- **Processing time** (CPU-only, 4 cores):
  - 3-minute audio: ~2-5 minutes
  - 10-minute audio: ~8-15 minutes
  - 30-minute audio: ~25-45 minutes
  - 60-minute audio: ~50-90 minutes
- **Storage per recording**:
  - Original WAV: ~300 MB (10 min @ 44.1kHz)
  - Vocals WAV: ~300 MB
  - Accompaniment WAV: ~300 MB
  - **Total: 3x original size**
  - With spectrograms: +~40 MB per stem
- **Dependencies**: PyTorch (~2 GB), Demucs (~500 MB)

### Resource Constraints

**🚨 CRITICAL ISSUES:**

1. **RAM Bottleneck**: With 5.9 GB available, running Demucs (3-4 GB) leaves only ~2 GB for OS/Node/MongoDB. Risk of OOM crashes during processing.

2. **No Concurrent Processing**: Can only process one recording at a time safely. Multiple users triggering separation simultaneously = server crash.

3. **CPU-Only Performance**: No GPU means 3-5x slower processing. A 30-minute concert recording could take 45 minutes to process.

4. **Storage Growth**: Current 25 GB audio → **75 GB** with all separations. Manageable but requires monitoring.

5. **Timeout Issues**: Node.js timeout is 10 minutes. Would need separate job queue system for longer recordings.

---

## 2. Technical Architecture

### Proposed Implementation

#### A. MongoDB Schema Extension

```typescript
// audioRecordings collection
{
  _id: ObjectId,
  // ... existing fields ...
  vocalSeparation: {
    enabled: boolean,              // User opted-in for this recording
    status: 'pending' | 'processing' | 'complete' | 'failed',
    processedDate: Date,
    error?: string,
    stems: {
      vocals: {
        path: string,              // 'separated/{audioID}/vocals.wav'
        specDataPath: string,      // 'spec_data/{audioID}/vocals_spec_data.gz'
        duration: number
      },
      accompaniment: {
        path: string,
        specDataPath: string,
        duration: number
      }
    }
  }
}
```

#### B. File Structure

```
/root/
├── audio/
│   ├── wav/
│   │   └── {audioID}.wav                    # Original
│   ├── separated/                           # NEW
│   │   └── {audioID}/
│   │       ├── vocals.wav
│   │       ├── vocals.mp3
│   │       ├── accompaniment.wav
│   │       └── accompaniment.mp3
│
├── spec_data/
│   └── {audioID}/
│       ├── spec_data.gz                     # Original mix
│       ├── vocals_spec_data.gz              # NEW - Vocal stem
│       └── accompaniment_spec_data.gz       # NEW - Instrumental stem
│
├── spectrograms/                            # Optional: static images
│   └── {audioID}/
│       ├── 0/                               # Original mix
│       ├── vocals_0/                        # NEW - Vocal stem
│       └── accompaniment_0/                 # NEW - Instrumental stem
```

#### C. Server Endpoints

```typescript
// New endpoint
POST /api/audio/separateVocals
{
  audioID: string,
  twoStemOnly: true  // vocals + accompaniment (not 4-stem)
}

// Response
{
  jobId: string,
  status: 'queued' | 'processing',
  estimatedTime: number  // seconds
}

// Poll endpoint
GET /api/audio/separationStatus/:jobId
{
  status: 'pending' | 'processing' | 'complete' | 'failed',
  progress: number,  // 0-100
  result?: {
    vocalsPath: string,
    accompanimentPath: string
  }
}
```

#### D. Python Processing Script

```python
# /python/audio_processing/separate_vocals.py

import demucs.api
import sys
import json

def separate_vocals(audio_id, input_path, output_dir):
    """
    Use Demucs two-stem model for vocals/accompaniment separation
    """
    # Load model (cached after first use)
    separator = demucs.api.Separator(model="htdemucs_ft")

    # Process (returns vocals and accompaniment)
    origin, separated = separator.separate_audio_file(input_path)

    # Save stems
    vocals_path = f"{output_dir}/vocals.wav"
    accompaniment_path = f"{output_dir}/accompaniment.wav"

    # Generate spectrograms for each stem
    make_spec_data(vocals_path, f"spec_data/{audio_id}/vocals_spec_data.gz")
    make_spec_data(accompaniment_path, f"spec_data/{audio_id}/accompaniment_spec_data.gz")

    return {
        "vocals": vocals_path,
        "accompaniment": accompaniment_path
    }
```

---

## 3. Frontend Architecture

### A. Audio Player Modifications

**New Controls** (in `EditorAudioPlayer.vue` or similar):

```vue
<template>
  <!-- Existing audio controls -->

  <!-- NEW: Stem separation controls (only show if vocalSeparation.enabled) -->
  <div v-if="recording.vocalSeparation?.status === 'complete'" class="stem-controls">
    <div class="slider-group">
      <label>Vocals</label>
      <input
        type="range"
        v-model="vocalsVolume"
        min="0"
        max="100"
        @input="updateStemMix"
      />
      <span>{{ vocalsVolume }}%</span>
    </div>

    <div class="slider-group">
      <label>Accompaniment</label>
      <input
        type="range"
        v-model="accompanimentVolume"
        min="0"
        max="100"
        @input="updateStemMix"
      />
      <span>{{ accompanimentVolume }}%</span>
    </div>
  </div>
</template>

<script setup>
// Load both stems as separate audio sources
const vocalsAudio = new Audio(`/audio/separated/${audioID}/vocals.mp3`);
const accompAudio = new Audio(`/audio/separated/${audioID}/accompaniment.mp3`);

// Sync playback
vocalsAudio.addEventListener('timeupdate', () => {
  accompAudio.currentTime = vocalsAudio.currentTime;
});

// Mix control
const updateStemMix = () => {
  vocalsAudio.volume = vocalsVolume.value / 100;
  accompAudio.volume = accompanimentVolume.value / 100;

  // Update spectrogram opacity
  emit('updateSpectrogramOpacity', {
    vocals: vocalsVolume.value / 100,
    accompaniment: accompanimentVolume.value / 100
  });
};
</script>
```

### B. Spectrogram Worker Modifications

**Challenge: Dual Spectrogram Display**

**Option 1: Dual Worker Instances (Simpler)**
```typescript
// SpectrogramLayer.vue
const vocalsWorker = getWorker('spectrogramVocals');
const accompWorker = getWorker('spectrogramAccomp');

// Load based on selected stem
if (stemMode === 'vocals') {
  vocalsWorker.postMessage({
    msg: 'process',
    payload: {
      audioID: props.audioID,
      stemType: 'vocals'  // Fetches vocals_spec_data.gz
    }
  });
} else if (stemMode === 'mix') {
  // Blend both (requires custom blending logic)
  // Render both canvases with opacity control
}
```

**Option 2: Single Worker with Stem Parameter (More Efficient)**
```typescript
// spectrogramWorker.ts - Modified fetch logic
if (stemType === 'vocals') {
  url = `https://swara.studio/spec_data/${audioID}/vocals_spec_data.gz`;
} else if (stemType === 'accompaniment') {
  url = `https://swara.studio/spec_data/${audioID}/accompaniment_spec_data.gz`;
} else {
  url = `https://swara.studio/spec_data/${audioID}/spec_data.gz`;  // Original
}
```

**Option 3: Blended Display (Most Complex)**
- Load both stems
- Render to separate offscreen canvases
- Blend with alpha compositing based on slider values
- Performance intensive but visually smooth

### C. UI Toggle in AudioRecordings Tab

```vue
<!-- AudioRecordings.vue -->
<template>
  <div v-for="recording in recordings" class="recording-row">
    <!-- Existing fields -->

    <!-- NEW: Vocal separation control -->
    <div class="vocal-separation">
      <button
        v-if="hasVocalist(recording) && !recording.vocalSeparation"
        @click="triggerSeparation(recording._id)"
        :disabled="separating"
      >
        Separate Vocals
      </button>

      <div v-else-if="recording.vocalSeparation">
        <span :class="`status-${recording.vocalSeparation.status}`">
          {{ recording.vocalSeparation.status }}
        </span>
        <button
          v-if="recording.vocalSeparation.status === 'complete'"
          @click="removeSeparation(recording._id)"
        >
          Remove Separation
        </button>
      </div>

      <span v-else class="disabled">
        (No vocalist)
      </span>
    </div>
  </div>
</template>

<script setup>
const hasVocalist = (recording) => {
  return Object.values(recording.musicians || {})
    .some(m => m.instrument.toLowerCase().includes('vocal'));
};

const triggerSeparation = async (audioID) => {
  separating.value = true;
  try {
    const response = await fetch('/api/audio/separateVocals', {
      method: 'POST',
      body: JSON.stringify({ audioID }),
      headers: { 'Content-Type': 'application/json' }
    });
    const { jobId } = await response.json();

    // Poll for completion
    pollSeparationStatus(jobId, audioID);
  } catch (error) {
    console.error('Separation failed:', error);
  } finally {
    separating.value = false;
  }
};
</script>
```

---

## 4. Complexity Assessment

### Spectrogram Worker Complexity: **HIGH** ⚠️

**Current State:**
- Single spec_data.gz file per recording
- One worker instance manages one spectrogram
- Lazy loading already complex (IntersectionObserver, preload queues, memory management)

**With Vocal Separation:**
- **3 spec_data files**: original, vocals, accompaniment
- **Stem switching**: User can toggle between stems dynamically
- **Blending mode**: Need to composite two spectrograms with opacity control
- **Synchronization**: Both stems must stay in sync during playback/scrolling
- **Memory management**: Need to manage 2-3x the data (could unload non-active stems)

**Mitigation Strategies:**
1. **Lazy stem loading**: Only load active stem's spectrogram
2. **Stem mode selector**: Simple toggle (like string selector for polyphonic instruments)
3. **Unload inactive stems**: Free memory when switching between vocals/accompaniment/mix
4. **Disable blending initially**: Start with simple toggle, add blending in v2

**Worker Complexity Rating:**
- **Option 1** (Dual workers): **Moderate** - More memory but simpler logic
- **Option 2** (Stem parameter): **Low** - Cleanest, most maintainable
- **Option 3** (Blending): **Very High** - Not recommended for MVP

---

## 5. Alternative Approaches

### **Recommendation: Client-Side Processing**

Instead of server-side Demucs, use **browser-based audio separation**:

#### A. Spleeter Web (TensorFlow.js)
- **Runs in browser** using WebAssembly + TensorFlow.js
- **2-stem model** available (~50 MB download)
- **Processing time**: Similar to audio duration (10 min audio = ~10 min processing)
- **RAM**: Uses client's GPU if available, falls back to CPU
- **No server load**: Everything happens client-side
- **User pays compute cost**: Their device, their time

**Pros:**
- Zero server resources
- Scales infinitely (each user processes on their own device)
- No storage pollution (stems stored in browser IndexedDB or temp files)
- Faster with GPU-enabled clients
- Better privacy (audio never sent to server)

**Cons:**
- Requires modern browser (WebAssembly, WebGPU optional)
- Initial model download (~50 MB)
- Drains user's battery/CPU
- Not available for batch processing

#### B. Hybrid Approach: Optional Server Processing

**Best of both worlds:**
1. **Primary path**: Client-side processing with Spleeter.js
2. **Fallback**: Server-side queue for:
   - Users with old browsers/devices
   - Batch processing of multiple recordings
   - Overnight processing of long concerts

**Implementation:**
```typescript
// Check client capability
if (hasWebAssembly && hasEnoughRAM) {
  // Use client-side Spleeter.js
  await separateVocalsInBrowser(audioFile);
} else {
  // Fall back to server queue
  await queueServerSeparation(audioID);
}
```

---

## 6. Storage Impact Analysis

### Current Usage
- Audio: 25 GB
- Spectrograms: 1.3 GB
- Spec data: 3.4 GB
- **Total: 29.7 GB**

### With Full Vocal Separation (All Recordings)
- Audio: 25 GB → **75 GB** (original + 2 stems × 50 recordings)
- Spec data: 3.4 GB → **10.2 GB** (3x per recording)
- **Total: 85.2 GB** (+55.5 GB)

### Available Space: 92 GB
**Remaining after full deployment: ~7 GB** ⚠️

**Mitigation:**
- Only process on-demand (not all recordings)
- Compress stems more aggressively (Opus at 96 kbps vs 192 kbps)
- Expire unused separations after 90 days
- Store stems on separate volume/S3

---

## 7. Implementation Roadmap

### Phase 1: MVP (Client-Side) - 2-3 weeks
1. Integrate Spleeter.js or similar library
2. Add "Separate Vocals" button in AudioRecordings tab (greyed out if no vocalist)
3. Process in browser, store stems in IndexedDB
4. Add stem toggle in audio player (vocals/accompaniment/mix)
5. Modify spectrogramWorker to accept stem parameter
6. Simple stem switching (no blending)

### Phase 2: Server Queue (Optional) - 2 weeks
1. Install Demucs on server (test with small recordings first)
2. Implement job queue (Bull/Bee-Queue + Redis)
3. Add MongoDB schema for separation tracking
4. Create `/api/audio/separateVocals` endpoint
5. Poll-based status updates in UI
6. Rate limiting (1 job per user at a time)

### Phase 3: Advanced Features - 3-4 weeks
1. Spectrogram blending mode
2. Opacity sliders tied to spectrogram display
3. Stem export functionality
4. Batch processing UI
5. Separation quality settings (fast/balanced/high)

---

## 8. Final Recommendations

### ✅ DO:
1. **Start with client-side processing** (Spleeter.js or similar)
2. **Add opt-in button** in AudioRecordings tab with vocalist detection
3. **Simple stem toggle** in audio player (vocals/accompaniment/mix)
4. **Test with 5-10 recordings** before rolling out to all users
5. **Monitor storage growth** and add expiration policy

### ⚠️ CAUTION:
1. **Server-side Demucs** only for background batch processing with queue
2. **Avoid concurrent processing** (max 1 job at a time)
3. **Set hard timeout** at 60 minutes for very long recordings
4. **Track RAM usage** during processing to prevent OOM

### 🚫 DON'T:
1. **Don't run Demucs synchronously** in HTTP request handlers
2. **Don't process all recordings automatically** (storage explosion)
3. **Don't implement spectrogram blending in MVP** (too complex)
4. **Don't promise real-time separation** (manage user expectations)

---

## 9. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Server OOM crash | High | Medium | Client-side processing + queue |
| Storage exhaustion | Medium | High | On-demand only + expiration |
| Processing timeout | Medium | High | Job queue + progress tracking |
| Poor separation quality | Low | Medium | Use well-tested model (htdemucs_ft) |
| Worker complexity | Medium | High | Phased implementation, start simple |
| Concurrent jobs crash | High | Medium | Queue with concurrency=1 |

---

## 10. Cost-Benefit Analysis

### Benefits
- **Better transcription accuracy**: Isolate vocal melodic contour
- **Educational value**: Study vocal technique separately
- **Research applications**: Computational musicology analysis
- **User satisfaction**: Highly requested feature in music transcription tools

### Costs
- **Development time**: 4-6 weeks for full implementation
- **Server resources**: RAM/CPU strain if server-side
- **Storage**: +55 GB if widely adopted
- **Maintenance**: New failure modes, monitoring, debugging
- **Complexity**: Significantly more complex audio pipeline

---

## Conclusion

**The feature is VIABLE but requires careful architecture choices:**

1. **Prefer client-side processing** (browser-based separation) to avoid server bottlenecks
2. **Implement as opt-in** per recording with vocalist detection
3. **Start with simple stem toggle**, defer spectrogram blending to v2
4. **Add server-side queue as fallback** for batch processing
5. **Monitor resource usage closely** and add expiration policies

The architecture is already well-suited for this feature (modular audio pipeline, extensible MongoDB schema, worker-based spectrogram rendering), but server resource constraints make client-side processing the safer choice for MVP.

**Go/No-Go Decision Point:**
- **GO** if implementing client-side separation first
- **NO-GO** if planning server-side only without queue system
- **DEFER** if team bandwidth doesn't allow 4-6 week project

