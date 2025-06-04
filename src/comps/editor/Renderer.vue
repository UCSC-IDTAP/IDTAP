<template>
  <div class='renderMain' ref='renderMain' :style='cssVars'>
    <div class='topRow'>
      <ModeSelector 
        class='modeSelector'
        :height='modeSelectorHeight'
        :selectedMode='selectedMode'
        :enum='availableModes'
        :noneEnumItem='editorMode.None'
        :tooltipTexts='editorModeTexts'
        @update:selectedMode='$emit("update:selectedMode", $event)'
        @showTooltip='$emit("showTooltip", $event)'
        @hideTooltip='$emit("hideTooltip")'
        />
      <ModeSelector
        class='modeSelector'
        :height='modeSelectorHeight'
        :selectedMode='editingInstIdx'
        :enum='instTracksEnum'
        :noneEnumItem='-1'
        :tooltipTexts='instTrackTexts'
        @update:selectedMode='$emit("update:editingInstIdx", $event)'
        @showTooltip='handleShowTooltip'
        @hideTooltip='$emit("hideTooltip")'
        @contextmenu='handleContextMenuClick'
      />
    </div>
    <div class='wrapper'>
      <div class='xAxisContainer' ref='xAxisContainer'>
        <XAxis
          v-if='xScale !== null'
          :scaledWidth='scaledWidth'
          :height='xAxHeight'
          :scale='xScale'
          :axisColor='axisColor'
          :piece='piece'
          :instIdx='editingInstIdx'
          :showPhrases='showPhrases'
          :instTracks='instTracks'
          @update:region='updateRegion'
          ref='xAxis'/>
      </div>
      <div class='yAxisContainer' ref='yAxisContainer'>
        <YAxis
          v-if='yScale !== null'
          :scaledHeight='scaledHeight'
          :width='yAxWidth'
          :scale='yScale'
          :raga='piece.raga'
          :highOctOffset='highOctOffset'
          :lowOctOffset='lowOctOffset'
          :axisColor='axisColor'
          :scaleSystem='scaleSystem'
          ref='yAxis'/>
      </div>
      <div class='verticalZoomControls'>
        <div @click='zoomInY' class='zoomIn'>+</div>
        <div @click='zoomOutY' class='zoomOut'>-</div>
      </div>
      <div class='horizontalZoomControls'>
        <div @click='zoomOutX' class='zoomOut'>-</div>
        <div @click='zoomInX' class='zoomIn'>+</div>
      </div>
      <div 
        class='scrollingContainer' 
        ref='scrollingContainer'
        @wheel='onWheel'
        @touchmove='onTouchMove'
        >
        <div class='layersContainer' ref='layersContainer'>
          <div class='backgroundLayer'></div>
          <SpectrogramLayer
            v-if='piece.audioID !== undefined'
            :width='scaledWidth'
            :height='scaledHeight'
            :showSpectrogram='showSpectrogram'
            ref='spectrogramLayer'
            />
          <MelographLayer
            v-if='yScale !== null && xScale !== null && piece.audioID !== undefined'
            :width='scaledWidth'
            :height='scaledHeight'
            :showMelograph='showMelograph'
            :color='melographColor'
            :audioID='piece.audioID!'
            :xScale='xScale'
            :yScale='yScale'
            :excerptRange='piece.excerptRange'
            ref='melographLayer'
            />
            <TranscriptionLayer
              ref='transcriptionLayer'
              v-if='
                yScale !== null && 
                xScale !== null && 
                scrollingContainer !== null
                '
              :width='scaledWidth'
              :height='scaledHeight'
              :showTranscription='showTranscription'
              :xScale='xScale'
              :yScale='yScale'
              :lowOctOffset='lowOctOffset'
              :highOctOffset='highOctOffset'
              :piece='piece'
              :sargamLineColor='sargamLineColor'
              :minDrawDur='minDrawDur'
              :scrollX='scrollX'
              :clientWidth='clientWidth'
              :showSargam='showSargam'
              :showSargamLines='showSargamLines'
              :showPhonemes='showPhonemes'
              :phonemeRepresentation='phonemeRepresentation'
              :sargamRepresentation='sargamRepresentation'
              :instTracks='instTracks'
              :selectedMode='selectedMode'
              :showPhraseDivs='showPhraseDivs'
              :editable='editable'
              :sargamMagnetMode='sargamMagnetMode'
              :scrollingContainer='scrollingContainer'
              :editingInstIdx='editingInstIdx'
              :meterMagnetMode='meterMagnetMode'
              :currentTime='currentTime'
              :displayRange='displayRange'
              :playing='playing'
              :browser='browser'
              :maxMetricLayer='maxMetricLayer'
              :showMeter='showMeter'
              :meterColor='meterColor'
              :selectedMeterColor='selectedMeterColor'
              :playheadColor='playheadColor'
              :showBols='showBols'
              :loop='loop'
              :stretchedFactor='stretchedFactor'
              :hasRecording='hasRecording'
              :highlightTrajs='highlightTrajs'
              :playheadAnimation='playheadAnimation'
              :preZoomPlayheadPxl='preZoomPlayheadPxl'
              :preZoomMiddleTime='preZoomMiddleTime'
              :editableCols='editableCols'
              :audioPlayerRef='audioPlayerRef'
              @update:slope='$emit("update:slope", $event)'
              @update:prevMeter='$emit("update:prevMeter", $event)'
              @update:selectedMode='$emit("update:selectedMode", $event)'
              @unsavedChanges='$emit("unsavedChanges", $event)'
              @update:TrajSelStatus='$emit("update:TrajSelStatus", $event)'
              @update:selPhraseDivUid='$emit("update:selPhraseDivUid", $event)'
              @moveToX='moveToX'
              @horizontalMoveGraph='horizontalMoveGraph'
              @update:editingInstIdx='$emit("update:editingInstIdx", $event)'
              @update:trajTimePts='$emit("update:trajTimePts", $event)'
              @update:currentTime='$emit("update:currentTime", $event)'
              @update:insertPulses='$emit("update:insertPulses", $event)'
              @open:labelEditor='$emit("open:labelEditor", $event)'
              @verticalMoveGraph='verticalMoveGraph'
              @update:apStretchable='$emit("update:apStretchable", $event)'
              @update:region='$emit("update:region")'
              @cancelRegionSpeed='$emit("cancelRegionSpeed")'
              @update:togglePluck='$emit("update:togglePluck")'
              @update:toggleDampen='$emit("update:toggleDampen")'
              @savePiece='$emit("savePiece")'
              @update:selectedMeter='$emit("update:selectedMeter", $event)'
              @deleteMeter='$emit("deleteMeter", $event)'
              @toggle:sargamMagnet='$emit("toggle:sargamMagnet")'
              @clearTSP='$emit("clearTSP")'
              @open:addToCollection='$emit("open:addToCollection")'
              @open:removeFromCollection='$emit("open:removeFromCollection")'
              @update:xAxisPhraseLabels='updateXAxisPhraseLabels'
              @clearRegionBorders='xAxis ? xAxis!.clearRegionBorders() : null'
              @update:regionStartPxl='xAxis ? xAxis!.setRegionStartPxl($event) : null'
              @update:regionEndPxl='xAxis ? xAxis!.setRegionEndPxl($event) : null'
              @selectAssemblagePhrase='$emit("selectAssemblagePhrase", $event)'
            />
          />
        </div>
      </div>
    </div>
    <ContextMenu
      :x='contextMenuX'
      :y='contextMenuY'
      :closed='contextMenuClosed'
      :choices='contextMenuChoices'
    />
    <EditInstrumentation 
      v-if='showEditInstrumentation'
      :transMetadata='(piece as TransMetadataType)'
      :unsavedChanges='unsavedChanges'
      @close='handleUpdateInstrumentation'
    />
  </div>
