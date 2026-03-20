# Audio Synthesis Engines

IDTAP implements six distinct audio processing units as Web Audio API AudioWorklets, plus a main-thread metronome synth and a capture/loop system. Together they form a real-time physical-modeling synthesis pipeline for Indian classical music, driven by continuous melodic trajectory data rather than discrete note events.

This is notable for a web application -- running Karplus-Strong, bowed-string waveguide, and full Klatt formant synthesis inside AudioWorklet processors achieves low-latency, glitch-free audio on the dedicated audio rendering thread.

---

## 1. Karplus-Strong Plucked String (Sitar)

**Files:** `src/audioWorklets/karplusStrong.worklet.js` (legacy), `karplusStrong2.worklet.js` (active)

### Algorithm

Classic Karplus-Strong synthesis -- a feedback delay line with a first-order IIR lowpass filter in the loop:

```
y[n] = cutoff * x[n] + (1 - cutoff) * y[n-1]
```

The delay line length is set to one period of the target frequency (`sampleRate / freq` samples), so the recirculating signal naturally produces a pitched tone. The feedback loop simulates gradual high-frequency energy loss of a vibrating string -- higher cutoff produces brighter, more metallic tone; lower cutoff produces darker, faster-decaying tone.

### Parameters
- **Frequency** (50-2000 Hz): Pitch of the string, controlled sample-accurately via `setValueCurveAtTime` from trajectory data
- **Cutoff** (0-1): Lowpass filter coefficient; used to model dampen articulations in real-time

### Implementation
- `Float32Array(2048)` ring buffer with bitmask pointer wrapping (`& 2047`) -- a micro-optimization avoiding modulo in the inner loop
- The v2 implementation properly encapsulates all state as instance properties, fixing a multi-instance bug in v1 where module-level variables were shared across worklet instances
- Excitation comes from an external input node (noise bursts injected to simulate plucks)

### Instrument Mapping
Two instances per Sitar track:
- **Main string**: Passes through a DC-offset highpass filter (5 Hz) and a lowpass filter tuned to 3 octaves above the raga's fundamental, giving a focused melodic tone
- **Jor string**: Bypasses these filters for a rawer timbral character

---

## 2. Sarangi Bowed String

**Files:** `src/audioWorklets/sarangi.worklet.js` (v1), `sarangi2.worklet.js` (v2/active)

### Algorithm

A bowed-string physical model using a dual delay line (digital waveguide) with noise excitation and formant body resonance shaping. Substantially more complex than Karplus-Strong:

1. **Excitation**: White noise filtered through a bandpass filter (configurable center frequency, default 800 Hz) simulates bow noise. The `BowGain` parameter controls excitation amplitude -- ramping from 0 to 0.5 simulates bow contact; ramping to 0 simulates bow lift.

2. **Dual delay lines**: Two circular buffers (`delay1`, `delay2`) of 2048 samples form a traveling-wave decomposition. Each line represents one direction of wave travel on the string. Delay time is set to `period/2`. The feedback gain is 0.98, providing sustained resonance.

3. **Body resonance modeling**: Output from delay2 passes through a parallel bank of **5 bandpass resonators** at frequencies `[185, 275, 405, 460, 530]` Hz (Q=1), modeling the body resonances of a sarangi. The outputs are summed and passed through a notch filter at 10 kHz to remove harsh high-frequency content.

### Parameters
- **Frequency** (50-2000 Hz): Supports both k-rate and a-rate (per-sample) automation
- **BowGain** (0-1): Excitation level, a-rate capable; used for onset/offset envelopes
- **Gain** (0-1): Output gain, a-rate; driven by per-trajectory automation curves
- **BandPassFrequency** (100-5000 Hz): Bow noise spectral center
- **BandPassQ** (0.1-10): Bow noise bandwidth

### Custom BiquadFilter
Both sarangi worklets include a full biquad IIR filter implementation supporting lowpass, bandpass, and notch filters with coefficient recalculation. Filter coefficients are only recalculated when the parameter actually changes (epsilon comparison), avoiding unnecessary computation.

### Instrument Mapping
Two instances per Sarangi track (main + second string), mirroring Sitar's polyphonic architecture.

---

## 3. Chikari 4-String Drone

**File:** `src/audioWorklets/chikaris4.worklet.js`

### Algorithm

Four independent Karplus-Strong delay lines running in parallel, each with its own frequency, gain, and smoothing filter. Models the 4 chikari (drone/rhythm) strings of a sitar.

### Unique Features

**Strum simulation**: A second set of 4 delay lines implements per-string onset delays. The application sends sample offsets computed from frequency-sorted string order (lowest to highest), creating a realistic staggered strum attack (~2ms per string).

**Per-string gain control**: Parameters `stringGain0`-`stringGain3` allow individual string muting/unmuting. Strings with no configured frequency have their gain set to 0.

