<template>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { Trajectory } from '@model';

type SarangiSynthDataType = {
  freq: number,
  del1?: DelayNode,
  del2?: DelayNode,
  lowPass?: BiquadFilterNode,
  lowPassFreq: number,
  lpGain?: GainNode,
  feedbackGain?: GainNode,
  feedbackGainVal: number,
  noiseBufSrc?: AudioBufferSourceNode,
  bowGain?: GainNode,
  bowGainVal: number,
  noiseFilter?: BiquadFilterNode,
  noiseFilterVal: number,
  outGain?: GainNode,
  outGainVal: number,
  panner?: StereoPannerNode,
  resFreqs: number[],
  filterBank?: BiquadFilterNode[]
}

export default defineComponent({
  name: 'SarangiSynth',
  data(): SarangiSynthDataType {
    return {
      freq: 400,
      del1: undefined,
      del2: undefined,
      lowPassFreq: 10000,
      lpGain: undefined,
      feedbackGain: undefined,
      feedbackGainVal: 0.96,
      noiseBufSrc: undefined,
      bowGain: undefined,
      bowGainVal: 0,
      noiseFilter: undefined,
      noiseFilterVal: 800,
      outGain: undefined,
      outGainVal: 1.0,
      panner: undefined,
      resFreqs: [185, 275, 405, 460, 530],
      filterBank: undefined
    }
  },
  props: {
    ac: {
      type: Object as PropType<AudioContext>,
      required: true
    },
  },
  mounted() {
    this.initializeNodes();
    this.connectNodes();
    this.startNoise();

    
  },

  methods: {

    initializeNodes() {
      this.del1 = this.ac.createDelay(1);
      this.del2 = this.ac.createDelay(1);
      const delTime = (1 / this.freq) / 2;
      this.del1.delayTime.value = delTime;
      this.del2.delayTime.value = delTime;
      this.lowPass = this.ac.createBiquadFilter();
      this.lowPass.type = 'lowpass';
      this.lowPass.frequency.value = this.lowPassFreq;
      this.lowPass.Q.value = 0.5;
      this.lpGain = this.ac.createGain();
      this.lpGain.gain.value = 0.8;
      this.feedbackGain = this.ac.createGain();
      this.feedbackGain.gain.value = this.feedbackGainVal;
      this.noiseBufSrc = this.ac.createBufferSource();
      this.noiseBufSrc.loop = true;
      this.noiseBufSrc.buffer = this.createWhiteNoiseBuffer();
      this.bowGain = this.ac.createGain();
      this.bowGain.gain.value = this.bowGainVal;
      this.noiseFilter = this.ac.createBiquadFilter();
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.value = this.noiseFilterVal;
      this.noiseFilter.Q.value = 1;
      this.outGain = this.ac.createGain();
      this.outGain.gain.value = this.outGainVal;
      this.panner = this.ac.createStereoPanner();
      this.panner.pan.value = 0.5;
      this.filterBank = this.resFreqs.map(freq => {
        const filter = this.ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 4;
        return filter;
      });
    },

    connectNodes() {
      this.del1!.connect(this.lowPass!);
      this.lowPass!.connect(this.lpGain!);
      this.lpGain!.connect(this.del2!);
      this.del2!.connect(this.feedbackGain!);
      this.feedbackGain!.connect(this.del1!);
      this.noiseBufSrc!.connect(this.noiseFilter!);
      this.noiseFilter!.connect(this.bowGain!);
      this.bowGain!.connect(this.del1!);
      this.del2!.connect(this.outGain!);
      this.filterBank!.forEach(filter => {
        this.outGain!.connect(filter);
        filter.connect(this.panner!);
      });
      this.panner!.connect(this.ac.destination);
    },

    startNoise() {
      this.noiseBufSrc!.start();
    },

    createWhiteNoiseBuffer() {
      const bufferSize = this.ac.sampleRate * 10;
      const buffer = this.ac.createBuffer(1, bufferSize, this.ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    },

    playTraj(
      traj: Trajectory,
      startTime: number,
      endTime: number,
      fromSil = false,
      toSil = false,
      transposition = 0
    ) {
      const valueDur = 0.02;
      const valueCt = Math.floor((endTime - startTime) / valueDur);
      const verySmall = 0.000000000001;
      const envelope = new Float32Array(valueCt);
      const gainEnv = new Float32Array(valueCt);
      const fadeTime = 0.1;
      const gainVal = 0.3;
      const fadeSamples = Math.floor(fadeTime / valueDur);
      for (let i = 0; i < valueCt; i++) {
        gainEnv[i] = gainVal;
        if (fromSil && i < fadeSamples) {
          gainEnv[i] *= i / fadeSamples;
        }
        if (toSil && i >= valueCt - fadeSamples) {
          gainEnv[i] *= (valueCt - i - 1) / fadeSamples;
        }
      }
      

      const linTransp = 2 ** (transposition / 1200);
      for (let i = 0; i < valueCt; i++) {
        // console.log(linTransp)
        const freq = linTransp * traj.compute(i / (valueCt - 1));
        console.log(freq)
        const del = (1 / freq) / 2;
        envelope[i] = del;
      }
      const duration = endTime - startTime - verySmall;
      this.del1!.delayTime.setValueCurveAtTime(envelope, startTime, duration);
      this.del2!.delayTime.setValueCurveAtTime(envelope, startTime, duration);
      this.bowGain!.gain.setValueCurveAtTime(gainEnv, startTime, duration);
      


    },
  }
})
</script>
