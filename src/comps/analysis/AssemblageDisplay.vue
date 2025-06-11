<template>
  <div class='assemblage-selection' :style="styleVars">
    <span>Assemblage: </span>
    <select v-model="selectedAssemblageId">
      <option v-for="assemblage in piece.assemblages" :key="assemblage.id" :value="assemblage.id">
        {{ assemblage.name }}
      </option>
    </select>
    <div v-if="audioLoading" class="audio-loading">
      <span>Loading audio...</span>
    </div>
  </div>
  <div class="assemblage-display" :style="styleVars" v-if="selectedAssemblage">
    <div class='strandLabelRow' >
      <div class='strand-label' v-for='(strand, sIdx) in selectedAssemblage.strands' :key='strand.id'>
        <h3>{{ strand.label }}</h3>
      </div>
    </div>
    <div class='strandContentRow'>
      <div class='strand-column' :class='{ first: sIdx === 0 }' v-for='(strand, sIdx) in selectedAssemblage.strands' :key='strand.id'>
        <div class="strand-content">
          <div class='segment-holder' v-for='pIdx in range' :key="pIdx">
            <SegmentDisplay
              v-if="phraseMap[pIdx] && strand.phrases.find(phrase => phrase.pieceIdx === pIdx)"
              :key="pIdx"
              class="phrase-display"
              :outerMargin="outerMargin"
              :innerMargin="innerMargin"
              :titleMargin='0'
              :trajectories="phraseMap[pIdx].trajectories"
              :piece="piece"
              :displayWidth="colWidth - 1"
              :displayHeight="colHeight - 1"
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
              :horizontalPadding='0'
              @segment-click="handleSegmentClick"
              
            />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { 
  defineComponent, 
  computed, 
  ref, 
  PropType, 
  onMounted, 
  onUnmounted,
  watch
} from 'vue';
import { Piece, Phrase } from '@/ts/model'
import SegmentDisplay from '@/comps/analysis/SegmentDisplay.vue';
import { detect, BrowserInfo } from 'detect-browser';

