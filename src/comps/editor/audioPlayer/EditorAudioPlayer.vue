<template>
  <div class="mainq" ref="main">
    <div
      class="player"
      @mouseover="hoverTrigger(true)"
      @mouseleave="hoverTrigger(false)"
      @mousemove="handleCircleMouseMove"
      @mouseup="handleCircleMouseUp"
    >
      <div class="progBarOuter" @click="handleProgressClick" ref="pbOuter">
        <div class="progBarInner">
          <div :class="`currentTime tooLeft`">
            {{ formattedCurrentTime }}
          </div>
          <div class="progressCircle">
          </div>
        </div>
        <div class="timeLeft">{{ '-' + formattedTimeLeft }}</div>
      </div>
      <div class="controlsContainer">
        <div class="spacer">
          <div class="innerSpacer"></div>
          <div class="recInfo left">
            <div class="span">
              {{ performers.join(', ') }}
            </div>
            <div class="span">{{ raags.join('; ') }}</div>
          </div>
        </div>
        <div class="controlFlexer">
          <div class="controlBox" v-if="!loading">
            <img :src="icons.back_15" @click="back_15" />
            <div class="playCircle" @click="togglePlay">
              <img
                ref="playImg"
                :src="[icons.play, icons.pause][Number(playing)]"
              />
            </div>
            <img :src="icons.forward_15" @click="forward_15" class="icon" />
          </div>
          <div class="loadingSymbol" v-else>
            <div class="loader"></div>
          </div>
        </div>
        <div class="recInfo right">
          <div class='rulerBox'>
            <img
              :src='icons.specControl'
              @click='toggleSpecControls'
              class='specImg'
              ref='specImg'
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
            />
          </div>
          <div class="rulerBox">
            <img
              :src="icons.tags"
              @click="toggleLabelControls"
              class="tagsImg"
              ref="tagsImg"
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
            />
          </div>
          <div class="rulerBox">
            <img
              :src="icons.meter"
              @click="toggleMeterControls"
              class="meterImg"
              ref="meterImg"
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
            />
          </div>
          <div class="rulerBox">
            <img
              :src="icons.download"
              @click="toggleDownloads"
              class="downloadImg"
              ref="downloadImg"
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
            />
          </div>
          <div class='rulerBox'>
            <img
            :src='icons.share'
            @click='toggleShare'
            class='shareImg'
            ref='shareImg'
            @mouseover='controlsMouseOver'
            @mouseout='controlsMouseOut'
            />
          </div>
          <div class="rulerBox">
            <img
              :src="icons.tuningFork"
              @click="toggleTuning"
              class="tuningFork"
              ref="tuningImg"
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
            />
          </div>
          <div class="rulerBox">
            <img 
              :src="icons.ruler" 
              @click="toggleControls" 
              ref="controlsImg" 
              class='showControls'
              @mouseover='controlsMouseOver'
              @mouseout='controlsMouseOut'
              />
          </div>
        </div>
      </div>
    </div>
    <SynthesisControls
      class='synthControls'
      ref='synthControls'
      v-if='showControls && synthControls.length > 0'
      :synthControls='synthControls'
      :instTracks='instTracks'
      :height='controlsHeight'
      :transposition='transposition'
      :regionSpeed='regionSpeed'
      :playing='playing'
      :stretchable='stretchable'
      :shiftOn='shiftOn'
      :regionSpeedOn='regionSpeedOn'
      :readyToShift='readyToShift'
      :mixedGainVal='mixedGainVal'
      :recGainVal='recGain'
      :hasRecording='hasRecording'
      @update:transposition='transposition = Number($event)'
      @update:regionSpeed='regionSpeed = Number($event)'
      @update:regionSpeedOn='regionSpeedOn = $event'
      @toggleShift='toggleShift'
      @update:shiftOn='shiftOn = $event'
      @toggleRegionSpeed='toggleRegionSpeed'
      @regionSpeedChange='handleRegionSpeedChange'
      @update:mixedGainVal='updateMixedGainVal'
      @update:recGainVal='updateRecGainVal'
      @update:gainNode='handleUpdateGainNode'
      @update:cutoff='handleUpdateCutoff'
      @update:sonify='handleUpdateSonify'
    />
    <div class='downloads' v-if='showDownloads'>
      <label>Data</label>
      <fieldset class='dataRadioButtons'>
        <div class='dataChoice'>
          <input 
            type='radio' 
            id='dataChoice1' 
            name='dataType' 
            value='json'
            v-model='dataChoice'
            />
          <label for='dataChoice1'>json</label>
        </div>
        <div class='dataChoice'>
          <input 
            type='radio' 
            id='dataChoice2' 
            name='dataType' 
            value='xlsx'
            v-model='dataChoice'
            />
          <label for='dataChoice2'>xlsx</label>
        </div>
        <div class='dataChoice'>
          <input 
            type='radio' 
            id='dataChoice3' 
            name='dataType' 
            value='tuning'
            v-model='dataChoice'
            />
          <label for='dataChoice3'>staff tuning</label>
        </div>
      </fieldset>
      <button @click='handleDownload'>Download</button>
    </div>
    <div class='share' v-if='showShare'>
      <label>Share</label>
      <label>
        Start at current time
        <input type="checkbox" v-model="startAtCurrentTime" />
      </label>
      <div class='shareRow'>
        <input 
          type='text' 
          v-model='shareLink'
          readonly
        />
        <button @click="copyShareLink">Copy</button>
      </div>
    </div>
    <div class='tuningControls' v-if='showTuning'>
      <div class='buttons'>
        <button @click='resetTunings'>Reset</button>
      </div>
      <div 
        :class='`tuningBox \
          ${["", "last"][Number(sIdx === sargam.length-1)]} \
          ${["", "first"][Number(sIdx === 0)]}
        `' 
        v-for='(s, sIdx) in tuningDisplayLabels' 
        :key='s'>
        <div class='sargamLetter'>
          {{s}}
        </div>
        <div class='sliders'>
          <div class='paddingCol'></div>
          <div class='leftSliderCol' v-if='sIdx !== 0'>
            <div class='label'></div>
            <div class='centsTickLabels'>
              <div class='centsLabel'>+50&#162;-</div>
              <div class='centsLabel'>0&#162;-</div>
              <div class='centsLabel'>-50&#162;-</div>
            </div>
          </div>
          <div class='sliderCol' v-if='sIdx !== 0'>
            <div class='label'>Tune</div>
            <input 
              type='range' 
              min='-50' 
              max='50' 
              step='1' 
              v-model='centDevs[sIdx]'
              @input='updateTuning(sIdx)' 
              @change='instantiateTuning'
            />
          </div>
          <div class='sliderCol'>
            <div class='label'>Gain</div>
            <input 
              type='range' 
              orient='vertical' 
              min='0' 
              max='1' 
              step='0.01'
              v-model='tuningGains[sIdx]'
              @input='updateTuningGain(sIdx)'
            />
          </div>
        </div>
      </div>
    </div>
    <MeterControls 
      v-show='showMeterControls' 
      :height='controlsHeight'
      :playerHeight='playerHeight'
      :editable='editable'
      :currentTime='parentCurrentTime'
      :insertPulses='insertPulses'
      :editorMode='editorMode'
      :selectedMeter='selectedMeter'
      :meters='piece.meters'
      ref='meterControls'
      @passthroughResetZoomEmit='passthroughResetZoom'
      @pSelectMeterEmit='passthroughSelectMeter'
      @passthroughAddMeterEmit='passthroughAddMeter'
      @passthroughAddMetricGridEmit='passthroughAddMetricGrid'
      @passthroughRemoveMeterEmit='passthroughRemoveMeter'
      @passthroughUnsavedChangesEmit='passthroughUnsavedChanges'
      @passthroughAssignPrevMeterEmit='passthroughAssignPrevMeter'
      @maxLayerEmit='$emit("maxLayerEmit", $event)'
      @renderMeter='$emit("renderMeter", $event)'
      @rerenderMeter='$emit("rerenderMeter", $event)'
      />
    <LabelEditor
      v-if='showLabelControls'
      :height='controlsHeight'
      :playerHeight='playerHeight'
      :editable='editable'
      :piece='piece'
      :vocal='vocal!'
      :editingInstIdx='editingInstIdx'
      @unsavedChanges='$emit("unsavedChangesEmit", true)'
      @goToPhraseEmit='goToPhrase'
      @goToSectionEmit='goToSection'
      ref='labelControls'
    />
    <SpectrogramControls
      v-if='
        transcriptionWidth !== 0 &&
        raga && ac
        '
      v-show='showSpecControls'
      :height='controlsHeight'
      :playerHeight='playerHeight'
      :audioID='id'
      :saFreq='raga.fundamental'
      :scaledWidth='transcriptionWidth'
      :scaledHeight='transcriptionHeight'
      :extLowOctOffset='lowOctOffset'
      :extHighOctOffset='highOctOffset'
      :backgroundColor='backgroundColor'
      :axisColor='axisColor'
      :melographColor='melographColor'
      :ac='ac'
      :maxPitch='maxPitch'
      :minPitch='minPitch'
      :raga='raga'
      :sargamLineColor='sargamLineColor'
      :instTracks='instTracks'
      :editingInstIdx='editingInstIdx'
      :meterColor='meterColor'
      :selectedMeterColor='selectedMeterColor'
      :playheadColor='playheadColor'
      :playheadAnimation='playheadAnimation'
      :highlightTrajs='highlightTrajs'
      :zoomXFactor='zoomXFactor'
      :zoomYFactor='zoomYFactor'
      :scaleSystem='scaleSystem'
      :hasSitar='hasSitar'
      :hasVocal='hasVocal'
      :hasRecording='hasRecording'
      :showSpectrogram='showSpectrogram'
      :showMelograph='showMelograph'
      :showSargam='showSargam'
      :showSargamLines='showSargamLines'
      :showBols='showBols'
      :showTranscription='showTranscription'
      :showMeter='showMeter'
      :showPhonemes='showPhonemes'
      :showPhraseDivs='showPhraseDivs'
      :excerptRange='excerptRange'
      :durTot='audioDBDoc ? audioDBDoc.duration : piece.durTot!'
      :showPhraseLabels='showPhraseLabels'
      @specCanvas='handleSpecCanvas'
      @update:backgroundColor='$emit("update:backgroundColor", $event)'
      @update:axisColor='$emit("update:axisColor", $event)'
      @update:melographColor='$emit("update:melographColor", $event)'
      @update:saFreq='$emit("update:saFreq", $event)'
      @update:maxPitch='$emit("update:maxPitch", $event)'
      @update:minPitch='$emit("update:minPitch", $event)'
      @update:sargamLineColor='$emit("update:sargamLineColor", $event)'
      @update:instTracks='$emit("update:instTracks", $event)'
      @update:meterColor='$emit("update:meterColor", $event)'
      @update:showPhraseLabels='$emit("update:showPhraseLabels", $event)'
      @update:selectedMeterColor='$emit("update:selectedMeterColor", $event)'
      @update:playheadColor='$emit("update:playheadColor", $event)'
      @update:playheadAnimation='$emit("update:playheadAnimation", $event)'
      @update:highlightTrajs='$emit("update:highlightTrajs", $event)'
      @update:zoomFactors='$emit("update:zoomFactors", $event)'
      @update:scaleSystem='$emit("update:scaleSystem", $event)'
      @update:showSpectrogram='$emit("update:showSpectrogram", $event)'
      @update:showMelograph='$emit("update:showMelograph", $event)'
      @update:showSargam='$emit("update:showSargam", $event)'
      @update:showSargamLines='$emit("update:showSargamLines", $event)'
      @update:showBols='$emit("update:showBols", $event)'
      @update:showTranscription='$emit("update:showTranscription", $event)'
      @update:showMeter='$emit("update:showMeter", $event)'
      @update:showPhonemes='$emit("update:showPhonemes", $event)'
      @update:showPhraseDivs='$emit("update:showPhraseDivs", $event)'
      />
      <Synths
        :key='synthsKey'
        ref='synths'
        v-if='ac !== undefined && instTracks.length > 0 && synthControls.length > 0'
        :ac='ac'
        :piece='piece'
        :gainVal='1'
        :instTracks='instTracks'
        :controls='synthControls'
        :curPlayTime='curPlayTime'
        :transposition='transposition'
        :uniformVowel='uniformVowel'
        @synthsMounted='afterSynthsMounted'
      />
  </div>
</template>
<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { BrowserInfo, detect } from 'detect-browser';
import { drag as d3Drag, select as d3Select } from 'd3';
import * as VF from 'vexflow'

// Components
import SpectrogramControls from '@/comps/editor/audioPlayer/SpectrogramControls.vue';
import MeterControls from '@/comps/editor/audioPlayer/MeterControls.vue';
import LabelEditor from '@/comps/editor/LabelEditor.vue';
import Synths from '@/comps/editor/audioPlayer/Synths.vue';
import InstrumentControl from '@/comps/editor/audioPlayer/InstrumentControl.vue';
import SynthesisControls from '@/comps/editor/audioPlayer/SynthesisControls.vue';

// Icons
import beginningIcon from '@/assets/icons/beginning.svg';
import endIcon from '@/assets/icons/end.svg';
import loopIcon from '@/assets/icons/loop.svg';
import back_15 from '@/assets/icons/back_15.svg';
import forward_15 from '@/assets/icons/forward_15.svg';
import pauseIcon from '@/assets/icons/pause.svg';
import playIcon from '@/assets/icons/play.svg';
import shuffleIcon from '@/assets/icons/shuffle.svg';
import rulerIcon from '@/assets/icons/ruler.svg';
import tagsIcon from '@/assets/icons/tags.svg';
import tuningForkIcon from '@/assets/icons/tuning_fork.png';
import downloadIcon from '@/assets/icons/download.svg';
import meterIcon from '@/assets/icons/meter.svg';
import specControlIcon from '@/assets/icons/specControls.svg';
import shareIcon from '@/assets/icons/share.svg';

// URLs
import caURL from '@/audioWorklets/captureAudio.worklet.js?url';
import rubberBandUrl from '@/audioWorklets/rubberband-processor.worklet.js?url';
import stretcherURL from '@/js/bundledStretcherWorker.js?url';

// Classes and Types
import { 
  getStarts, 
  getEnds, 
  Phrase, 
  Trajectory, 
  Raga, 
  RuleSetType,
  Piece,
  Pitch
} from '@model';
import { 
  EditorMode, 
  PlayheadAnimations,
  ControlsMode,
  Instrument,
  ScaleSystem
 } from '@shared/enums';
import { AudioWorklet } from '@/audio-worklet';
import { excelData, jsonData } from '@/js/serverCalls.ts';
import { tuningData } from '@/ts/tuningData.ts';
import { Meter } from '@/js/meter.ts';
import { 
  RecType, 
  MusicianType,
  InstrumentTrackType, 
  TooltipData,
  SynthControl,
  SitarSynthType,
  SarangiSynthType,
  KlattSynthType, 
  NumObj,
  ExcerptRange,
} from '@shared/types';

// External Libraries
import { createRubberBandNode as createRBNode } from 'rubberband-web';

type EditorAudioPlayerData = {
  progress: number;
  playing: boolean;
  looping: boolean;
  shuffling: boolean;
  showWaveform: boolean;
  audio: {
    paused: boolean;
  };
  icons: {
    beginning: string;
    end: string;
    loop: string;
    pause: string;
    play: string;
    shuffle: string;
    ruler: string;
    back_15: string;
    forward_15: string;
    download: string;
    tuningFork: string;
    meter: string;
    tags: string;
    specControl: string;
    share: string;
  };
  circleDragging: boolean;
  formattedCurrentTime: string;
  formattedTimeLeft: string;
  waKey: number;
  loading: boolean;
  startedAt: number;
  pausedAt: number;
  loop: boolean;
  loopStart: number | undefined;
  loopEnd: number | undefined;
  slowRamp: number;
  bufferSourceNodes: AudioBufferSourceNode[];
  chikariGain: number;
  lagTime: number;
  showControls: boolean;
  recGain: number;
  synthGain: number;
  synthDamp: number;
  valueCurveMinim: number;
  pieceTitle: string | undefined;
  performers: string[];
  raags: string[];
  showTuning: boolean;
  showDownloads: boolean;
  showShare: boolean;
  showMeterControls: boolean;
  showLabelControls: boolean;
  showSpecControls: boolean;
  sargam: string[];
  solfege: string[];
  pitchClasses: string[];
  westernPitches: string[];
  centDevs: number[];
  tuningGains: number[];
  srgmLtrHeight: number;
  tuningLblHeight: number;
  tuningGainFactor: number;
  dataChoice: string;
  noAudio: boolean;
  inited: boolean;
  modsLoaded: boolean;
  transposition: number;
  string: boolean | undefined;
  vocal: boolean | undefined;
  sarangi: boolean;
  dragStartX: number | undefined;
  shiftOn: boolean;
  readyToShift: boolean;
  klattActive: boolean;
  vowelParams: number[][][];
  soundtouch: any;
  stretchable: boolean;
  regionSpeed: number;
  regionSpeedOn: boolean;
  stretchBuf: AudioBuffer | undefined;
  chikariGainDisabled: boolean;
  synthGainDisabled: boolean;
  stretchedBuffer: AudioBuffer | undefined;
  raga: Raga | undefined;
  intSynthGainNode?: GainNode;
  ruleSet?: RuleSetType;
  ac?: AudioContext;
  stretchWorker?: Worker;
  synthGainNode?: GainNode;
  chikariGainNode?: GainNode;
  savedSynthGain: number | undefined;
  savedChikariGain: number | undefined;
  startingDelta?: number;
  loopTime?: number;
  sourceNode?: AudioBufferSourceNode | undefined | null;
  synthLoopSource?: LoopSourceNode | undefined;
  chikLoopSource?: LoopSourceNode | undefined;
  otherNode?: ChikariNodeType;
  intChikariGainNode?: GainNode;
  chikariDCOffsetNode?: BiquadFilterNode;
  pluckNode?: PluckNodeType | null;
  lowPassNode?: BiquadFilterNode;
  pluckDCOffsetNode?: BiquadFilterNode;
  vocalNode?: OscillatorNode;
  vocalGainNode?: GainNode;
  synthLoopGainNode?: GainNode;
  chikLoopGainNode?: GainNode;
  capture?: CaptureNodeType;
  endRecTime?: number;
  audioBuffer?: AudioBuffer;
  gainNode?: GainNode;
  synthLoopBufSourceNode?: AudioBufferSourceNode;
  firstEnvelope: Float32Array;
  firstLPEnvelope: Float32Array;
  klattNode?: KlattNodeType;
  chikariNodes: ChikariNodeType[];
  requestId?: number;
  rubberBandNode?: RubberBandNodeType;
  ETRatios: number[];
  initFreqs: number[];
  currentFreqs: number[];
  tuningMasterGainNode?: GainNode;
  tuningGainNodes: GainNode[];
  tuningSines: OscillatorNode[];
  // sarangiSynth?: SarangiSynthType;
  klattMiddleGain?: GainNode;
  selectedControlsMode: ControlsMode;
  controlsHoverTimeout?: NodeJS.Timeout;
  controlsTexts: {[key: string]: string};
  synthControls: SynthControl[],
  initializedSynthControls: boolean,
  mixedGainVal: number,
  tempMixedGainVal: number,
  startAtCurrentTime: boolean,
  synthsKey: number,
}

interface RubberBandNodeType extends AudioWorkletNode {
  setPitch: (pitch: number) => void;
  setHighQuality: (hq: boolean) => void;
}

interface LoopSourceNode extends AudioBufferSourceNode {
  playing?: boolean;
}

interface ChikariNodeType extends AudioWorkletNode {
  freq0?: AudioParam;
  freq1?: AudioParam;
  cutoff?: AudioParam;
}

interface PluckNodeType extends AudioWorkletNode {
  frequency?: AudioParam;
  cutoff?: AudioParam;
}

interface CaptureNodeType extends AudioWorkletNode {
  bufferSize?: AudioParam;
  active?: AudioParam;
  cancel?: AudioParam;
}

interface KlattNodeType extends AudioWorkletNode {
  extGain?: AudioParam;
  f0?: AudioParam;
  f1?: AudioParam;
  f2?: AudioParam;
  f3?: AudioParam;
  f4?: AudioParam;
  f5?: AudioParam;
  f6?: AudioParam;
  b1?: AudioParam;
  b2?: AudioParam;
  b3?: AudioParam;
  b4?: AudioParam;
  b5?: AudioParam;
  b6?: AudioParam;
  db1?: AudioParam;
  db2?: AudioParam;
  db3?: AudioParam;
  db4?: AudioParam;
  db5?: AudioParam;
  db6?: AudioParam;
  flutterLevel?: AudioParam;
  openPhaseRatio?: AudioParam;
  breathinessDb?: AudioParam;
  tiltDb?: AudioParam;
  gainDb?: AudioParam;
  agcRmsLevel?: AudioParam;
  cascadeEnabled?: AudioParam;
  cascadeVoicingDb?: AudioParam;
  cascadeAspirationDb?: AudioParam;
  cascadeAspirationMod?: AudioParam;
  nasalFormantFreq?: AudioParam;
  nasalFormantFreqToggle?: AudioParam;
  nasalFormantBw?: AudioParam;
  nasalFormantBwToggle?: AudioParam;
  nasalAntiformantFreq?: AudioParam;
  nasalAntiformantFreqToggle?: AudioParam;
  nasalAntiformantBw?: AudioParam;
  nasalAntiformantBwToggle?: AudioParam;
  parallelEnabled?: AudioParam;
  parallelVoicingDb?: AudioParam;
  parallelAspirationDb?: AudioParam;
  parallelAspirationMod?: AudioParam;
  fricationDb?: AudioParam;
  fricationMod?: AudioParam;
  parallelBypassDb?: AudioParam;
  nasalFormantDb?: AudioParam;
}

// interface SarangiSynthType extends AudioWorkletNode {
//   freq?: AudioParam;
//   bowGain?: AudioParam;
//   gain?: AudioParam;
// }

const structuredTime = (dur: number) => {
  const hours = String(Math.floor(dur / 3600));
  const minutes = leadingZeros(Math.floor((dur % 3600) / 60));
  const seconds = leadingZeros(Math.round(dur % 60));
  return { hours: hours, minutes: minutes, seconds: seconds };
};
const leadingZeros = (int: number) => {
  if (int < 10) {
    return '0' + int;
  } else {
    return String(int);
  }
};
export default defineComponent({
  name: 'EditorAudioPlayer',
  data(): EditorAudioPlayerData {
    return {
      progress: 0.0,
      playing: false,
      looping: false,
      shuffling: false,
      showWaveform: false,
      audio: {
        paused: false,
      },
      icons: {
        beginning: beginningIcon,
        end: endIcon,
        loop: loopIcon,
        pause: pauseIcon,
        play: playIcon,
        shuffle: shuffleIcon,
        ruler: rulerIcon,
        back_15: back_15,
        forward_15: forward_15,
        download: downloadIcon,
        tuningFork: tuningForkIcon,
        meter: meterIcon,
        tags: tagsIcon,
        specControl: specControlIcon,
        share: shareIcon,
      },
      circleDragging: false,
      formattedCurrentTime: '00:00',
      formattedTimeLeft: '00:00',
      waKey: 0,
      loading: true,
      startedAt: 0,
      pausedAt: 0,
      loop: false,
      loopStart: undefined,
      loopEnd: undefined,
      slowRamp: 1,
      bufferSourceNodes: [],
      chikariGain: 0,
      lagTime: 0.025,
      showControls: true,
      recGain: 1,
      synthGain: 0,
      synthDamp: 0.5,
      valueCurveMinim: 0.001,
      pieceTitle: undefined,
      performers: [],
      raags: [],
      showTuning: false,
      showDownloads: false,
      showShare: false,
      showMeterControls: false,
      showLabelControls: false,
      showSpecControls: false,
      sargam: [],
      solfege: [],
      pitchClasses: [],
      westernPitches: [],
      centDevs: [],
      tuningGains: [],
      srgmLtrHeight: 30,
      tuningLblHeight: 20,
      tuningGainFactor: 0.25,
      dataChoice: 'xlsx',
      noAudio: false,
      inited: false,
      modsLoaded: false,
      transposition: 0,
      string: undefined,
      vocal: undefined,
      dragStartX: undefined,
      shiftOn: false,
      readyToShift: false,
      klattActive: false,
      vowelParams: [ // f1, f2, f3, b1, b2, b3
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
      ],
      soundtouch: undefined,
      stretchable: false,
      regionSpeed: 0.0,
      regionSpeedOn: false,
      stretchBuf: undefined,
      chikariGainDisabled: false,
      synthGainDisabled: false,
      stretchedBuffer: undefined,
      raga: undefined,
      savedSynthGain: undefined,
      requestId: undefined,
      rubberBandNode: undefined,
      chikariNodes: [],
      klattNode: undefined,
      firstLPEnvelope: new Float32Array(256),
      firstEnvelope: new Float32Array(256),
      ac: undefined,
      intSynthGainNode: undefined,
      ruleSet: undefined,
      stretchWorker: undefined,
      synthGainNode: undefined,
      chikariGainNode: undefined,
      savedChikariGain: undefined,
      startingDelta: undefined,
      loopTime: undefined,
      sourceNode: undefined,
      synthLoopSource: undefined,
      chikLoopSource: undefined,
      otherNode: undefined,
      intChikariGainNode: undefined,
      chikariDCOffsetNode: undefined,
      pluckNode: undefined,
      lowPassNode: undefined,
      pluckDCOffsetNode: undefined,
      vocalNode: undefined,
      vocalGainNode: undefined,
      synthLoopGainNode: undefined,
      chikLoopGainNode: undefined,
      capture: undefined,
      endRecTime: undefined,
      audioBuffer: undefined,
      gainNode: undefined,
      synthLoopBufSourceNode: undefined,
      ETRatios: [],
      initFreqs: [],
      currentFreqs: [],
      tuningMasterGainNode: undefined,
      tuningGainNodes: [],
      tuningSines: [],
      sarangi: false, // placeholder
      // sarangiSynth: undefined,
      klattMiddleGain: undefined,
      selectedControlsMode: ControlsMode.Synthesis,
      controlsHoverTimeout: undefined,
      controlsTexts: {
        specImg: 'Transcription and Graphic Controls',
        tagsImg: 'Label Editor',
        meterImg: 'Meter Controls',
        downloadImg: 'Download Data',
        tuningFork: 'Tuning Controls',
        showControls: 'Synthesis Controls',
        shareImg: 'Share Transcription',
      },
      synthControls: [],
      initializedSynthControls: false,
      mixedGainVal: 1,
      tempMixedGainVal: 1,
      startAtCurrentTime: false,
      synthsKey: 0,
    };
  },
  props: {
    audioSource: {
      type: String
    },
    saEstimate: {
      type: Number
    }, 
    saVerified: {
      type: Boolean
    }, 
    id: {
      type: String
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    playerHeight: {
      type: Number,
      required: true
    },
    controlsHeight: {
      type: Number,
      required: true
    },
    editable: {
      type: Boolean
    },
    windowWidth: {
      type: Number
    },
    regionStartTime: {
      type: Number
    },
    audioDBDoc: {
      type: Object as PropType< RecType | undefined>,
      required: false
    },
    regionEndTime: {
      type: Number
    },
    playheadReturn: {
      type: Boolean
    },
    parentCurrentTime: {
      type: Number,
      required: true
    },
    durTot: {
      type: Number,
      required: true
    },
    insertPulses: {
      type: Array as PropType<number[]>,
      required: true
    },
    uniformVowel: {
      type: Boolean,
      required: true
    },
    transcriptionWidth: {
      type: Number as PropType<number>,
      required: true,
      validator: (val: number) => Number.isInteger(val)
    },
    transcriptionHeight: {
      type: Number,
      required: true,
      validator: (val: number) => Number.isInteger(val)
    },
    lowOctOffset: {
      type: Number,
      required: true
    },
    highOctOffset: {
      type: Number,
      required: true
    },
    backgroundColor: {
      type: String,
      required: true
    },
    axisColor: {
      type: String,
      required: true
    },
    melographColor: {
      type: String,
      required: true
    },
    maxPitch: {
      type: Object as PropType<Pitch>,
      required: true
    },
    minPitch: {
      type: Object as PropType<Pitch>,
      required: true
    },
    sargamLineColor: {
      type: String,
      required: true
    },
    instTracks: {
      type: Array as PropType<InstrumentTrackType[]>,
      required: true
    },
    editingInstIdx: {
      type: Number,
      required: true
    },
    meterColor: {
      type: String,
      required: true
    },
    selectedMeterColor: {
      type: String,
      required: true
    },
    editorMode: {
      type: String as PropType<EditorMode>,
      required: true
    },
    playheadColor: {
      type: String,
      required: true
    },
    hasRecording: {
      type: Boolean,
      required: true
    },
    playheadAnimation: {
      type: String as PropType<PlayheadAnimations>,
      required: true
    },
    highlightTrajs: {
      type: Boolean,
      required: true
    },
    selectedMeter: {
      type: Object as PropType<Meter>,
      required: false
    },
    zoomXFactor: {
      type: Number,
      required: true
    },
    zoomYFactor: {
      type: Number,
      required: true
    },
    scaleSystem: {
      type: String as PropType<ScaleSystem>,
      required: true
    },
    hasSitar: {
      type: Boolean,
      required: true
    },
    hasVocal: {
      type: Boolean,
      required: true
    },
    showSpectrogram: {
      type: Boolean,
      required: true
    },
    showMelograph: {
      type: Boolean,
      required: true
    },
    showSargam: {
      type: Boolean,
      required: true
    },
    showSargamLines: {
      type: Boolean,
      required: true
    },
    showBols: {
      type: Boolean,
      required: true
    },
    showTranscription: {
      type: Boolean,
      required: true
    },
    showMeter: {
      type: Boolean,
      required: true
    },
    showPhonemes: {
      type: Boolean,
      required: true
    },
    showPhraseDivs: {
      type: Boolean,
      required: true
    },
    excerptRange: {
      type: Object as PropType<ExcerptRange>,
      required: false
    },
    showPhraseLabels: {
      type: Boolean,
      required: true
    },
  },

  components: {
    MeterControls,
    LabelEditor,
    SpectrogramControls,
    Synths,
    InstrumentControl,
    SynthesisControls,
  },

  async mounted() {
    if (window.innerHeight < 800) {
      this.showControls = false;
      const controlsImg = this.$refs.controlsImg as HTMLImageElement;
      controlsImg.classList.remove('showControls');
    }
    this.initializeAudio();
    this.addDragger();
  },


  beforeUnmount() {
    this.tuningGains.forEach((_, i) => {
      this.tuningGains[i] = 0;
      this.updateTuningGain(i)
    });

    setTimeout(() => this.ac?.close(), this.lagTime * 1000);
    const nodes = [
      this.gainNode,
      this.synthGainNode,
      this.klattNode,
      this.synthLoopBufSourceNode,
      this.intSynthGainNode,
      this.chikariGainNode,
      this.rubberBandNode,
      this.otherNode,
      this.chikariDCOffsetNode,
      this.intChikariGainNode,
      this.pluckNode,
      this.lowPassNode,
      this.pluckDCOffsetNode,
      this.vocalNode,
      this.synthLoopGainNode,
      this.synthLoopSource,
      this.capture,
      this.chikLoopSource,
      this.chikLoopGainNode,
    ];
    nodes.forEach(node => {
      if (node) node.disconnect();
    })
  },
  watch: {
    async audioSource(newSrc) {
      this.loading = true;
      this.audioBuffer = await this.getAudio(newSrc, false, this.excerptRange);
      this.loading = false;
      if (this.regionStartTime && this.regionEndTime) this.updateStretchBuf();
      this.pausedAt = this.parentCurrentTime;
      this.updateProgress();
      this.updateFormattedCurrentTime();
      this.updateFormattedTimeLeft();
    },
    transposition(cents) {
      console.log('getting triggered?')
      const newVal = 2 ** (cents / 1200);
      this.rubberBandNode!.setPitch(newVal);
      const raga = this.piece.raga;
      const freqs = raga.chikariPitches.map((p) => p.frequency);
      const transp = 2 ** (this.transposition / 1200);
      const synthsComp = this.$refs.synths as InstanceType<typeof Synths>;
      this.instTracks.forEach((track, idx) => {
        if (track.inst === Instrument.Sitar) {
          const nodesObj = synthsComp.synths[idx] as SitarSynthType;
          const chikariNode = nodesObj.chikariNode;
          const curFreq0 = chikariNode.freq0!.value;
          const curFreq1 = chikariNode.freq1!.value;
          chikariNode.freq0!.setValueAtTime(curFreq0, this.now());
          chikariNode.freq1!.setValueAtTime(curFreq1, this.now());
          const et = this.now() + this.lagTime;
          chikariNode.freq0!.linearRampToValueAtTime(freqs[0] * transp, et);
          chikariNode.freq1!.linearRampToValueAtTime(freqs[1] * transp, et);
        }
      })
    },
    selectedControlsMode(mode, oldMode) {
      this.showSpecControls = false;
      this.showMeterControls = false;
      this.showLabelControls = false;
      this.showDownloads = false;
      this.showShare = false;
      this.showTuning = false;
      this.showControls = false;
      const controlsImg = this.$refs.controlsImg as HTMLImageElement;
      controlsImg.classList.remove('showControls');
      const tuningImg = this.$refs.tuningImg as HTMLImageElement;
      tuningImg.classList.remove('showTuning');
      const downloadImg = this.$refs.downloadImg as HTMLImageElement;
      downloadImg.classList.remove('showDownloads');
      const meterImg = this.$refs.meterImg as HTMLImageElement;
      meterImg.classList.remove('showMeterControls');
      const tagsImg = this.$refs.tagsImg as HTMLImageElement;
      tagsImg.classList.remove('showLabelControls');
      const specImg = this.$refs.specImg as HTMLImageElement;
      specImg.classList.remove('showSpecControls');
      const shareImg = this.$refs.shareImg as HTMLImageElement;
      shareImg.classList.remove('showShare');
      if (mode === ControlsMode.Display) {
        this.showSpecControls = true;
        specImg.classList.add('showSpecControls');
      } else if (mode === ControlsMode.Tag) {
        this.showLabelControls = true;
        tagsImg.classList.add('showLabelControls');
      } else if (mode === ControlsMode.Meter) {
        this.showMeterControls = true;
        meterImg.classList.add('showMeterControls');
      } else if (mode === ControlsMode.Download) {
        this.showDownloads = true;
        downloadImg.classList.add('showDownloads');
      } else if (mode === ControlsMode.Share) {
        this.showShare = true;
        shareImg.classList.add('showShare');
      }
      
      else if (mode === ControlsMode.Tuning) {
        this.showTuning = true;
        tuningImg.classList.add('showTuning');
      } else if (mode === ControlsMode.Synthesis) {
        this.showControls = true;
        controlsImg.classList.add('showControls');
      } else if (mode === ControlsMode.None) {
        this.$emit('resizeHeightEmit', false);
      }
      if (oldMode === ControlsMode.None) {
        this.$emit('resizeHeightEmit', true);
      }
    },
    instTracks: {
      handler(newTracks) {
        if (newTracks.length > 0 && !this.initializedSynthControls) {
          this.initializeSynthControls()
        }
      },
      deep: true
    }
  },
  computed: {
    curPlayTime() {
      if (this.pausedAt) {
        return this.pausedAt;
      } else if (this.playing) {
        if (this.startingDelta === undefined) {
          return 0
        }
        if (this.loop && this.startingDelta < this.loopEnd!) {
          const dur = this.loopEnd! - this.loopStart!;
          const realTime = this.now() - this.startedAt;
          this.loopTime = realTime;
          if (realTime > this.loopEnd!) {
            this.loopTime =
              this.loopStart! + ((realTime - this.loopStart!) % dur);
          }
          return this.loopTime;
        } else {
          return this.now() - this.startedAt;
        }
      } else {
        return 0;
      }
    },

    shareLink() {
      let link = `https://swara.studio/editor?id=${this.piece._id}`;
      if (this.startAtCurrentTime) {
        let rounded = Math.round(this.getCurTime());
        link += `&t=${rounded}`;
      }
      return link
    },

    tuningDisplayLabels() {
      const ss = this.scaleSystem;
      if (ss === ScaleSystem.Sargam || ss === ScaleSystem.SargamCents) {
        return this.sargam;
      } else if (ss === ScaleSystem.Solfege || ss === ScaleSystem.SolfegeCents) {
        return this.solfege;
      } else if (
        ss === ScaleSystem.PitchClass || 
        ss === ScaleSystem.PitchClassCents ||
        ss === ScaleSystem.Cents
      ) {
        return this.pitchClasses;
      } else if (ss === ScaleSystem.MovableCCents) {
        return this.westernPitches;
      }
    }
  },
  methods: {

    async resetAudio() {
      this.playing = false;
      try {
        if (this.ac) {
          await this.ac.close();
        }
        this.initializeAudio();
        this.synthsKey++;

      } catch (e) {
        console.error(e);
      }
    },

    afterSynthsMounted(mounted: boolean) {
      if (mounted) {
        const sc = this.$refs.synthControls as 
            InstanceType<typeof SynthesisControls>;
        if (sc && sc.reemitAllInstrumentControlParams) {
          sc.reemitAllInstrumentControlParams();
        }
      }
    },

    initializeAudio() {
      this.ac = new AudioContext({ sampleRate: 48000 });
      this.gainNode = this.ac.createGain();
      this.gainNode.gain.setValueAtTime(this.recGain, this.now());
      this.initializeStretching();
      this.gainNode.connect(this.ac.destination);    
      if (this.audioDBDoc && this.piece) this.gatherInfo();
      this.synthLoopBufSourceNode = this.ac.createBufferSource();
      this.synthLoopBufSourceNode.loop = true; 
      
    },

    copyShareLink() {
      navigator.clipboard.writeText(this.shareLink);
    },

    handleUpdateSonify(val: boolean) {
      this.$emit('update:sonify', val);
    },

    updateMixedGainVal(val: string) {
      this.mixedGainVal = Number(val);
      const s = this.$refs.synths as InstanceType<typeof Synths>;
      const curVal = s.mixNode.gain.value;
      s.mixNode.gain.setValueAtTime(curVal, this.now());
      const targetTime = this.now() + this.lagTime;
      s.mixNode.gain.linearRampToValueAtTime(this.mixedGainVal, targetTime);
    },

    updateRecGainVal(val: string) {
      this.recGain = Number(val);
      const curVal = this.gainNode!.gain.value;
      const gain = this.gainNode!.gain;
      gain.setValueAtTime(curVal, this.now());
      gain.linearRampToValueAtTime(this.recGain, this.now() + this.lagTime);

    },

    handleUpdateGainNode(slider: { 
      label: string, 
      target: number, 
      paramName: string,
      instIdx: number,
    }) {
      const s = this.$refs.synths as InstanceType<typeof Synths>;
      const inst = this.instTracks[slider.instIdx].inst;
      let synth: KlattSynthType | SitarSynthType | SarangiSynthType;
      let node: GainNode;
      if (inst === Instrument.Sitar) {
        synth = s.synths[slider.instIdx] as SitarSynthType;
        node = synth[slider.paramName as keyof typeof synth] as GainNode;
      } else if (inst === Instrument.Sarangi) {
        synth = s.synths[slider.instIdx] as unknown as SarangiSynthType;
        node = synth[slider.paramName as keyof typeof synth] as GainNode;
      } else if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
        synth = s.synths[slider.instIdx] as unknown as KlattSynthType;
        node = synth[slider.paramName as keyof typeof synth] as GainNode;
      } else {
        throw new Error('Invalid instrument')
      }
      const curVal = node.gain.value;
      node.gain.setValueAtTime(curVal, this.now());
      node.gain.linearRampToValueAtTime(slider.target, this.now() + this.lagTime);
    },

    handleUpdateCutoff(slider: {
      label: string,
      target: number,
      paramName: string,
      instIdx: number
    }) {
      const s = this.$refs.synths as InstanceType<typeof Synths>;
      const inst = this.instTracks[slider.instIdx].inst;
      const synth = s.synths[slider.instIdx] as SitarSynthType;
      const pName = slider.paramName as keyof typeof synth;
      const node = synth[slider.paramName as keyof typeof synth] as 
        PluckNodeType;
      const curVal = node.cutoff!.value;
      node.cutoff!.setValueAtTime(curVal, this.now());
      node.cutoff!.linearRampToValueAtTime(slider.target, this.now() + this.lagTime);

    },

    initializeSynthControls() {
      this.initializedSynthControls = true;
      this.instTracks.forEach((track, i) => {
        // chikari freqs
        this.piece.phraseGrid[i]
        if (track.inst === Instrument.Sitar) {
          this.synthControls.push({
            inst: track.inst,
            idx: i,
            params: {
              dampen: 0.5,
              outGain: 0,
              extSitarGain: 1,
              extChikariGain: 1,
              chikariFreq0: this.piece.chikariFreqs(i)[0],
              chikariFreq1: this.piece.chikariFreqs(i)[1],
            }
          });
        } else if (track.inst === Instrument.Sarangi) {
          this.synthControls.push({
            inst: track.inst,
            idx: i,
            params: {
              extSarangiGain: 0,
            }
          })
        } else if (track.inst === Instrument.Vocal_M || track.inst === Instrument.Vocal_F) {
          this.synthControls.push({
            inst: track.inst,
            idx: i,
            params: {
              extGain: 0,
            }
          })
        }
      })
    },

    controlsMouseOver(e: MouseEvent) {
      if (this.controlsHoverTimeout === undefined) {
        this.controlsHoverTimeout = setTimeout(() => {
          const key = (e.target as HTMLElement).classList[0];
          const text = this.controlsTexts[key];
          const data: TooltipData = {
            text: text,
            x: e.clientX,
            y: e.clientY
          };
          this.$emit('showTooltip', data);
        }, 500);
      }

    },

    controlsMouseOut(e: MouseEvent) {
      if (this.controlsHoverTimeout) {
        clearTimeout(this.controlsHoverTimeout);
        this.controlsHoverTimeout = undefined;
        this.$emit('hideTooltip');
      }


    },

    handleSpecCanvas(specCanvas: HTMLCanvasElement) {
      this.$emit('specCanvas', specCanvas);
    },

    goToPhrase(pIdx: number) {
      this.$emit('goToPhraseEmit', pIdx)
    },

    goToSection(sIdx: number) {
      this.$emit('goToSectionEmit', sIdx)
    },

    onSoundTouchInit() {
      console.log('soundtouch initialized')
    },

    addDragger() {
      interface Datum {
        x: number,
        y: number
      }
      const drag = d3Drag<SVGCircleElement, Datum>()
        .on('start', this.dragStart)
        .on('drag', this.dragging)
        .on('end', this.dragEnd);
      const pCircle = d3Select('.progressCircle') as 
        d3.Selection<SVGCircleElement, Datum, HTMLElement, undefined>;
      pCircle.call(drag);
    },

    dragStart(e: DragEvent) {
      console.log('drag start');
      this.dragStartX = e.x;
    },

    dragging(e: DragEvent) {
      const diff = this.dragStartX! - e.x;
      const pbi = document.querySelector('.progBarInner') as HTMLElement;
      const pbo = document.querySelector('.progBarOuter');
      const pboBox = pbo!.getBoundingClientRect();
      pbi!.style.width = pboBox.width * this.progress - diff + 'px';
      const ct = this.getCurTime();
      const dur = this.audioBuffer!.duration;
      const newTime = ct + (dur * (e.x - this.dragStartX!)) / pboBox.width;      
      this.updateFormattedCurrentTime(newTime);
      this.updateFormattedTimeLeft(newTime);
    },

    dragEnd(e: DragEvent) {
      const pbOuter = this.$refs.pbOuter as HTMLElement;
      const bb = pbOuter.getBoundingClientRect();
      const ct = this.getCurTime();
      const dur = this.audioBuffer!.duration;
      const newTime = ct + (dur * (e.x - this.dragStartX!)) / bb.width;
      if (!this.playing) {
          this.pausedAt = newTime;
          this.$emit('currentTimeEmit', this.pausedAt)
          this.$emit('movePlayheadsEmit')
          this.updateProgress();
        } else {
          this.stop();
          this.pausedAt = newTime;
          this.play();
        }
        this.updateFormattedCurrentTime();
        this.updateFormattedTimeLeft();
    },

    resetTunings() {
      this.centDevs = this.centDevs.map(() => 0);
      const ratios = this.initFreqs.map(if_ => if_ / this.raga!.fundamental);
      this.raga!.ratios = ratios;
      this.raga!.ratios.forEach((ratio, rIdx) => {
        const tuningKeys = this.raga!.ratioIdxToTuningTuple(rIdx);
        if (tuningKeys[0] === 'sa' || tuningKeys[0] === 'pa') {
          this.raga!.tuning[tuningKeys[0]] = ratio;
        } else {
          (this.raga!.tuning[tuningKeys[0]] as NumObj)[tuningKeys[1]!] = ratio;
        }
      })
      this.$emit('updateSargamLinesEmit')
      this.instantiateTuning();
      this.tuningSines.forEach((oscNode, i) => {
        const curVal = oscNode.frequency.value;
        oscNode.frequency.setValueAtTime(curVal, this.now());
        const newVal = this.raga!.fundamental * this.raga!.ratios[i];
        oscNode.frequency.setValueAtTime(newVal, this.now() + this.lagTime);
      })
    },

    updateTuningGain(sIdx: number) {
      if (this.ac!.state === 'suspended') this.ac!.resume();
      const gainNode = this.tuningGainNodes[sIdx];
      const curGain = gainNode.gain.value;
      gainNode.gain.setValueAtTime(curGain, this.now());
      const endTime = this.now() + this.lagTime;
      const newGain = this.tuningGains[sIdx];
      gainNode.gain.linearRampToValueAtTime(newGain, endTime);
    },

    updateTuning(sIdx: number) {
      const oscNode = this.tuningSines[sIdx];
      const curFreq = oscNode.frequency.value;
      oscNode.frequency.setValueAtTime(curFreq, this.now());
      const endTime = this.now() + this.lagTime;
      const initFreq = this.initFreqs[sIdx];
      const newFreq = initFreq * 2 ** (this.centDevs[sIdx] / 1200);
      const newRatio = newFreq / this.raga!.fundamental;
      this.raga!.ratios[sIdx] = newRatio;
      const tuningKeys = this.raga!.ratioIdxToTuningTuple(sIdx);
      if (tuningKeys[0] === 'sa' || tuningKeys[0] === 'pa') {
        this.raga!.tuning[tuningKeys[0]] = newRatio;
      } else {
        (this.raga!.tuning[tuningKeys[0]] as NumObj)[tuningKeys[1]!] = newRatio;
      }
      oscNode.frequency.linearRampToValueAtTime(newFreq, endTime);
      this.$emit('updateSargamLinesEmit');
      this.$emit('unsavedChangesEmit', true);
    },

    instantiateTuning() {
      this.piece.realignPitches();
      this.$emit('resetZoomEmit')
    },

    passthroughResetZoom() {
      this.$emit('resetZoomEmit')
    },

    passthroughSelectMeter(pulseUniqueId: string, turnMMOn: boolean = false) {
      console.log(pulseUniqueId)
      this.$emit('selectMeterEmit', pulseUniqueId) //turn metermode on
    },

    passthroughAddMeter(meter: Meter) {
      this.$emit('addMeterEmit', meter)
    },

    passthroughAddMetricGrid(codified: boolean = true) {
      this.$emit('addMetricGridEmit', codified)
    },

    passthroughRemoveMeter(meter: Meter) {
      this.$emit('removeMeterEmit', meter)
    },

    passthroughUnsavedChanges(truth: boolean) {
      this.$emit('unsavedChangesEmit', truth)
    },

    passthroughAssignPrevMeter() {
      this.$emit('assignPrevMeterEmit')
    },

    makeTuningSines() {
      this.tuningGainNodes = [...Array(this.sargam.length)].map(() => {
        return this.ac!.createGain()
      });
      this.tuningSines = [...Array(this.sargam.length)].map(() => {
          return this.ac!.createOscillator()
      });
      this.tuningMasterGainNode = this.ac!.createGain();
      this.tuningMasterGainNode.connect(this.ac!.destination);
      this.tuningMasterGainNode.gain.setValueAtTime(0.25, this.now());
      this.tuningGainNodes.forEach((gainNode, i) => {
        gainNode.connect(this.tuningMasterGainNode!);
        gainNode.gain.setValueAtTime(0, this.now());
        const osc = this.tuningSines[i];
        osc.frequency.setValueAtTime(this.currentFreqs[i], this.now());
        osc.connect(gainNode);
        osc.start();
      });
    },
    
    async parentLoaded() {
      this.gatherInfo();
      const instrumentation = this.piece.instrumentation[0];
      const stringInsts = [
        'Sitar', 
        'Sarod', 
        'Surbahar', 
        'Veena (Saraswati)',
        'Veena (Vichitra)',
        'Veena, Rudra (Bin)',
      ];
      const vocInsts = ['Vocal (M)', 'Vocal (F)'];
      this.vocal = vocInsts.includes(instrumentation);
      this.sarangi = instrumentation === 'Sarangi';
      this.string = stringInsts.includes(instrumentation);

      this.makeTuningSines();
      if (this.piece) {
        if (!this.piece.audioID && !this.piece.audio_DB_ID) {
          this.loading = false;
          this.noAudio = true;
          this.synthGain = 1;
          this.chikariGain = 1;
          this.recGain = 0;
        }
      }
    },

    stretch(tempo = 1.0) {
      if (this.stretchBuf) {
        const left = this.stretchBuf.getChannelData(0);
        const right = this.stretchBuf.numberOfChannels > 1 ?
          this.stretchBuf.getChannelData(1) : left;
        this.stretchWorker!.postMessage({
          name: 'stretch',
          tempo: tempo,
          left: left,
          right: right,
        });
        this.stretchWorker!.onmessage = e => {
          if (e.data.name === 'stretched') {
            this.stretchedBuffer = this.ac!.createBuffer(
              2,
              e.data.left.length,
              this.ac!.sampleRate
            );
            this.stretchedBuffer.copyToChannel(e.data.left, 0);
            this.stretchedBuffer.copyToChannel(e.data.right, 1);
            const initDur = this.regionEndTime! - this.regionStartTime!;
            const factor = initDur / this.stretchedBuffer!.duration;
            this.$emit('update:stretchedFactor', factor)
          }
        }
      }
    },

    initStretchWorker() {
      this.stretchWorker = new Worker(stretcherURL);
    },

    handleRegionSpeedChange() {
      this.stretch(2 ** this.regionSpeed);
    },

    toggleRegionSpeed() {
      console.log('toggling region speed')
      if (this.regionSpeedOn) {
        this.stretch(2 ** this.regionSpeed);
        const time = this.regionStartTime!;
        this.$emit('currentTimeEmit', time)
        if (!this.playing) {
          this.pausedAt = time;
          this.updateProgress();
          this.updateFormattedCurrentTime();
          this.updateFormattedTimeLeft();
        } else {
          console.log('this should not happen')
        }
        this.$emit('movePlayheadsEmit');
        const s = this.$refs.synths as InstanceType<typeof Synths>;
        const mixGainNode = s.mixNode.gain;
        const curGain = mixGainNode.value;
        this.tempMixedGainVal = curGain;
        mixGainNode.setValueAtTime(curGain, this.now());
        mixGainNode.linearRampToValueAtTime(0, this.now() + this.lagTime);
        this.mixedGainVal = 0;
        const sc = this.$refs.synthControls as 
          InstanceType<typeof SynthesisControls>;
        if (this.instTracks.length > 1) {
          sc.mixedGainSliderDisabled = true;
        } else {
          const icArr = sc.instControl as InstanceType<typeof InstrumentControl>[];
          const ic = icArr[0]
          ic.slider0TempVal = Number(ic.slider![0]!.value)
          ic.slider0Disabled = true;
          this.$nextTick(() => {
            ic.slider![0].value = '0';
          })
        }
      } else {
        this.regionSpeed = 0;
        this.$emit('update:stretchedFactor', 1)
        this.stretchedBuffer = undefined;
        const s = this.$refs.synths as InstanceType<typeof Synths>;
        const mixGainNode = s.mixNode.gain;
        mixGainNode.setValueAtTime(0, this.now());
        mixGainNode.linearRampToValueAtTime(this.tempMixedGainVal, this.now() + this.lagTime);
        this.mixedGainVal = this.tempMixedGainVal;
        const sc = this.$refs.synthControls as InstanceType<typeof SynthesisControls>;
        if (this.instTracks.length > 1) {
          sc.mixedGainSliderDisabled = false;
        } else {
          const icArr = sc.instControl as InstanceType<typeof InstrumentControl>[];
          const ic = icArr[0]
          ic.slider0Disabled = false;
          this.$nextTick(() => {
            ic.slider![0].value = String(ic.slider0TempVal);
          })
        }
      }
    },

    updateStretchBuf() {
      const start = this.regionStartTime!;
      const end = this.regionEndTime!;
      const startSample = Math.round(start * this.ac!.sampleRate);
      const endSample = Math.round(end * this.ac!.sampleRate);
      // make new audio buffer
      const sr = this.ac!.sampleRate;
      this.stretchBuf = this.ac!.createBuffer(2, endSample - startSample, sr);
      // copy data over
      const left = this.audioBuffer!
        .getChannelData(0)
        .slice(startSample, endSample+1);
      const right = this.audioBuffer!.numberOfChannels > 1 ?
        this.audioBuffer!.getChannelData(1).slice(startSample, endSample+1) :
        left;
      this.stretchBuf.copyToChannel(left, 0);
      this.stretchBuf.copyToChannel(right, 1);
    },

    initializeStretching() {
      this.initStretchWorker();
    },

    gatherInfo() {
      const obj = this.audioDBDoc;
      if (obj) {
        const keys = Object.keys(obj.musicians).sort((a, b) => {
          return (
            this.getRoleRank(obj.musicians[a]) -
            this.getRoleRank(obj.musicians[b])
          );
        });
        this.performers = keys;
        const raags = Object.keys(obj.raags);
        const pSecs = raags.map((raag) => {
          const pSec = obj.raags[raag]['performance sections']!;
          const localPSecs = Object.keys(pSec);
          return localPSecs.join(', ');
        });
        this.raags = raags.map((raag, i) => {
          return `${raag}: ${pSecs[i]}`;
        });
      }
      this.raga = this.piece.raga;
      this.ruleSet = this.piece.raga.ruleSet;
      this.ETRatios = this.raga.setRatios(this.ruleSet); // equal temperement
      this.initFreqs = this.ETRatios.map(ratio => {
        return this.raga!.fundamental * ratio
      })
      this.currentFreqs = this.raga.ratios.map(ratio => {
        return this.raga!.fundamental * ratio
      })
      this.sargam = this.raga.sargamLetters;
      this.solfege = this.raga.solfegeStrings;
      this.pitchClasses = this.raga.pcStrings;
      this.westernPitches = this.raga.westernPitchStrings;

      this.centDevs = this.currentFreqs.map((cf, i) => {
        return 1200 * Math.log2(cf / this.initFreqs[i]);
      })
      this.tuningGains = [...Array(this.sargam.length)].fill(0);
    },
    getRoleRank(musician: MusicianType) {
      const roles = ['Soloist', 'Percussionist', 'Accompanist', 'Drone'];
      if (musician.role === undefined) return 3;
      return roles.indexOf(musician.role);
    },

    async getAudio(
      filepath: string, 
      verbose: boolean, 
      excerptRange: ExcerptRange | undefined = undefined
    ) {
      try {
        const start = await performance.now();
        const res = await fetch(filepath);
        const fetched = (await performance.now()) - start;
        if (verbose) console.log('fetched: ', fetched / 1000);
        const arrayBuffer = await res.arrayBuffer();
        const midpoint = (await performance.now()) - start;
        if (verbose) console.log('array buffd: ', midpoint / 1000);
        const audioBuffer = await this.ac!.decodeAudioData(arrayBuffer);
        const endpoint = (await performance.now()) - start;
        if (verbose) console.log('done: ', endpoint / 1000);
        if (excerptRange !== undefined) {
          const startSample = Math.round(
            excerptRange.start * this.ac!.sampleRate
          );
          const endSample = Math.round(
            excerptRange.end * this.ac!.sampleRate
          );
          const newAudioBuffer = this.ac!.createBuffer(
            audioBuffer.numberOfChannels,
            endSample - startSample,
            audioBuffer.sampleRate
          );
          for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            newAudioBuffer.copyToChannel(
              audioBuffer.getChannelData(i).slice(startSample, endSample),
              i
            );
          }
          return newAudioBuffer;
        }
        return audioBuffer;
      } catch (err) {
        console.log(err);
      }
    },
    back_15() {
      let newTime = this.getCurTime() - 15;
      if (newTime < 0) newTime = 0;
      if (!this.playing) {
        this.pausedAt = newTime;
        this.$emit('currentTimeEmit', newTime);
        this.$emit('movePlayheadsEmit')
        this.updateProgress();
      } else {
        this.stop();
        this.pausedAt = newTime;
        this.play();
      }
    },
    forward_15() {
      let newTime = this.getCurTime() + 15;
      if (newTime > this.audioBuffer!.duration) {
        newTime = this.audioBuffer!.duration;
      }
      if (!this.playing) {
        this.pausedAt = newTime;
        this.$emit('currentTimeEmit', newTime);
        this.$emit('movePlayheadsEmit')
        this.updateProgress();
      } else {
        this.stop();
        this.pausedAt = newTime;
        this.play();
      }
    },

    trackEnd() {
      let newTime = this.durTot;
      if (!this.playing) {
        this.$emit('currentTimeEmit', newTime);
        this.$emit('movePlayheadsEmit')
        this.updateProgress();
      } else {
        this.stop();
        this.pausedAt = newTime;
        this.play();
      }
      
    },
    
    now() {
      return this.ac!.currentTime;
    },

    playStretched() {
      this.playing = true;
      this.$emit('startPlayingTransition')
      const offset = (this.parentCurrentTime - this.regionStartTime!);
      console.log('playing stretched, offset: ', offset)
      const scaledOffset = offset / (2 ** this.regionSpeed);
      this.sourceNode = this.ac!.createBufferSource();
      this.sourceNode.connect(this.gainNode!);
      this.sourceNode.buffer = this.stretchedBuffer!;
      this.sourceNode.loop = this.loop;
      this.sourceNode.start(this.now(), scaledOffset);
      this.sourceNode.addEventListener('ended', () => {
        console.log('stretched ended')
        this.pauseStretched(this.playing); // this is a fancy way of saying that 
        // if the sourceNode has ended naturally (without the user pausing it),
        // then it should return to the beginning, otehrwise, stay where it is.
        // this.$emit('stopStretchedAnimationEmit')
        if (this.loop) {
          this.$emit('currentTimeEmit', this.regionStartTime);
        } else {
          this.$emit('currentTimeEmit', this.getStretchedCurTime());
        }
      })
      this.pausedAt = 0;
      this.startedAt = this.now() - scaledOffset;
    },

    pauseStretched(returnToStart=false) {
      console.log('pausing stretched')
      if (this.regionEndTime === undefined) {
        throw new Error('regionEndTime is undefined')
      }
      if (this.regionStartTime === undefined) {
        throw new Error('regionStartTime is undefined')
      }
      const elapsed = this.now() - this.startedAt;
      let scaledElapsed = (2 ** this.regionSpeed) * elapsed;
      if (this.loop) {
        const tot = this.regionEndTime - this.regionStartTime;
        scaledElapsed = scaledElapsed % tot;
      }
      this.stopStretched();
      this.pausedAt = returnToStart ? 
        this.regionStartTime : 
        scaledElapsed + this.regionStartTime;
      this.$emit('movePlayheadsEmit', 'justShadowPlayhead')
    },

    stopStretched() {
      this.playing = false;
      this.$emit('stopPlayingTransition')
      if (this.sourceNode) {
        this.sourceNode.stop(this.now());
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
    },

    play() {
      this.playing = true;
      
      const offset = this.pausedAt;
      this.startingDelta = this.pausedAt;
      this.$emit('startPlayingTransition')
      this.sourceNode = this.ac!.createBufferSource();
      this.sourceNode.connect(this.gainNode!);
      this.sourceNode.buffer = this.audioBuffer!;
      this.sourceNode.start(this.now(), offset);
      const allLoops = this.loop && this.loopStart && this.loopEnd;
      if (allLoops && this.pausedAt < this.loopEnd!) {
        this.sourceNode.loop = this.loop;
        this.sourceNode.loopStart = this.loopStart!;
        this.sourceNode.loopEnd = this.loopEnd!;
        if (this.pausedAt > this.loopStart!) {
          this.pausedAt = this.loopStart!;
        }         
        const startRecTime = this.now() + this.loopStart! - this.pausedAt;
        const duration = this.loopEnd! - this.loopStart!;
        const endRecTime = startRecTime + duration;
        const s = this.$refs.synths as InstanceType<typeof Synths>;
        s.recordAllSynths(startRecTime, endRecTime);
      }
      this.startedAt = this.now() - offset;
      this.pausedAt = 0;
      
    },

    stop() {
      this.playing = false;
      this.$emit('stopPlayingTransition')
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode.stop(this.now());
        this.sourceNode = null;
      }
      if (this.loop) {
        const s = this.$refs.synths as InstanceType<typeof Synths>;
        s.stopRecordingSynths();
      }
      this.pausedAt = 0;
      this.startedAt = 0;
      
    },

    pause() {
      const elapsed = this.now() - this.startedAt;
      this.stop();
      if (this.playheadReturn) {
        if (this.startingDelta === undefined) {
          throw new Error('startingDelta is undefined')
        }
        this.pausedAt = this.startingDelta;
        this.$emit('currentTimeEmit', this.startingDelta);
        this.$emit('movePlayheadsEmit', 'justPlayhead')
        this.$emit('scrollBackForPlayheadReturn')
      } else {
        this.pausedAt = this.loop ? this.loopTime! : elapsed;
        this.$emit('movePlayheadsEmit', 'justShadowPlayhead')
      } 
    },

    getCurTime() {
      if (this.pausedAt) {
        return this.pausedAt;
      } else if (this.playing) {
        if (this.startingDelta === undefined) {
          throw new Error('startingDelta is undefined')
        }
        if (this.loop && this.startingDelta < this.loopEnd!) {
          const dur = this.loopEnd! - this.loopStart!;
          const realTime = this.now() - this.startedAt;
          this.loopTime = realTime;
          if (realTime > this.loopEnd!) {
            this.loopTime =
              this.loopStart! + ((realTime - this.loopStart!) % dur);
          }
          return this.loopTime;
        } else {
          return this.now() - this.startedAt;
        }
      } else {
        return 0;
      }
    },

    getStretchedCurTime() {
      let out;
      if (this.pausedAt) {
        out = this.pausedAt;
      } else if (this.playing) {
        if (this.regionStartTime === undefined) {
          throw new Error('regionStartTime is undefined')
        }
        if (this.regionEndTime === undefined) {
          throw new Error('regionEndTime is undefined')
        }
        if (this.stretchedBuffer === undefined) {
          throw new Error('stretchedBuffer is undefined')
        }
        // const ed = this.$parent;
        const realDur = this.regionEndTime - this.regionStartTime;
        const bufDur = this.stretchedBuffer.duration;
        const realStretchedSpeed = Math.log2(realDur / bufDur)
        const elapsed = this.now() - this.startedAt;
        let scaledElapsed = (2 ** realStretchedSpeed) * elapsed;
        if (this.loop) {
          const tot = this.regionEndTime - this.regionStartTime;
          scaledElapsed = scaledElapsed % tot;
        }
        out = scaledElapsed + this.regionStartTime;
      } else {
        out = 0;
      }
      return out
    },

    getShadowTime() {
      if (this.pausedAt) {
        return this.pausedAt
      } else if (this.playing) {
        return this.startingDelta
      } else {
        return 0
      }
    },
    startPlayCursorAnimation() {
      if (!this.requestId) {
        this.requestId = window.requestAnimationFrame(this.loopPlayAnimation);
      }
    },
    updateProgress() {
      if (this.noAudio) {
        this.progress = this.getCurTime() / this.piece.durTot!;
      } else {
        const curTime = this.regionSpeedOn ? this.getStretchedCurTime() : this.getCurTime();
        this.progress = curTime / this.audioBuffer!.duration;
      }
      const pbi = document.querySelector('.progBarInner') as HTMLDivElement;
      const pbo = document.querySelector('.progBarOuter') as HTMLDivElement;
      const totWidth = pbo.getBoundingClientRect().width;
      pbi.style.width = this.progress * totWidth + 'px';
    },
    loopPlayAnimation(timestamp: number) {
        this.updateProgress();
        this.updateFormattedCurrentTime();
        this.updateFormattedTimeLeft();
        const curTime = this.regionSpeedOn ? this.getStretchedCurTime() : this.getCurTime();
        this.$emit('currentTimeEmit', curTime);
      this.requestId = undefined;
      this.startPlayCursorAnimation();
    },
    stopPlayCursorAnimation() {
      if (this.requestId) {
        window.cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
      }
    },
    togglePlay() {
      if (this.regionSpeedOn && this.stretchedBuffer) {
        if (!this.playing) {
          this.playStretched();
          const playImg = this.$refs.playImg as HTMLImageElement;
          playImg.classList.add('playing');
        } else {
          this.pauseStretched();
          const playImg = this.$refs.playImg as HTMLImageElement;
          playImg.classList.remove('playing');
        }
      } else {
        if (!this.playing) {
          this.play();
          const playImg = this.$refs.playImg as HTMLImageElement;
          playImg.classList.add('playing');
          this.startPlayCursorAnimation();
          const s = this.$refs.synths as InstanceType<typeof Synths>;
          s.playAllTrajs();
        } else {
          this.pause();
          const playImg = this.$refs.playImg as HTMLImageElement;
          playImg.classList.remove('playing');
          this.stopPlayCursorAnimation();
          const s = this.$refs.synths as InstanceType<typeof Synths>;
          s.cancelAllTrajs();
          this.bufferSourceNodes = [];
        }
      }
    },
    toggleControls(e: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Synthesis) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Synthesis;
        }
      }
    },
    toggleTuning(e: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Tuning) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Tuning;
        }
      }
      
    },
    toggleDownloads(e: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Download) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Download;
        }
      }
    },
    toggleShare(e: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Share) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Share;
        }
      }
    },

    toggleMeterControls(e?: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Meter) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Meter;
        }
      }
    },

    toggleLabelControls(e?: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Tag) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Tag;
        }
      }
    },

    toggleSpecControls(e?: MouseEvent) {
      if (!this.loading) {
        if (this.selectedControlsMode === ControlsMode.Display) {
          this.selectedControlsMode = ControlsMode.None;
        } else {
          this.selectedControlsMode = ControlsMode.Display;
        }
      }
    },

    goToBeginning() {
      if (!this.playing) {
        this.pausedAt = 0;
        this.updateProgress();
      } else {
        this.stop();
        this.pausedAt = 0;
        this.play();
        this.updateProgress();
      }
      this.$emit('currentTimeEmit', 0)
    },

    handleProgressClick(e: MouseEvent) {
      const pbOuter = this.$refs.pbOuter as HTMLDivElement;
      const bb = pbOuter.getBoundingClientRect();
      if (!this.playing) {
        this.pausedAt = (this.audioBuffer!.duration * e.clientX) / bb.width;
        this.$emit('currentTimeEmit', this.pausedAt)
        this.updateProgress();
      } else {
        this.stop();
        this.pausedAt = (this.audioBuffer!.duration * e.clientX) / bb.width;
        this.play();
      }
    },

    tooLeftLimit() {
      if (this.$refs.pbOuter && this.progress) {
        const pbOuter = this.$refs.pbOuter as HTMLDivElement;
        const bb = pbOuter.getBoundingClientRect();
        return this.progress < 35 / bb.width;
      } else {
        return true;
      }
    },

    tooRightLimit() {
      if (this.$refs.pbOuter && this.progress) {
        const pbOuter = this.$refs.pbOuter as HTMLDivElement;
        const bb = pbOuter.getBoundingClientRect();
        return this.progress >= 1 - 90 / bb.width;
      } else {
        return false;
      }
    },
    updateFormattedCurrentTime(ct?: number) {
      const curTime = this.regionSpeedOn ? this.getStretchedCurTime() : this.getCurTime();
      const st = structuredTime(ct ? ct : curTime);
      const ms = st.minutes + ':' + st.seconds;
      this.formattedCurrentTime = st.hours !== '0' ? ms : st.hours + ':' + ms;
    },
    updateFormattedTimeLeft(ct?: number) {
      const curTime = this.regionSpeedOn ? this.getStretchedCurTime() : this.getCurTime();
      if (this.audioBuffer && isNaN(this.audioBuffer.duration)) {
        return '00:00';
      } else {
        let ut;
        if (!this.noAudio) {
          const buf = this.audioBuffer!;
          ut = Number(buf.duration) - Number(ct ? ct : curTime);
        } else {
          const dt = Number(this.piece.durTot);
          ut = dt - Number(ct ? ct : curTime);
        }
        
        const st = structuredTime(ut);
        const ms = st.minutes + ':' + st.seconds;
        this.formattedTimeLeft = st.hours !== '0' ? ms : st.hours + ':' + ms;
      }
    },
    hoverTrigger(bool: boolean) {
      const classes_ = [
        '.currentTime',
        '.progressCircle',
        '.timeLeft',
      ];
      const cls = classes_.map((cl) => document.querySelector(cl)!.classList);
      if (bool) {
        cls.forEach((cl) => {
          if (!cl.contains('hovering')) cl.add('hovering');
        });
      } else {
        cls.forEach((cl) => {
          if (cl.contains('hovering')) cl.remove('hovering');
        });
      }
    },
    handleCircleMouseDown(e: MouseEvent) {
      this.circleDragging = true;
      this.dragStartX = e.clientX;
      const main = this.$refs.main as HTMLDivElement;
      main.classList.toggle('hovering');
    },
    handleCircleMouseUp(e: MouseEvent) {
      if (this.circleDragging) {
        const pbOuter = this.$refs.pbOuter as HTMLDivElement;
        const bb = pbOuter.getBoundingClientRect();
        const ct = this.getCurTime();
        const dur = this.audioBuffer!.duration;
        const newTime = ct + (dur * (e.clientX - this.dragStartX!)) / bb.width;
        if (!this.playing) {
          this.pausedAt = newTime;
          this.$emit('currentTimeEmit', this.pausedAt)
          this.$emit('movePlayheadsEmit')
          this.updateProgress();
        } else {
          this.stop();
          this.pausedAt = newTime;
          this.play();
        }
        const pc = document.querySelector('.progressCircle') as HTMLDivElement;
        pc.style.right = '-7px';
        this.circleDragging = false;
        const main = this.$refs.main as HTMLDivElement;
        main.classList.toggle('hovering');
      }
    },
    handleCircleMouseMove(e: MouseEvent) {
      if (this.circleDragging) {
        const diff = this.dragStartX! - e.clientX;
        const pbi = document.querySelector('.progBarInner') as HTMLDivElement;
        const pbo = document.querySelector('.progBarOuter') as HTMLDivElement;
        const pboBox = pbo.getBoundingClientRect();
        pbi.style.width = pboBox.width * this.progress - diff + 'px';
      }
    },
    handleDownload() {
      if (this.dataChoice === 'xlsx') {
        excelData(this.piece._id!)
      } else if (this.dataChoice === 'json') {
        jsonData(this.piece._id!)
      } else if (this.dataChoice === 'tuning') {
        tuningData(this.piece.raga!)
      }
    },
    preventSpace(e: MouseEvent) {
      // prevents spacebar from changing checkbox
      if (e && e.clientX === 0) e.preventDefault();
    },
    async toggleShift() {
      if (this.ac === undefined) {
        throw new Error('ac is undefined')
      }
      if (this.shiftOn) {
        this.rubberBandNode = await createRBNode(this.ac, rubberBandUrl);
        this.rubberBandNode.setHighQuality(true);
        this.gainNode!.disconnect(this.ac.destination);
        this.gainNode!.connect(this.rubberBandNode);
        this.rubberBandNode.connect(this.ac.destination);
        this.readyToShift = true;
      } else {
        this.rubberBandNode!.disconnect(this.ac.destination);
        this.gainNode!.disconnect(this.rubberBandNode!);
        this.gainNode!.connect(this.ac.destination);
        this.readyToShift = false;
        this.transposition = 0;
      }
    }
  },
});
</script>

