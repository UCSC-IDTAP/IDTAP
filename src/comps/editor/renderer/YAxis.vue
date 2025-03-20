<template>
  <div class='yAxis' :style='dynamicStyle'>
    <svg ref='aySvg'></svg>
  </div>
</template>

<script lang='ts'>
import { 
  defineComponent, 
  ref, 
  computed, 
  PropType, 
  onMounted,
  watch,
  nextTick 
} from 'vue';
import * as d3 from 'd3';
import { Raga } from '@/js/classes.ts';
import { getContrastingTextColor } from '@/ts/utils.ts';
import { ScaleSystem } from '@/ts/enums.ts';

export default defineComponent({
  name: 'YAxis',
  props: {
    scaledHeight: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    scale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
    },
    raga: {
      type: Object as PropType<Raga>,
      required: true
    },
    highOctOffset: {
      type: Number,
      required: true
    },
    lowOctOffset: {
      type: Number,
      required: true
    },
    axisColor: {
      type: String,
      required: true
    }, 
    scaleSystem: {
      type: String as PropType<ScaleSystem>,
      required: true
    }
  },
  setup(props) {
    const yAxisContainer = ref<HTMLDivElement | null>(null);
    const aySvg = ref<SVGSVGElement | null>(null);

    const textColor = computed(() => {
      return getContrastingTextColor(props.axisColor);
    })

    watch(() => props.scaledHeight, newHeight => {
      if (aySvg.value) {
        d3.select(aySvg.value)
          .attr('height', newHeight)
        resetAxis();
      }
    })
    watch(() => props.axisColor, newColor => {
      if (aySvg.value) {
        const svg = d3.select(aySvg.value)
        svg
          .selectAll('rect')
          .style('fill', newColor)
        svg.selectAll('text')
          .style('fill', textColor.value)
        svg.selectAll('.tick line')
          .style('stroke', textColor.value)
        
      }
    })
    watch(() => props.scaleSystem, () => {
      resetAxis();
    })

    const dynamicStyle = computed(() => {
      return {
        '--scaledHeight': `${props.scaledHeight}px`,
        '--width': `${props.width}px`
      }
    });

    const logMin = computed(() => {
      return Math.log2(props.raga.fundamental) - props.lowOctOffset;
    });
    const logMax = computed(() => {
      return Math.log2(props.raga.fundamental) + props.highOctOffset;
    });
    const ticks = computed(() => {
      return props.raga.getFrequencies({
        low: 2 ** logMin.value,
        high: 2 ** logMax.value
      }).map(freq => Math.log2(freq));
    });
    const tickLabels = computed(() => {
      return props.raga.getPitches({
        low: 2 ** logMin.value,
        high: 2 ** logMax.value
      }).map(p => {
        if (props.scaleSystem === ScaleSystem.Sargam) return p.octavedSargamLetter
        else if (props.scaleSystem === ScaleSystem.Solfege) return p.octavedSolfegeLetter
        else if (props.scaleSystem === ScaleSystem.PitchClass) return p.octavedChroma
        else if (props.scaleSystem === ScaleSystem.Cents) return p.a440CentsDeviation
        else if (props.scaleSystem === ScaleSystem.SargamCents) return p.octavedSargamLetterWithCents
        else if (props.scaleSystem === ScaleSystem.SolfegeCents) return p.octavedSolfegeLetterWithCents
        else if (props.scaleSystem === ScaleSystem.PitchClassCents) return p.octavedChromaWithCents
        else if (props.scaleSystem === ScaleSystem.MovableCCents) return p.movableCCentsDeviation
        else throw new Error('Invalid scale system');
      });
    });

    const axis = ref(d3.axisLeft(props.scale)
      .tickValues(ticks.value)
      .tickFormat((d, i) => tickLabels.value[i])
      .tickPadding(5))

    const resetAxis = () => {
      nextTick(() => {
        axis.value = d3.axisLeft(props.scale)
          .tickValues(ticks.value)
          .tickFormat((d, i) => tickLabels.value[i])
          .tickPadding(5)
  
        const svg = d3.select(aySvg.value);
        svg.selectAll('*').remove();
        svg
          .attr('width', props.width)
          .attr('height', props.scaledHeight)
        svg.append('rect')
          .attr('width', props.width)
          .attr('height', props.scaledHeight)
          .attr('fill', props.axisColor)
        svg.append('g')
          .attr('transform', `translate(${props.width}, 0)`)
          .call(axis.value)
        svg
          .selectAll('text')
          .style('fill', textColor.value)
        svg.selectAll('.tick line')
          .style('stroke', textColor.value)
        
      })
    };

    onMounted(() => {
      if (aySvg.value) {
        const svg = d3.select(aySvg.value)
          .attr('width', props.width)
          .attr('height', props.scaledHeight)
        svg.append('rect')
          .attr('width', props.width)
          .attr('height', props.scaledHeight)
          .attr('fill', props.axisColor)
        svg.append('g')
          .attr('transform', `translate(${props.width}, 0)`)
          .call(axis.value)
          .selectAll('text')
          .style('fill', textColor.value)
        svg.selectAll('.tick line')
          .style('stroke', textColor.value)
      }
    })
    return {
      dynamicStyle,
      aySvg,
      yAxisContainer,
      axis,
      tickLabels,
      ticks,
      logMin,
      logMax,
      resetAxis
    }
  }
})

</script>

<style scoped>

.yAxis {
  width: var(--width);
  height: var(--scaledHeight);
  background-color: #f0f0f0;
  overflow-y: hidden
}

.tick > text {
  white-space: pre-line
}
</style>