**Raga-aware tuning**: Default tuning is Sa (oct 2), Sa (oct 1), Pa (oct 0), Ga (oct 0). The third and fourth pitches are derived from the raga -- Pa is included only if present in the raga's rule set; Ga is included only if exactly one variant (raised or lowered) exists, preventing ambiguity.

### Parameters
- **freq0-freq3** (50-2000 Hz): Individual string frequencies
- **Cutoff** (0-1): Shared lowpass coefficient (default 0.7, brighter than melody strings)
- **stringGain0-stringGain3** (0-1): Per-string amplitude

### Excitation
Pink noise bursts generated in `Synths.vue` using the Paul Kellett algorithm (7 first-order IIR filters on white noise), with configurable strum delay and amplitude.

---

## 4. Klatt Formant Vocal Synthesizer

**File:** `src/audioWorklets/klattSynth2.worklet.js`

### Algorithm

A full implementation of the Klatt cascade/parallel formant synthesizer -- the most complex engine in the system. This is a complete digital voice synthesis system from first principles:

**Glottal source** (three modes):
- **Impulsive**: Resonator-based impulse train
- **Natural**: Parabolic glottal pulse with open/closed phases (LF-model-like waveform generated by integrating linearly-changing acceleration)
- **Noise**: For whispered/breathy speech

**Flutter**: F0 modulation with three summed sinusoids at irrational frequency ratios (12.7, 7.1, 4.7 Hz), simulating natural vocal pitch perturbation (jitter). Each instance gets a random time offset for decorrelation.

**Cascade branch**: Glottal source → aspiration mixing → nasal antiformant → nasal formant → 6 oral formant resonators in series

**Parallel branch**: Glottal source → differencing filter → frication noise mixing → parallel formant resonators with alternating-sign summation and peak-gain compensation

**AGC**: RMS-based output normalization for consistent loudness

### Parameters (48 AudioParam descriptors)
- `f0` (0-1000 Hz): Fundamental frequency
- `f1`-`f6`: Oral formant frequencies (up to 6 formants)
- `b1`-`b6`: Oral formant bandwidths
- `db1`-`db6`: Oral formant gains (parallel branch)
- `flutterLevel`, `openPhaseRatio`, `breathinessDb`, `tiltDb`, `gainDb`, `agcRmsLevel`
- `cascadeEnabled`, `parallelEnabled`: Branch selection
- Nasal formant/antiformant frequencies with toggle
- `extGain`: External amplitude automation

### Vowel System
The orchestrator (`Synths.vue`) maps **11 Devanagari vowels** (a, aa, i, ii, u, uu, e, ai, o, au, schwa) to formant parameter sets. Each vowel has onset and steady-state formant targets (F1/F2/F3/B1/B2/B3), with a 0.3-second linear ramp simulating natural vowel transition. A `uniformVowel` toggle allows switching between per-syllable vowel modeling and a single neutral vowel for comparative analysis.

### Instrument Mapping
Used for `Vocal_M` and `Vocal_F` tracks. Glottal source type is hardcoded to "natural" (parabolic pulse).

---

## 5. Woodblock Metronome

**File:** `src/synths/woodblock.ts`

### Algorithm

A percussive click synthesizer using two sine oscillators at an inharmonic frequency ratio (1:2.7):
- **Amplitude envelope**: 1ms linear attack, 120ms exponential decay
- **Noise FM**: 15ms burst of white noise modulating osc2's frequency (60 Hz depth), creating the characteristic noisy onset of wooden percussion

### Tala Integration

Distinguishes two rhythmic levels of the Indian tala system:
- **Vibhag beats** (structural divisions): Lower pitch (600 Hz), louder (0.6 amplitude)
- **Matra beats** (individual time units): Higher pitch (900 Hz), softer (0.4 amplitude)

The `scheduleMetronome` function calculates vibhag positions from the meter's hierarchical structure and schedules the appropriate attack. This is the only synthesizer running on the main thread.

---

## 6. Capture Audio (Recording/Loop System)

**File:** `src/audioWorklets/captureAudio.worklet.js`

### Purpose

Not a synthesizer but a real-time recorder that captures synthesized output for loop playback. Implements a "record then loop" workflow where a section is played through the synthesis engines, captured, and then seamlessly looped.

### Architecture
- 2 input channels: input 0 receives main string(s) submix; input 1 receives chikari
- Dual ring buffers (`_stringBuffer` and `_chikBuffer`) of up to 20 seconds at 48 kHz
- State machine: `first` → `on` (recording) → flush (sends buffer to main thread) → `first`

### Flush Mechanism
When `_bytesWritten` reaches target `BufferSize`:
1. Apply 1000-sample (~21ms) linear fade-in/fade-out to prevent clicks at loop boundaries
2. Post both buffers back to main thread via `port.postMessage`
3. Reset to initial state