<style scoped>
.player {
  position: absolute;
  width: 100%;
  height: v-bind(playerHeight + 'px');
  left: 0px;
  bottom: 0px;
  background-color: black;
  display: flex;
  flex-direction: column;
  border-top: 1px solid black;
  /* pointer-events: auto; */
}
.progBarOuter {
  width: 100%;
  height: 8px;
  background-color: #242424;
  overflow-x: hidden;
}
.progBarOuter:hover {
  cursor: pointer;
}
.progBarInner {
  width: 0px;
  background-color: lightgrey;
  height: 6px;
  position: absolute;
}
.progBarInner:hover {
  cursor: pointer;
}
.progressCircle {
  background-color: lightgrey;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  position: absolute;
  right: -7px;
  top: -4px;
  opacity: 0;
  transition: opacity 0.25s;
}
.progressCircle:hover {
  cursor: pointer;
}
.controlsContainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: bottom;
}
.recInfo {
  max-width: 300px;
  min-width: 250px;
  height: 100%;
  background-color: black;
}
.recInfo.left {
  height: calc(100% - 20px);
  min-width: 150px;
  color: white;
  /* border: 1px solid grey; */
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
  overflow: hidden;
  padding-left: 20px;
  padding-right: 20px;
}
.span {
  white-space: nowrap;
  display: inline;
  /* flex-direction: row; */
  /* padding-left: 20px; */
  /* padding-right: 20px; */
  /* justify-content: left; */
  /* align-items: left; */
  width: calc(100% - 40px);
  text-align: left;
  overflow-x: scroll;
  height: 40px;
  scrollbar-width: none;
}
.span::-webkit-scrollbar {
  display: none;
}
.right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: right;
}
.rulerBox {
  width: 100px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.rulerBox > img {
  height: 40px;
  filter: brightness(400%);
  cursor: pointer;
}
.rulerBox > img:hover {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}
.rulerBox > .showWaveform {
  filter: invert(46%) sepia(75%) saturate(292%) hue-rotate(85deg)
    brightness(97%) contrast(97%);
}
.rulerBox > .showControls {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}
.controlFlexer {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.controlBox {
  max-width: 400px;
  min-width: 250px;
  height: 70px;
  background-color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}
.loadingSymbol {
  max-width: 400px;
  min-width: 250px;
  height: 70px;
  background-color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.controlBox > img {
  height: 30px;
  width: 30px;
  cursor: pointer;
  filter: brightness(400%);
}
.controlBox > img:hover {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}
.controlBox > .looping {
  filter: invert(46%) sepia(75%) saturate(292%) hue-rotate(85deg)
    brightness(97%) contrast(97%);
}
.controlBox > .shuffling {
  filter: invert(46%) sepia(75%) saturate(292%) hue-rotate(85deg)
    brightness(97%) contrast(97%);
}
.playCircle > img {
  object-position: 3px;
}
.playCircle > img.playing {
  object-position: 0px;
}
.playCircle {
  background-color: #242424;
  border-radius: 30px;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.playCircle:hover {
  background-color: #4f4f4f;
}
.playCircle > img {
  filter: brightness(400%);
}
.currentTime {
  color: white;
  position: absolute;
  top: 12px;
  right: -10px;
  width: 30px;
  height: 20px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.25s;
}
.timeLeft {
  color: white;
  position: absolute;
  top: 12px;
  right: 25px;
  width: 30px;
  height: 20px;
  transition: opacity 0.25s;
  opacity: 0;
}
.hovering {
  opacity: 1;
}
.tooLeft {
  left: 10px;
}
.tooRight {
  left: calc(100vw - 120px);
}
.mainq {
  user-select: none;
  width: 100vw;
  height: 100px;
  position: absolute;
  left: 0;
  bottom: 0;
  /* pointer-events: none; */
  z-index: 1;
}
.main.hovering {
  cursor: pointer;
}
.invisibleProgressCircle {
  width: 500px;
  height: 100px;
  position: absolute;
  bottom: 0px;
  right: -25px;
  /* pointer-events: none; */
  overflow: hidden;
}
.invisibleProgressCircle.hovering {
  pointer-events: auto;
}
.icon {
  fill: white;
  stroke: white;
}
.loader {
  border: 8px solid grey;
  border-top: 8px solid green;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.synthControls {
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  background-color: #202621;
  /* width: 540px; */
  width: 100%;
  height: v-bind(controlsHeight + 'px');
  border-bottom: 1px solid black;
  color: white;
  display: flex;
  flex-direction: row;
  pointer-events: auto;
  justify-content: space-evenly;
  align-items: center;
}
.tuningControls {
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  background-color: #202621;
  width: v-bind(windowWidth+'px');
  height: v-bind(controlsHeight+'px');
  border-bottom: 1px solid black;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}
.downloads {
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  background-color: #202621;
  width: 250px;
  height: v-bind(controlsHeight + 'px');;
  border-bottom: 1px solid black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.share {
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  background-color: #202621;
  width: 300px;
  height: v-bind(controlsHeight + 'px');;
  border-bottom: 1px solid black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.shareRow > input {
  min-width: 200px;
}

.shareRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
}
.spacer {
  display: flex;
  flex-direction: column;
  align-items: bottom;
  justify-content: bottom;
  height: 100%;
  max-width: 300px;
  min-width: 150px;
  flex-shrink: 2
}
.innerSpacer {
  height: 100%;
  max-width: 300px;
  min-width: 150px;
}
.rulerBox > .tuningFork {
  filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg)
    brightness(102%) contrast(102%);
}
.rulerBox > .showTuning {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}
.rulerBox > .showDownloads {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}

.rulerBox > .showMeterControls {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}

.rulerBox > .showLabelControls {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}

.rulerBox > .showSpecControls {
  filter: invert(46%) sepia(42%) saturate(292%) hue-rotate(78deg)
    brightness(94%) contrast(97%);
}
.tuningBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.tuningBox.last {
  margin-right: 10px;
}
.tuningBox.first {
  min-width: 45px;
  width: 45px;
}
.sliders {
  height: v-bind(controlsHeight - srgmLtrHeight + 'px');
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}
.sargamLetter {
  height: v-bind(srgmLtrHeight + 'px');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.label {
  height: v-bind(tuningLblHeight + 'px');
  font-size: 13px;
}
.sliderCol > input {
  width: 12px;
  height: v-bind(controlsHeight - srgmLtrHeight - tuningLblHeight - 10 + 'px');
  writing-mode: vertical-lr;
  direction: rtl;
  margin-top: 5px;
  margin-bottom: 5px;
}
.leftSliderCol {
  width: 35px;
}
.sliderCol {
  min-width: 30px;
}
.centsTickLabels {
  display: flex;
  flex-direction: column;
  align-items: right;
  justify-content: space-between;
  height: v-bind(controlsHeight - srgmLtrHeight - tuningLblHeight - 10 + 'px');
  margin-top: 5px;
  margin-bottom: 5px;
}
.paddingCol {
  min-width: 10px;
  max-width: 10px;
  width: 10px;
}
.centsLabel {
  text-align: right;
  font-size: 12px;
}
.buttons {
  width: 80px;
  min-width: 80px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
button {
  cursor: pointer
}
.dataChoice {
  display: flex;
  flex-direction: column;
  width: 80px;
  height: 100%;
}
.dataRadioButtons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  padding: 0px;
  border: 0px;
  margin: 0px;
}
.cbBoxSmall {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  /* width */
}
.cbBoxSmall > input {
  width: 30px;
  height: 150px;
  writing-mode: vertical-lr;
  direction: rtl;

}

.cbBoxSmall > input[type=checkbox] {
  height: 20px;
  width: 20px;
}
.cbBoxSmall > label {
  padding-top: 5px;
  height: 50px;
  width: 83px;
  font-size: 13px;
}

.meterImg {
  width: 40px;
}

.tagsImg {
  width: 40px;
}

.specImg {
  width: 40px;
}
</style>
