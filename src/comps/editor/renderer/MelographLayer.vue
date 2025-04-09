<template>
  <div
    class='melContainer'
    ref='melContainer'
    :style='dynamicStyle'
    >
  </div>
</template>

<script lang='ts'>

import { 
  defineComponent, 
  ref, 
  onMounted, 
  PropType, 
  computed,
  watch
} from 'vue';
import * as d3 from 'd3';
import { getMelographJSON } from '@/js/serverCalls.ts';
import { MelographData, ExcerptRange } from '@/ts/types.ts';

export default defineComponent({
  name: 'MelographLayer',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    showMelograph: {
      type: Boolean,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    audioID: {
      type: String,
      required: true
    },
    xScale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
    },
    yScale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
    },
    excerptRange: {
      type: Object as PropType<ExcerptRange>,
      required: false
    }
  },
  setup(props) {
    const melContainer = ref<HTMLDivElement | null>(null);
    const svg = ref<SVGSVGElement | null>(null);
    const melographJSON = ref<MelographData | null>(null);

    const opacity = computed(() => props.showMelograph ? 1 : 0);
    const dynamicStyle = computed(() => {
      return {
        '--width': `${props.width}px`,
        '--height': `${props.height}px`,
        '--opacity': opacity.value,
      }
    });

    watch(() => props.color, () => {
      updateMelographColor();
    });

    watch(() => props.height, () => {
      if (svg.value) {
        d3.select(svg.value)
          .attr('height', props.height)
      }
      resetMelograph();
    });

    watch(() => props.width, () => {
      if (svg.value) {
        d3.select(svg.value)
          .attr('width', props.width)
      }
      resetMelograph();
    });

    const updateMelographColor = () => {
      d3.selectAll('.melograph')
        .attr('stroke', props.color)
    }

    const resetMelograph = () => {
      d3.selectAll('.melograph').remove();
      if (melographJSON.value && svg.value) {
        const data = melographJSON.value;
        const lineGenerator = d3.line()
          .x(d => props.xScale(d[0]))
          .y(d => props.yScale(d[1]))
          .curve(d3.curveMonotoneX);
        let data_chunks = data.data_chunks;
        let time_chunk_starts = data.time_chunk_starts;
        if (props.excerptRange !== undefined) {
          console.log('transforming data')
          const start = props.excerptRange.start;
          const end = props.excerptRange.end;
          const timeStarts = data.time_chunk_starts;
          let startIndex = timeStarts.findIndex(t => t >= start);
          if (startIndex === -1) startIndex = 0;
          let endIndex = timeStarts.reduce((lastIdx, t, idx) => t <= end ? idx : lastIdx, -1);
          if (endIndex === -1) endIndex = timeStarts.length - 1;
          data_chunks = data.data_chunks.slice(startIndex, endIndex + 1);
          time_chunk_starts = data.time_chunk_starts
            .slice(startIndex, endIndex + 1)
            .map(t => t - start);
        }
        data_chunks.forEach((chunk, i) => {
          const start = time_chunk_starts[i];
          const increment = data.time_increment;
          const drawData = chunk.map((val, j) => {
            return [start + j * increment, Math.log2(val)]
          }) as [number, number][];
          const pathData = lineGenerator(drawData)
          d3.select(svg.value)
            .append('path')
            // .datum(drawData)
            .attr('class', 'melograph')
            .attr('d', pathData)
            .attr('fill', 'none')
            .attr('stroke', props.color)
            .attr('stroke-width', 1.5)
        });
      }
    };

    onMounted(async () => {
      try {
        melographJSON.value = await getMelographJSON(props.audioID);
      } catch (err) {
        console.error(err);
      }
      if (melContainer.value) {
        const svgElem = d3.select(melContainer.value)
          .append('svg')
          .attr('width', props.width)
          .attr('height', props.height)
          .node();
        if (svgElem instanceof SVGSVGElement) {
          svg.value = svgElem;
        }
        resetMelograph();
      }
    });




    return {
      melContainer,
      opacity,
      dynamicStyle,
      melographJSON
    }
  }
})
</script>

<style scoped>
.melContainer {
  opacity: var(--opacity);
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  width: var(--width);
  height: var(--height);
}

</style>
