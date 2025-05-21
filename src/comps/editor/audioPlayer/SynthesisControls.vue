<template>
  <div>
    <div class='instControls' :style='mainStyle'>
      <InstrumentControl
        v-if='instTracks.length > 0 && instTracks.length === synthControls.length'
        v-for='(synthControl, index) in synthControls'
        :key='index'
        :synthControl='synthControl'
        :height='height'
        :sonify='instTracks[index].sounding'
        ref='instControl'
        @update:sonify='handleUpdateSonify(index, $event)'
        @update:gainNode='$emit("update:gainNode", $event)'
        @update:cutoff='$emit("update:cutoff", $event)'
        />
      <div class='otherControls'>
        <div class='sliderCol primaryGain' v-if='instTracks.length > 1'>
          <label>Mixed Synth Gain</label>
          <input 
            ref='mixedGainSlider'
            type='range' 
            min='0' 
            max='1' 
            step='0.01'
            v-model='mixedGainValProxy'
            :disabled='mixedGainSliderDisabled'
          />
        </div>
        <div class='sliderCol primaryGain' v-if='hasRecording'>
          <label>Recording Gain</label>
          <input 
            type='range' 
            min='0' 
            max='1' 
            step='0.01'
            v-model='recGainValProxy'
          />
        </div>
        <div class='sliderCol'>
          <label>Pitch Shift ({{ transposition }}¢)</label>
          <input 
            type='checkbox' 
            v-model='shiftOnProxy' 
            @click='preventSpace'
            @change='$emit("toggleShift")'
            :disabled='playing'
            />
          <input 
            type='range' 
            min='-200' 
            max='200' 
            step='1' 
            v-model='transpositionProxy'
            orient='vertical'
            :disabled='playing || !shiftOn || !readyToShift'
          />
        </div>
        <div class='sliderCol'>
          <label>Region Speed ({{ (2 ** regionSpeed).toFixed(2) }})</label>
          <input 
            type='checkbox' 
            v-model='regionSpeedOnProxy'
            @click='preventSpace'
            @change='$emit("toggleRegionSpeed")'
            :disabled='playing || !stretchable'
            />
            <input 
              type='range' 
              min='-1' 
              max='1' 
              step='0.01' 
              v-model='regionSpeedProxy'
              orient='vertical'
              :disabled='playing || !regionSpeedOn || !stretchable'
              @mouseup='$emit("regionSpeedChange")'
              />
        </div>
      </div>
    </div>
</div>
</template>
<script lang='ts'>
import { defineComponent, PropType, computed, ref, getCurrentInstance } from 'vue'
import { SynthControl, InstrumentTrackType, SynthType } from '@shared/types';
import { Instrument } from '@shared/enums';
import InstrumentControl from '@/comps/editor/audioPlayer/InstrumentControl.vue';

export default defineComponent({
  name: 'SynthesisControls',
  props: {
    instTracks: {
      type: Array as PropType<InstrumentTrackType[]>,
      required: true
    },
    synthControls: {
      type: Array as PropType<SynthControl[]>,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    transposition: {
      type: Number,
      required: true
    },
    regionSpeed: {
      type: Number,
      required: true
    },
    playing: {
      type: Boolean,
      required: true
    },
    stretchable: {
      type: Boolean,
      required: true
    },
    shiftOn: {
      type: Boolean,
      required: true
    },
    regionSpeedOn: {
      type: Boolean,
      required: true
    },
    readyToShift: {
      type: Boolean,
      required: true
    },
    mixedGainVal: {
      type: Number,
      required: true
    },
    hasRecording: {
      type: Boolean,
      required: true
    },
    recGainVal: {
      type: Number,
      required: true
    }
  },
  components: {
    InstrumentControl
  },
  emits: [
    'update:transposition', 
    'update:regionSpeed', 
    'update:shiftOn', 
    'toggleShift',
    'update:regionSpeedOn',
    'toggleRegionSpeed',
    'regionSpeedChange',
    'update:mixedGainVal',
    'update:gainNode',
    'update:recGainVal',
    'update:cutoff',
    'update:sonify'
  ],
  setup(props, { emit }) {

    const mixedGainSlider = ref<HTMLInputElement | null>(null);
    const mixedGainSliderDisabled = ref(false);

    const instControl = ref<InstanceType<typeof InstrumentControl>[] | null>(null);

      const reemitAllInstrumentControlParams = () => {
      if (instControl.value) {
        instControl.value.forEach(control => {
          control.reemitParams();
        });
      }
    };

    const transpositionProxy = computed({
      get() {
        return props.transposition
      },
      set(val) {
        emit('update:transposition', val)
      }
    });
    const regionSpeedProxy = computed({
      get() {
        return props.regionSpeed
      },
      set(val) {
        emit('update:regionSpeed', val)
      }
    });
    const shiftOnProxy = computed({
      get() {
        return props.shiftOn
      },
      set(val) {
        emit('update:shiftOn', val)
      }
    });
    const regionSpeedOnProxy = computed({
      get() {
        return props.regionSpeedOn
      },
      set(val) {
        emit('update:regionSpeedOn', val)
      }
    });
    const mixedGainValProxy = computed({
      get() {
        return props.mixedGainVal
      },
      set(val) {
        emit('update:mixedGainVal', val)
      }
    });
    const recGainValProxy = computed({
      get() {
        return props.recGainVal
      },
      set(val) {
        emit('update:recGainVal', val)
      }
    })

    const handleUpdateSonify = (idx: number, val: boolean) => {
      emit('update:sonify', {idx, val})
    };

    const mainStyle = computed(() => {
      return {
        '--height': props.height + 'px',
        '--otherControlsWidth': otherControlsWidth.value + 'px'
      }
    });
    const preventSpace = (e: MouseEvent) => {
      if (e && e.clientX === 0) e.preventDefault()
    };
    const otherControlsWidth = computed(() => {
      let mult = 2;
      if (props.instTracks.length > 1) mult += 1;
      if (props.hasRecording) mult += 1;
      return mult * 100;
    });


    return {
      handleUpdateSonify,
      mainStyle,
      transpositionProxy,
      regionSpeedProxy,
      shiftOnProxy,
      preventSpace,
      regionSpeedOnProxy, 
      mixedGainValProxy,
      recGainValProxy,
      mixedGainSliderDisabled,
      instControl,
      reemitAllInstrumentControlParams
    }

  }
})
</script>
<style scoped>
.instControls {
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
}

.otherControls {
  width: var(--otherControlsWidth);
  border-left: 1px solid white;
  box-sizing: border-box;
  height: var(--height);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.sliderCol {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
  height: var(--height)
}

.sliderCol > input[type='range'] {
  writing-mode: vertical-rl;
  direction: rtl;
  height: 100px;
}

.sliderCol > input[type='checkbox'] {
  height: 20px;
}

.sliderCol.primaryGain > input[type='range'] {
  height: 116px;
}

.sliderCol > label {
  height: 50px;
  font-size: 14px;
}
</style>
