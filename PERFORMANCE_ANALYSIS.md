# Performance Analysis: DOM Element Accumulation in TranscriptionLayer

## Problem Statement
After ~10 minutes of using the transcription editor, the application becomes noticeably slow. The hypothesis is that D3 SVG path elements are accumulating in the DOM without cleanup, similar to how the IntersectionObserver lazy-loads content but never removes it.

## Current Architecture

### IntersectionObserver Lazy Loading System
**Location**: `src/comps/editor/renderer/TranscriptionLayer.vue` (lines 478-571)

**How it works**:
1. **Chunking**: Transcription is divided into time chunks (default 30s duration)
   - `piece.chunkedTrajs(inst, duration, stringIdx)` returns arrays of trajectories per chunk
   - `piece.chunkedPhraseDivs()`, `chunkedDisplaySargam()`, etc. for other elements

2. **Empty Div Placeholders**: Creates invisible `<div>` elements for each chunk
   - Each div represents a time chunk and is added to `emptyOverlay`
   - Map tracks which div corresponds to which chunk index

3. **Intersection Detection**: When a div enters viewport:
   - Renders ALL elements for that chunk:
     - Trajectories (melodic curves)
     - Phrase divisions
     - Sargam labels
     - Vowels/consonants (for vocals)
     - Bols (for sitar)
     - Chikaris
     - Meter grid
   - Calls `observer.unobserve(entry.target)` to stop watching that div

4. **One-Way Operation**: **Elements are NEVER removed** after rendering

### DOM Element Creation

For each trajectory rendered (`renderTraj()` at line 1901):
- **2 path elements** per trajectory:
  - Visible melodic curve path (3px stroke)
  - Invisible "shadow" path (10px stroke for mouse interaction)
- **Additional elements** depending on instrument:
  - Pluck symbols (Sitar)
  - Dampener symbols (Sitar)
  - Krintin symbols (Sitar)
  - Consonant symbols (Vocals)

For each sargam label (`renderSargam()`):
- **3 text elements** per label:
  - Sargam notation (Sa, Re, Ga...)
  - Solfege notation (Do, Re, Mi...)
  - Scale degree notation
  - All 3 exist in DOM, opacity toggled based on `sargamRepresentation`

For phrase divisions (`renderPhraseDiv()`):
- **2 line elements** per division:
  - Visible line
  - Shadow line for mouse interaction

**Typical transcription**: 10 minutes = 600 seconds
- Average 2-3 trajectories per second = **1200-1800 trajectories**
- With 2 paths each = **2400-3600 path elements**
- Plus sargam labels, phrase divs, articulations, etc.
- **Total DOM nodes: ~5000-10000 SVG elements**

### Current Removal Logic

**What DOES get removed**:
- `clearTranscription()` (line 2715): Removes ALL elements when resetting
- `removeTraj(traj)` (line 2727): Removes specific trajectory by `uId`
- Individual element updates (e.g., `refreshBol()` removes old, renders new)
- Selection boxes, drag dots, highlights (temporary UI elements)

**What DOESN'T get removed**:
- Elements outside current viewport that were previously rendered
- Elements from chunks user scrolled past
- Historical rendering artifacts from editing operations

## Performance Impact Analysis

### Browser Rendering Pipeline
1. **Layout Thrashing**: Browser must calculate positions for all DOM nodes
   - Even hidden/off-screen elements impact layout calculations
   - SVG path geometry calculations are expensive

2. **Memory Pressure**:
   - Each SVG path stores geometry data
   - Event listeners on shadow paths (mouseover, click, contextmenu)
   - D3 data binding maintains references

3. **Reflow/Repaint Cascades**:
   - Zoom operations (`watch(() => props.zoomXFactor)`) trigger full re-renders
   - Scroll position updates check ALL elements for visibility
   - Selection state changes re-color ALL selected elements

### Why 10 Minutes is the Threshold
- **First 5 minutes** (~150 chunks @ 30s each = 5 chunks):
  - IntersectionObserver renders ~5 chunks as user scrolls
  - ~1500-2500 DOM elements (manageable)

- **After 10 minutes** (~20 chunks):
  - User has likely scrolled through most/all of transcription
  - ALL chunks have been rendered and remain in DOM
  - ~5000-10000 DOM elements (noticeable slowdown)

- **After 30+ minutes**:
  - Multiple edit operations add/remove/re-render elements
  - Potential duplicates from failed cleanup
  - 10000+ DOM elements (significant lag)

## Proposed Solution: Bidirectional Lazy Loading

### Core Concept
Just as IntersectionObserver loads chunks when they enter viewport, implement cleanup when chunks leave viewport with sufficient distance.

### Implementation Plan

#### 1. Track Rendered Chunks
```typescript
// New state tracking
const renderedChunks = ref<Map<number, Set<string>>>(new Map());
// Map<chunkIndex, Set<elementUIds>>
```

**For each chunk, store**:
- Chunk index
- UIDs of all rendered elements (trajectories, sargam, phrase divs, etc.)

**Update on render**:
- When `observer` callback fires, add chunk index and element UIDs to `renderedChunks`

#### 2. Enhanced IntersectionObserver

**Current behavior**:
```typescript
if (entry.isIntersecting) {
  // Render chunk
  observer.unobserve(entry.target);
}
```

