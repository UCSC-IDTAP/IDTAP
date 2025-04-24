<template>
<div class='mainzz'>
  <div class='upperRow'>
    <Renderer
      v-if='transcriptionWidth > 0 && transcriptionHeight > 0'
      id='renderer'
      ref='renderer'
      :yAxWidth='yAxWidth'
      :xAxHeight='xAxHeight'
      :scaledWidth='transcriptionWidth'
      :scaledHeight='transcriptionHeight'
      :piece='piece'
      :lowOctOffset='lowOctOffset'
      :highOctOffset='highOctOffset'
      :showSpectrogram='showSpectrogram'
      :showMelograph='melographVisible'
      :backgroundColor='backColor'
      :axisColor='axisColor'
      :melographColor='melographColor'
      :showTranscription='showMelody'
      :sargamLineColor='sargamLineColor'
      :showSargam='showSargam'
      :showSargamLines='showSargamLines'
      :showPhonemes='showPhonemes'
      :phonemeRepresentation='phonemeRepresentation'
      :sargamRepresentation='sargamRepresentation'
      :instTracks='instTracks'
      :selectedMode='selectedMode'
      :showPhraseDivs='viewPhrases'
      :editable='editable'
      :sargamMagnetMode='sargamMagnetMode'
      :initViewDur='initViewDur'
      :meterMagnetMode='meterMagnetMode'
      :editingInstIdx='editingInstIdx'
      :currentTime='currentTime'
      :browser='browser'
      :playing='playing'
      :maxMetricLayer='maxMetricLayer'
      :showMeter='showMeter'
      :meterColor='meterColor'
      :selectedMeterColor='selMeterColor'
      :playheadColor='playheadColor'
      :showBols='showBols'
      :navHeight='navHeight'
      :unsavedChanges='unsavedChanges'
      :loop='loop'
      :stretchedFactor='stretchedFactor'
      :hasRecording='hasRecording'
      :highlightTrajs='highlightTrajs'
      :playheadAnimation='playheadAnimation'
      :queryTime='queryTime'
      :editableCols='editableCols'
      :scaleSystem='scaleSystem'
      :audioPlayerRef='$refs.audioPlayer as APType'
      :showPhrases='showPhrases'
      @zoomInY='zoomInY'
      @zoomOutY='zoomOutY'
      @zoomInX='zoomInX'
      @zoomOutX='zoomOutX'
      @update:selectedMode='updateSelectedMode'
      @unsavedChanges='unsavedChanges = $event'
      @update:TrajSelStatus='trajSelStatus = $event'
      @update:selPhraseDivUid='updateSelPhraseDivUid($event)'
      @update:trajTimePts='updateTrajTimePts'
      @update:editingInstIdx='editingInstIdx = $event'
      @update:currentTime='updateCurrentTime'
      @update:recomputeTrigger='recomputeTrigger += 1'
      @update:prevMeter='updatePrevMeter'
      @update:insertPulses='insertPulses = $event'
      @open:labelEditor='engageLabelEditor'
      @showTooltip='showTooltip'
      @hideTooltip='hideTooltip'
      @update:apStretchable='updateApStretchable'
      @update:region='regionIdx += 1'
      @cancelRegionSpeed='cancelRegionSpeed'
      @update:togglePluck='togglePluck'
      @update:toggleDampen='toggleDampen'
      @savePiece='savePiece'
      @update:selectedMeter='selectMeter($event)'
      @deleteMeter='removeMeter($event)'
      @toggle:sargamMagnet='sargamMagnetMode = !sargamMagnetMode'
      @clearTSP='clearTSP'
      @open:addToCollection='showAddToCollection = true'
      @open:removeFromCollection='showRemoveFromCollection = true'
      />
    <div class='controlBox'>
      <div class='scrollingControlBox'>
        <div class='cbRow'>
          <label for='loop'>Loop</label>
          <input id='loop' type='checkbox' v-model='loop' @click='updateLoop'>
        </div>
        <div class='cbRow'>
          <label for='playheadReturn'>Playhead Return</label>
          <input 
            id='playheadReturn'
            type='checkbox' 
            v-model='playheadReturn' 
            @click='preventSpaceToggle'>
        </div>
        <div class='cbRow'>
          <label for='meterMagnet'>Meter Magnet</label>
          <input
            id='meterMagnet'
            type='checkbox'
            v-model='meterMagnetMode'
            @click='preventSpaceToggle'>
        </div>
        <div class='cbRow'>
          <label for='sargamMagnet'>Sargam Magnet</label>
          <input
            id='sargamMagnet'
            type='checkbox'
            v-model='sargamMagnetMode'
            @click='preventSpaceToggle'>
        </div>
        <div class='cbRow' v-if='vocal'>
          <label for='uniformVowel'>Uniform Vowel</label>
          <input
            id='uniformVowel'
            type='checkbox'
            v-model='uniformVowel'
            @click='preventSpaceToggle'>
        </div>
        <div class='cbRow'>
          <button @click='resetAudio'>Reset Audio</button>
          <button @click='savePiece'>Save</button>
        </div>
        <div class='cbRow'>
          <span class='savedDate'>
            {{`Saved: ${dateModified ? 
              dateModified.toLocaleString([], { 
                hour: '2-digit', minute: '2-digit'
              }) : ''}`}}
          </span>
        </div>
        <div class='cbRow' v-if='vocal'>
          <label>Phoneme Script</label>
          <select 
            v-model='phonemeRepresentation'
            >
            <option value='Devanagari'>Devanagari</option>
            <option value='IPA'>IPA</option>
            <option value='English'>Latin</option>
          </select>
        </div>
        <div class='instructionsIcon' @click='toggleInstructions'>?</div>
      </div>
      <TrajSelectPanel 
        ref='trajSelectPanel' 
        :editable='editable' 
        :ctrlBoxWidth='controlBoxWidth'
        :selectedPhraseDivUid='selectedPhraseDivUid'
        :piece='piece'
        :freqMax='freqMax'
        :freqMin='freqMin'
        :setNewTraj='setNewTraj'
        :trajTimePts='trajTimePts'
        :groupable='groupable'
        :trajSelStatus='trajSelStatus'
        :instrument='piece.instrumentation[editingInstIdx]'
        :selectedMode='selectedMode'
        :editingInstIdx='editingInstIdx'
        @mutateTraj='mutateTrajEmit'
        @pluckBool='pluckBoolEmit'
        @newTraj='newTrajEmit'
        @vibObj='alterVibObj'
        @dampen='dampenEmit'
        @vowel='vowelEmit'
        @startConsonant='startConsonantEmit'
        @endConsonant='endConsonantEmit'
        @shiftOct='shiftTrajByOctave'
        @alterSlope='throttledAlterSlope'
        @update:phraseDivRendering='updatePhraseDivRendering'
        @unsavedChanges='updateUnsavedChanges'
        @groupSelectedTrajs='groupSelectedTrajs'
        @ungroupSelectedTrajs='ungroupSelectedTrajs'
        @showTooltip='showTooltip'
        @hideTooltip='hideTooltip'
        />
    </div>
  </div>
</div>
<EditorAudioPlayer 
  class='audioPlayer'
  ref='audioPlayer' 
  :audioSource='audioSource' 
  :recGain='recGain'
  :synthGain='synthGain'
  :synthDamping='synthDamping'
  :playerHeight='playerHeight'
  :controlsHeight='controlsHeight'
  :editable='editable'
  :windowWidth='fullWidth'
  :piece='piece'
  :regionStartTime='regionStartTime'
  :audioDBDoc='audioDBDoc'
  :regionEndTime='regionEndTime'
  :playheadReturn='playheadReturn'
  :parentCurrentTime='currentTime'
  :durTot='durTot'
  :uniformVowel='uniformVowel'
  :insertPulses='insertPulses'
  :transcriptionWidth='transcriptionWidth'
  :transcriptionHeight='transcriptionHeight'
  :saEstimate='audioDBDoc?.saEstimate'
  :id='audioDBDoc?._id'
  :lowOctOffset='lowOctOffset'
  :highOctOffset='highOctOffset'
  :backgroundColor='backColor'
  :axisColor='axisColor'
  :melographColor='melographColor'
  :maxPitch='maxPitch'
  :minPitch='minPitch'
  :sargamLineColor='sargamLineColor'
  :instTracks='instTracks'
  :editingInstIdx='editingInstIdx'
  :meterColor='meterColor'
  :selectedMeterColor='selMeterColor'
  :editorMode='selectedMode'
  :playheadColor='playheadColor'
  :hasRecording='hasRecording'
  :playheadAnimation='playheadAnimation'
  :highlightTrajs='highlightTrajs'
  :selectedMeter='selMeter'
  :zoomXFactor='zoomXFactor'
  :zoomYFactor='zoomYFactor'
  :scaleSystem='scaleSystem'
  :hasSitar='hasSitar'
  :hasVocal='vocal'
  :showSpectrogram='showSpectrogram'
  :showMelograph='melographVisible'
  :showSargam='showSargam'
  :showSargamLines='showSargamLines'
  :showBols='showBols'
  :showTranscription='showMelody'
  :showMeter='showMeter'
  :showPhonemes='showPhonemes'
  :showPhraseDivs='viewPhrases'
  :excerptRange='excerptRange'
  :showPhraseLabels='showPhrases'
  @resizeHeightEmit='resizeHeight'
  @currentTimeEmit='setCurrentTime'
  @updateSargamLinesEmit='updateSargamLines'
  @selectMeterEmit='selectMeter($event)'
  @addMeterEmit='addMeter'
  @removeMeterEmit='removeMeter'
  @unsavedChangesEmit='updateUnsavedChanges'
  @assignPrevMeterEmit='assignPrevMeter'
  @goToPhraseEmit='moveToPhrase'
  @goToSectionEmit='moveToSection'
  @maxLayerEmit='updateMaxMetricLayer'
  @update:backgroundColor='backColor = $event'
  @update:axisColor='axisColor = $event'
  @update:melographColor='melographColor = $event'
  @update:saFreq='updateSaFreq'
  @update:minPitch='updateMinPitch'
  @update:maxPitch='updateMaxPitch'
  @update:sargamLineColor='sargamLineColor = $event'
  @update:instTracks='updateInstTracks'
  @update:meterColor='meterColor = $event'
  @update:selectedMeterColor='selMeterColor = $event'
  @renderMeter='renderMeter'
  @showTooltip='showTooltip'
  @hideTooltip='hideTooltip'
  @update:playheadColor='playheadColor = $event'
  @update:stretchedFactor='stretchedFactor = $event'
  @update:playheadAnimation='playheadAnimation = $event'
  @update:highlightTrajs='highlightTrajs = $event'
  @rerenderMeter='rerenderMeter'
  @update:sonify='handleUpdateSonify'
  @scrollBackForPlayheadReturn='scrollBackForPlayhead'
  @update:zoomFactors='updateZoomFactors'
  @update:scaleSystem='scaleSystem = $event'
  @update:showSpectrogram='showSpectrogram = $event'
  @update:showMelograph='melographVisible = $event'
  @update:showSargam='showSargam = $event'
  @update:showSargamLines='showSargamLines = $event'
  @update:showBols='showBols = $event'
  @update:showTranscription='showMelody = $event'
  @update:showMeter='showMeter = $event'
  @update:showPhonemes='showPhonemes = $event'
  @update:showPhraseDivs='viewPhrases = $event'
  @startPlayingTransition='handleStartPlayingTransition'
  @stopPlayingTransition='handleStopPlayingTransition'
  @update:showPhraseLabels='showPhrases = $event'
  />
  <ContextMenu 
    :x='contextMenuX'
    :y='contextMenuY'
    :closed='contextMenuClosed'
    :choices='contextMenuChoices'
  />
  <Tooltip
    :x='tooltipX'
    :y='tooltipY'
    :open='tooltipOpen'
    :text='tooltipText'
  />
  <AddToCollection
    v-if='showAddToCollection'
    :possibleCollections='editableCols'
    :navHeight='navHeight'
    :tID='piece._id'
    @close='closeAddToCollection'
    addType='transcription'
  />
  <RemoveFromCollection
    v-if='showRemoveFromCollection'
    :possibleCollections='removableCols'
    :navHeight='navHeight'
    :tID='piece._id'
    @close='closeRemoveFromCollection'
    removeType='transcription'
  />
