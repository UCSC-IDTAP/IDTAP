<template>
  <div 
    class='container' 
    ref='container'
    :style='{
      width: `${width}px`,
      height: `${height}px`
    }'
    >
  </div>
</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { RenderCall } from '@shared/types';
import { getWorker } from '@/ts/workers/workerManager.ts';
import { throttle } from 'lodash';

export default defineComponent({
  name: 'SpectrogramLayer',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    showSpectrogram: {
      type: Boolean,
      required: true
    },
    scrollX: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const maxCanvasWidth = 1000; // this is a hard-coded value. If you change it
    // you must also change this value in the spectrogramWorker
    const container = ref<HTMLDivElement | null>(null);
    const canvases = ref<HTMLCanvasElement[]>([]);
    const ctxs = ref<CanvasRenderingContext2D[]>([]);
    const canvasIdxMap = new Map<HTMLCanvasElement, number>();
    let worker: Worker | undefined = undefined

    // Bidirectional lazy loading tracking
    const renderedCanvasChunks = ref<Set<number>>(new Set());
    const recentlyUnloadedCanvasChunks = new Map<number, number>(); // chunkIdx -> timestamp
    const recentlyLoadedCanvasChunks = ref<Map<number, number>>(new Map()); // chunkIdx -> timestamp
    const intersectingCanvases = ref<Set<number>>(new Set()); // Track which canvases are currently in viewport
    const CANVAS_UNLOAD_THRESHOLD = 10; // Keep ±10 chunks from active range
    const CANVAS_RELOAD_COOLDOWN_MS = 1000; // Prevent thrashing

    // Preloading queue to prevent blocking main thread
    const canvasPreloadQueue: number[] = [];
    let isProcessingCanvasPreloadQueue = false;

    const opacity = computed(() => props.showSpectrogram ? 1 : 0);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const canvas = entry.target as HTMLCanvasElement;
        const idx = canvasIdxMap.get(canvas)!;

        if (entry.isIntersecting)  {
          // Track as intersecting (in viewport)
          intersectingCanvases.value.add(idx);

          // Load if not already rendered
          if (!renderedCanvasChunks.value.has(idx)) {
            // Cooldown check to prevent thrashing
            const lastUnload = recentlyUnloadedCanvasChunks.get(idx);
            if (lastUnload && Date.now() - lastUnload < CANVAS_RELOAD_COOLDOWN_MS) {
              return;
            }

            const startX = maxCanvasWidth * idx;
            const width = Math.min(maxCanvasWidth, props.width - startX);
            const renderCall = { canvasIdx: idx, startX, width } as RenderCall;
            worker!.postMessage({
              msg: 'requestRenderData',
              payload: renderCall
            })

            // Track as rendered and recently loaded
            renderedCanvasChunks.value.add(idx);
            recentlyLoadedCanvasChunks.value.set(idx, Date.now());
          }
          // Keep observing to detect when it leaves viewport!
        } else {
          // Remove from intersecting when it leaves viewport
          intersectingCanvases.value.delete(idx);
        }
      });

      // Check for preloading after updating intersecting canvases
      checkForDistantCanvases();
    }, {
      root: null, // Use viewport as root (container.value is null at creation time)
      rootMargin: '0px', // No expansion - use actual viewport (matches TranscriptionLayer)
      threshold: 0.0
    });

    // Helper: Get active canvas range based on viewport visibility
    const getActiveCanvasRange = () => {
      // Use canvases that are currently in viewport
      if (intersectingCanvases.value.size === 0) {
        return { start: 0, end: 0 };
      }

      const chunks = Array.from(intersectingCanvases.value);
      return {
        start: Math.min(...chunks),
        end: Math.max(...chunks)
      };
    };

    // Unload a distant canvas chunk
    const unloadCanvas = (chunkIdx: number) => {
      const canvas = canvases.value[chunkIdx];
      if (!canvas) return;

      // Clear canvas content
      const ctx = ctxs.value[chunkIdx];
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Reset canvas dimensions to free memory
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      canvas.width = 0;
      canvas.height = 0;
      // Restore dimensions for future re-rendering
      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // Remove from tracking
      renderedCanvasChunks.value.delete(chunkIdx);
      recentlyUnloadedCanvasChunks.set(chunkIdx, Date.now());

      // Re-enable observation for this canvas
      observer.observe(canvas);
    };

    // Process canvas preload queue over multiple frames to avoid blocking
    const processCanvasPreloadQueue = () => {
      if (isProcessingCanvasPreloadQueue || canvasPreloadQueue.length === 0) return;

      isProcessingCanvasPreloadQueue = true;

      const processChunk = () => {
        if (canvasPreloadQueue.length === 0) {
          isProcessingCanvasPreloadQueue = false;
          return;
        }

        // Preload 2 canvases per frame (canvases are lighter than trajectories)
        const idx1 = canvasPreloadQueue.shift();
        if (idx1 !== undefined && canvases.value[idx1] && !renderedCanvasChunks.value.has(idx1)) {
          const canvas = canvases.value[idx1];
          const startX = maxCanvasWidth * idx1;
          const width = Math.min(maxCanvasWidth, props.width - startX);
          const renderCall = { canvasIdx: idx1, startX, width } as RenderCall;
          worker!.postMessage({
            msg: 'requestRenderData',
            payload: renderCall
          });
          renderedCanvasChunks.value.add(idx1);
          recentlyLoadedCanvasChunks.value.set(idx1, Date.now());
          // Keep observing to detect when it enters/leaves viewport
        }

        const idx2 = canvasPreloadQueue.shift();
        if (idx2 !== undefined && canvases.value[idx2] && !renderedCanvasChunks.value.has(idx2)) {
          const canvas = canvases.value[idx2];
          const startX = maxCanvasWidth * idx2;
          const width = Math.min(maxCanvasWidth, props.width - startX);
          const renderCall = { canvasIdx: idx2, startX, width } as RenderCall;
          worker!.postMessage({
            msg: 'requestRenderData',
            payload: renderCall
          });
          renderedCanvasChunks.value.add(idx2);
          recentlyLoadedCanvasChunks.value.set(idx2, Date.now());
          // Keep observing to detect when it enters/leaves viewport
        }

        // Only check for more chunks if queue is getting low
        if (canvasPreloadQueue.length < 2) {
          checkForDistantCanvases();
        }

        if (canvasPreloadQueue.length > 0) {
          requestAnimationFrame(processChunk);
        } else {
          isProcessingCanvasPreloadQueue = false;
        }
      };

      requestAnimationFrame(processChunk);
    };

    // Check for distant canvases and unload them, preload nearby ones
    const checkForDistantCanvases = throttle(() => {
      const active = getActiveCanvasRange();

      const keepStart = Math.max(0, active.start - CANVAS_UNLOAD_THRESHOLD);
      const keepEnd = active.end + CANVAS_UNLOAD_THRESHOLD;

      const toUnload: number[] = [];

      // Find distant canvases to unload
      renderedCanvasChunks.value.forEach(chunkIdx => {
        const isInKeepRange = chunkIdx >= keepStart && chunkIdx <= keepEnd;

        if (!isInKeepRange) {
          toUnload.push(chunkIdx);
        }
      });

      // Unload distant canvases to free memory
      toUnload.forEach(idx => unloadCanvas(idx));

      // Preload spectrograms based on active chunk index (not rootMargin)
      const PRELOAD_COUNT = 2;  // Load 2 chunks ahead and 2 behind for smoother scrolling

      // Add chunks to preload queue instead of loading immediately
      for (let i = 1; i <= PRELOAD_COUNT; i++) {
        const preloadIdx = active.end + i;
        if (canvases.value[preloadIdx] &&
            !renderedCanvasChunks.value.has(preloadIdx) &&
            !canvasPreloadQueue.includes(preloadIdx)) {
          // Check cooldown
          const lastUnload = recentlyUnloadedCanvasChunks.get(preloadIdx);
          if (!lastUnload || Date.now() - lastUnload >= CANVAS_RELOAD_COOLDOWN_MS) {
            canvasPreloadQueue.push(preloadIdx);
          }
        }
      }

      for (let i = 1; i <= PRELOAD_COUNT; i++) {
        const preloadIdx = active.start - i;
        if (preloadIdx >= 0 &&
            canvases.value[preloadIdx] &&
            !renderedCanvasChunks.value.has(preloadIdx) &&
            !canvasPreloadQueue.includes(preloadIdx)) {
          // Check cooldown
          const lastUnload = recentlyUnloadedCanvasChunks.get(preloadIdx);
          if (!lastUnload || Date.now() - lastUnload >= CANVAS_RELOAD_COOLDOWN_MS) {
            canvasPreloadQueue.push(preloadIdx);
          }
        }
      }

      // Start processing preload queue if there are canvases to load
      if (canvasPreloadQueue.length > 0) {
        processCanvasPreloadQueue();
      }
    }, 50);  // Throttle to balance responsiveness vs performance

    watch([() => props.height, () => props.width], () => {
      resetCanvases();
      const processOptions = {
        type: 'scale',
        newScaledShape: [props.height, props.width]
      }
      worker!.postMessage({
        msg: 'process',
        payload: processOptions
      })
    });
    watch(() => props.showSpectrogram, () => {
      canvases.value.forEach((canvas) => {
        canvas.style.opacity = opacity.value.toString();
      });
    });

    // Watch scroll changes to trigger chunk cleanup
    watch(() => props.scrollX, () => {
      checkForDistantCanvases();
    });

    const resetCanvases = () => {
      observer.disconnect();
      canvases.value.forEach((canvas) => {
        container.value?.removeChild(canvas);
      });
      canvases.value = [];
      ctxs.value = [];
      canvasIdxMap.clear();

      // Clear tracking structures
      renderedCanvasChunks.value.clear();
      recentlyUnloadedCanvasChunks.clear();
      recentlyLoadedCanvasChunks.value.clear();
      intersectingCanvases.value.clear();
      canvasPreloadQueue.length = 0;
      isProcessingCanvasPreloadQueue = false;

      const numCanvases = Math.ceil(props.width / maxCanvasWidth);
      for (let i = 0; i < numCanvases; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(maxCanvasWidth, props.width - i * maxCanvasWidth);
        canvas.height = props.height;
        canvas.style.opacity = opacity.value.toString();
        container.value?.appendChild(canvas);
        canvases.value.push(canvas);
        ctxs.value.push(canvas.getContext('2d') as CanvasRenderingContext2D);
        canvasIdxMap.set(canvas, i);
        observer.observe(canvas);
      }
    }

    const resetObserver = () => {
      observer.disconnect();
      canvases.value.forEach((canvas) => {
        observer.observe(canvas);
      });
    }

    onMounted(() => {
      if (container.value) {
        const numCanvases = Math.ceil(props.width / maxCanvasWidth);
        for (let i = 0; i < numCanvases; i++) {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(maxCanvasWidth, props.width - i * maxCanvasWidth);
          canvas.height = props.height;
          canvas.style.opacity = opacity.value.toString();
          container.value.appendChild(canvas);
          canvases.value.push(canvas);
          ctxs.value.push(canvas.getContext('2d') as CanvasRenderingContext2D);
          canvasIdxMap.set(canvas, i);
          observer.observe(canvas);
        }
      };
      worker = getWorker();
      worker.onmessage = (e: MessageEvent<{
        msg: string,
        payload: ImageData,
        canvasIdx: number
      }>) => {
        
        if (typeof e.data === 'string') {
          if (e.data === 'updateObserver') {
            resetObserver();
          }
        } else if (e.data.msg === 'render') {
          const imgData = e.data.payload as ImageData;
          const canvasIdx = e.data.canvasIdx as number;
          const ctx = ctxs.value[canvasIdx];
          ctx.putImageData(imgData, 0, 0);
        }
      }
    });

    // defineExpose({ resetObserver });

    return {
      container,
      canvases,
      ctxs,
      resetObserver,
      resetCanvases
    }
  }
})
</script>


<style scoped>
.container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  white-space: nowrap;
}

</style>
