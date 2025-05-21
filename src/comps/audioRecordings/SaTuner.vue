<template>
  <div class='main'>
    <div class='dataRow'>
       <label>{{ `Sa: ` }}</label>
       <div class='input'>{{ freq.toFixed(1) }}</div>
    </div>
    <div class='dataRow'>
      <label>{{ `Verified: ` }}</label>
      <div class='input'>
        <input 
          type='checkbox' 
          v-model='verified'
          @change='handleVerifiedInput'
          >
      </div>
    </div>
    <div class='dataRow'>
      <label>{{  `Oct. offset: ` }}</label>
      <div class='input'>
        <input 
          type='number'
          v-model='tempOctOffset'
          min='-1'
          max='0'
          step='1'
          @change='handleOctOffsetInput'
          >
      </div>
    </div>
    <div class='dataRow'>
      <label>{{ 'Frequency: ' }}</label>
      <input 
        type='range' 
        v-model='freqSliderVal' 
        :min='freqSliderMin' 
        :max='freqSliderMax'
        step='0.001'
        @input='handleFreqInput'>
    </div>
    <div class='dataRow'>
      <label>{{ 'Gain: ' }}</label>
      <input 
        type='range' 
        v-model='gainSliderVal' 
        min='0' 
        max='1'
        step='0.001'
        @input='handleGainInput'
        >
    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { RecType } from '@shared/types';
import { makeSpectrograms, makeMelograph } from '@/js/serverCalls.ts';

type SaTunerDataType = {
  ac?: AudioContext,
  oscNode?: OscillatorNode,
  gainNode?: GainNode,
  gainSliderVal: number,
  freqSliderVal: number,
  freqSliderMin: number,
  freqSliderMax: number,
  freqVal: number,
  verified: boolean,
  lagTime: number,
  tempOctOffset: number,
  noiseFloor: number,
  oscStarted: boolean,
  spectrogramColor: string,
  melographColor: string,
}

export default defineComponent({
  name: 'SaTuner',
  data(): SaTunerDataType {
    return {
      ac: undefined,
      oscNode: undefined,
      gainNode: undefined,
      gainSliderVal: 0,
      freqSliderVal: 0,
      freqVal: 0,
      freqSliderMin: Math.log2(100),
      freqSliderMax: Math.log2(200),
      verified: false,
      lagTime: 0.1,
      tempOctOffset: 0,
      noiseFloor: 0,
      oscStarted: false,
      spectrogramColor: 'red',
      melographColor: 'red',
    }
  },
  props: {
    rec: {
      type: Object as PropType<RecType>,
      required: true
    },
    saEstimate: {
      type: Number,
      required: true
    },
    saVerified: {
      type: Boolean,
      required: true
    },
    octOffset: {
      type: Number,
      required: true
    },
    spectrogramExists: {
      type: Boolean,
      required: true
    },
    melographExists: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    freq() {
      return this.freqVal * 2 ** this.octOffset;
    },

    recDisabled() {
      return !this.rec.saVerified || 
        this.freqVal !== this.rec.saEstimate || 
        this.octOffset !== this.rec.octOffset
    }
  },

  mounted() {
    this.ac = new AudioContext();
    this.oscNode = this.ac.createOscillator();
    this.gainNode = this.ac.createGain();
    this.oscNode.connect(this.gainNode);
    this.gainNode.connect(this.ac.destination);
    this.gainNode.gain.setValueAtTime(this.noiseFloor, this.ac.currentTime);
    const freq = this.oscNode.frequency;
    freq.setValueAtTime(this.saEstimate!, this.ac.currentTime);
    this.freqSliderVal = Math.log2(this.saEstimate!);
    this.freqVal = this.saEstimate!;
    this.verified = this.saVerified;
    this.tempOctOffset = this.octOffset;
    if (this.spectrogramExists) {
      this.spectrogramColor = 'green';
    }
    if (this.melographExists) {
      this.melographColor = 'green';
    }
  },

  unmounted() {
    if (this.oscStarted) {
      const gain = this.gainNode!.gain;
      const curGain = gain.value;
      const now = this.ac!.currentTime;
      gain.setValueAtTime(curGain, now);
      gain.linearRampToValueAtTime(0, now + this.lagTime);
      this.oscNode?.stop(now + this.lagTime);
    };
    this.ac?.close();
  },

  watch: {
    freqVal(newVal) {
      this.$emit('update:sa-estimate', newVal);
    }
  },

  methods: {

    async handleGenerateSpectrogram() {
      try {
        // the window button should be greyed out if this.freq is not equal to 
        // this.editingRec.saEstimate. In other words, the current freq value 
        // needs to be saved before the spectrogram can be generated.
        this.spectrogramColor = 'orange';
        await makeSpectrograms(this.rec._id!, this.freq);
        this.spectrogramColor = 'green';
      } catch (err) {
        console.log(err);
        this.spectrogramColor = 'red';
      }
    },

    async handleGenerateMelograph() {
      try {
        this.melographColor = 'orange';
        await makeMelograph(this.rec._id!, this.freq);
        this.melographColor = 'green';
      } catch (err) {
        console.log(err);
        this.melographColor = 'red';
      }
    },

    handleFreqInput() {
      const freq = this.oscNode!.frequency;
      const now = this.ac!.currentTime;
      freq.setValueAtTime(this.freqVal, now);
      this.freqVal = Math.pow(2, this.freqSliderVal);
      freq.exponentialRampToValueAtTime(this.freqVal, now + this.lagTime);
    },

    handleGainInput() {
      if (!this.oscStarted) {
        this.oscNode?.start();
        this.oscStarted = true
      }
      const gain = this.gainNode!.gain;
      const now = this.ac!.currentTime;
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(this.gainSliderVal, now + this.lagTime);

    },

    handleVerifiedInput() {
      this.$emit('update:sa-verified', this.verified);
    },

    handleOctOffsetInput() {
      this.$emit('update:oct-offset', this.tempOctOffset);
    }

  }
})
</script>
<style scoped>

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.dataRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
}

label {
  margin-right: 5px;
  width: 100px;
  text-align: right;
}

input[type='range'] {
  width: 100px;

}

.input {
  width: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.processingLight {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 5px;
  margin-right: 5px;
  border: 1px solid black;
}

.spectrogram {
  background-color: v-bind(spectrogramColor);
}

.melograph {
  background-color: v-bind(melographColor);
}

button.processing {
  width: 160px;
}
</style>