</template>
<script lang='ts'>
const getClosest = (counts: number[], goal: number) => {
  return counts.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  })
};
const structuredTime = (dur: number) => {
  const hours = String(Math.floor(dur / 3600));
  const minutes = leadingZeros(Math.floor((dur % 3600) / 60));
  const seconds = leadingZeros(dur % 60);
  if (Number(hours) > 0) {
    return `${hours}:${minutes}:${seconds}`
  } else {
    return `${minutes}:${seconds}`
  }
};
const cumsum = (sum: number = 0) => (sum = 0, (n: number) => sum += n);

const leadingZeros = (int: number) => {
  if (int < 10) {
    return '0' + int
  } else {
    return String(int)
  }
}
import {
  Piece,
  Phrase,
  Trajectory,
  Pitch,
  Articulation,
  Raga,
  Chikari,
  Group,
  linSpace,
  VibObjType
} from '@/js/classes.ts';

import {
  getPiece,
  getRaagRule,
  getAudioRecording,
  getNumberOfSpectrograms,
  savePiece,
  makeSpectrograms,
  pieceExists,
  getMelographJSON,
  getEditableCollections,
  updateTranscriptionViewed
} from '@/js/serverCalls.ts';
import { Meter, Pulse } from '@/js/meter.ts';
import EditorAudioPlayer from '@/comps/editor/audioPlayer/EditorAudioPlayer.vue';
import TrajSelectPanel from '@/comps/editor/TrajSelectPanel.vue';
import ContextMenu from'@/comps/ContextMenu.vue';
import instructionsText from '@/assets/texts/editor_instructions.html?raw';
import Renderer from '@/comps/editor/Renderer.vue';
import Tooltip from '@/comps/Tooltip.vue';
import Synths from '@/comps/editor/audioPlayer/Synths.vue';
import AddToCollection from '@/comps/AddToCollection.vue';
import RemoveFromCollection from '@/comps/RemoveFromCollection.vue';
import { detect, BrowserInfo } from 'detect-browser';
import { throttle } from 'lodash';
import { defineComponent } from 'vue';

import { 
  ContextMenuOptionType, 
  RecType, 
  TFuncType,
  DrawDataType,
  StrokeNicknameType,
  InstrumentTrackType,
  TrajSelectionStatus,
  PhraseDivDisplayType,
  TrajRenderObj,
  TrajTimePoint,
  LabelEditorOptions,
  TooltipData,
  CollectionType,
  TSPType,
  RendererType,
  APType,
  TLayerType,
  SLayerType,
  YAxisType,
  LabelEditorType,
  MeterControlsType,
  ExcerptRange,
} from '@/ts/types';
import { 
  EditorMode, 
  Instrument, 
  ControlsMode, 
  PlayheadAnimations,
  ScaleSystem,
  SargamRepresentation,
  PhonemeRepresentation
} from '@/ts/enums';
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const getStarts = (durArray: number[]) => {
  const cumsum = (sum => (value: number) => sum += value)(0);
  return [0].concat(durArray.slice(0, durArray.length - 1)).map(cumsum)
}

import { 
  select as d3Select, 
  selectAll as d3SelectAll,
  drag as d3Drag,
  line as d3Line,
  create as d3Create,
  scaleLinear as d3ScaleLinear,
  zoomIdentity as d3ZoomIdentity,
  zoom as d3Zoom,
  zoomTransform as d3ZoomTransform,
  symbol as d3Symbol,
  axisTop as d3AxisTop,
  axisLeft as d3AxisLeft,
  symbolTriangle as d3SymbolTriangle,
  symbolX as d3SymbolX,
  symbolDiamond as d3SymbolDiamond,
  easeQuadInOut as d3EaseQuadInOut,
  easeLinear as d3EaseLinear,
  pointers as d3Pointers,
  mean as d3Mean,
  ZoomTransform,
  ValueFn,
  D3ZoomEvent,
  SelectionFn,
  D3DragEvent,
  Selection,
} from 'd3';

import { useTitle } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

