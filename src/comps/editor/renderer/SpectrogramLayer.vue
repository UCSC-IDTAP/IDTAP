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

    const opacity = computed(() => props.showSpectrogram ? 1 : 0);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const canvas = entry.target as HTMLCanvasElement;
        const idx = canvasIdxMap.get(canvas)!;
        if (entry.isIntersecting)  {
          const startX = maxCanvasWidth * idx;
          const width = Math.min(maxCanvasWidth, props.width - startX);
          const renderCall = { canvasIdx: idx, startX, width } as RenderCall;
          worker!.postMessage({
            msg: 'requestRenderData',
            payload: renderCall
          })
        }
      });
    }, {
      root: container.value,
      rootMargin: '0px',
      threshold: 0.0
    });

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


    const resetCanvases = () => {
      observer.disconnect();
      canvases.value.forEach((canvas) => {
        container.value?.removeChild(canvas);
      });
      canvases.value = [];
      ctxs.value = [];
      canvasIdxMap.clear();
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
          } else {
            console.log(e.data)
          }
        } else if (e.data.msg === 'render') {
          const imgData = e.data.payload as ImageData;
          const canvasIdx = e.data.canvasIdx as number;
          const ctx = ctxs.value[canvasIdx];
          // console.log('should be rendering image data')
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