### Loop Playback
When captured audio arrives via `port.onmessage`:
1. Float32Array data converted to AudioBuffers
2. BufferSourceNodes configured with `loop = true`
3. Playback starts with time offset calculated from recording end time
4. Live synthesis gains faded to 0 while loop gains fade to 1 -- seamless crossfade

---

## Polyphonic Routing Architecture

**File:** `src/comps/editor/audioPlayer/Synths.vue`

`Synths.vue` is a renderless Vue component that constructs and manages the entire Web Audio graph.

### Signal Flow: Sitar

```
Main KS Node → DC Highpass (5Hz) → Lowpass (fund*8) → intSitarGain → extSitarGain → outGain → sonifyNode → mixNode → destination
Jor KS Node → intJorGain → extSitarGain (shared)
Chikari4 Node → DC Highpass → intChikariGain → extChikariGain → outGain

Capture: mainStringsSubmix (intSitarGain + intJorGain) → input 0; intChikariGain → input 1
Loop: BufferSources → respective loop gains → respective ext gains
```

### Signal Flow: Sarangi

```
Main Sarangi Node → intGain → mainStringsSubmix → extGain → sonifyNode → mixNode → destination
Second Sarangi Node → intSecondGain → mainStringsSubmix (shared)
```

### Signal Flow: Klatt Voice

```
Klatt Node → envGain → intGain → extGain → sonifyNode → mixNode → destination
```

### Gain Staging
- **intGain** (internal): 25ms ramp at play start/stop to prevent clicks
- **extGain** (external): User-adjustable volume
- **outGain**: Track output (-3dB compensation for sitar: `* 0.707`)
- **sonifyNode**: Binary mute/unmute per track
- **mixNode**: Master output gain

### Trajectory-to-Synthesis Mapping

The system converts IDTAP's continuous trajectory representation into AudioParam automation:
1. Each trajectory's pitch contour is sampled at **50 Hz** (20ms intervals) using `traj.compute(t)` which evaluates the interpolation at normalized position `t`
2. The resulting Float32Array is scheduled via `setValueCurveAtTime()` for seamless, artifact-free pitch glides
3. Transposition applied as frequency multiplier: `2^(cents/1200)`

### Excitation System

The `sendBurst` function generates pink noise (Paul Kellett algorithm) with an attack ramp. Different articulation types get different burst amplitudes:
- Pluck: 0.5
- Hammer-off: 0.5
- Hammer-on: 0.3
- Slide: 0.1
- Dampen: Temporarily ramps Cutoff to 0 and back, simulating palm muting

---

## What Makes This Innovative

1. **Continuous pitch representation in Web Audio**: Most Web Audio synths deal in discrete notes. IDTAP schedules continuous frequency curves via `setValueCurveAtTime`, the correct way to represent the ornamental pitch movements central to Indian classical music.

2. **Physical modeling in AudioWorklets**: Running these DSP algorithms on the dedicated audio rendering thread achieves low-latency, glitch-free synthesis without blocking the UI.

3. **Dual-string polyphonic architecture**: Separate AudioWorklet instances per string, routed through a shared gain structure. Allows independent pitch contours and articulations while maintaining unified capture and loop.

4. **Record-then-loop in AudioWorklets**: Real-time capture on the audio thread, posted back for loop playback, with scheduled crossfade from live to looped audio.

5. **Tala-aware metronome**: The woodblock understands hierarchical tala structure, distinguishing vibhag from matra beats -- not just a flat click track.

6. **Formant-driven vocal synthesis with Indian vowels**: Maps Devanagari vowels to formant targets with onset-to-steady-state transitions, tracking not just pitch but vowel identity.

7. **Per-sample parameter automation**: Both sarangi and Klatt engines support a-rate parameter changes when the Web Audio API provides per-sample arrays via `setValueCurveAtTime`.

8. **Sarangi body resonance modeling**: Parallel bank of 5 bandpass filters at carefully chosen frequencies approximates sarangi body modes. Combined with the bowed-string waveguide, this produces a recognizable sarangi timbre from first principles -- no samples required.

---

## Key Files

| Component | Path |
|-----------|------|
| Karplus-Strong v2 (active) | `src/audioWorklets/karplusStrong2.worklet.js` |
| Sarangi v2 (active) | `src/audioWorklets/sarangi2.worklet.js` |
| Chikari 4-string | `src/audioWorklets/chikaris4.worklet.js` |
| Klatt vocal synth | `src/audioWorklets/klattSynth2.worklet.js` |
| Capture audio | `src/audioWorklets/captureAudio.worklet.js` |
| Woodblock metronome | `src/synths/woodblock.ts` |
| Synthesis orchestrator | `src/comps/editor/audioPlayer/Synths.vue` |
| Audio player component | `src/comps/editor/audioPlayer/EditorAudioPlayer.vue` |