const  findClosestStartTime = (startTimes: number[], timepoint: number) => {
  let closestIndex = -1;
  let closestDiff = Infinity;

  for (let i = 0; i < startTimes.length; i++) {
    if (startTimes[i] > timepoint) continue; // Skip start times after timepoint

    const diff = timepoint - startTimes[i];
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

function findClosestStartTimeAfter(startTimes: number[], timepoint: number) {
  let closestIndex = -1;
  let closestDiff = Infinity;
  for (let i = 0; i < startTimes.length; i++) {
    if (startTimes[i] <= timepoint) continue; // Skip start times <= timepoint

    const diff = startTimes[i] - timepoint;
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

type EditorDataType = {
  piece: Piece,
  durTot: number,
  backColor: string,
  axisColor: string,
  // yAxWidth: number,
  xAxHeight: number,
  minDrawDur: number,
  initViewDur: number,
  initYScale: number,
  initXScale: number,
  transitionTime: number,
  controlBoxWidth: number,
  audioSource?: string,
  currentTime: number,
  selectedChikariID?: string,
  chikariColor: string,
  selectedChikariColor: string,
  dateModified?: Date,
  setChikari: boolean,
  viewPhrases: boolean,
  phraseLabelHeight: number,
  loop: boolean,
  init: boolean,
  minTrajDur: number,
  setNewPhraseDiv: boolean,
  justEnded: boolean,
  editable: boolean,
  recGain: number,
  synthGain: number,
  synthDamping: number,
  showSargam: boolean,
  showBols: boolean,
  scrollYWidth: number,
  scrollXHeight: number,
  editorHeight: number,
  scrollYHeight: number,
  initYOffset: number,
  setNewSeries: boolean,
  setNewRegion: boolean,
  shifted: boolean,
  metad: boolean,
  scrollDragColor: string,
  scrollDragColorHover: string,
  playheadReturn: boolean,
  showInstructions: boolean,
  instructionsText: string,
  clipboardTrajs: Trajectory[],
  pastedTrajs: Trajectory[],
  playerHeight: number,
  oldHeight?: number,
  leftTime: number,
  phonemeRepresentation: PhonemeRepresentation,
  sargamRepresentation: SargamRepresentation,
  controlsHeight: number,
  unsavedChanges: boolean,
  selMeterColor: string,
  selMeter?: Meter,
  meterColor: string,
  pulseDragEnabled: boolean,
  pulseDragInitX?: number,
  insertPulseMode: boolean,
  insertPulses: number[],
  meterMagnetMode: boolean,
  contextMenuX: number,
  contextMenuY: number,
  contextMenuClosed: boolean,
  contextMenuChoices: ContextMenuOptionType[],
  fullWidth: number,
  initLogFreq?: number,
  uniformVowel: boolean,
  x?: d3.ScaleLinear<number, number>,
  y?: d3.ScaleLinear<number, number>,
  requestId?: number,
  selectedTrajID?: string,
  selectedPhraseDivIdx?: number,
  clipG: Selection<SVGGElement, undefined, null, undefined>,
  scrollXWidth: number,
  initXOffset: number,
  trajTimePts: TrajTimePoint[],
  drawingRegion: boolean,
  regionStartPx: number,
  regionEndPx: number,
  audioDBDoc?: RecType,
  selBox: Selection<SVGRectElement, undefined, null, undefined>,
  svgNode: SVGSVGElement,
  zoom: d3.ZoomBehavior<Element, unknown>,
  curWidth: number,
  oldRectHeight: number,
  scrollX: Selection<SVGSVGElement, undefined, null, undefined>,
  scrollY: Selection<SVGSVGElement, undefined, null, undefined>,
  regionG?: Selection<SVGGElement, undefined, null, undefined>,
  desiredWidth: number,
  desiredHeight: number,
  xScale: number,
  yScale: number,
  unscaledWidth: number,
  loadedImgs: number,
  numSpecs: number,
  totNaturalWidth: number,
  cumulativeWidths: number[],
  imgs: HTMLImageElement[],
  specBox: Selection<SVGGElement, undefined, null, undefined>,
  browser: BrowserInfo,
  dragIdx: string,
  IPLims: [number, number],
  melographJSON?: {
    data_chunks: number[][],
    time_chunk_starts: number[],
    time_increment: number,
  },
  melographVisible: boolean,
  autoWindowX: number,
  autoWindowY: number,
  autoTrajs: Trajectory[],
  autoWindowWidth: number,
  d3ZoomEvent?: D3ZoomEvent<Element, unknown>,
  maxMetricLayer: number,
  visibilityTab: boolean,
  rotation: number,
  showMelody: boolean,
  showMeter: boolean,
  throttledRedraw: (() => void) | undefined,
  transcriptionWidth: number,
  transcriptionHeight: number,
  lowOctOffset: number,
  highOctOffset: number,
  showSpectrogram: boolean,
  melographColor: string,
  maxPitch: Pitch,
  minPitch: Pitch,
  sargamLineColor: string,
  showSargamLines: boolean,
  showPhonemes: boolean,
  instTracks: InstrumentTrackType[],
  selectedMode: EditorMode,
  trajSelStatus: TrajSelectionStatus,
  sargamMagnetMode: boolean,
  selectedPhraseDivUid?: string,
  throttledAlterSlope: ReturnType<typeof throttle> | undefined,
  throttledAlterVibObj: ReturnType<typeof throttle> | undefined,
  editingInstIdx: number,
  heldLogFreq?: number,
  recomputeTrigger: number,
  tooltipX: number,
  tooltipY: number,
  tooltipOpen: boolean,
  tooltipText: string,
  hoverTimeout: number | undefined,
  regionIdx: number,
  playheadColor: string,
  stretchedFactor: number,
  playheadMotion: boolean,
  highlightTrajs: boolean,
  playheadAnimation: PlayheadAnimations,
  throttledRenderMeter: ReturnType<typeof throttle> | undefined,
  throttledRefreshSargamLines: ReturnType<typeof throttle> | undefined,
  zoomYFactor: number,
  zoomXFactor: number,
  queryTime: number,
  showAddToCollection: boolean,
  editableCols: CollectionType[],
  showRemoveFromCollection: boolean,
  scaleSystem: ScaleSystem,
  excerptRange?: ExcerptRange,
  showPhrases: boolean,
}

export { findClosestStartTime }

export default defineComponent({
  name: 'EditorComponent',
  data(): EditorDataType {
    return {
      piece: new Piece(),
      durTot: 600,
      backColor: '#f0f8ff', // aliceblue
      axisColor: '#c4b18b', // tan
      // yAxWidth: 30,
      xAxHeight: 60,
      minDrawDur: 0.01, //this could be smaller, potentially
      initViewDur: 20,
      initYScale: 2,
      initXScale: 1,
      transitionTime: 1000 / 60,
      controlBoxWidth: 240,
      audioSource: undefined,
      currentTime: 0,
      selectedChikariID: undefined,
      chikariColor: 'black',
      selectedChikariColor: 'red',
      dateModified: undefined,
      setChikari: false,
      viewPhrases: true,
      phraseLabelHeight: 30,
      loop: false,
      init: true,
      minTrajDur: 0.05,
      setNewPhraseDiv: false,
      justEnded: false,
      editable: false,
      recGain: 0,
      synthGain: 0,
      synthDamping: 0.5,
      showSargam: false,
      showBols: false,
      scrollYWidth: 20,
      scrollXHeight: 20,
      editorHeight: 400,
      scrollYHeight: 500 - 30 - 20, // this is bad, just a placeholder anyway
      initYOffset: 0,
      setNewSeries: false,
      setNewRegion: false,
      shifted: false,
      metad: false,
      scrollDragColor: '#9c9c9c',
      scrollDragColorHover: '#AAAAAA',
      playheadReturn: false,
      showInstructions: false,
      instructionsText: instructionsText,
      clipboardTrajs: [],
      pastedTrajs: [],
      playerHeight: 100,
      oldHeight: undefined,
      leftTime: 0,
      phonemeRepresentation: PhonemeRepresentation.Latin,
      sargamRepresentation: SargamRepresentation.Sargam,
      controlsHeight: 200,
      unsavedChanges: false,
      selMeterColor: '#3dcc63',
      selMeter: undefined,
      meterColor: '#0D3D0E',
      pulseDragEnabled: false,
      pulseDragInitX: undefined,
      insertPulseMode: false,
      insertPulses: [],
      meterMagnetMode: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuClosed: true,
      contextMenuChoices: [],
      fullWidth: 0,
      initLogFreq: undefined,
      uniformVowel: false,
      x: undefined,
      y: undefined,
      requestId: undefined,
      clipG: d3Create('g'),
      scrollXWidth: 0,
      initXOffset: 0,
      trajTimePts: [],
      drawingRegion: false,
      regionStartPx: 0,
      regionEndPx: 0,
      audioDBDoc: undefined,
      selBox: d3Create('rect'),
      svgNode: d3Create('svg').node() as SVGSVGElement,
      zoom: d3Zoom(),
      curWidth: 0,
      oldRectHeight: 0,
      specBox: d3Create('g'),
      scrollX: d3Create('svg'),
      scrollY: d3Create('svg'),
      regionG: undefined,
      desiredWidth: 0,
      desiredHeight: 0,
      xScale: 1,
      yScale: 1,
      unscaledWidth: 0,
      loadedImgs: 0,
      numSpecs: 0,
      totNaturalWidth: 0,
      cumulativeWidths: [],
      imgs: [],
      browser: detect() as BrowserInfo,
      dragIdx: '',
      IPLims: [0, 0],
      melographJSON: undefined,
      melographVisible: false,
      selectedPhraseDivIdx: undefined,
      autoWindowX: 500,
      autoWindowY: 500,
      autoTrajs: [],
      autoWindowWidth: 300,
      d3ZoomEvent: undefined,
      maxMetricLayer: 3,
      visibilityTab: false,
      rotation: -90,
      showMelody: true,
      showMeter: true,
      throttledRedraw: undefined,
      transcriptionWidth: 0,
      transcriptionHeight: 0,
      lowOctOffset: 1.1,
      highOctOffset: 2.1,
      showSpectrogram: false,
      melographColor: '#006400', // darkgreen
      maxPitch: new Pitch({ swara: 'Sa', oct: 2 }),
      minPitch: new Pitch({ swara: 'Sa', oct: -1 }),
      sargamLineColor: '#808080', // grey
      showSargamLines: true,
      showPhonemes: true,
      instTracks: [],
      selectedMode: EditorMode.None,
      trajSelStatus: undefined,
      sargamMagnetMode: true,
      selectedPhraseDivUid: undefined,
      throttledAlterSlope: undefined,
      throttledAlterVibObj: undefined,
      editingInstIdx: 0,
      heldLogFreq: undefined,
      recomputeTrigger: 0,
      tooltipX: 0,
      tooltipY: 0,
      tooltipOpen: false,
      tooltipText: '',
      hoverTimeout: undefined,
      regionIdx: 0,
      playheadColor: '#000000',
      stretchedFactor: 1,
      playheadMotion: false,
      highlightTrajs: false,
      playheadAnimation: PlayheadAnimations.Animated,
      throttledRenderMeter: undefined,
      throttledRefreshSargamLines: undefined,
      zoomYFactor: 1,
      zoomXFactor: 1,
      queryTime: 0,
      showAddToCollection: false,
      editableCols: [],
      showRemoveFromCollection: false,
      scaleSystem: ScaleSystem.Sargam,
      excerptRange: undefined,
      showPhrases: true,
    }
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router }
  },
  components: {
    EditorAudioPlayer,
    TrajSelectPanel,
    ContextMenu,
    Renderer,
    Tooltip,
    AddToCollection,
    RemoveFromCollection,
  },
  created() {
    window.addEventListener('keydown', this.handleKeydown);
    let offset = this.navHeight + this.playerHeight + this.controlsHeight + 1;
    if (window.innerHeight < 800) {
      offset = this.navHeight + this.playerHeight + 1;
      const ap = this.$refs.audioPlayer as APType;
    }
    this.editorHeight = window.innerHeight - offset  ;
    if (this.$store.state.userID === undefined) {
      if (this.$cookies.get('userID') === undefined) {
        if (this.route.query) {
          this.$store.commit('update_query', this.route.query)
        }
        this.router.push('/')
      }
    }
  },

  beforeRouteLeave() {
    if (this.unsavedChanges) {
      const txt = 'You have unsaved changes. Are you sure you want to leave ' +
                  'the transcription editor?'
      const answer = window.confirm(txt)
      if (!answer) return false
    }
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    }
  },

  async mounted() {
    this.xAxHeight = this.showPhrases ? 60 : 30;
    window.addEventListener('beforeunload', this.beforeUnload);
    this.fullWidth = window.innerWidth;
    this.throttledAlterSlope = throttle(this.alterSlope, 16);
    this.throttledAlterVibObj = throttle(this.alterVibObj, 16);
    this.throttledRenderMeter = throttle(this.renderMeter, 100);
    this.throttledRefreshSargamLines = throttle(this.refreshSargamLines, 100);
    if (this.$store.state.userID === '634d9506a6a3647e543b7641') {
      this.playheadAnimation = PlayheadAnimations.Block;
    }

    try {
      // if there's a query id, 1. check if exists, 2. if so, load it, else:
      // send some sort of message that entered piece didn't exist and go to 
      // files.
      // check if stored piece esists. if so, load it, else: load default piece.
      // push the id to router. 
      
      let piece, pieceDoesExist;
      const queryId = this.route.query.id! as string;
      this.queryTime = this.route.query.t ? Number(this.route.query.t) : 0;
      if (queryId) {
        pieceDoesExist = await pieceExists(queryId);
        if (pieceDoesExist) {
          piece = await getPiece(queryId);

        } else {
          window.alert('IDTP logger: Piece does not exist, or you do not have permission to view.');
          await this.router.push({ name: 'Transcriptions' });
          throw 'IDTP logger: Piece does not exist, or you do not have \
          permission to view.'
        }
      } else {
        const storedId = this.$store.state._id;
        pieceDoesExist = await pieceExists(storedId);
        const id = pieceDoesExist ? storedId : '63445d13dc8b9023a09747a6';
        this.router.push({ 
          name: 'EditorComponent',
          query: { 'id': id }
        })
        piece = await getPiece(id);
      }
      this.browser = detect() as BrowserInfo;
      if (piece.audioID) {
        this.excerptRange = piece.excerptRange;
        this.audioSource = this.browser.name === 'safari' ?
          `https://swara.studio/audio/mp3/${piece.audioID}.mp3` :
          `https://swara.studio/audio/opus/${piece.audioID}.opus`;        
        this.audioDBDoc = await getAudioRecording(piece.audioID);
        this.melographJSON = await getMelographJSON(piece.audioID);
        this.durTot = this.audioDBDoc!.duration;
        if (this.excerptRange !== undefined) {
          this.durTot = this.excerptRange.end - this.excerptRange.start;
        }
      } else {
        this.durTot = piece.durTot!;
      }
      this.initXScale = this.durTot / this.initViewDur;
      await this.getPieceFromJson(piece);
      useTitle(this.piece.title);
      this.editable = this.permissionToEdit(this.piece); // necessary
      if (!this.permissionToView(this.piece)) {
        window.alert('IDTP logger: Piece does not exist, or you do not have permission to view.');
        await this.router.push({ name: 'Transcriptions' });
          throw 'IDTP logger: Piece does not exist, or you do not have \
          permission to view.'
      }

      await updateTranscriptionViewed(this.$store.state.userID!, this.piece._id!);



      this.oldHeight = window.innerHeight;
      const ap = this.$refs.audioPlayer as APType;
      ap.parentLoaded();
      const colors = ['#204580', '#802030', '#532080', '#428020'];
      const selColors = ['#4089ff', '#ff4060', '#a640ff', '#83ff40']
      this.piece.instrumentation.forEach((inst, idx) => {
        if (idx > 4) {
          throw 'IDTP logger: Too many instruments in instrumentation array.'
        }
        this.instTracks.push({
          inst,
          idx,
          displaying: true,
          sounding: true,
          color: colors[idx],
          selColor: selColors[idx]
        })
      });

      const q = this.route.query;
      const routerObj: {
        id: string,
        t?: number
      } = { id: String(q.id) };
      if (q.t) {
        routerObj['t'] = Number(q.t);
      }
      this.router.push({ query: routerObj });
      
      const silentDur = this.durTot - piece.durTot!;
      if (silentDur >= 0.00001) {
        const stTrajObj: {
          id: number,
          pitches: Pitch[],
          durTot: number,
          fundID12: number,
          instrumentation?: Instrument
        } = {
          id: 12,
          pitches: [],
          durTot: silentDur,
          fundID12: this.piece.raga.fundamental
        };
        if (this.piece.instrumentation) {
          stTrajObj.instrumentation = this.piece.instrumentation[0];
        }
        const silentTraj = new Trajectory(stTrajObj);
        const phraseObj: {
          trajectories: Trajectory[],
          durTot: number,
          instrumentation?: string[]
        } = {
          trajectories: [silentTraj],
          durTot: silentDur,
        };
        if (this.piece.instrumentation) {
          phraseObj.instrumentation = this.piece.instrumentation;
        }
        const silentPhrase = new Phrase(phraseObj);
        this.piece.phrases.push(silentPhrase);
        this.piece.durArrayFromPhrases();
        this.piece.updateStartTimes();
      }
      const rendererWidth = this.fullWidth - this.controlBoxWidth;
      const graphWidth = rendererWidth - this.scrollYWidth;
      this.transcriptionWidth = Math.round(graphWidth * this.durTot / this.initViewDur);
      const rendererHeight = this.editorHeight;
      const graphHeight = rendererHeight - this.scrollXHeight;
      this.transcriptionHeight = Math.round(2 * graphHeight);
      this.assessZoomFactors();

      if (this.queryTime !== 0) {
        this.currentTime = this.queryTime;
      }
      const userID = this.$store.state.userID!;
      this.editableCols = await getEditableCollections(userID);
    } catch (err) {
      console.error(err)
    }
  },

  unmounted() {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('beforeunload', this.beforeUnload);
  },

  watch: {

    showPhrases(newVal) {
      this.xAxHeight = newVal ? 60 : 30;
    },

    scaleSystem(ss) {
      if (ss === ScaleSystem.Sargam || ss === ScaleSystem.SargamCents) {
        this.sargamRepresentation = SargamRepresentation.Sargam;
      } else if (ss === ScaleSystem.Solfege || ss === ScaleSystem.SolfegeCents) {
        this.sargamRepresentation = SargamRepresentation.Solfege;
      } else if (
        ss === ScaleSystem.PitchClass || 
        ss === ScaleSystem.PitchClassCents ||
        ss === ScaleSystem.Cents
      ) {
        this.sargamRepresentation = SargamRepresentation.PitchClass;
      } else if (ss === ScaleSystem.MovableCCents) {
        this.sargamRepresentation = SargamRepresentation.WesternPitch;
      }
    },

    loop() {
      const ap = this.$refs.audioPlayer as APType;
      if (this.loop) {
        ap.loop = true;
        ap.loopStart = this.regionStartTime;
        ap.loopEnd = this.regionEndTime;
        if (ap.sourceNode) {
          if (this.regionStartTime === undefined || 
              this.regionEndTime === undefined) {
            throw 'IDTP logger: regionStartTime or regionEndTime is undefined.'
          }
          ap.sourceNode.loopStart = this.regionStartTime;
          ap.sourceNode.loopEnd = this.regionEndTime;
        }
      } else {
        ap.loop = false;
        ap.loopStart = undefined;
        ap.loopEnd = undefined;
      }
    },

    regionStartTime(newVal) {
      const ap = this.$refs.audioPlayer as APType;
      if (this.loop) {
        ap.loopStart = newVal;
        if (ap.sourceNode) {
          ap.sourceNode.loopStart = newVal;
        }
      }
    },

    regionEndTime(newVal) {
      const ap = this.$refs.audioPlayer as APType;
      if (this.loop) {
        ap.loopEnd = newVal;
        if (ap.sourceNode) {
          ap.sourceNode.loopEnd = newVal;
        }
      }
    },

    trajTimePts: {
      handler(newVal) {
        if (this.selectedMode === EditorMode.Series) {
          if (newVal.length === 2) {
            this.insertSeriesTraj();
          }
        }
      },
      deep: true
    },

    selectedMode(newVal, oldVal) {
      if (oldVal === EditorMode.Meter) {
        const ap = this.$refs.audioPlayer as APType;
        const mc = ap.$refs.meterControls as MeterControlsType;
        mc.meterSelected = false;
      }
      if (newVal === EditorMode.Meter) {
        const ap = this.$refs.audioPlayer as APType;
        ap.selectedControlsMode = ControlsMode.Meter;
      }
    }
  },

  computed: {

    yAxWidth() {
      const wides = [
        ScaleSystem.Cents, 
      ]
      const middles = [
        ScaleSystem.SargamCents, 
        ScaleSystem.SolfegeCents,
        ScaleSystem.PitchClassCents,
        ScaleSystem.MovableCCents
      ]
      return wides.includes(this.scaleSystem) ? 70 : middles.includes(this.scaleSystem) ? 55 : 30;
    },
    hasRecording() {
      return this.audioDBDoc !== undefined;
    },

    hasSitar() {
      return this.instTracks.some(inst => inst.inst === Instrument.Sitar);
    }, 
    
    setNewTraj() {
      return this.selectedMode === EditorMode.Trajectory;
    },

    freqMin() {
      const saFreq = this.piece.raga.fundamental;
      const logSaFreq = Math.log2(saFreq);
      const logMin: number = logSaFreq - this.lowOctOffset;
      return 2 ** logMin;
    },

    freqMax() {
      const saFreq = this.piece.raga.fundamental;
      const logSaFreq = Math.log2(saFreq);
      const logMax: number = logSaFreq + this.highOctOffset;
      return 2 ** logMax;
    },

    vocal() {
      const vox = [Instrument.Vocal_M, Instrument.Vocal_F];
      for (const inst of this.piece.instrumentation) {
        if (vox.includes(inst as Instrument)) {
          return true;
        }
      }
      return false;
    },

    selectedTraj(): Trajectory | undefined {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      return tLayer.selectedTraj;
    },

    selectedTrajs(): Trajectory[] {
      this.recomputeTrigger;
      const r = this.$refs.renderer as RendererType;
      if (!r) {
        return [];
      }
      const tLayer = r.transcriptionLayer as TLayerType;
      if (!tLayer) {
        return []; 
      }
      return tLayer.selectedTrajs;
    },

    playing() { 
      const ap = this.$refs.audioPlayer as APType;
      return ap.playing;
    },

    groupable() {
      if (this.selectedTrajs.length > 1) {
        return this.selectedTrajsGroupable();
      } else {
        return false;
      }
    },

    regionStartTime() {
      this.regionIdx;
      const r = this.$refs.renderer as RendererType;
      if (!r) return undefined;
      const tLayer = r.transcriptionLayer as TLayerType;
      if (!tLayer) return undefined;
      return tLayer.regionStartX;
    },

    regionEndTime() {
      this.regionIdx;
      const r = this.$refs.renderer as RendererType;
      if (!r) return undefined;
      const tLayer = r.transcriptionLayer as TLayerType;
      if (!tLayer) return undefined;
      return tLayer.regionEndX;
    },

    removableCols() {
      return this.editableCols.filter(c => {
        return c.transcriptions.includes(this.piece._id!);
      })
    }
  },

  methods: {
    

    handleStartPlayingTransition() {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.startPlayingTransition();
    },

    handleStopPlayingTransition() {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.stopPlayingTransition();
    },

    async closeAddToCollection() {
      this.showAddToCollection = false;
      try {
        this.updateEditableCols();
      } catch (err) {
        console.error(err);
      }
    },

    async closeRemoveFromCollection() {
      this.showRemoveFromCollection = false;
      try {
        this.updateEditableCols();
      } catch (err) {
        console.error(err);
      }
    },

    async updateEditableCols() {
      try {
        const userID = this.$store.state.userID!;
        this.editableCols = await getEditableCollections(userID);
      } catch (err) {
        console.error(err);
      }
    },

    updateSelectedMode(mode: EditorMode) {
      if (mode !== EditorMode.None && mode !== EditorMode.Region) {
        if (!this.editable) {
          return;
        }
      }
      this.selectedMode = mode;
    },

    

    clearTSP() {
      const tsp = this.$refs.trajSelectPanel as TSPType;
      tsp.startConsonant = undefined;
      tsp.endConsonant = undefined;
    },

    scrollBackForPlayhead() {
      const r = this.$refs.renderer as RendererType;
      r.scrollBackForPlayhead();
    },

    handleUpdateSonify(data: { idx: number, val: boolean }) {
      this.instTracks[data.idx].sounding = data.val;
    },

    rerenderMeter(meter: Meter) {
      this.renderMeter(meter);
    },

    togglePluck() { 
      const tsp = this.$refs.trajSelectPanel as TSPType;
      tsp.pluckBool = !tsp.pluckBool;
    },

    toggleDampen() {
      console.log('toggling dampen')
      const tsp = this.$refs.trajSelectPanel as TSPType;
      tsp.dampen = !tsp.dampen;
    },

    cancelRegionSpeed() {
      const ap = this.$refs.audioPlayer as APType;
      if (ap.regionSpeedOn) {
        ap.regionSpeedOn = false;
        ap.toggleRegionSpeed()
      };
    },

    updateApStretchable(stretchable: boolean) {
      const ap = this.$refs.audioPlayer as APType;
      ap.stretchable = stretchable;
      ap.updateStretchBuf();
    },

    showTooltip(data: TooltipData) {
      this.tooltipText = data.text;
      this.tooltipOpen = true;
      this.tooltipX = data.x;
      this.tooltipY = data.y;
    },

    hideTooltip() {
      this.tooltipOpen = false;
      this.tooltipText = '';
    },

    engageLabelEditor(options: LabelEditorOptions) {
      const eap = this.$refs.audioPlayer as APType;
      eap.selectedControlsMode = ControlsMode.Tag;
      this.$nextTick(() => {
        const le = eap.$refs.labelControls as LabelEditorType;
        le.selectedHierarchy = options.type;
        if (options.type === 'Phrase') {
          le.scrollToPhrase(options.idx);
        } else {
          le.scrollToSection(options.idx)
        }
      })
    },

    renderMeter(meter: Meter) {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as unknown as TLayerType;
      tLayer.renderMeter(meter);
    },

    updatePrevMeter(bool: boolean) {
      const ap = this.$refs.audioPlayer as APType;
      const meterControls = ap.$refs.meterControls as MeterControlsType;
      meterControls.prevMeter = bool;
    },

    updateTrajTimePts(timePts: { time: number, logFreq: number, pIdx: number, tIdx: number, track: number }[]) {
      this.trajTimePts.splice(0, this.trajTimePts.length, ...timePts);
    },

    insertSeriesTraj() {
      this.heldLogFreq = this.trajTimePts[1].logFreq;
      this.trajTimePts[1].logFreq = this.trajTimePts[0].logFreq;
      this.newTrajEmit(0);
    },

    async updateCurrentTime(time: number) {
      const ap = this.$refs.audioPlayer as APType;
      // wait until 
      while (ap.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (ap.regionSpeedOn) {
        const afterStart = time >= this.regionStartTime!;
        const beforeEnd = time <= this.regionEndTime!;
        if (afterStart && beforeEnd) {
          this.currentTime = time;
          if (!ap.playing) {
            ap.pausedAt = time;
            ap.updateProgress();
            ap.updateFormattedCurrentTime();
            ap.updateFormattedTimeLeft();
          } else {
            ap.stop();
            ap.pausedAt = time;
            ap.play();
          } 
        }
      } else {
        this.currentTime = time;
        if (!ap.playing) {
          ap.pausedAt = time;
          ap.updateProgress();
          ap.updateFormattedCurrentTime();
          ap.updateFormattedTimeLeft();
        } else {
          ap.stop();
          ap.pausedAt = time;
          // this.animationStart = time;
          ap.play();
          const s = ap.$refs.synths as InstanceType<typeof Synths>;
          s.cancelAllTrajs();
          s.playAllTrajs();
        }
      }
    },

    updatePhraseDivRendering(pd: PhraseDivDisplayType) {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      tLayer.removePhraseDiv(pd.uId);
      tLayer.renderPhraseDiv(pd);
    },

    updateSelPhraseDivUid(uId: string) {
      this.selectedPhraseDivUid = uId;
    },

    updateInstTracks(tracks: InstrumentTrackType[]) {
      this.instTracks = tracks;
    },

    updateSaFreq(f: number) {
      this.piece.updateFundamental(f);
      this.minPitch.fundamental = f;
      this.maxPitch.fundamental = f;
      const minPitchFreq = this.minPitch.frequency;
      const maxPitchFreq = this.maxPitch.frequency;
      this.lowOctOffset = Math.log2(f / minPitchFreq) + 0.1;
      this.highOctOffset = Math.log2(maxPitchFreq / f) + 0.1;
      const renderer = this.$refs.renderer as RendererType;
      renderer.reScaleY();
      const yAxis = renderer.yAxis as YAxisType;
      yAxis.resetAxis();
    },

    updateMinPitch(p: Pitch) {
      this.minPitch = p;
      const saFreq = this.piece.raga.fundamental;
      const minPitchFreq = this.minPitch.frequency;
      this.lowOctOffset = Math.log2(saFreq / minPitchFreq) + 0.1;
      const r = this.$refs.renderer as RendererType;
      const yAxis = r.yAxis as YAxisType;
      yAxis.resetAxis();
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      const sLayer = r.$refs.spectrogramLayer as SLayerType;
      this.$nextTick(() => {
        tLayer.resetTranscription();
        sLayer.resetCanvases();
      });
    },

    updateMaxPitch(p: Pitch) {
      this.maxPitch = p;
      const saFreq = this.piece.raga.fundamental;
      const maxPitchFreq = this.maxPitch.frequency;
      this.highOctOffset = Math.log2(maxPitchFreq / saFreq) + 0.1;
      const r = this.$refs.renderer as RendererType;
      const yAxis = r.yAxis as YAxisType;
      yAxis.resetAxis();
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      const sLayer = r.$refs.spectrogramLayer as SLayerType;
      this.$nextTick(() => {
        tLayer.resetTranscription();
        sLayer.resetCanvases();
      });
    },

    zoomInY() {
      this.transcriptionHeight = Math.round(this.transcriptionHeight * 1.5);
      const logRange = this.maxPitch.logFreq - this.minPitch.logFreq;
      this.zoomYFactor = this.transcriptionHeight / logRange;
    },

    zoomOutY() {
      this.transcriptionHeight = Math.round(this.transcriptionHeight / 1.5);
      const logRange = this.maxPitch.logFreq - this.minPitch.logFreq;
      this.zoomYFactor = this.transcriptionHeight / logRange;
    },

    zoomInX() {
      this.transcriptionWidth = Math.round(this.transcriptionWidth * 1.5);
      this.zoomXFactor = this.transcriptionWidth / this.durTot;
    },

    zoomOutX() {
      this.transcriptionWidth = Math.round(this.transcriptionWidth / 1.5);
      this.zoomXFactor = this.transcriptionWidth / this.durTot;
    },

    resetZoom() {
      this.transcriptionWidth = Math.round(this.zoomXFactor * this.durTot);
      const logRange = this.maxPitch.logFreq - this.minPitch.logFreq;
      this.transcriptionHeight = Math.round(this.zoomYFactor * logRange);
    },

    assessZoomFactors() {
      const logRange = this.maxPitch.logFreq - this.minPitch.logFreq;
      this.zoomYFactor = this.transcriptionHeight / logRange;
      this.zoomXFactor = this.transcriptionWidth / this.durTot;
    },

    updateZoomFactors(obj: { x: number, y: number }) {
      this.zoomXFactor = obj.x;
      this.zoomYFactor = obj.y;
      this.resetZoom();
    },

    updateTranscriptionVisibility() {
      if (!this.showMelody) {
        d3SelectAll('.phrase')
          .style('display', 'none')
        d3SelectAll('.articulation')
          .style('display', 'none')
      } else {
        d3SelectAll('.phrase')
          .style('display', 'inline')
        d3SelectAll('.articulation')
          .style('display', 'inline')
      }
    },

    toggleVisibility(e: MouseEvent) {
      let target = e.target as HTMLElement;
      target = target.parentNode as HTMLElement;
      if (this.visibilityTab) {
        this.visibilityTab = false;
        this.rotation = -90;
        target.classList.remove('open');
      } else {
        this.visibilityTab = true;
        this.rotation = 0;
        target.classList.add('open');
      }
    },

    updateMaxMetricLayer(e: number) {
      this.maxMetricLayer = e
    },

    permissionToEdit(piece: Piece) {
      const id = this.$store.state.userID!;
      const c1 = id === piece.userID;
      const c2 = piece.explicitPermissions.edit.includes(id);
      return c1 || c2;
    },

    permissionToView(piece: Piece) {
      const id = this.$store.state.userID!;
      const c1 = id === piece.userID;
      const c2 = piece.explicitPermissions.view.includes(id);
      const c3 = piece.explicitPermissions.edit.includes(id);
      const c4 = piece.explicitPermissions.publicView;
      return c1 || c2 || c3 || c4;
    },
    assignPrevMeter() {
      const ap = this.$refs.audioPlayer as APType;
      const meterControls = ap.$refs.meterControls as MeterControlsType;
      const mtrStarts = this.piece.meters.map(m => m.startTime);
      const mIdx = findClosestStartTime(mtrStarts, this.insertPulses[0]);
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      tLayer.selectedMeter = this.piece.meters[mIdx];
      meterControls.meter = this.piece.meters[mIdx];
    },

    updateUnsavedChanges(truth: boolean) {
      this.unsavedChanges = truth;
    },

    addMeter(meter: Meter) {
      this.piece.addMeter(meter);
      this.unsavedChanges = true;
      this.selectedMode = EditorMode.Meter;
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      tLayer.renderMeter(meter);
      tLayer.clearInsertPulses();
      tLayer.selectedMeter = meter;
    },

    timeWithinMeter(time: number): boolean {
      let out = false;
      this.piece.meters.forEach(meter => {
        const start = meter.startTime;
        const end = start + meter.durTot;
        if (time >= start && time <= end) {
          out = true;
        }
      })
      return out;
    },

    updateIPLims() {
      const mtrStarts = this.piece.meters
        .map(m => m.startTime)
      const ip = this.insertPulses[0];
      if (Math.min(...mtrStarts) > ip) {
        const afterIdx = findClosestStartTimeAfter(mtrStarts, ip);
        const after = this.piece.meters[afterIdx];
        if (after === undefined) {
          this.IPLims = [0, this.durTot];
        } else {
          this.IPLims = [0, after.startTime];
        }
      } else if (Math.max(...mtrStarts) < ip) {
        const beforeIdx = findClosestStartTime(mtrStarts, ip);
        const before = this.piece.meters[beforeIdx];
        this.IPLims = [before.startTime + before.durTot, this.durTot];
      } else {
        const beforeIdx = findClosestStartTime(mtrStarts, ip);
        const afterIdx = findClosestStartTimeAfter(mtrStarts, ip);
        const before = this.piece.meters[beforeIdx];
        const after = this.piece.meters[afterIdx];
        this.IPLims = [before.startTime + before.durTot, after.startTime];
      }
      const eAP = this.$refs.audioPlayer as APType;
      const meterControls = eAP.$refs.meterControls as MeterControlsType;
      if (this.insertPulses.length === 0) {
        meterControls.prevMeter = false;
      } else {
        meterControls.prevMeter = Math.min(...mtrStarts) < this.insertPulses[0];
      }
    },

    endConsonantEmit(endConsonant: string) {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      const selT = tLayer.selectedTraj!;
      this.unsavedChanges = true;
      const pIdx = selT.phraseIdx!;
      const tIdx = selT.num!;
      const phrase = this.piece.phrases[pIdx];
      if (endConsonant === undefined) {
        // false indicates that this is the end consonant
        selT.removeConsonant(false);
      } else if (selT.endConsonant === undefined) {
        selT.addConsonant(endConsonant, false);
      } else {
        selT.changeConsonant(endConsonant, false)
      }
      tLayer.refreshEndingConsonant(selT.uniqueId!);
      tLayer.renderConsonantSymbols(selT, this.editingInstIdx)
      if (phrase.trajectories.length > tIdx + 1) {
        const nextTraj = phrase.trajectories[tIdx + 1];
        tLayer.refreshVowel(nextTraj.uniqueId!);
      }
    },

    startConsonantEmit(startConsonant: string) {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.$refs.transcriptionLayer as TLayerType;
      const selT = tLayer.selectedTraj!;
      const pIdx = selT.phraseIdx!;
      const phrase = this.piece.phrases[pIdx];
      const tIdx = selT.num!;
      this.unsavedChanges = true;
      if (startConsonant === undefined) {
        selT.removeConsonant();   
      } else if (selT.startConsonant === undefined) {
        selT.addConsonant(startConsonant);
      } else {
        selT.changeConsonant(startConsonant)
      }
      tLayer.refreshVowel(selT.uniqueId!);
      tLayer.renderConsonantSymbols(selT, this.editingInstIdx)
      // const track = this.editingInstIdx
      if (phrase.trajectories.length > tIdx + 1) {
        const nextTraj = phrase.trajectories[tIdx + 1];
        tLayer.refreshVowel(nextTraj.uniqueId!);
      }

    },

    vowelEmit(vowel: string) {
      console.log('emitting vowel')
      // legit 
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      const selT = tLayer.selectedTraj!;
      this.unsavedChanges = true;
      selT.updateVowel(vowel)
      const pIdx = selT.phraseIdx!;
      const tIdx = selT.num!;
      const phrase = this.piece.phraseGrid[this.editingInstIdx][pIdx];
      tLayer.refreshVowel(selT.uniqueId!);
      // if there is a next traj, check its vowel, and change it if necessary
      if (phrase.trajectories.length > tIdx + 1) {
        const nextTraj = phrase.trajectories[tIdx + 1];
        tLayer.refreshVowel(nextTraj.uniqueId!);
      }
    },

    dampenEmit(dampen: boolean) {
      // legit
      this.unsavedChanges = true;
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      const selT = tLayer.selectedTraj!;
      if (dampen) {
        selT.articulations['1.00'] = new Articulation({
          name: 'dampen',
        });
      } else {
        if (selT.articulations['1.00']) {
          delete selT.articulations['1.00'];
        }
      };
      tLayer.refreshTraj(selT);
    },

    alterVibObj(vibObj: VibObjType) {
      // legit
      this.unsavedChanges = true;
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.selectedTraj!.vibObj = vibObj;
      tLayer.refreshTraj(tLayer.selectedTraj!);
    },

    newTrajEmit(idx: number) {
      this.unsavedChanges = true;
      this.trajTimePts.sort((a, b) => a.time - b.time);
      const pitches = this.trajTimePts.map(ttp => {
        return this.piece.raga.pitchFromLogFreq(ttp.logFreq);
      })
      const ttp = this.trajTimePts;
      const durTot = ttp[ttp.length - 1].time - ttp[0].time;
      const times = this.trajTimePts.map(ttp => ttp.time);
      const durArray = times.slice(1).map((x, i) => (x - times[i]) / durTot);
      let articulations: { [key: string]: Articulation };
      const tsp = this.$refs.trajSelectPanel as TSPType;
      if (tsp.vocal || tsp.sarangi || tsp.pluckBool === false) {
        articulations = {};
      } else {
        articulations = { '0.00': new Articulation({ 
          name: 'pluck',
          stroke: 'd',
          strokeNickname: 'da' 
        }) }
      }
      if (!tsp.vocal && tsp.dampen === true) {
        // if (!articulations) articulations = {};
        articulations['1.00'] = new Articulation({ name: 'dampen' })
      }
      const trajObj: {
        id: number,
        pitches: Pitch[],
        durTot: number,
        durArray: number[],
        articulations: { [key: string]: Articulation },
        vowel?: string,
        startConsonant?: string,
        endConsonant?: string,
        instrumentation?: Instrument
      } = {
        id: idx,
        pitches: pitches,
        durTot: durTot,
        durArray: durArray,
        articulations: articulations,
        vowel: tsp.vowel,
        startConsonant: tsp.startConsonant,
        endConsonant: tsp.endConsonant,
      };
      const pIdx = this.trajTimePts[0].pIdx;
      const tIdx = this.trajTimePts[0].tIdx;
      const track = this.trajTimePts[0].track;
      const phrase = this.piece.phraseGrid[track][pIdx];
      // console.log(track, tIdx, pIdx, phrase)
      if (this.piece.instrumentation) {
        trajObj.instrumentation = this.piece.instrumentation[track];
      }
      const newTraj = new Trajectory(trajObj);
      const trajs = phrase.trajectories;
      const silentTraj = phrase.trajectories[tIdx];
      const st = phrase.startTime! + silentTraj.startTime!
      const startsEqual = times[0] === st;
      const endsEqual = times[times.length - 1] === st + silentTraj.durTot;
      if (startsEqual && endsEqual) { // if replaces entire silent traj
        trajs[tIdx] = newTraj;
        phrase.reset();
      } else if (startsEqual) { // if replaces left side of silent traj
        silentTraj.durTot = silentTraj.durTot - durTot;
        trajs.splice(tIdx, 0, newTraj);
        phrase.reset();
      } else if (endsEqual) { // if replaces right side of silent traj
        silentTraj.durTot = silentTraj.durTot - durTot;
        phrase.trajectories.splice(tIdx + 1, 0, newTraj);
        phrase.reset();
      } else { // if replaces internal portion of silent traj
        const firstDur = times[0] - st;
        const lastDur = (st + silentTraj.durTot) - times[times.length - 1];
        silentTraj.durTot = firstDur;
        const lstObj: {
          id: number,
          pitches: Pitch[],
          durTot: number,
          fundID12: number,
          instrumentation?: Instrument
        } = {
          id: 12,
          pitches: [],
          durTot: lastDur,
          fundID12: this.piece.raga.fundamental
        };
        lstObj.instrumentation = this.piece.instrumentation[track];
        const lastSilentTraj = new Trajectory(lstObj);
        phrase.trajectories.splice(tIdx + 1, 0, newTraj);
        phrase.trajectories.splice(tIdx + 2, 0, lastSilentTraj);
        phrase.reset();
      }
      
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      if (this.selectedMode === EditorMode.Trajectory) {
        tLayer.resetTrajRenderStatus([newTraj.uniqueId!]);
      } else {
        tLayer.resetTrajRenderStatus();
      }
      tLayer.renderTraj(newTraj);
      tLayer.refreshSargam(newTraj.uniqueId!);
      const inst = this.piece.instrumentation[track];
      if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
        tLayer.refreshVowel(newTraj.uniqueId!);
        tLayer.refreshEndingConsonant(newTraj.uniqueId!);
      }
      if (this.selectedMode === EditorMode.Trajectory) {
        this.selectedMode = EditorMode.None
        this.trajTimePts = [];
        tLayer.refreshDragDots();
        this.$nextTick(() => {
          tLayer.selectTraj(newTraj.uniqueId!);
        })
        if (tLayer.selectedTraj === undefined) {
          throw new Error('Selected trajectory not found')
        }
        const altId = tLayer.selectedTraj.id >= 12 ? 
                      tLayer.selectedTraj.id - 1: 
                      tLayer.selectedTraj.id; 
        tsp.selectedIdx = tsp.trajIdxs.indexOf(altId);
        tsp.parentSelected = true;
        tsp.slope = Math.log2(tLayer.selectedTraj.slope);
        if (tLayer.selectedTraj.vibObj) {
          tsp.extent = tLayer.selectedTraj.vibObj.extent;
          tsp.initUp = tLayer.selectedTraj.vibObj.initUp;
          tsp.periods = tLayer.selectedTraj.vibObj.periods;
          tsp.offset = tLayer.selectedTraj.vibObj.vertOffset;
        }
        const selT = tLayer.selectedTraj;
        const c1 = tLayer.selectedTraj.articulations[0];
        const c2 = tLayer.selectedTraj.articulations['0.00'];
        const c3 = c1 && selT.articulations[0].name === 'pluck';
        const c4 = c2 && selT.articulations['0.00'].name === 'pluck';
        if (c3 || c4) {
          tsp.pluckBool = true
        } else {
          if (tsp.pluckBool) {
            tsp.pluckBool = false
          }
        }
      } else if (this.selectedMode === EditorMode.Series) {
        tLayer.trajTimePts.shift();
        this.trajTimePts.shift();
        this.trajTimePts[0].logFreq = this.heldLogFreq!;
        const tIdx = phrase.trajIdxFromTime(this.trajTimePts[0].time);
        if (tIdx === undefined) {
          throw new Error('Trajectory index not found')
        }
        this.trajTimePts[0].tIdx = tIdx;
        tLayer.refreshTimePts();
        this.heldLogFreq = undefined;
      }
      if (!this.audioDBDoc) this.extendDurTot();
    },

    pluckBoolEmit(pluckBool: boolean) {
      this.unsavedChanges = true;
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      const selT = tLayer.selectedTraj!;
      const c1 = selT.articulations[0] || selT.articulations['0.00'];
      if (pluckBool) {
        if (!c1) {
          selT.articulations['0.00'] = new Articulation({
            name: 'pluck',
            stroke: 'd',
            strokeNickname: 'da'
          });
        }
      } else {
        if (c1) {
          delete selT.articulations[0];
          delete selT.articulations['0.00']
        }
      }
      tLayer.refreshTraj(selT);
    },

    mutateTrajEmit(newIdx: number) {
      const renderer = this.$refs.renderer as RendererType;
      const tLayer = renderer.transcriptionLayer as TLayerType;
      tLayer.mutateTraj(newIdx);
    },

    setCurrentTime(newTime: number) {
      this.currentTime = newTime;
    },

    beforeUnload(event: BeforeUnloadEvent) {
      if (this.unsavedChanges) {
        const txt = 'You have unsaved changes. Are you sure you want to leave ' +
                    'the transcription editor?'
        event.returnValue = txt;
        return txt;
      } else {
        return undefined;
      }
    },

    toggleMelograph() {
      const melographLines = d3SelectAll('.melograph');
      this.$nextTick(() => {
        if (this.melographVisible) {
          melographLines.attr('opacity', 1);
        } else {
          melographLines.attr('opacity', 0);
        }
      })
      
    },

    toggleInstructions() {
      const routeData = this.router.resolve({ name: 'Editor Instructions' });
      window.open(routeData.href, '_blank');
    },

    extendDurTot(dur=10) {
      // if no audio (!this.audioDBDoc), call this after each new traj is added,
      // if necessary, extend audio such that it is dur beyond end of last traj.
      const allTrajs = this.piece.phrases
                        .map(p => p.trajectories)
                        .flat()
                        .filter(t => t.id !== 12);
      const lastTraj = allTrajs[allTrajs.length - 1];
      const allSilences = this.piece.phrases
                        .map(p => p.trajectories)
                        .flat()
                        .filter(t => t.id === 12);
      const lastSilence = allSilences[allSilences.length - 1];
      const lastPhrase = this.piece.phrases[this.piece.phrases.length - 1];
      const phraseStart = this.piece.phrases[lastTraj.phraseIdx!].startTime!;
      const lastTrajEnd = phraseStart + lastTraj.startTime! + lastTraj.durTot;
      if (lastTrajEnd > this.piece.durTot! - dur) {
        // if silence after lastTraj, extend it
        const samePhrase = lastSilence.phraseIdx === lastTraj.phraseIdx;
        const c1 = samePhrase && lastSilence.num! > lastTraj.num!;
        const c2 = lastSilence.phraseIdx! > lastTraj.phraseIdx!;
        const extraTime = lastTrajEnd + dur - this.piece.durTot!;
        if (c1 || c2) {
          lastSilence.durTot += extraTime;
          lastPhrase.reset();
        } else {
          const ntObj: {
            id: number,
            pitches: Pitch[],
            durTot: number,
            fundID12: number,
            instrumentation?: Instrument
          } = {
            id: 12,
            pitches: [],
            durTot: extraTime,
            fundID12: this.piece.raga.fundamental
          };
          if (this.piece.instrumentation) {
            ntObj.instrumentation = this.piece.instrumentation[0];
          }
          const newTraj = new Trajectory(ntObj);
          lastPhrase.trajectories.push(newTraj);
          lastPhrase.reset();
        }
        this.piece.durTotFromPhrases();
        this.durTot = this.piece.durTot!;
      }
    },

    cleanPhrases() {
      // if a phrase is shorter than some very small number, delete it.
      this.piece.phraseGrid.forEach((phrases, track) => {
        const realPhrases = phrases.filter(phrase => {
          return phrase.durTot! > 0.0000001
        });
        this.piece.phraseGrid[track] = realPhrases;
      })
      this.piece.durTotFromPhrases();
      this.piece.durArrayFromPhrases();
      this.piece.updateStartTimes();
      this.removeAccidentalSilentTrajs()
    },

    resizeHeight(controlsOpenOverride = undefined) {
      // console.log('this is still running?')
      const ap = this.$refs.audioPlayer as APType;
      let controlsOpen = ap.showControls || ap.showDownloads || ap.showTuning;
      if (controlsOpenOverride !== undefined) {
        controlsOpen = controlsOpenOverride;
      }
      const controlsHeight = controlsOpen ? ap.controlsHeight : 0;
      const less = this.navHeight + controlsHeight + this.playerHeight + 1;
      this.editorHeight = window.innerHeight - less;
    },

    cleanEmptyTrajs(phrase: Phrase) {
      phrase.trajectories.forEach((traj, i) => {
        if (traj.durTot === 0) {
          phrase.trajectories.splice(i, 1);
          phrase.durArray!.splice(i, 1);
          phrase.trajectories.slice(i).forEach(_traj => {
            const oldTIdx = _traj.num!;
            const newTIdx = _traj.num! - 1;
            _traj.num = newTIdx;
            const oldId = `p${phrase.pieceIdx}t${oldTIdx}`;
            const newId = `p${phrase.pieceIdx}t${newTIdx}`;
            d3Select(`#${oldId}`).attr('id', newId);
            d3Select(`#overlay__${oldId}`).attr('id', `overlay__${newId}`);
            d3Select(`#articulations__${oldId}`)
              .attr('id', `articulations__${newId}`);
            let hOffCt = 0;
            let hOnCt = 0;
            let slideCt = 0;
            Object.keys(_traj.articulations).forEach(key => {
              const art = _traj.articulations[key];
              if (art.name === 'pluck') {
                d3Select(`#pluck${oldId}`).attr('id', `pluck${newId}`);
              } else if (art.name === 'hammer-off') {
                d3Select(`#hammeroff${oldId}i${hOffCt}`)
                  .attr('id', `hammeroff${newId}i${hOffCt}`);
                hOffCt++;
              } else if (art.name === 'hammer-on') {
                d3Select(`#hammeron${oldId}i${hOnCt}`)
                  .attr('id', `hammeron${newId}i${hOnCt}`);
                hOnCt++;
              } else if (art.name === 'slide') {
                d3Select(`#slide${oldId}i${slideCt}`)
                  .attr('id', `slide${newId}i${slideCt}`);
                slideCt++;
              }
            })
          })
        }
      })
    },

    newDurArrayA(traj: Trajectory, delta: number) {
      const initPortionA = traj.durArray![0] * traj.durTot;
      const newDur = traj.durTot - delta;
      const newPropA = (initPortionA - delta) / newDur;
      let newDurArray = traj.durArray!.map((i => i * traj.durTot / newDur));
      newDurArray[0] = newPropA;
      return newDurArray
    },

    newDurArrayZ(traj: Trajectory, delta: number) {
      const initPartZ = traj.durArray![traj.durArray!.length-1] * traj.durTot;
      const newDur = traj.durTot + delta;
      const newPropZ = (initPartZ + delta) / newDur;
      let newDurArray = traj.durArray!.map((i => i * traj.durTot / newDur));
      newDurArray[newDurArray.length - 1] = newPropZ;
      return newDurArray;
    },

    fixTrajectory(traj: Trajectory) {
      // so that articulations are in the right place according to new durArray;
      if (!this.vocal) {
        const trajObj: {
          id?: number;
          num?: number;
          durArray?: number[];
          durTot?: number;
          articulations?: { [key: string]: Articulation };
        } = traj.toJSON();
        const c1 = traj.articulations[0] || traj.articulations['0.00'];
        const c2 = traj.articulations['1.00'];
        let pluckExists = false;
        if (c1) {
          if (traj.articulations[0]) {
            pluckExists = traj.articulations[0].name === 'pluck';
          } else {
            pluckExists = traj.articulations['0.00'].name === 'pluck';
          }
        }   
        const dampenExists = c2 && traj.articulations['1.00'].name === 'dampen';
        trajObj.articulations = undefined;
        const newTraj = new Trajectory(trajObj);
        if (!pluckExists) {
          delete newTraj.articulations[0];
          delete newTraj.articulations['0.00']
        }
        if (dampenExists) newTraj.articulations['1.00'] = new Articulation({
          name: 'dampen',
        })
        return newTraj
      } else {
        return traj
      }
      
    },

    calculateNewDurArray(
        phrase: Phrase, 
        traj: Trajectory, 
        idx: number, 
        time: number
        ) {
      let times = [0, ...traj.durArray!.map(cumsum())];
      const st = phrase.startTime! + traj.startTime!;
      times = times.map(a => a * traj.durTot + st);
      const newTimes = times.slice();
      newTimes[idx] = time;
      let durArray = newTimes.slice(1).map((v, i) => v - newTimes[i]);
      const daSum = durArray.reduce((a, b) => a + b, 0)
      durArray = durArray.map(i => i / daSum)
      return durArray
    },

    selectMeter(id: string | undefined, turnMMOn = false, pulseId = true) { 
      if (id === undefined) {
        this.selMeter = undefined;
        return
      }
      const allPulses: Pulse[] = [];
      this.piece.meters.forEach(meter => {
        allPulses.push(...meter.allPulses)
      });
      const pulse = allPulses.find(pulse => pulse.uniqueId === id)!;
      const meter = this.piece.meters.find(meter => {
        return meter.uniqueId === pulse.meterId
      })!;
      this.selMeter = meter;
    },

    async removeMeter(meter: Meter) { // the specific graph
      const meterIdx = this.piece.meters.indexOf(meter);
      if (meterIdx !== -1) {
        this.piece.meters.splice(meterIdx, 1);
      }
      d3SelectAll('.metricGrid.meterId' + meter.uniqueId).remove();
      this.selectedMode = EditorMode.None;
      this.unsavedChanges = true;
    },
    
    possibleTrajDivs(pIdx?: number) {
      if (pIdx !== undefined) {
        // returns times on left and right of phrase div (so, current phrase 
        // and next phrase)
        const phraseA = this.piece.phrases[pIdx];
        const phraseB = this.piece.phrases[pIdx+1];
        // get all trajs except first one, and collect all start times
        const stA = phraseA.startTime!;
        const stB = phraseB.startTime!;
        const divs = phraseA.trajectories.slice(1).map(t => stA + t.startTime!);
        divs.push(...phraseB.trajectories.map(t => stB + t.startTime!));
        return divs
      } else {
        const divs: number[] = [];
        this.piece.phrases.forEach(phrase => {
          const st = phrase.startTime!;
          divs.push(...phrase.trajectories.slice(1).map(t => st + t.startTime!))
        });
        return divs
      }
    },
    
    mouseUpUpdateLoop() {
      const ap = this.$refs.audioPlayer as APType;
      if (this.loop) {
        ap.loop = true;
        ap.loopStart = this.regionStartTime;
        ap.loopEnd = this.regionEndTime;
        if (ap.sourceNode) {
          if (this.regionStartTime === undefined || this.regionEndTime === undefined) {
            throw new Error('region start or end time is undefined')
          }
          ap.sourceNode.loopStart = this.regionStartTime;
          ap.sourceNode.loopEnd = this.regionEndTime;
        }
      } else {
        ap.loop = false;
        ap.loopStart = undefined;
        ap.loopEnd = undefined;
      }
      // also, update stretchBuffer
    },

    updateLoop(e?: MouseEvent) {
      if (e && e.clientX === 0) e.preventDefault(); // stops spacebar from 
      // checking box
    },

    preventSpaceToggle(e: MouseEvent) {
      if (e && e.clientX === 0) e.preventDefault();
    },
 
    async savePiece() {
      this.piece.phrases.forEach(phrase => {
        phrase.consolidateSilentTrajs()
      });
      this.piece.meters.forEach(meter => {
        meter.resetTempo();
      })
      this.cleanPhrases();
      this.piece.sectionStarts = [...new Set(this.piece.sectionStarts)]
      const result = await savePiece(this.piece);
      this.dateModified = new Date(result.dateModified);
      this.unsavedChanges = false;
    },

    handleKeyup(e: KeyboardEvent) {
      if (e.key === 'Shift') this.shifted = false;
      if (e.key === 'Meta' && this.browser.os!.includes('Mac OS')) {
        this.metad = false
      }
      if (e.key === 'Control' && this.browser.os!.includes('Windows')) {
        this.metad = false
      }
    },

    handleKeydown(e: KeyboardEvent) {
      if (this.selectedMode === EditorMode.Trajectory || this.selectedTraj) {
        const tsp = this.$refs.trajSelectPanel as TSPType;
        const keyNums = tsp.kNumsFiltered;
        if (keyNums.includes(e.key)) {
          tsp.selectIcon(keyNums.indexOf(e.key))
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        const ap = this.$refs.audioPlayer as APType;
        ap.togglePlay()
      }
    },

    async getPieceFromJson(piece: Piece) {
      // if (fundamental) piece.raga.fundamental = fundamental;
      const rsRes = await getRaagRule(piece.raga.name);
      piece.raga.ruleSet = rsRes.rules;
      piece.raga = new Raga(piece.raga);
      if (piece.phraseGrid === undefined) {
        piece.phraseGrid = [piece.phrases];
        while (piece.phraseGrid.length < piece.instrumentation.length) {
          piece.phraseGrid.push([]);
        }
      }
      piece.phraseGrid.forEach((phrases, instIdx) => {
        phrases.forEach(phrase => {
          let pt = phrase.trajectoryGrid ?
                  phrase.trajectoryGrid[0] : 
                  phrase.trajectories;
          pt.forEach(traj => {
            traj.pitches = traj.pitches.map(pitch => {
              pitch.fundamental = piece.raga.fundamental;
              // convert to pitch ratio format
              pitch.ratios = piece.raga.stratifiedRatios;
              return new Pitch(pitch)
            });
            const artKeys = Object.keys(traj.articulations);
            const artEntries = artKeys.map(key => traj.articulations[key]);
            const artObj: { [key: string]: Articulation } = {};
            artKeys.forEach((key, i) => {
              if (artEntries[i] === null) {
                return
              }
              artObj[key] = new Articulation(artEntries[i]);
            });
            traj.articulations = artObj;
            if (traj.id === 12 && traj.fundID12 !== piece.raga.fundamental) {
              traj.fundID12 = piece.raga.fundamental
            }
            if (traj.id === 12 && Object.keys(traj.articulations).length > 0) {
              traj.articulations = {};
            }
            if (piece.instrumentation) {
              traj.instrumentation = piece.instrumentation[instIdx];
            }
            const vox = ['Vocal (M)', 'Vocal (F)'];
            if (vox.includes(traj.instrumentation)) {
              if (traj.vowel === undefined && traj.id !== 12) {
                traj.vowel = 'a';
              }
            }
          });
          if (phrase.trajectoryGrid === undefined) {
            phrase.trajectoryGrid = [];
          }
          phrase.trajectoryGrid[0] = pt.map(traj => {
            return new Trajectory(traj)
          });
          if (phrase.groupsGrid !== undefined) {
            phrase.groupsGrid.forEach((groups, ggIdx) => {
              groups.forEach((group, gIdx) => {
                group.trajectories.forEach((traj, idx) => {
                  const tIdx = traj.num!;
                  const realTraj = phrase.trajectoryGrid[0][tIdx];
                  group.trajectories[idx] = realTraj;
                })
                groups[gIdx] = new Group(group)
              })
            })
          }
          const chikariKeys = Object.keys(phrase.chikaris);
          const chikariEntries = chikariKeys.map(key => phrase.chikaris[key]);
          const chikariObj: { [key: string]: Chikari } = {};
          chikariKeys.forEach((key, i) => {
            // console.log(chikariEntries[i])
            const entry = chikariEntries[i];
            entry.fundamental = piece.raga.fundamental;
            entry.pitches = entry.pitches.map(p => {
              p.fundamental = piece.raga.fundamental;
              p.ratios = piece.raga.stratifiedRatios;
              return new Pitch(p)
            })
            // console.log(entry)
            chikariObj[key] = new Chikari(entry)
          })
          phrase.chikaris = chikariObj;
          if (piece.instrumentation) {
            phrase.instrumentation = piece.instrumentation;
          }
        });
      });
      if (piece.phraseGrid !== undefined) {
        // piece.phraseGrid.forEach((phrases) => {
        //   phrases = phrases.map(phrase => new Phrase(phrase));
        // })
        piece.phraseGrid = piece.phraseGrid.map(phrases => {
          return phrases.map(phrase => new Phrase(phrase))
        })
      } else {
        piece.phrases = piece.phrases.map(phrase => new Phrase(phrase));
      }
      if (piece.meters) {
        piece.meters = piece.meters.map(meter => new Meter(meter))
      }
      this.piece = new Piece(piece);
      this.dateModified = new Date(this.piece.dateModified);
      this.fixTrajs();
      this.piece.phraseGrid.forEach((phrases, instIdx) => {
        phrases.forEach(phrase => {
          phrase.consolidateSilentTrajs()
        })
      })
      this.piece.durArrayFromPhrases();
      if (this.piece.durTot !== this.durTot) {
        this.piece.setDurTot(this.durTot)
      }
      // this.piece.sectionStarts = [...new Set(this.piece.sectionStarts)];
      this.piece.sectionStartsGrid = this.piece.sectionStartsGrid.map((arr, i) => {
        return [...new Set(arr)]
      })
    },

    fixTrajs() {
      // why are they getting named articulation slide ?
      this.piece.phrases.forEach(phrase => {
        phrase.trajectories.forEach((traj) => {
          const arts = traj.articulations;
          const c1 = arts[0] && arts[0].name === 'slide';
          const c2 = arts['0.00'] && arts['0.00'].name === 'slide';
          if (c1 || c2) {
            traj.articulations['0.00'].name = 'pluck'
          }
        })
      })
    },

    resize() {
      console.log('resized')
      const diff = Math.abs(this.oldHeight! - window.innerHeight);
      if (diff > 53) {
        console.log('changed real height')
        this.resizeHeight();
      }
      this.oldHeight = window.innerHeight;
      this.fullWidth = window.innerWidth;
    },

    phraseIdxFromTime(time: number, rounded=false) {
      if (rounded) time = Math.round(time * 1000) / 1000;
      const filtered = this.piece.phrases.filter(phrase => {
        let st = phrase.startTime!;
        let et = st + phrase.durTot!;
        if (rounded) {
          st = Math.round(st * 1000) / 1000;
          et = Math.round(et * 1000) / 1000;
        }
        const a = time >= st;
        const b = time < et;
        return a && b
      });
      return filtered[0].pieceIdx
    },

    trajIdxFromTime(phrase: Phrase, time: number) {
      let phraseTime = time - phrase.startTime!;
      const trajs = phrase.trajectories.filter(traj => {
        const a = phraseTime >= traj.startTime!;
        const b = phraseTime < traj.startTime! + traj.durTot;
        return a && b
      })
      if (trajs.length === 0) {
        console.log(trajs, phrase, time)
      }
      return trajs[0].num
    },

    moveToPhrase(pIdx: number) {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.moveToPhrase(this.editingInstIdx, pIdx);
    },

    moveToSection(sIdx: number) {
      const pIdx = this.piece.sectionStartsGrid[this.editingInstIdx][sIdx];
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.moveToPhrase(this.editingInstIdx, pIdx);
    },

    groupSelectedTrajs() {
      if (this.selectedTrajsGroupable()) {
        const pIdx = this.selectedTrajs[0].phraseIdx!;
        const track = this.editingInstIdx;
        const phrase = this.piece.phraseGrid[track][pIdx];
        const group = new Group({ trajectories: this.selectedTrajs });
        phrase.getGroups(0).push(group);
        this.unsavedChanges = true;
      } else {
        throw new Error('Cannot group selected trajectories');
      }
    },

    ungroupSelectedTrajs() {
      if (this.selectedTrajsConstituteAGroup()) {
        const groupId = this.selectedTrajs[0].groupId;
        this.selectedTrajs.forEach(traj => {
          traj.groupId = undefined
        });
        const pIdx = this.selectedTrajs[0].phraseIdx;
        const phrase = this.piece.phrases[Number(pIdx)];
        const groups = phrase.getGroups(0);
        // remove group from groups
        const idx = groups.findIndex(group => group.id === groupId);
        groups.splice(idx, 1);
        this.unsavedChanges = true;

      } else {
        throw new Error('Cannot ungroup selected trajectories');
      }
    },

    selectedTrajsConstituteAGroup() {
      const track = this.editingInstIdx;
      const phrases = this.piece.phraseGrid[track];
      const phrase = phrases[this.selectedTrajs[0]!.phraseIdx!];
      const id = this.selectedTrajs[0].groupId!;
      const group = phrase.getGroupFromId(id)!;
      if (group === undefined) return false;
      const c1 = group.trajectories.length === this.selectedTrajs.length;
      const c2 = this.selectedTrajs.every(traj => traj.groupId === id);
      return c1 && c2
    },

    updatePluckNickname(traj: Trajectory, n: StrokeNicknameType) {
      const dNames = ['da', 'd', 'di'];
      const rNames = ['ra', 'r', 'ri'];
      if (dNames.includes(n)) {
        traj.articulations['0.00'].stroke = 'd';
        
      } else if (rNames.includes(n)) {
        traj.articulations['0.00'].stroke = 'r';
      }
      traj.articulations['0.00'].strokeNickname = n;
      this.unsavedChanges = true;
    },

    alterSlope(newSlope: number) {
      this.unsavedChanges = true;
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.selectedTraj!.slope = newSlope;
      tLayer.refreshTraj(tLayer.selectedTraj!);
    },

    selectedTrajsGroupable() {// tests whether all trajs in this.selectedTrajs
      // are adjacent to one another and part of the same phrase
      const uniquePIdxs = [...new Set(this.selectedTrajs.map(t => t.phraseIdx))]
      if (uniquePIdxs.length === 1) {
        // sort by num
        this.selectedTrajs.sort((a, b) => a.num! - b.num!);
        const nums = this.selectedTrajs.map(traj => traj.num!);
        const diffs = nums.slice(1).map((num, nIdx) => {
          return num - nums[nIdx];
        })
        const c1 = diffs.every(diff => diff === 1);
        const c2 = this.selectedTrajs.every(traj => {
          return traj.groupId === this.selectedTrajs[0].groupId
        });
        return c1 && c2
      } else {
        return false
      }
    },

    updateSargamLines() {
      this.throttledRefreshSargamLines!();
    },

    refreshSargamLines() {
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.refreshSargamLines();
      const yAxis = r.yAxis as YAxisType;
      yAxis.resetAxis();
    },

    resetAudio(e: MouseEvent) {

      const eap = this.$refs.audioPlayer as APType;
      eap.shiftOn = false;
      eap.transposition = 0
      eap.resetAudio();
    },

    shiftTrajByOctave(traj: Trajectory, offset = 1) {
      // then remove the old trajectory and add the new one;
      traj.pitches.forEach(pitch => pitch.setOct(pitch.oct + offset));
      const r = this.$refs.renderer as RendererType;
      const tLayer = r.transcriptionLayer as TLayerType;
      tLayer.refreshTraj(traj);
    },

// apparently there's lots of bugs here, beware!
    removeAccidentalSilentTrajs() {
      // remove all silent trajs that are shorter than a very small threshold
      let ct = 0;
      this.piece.phraseGrid.forEach(phrases => {
        phrases.forEach((phrase, pIdx) => {
          phrase.trajectories.forEach((traj, tIdx) => {
            if (traj.id === 12 && traj.durTot < 0.01) {
              
              ct += 1
              if (tIdx === phrase.trajectories.length - 1) {
                // ones at the end of a phrase             
                const splicedTraj = phrase.trajectories.splice(tIdx, 1)[0];
                if (splicedTraj && phrase.trajectories[tIdx-1]) {
                  phrase.trajectories[tIdx-1].durTot += splicedTraj.durTot;
                }     
                phrase.durTotFromTrajectories();
                phrase.durArrayFromTrajectories();
              } else if (tIdx !== 0) {
                // ones in the middle of a phrase
                const splicedTraj = phrase.trajectories.splice(tIdx, 1)[0];
                phrase.trajectories[tIdx-1].durTot += splicedTraj.durTot;
                phrase.durTotFromTrajectories();
                phrase.durArrayFromTrajectories();
                phrase.assignStartTimes();
                phrase.assignTrajNums();
                
              } else {
                // ones at the beginning of a phrase
                const splicedTraj = phrase.trajectories.splice(tIdx, 1)[0];
                phrase.trajectories[tIdx].durTot += splicedTraj.durTot;
                phrase.durTotFromTrajectories();
                phrase.durArrayFromTrajectories();
                phrase.assignStartTimes();
                phrase.assignTrajNums();
              }
            }
          })
        });
      });
      console.log(`removed ${ct} silent trajs`)
    },
  }
})
</script>

<style scoped>



.graph {
  width: calc(100% - 1px);
  height: calc(100% - v-bind(scrollXHeight + 'px'));
  border-right: 1px solid black;
}

.graphContainer {
  width: calc(100% - v-bind(controlBoxWidth + scrollYWidth + 2 + 'px'));
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative
}

#renderer {
  width: calc(100% - v-bind(controlBoxWidth + 'px'));
  height: 100%;
  position: relative;
}

.scrollYContainer {
  width: v-bind(scrollYWidth+'px');
  background-color: white;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  height: calc(100% - 1px);
  display: flex;
  flex-direction: column;
}

.topNotch {
  width: v-bind(scrollYWidth+'px');
  min-width: v-bind(scrollYWidth+'px');
  height: v-bind(xAxHeight - 0.5 +'px');
  min-height: v-bind(xAxHeight - 0.5 +'px');
  border-bottom: 1px solid black;
  background-color: grey;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.topNotchZoomer {
  width: v-bind(scrollYWidth+'px');
  min-width: v-bind(scrollYWidth+'px');
  height: v-bind((xAxHeight - 1.5)/2 +'px');
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: v-bind(scrollDragColor)
}

.topNotchZoomer:hover {
  background-color: v-bind(scrollDragColorHover);
  cursor: pointer;
}

.topNotchZoomer.top {
  border-bottom: 1px solid black;
}

.scrollY {
  width: 100%;
  height: v-bind(scrollYHeight-1.5 + 'px');
}

.bottomNotch {
  width: 100%;
  height: v-bind(scrollXHeight - 1 + 'px');
  min-height: v-bind(scrollXHeight - 1 + 'px');
  border-top: 1px solid black;
  background-color: grey;
}

.scrollXContainer {
  height: v-bind(scrollXHeight - 1 + 'px');
  min-height: v-bind(scrollXHeight - 1 + 'px');
  width: calc(100% - 1px);
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  background-color: white;
  display: flex;
  flex-direction: row;
}

.scrollX {
  width: 100%;
  height: 100%;
}

.controlBox {
  width: v-bind(controlBoxWidth+'px');
  height: calc(100% - 1px);
  border-bottom: 1px solid black;
  background-color: #202621;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  color: white;
}

.scrollingControlBox {
  width: v-bind(controlBoxWidth+'px');
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  color: white;
  background-color: #202621;
  position: relative;
  overflow-y: scroll;
  scrollbar-width: none;
}

.scrollingControlBox::-webkit-scrollbar {
  display: none
}

.mainzz {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 31px);
  background-color: black;
}

.upperRow {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: v-bind(editorHeight+'px');
}

.lower {
  width: 100%;
  height: 150px;
  background-color: black;
}

button {
  cursor: pointer;
  background-color: v-bind(scrollDragColor);
  border-radius: 5px;
  border: 0px;
}

button:hover {
  background-color: v-bind(scrollDragColorHover);
}
.savedDate {
  font-size: 13px;
  width: 150px;
  text-align: right;
  padding: 0px;
  padding-top: 10px;
}

.cbRow {
  height: 26px;
  min-height: 26px;
  width: v-bind(controlBoxWidth - 10 +'px');
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: right;
  margin-right: 10px;
}

.cbRow > label {
  width: 130px;
  text-align: right;
  margin-right: 5px;
}

.cbRow > input:hover {
  cursor: pointer;
}

.cbRow > button {
  margin-left: 5px;
}

.cbRow > span {
  padding: 0px;
}

.visibilityToggle > label {
  width: auto;
  margin-left: 5px;
}


.noSelect {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none
}

.noSelect>* {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none
}

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.filler {
  width: 100%;
  height: 100%;
}

.hidden {
  opacity: 0 !important;
}

.buttonRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}

input[type='checkbox'] {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.instructionsIcon {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 5px;
  left: 5px;
  border: 1px solid white;
  border-radius: 50%;
  cursor: pointer;
}

.instructionsIcon:hover {
  background-color: #2C342D;
}

.instructions {
  position: absolute;
  top: 0px;
  left: 0px;
  width: calc(100% + v-bind(scrollYWidth - 40 + "px"));
  height: v-bind(editorHeight - 40 +'px');
  background-color: #2C342D;
  color: white;
  text-align: left;
  padding: 20px;
  overflow-y: scroll;
  display: flex;
  justify-content: center;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.2;
}


.lineBreak {
  border-top: 1px solid black;
  width: 120px;
  height: 0px;
}

.lineBreakParent {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: right;
  width: 100%;
  height: 1px;
  box-sizing: border-box;
  padding-top: 4px;
  padding-right: 10px;
  padding-bottom: 3px;
}


</style>
