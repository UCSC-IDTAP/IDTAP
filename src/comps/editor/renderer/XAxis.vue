<template>
  <div class='xAxis' ref='xAxisContainer' :style='dynamicStyle'>
    <svg ref='axSvg'></svg>
    <svg ref='phraseSvg' v-if='showPhrases'></svg>
    <svg ref='vibhagSvg' v-if='showVibhagLabels'></svg>
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
import { getContrastingTextColor } from '@/ts/utils.ts';
import { Piece } from '@model';
import { InstrumentTrackType, ExcerptRange } from '@shared/types';
import { TimingDisplay } from '@shared/enums';

export default defineComponent({
  name: 'XAxis',
  props: {
    scaledWidth: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    scale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
    },
    axisColor: {
      type: String,
      required: true
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    instIdx: {
      type: Number,
      required: true
    },
    showPhrases: {
      type: Boolean,
      required: true
    },
    instTracks: {
      type: Array as PropType<InstrumentTrackType[]>,
      required: true
    },
    timingDisplay: {
      type: String as PropType<TimingDisplay>,
      required: true
    },
    excerptRange: {
      type: Object as PropType<ExcerptRange>,
      required: false
    },
    showVibhagLabels: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const xAxisContainer = ref<HTMLDivElement | null>(null);
    const axSvg = ref<SVGSVGElement | null>(null);
    const regionStartPxl = ref<number | undefined>(undefined);
    const regionEndPxl = ref<number | undefined>(undefined);
    const phraseSvg = ref<SVGSVGElement | null>(null);
    const vibhagSvg = ref<SVGSVGElement | null>(null);


    const textColor = computed(() => getContrastingTextColor(props.axisColor));

    watch(() => props.axisColor, newColor => {
      if (axSvg.value) {
        const svg = d3.select(axSvg.value)
        svg
          .selectAll('rect')
          .attr('fill', newColor)
        svg
          .selectAll('text')
          .style('fill', textColor.value)
        svg
          .selectAll('.tick line')
          .attr('stroke', textColor.value)

        drawPhrases();
        drawVibhags();
      }
    })
    watch(() => props.instIdx, () => resetAxis())
    watch(() => props.timingDisplay, () => resetAxis())

    const leadingZeros = (int: number) => {
      if (int < 10) {
        return '0' + int
      } else {
        return String(int)
      }
    }
    const structuredTime = (dur: number) => {
      // Apply offset for real time display if in real time mode
      const adjustedDur = props.timingDisplay === TimingDisplay.RealTime && props.excerptRange
        ? dur + props.excerptRange.start
        : dur;
      
      const hours = String(Math.floor(adjustedDur / 3600));
      let minutes = Math.floor((adjustedDur % 3600) / 60);
      const seconds = leadingZeros(adjustedDur % 60);
      if (Number(hours) > 0) {
        return `${hours}:${leadingZeros(minutes)}:${seconds}`
      } else {
        return `${String(minutes)}:${seconds}`
      }
    };
    
    const scaleDomain = props.scale.domain();
    const maxVal = scaleDomain[1];
    const minInterTickPxls = 40;
    const durTot = props.scale.domain()[1];
    const durTotPxls = props.scale(durTot);
    const interval = durTotPxls / minInterTickPxls;
    const durInterval = Math.ceil(durTot / interval);
    let integerTicks: number[] = [];
    for (let i = durInterval; i < maxVal; i += durInterval) {
      integerTicks.push(i);
    }

    const axis = ref(d3.axisTop(props.scale)
      .tickValues(integerTicks)
      .tickFormat(d => structuredTime(d as number))
      .tickPadding(5)
    );

    const phrases = computed(() => {
      return props.piece.phraseGrid[props.instIdx]
    })

    const resetAxis = () => {
      const scaleDomain = props.scale.domain();
      const maxVal = scaleDomain[1];
      const minInterTickPxls = 40;
      const durTot = props.scale.domain()[1];
      const durTotPxls = props.scale(durTot);
      const interval = durTotPxls / minInterTickPxls;
      const durInterval = Math.ceil(durTot / interval);
      integerTicks = [];
      for (let i = durInterval; i < maxVal; i += durInterval) {
        integerTicks.push(i);
      }
      axis.value = d3.axisTop(props.scale)
        .tickValues(integerTicks)
        .tickFormat(d => structuredTime(d as number))
        .tickPadding(5)

      const svg = d3.select(axSvg.value)
      svg.selectAll('*').remove();
      svg
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
      svg.append('rect')
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
        .attr('fill', props.axisColor)
        .on('mousedown', handleMouseDown)
        .on('mouseup', handleMouseUp)
        .on('mouseout', handleMouseUp)
      svg.append('g')
        .attr('transform', `translate(0, ${elementHeight.value - 1})`)
        .call(axis.value)
        .selectAll('text')
        .style('fill', textColor.value)
        .style('pointer-events', 'none')
      svg.selectAll('.tick line')
        .style('stroke', textColor.value)
      nextTick(() => {

        drawPhrases();
        drawVibhags();
      })
    }

    watch(() => props.scaledWidth, () => {
      if (axSvg.value) {
        d3.select(axSvg.value)
          .attr('width', props.scaledWidth)
        resetAxis();
      }
    });
    watch(() => props.showPhrases, () => {
      resetAxis();
    })
    watch(() => props.showVibhagLabels, () => {
      resetAxis();
    })
    watch(() => props.piece.meters, () => {
      resetAxis();
    }, { deep: true })

    const dynamicStyle = computed(() => {
      return {
        '--scaledWidth': `${props.scaledWidth}px`,
        '--height': `${props.height}px`,
      }
    });

    const elementHeight = computed(() => {
      const activeLayers = 1 + (props.showPhrases ? 1 : 0) + (props.showVibhagLabels ? 1 : 0);
      return props.height / activeLayers;
    });

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const x = e.offsetX;
      // Draw vertical line on axis svg
      d3.selectAll('.region-line').remove();
      if (axSvg.value) {
        d3.select(axSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      // Draw vertical line on phrase svg
      if (phraseSvg.value) {
        d3.select(phraseSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      // Draw vertical line on vibhag svg
      if (vibhagSvg.value) {
        d3.select(vibhagSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      regionStartPxl.value = e.offsetX;
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        xAxisContainer.value &&
        e.relatedTarget instanceof Node &&
        xAxisContainer.value.contains(e.relatedTarget)
      ) {
        return;
      }
      const x = e.offsetX;
      if (regionStartPxl.value === undefined) {
        return
      }
      if (axSvg.value) {
        d3.select(axSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      if (phraseSvg.value) {
        d3.select(phraseSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      if (vibhagSvg.value) {
        d3.select(vibhagSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      if (e.offsetX < regionStartPxl.value) {
        regionEndPxl.value = regionStartPxl.value;
        regionStartPxl.value = e.offsetX;
      } else {
        regionEndPxl.value = e.offsetX;
      }
      emit('update:region', [regionStartPxl.value, regionEndPxl.value]);
      regionStartPxl.value = undefined;
      regionEndPxl.value = undefined;
    };
    const drawPhrases = () => {
      if (!phraseSvg.value) return;
      const svg = d3.select(phraseSvg.value)
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
        .on('mousedown', handleMouseDown)
        .on('mouseup', handleMouseUp)
        .on('mouseout', handleMouseUp)
      svg.selectAll('*').remove();
      svg.append('rect')
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
        .attr('fill', props.axisColor)
        .attr('pointer-events', 'none')
      const divColor = props.instTracks[props.instIdx].color;
      phrases.value.forEach((phrase, idx) => {
        const xStart = props.scale(phrase.startTime!);
        const xEnd = props.scale(phrase.startTime! + phrase.durTot!);
        const width = xEnd - xStart;

        // Vertical division line at phrase start
        if (idx !== 0) {
          svg.append('line')
            .attr('x1', xStart)
            .attr('y1', 0)
            .attr('x2', xStart)
            .attr('y2', elementHeight.value)
            .attr('stroke', divColor)
            .attr('stroke-width', 2);
        }

        // Phrase number centered in the phrase
        svg.append('text')
          .attr('x', xStart + width / 2)
          .attr('y', elementHeight.value / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('fill', '#333')
          .style('font-size', '14px')
          .text(`Phrase ${idx + 1}`);
      });

      // Add separator line at bottom of phrase row (if vibhag row exists)
      if (props.showVibhagLabels) {
        svg.append('line')
          .attr('x1', 0)
          .attr('y1', elementHeight.value)
          .attr('x2', props.scaledWidth)
          .attr('y2', elementHeight.value)
          .attr('stroke', '#000')
          .attr('stroke-width', 1);
      }
    };

    const drawVibhags = () => {
      if (!vibhagSvg.value) return;
      const svg = d3.select(vibhagSvg.value)
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
        .on('mousedown', handleMouseDown)
        .on('mouseup', handleMouseUp)
        .on('mouseout', handleMouseUp)
      svg.selectAll('*').remove();
      svg.append('rect')
        .attr('width', props.scaledWidth)
        .attr('height', elementHeight.value)
        .attr('fill', props.axisColor)
        .attr('pointer-events', 'none')

      // Draw vibhaga labels for all meters
      props.piece.meters.forEach((meter) => {
        if (!meter.vibhaga || meter.vibhaga.length === 0) return;

        // Get the top-level (layer 0) pulse structures
        const topLayerStructures = meter.pulseStructures[0];
        const vibhagCount = meter.vibhaga.length;

        // Repeat vibhaga labels for each cycle
        for (let rep = 0; rep < meter.repetitions; rep++) {
          const cycleStartTime = meter.startTime + (rep * meter.cycleDur);

          // Draw labels for each vibhag in this cycle
          for (let vibhagIdx = 0; vibhagIdx < vibhagCount; vibhagIdx++) {
            const vibhagLabel = meter.vibhaga[vibhagIdx];
            const ps = topLayerStructures[vibhagIdx];

            // Calculate the time for this vibhag in this repetition
            const vibhagTimeInCycle = ps.pulses[0].realTime - meter.startTime;
            const pulseTime = cycleStartTime + vibhagTimeInCycle;
            const xPos = props.scale(pulseTime);

            // Vibhaga label positioned at the pulse time
            svg.append('text')
              .attr('x', xPos)
              .attr('y', elementHeight.value / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .style('fill', textColor.value)
              .style('font-size', '10px')
              .text(vibhagLabel);
          }
        }
      });
    };

    const clearRegionBorders = () => {
      d3.selectAll('.region-line').remove();
    }

    const setRegionStartPxl = (pxl: number) => {
      const x = pxl;
      // Draw vertical line on axis svg
      d3.selectAll('.region-line').remove();
      if (axSvg.value) {
        d3.select(axSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      // Draw vertical line on phrase svg
      if (phraseSvg.value) {
        d3.select(phraseSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      // Draw vertical line on vibhag svg
      if (vibhagSvg.value) {
        d3.select(vibhagSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
    }

    const setRegionEndPxl = (pxl: number) => {
      const x = pxl;
      if (axSvg.value) {
        d3.select(axSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      if (phraseSvg.value) {
        d3.select(phraseSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
      if (vibhagSvg.value) {
        d3.select(vibhagSvg.value)
          .append('line')
          .classed('region-line', true)
          .attr('x1', x).attr('x2', x)
          .attr('y1', 0).attr('y2', elementHeight.value)
          .attr('stroke', 'grey')
          .attr('stroke-width', 1);
      }
    }

    onMounted(() => {
      // put the axis on the axSvg
      if (axSvg.value) {
        const svg = d3.select(axSvg.value)
          .attr('width', props.scaledWidth)
          .attr('height', elementHeight.value)
        svg.append('rect')
          .attr('width', props.scaledWidth)
          .attr('height', elementHeight.value)
          .attr('fill', props.axisColor)
          // .attr('y', props.height/2)
          .on('mousedown', handleMouseDown)
          .on('mouseup', handleMouseUp)
          .on('mouseout', handleMouseUp)
        svg.append('g')
          .attr('transform', `translate(0, ${elementHeight.value - 1})`)
          .call(axis.value)
          .selectAll('text')
          .style('fill', textColor.value)
          .style('pointer-events', 'none')
        svg.selectAll('.tick line')
          .attr('stroke', textColor.value)

          drawPhrases();
          drawVibhags();
      }
    })

    return {
      xAxisContainer,
      dynamicStyle,
      axSvg,
      integerTicks,
      regionStartPxl,
      regionEndPxl,
      phraseSvg,
      vibhagSvg,
      resetAxis,
      clearRegionBorders,
      setRegionStartPxl,
      setRegionEndPxl,
    }
  }
})

</script>
<style scoped>

.xAxis {
  width: var(--scaledWidth);
  height: var(--height);
  background-color: #f0f0f0;
}

.xAxis svg {
  display: block;
  margin: 0;
  padding: 0;
}

</style>