</template>

<script lang='ts'>
import { 
  defineComponent, 
  ref, 
  onMounted,
  onBeforeUnmount, 
  watch, 
  PropType,
  computed,
  nextTick
} from 'vue';
import { throttle } from 'lodash';

import SpectrogramLayer from '@/comps/editor/renderer/SpectrogramLayer.vue';
import XAxis from '@/comps/editor/renderer/XAxis.vue';
import YAxis from '@/comps/editor/renderer/YAxis.vue';
import MelographLayer from '@/comps/editor/renderer/MelographLayer.vue';
import TranscriptionLayer from '@/comps/editor/renderer/TranscriptionLayer.vue';
import ModeSelector from '@/comps/editor/renderer/ModeSelector.vue';
import { Piece, Trajectory } from '@model';
import * as d3 from 'd3';
import { 
  InstrumentTrackType, 
  ContextMenuOptionType,
  TransMetadataType,
  CollectionType,
  APType
} from '@shared/types';
import { 
  EditorMode, 
  Instrument, 
  PlayheadAnimations, 
  ScaleSystem,
  PhonemeRepresentation,
  SargamRepresentation,
} from '@shared/enums';
import { BrowserInfo } from 'detect-browser';
import ContextMenu from '@/comps/ContextMenu.vue';
import EditInstrumentation from '@/comps/EditInstrumentation.vue';
import { Meter } from '@/js/meter.ts';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Renderer',
  components: {
    SpectrogramLayer,
    MelographLayer,
    XAxis,
    YAxis,
    TranscriptionLayer,
    ModeSelector,
    ContextMenu,
    EditInstrumentation
  },
  props: {
    yAxWidth: {
      type: Number,
      required: true,
    },
    xAxHeight: {
      type: Number,
      required: true,
    },
    scaledWidth: {
      type: Number as PropType<number>,
      required: true,
      validator: (value: number) => Number.isInteger(value)
    },
    scaledHeight: {
      type: Number as PropType<number>,
      required: true,
      validator: (value: number) => Number.isInteger(value)
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    lowOctOffset: {
      type: Number,
      required: true
    },
    highOctOffset: {
      type: Number,
      required: true
    },
    showSpectrogram: {
      type: Boolean,
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
    showMelograph: {
      type: Boolean,
      required: true
    },
    melographColor: {
      type: String,
      required: true
    },
    showTranscription: {
      type: Boolean,
      required: true
    },
    sargamLineColor: {
      type: String,
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
    showPhonemes: {
      type: Boolean,
      required: true
    },
    phonemeRepresentation: {
      type: String as PropType<PhonemeRepresentation>,
      required: true
    },
    instTracks: {
      type: Array as PropType<InstrumentTrackType[]>,
      required: true
    },
    selectedMode: {
      type: String as PropType<EditorMode>,
      required: true
    },
    showPhraseDivs: {
      type: Boolean,
      required: true
    },
    editable: {
      type: Boolean,
      required: true
    },
    sargamMagnetMode: {
      type: Boolean,
      required: true
    },
    initViewDur: {
      type: Number,
      required: true
    },
    meterMagnetMode: {
      type: Boolean,
      required: true
    },
    editingInstIdx: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    playing: {
      type: Boolean,
      required: true
    },
    browser: {
      type: Object as PropType<BrowserInfo>,
      required: true
    },
    maxMetricLayer: {
      type: Number,
      required: true
    },
    showMeter: {
      type: Boolean,
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
    playheadColor: {
      type: String,
      required: true
    },
    showBols: {
      type: Boolean,
      required: true
    },
    navHeight: {
      type: Number,
      required: true
    },
    unsavedChanges: {
      type: Boolean,
      required: true
    },
    loop: {
      type: Boolean,
      required: true
    },
    stretchedFactor: {
      type: Number,
      required: true
    },
    hasRecording: {
      type: Boolean,
      required: true
    },
    highlightTrajs: {
      type: Boolean,
      required: true
    },
    playheadAnimation: {
      type: String as PropType<PlayheadAnimations>,
      required: true
    },
    queryTime: {
      type: Number,
      required: true
    },
    editableCols: {
      type: Object as PropType<CollectionType[]>,
      required: true
    },
    scaleSystem: {
      type: String as PropType<ScaleSystem>,
      required: true
    },
    audioPlayerRef: {
      type: Object as PropType<APType>,
      required: true
    },
    sargamRepresentation: {
      type: String as PropType<SargamRepresentation>,
      required: true
    },
    showPhrases: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'update:recomputeTrigger',
    'update:editingInstIdx',
    'showTooltip',
    'hideTooltip',
    'update:selectedMode',
    'unsavedChanges',
    'update:TrajSelStatus',
    'update:selPhraseDivUid',
    'update:trajTimePts',
    'update:currentTime',
    'update:insertPulses',
    'open:labelEditor',
    'update:apStretchable',
    'update:prevMeter',
    'update:region',
    'zoomOutY',
    'zoomInY',
    'zoomOutX',
    'zoomInX',
    'cancelRegionSpeed',
    'update:togglePluck',
    'update:toggleDampen',
    'savePiece',
    'update:selectedMeter',
    'deleteMeter',
    'toggle:sargamMagnet',
    'clearTSP',
    'open:addToCollection',
    'open:removeFromCollection',
    'update:slope',
    'selectAssemblagePhrase',
  ],
  setup(props, { emit }) {
    const layersContainer = ref<HTMLDivElement | null>(null);
    const xAxisContainer = ref<HTMLDivElement | null>(null);
    const yAxisContainer = ref<HTMLDivElement | null>(null);
    const scrollingContainer = ref<HTMLDivElement | null>(null);
    const scrollBarWidth = ref(15);
    const scrollBarHeight = ref(15);
    const xScale = ref<d3.ScaleLinear<number, number> | null>(null);
    const yScale = ref<d3.ScaleLinear<number, number> | null>(null);
    const yAxis = ref<InstanceType<typeof YAxis> | null>(null);
    const xAxis = ref<InstanceType<typeof XAxis> | null>(null);
    const minDrawDur = ref(0.01);
    const transcriptionLayer = ref<InstanceType<typeof TranscriptionLayer> | null>(null);
    const scrollUpdateIdx = ref(0);
    const verticalScrollUpdateIdx = ref(0);
    const editorMode = EditorMode;
    const contextMenuX = ref(0);
    const contextMenuY = ref(0);
    const contextMenuClosed = ref(true);
    const contextMenuChoices = ref<ContextMenuOptionType[]>([]);
    const showEditInstrumentation = ref(false);
    const preZoomPlayheadPxl = ref(0);
    const preZoomMiddleTime = ref(0);

    const store = useStore();

    const availableModes = computed(() => {
      let entries = Object.entries(EditorMode);
      if (props.instTracks[props.editingInstIdx].inst !== Instrument.Sitar) {
        entries = entries.filter(entry => entry[1] !== EditorMode.Chikari)
      }
      entries = entries.filter(entry => entry[1] !== EditorMode.AssemblagePhrasePick)
      return Object.fromEntries(entries);
    })
    const scrollX = computed(() => {
      if (!scrollingContainer.value) return 0;
      const scrollWidth = scrollingContainer.value.scrollWidth;
      const scrollLeft = scrollingContainer.value.scrollLeft;
      return scrollLeft / (scrollWidth - scrollingContainer.value.clientWidth);
    });
    const instTracksEnum = computed(() => {
      const enumObj: Record<string, number> = {};
      const duplicateNames: Instrument[] = [];
      props.instTracks.forEach(instTrack => {
        if (!duplicateNames.includes(instTrack.inst)) {
          duplicateNames.push(instTrack.inst);
        }
      });
      const allNames: string[] = [...props.instTracks.map(it => it.inst)];
      duplicateNames.forEach(n => {
        let ctr = 1;
        allNames.forEach((name, nIdx) => {
          if (name === n) {
            allNames[nIdx] = `${name}_${ctr}`;
          }
          ctr += 1;
        }) 
      })
      props.instTracks.forEach((_, i) => {
        enumObj[allNames[i]] = i;
      });
      enumObj['None'] = -1;
      return enumObj;
    })
    const instTrackTexts = computed(() => {
      return props.instTracks.map(it => `Track ${ it.idx + 1 }: ${ it.inst }`);
    })

    const clientWidth = ref(0);
    const modeSelectorHeight = 30;
    const editorModeTexts = computed(() => {
      const choices = [
        'Trajectory Mode',
        'Series Mode',
        'Phrase Division Mode',
        'Meter Mode',
        'Chikari Mode',
        'Region: Click on phrase to set'
      ];
      if (props.instTracks[props.editingInstIdx].inst !== Instrument.Sitar) {
        choices.splice(4, 1);
      }
      return choices;
    });

    let isXScrolling = false;
    let isYScrolling = false;
    let rafId: number | null = null;

    const cssVars = computed(() => ({
      '--yAxWidth': `${props.yAxWidth}px`,
      '--xAxHeight': `${props.xAxHeight}px`,
      '--scaledWidth': `${props.scaledWidth}px`,
      '--scaledHeight': `${props.scaledHeight}px`,
      '--scrollBarWidth': `${scrollBarWidth.value}px`,
      '--scrollBarHeight': `${scrollBarHeight.value}px`,
      '--backgroundColor': props.backgroundColor,
      '--modeSelectorHeight': `${modeSelectorHeight}px`
    }));

    const displayRange = computed(() => {
      const idx = scrollUpdateIdx.value;
      const scrollLeft = scrollingContainer.value!.scrollLeft;
      const clientWidth = scrollingContainer.value!.clientWidth;
      const start = xScale.value!.invert(scrollLeft);
      const end = xScale.value!.invert(scrollLeft + clientWidth);
      return [start, end];
    });

    const verticalDisplayRange = computed(() => {
      const idx = verticalScrollUpdateIdx.value;
      const scrollTop = scrollingContainer.value!.scrollTop;
      const clientHeight = scrollingContainer.value!.clientHeight;
      const start = yScale.value!.invert(scrollTop);
      const end = yScale.value!.invert(scrollTop + clientHeight);
      return [start, end];
    });
    const zoomOutY = () => emit('zoomOutY');
    const zoomInY = () => emit('zoomInY');
    const zoomOutX = () => {
      preZoomPlayheadPxl.value = curPlayheadPxl();
      preZoomMiddleTime.value = curMiddleTime();
      emit('zoomOutX')
    }
    const zoomInX = () => {
      preZoomPlayheadPxl.value = curPlayheadPxl();
      preZoomMiddleTime.value = curMiddleTime();
      emit('zoomInX')
    }

    watch(() => props.scaledHeight, () => {
      if (yScale.value) {
        yScale.value.range([0, props.scaledHeight]);
      }
    });
    watch(() => props.scaledWidth, () => {
      if (xScale.value) {
        xScale.value = d3.scaleLinear()
          .domain([0, props.piece.durTot!])
          .range([0, props.scaledWidth]);
      }
    });
    watch([() => props.lowOctOffset, () => props.highOctOffset], () => {
      reScaleY();
    });

    const reScaleY = () => {
      if (yScale.value) {
        const raga = props.piece.raga;
        const saFreq = raga.fundamental;
        const logSaFreq = Math.log2(saFreq);
        const logMax = logSaFreq + props.highOctOffset;
        const logMin = logSaFreq - props.lowOctOffset;
        yScale.value.domain([logMax, logMin]);
      }
    };

    const updateRegion = (region: [number, number]) => {
      const tLayer = transcriptionLayer.value!;
      tLayer.regionStartPxl = region[0];
      tLayer.regionEndPxl = region[1];
      nextTick(() => tLayer.setUpRegion());
    };

    const updateClientWidth = () => {
      if (scrollingContainer.value) {
        clientWidth.value = scrollingContainer.value.clientWidth;
      }
      yAxisContainer.value!.scrollTop = scrollingContainer.value!.scrollTop;
      xAxisContainer.value!.scrollLeft = scrollingContainer.value!.scrollLeft;
    };

    const resetYScroll = () => {
      let allTrajs: Trajectory[] = [];
      props.piece.instrumentation.forEach((_, i) => {
        const trajs = props.piece.allTrajectories(i);
        const starts = props.piece.trajStartTimes(i);
        trajs.map((traj, idx) => {
          if (starts[idx] >= displayRange.value[0] && starts[idx] <= displayRange.value[1]) {
            allTrajs.push(traj);
          }
        })
      });
      let minLogFreq = Infinity;
      let maxLogFreq = -Infinity;
      allTrajs.forEach(traj => {
        minLogFreq = Math.min(minLogFreq, traj.minLogFreq);
        maxLogFreq = Math.max(maxLogFreq, traj.maxLogFreq);
      })
      const avg = (minLogFreq + maxLogFreq) / 2;
      const avgYCoord = yScale.value!(avg);
      const containerHeight = scrollingContainer.value!.clientHeight;
      const scrollTop = avgYCoord - containerHeight / 2;
      scrollingContainer.value!.scrollTop = scrollTop;   
    }

    const moveToX = (x: number) => {
      scrollingContainer.value!.scrollLeft = x;
      resetYScroll();
    }

    const horizontalMoveGraph = (amt: number) => {
      const start = displayRange.value[0];
      const dur = displayRange.value[1] - displayRange.value[0];
      const newStart = start + amt * dur;
      const x = xScale.value!(newStart);
      scrollingContainer.value!.scrollLeft = x;
      resetYScroll();
    };

    const verticalMoveGraph = (amt: number) => {
      const start = verticalDisplayRange.value[0];
      const delta = verticalDisplayRange.value[1] - start;
      const newStart = start - amt * delta;
      const y = yScale.value!(newStart);
      scrollingContainer.value!.scrollTop = y;
    }

    const updateAxesScroll = throttle(() => {
      xAxisContainer.value!.scrollLeft = scrollingContainer.value!.scrollLeft;
      yAxisContainer.value!.scrollTop = scrollingContainer.value!.scrollTop;
    }, 16);

    const handleContextMenuClick = (e: MouseEvent) => {
      e.preventDefault();
      emit('hideTooltip')
      contextMenuX.value = e.x;
      contextMenuY.value = e.y - props.navHeight;
      contextMenuClosed.value = false;
      contextMenuChoices.value = [{
        text: 'Edit Instrumentation',
        action: () => {
          // openInstrumentationEditor();
          showEditInstrumentation.value = true;
          contextMenuClosed.value = true;
        },
        enabled: true
      }]
    };
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        contextMenuClosed.value = true;
        showEditInstrumentation.value = false;
      }
    };
    const handleShowTooltip = (e: MouseEvent) => {
      if (contextMenuClosed.value) emit('showTooltip', e);
    };
    const handleUpdateInstrumentation = () => {
      showEditInstrumentation.value = false;
      window.location.reload();
    };

    const curPlayheadPxl = () => {
      if (!xScale.value) return 0;
      if (!scrollingContainer.value) return 0;
      const leftTime = xScale.value.invert(scrollingContainer.value.scrollLeft);
      const diff = props.currentTime - leftTime;
      return xScale.value(diff);
    };

    const scrollBackForPlayhead = () => {
      nextTick(() => {
        const phPxlOnScreen = curPlayheadPxl();
        if (phPxlOnScreen < 0) {
          const playheadPxl = xScale.value!(props.currentTime);
          const containerWidth = scrollingContainer.value!.clientWidth;
          const quarterWidth = containerWidth / 4;
          const desiredScrollLeft = playheadPxl - quarterWidth;
          scrollingContainer.value!.scrollLeft = desiredScrollLeft;
        }
      })      
    }

    const curMiddleTime = () => {
      if (!xScale.value) return clientWidth.value / 2;
      if (!scrollingContainer.value) return clientWidth.value / 2;
      const leftTime = xScale.value.invert(scrollingContainer.value.scrollLeft);
      const halfPxl = clientWidth.value / 2;
      const halfTime = xScale.value.invert(halfPxl);
      return leftTime + halfTime;
    }
    const updateXAxisPhraseLabels = () => {
      xAxis.value!.resetAxis();
    }

    const handleScroll = throttle(() => {
      updateAxesScroll();
      scrollUpdateIdx.value += 1;
      verticalScrollUpdateIdx.value += 1;
    }, 16);

    const onWheel = (e: WheelEvent) => {
      if (store.state.userID === '634d9506a6a3647e543b7641') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (store.state.userID === '634d9506a6a3647e543b7641') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    onMounted(async () => {
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('click', () => {
        contextMenuClosed.value = true;
      })
      emit('update:recomputeTrigger');
      updateClientWidth();
      scrollingContainer.value?.addEventListener('click', (e) => {
        e.preventDefault();
      })
      scrollingContainer.value?.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', updateClientWidth);
      const durTot = props.piece.durTot;
      if (durTot === undefined) {
        throw new Error('durTot is undefined');
      }
      xScale.value = d3.scaleLinear()
        .domain([0, durTot])
        .range([0, props.scaledWidth]);
      const raga = props.piece.raga;
      const saFreq = raga.fundamental;
      const logSaFreq = Math.log2(saFreq);
      const logMax = logSaFreq + props.highOctOffset;
      const logMin = logSaFreq - props.lowOctOffset;
      yScale.value = d3.scaleLinear()
        .domain([logMax, logMin])
        .range([0, props.scaledHeight]);
      resetYScroll();
      if (props.queryTime !== 0) {
        moveToX(xScale.value(props.queryTime));
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateClientWidth);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('click', () => {
        contextMenuClosed.value = true;
      })
      scrollingContainer.value?.removeEventListener('scroll', handleScroll);
    });
    return {
      scrollingContainer,
      layersContainer,
      xAxisContainer,
      yAxisContainer,
      scrollBarWidth,
      scrollBarHeight,
      xScale,
      yScale,
      cssVars,
      zoomOutY,
      zoomInY,
      zoomOutX,
      zoomInX,
      yAxis,
      xAxis,
      reScaleY,
      minDrawDur,
      scrollX,
      clientWidth,
      modeSelectorHeight,
      transcriptionLayer,
      resetYScroll,
      moveToX,
      horizontalMoveGraph,
      editorMode,
      instTracksEnum,
      availableModes,
      displayRange,
      editorModeTexts,
      instTrackTexts,
      verticalMoveGraph,
      updateRegion,
      handleContextMenuClick,
      contextMenuX,
      contextMenuY,
      contextMenuClosed,
      contextMenuChoices,
      handleShowTooltip,
      showEditInstrumentation,
      handleUpdateInstrumentation,
      preZoomPlayheadPxl,
      curPlayheadPxl,
      curMiddleTime,
      preZoomMiddleTime,
      scrollBackForPlayhead,
      updateXAxisPhraseLabels,
      onWheel,
      onTouchMove,

    }
  }
  
});
</script>

<style scoped>

.scrollingContainer {
  width: calc(100% - var(--yAxWidth));
  height: calc(100% - var(--xAxHeight));
  top: var(--xAxHeight);
  left: var(--yAxWidth);
  overflow-x: scroll;
  overflow-y: scroll;
  position: absolute;
  box-sizing: border-box;
  scrollbar-width: auto;
  scroll-behavior: auto;
  outline: none;
  overflow: scroll;
}

.scrollingContainer::-webkit-scrollbar {
  width: var(--scrollBarWidth);
  height: var(--scrollBarHeight);
}

.scrollingContainer::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: var(--scrollBarWidth);
}

