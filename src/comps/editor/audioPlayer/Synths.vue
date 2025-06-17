<template>
</template>
<script lang='ts'>
import { defineComponent, PropType, onMounted, ref, watch } from 'vue';
import {
  InstrumentTrackType,
} from '@shared/types';
import { Instrument } from '@shared/enums';
import ksURL from '@/audioWorklets/karplusStrong2.worklet.js?url';
import cURL from '@/audioWorklets/chikaris2.worklet.js?url';
import c4URL from '@/audioWorklets/chikaris4.worklet.js?url';
import ssURL from '@/audioWorklets/sarangi.worklet.js?url';
import caURL from '@/audioWorklets/captureAudio.worklet.js?url';
import klattURL from '@/audioWorklets/klattSynth2.worklet.js?url';
import { 
  Piece, 
  Trajectory, 
  Phrase
} from '@model';
import {
  getStarts, 
  getEnds,
} from '@/ts/utils'
import { v4 as uuidv4 } from 'uuid';
import { 
  LoopSourceNode,
  ChikariNodeType,
  PluckNodeType,
  SarangiNodeType,
  CaptureNodeType,
  KlattNodeType,
  ParamName,
  SynthControl,
  SitarSynthControl,
  SarangiSynthControl,
  KlattSynthControl,
  SynthType,
  SitarSynthType,
  SarangiSynthType,
  KlattSynthType,
  BurstOption,
  ChikariStrum,
} from '@shared/types';