export default defineComponent({
  name: 'AssemblageDisplay',
  components: {
    SegmentDisplay,
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
    const colWidth = 400;
    const colHeight = 250
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
      '--label-height': '60px',
      '--col-width': `${colWidth}px`,
      '--col-height': `${colHeight}px`,
      '--total-width': `${colWidth * selectedAssemblage.value.strands.length}px`,
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


    // audio stuff

    const audioContext = ref<AudioContext | null>(null);
    const masterAudioBuffer = ref<AudioBuffer | null>(null);
    const currentSource = ref<AudioBufferSourceNode | null>(null);
    const currentGainNode = ref<GainNode | null>(null);
    const audioLoading = ref(true);
    const playingSegmentId = ref<number | null>(null);
    const browser = detect() as BrowserInfo;

    const loadAudio = async (audioSource: string) => {
      try {
        const response = await fetch(audioSource);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        masterAudioBuffer.value = await audioContext.value!.decodeAudioData(arrayBuffer);
        audioLoading.value = false;
      } catch (error) {
        console.error('Error fetching or decoding audio:', error);
        audioLoading.value = false;
      }
    };

    const playSegment = (startTime: number, duration: number, segmentId: number) => {
      if (!audioContext.value || !masterAudioBuffer.value) return;

      const now = audioContext.value.currentTime;
      const fadeTime = 0.02; // 20ms fade duration

      // Fade down any currently playing audio
      if (currentSource.value && currentGainNode.value) {
        console.log('Fading down current audio source');
        currentGainNode.value.gain.cancelScheduledValues(now);
        currentGainNode.value.gain.setValueAtTime(currentGainNode.value.gain.value, now);
        currentGainNode.value.gain.linearRampToValueAtTime(0, now + fadeTime);
        
        // Stop the source after fade completes
        setTimeout(() => {
          if (currentSource.value) {
            currentSource.value.stop();
            currentSource.value = null;
            currentGainNode.value = null;
          }
        }, fadeTime * 1000 + 10); // Add 10ms buffer
        
        playingSegmentId.value = null;
        
        // Start new segment after fade completes
        setTimeout(() => {
          startNewSegment(startTime, duration, segmentId);
        }, fadeTime * 1000 + 15);
      } else {
        // No current audio, start immediately
        startNewSegment(startTime, duration, segmentId);
      }
    };

    const startNewSegment = (startTime: number, duration: number, segmentId: number) => {
      if (!audioContext.value || !masterAudioBuffer.value) return;

      // Set the playing segment ID
      playingSegmentId.value = segmentId;

      const now = audioContext.value.currentTime;
      const fadeTime = 0.02;

      // Create a new source node and gain node for fade in/out
      const source = audioContext.value.createBufferSource();
      source.buffer = masterAudioBuffer.value;

      const gainNode = audioContext.value.createGain();
      source.connect(gainNode);
      gainNode.connect(audioContext.value.destination);

      // Apply fade-in (start immediately)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + fadeTime);

      // Schedule fade-out
      gainNode.gain.setValueAtTime(1, now + duration - fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Start playback immediately
      source.start(now, startTime, duration);

      // Clear playing indicator when audio ends
      source.onended = () => {
        playingSegmentId.value = null;
        currentSource.value = null;
        currentGainNode.value = null;
      };

      // Save references for later stopping
      currentSource.value = source;
      currentGainNode.value = gainNode;
    };

    const stopAudio = () => {
      if (currentSource.value && currentGainNode.value) {
        const now = audioContext.value!.currentTime;
        const fadeTime = 0.02;
        
        currentGainNode.value.gain.cancelScheduledValues(now);
        currentGainNode.value.gain.setValueAtTime(currentGainNode.value.gain.value, now);
        currentGainNode.value.gain.linearRampToValueAtTime(0, now + fadeTime);
        
        setTimeout(() => {
          if (currentSource.value) {
            currentSource.value.stop();
            currentSource.value = null;
            currentGainNode.value = null;
          }
        }, fadeTime * 1000 + 10);
      }
      playingSegmentId.value = null;
    };

    const handleSegmentClick = (segmentData: { startTime: number, duration: number, identifier?: number }) => {
      const segmentId = segmentData.identifier ?? 0;
      playSegment(segmentData.startTime, segmentData.duration, segmentId);
    };
    


    onMounted(async () => {
      const audioID = props.piece.audioID;
      if (!audioID) {
        console.warn('No audio ID provided for piece.');
        return;
      }
      
      audioContext.value = new AudioContext();
      
      const audioSource = browser.name === 'safari' ? 
        `https://swara.studio/audio/mp3/${audioID}.mp3` :
        `https://swara.studio/audio/opus/${audioID}.opus`;
      
      await loadAudio(audioSource);
    });

    onUnmounted(() => {
      if (audioContext.value) {
        audioContext.value.close();
        audioContext.value = null;
      }
    });

    return {
      styleVars,
      selectedAssemblage,
      selectedAssemblageId,
      calcDisplayHeight,
      range,
      phraseMap,
      logFreqOverride,
      outerMargin,
      innerMargin,
      colWidth,
      colHeight,
      audioContext,
      audioLoading,
      playingSegmentId,
      playSegment,
      stopAudio,
      handleSegmentClick
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-x: auto;
}

.strand-column {
  max-width: var(--col-width);
  min-width: var(--col-width);
  border-right: 1px solid white;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}



.strand-label {
  position: sticky;
  top: 0;
  background-color: var(--Primary);
  z-index: 10;
  border-bottom: 1px solid white;
  border-right: 1px solid white;
  box-sizing: border-box;
  min-width: var(--col-width);
  max-width: var(--col-width);
}

.strand-content {
  position: relative;
  z-index: 1;
}

.phrase-display {
  min-width: var(--col-width);
  min-height: var(--col-height);
  max-height: var(--col-height);
  box-sizing: border-box;
}

.segment-holder {
  min-width: var(--col-width);
  max-width: var(--col-width);
  min-height: var(--col-height);
  max-height: var(--col-height);
  border-bottom: 1px solid white;
  box-sizing: border-box;
  z-index: 0;
}

.strandLabelRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: var(--label-height);
  background-color: var(--Primary);
  width: var(--total-width);
}

.strandContentRow {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  height: calc(100% - var(--label-height));
  background-color: var(--Primary);
  overflow-y: auto;
  width: var(--total-width);
}

.audio-loading {
  margin-left: 20px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  display: inline-block;
  width: auto;
}





</style>