.scrollingContainer::-webkit-scrollbar-track {
  background-color: lightgrey;
}

.layersContainer {
  position: absolute;
  top: 0;
  left: 0;;

}

.layersContainer > * {
  position: absolute;
  top: 0;
  left: 0;
}

.xAxisContainer {
  position: sticky;
  top: 0;
  /* left: var(--yAxWidth); */
  width: calc(100% - var(--yAxWidth) - var(--scrollBarWidth));
  height: var(--xAxHeight);
  overflow-x: hidden;
  overflow-y: hidden;
  margin-left: var(--yAxWidth);
}

.verticalZoomControls {
  position: absolute;
  top: 0;
  left: calc(100% - var(--scrollBarWidth));
  width: var(--scrollBarWidth);
  height: var(--xAxHeight);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  background-color:lightgray;
  color: black;
  box-sizing: border-box;
}

.verticalZoomControls > * {
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
}

.verticalZoomControls > *:hover {
  background-color: darkgray;
}

.verticalZoomControls > .zoomOut {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
}

.horizontalZoomControls {
  position: absolute;
  top: calc(100% - var(--scrollBarHeight));
  left: 0;
  width: var(--yAxWidth);
  height: var(--scrollBarHeight);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  background-color:lightgray;
  color: black;
  box-sizing: border-box;
}

.horizontalZoomControls > * {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  border-right: 1px solid black;
}

.horizontalZoomControls > *:hover {
  background-color: darkgray;
}

.yAxisContainer {
  position: sticky;
  left: 0;
  top: var(--xAxHeight);
  width: var(--yAxWidth);
  height: calc(100% - var(--xAxHeight) - var(--scrollBarHeight));
  overflow-y: hidden;
}

.yAxisContainer::-webkit-scrollbar {
  width: 0;
}

.xAxisContainer::-webkit-scrollbar {
  height: 0;
}

.wrapper {
  position: relative;
  width: 100%;
  height: calc(100% - var(--modeSelectorHeight));
}

.backgroundLayer {
  width: var(--scaledWidth);
  height: var(--scaledHeight);
  background-color: var(--backgroundColor);
  position: absolute;
}

.modeSelector {
  width: 100%;
  height: var(--modeSelectorHeight);
}

.trackOption {
  width: 30px;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid white
}

.topRow {
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: #202621
}

</style>