export default defineComponent({
  name: 'Synths',
  props: {
    ac: {
      type: AudioContext,
      required: true
    },
    instTracks: {
      type: Array as PropType<InstrumentTrackType[]>,
      required: true
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    controls: {
      type: Array as PropType<SynthControl[]>,
      required: true
    },
    gainVal: {
      type: Number,
      required: true
    },
    curPlayTime: {
      type: Number,
      required: true
    },
    transposition: {
      type: Number,
      required: true
    },
    uniformVowel: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const bursts: { [key: string]: AudioBufferSourceNode } = {};
    const now = () => props.ac.currentTime;
    const mixNode = props.ac.createGain();
    mixNode.gain.setValueAtTime(props.gainVal, now());
    mixNode.connect(props.ac.destination);
    const synths: SynthType[] = [];
    const lagTime = 0.025;
    const firstEnvelopes: Float32Array[] = [];
    const firstLPEnvelopes: Float32Array[] = [];
    const vowelParams = [ // f1, f2, f3, b1, b2, b3
      [[310, 2020, 2960, 45, 200, 400], [290, 2070, 2960, 60, 200, 400]],
      [[400, 1800, 2570, 50, 100, 140], [470, 1600, 2600, 50, 100, 140]],
      [[480, 1720, 2520, 70, 100, 200], [330, 2020, 2600, 55, 100, 200]],
      [[530, 1680, 2500, 60, 90, 200], [620, 1530, 2530, 60, 90, 200]],
      [[620, 1660, 2430, 70, 150, 320], [650, 1490, 2470, 70, 100, 320]],
      [[700, 1220, 2600, 130, 70, 160], [700, 1220, 2600, 130, 70, 160]],
      [[600, 990, 2570, 90, 100, 80], [630, 1040, 2600, 90, 100, 80]],
      [[620, 1220, 2550, 80, 50, 140], [620, 1220, 2550, 80, 50, 140]],
      [[540, 1100, 2300, 80, 70, 70], [450, 900, 2300, 80, 70, 70]],
      [[450, 1100, 2350, 80, 100, 80], [500, 1180, 2390, 80, 100, 80]],
      [[350, 1250, 2200, 65, 110, 140], [320, 900, 2200, 65, 110, 140]],
      [[470, 1270, 1540, 100, 60, 110], [420, 1310, 1540, 100, 60, 110]],
      [[660, 1200, 2550, 100, 70, 200], [400, 1880, 2500, 70, 100, 200]],
      [[640, 1230, 2550, 80, 70, 140], [420, 940, 2350, 80, 70, 80]],
      [[550, 960, 2400, 80, 50, 130], [360, 1820, 2450, 60, 50, 160]]
    ];
    const endRecTime = ref(0);
    // bursts
    const sendBurst = (option: BurstOption) => {
      const sr = props.ac.sampleRate;
      const whiteNoise = () => Math.random() * 2 - 1;
      option.atk = option.atk ?? 0.05;
      option.amp = option.amp ?? 1;
      option.dur = option.dur ?? 0.01;
      option.amp *= 2;
      const bufSize = sr * option.dur;
      const attackSize = sr * option.atk;
      const noiseBuf = props.ac.createBuffer(1, bufSize, sr);
      const out = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = whiteNoise();
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      for (let i = 0; i < attackSize; i++) {
        out[i] *= i / attackSize;
      }
      for (let i = 0; i < bufSize; i++) {
        out[i] *= option.amp;
      }
      const bufferSourceNode = props.ac.createBufferSource();
      const uId = uuidv4();
      bursts[uId] = bufferSourceNode;
      bufferSourceNode.buffer = noiseBuf;
      bufferSourceNode.connect(option.to);
      bufferSourceNode.start(option.when);
      bufferSourceNode.onended = () => {
        bufferSourceNode.disconnect();
        delete bursts[uId];
      };
    };
    const cancelBursts = (when?: number) => {
      if (when === undefined) when = now();
      Object.values(bursts).forEach(burst => {
        burst.stop(when);
      });
    };

    // chikari strum function
    const sendChikariStrum = (strum: ChikariStrum, to: ChikariNodeType) => {
      // Send bursts with progressive delays for enabled strings only
      // This approach avoids pops by simply not exciting strings that should be muted
      let delayOffset = 0;
      strum.strings.forEach((enabled, index) => {
        if (enabled && index < 4) {
          sendBurst({ 
            when: strum.when + delayOffset, 
            to, 
            atk: 0.025, 
            amp: strum.baseAmp 
          });
          delayOffset += strum.strumDelay;
        }
      });
    };

    // Helper function to create a chikari strum with specified strings
    const createChikariStrum = (
      strings: boolean[],
      when: number,
      strumDelay: number = 0.0025,
      baseAmp: number = 0.2
    ): ChikariStrum => {
      return {
        strings,
        strumDelay,
        baseAmp,
        when
      };
    };

    // spawn Synths
    const spawnSitar = async (control: SitarSynthControl): Promise<SitarSynthType> => {
      if (control.inst !== Instrument.Sitar) {
        throw new Error('spawnSitar called with non-Sitar control');
      }
      try {
        // load audio worklets
        await props.ac.audioWorklet.addModule(ksURL);
        await props.ac.audioWorklet.addModule(cURL);
        await props.ac.audioWorklet.addModule(c4URL);

        // initialize nodes
        const sitarNode = new AudioWorkletNode(props.ac, 'karplusStrong') as 
          PluckNodeType;
        const sDCOffsetNode = props.ac.createBiquadFilter();
        const lpNode = props.ac.createBiquadFilter();
        const intSitarGainNode = props.ac.createGain();
        const extSitarGainNode = props.ac.createGain();
        const mixChikariNode = props.ac.createGain();
        const intChikariGainNode = props.ac.createGain();
        const extChikariGainNode = props.ac.createGain();
        const outGainNode = props.ac.createGain();
        const cOpt = { numberOfInputs: 1, numberOfOutputs: 2 };
        const chikariNode = new AudioWorkletNode(props.ac, 'chikaris4', cOpt) as 
          ChikariNodeType;
        const cDCOffsetNode = props.ac.createBiquadFilter();
        const capOpts = { numberOfInputs: 2, numberOfOutputs: 0 };
        const capture = new AudioWorkletNode(props.ac, 'captureAudio', capOpts) as 
          CaptureNodeType;
        const sitarLoopSourceNode = props.ac.createBufferSource();
        const chikariLoopSourceNode = props.ac.createBufferSource();
        const sitarLoopGainNode = props.ac.createGain();
        const chikariLoopGainNode = props.ac.createGain();
        const sonifyNode = props.ac.createGain();

        // map parameters
        sitarNode.frequency = sitarNode.parameters.get('Frequency');
        sitarNode.cutoff = sitarNode.parameters.get('Cutoff');
        chikariNode.freq0 = chikariNode.parameters.get('freq0');
        chikariNode.freq1 = chikariNode.parameters.get('freq1');
        chikariNode.freq2 = chikariNode.parameters.get('freq2');
        chikariNode.freq3 = chikariNode.parameters.get('freq3');
        chikariNode.cutoff = chikariNode.parameters.get('Cutoff');
        chikariNode.stringGain0 = chikariNode.parameters.get('stringGain0');
        chikariNode.stringGain1 = chikariNode.parameters.get('stringGain1');
        chikariNode.stringGain2 = chikariNode.parameters.get('stringGain2');
        chikariNode.stringGain3 = chikariNode.parameters.get('stringGain3');
        capture.bufferSize = capture.parameters.get('BufferSize');
        capture.active = capture.parameters.get('Active');
        capture.cancel = capture.parameters.get('Cancel');

        // set parameters
        sDCOffsetNode.type = 'highpass';
        sDCOffsetNode.frequency.value = 5
        cDCOffsetNode.type = 'highpass';
        cDCOffsetNode.frequency.value = 5;
        lpNode.type = 'lowpass';
        const fund = props.piece.raga.fundamental;
        lpNode.frequency.value = fund * 2 ** 3
        sitarNode.cutoff!.value = control.params.dampen!
        outGainNode.gain.value = control.params.outGain!;
        intSitarGainNode.gain.value = 0;
        extSitarGainNode.gain.value = control.params.extSitarGain!;
        mixChikariNode.gain.value = 1;
        intChikariGainNode.gain.value = 0;
        extChikariGainNode.gain.value = control.params.extChikariGain!;
        chikariNode.cutoff!.value = 0.7;
        sitarLoopGainNode.gain.value = 0;
        chikariLoopGainNode.gain.value = 0;
        sitarLoopSourceNode.loop = true;
        chikariLoopSourceNode.loop = true;
        chikariNode.freq0!.value = control.params.chikariFreq0!;
        chikariNode.freq1!.value = control.params.chikariFreq1!;
        // Set default frequencies for strings 2 and 3 (can be made configurable later)
        const fundamental = props.piece.raga.fundamental;
        chikariNode.freq2!.value = fundamental * 2 ** (7/12); // Perfect fifth above fundamental
        chikariNode.freq3!.value = fundamental * 2 ** (4/12); // Major third above fundamental
        // All string gains start at 1.0 (full volume)
        chikariNode.stringGain0!.value = 1.0;
        chikariNode.stringGain1!.value = 1.0;
        chikariNode.stringGain2!.value = 1.0;
        chikariNode.stringGain3!.value = 1.0;
        sonifyNode.gain.value = props.instTracks[control.idx].sounding ? 1 : 0;

        // connect nodes
        sitarNode
          .connect(sDCOffsetNode)
          .connect(lpNode)
          .connect(intSitarGainNode)
          .connect(extSitarGainNode)
          .connect(outGainNode)
          .connect(sonifyNode)
          .connect(mixNode);
        chikariNode.connect(mixChikariNode, 0);
        chikariNode.connect(mixChikariNode, 1);
        mixChikariNode
          .connect(cDCOffsetNode)
          .connect(intChikariGainNode)
          .connect(extChikariGainNode)
          .connect(outGainNode);
        sitarLoopSourceNode
          .connect(sitarLoopGainNode)
          .connect(extSitarGainNode);
        chikariLoopSourceNode
          .connect(chikariLoopGainNode)
          .connect(extChikariGainNode);

        return {
          sitarNode,
          chikariNode,
          sDCOffsetNode,
          lpNode,
          intSitarGainNode,
          intChikariGainNode,
          extChikariGainNode,
          outGainNode,
          extSitarGainNode,
          idx: control.idx,
          sitarLoopSourceNode,
          chikariLoopSourceNode,
          capture,
          sitarLoopGainNode,
          chikariLoopGainNode,
          sonifyNode
        }
      } catch (e) {
        throw new Error('Error adding Karplus-Strong module');
      }
    };
    const spawnSarangi = async (
      control: SarangiSynthControl
    ): Promise<SarangiSynthType> => {
      if (control.inst !== Instrument.Sarangi) {
        throw new Error('spawnSarangi called with non-Sarangi control');
      }
      try {
        // load audio worklets
        await props.ac.audioWorklet.addModule(ssURL);

        // initialize nodes
        const sarangiNode = new AudioWorkletNode(props.ac, 'sarangi') as 
          SarangiNodeType;
        const intGain = props.ac.createGain();
        const extGain = props.ac.createGain();
        const capOpts = { numberOfInputs: 2, numberOfOutputs: 0 };
        const capture = new AudioWorkletNode(props.ac, 'captureAudio', capOpts) as 
        CaptureNodeType;
        const sarangiLoopSourceNode = props.ac.createBufferSource();
        const sarangiLoopGainNode = props.ac.createGain();
        const sonifyNode = props.ac.createGain();
        
        // map parameters
        sarangiNode.freq = sarangiNode.parameters.get('Frequency');
        sarangiNode.bowGain = sarangiNode.parameters.get('BowGain');
        sarangiNode.gain = sarangiNode.parameters.get('Gain');
        capture.bufferSize = capture.parameters.get('BufferSize');
        capture.active = capture.parameters.get('Active');
        capture.cancel = capture.parameters.get('Cancel');

        // set parameters
        sarangiNode.bowGain!.value = 0;
        sarangiNode.gain!.value = 1;
        intGain.gain.value = 0;
        extGain.gain.value = control.params.extSarangiGain!;
        sarangiLoopGainNode.gain.value = 0;
        sarangiLoopSourceNode.loop = true;
        sonifyNode.gain.value = props.instTracks[control.idx].sounding ? 1 : 0;

        // connect nodes
        sarangiNode
          .connect(intGain)
          .connect(extGain)
          .connect(sonifyNode)
          .connect(mixNode);
        sarangiLoopSourceNode
          .connect(sarangiLoopGainNode)
          .connect(extGain);

        return {
          sarangiNode,
          intGain,
          extGain,
          idx: control.idx,
          capture, 
          sarangiLoopSourceNode,
          sarangiLoopGainNode,
          sonifyNode
        }
      } catch (e) {
        throw new Error('Error adding Sarangi module');
      }
    };
    const spawnKlatt = async (
      control: KlattSynthControl
    ): Promise<KlattSynthType> => {
      try {
        // load module
        await props.ac.audioWorklet.addModule(klattURL);

        // initialize nodes
        const kn = new AudioWorkletNode(props.ac, 'klatt-synth') as 
          KlattNodeType;
        const envGain = props.ac.createGain();
        const intGain = props.ac.createGain();
        const extGain = props.ac.createGain();
        const capture = new AudioWorkletNode(props.ac, 'captureAudio') as
          CaptureNodeType;
        const klattLoopSourceNode = props.ac.createBufferSource();
        const klattLoopGainNode = props.ac.createGain();
        const sonifyNode = props.ac.createGain();
        
          // map parameters
        const params = kn.parameters;
        kn.f0 = params.get('f0');
        kn.f1 = params.get('f1');
        kn.f2 = params.get('f2');
        kn.f3 = params.get('f3');
        kn.f4 = params.get('f4');
        kn.f5 = params.get('f5');
        kn.f6 = params.get('f6');
        kn.b1 = params.get('b1');
        kn.b2 = params.get('b2');
        kn.b3 = params.get('b3');
        kn.b4 = params.get('b4');
        kn.b5 = params.get('b5');
        kn.b6 = params.get('b6');
        kn.db1 = params.get('db1');
        kn.db2 = params.get('db2');
        kn.db3 = params.get('db3');
        kn.db4 = params.get('db4');
        kn.db5 = params.get('db5');
        kn.db6 = params.get('db6');
        kn.flutterLevel = params.get('flutterLevel');
        kn.openPhaseRatio = params.get('openPhaseRatio');
        kn.breathinessDb = params.get('breathinessDb');
        kn.tiltDb = params.get('tiltDb');
        kn.gainDb = params.get('gainDb');
        kn.agcRmsLevel = params.get('agcRmsLevel');
        kn.cascadeEnabled = params.get('cascadeEnabled');
        kn.cascadeVoicingDb = params.get('cascadeVoicingDb');
        kn.cascadeAspirationDb = params.get('cascadeAspirationDb');
        kn.cascadeAspirationMod = params.get('cascadeAspirationMod');
        kn.nasalFormantFreq = params.get('nasalFormantFreq');
        kn.nasalFormantFreqToggle = params.get('nasalFormantFreqToggle');
        kn.nasalFormantBw = params.get('nasalFormantBw');
        kn.nasalFormantBwToggle = params.get('nasalFormantBwToggle');
        kn.nasalAntiformantFreq = params.get('nasalAntiformantFreq');
        kn.nasalAntiformantFreqToggle = params.get('nasalAntiformantFreqToggle')
        kn.nasalAntiformantBw = params.get('nasalAntiformantBw');
        kn.nasalAntiformantBwToggle = params.get('nasalAntiformantBwToggle');
        kn.parallelEnabled = params.get('parallelEnabled');
        kn.parallelVoicingDb = params.get('parallelVoicingDb');
        kn.parallelAspirationDb = params.get('parallelAspirationDb');
        kn.parallelAspirationMod = params.get('parallelAspirationMod');
        kn.fricationDb = params.get('fricationDb');
        kn.fricationMod = params.get('fricationMod');
        kn.parallelBypassDb = params.get('parallelBypassDb');
        kn.nasalFormantDb = params.get('nasalFormantDb');
        kn.extGain = params.get('extGain');
        capture.bufferSize = capture.parameters.get('BufferSize');
        capture.active = capture.parameters.get('Active');
        capture.cancel = capture.parameters.get('Cancel');
        
        // set parameters
        kn.extGain!.value = 0.125;
        envGain.gain.value = 0;
        intGain.gain.value = 0;
        extGain.gain.value = control.params.extGain!;
        klattLoopGainNode.gain.value = 0;
        klattLoopSourceNode.loop = true;

        // connect nodes
        kn
          .connect(envGain)
          .connect(intGain)
          .connect(extGain)
          .connect(sonifyNode)
          .connect(mixNode);
        klattLoopSourceNode
          .connect(klattLoopGainNode)
          .connect(extGain);

        return {
          node: kn,
          envGain,
          intGain,
          extGain,
          idx: control.idx,
          capture,
          klattLoopSourceNode,
          klattLoopGainNode,
          sonifyNode
        }
      } catch (e) {
        console.error('Error adding Klatt module');
        throw e
      }
    };

    // initialize Capture
    const initializeSitarCapture = (synth: SitarSynthType) => {
      synth.intSitarGainNode.connect(synth.capture, 0, 0);
      synth.intChikariGainNode.connect(synth.capture, 0, 1);
      synth.capture.port.onmessage = e => {
        const realNow = now();
        const sitarArr = new Float32Array(e.data[0]);
        const sr = props.ac.sampleRate;
        const sitarBuffer = props.ac.createBuffer(1, sitarArr.length, sr);
        sitarBuffer.copyToChannel(sitarArr, 0);
        const chikariArr = new Float32Array(e.data[1]);
        const chikariBuffer = props.ac.createBuffer(1, chikariArr.length, sr);
        chikariBuffer.copyToChannel(chikariArr, 0);
        let offset = realNow - endRecTime.value;
        if (offset < 0) offset = 0;
        synth.sitarLoopSourceNode.buffer = sitarBuffer;
        synth.sitarLoopSourceNode.start(realNow, offset);
        synth.sitarLoopSourceNode.playing = true;
        synth.chikariLoopSourceNode.buffer = chikariBuffer;
        synth.chikariLoopSourceNode.start(realNow, offset);
        synth.chikariLoopSourceNode.playing = true;
      }
    };
    const initializeSarangiCapture = (synth: SarangiSynthType) => {
      synth.sarangiNode.connect(synth.capture, 0, 0);
      const emptyGainNode = props.ac.createGain();
      emptyGainNode.gain.value = 0;
      emptyGainNode.connect(synth.capture, 0, 1);
      synth.capture.port.onmessage = e => {
        const realNow = now();
        const arr = new Float32Array(e.data[0]);
        const sr = props.ac.sampleRate;
        const buffer = props.ac.createBuffer(1, arr.length, sr);
        buffer.copyToChannel(arr, 0);
        let offset = realNow - endRecTime.value;
        if (offset < 0) offset = 0;
        synth.sarangiLoopSourceNode.buffer = buffer;
        synth.sarangiLoopSourceNode.start(realNow, offset);
        synth.sarangiLoopSourceNode.playing = true;
      }
    };
    const initializeKlattCapture = (synth: KlattSynthType) => {
      synth.envGain.connect(synth.capture, 0, 0);
      synth.capture.port.onmessage = e => {
        const realNow = now();
        const arr = new Float32Array(e.data[0]);
        const sr = props.ac.sampleRate;
        const buffer = props.ac.createBuffer(1, arr.length, sr);
        buffer.copyToChannel(arr, 0);
        let offset = realNow - endRecTime.value;
        if (offset < 0) offset = 0;
        synth.klattLoopSourceNode.buffer = buffer;
        synth.klattLoopSourceNode.start(realNow, offset);
        synth.klattLoopSourceNode.playing = true;
      }
    };


    // play Trajectories
    const playAllTrajs = () => {
      props.instTracks.forEach((track, idx) => {
        if (track.inst === Instrument.Sitar) {
          playSitarTrajs(synths[idx] as SitarSynthType);
        } else if (track.inst === Instrument.Sarangi) {
          playSarangiTrajs(synths[idx] as SarangiSynthType);
        } else if ([Instrument.Vocal_M, Instrument.Vocal_F].includes(track.inst)) {
          playKlattTrajs(synths[idx] as KlattSynthType);
        }
      })
    };
    const playSitarArticulations = (
        traj: Trajectory, 
        startTime: number, 
        to: PluckNodeType
      ) => {
      const arts = traj.articulations;
      if (traj.id !== 12) {
        const keys = Object.keys(arts);
        const plucks = keys.filter(k => arts[k].name === 'pluck');
        const hammerOffs = keys.filter(k => arts[k].name === 'hammer-off');
        const hammerOns = keys.filter(k => arts[k].name === 'hammer-on');
        const slides = keys.filter(k => arts[k].name === 'slide');
        const dampens = keys.filter(k => arts[k].name === 'dampen');
        plucks.forEach(time => {
          const when = startTime + Number(time) * traj.durTot;
          sendBurst({ when, to, amp: 0.5 })
        });
        hammerOffs.forEach(time => {
          const when = startTime + Number(time) * traj.durTot;
          sendBurst({ when, to, amp: 0.5 })
        });
        hammerOns.forEach(time => {
          const when = startTime + Number(time) * traj.durTot;
          sendBurst({ when, to, amp: 0.3 })
        });
        slides.forEach(time => {
          const when = startTime + Number(time) * traj.durTot;
          sendBurst({ when, to, amp: 0.1 })
        });
        dampens.forEach(time => {
          const when = startTime + Number(time) * traj.durTot;
          const curVal = to.cutoff!.value;
          const durs = [lagTime, 0.025, 0.005];
          const times = Array(durs.length + 1).fill(0).map((_, i) => {
            return when + durs.slice(0, i).reduce((a, b) => a + b, 0)
          });
          to.cutoff!.setValueAtTime(curVal, times[0]);
          to.cutoff!.linearRampToValueAtTime(0, times[1]);
          to.cutoff!.setValueAtTime(0, times[2]);
          to.cutoff!.linearRampToValueAtTime(curVal, times[3]);
        })
      }
    }
    const playSitarFreqContour = (
        traj: Trajectory, 
        startTime: number,
        synth: SitarSynthType,
        first: boolean,
      ) => {
      const node = synth.sitarNode;
      const lpNode = synth.lpNode;
      const track = synth.idx;
      const valueDur = 0.02;
      const endTime = startTime + traj.durTot;
      const valueCt = Math.round((endTime - startTime) / valueDur);
      const freq = node.frequency !;
      const lpFreq = lpNode.frequency!;
      const verySmall = 0.000000000001;
      if (first) {
        const offset = startTime < now() ? now() - startTime : 0;
        const start = startTime + offset;
        const duration = endTime - start - verySmall;
        if (duration < 0) {
          throw new Error('Negative duration');
        }
        freq.setValueCurveAtTime(firstEnvelopes[track], start, duration);
        lpFreq.setValueCurveAtTime(firstLPEnvelopes[track], start, duration);
      } else {
        const env = new Float32Array(valueCt);
        const lpEnv = new Float32Array(valueCt);
        const transp = 2 ** (props.transposition / 1200);
        for (let i = 0; i < valueCt; i++) {
          env[i] = transp * traj.compute(i / (valueCt - 1));
          lpEnv[i] = transp * traj.compute(i / (valueCt - 1)) * 2 ** 3;
        }
        const duration = endTime - startTime - verySmall;
        if (duration < 0) {
          throw new Error('Negative duration');
        }
        freq.setValueCurveAtTime(env, startTime, duration);
        lpFreq.setValueCurveAtTime(lpEnv, startTime, duration);
      }
    }
    const playSitarTrajs = (synth: SitarSynthType) => {
      const realNow = now();
      // gains
      synth.intSitarGainNode.gain.setValueAtTime(0, realNow);
      synth.intSitarGainNode.gain.linearRampToValueAtTime(1, realNow + lagTime);
      synth.intChikariGainNode.gain.setValueAtTime(0, realNow);
      synth.intChikariGainNode.gain.linearRampToValueAtTime(1, realNow + lagTime);
      // trajs
      const trajs = props.piece.allTrajectories(synth.idx);
      const starts = getStarts(trajs.map(t => t.durTot));
      const ends = getEnds(trajs.map(t => t.durTot));
      const startIdx = starts.findIndex(s => s >= props.curPlayTime);
      const remainingTrajs = trajs.slice(startIdx);
      remainingTrajs.forEach((traj, tIdx) => {
        const i = tIdx + startIdx;
        if (traj.id !== 12) {
          const startTime = realNow + starts[i] - props.curPlayTime;
          playSitarArticulations(traj, startTime, synth.sitarNode);
          playSitarFreqContour(traj, startTime, synth, i === 0);
        }
      });
      // chikaris
      
      props.piece.phraseGrid[synth.idx].forEach((phrase: Phrase, pIdx: number) => {
        Object.keys(phrase.chikaris).forEach((key) => {
          const time = realNow + phrase.startTime! + Number(key) - props.curPlayTime;
          if (time >= realNow) {
            // Default to all 4 strings - can be customized based on chikari data
            const strum = createChikariStrum([true, true, true, true], time);
            sendChikariStrum(strum, synth.chikariNode);
          }
        })
      })
    };
    const playSarangiTraj = (
      traj: Trajectory,
      startTime: number,
      synth: SarangiSynthType,
      fromSil = false,
      toSil = false
    ) => {
      const valueDur = 0.02;
      const durTot = traj.durTot;
      const valueCt = Math.round(durTot / valueDur);
      const freq = synth.sarangiNode.freq!;
      const bowGain = synth.sarangiNode.bowGain!;
      const verySmall = 0.000000000001;
      const env = new Float32Array(valueCt);
      const gainEnv = traj.automation!.generateValueCurve(valueDur, durTot);
      const transp = 2 ** (props.transposition / 1200);
      for (let i = 0; i < valueCt; i++) {
        env[i] = transp * traj.compute(i / (valueCt - 1));
      }
      const duration = durTot - verySmall;
      freq.setValueCurveAtTime(env, startTime, duration);
      synth.sarangiNode.gain!.setValueCurveAtTime(gainEnv, startTime, duration);
      if (fromSil) {
        bowGain.setValueAtTime(0, startTime);
        bowGain.linearRampToValueAtTime(0.5, startTime + 0.01);
      }
      if (toSil) {
        bowGain.setValueAtTime(0.5, startTime + durTot - 0.01);
        bowGain.linearRampToValueAtTime(0, startTime + durTot);
      }
    };
    const playSarangiTrajs = (synth: SarangiSynthType) => {
      const realNow = now();
      synth.intGain.gain.setValueAtTime(0, realNow);
      synth.intGain.gain.linearRampToValueAtTime(1, realNow + lagTime);
      const trajs = props.piece.allTrajectories(synth.idx);
      const starts = getStarts(trajs.map(t => t.durTot));
      const ends = getEnds(trajs.map(t => t.durTot));
      const startIdx = starts.findIndex(s => s >= props.curPlayTime);
      const remainingTrajs = trajs.slice(startIdx);
      remainingTrajs.forEach((traj, tIdx) => {
        const i = tIdx + startIdx;
        if (traj.id !== 12) {
          const st = realNow + starts[i] - props.curPlayTime;
          const lastTraj = remainingTrajs[tIdx - 1];
          const fromSil = tIdx === 0 || !lastTraj || lastTraj.id === 12;
          const last = tIdx === remainingTrajs.length - 1;
          const toSil = last || remainingTrajs[tIdx + 1].id === 12;
          playSarangiTraj(traj, st, synth, fromSil, toSil);
        }
      })
    };
    const playKlattTraj = (
      traj: Trajectory, 
      startTime: number,
      synth: KlattSynthType,
      fromSil = false,
      toSil = false,
    ) => {
      const valueDur = 0.02;
      const endTime = startTime + traj.durTot;
      const valueCt = Math.round(traj.durTot / valueDur);
      const freq = synth.node.f0!;
      const verySmall = 0.000000000001;
      const shwahTime = 0.3;
      const env = new Float32Array(valueCt);
      const transp = 2 ** (props.transposition / 1200);
      const max = 0.125;
      const gainEnv = traj.automation!.generateValueCurve(valueDur, traj.durTot, max);
      for (let i = 0; i < valueCt; i++) {
        env[i] = transp * traj.compute(i / (valueCt - 1));
      }
      const duration = endTime - startTime - verySmall;
      if (duration < 0) {
        throw new Error('Negative duration');
      }
      freq.setValueCurveAtTime(env, startTime, duration);
      synth.node.extGain!.setValueCurveAtTime(gainEnv, startTime, duration);
      const vowels = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ē', 'ai','ō', 'au', '_'];
      const vpIdxs = [7, 6, 1, 0, 9, 10, 2, 3, 8, 5, 7];
      let vIdx = traj.vowel ? vowels.indexOf(traj.vowel) : 0;
      if (props.uniformVowel) {
        vIdx = 0
      }
      type Param = 'f1' | 'f2' | 'f3' | 'b1' | 'b2' | 'b3';
      const params: Param[] = ['f1', 'f2', 'f3', 'b1', 'b2', 'b3'];
      params.forEach((param, pIdx) => {
        const idx = vpIdxs[vIdx];
        const s0 = vowelParams[idx][0][pIdx];
        const s1 = idx === 1 || idx === 3 ? s0 : vowelParams[idx][1][pIdx];
        const audioParam = synth.node[param] as AudioParam;
        audioParam.setValueAtTime(s0, startTime);
        audioParam.linearRampToValueAtTime(s1, startTime + shwahTime);
      })
      if (fromSil) {
        synth.envGain.gain.setValueAtTime(0, startTime);
        synth.envGain.gain.linearRampToValueAtTime(1, startTime + 0.01);
      }
      if (toSil) {
        synth.envGain.gain.setValueAtTime(1, endTime - 0.01);
        synth.envGain.gain.linearRampToValueAtTime(0, endTime);
      }
      synth.node.flutterLevel!.setValueAtTime(0.15, startTime);
    };
    const playKlattTrajs = (synth: KlattSynthType) => {
      const realNow = now();
      synth.intGain.gain.setValueAtTime(0, realNow);
      synth.intGain.gain.linearRampToValueAtTime(1, realNow + lagTime);
      const trajs = props.piece.allTrajectories(synth.idx);
      const starts = getStarts(trajs.map(t => t.durTot));
      const startIdx = starts.findIndex(s => s >= props.curPlayTime);
      const remainingTrajs = trajs.slice(startIdx);
      remainingTrajs.forEach((traj, tIdx) => {
        const i = tIdx + startIdx;
        if (traj.id !== 12) {
          const st = realNow + starts[i] - props.curPlayTime;
          const lastTraj = remainingTrajs[tIdx - 1];
          const fromSil = tIdx === 0 || !lastTraj || lastTraj.id === 12;
          const last = tIdx === remainingTrajs.length - 1;
          const toSil = last || remainingTrajs[tIdx + 1].id === 12;
          playKlattTraj(traj, st, synth, fromSil, toSil);
        }
      })
    };

    // cancel Trajectories
    const cancelAllTrajs = () => {
      props.instTracks.forEach((track, idx) => {
        if (track.inst === Instrument.Sitar) {
          cancelSitarTrajs(synths[idx] as SitarSynthType);
        } else if (track.inst === Instrument.Sarangi) {
          cancelSarangiTrajs(synths[idx] as SarangiSynthType);
        } else if ([Instrument.Vocal_M, Instrument.Vocal_F].includes(track.inst)) {
          cancelKlattTrajs(synths[idx] as KlattSynthType);
        }
      })
    };
    const cancelSitarTrajs = (synth: SitarSynthType) => {
      const realNow = now();
      synth.intChikariGainNode.gain.cancelScheduledValues(realNow);
      synth.intSitarGainNode.gain.cancelScheduledValues(realNow);
      synth.extChikariGainNode.gain.cancelScheduledValues(realNow);
      synth.extSitarGainNode.gain.cancelScheduledValues(realNow);
      synth.intSitarGainNode.gain.setValueAtTime(1, realNow);
      synth.intSitarGainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);
      synth.intChikariGainNode.gain.setValueAtTime(1, realNow);
      synth.intChikariGainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);
      synth.sitarNode.cutoff!.cancelScheduledValues(realNow);
      cancelBursts();
      const freq = synth.sitarNode.frequency!;
      const lpFreq = synth.lpNode.frequency!;
      freq.cancelScheduledValues(realNow);
      lpFreq.cancelScheduledValues(realNow);
    };
    const cancelSarangiTrajs = (synth:SarangiSynthType) => {
      const when = now();
      synth.sarangiNode.freq!.cancelScheduledValues(when);
      synth.sarangiNode.bowGain!.cancelScheduledValues(when);
      synth.sarangiNode.gain!.cancelScheduledValues(when);
      const curBowGain = synth.sarangiNode.bowGain!.value;
      synth.sarangiNode.bowGain!.setValueAtTime(curBowGain, when);
      synth.sarangiNode.bowGain!.linearRampToValueAtTime(0, when + lagTime);
      const curGain = synth.sarangiNode.gain!.value;
      synth.sarangiNode.gain!.setValueAtTime(curGain, when);
      synth.sarangiNode.gain!.linearRampToValueAtTime(0, when + lagTime);
    }
    const cancelKlattTrajs = (synth: KlattSynthType) => {
      const n = now()
      const curGain = synth.node.extGain!.value;
      synth.node.parameters.forEach(param => {
        param.cancelScheduledValues(n + 0.01);
      });
      synth.node.extGain!.setValueAtTime(curGain, n);
      synth.node.extGain!.linearRampToValueAtTime(0, n + 0.01);
      synth.intGain.gain.cancelScheduledValues(n);
      synth.extGain.gain.cancelScheduledValues(n);
      synth.envGain.gain.cancelScheduledValues(n);
      const kmCurGain = synth.intGain.gain.value;
      synth.intGain.gain.setValueAtTime(kmCurGain, n);
      synth.intGain.gain.linearRampToValueAtTime(0, n + 0.01);
    };


    const preSetFirstEnvelopes = () => {
      const valueCt = 256;
      props.instTracks.forEach((track, idx) => {
        const traj = props.piece.allTrajectories(idx)[0];
        const env = new Float32Array(valueCt);
        const lpEnv = new Float32Array(valueCt);
        const transp = 2 ** (props.transposition / 1200);
        for (let i = 0; i < valueCt; i++) {
          env[i] = transp * traj.compute(i / (valueCt - 1));
          lpEnv[i] = transp * traj.compute(i / (valueCt - 1)) * 2 ** 3;
        }
        firstEnvelopes.push(env);
        firstLPEnvelopes.push(lpEnv);
      })
    };

    // recording
    const recordAllSynths = (start: number, end: number) => {
      endRecTime.value = end;
      props.instTracks.forEach((track, idx) => {
        if (track.inst === Instrument.Sitar) {
          const synth = synths[idx] as SitarSynthType;
          recordSitar(synth, start, end);
        } else if (track.inst === Instrument.Sarangi) {
          const synth = synths[idx] as SarangiSynthType;
          recordSarangi(synth, start, end);
        } else if ([Instrument.Vocal_M, Instrument.Vocal_F].includes(track.inst)) {
          const synth = synths[idx] as KlattSynthType;
          recordKlatt(synth, start, end);
        }
      })
    };
    const stopRecordingSynths = () => {
      props.instTracks.forEach((track, idx) => {
        if (track.inst === Instrument.Sitar) {
          const synth = synths[idx] as SitarSynthType;
          stopRecordingSitar(synth);
        } else if (track.inst === Instrument.Sarangi) {
          const synth = synths[idx] as SarangiSynthType;
          stopRecordingSarangi(synth);
        } else if ([Instrument.Vocal_M, Instrument.Vocal_F].includes(track.inst)) {
          const synth = synths[idx] as KlattSynthType;
          stopRecordingKlatt(synth);
        }
      })
    }
    const recordSitar = (synth: SitarSynthType, start: number, end: number) => {
      const bufSize = (end - start) * props.ac.sampleRate;
      synth.capture.bufferSize!.setValueAtTime(bufSize, now());
      synth.capture.active!.setValueAtTime(1, start);
      synth.capture.active!.setValueAtTime(0, end);
      const curSitarGain = synth.intSitarGainNode.gain.value;
      synth.intSitarGainNode.gain.setValueAtTime(curSitarGain, end);
      synth.intSitarGainNode.gain.setValueAtTime(0, end + lagTime);
      const curChikariGain = synth.intChikariGainNode.gain.value;
      synth.intChikariGainNode.gain.setValueAtTime(curChikariGain, end);
      synth.intChikariGainNode.gain.setValueAtTime(0, end + lagTime);
      synth.sitarLoopGainNode.gain.setValueAtTime(0, end - lagTime);
      synth.sitarLoopGainNode.gain.setValueAtTime(1, end);
      synth.chikariLoopGainNode.gain.setValueAtTime(0, end - lagTime);
      synth.chikariLoopGainNode.gain.setValueAtTime(1, end);
    };
    const stopRecordingSitar = (synth: SitarSynthType) => {
      const realNow = now()
      const sBufNode = synth.sitarLoopSourceNode;
      const cBufNode = synth.chikariLoopSourceNode;
      const sGainNode = synth.sitarLoopGainNode;
      const cGainNode = synth.chikariLoopGainNode;
      if (sBufNode.playing && cBufNode.playing) {
        // turn gain off
        sGainNode.gain.setValueAtTime(1, realNow);
        sGainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);
        cGainNode.gain.setValueAtTime(1, realNow);
        cGainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);

        // stop buffers
        sBufNode.stop(realNow + lagTime);
        cBufNode.stop(realNow + lagTime);

        // disconnect, reset, and reconnect
        sBufNode.onended = () => {
          sBufNode.disconnect();
          synth.sitarLoopSourceNode = props.ac.createBufferSource();
          synth.sitarLoopSourceNode.loop = true;
          synth.sitarLoopSourceNode.connect(sGainNode);
        };
        cBufNode.onended = () => {
          cBufNode.disconnect();
          synth.chikariLoopSourceNode = props.ac.createBufferSource();
          synth.chikariLoopSourceNode.loop = true;
          synth.chikariLoopSourceNode.connect(cGainNode);
        };
      }
    }
    const recordSarangi = (synth: SarangiSynthType, start: number, end: number) => {
      const bufSize = (end - start) * props.ac.sampleRate;
      synth.capture.bufferSize!.setValueAtTime(bufSize, now());
      synth.capture.active!.setValueAtTime(1, start);
      synth.capture.active!.setValueAtTime(0, end);
      const curGain = synth.intGain.gain.value;
      synth.intGain.gain.setValueAtTime(curGain, end);
      synth.intGain.gain.setValueAtTime(0, end + lagTime);
      synth.sarangiLoopGainNode.gain.setValueAtTime(0, end - lagTime);
      synth.sarangiLoopGainNode.gain.setValueAtTime(1, end);
    };
    const stopRecordingSarangi = (synth: SarangiSynthType) => {
      const realNow = now()
      const bufNode = synth.sarangiLoopSourceNode;
      const gainNode = synth.sarangiLoopGainNode;
      if (bufNode.playing) {
        // turn gain off
        gainNode.gain.setValueAtTime(1, realNow);
        gainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);

        // stop buffer
        bufNode.stop(realNow + lagTime);

        // disconnect, reset, and reconnect
        bufNode.onended = () => {
          bufNode.disconnect();
          synth.sarangiLoopSourceNode = props.ac.createBufferSource();
          synth.sarangiLoopSourceNode.loop = true;
          synth.sarangiLoopSourceNode.connect(gainNode);
        };
      }
    }
    const recordKlatt = (synth: KlattSynthType, start: number, end: number) => {
      const bufSize = (end - start) * props.ac.sampleRate;
      synth.capture.bufferSize!.setValueAtTime(bufSize, now());
      synth.capture.active!.setValueAtTime(1, start);
      synth.capture.active!.setValueAtTime(0, end);
      const curGain = synth.intGain.gain.value;
      synth.intGain.gain.setValueAtTime(curGain, end);
      synth.intGain.gain.setValueAtTime(0, end + lagTime);
      synth.klattLoopGainNode.gain.setValueAtTime(0, end - lagTime);
      synth.klattLoopGainNode.gain.setValueAtTime(1, end);
    };
    const stopRecordingKlatt = (synth: KlattSynthType) => {
      const realNow = now()
      const bufNode = synth.klattLoopSourceNode;
      const gainNode = synth.klattLoopGainNode;
      if (bufNode.playing) {
        // turn gain off
        gainNode.gain.setValueAtTime(1, realNow);
        gainNode.gain.linearRampToValueAtTime(0, realNow + lagTime);

        // stop buffer
        bufNode.stop(realNow + lagTime);

        // disconnect, reset, and reconnect
        bufNode.onended = () => {
          bufNode.disconnect();
          synth.klattLoopSourceNode = props.ac.createBufferSource();
          synth.klattLoopSourceNode.loop = true;
          synth.klattLoopSourceNode.connect(gainNode);
        };
      }
    };

    // watchers
    watch(
      () => props.instTracks.map(t => t.sounding), 
      (newVal, oldVal) => {
        const realNow = now();
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i] !== oldVal[i]) {
            const node = synths[i].sonifyNode;
            if (newVal[i]) {
              node.gain.setValueAtTime(0, realNow);
              node.gain.linearRampToValueAtTime(1, realNow + lagTime);
            } else {
              node.gain.setValueAtTime(1, realNow);
              node.gain.linearRampToValueAtTime(0, realNow + lagTime);
            }
          }
        }
      },
      { deep: true }
    );

    onMounted(async () => {
      // add capture worklet
      emit('synthsMounted', false);
      try {
        await props.ac.audioWorklet.addModule(caURL);
        const synthPromises = props.instTracks.map(async (track, idx) => {
          const vox = [Instrument.Vocal_M, Instrument.Vocal_F];
          if (track.inst === Instrument.Sitar) {
            const sitar = await spawnSitar(props.controls[idx] as SitarSynthControl);
            initializeSitarCapture(sitar);
            return sitar;
          } else if (track.inst === Instrument.Sarangi) {
            const sarangi = await spawnSarangi(props.controls[idx] as SarangiSynthControl);
            initializeSarangiCapture(sarangi);
            return sarangi;
          } else if (vox.includes(track.inst)) {
            const klatt = await spawnKlatt(props.controls[idx] as KlattSynthControl);
            initializeKlattCapture(klatt);
            return klatt;
          }
          return null;
        });
        const resolvedSynths = await Promise.all(synthPromises);
        resolvedSynths.forEach(synth => {
          if (synth !== null) {
            synths.push(synth)
          } else {
            throw new Error('Synth not resolved')
          }
        });
        preSetFirstEnvelopes();
        emit('synthsMounted', true);
      } catch (e) {
        console.error('Error mounting synths');
        throw e;
      } 
    });
    return {
      mixNode,
      synths,
      sendBurst,
      cancelBursts,
      playAllTrajs,
      firstEnvelopes,
      cancelAllTrajs, 
      recordAllSynths,
      stopRecordingSynths,
    }
  }
})
</script>
<style scoped>
</style>