**New behavior**:
```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const idx = emptyDivIdxMap.get(entry.target as HTMLDivElement)!;

    if (entry.isIntersecting) {
      // Load chunk if not already loaded
      if (!renderedChunks.value.has(idx)) {
        renderChunk(idx);
      }
    } else {
      // Chunk left viewport - check if we should unload
      const viewportCenterChunk = getCurrentViewportCenterChunk();
      const distance = Math.abs(idx - viewportCenterChunk);

      if (distance > UNLOAD_THRESHOLD) {
        unloadChunk(idx);
      }
    }
  });
}, {
  root: emptyOverlay.value,
  rootMargin: '500px', // Load chunks slightly before visible
  threshold: 0.0
});
```

**Key parameters**:
- `UNLOAD_THRESHOLD`: How many chunks away before cleanup (e.g., 5-10 chunks)
- `rootMargin: '500px'`: Preload buffer for smooth scrolling

#### 3. Chunk Unloading Function

```typescript
const unloadChunk = (chunkIdx: number) => {
  const elementUIds = renderedChunks.value.get(chunkIdx);
  if (!elementUIds) return;

  // Remove DOM elements
  elementUIds.forEach(uId => {
    d3.selectAll(`.uId${uId}`).remove();
  });

  // Update render status
  // (Reset trajRenderStatus, sargamRenderStatus, etc. for these elements)

  // Clear from tracking
  renderedChunks.value.delete(chunkIdx);

  // Re-observe the empty div so it can be re-rendered if user scrolls back
  const div = emptyDivs.value[chunkIdx];
  if (div) {
    observer.observe(div);
  }
};
```

#### 4. Integration with Existing Systems

**Coordinate with**:
- `resetTranscription()`: Clear `renderedChunks` map
- `resetObserver()`: Re-initialize tracking for all chunks
- Edit operations: Ensure edited elements don't get unloaded while editing

**Edge cases to handle**:
- Selected trajectories (don't unload if selected)
- Currently playing chunk (keep loaded during playback)
- Chunks containing unsaved edits
- Phrase divisions spanning chunk boundaries

### Alternative Approach: Virtual Scrolling

**Concept**: Only render viewport + small buffer, destroy everything else

**Pros**:
- More aggressive memory savings
- Simpler logic (just viewport calculation)

**Cons**:
- More jarring experience (flash of unstyled content)
- Harder to implement with D3 (designed for persistent elements)
- Conflicts with smooth scroll animations

### Hybrid Approach (Recommended)

**Two-tier system**:
1. **Near viewport** (±2-3 chunks): Keep rendered (smooth scrolling)
2. **Far from viewport** (>5 chunks): Aggressive cleanup

**Benefits**:
- Smooth experience for normal scrolling
- Memory cleanup for long transcriptions
- Balances performance and UX

## Validation & Testing Plan

### Performance Metrics to Track
1. **DOM Node Count**:
   ```javascript
   document.querySelectorAll('svg path').length
   ```
   - Before: Should grow unbounded with scrolling
   - After: Should stabilize around viewport size * chunk count

2. **Memory Usage**:
   - Chrome DevTools → Performance → Memory
   - Measure heap size over 30 minute session

3. **Frame Rate**:
   - During scroll operations
   - During zoom operations
   - Target: Maintain 60fps

4. **Interaction Latency**:
   - Time from trajectory click to selection
   - Time from zoom slider change to re-render

### Test Scenarios
1. **Long transcription scroll test**:
   - 30+ minute transcription
   - Scroll from start to end
   - Scroll back to start
   - Measure DOM node count at each stage

2. **Edit-heavy workflow**:
   - Create new trajectories across multiple chunks
   - Ensure they don't get unloaded prematurely

3. **Playback test**:
   - Play through entire transcription
   - Verify no missing elements during playback

4. **Selection edge cases**:
   - Select trajectory in distant chunk
   - Scroll away
   - Verify selection persists and chunk doesn't unload

## Implementation Risks

### 1. Rendering Gaps
**Risk**: Chunks unload while still partially visible
**Mitigation**: Conservative `rootMargin` and `UNLOAD_THRESHOLD`

### 2. Flickering During Scroll
**Risk**: Unload triggers too aggressively during fast scrolling
**Mitigation**: Debounce unload operations, larger margin before unload

### 3. State Synchronization
**Risk**: Render status arrays out of sync with actual DOM
**Mitigation**: Comprehensive `renderedChunks` tracking, validation checks

### 4. Memory Leaks
**Risk**: Event listeners not cleaned up, D3 data bindings persist
**Mitigation**: Explicit `.on(null)` to remove listeners, test with heap snapshots

### 5. Edit Operations During Unload
**Risk**: User edits element that gets unloaded
**Mitigation**: Lock chunks containing selected/edited elements

## Expected Performance Gains

### Conservative Estimate
- **Current**: 10000 DOM nodes after 30 minutes
- **With cleanup**: 2000-3000 nodes (viewport + buffer)
- **Memory savings**: 60-70%
- **Frame rate improvement**: 20-30% during scroll/zoom

### Best Case Scenario
- Smooth 60fps even in hour-long transcriptions
- Memory usage plateau after initial load
- No perceptible latency in interactions

## Next Steps

1. **Create GitHub Issue** with this analysis
2. **Prototype** on separate branch:
   - Implement basic chunk tracking
   - Add unload logic with conservative thresholds
   - Test on single long transcription
3. **Performance testing** with actual recordings
4. **Iterate** on thresholds and edge cases
5. **Code review** for memory safety
6. **Merge** when validated stable

## Related Code Locations

- IntersectionObserver setup: `TranscriptionLayer.vue:478-571`
- Render functions: `TranscriptionLayer.vue:1901-2700`
- Clear functions: `TranscriptionLayer.vue:2715-2762`
- Chunk calculation: `piece.ts:927-1210`
- Reset logic: `TranscriptionLayer.vue:4864-4912`
