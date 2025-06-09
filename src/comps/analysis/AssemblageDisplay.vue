<template>
  <div class='assemblage-selection' :style="styleVars">
    <span>Assemblage: </span>
    <select v-model="selectedAssemblageId">
      <option v-for="assemblage in piece.assemblages" :key="assemblage.id" :value="assemblage.id">
        {{ assemblage.name }}
      </option>
    </select>
  </div>
  <div class="assemblage-display" :style="styleVars">
    <div :class='`strand-column ${sIdx === 0 ? "first" : ""}`' v-for='(strand, sIdx) in selectedAssemblage.strands' :key='strand.id'>
      <div class='strand-label'>
        <h3>{{ strand.label }}</h3>
      </div>
      <div class="strand-content">
        <div 
          class='segment-holder' 
          v-for='pIdx in range'
          :key="pIdx"
          >
          <SegmentDisplay
            v-if="strand.phrases.find(phrase => phrase.pieceIdx === pIdx)"
            class="strand-display"
            :outerMargin="outerMargin"
            :innerMargin="innerMargin"
            :titleMargin='0'
            :trajectories="phraseMap[pIdx].trajectories"
            :piece="piece"
            :displayWidth="400"
            :displayHeight="300"
            :proportion="1"
            :horizontalProportionalDisplay="true"
            :vocal="false"
            titleColor='black'
            :queryAnswer="{ 
              trajectories: phraseMap[pIdx].trajectories,
              identifier: phraseMap[pIdx].pieceIdx!,
              title: `Phrase ${phraseMap[pIdx].pieceIdx}`, 
              startTime: phraseMap[pIdx].startTime!, 
              endTime: phraseMap[pIdx].durTot! + phraseMap[pIdx].startTime!,
              duration: phraseMap[pIdx].durTot!,
              segmentation: 'phrase'
              }"
            :id="`strand-${strand.id}`"
            :logFreqOverride="logFreqOverride"
            :titleInAxis='true'
          />
          </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, computed, ref, PropType } from 'vue';
import { Piece, Phrase } from '@/ts/model'
import SegmentDisplay from '@/comps/analysis/SegmentDisplay.vue';

export default defineComponent({
  name: 'AssemblageDisplay',
  components: {
    SegmentDisplay,
    // ... other components if present
  },
  props: {
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    navHeight: {
      type: Number,
      required: true
    },
    analysisTypeRowHeight: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const selectedAssemblageId = ref(props.piece.assemblages[0]?.id);

    const selectedAssemblage = computed(() => {
      return props.piece.assemblages.find(assemblage => assemblage.id === selectedAssemblageId.value) || props.piece.assemblages[0];
    });
    const startPIdx = computed(() => {
      return selectedAssemblage.value.phrases[0]?.pieceIdx ?? 0;
    });
    const endPIdx = computed(() => {
      return selectedAssemblage.value.phrases.at(-1)?.pieceIdx ?? 0;
    });
    const range = computed(() => {
      const out = [];
      for (let i = startPIdx.value; i <= endPIdx.value; i++) {
        out.push(i);
      }
      return out;
    });

    const phraseMap = computed(() => {
      const m: Record<number, Phrase> = {};
      selectedAssemblage.value.phrases.forEach(phrase => {
        m[phrase.pieceIdx!] = phrase;
      });
      return m;
    })

    const selectionHeight = '80px';
    const styleVars = computed(() => ({
      '--nav-height': `${props.navHeight}px`,
      '--analysis-type-row-height': `${props.analysisTypeRowHeight}px`,
      '--selection-height': selectionHeight,
    }));

    const selectionHeightPx = parseInt(selectionHeight);
    const calcDisplayHeight = computed(() => {
      return window.innerHeight
             - props.navHeight
             - props.analysisTypeRowHeight
             - selectionHeightPx;
    });

    const sampleXs = Array.from({ length: 25 }, (_, i) => i / 24);
    const logFreqOverride = computed(() => {
      const allTrajs = selectedAssemblage.value.strands
        .flatMap(strand => strand.phrases)
        .flatMap(p => p.trajectories);
      let minVal = Infinity;
      let maxVal = -Infinity;
      allTrajs.forEach(traj => {
        sampleXs.forEach(x => {
          const v = traj.compute(x, true);
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        });
      });
      return { low: minVal, high: maxVal };
    });
    const outerMargin = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
    const innerMargin = {
      top: 50,
      bottom: 0,
      left: 30,
      right: 0
    };

    return {
      styleVars,
      selectedAssemblage,
      selectedAssemblageId,
      calcDisplayHeight,
      range,
      phraseMap,
      logFreqOverride,
      outerMargin,
      innerMargin
    };
  }
});
</script>
<style scoped>


.assemblage-selection {
  min-height: var(--selection-height);
  max-height: var(--selection-height);
  background-color: green;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box
}
.assemblage-display {
  background-color: var(--Primary);
  min-height: calc(100vh - var(--nav-height) - var(--analysis-type-row-height) - var(--selection-height));
  max-height: calc(100vh - var(--nav-height) - var(--analysis-type-row-height) - var(--selection-height));
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.strand-column {
  max-width: 400px;
  min-width: 400px;
  border-right: 1px solid white;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.strand-column.first {
  border-left: 1px solid white;
}

.strand-label {
  position: sticky;
  top: 0;
  background-color: var(--Primary);
  z-index: 1;
  border-bottom: 1px solid white;
  box-sizing: border-box
}

.phrase-display {
  width: 400px;
  min-height: 300px;
  box-sizing: border-box;
}

.segment-holder {
  min-width: 400px;
  max-width: 400px;
  min-height: 300px;
  max-height: 300px;
  border-bottom: 1px solid white;
  box-sizing: border-box;
}

</style>


