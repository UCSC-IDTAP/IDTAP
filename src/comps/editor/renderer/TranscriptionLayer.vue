<template>
  <div class='tranContainer' ref='tranContainer' :style='dynamicStyle'>
    <svg ref='tranSvg' class='tranSvg'>
      <!-- this rect needs to stay because of how things are inserted -->
      <rect
        ref='playhead'
        class='playhead'
        x='0'
        y='0'
        :width='playing && isBlock ? xScale(1) : 1'
        :opacity='playing && isBlock ? 0.5 : 1'
        :height='height'
        :fill='playheadColor'
        
      ></rect>
    </svg>
    <div class='emptyOverlay' ref='emptyOverlay'></div>
    <AutomationWindow 
      v-if='autoWindowOpen && autoTrajs.length > 0 && piece && editable'
      :trajectories='autoTrajs'
      :x='autoWindowX'
      :y='autoWindowY'
      :width='autoWindowWidth'
      :piece='piece'
      />
    <TrajectoryAnnotator
      v-if='annotatingTraj !== undefined && trajAnnotatorOpen'
      :trajectory='annotatingTraj'
      :editable='editable'
      :x='trajAnnotatorX'
      :y='trajAnnotatorY'
      :width='trajAnnotatorWidth'
      :height='trajAnnotatorHeight'
      @closeWindow='trajAnnotatorOpen = false'
    />
  </div>
  <ContextMenu
    :x='contextMenuX'
    :y='contextMenuY'
    :closed='contextMenuClosed' 
    :choices='contextMenuChoices'
    />
  <div class='timeModalOuter'v-if="goToTimeModal">
    <div class="time-entry-modal">
      <div class="time-entry-container">
        <input type="text" v-model="goToHours" placeholder="HH" class="time-entry-input" />
        <span>:</span>
        <input type="text" v-model="goToMinutes" placeholder="MM" class="time-entry-input" />
      </div>
      <button @click="goToTime">Go</button>
    </div>
  </div>
</template>
<script lang='ts'>
import { 
  defineComponent, 
  ref, 
  onMounted,
  onBeforeUnmount, 
  watch, 
  computed,
  PropType,
  nextTick,
  reactive,
  toRef
} from 'vue';
import * as d3 from 'd3';
import { 
  linSpace, 
  cumsum, 
  getClosest, 
  sum,
  findClosestStartTimeAfter,
  findClosestStartTime,
} from '@/ts/utils.ts';
import { EditorMode, Instrument, PlayheadAnimations } from '@shared/enums';
import { BrowserInfo } from 'detect-browser';
import AutomationWindow from '@/comps/editor/AutomationWindow.vue';
import TrajectoryAnnotator from '@/comps/editor/renderer/TrajectoryAnnotator.vue';
import { 
  Piece, 
  Trajectory, 
  Phrase, 
  Pitch, 
  Chikari,
  Raga,
  Group,
  Articulation
} from '@/js/classes.ts';
import { throttle, debounce } from 'lodash';
import { 
  SargamDisplayType, 
  VowelDisplayType, 
  ConsonantDisplayType,
  InstrumentTrackType,
  PhraseDivDisplayType,
  TrajSelectionStatus,
  ChikariDisplayType,
  TrajRenderObj,
  TrajTimePoint,
  ContextMenuOptionType,
  LabelEditorOptions,
  StrokeNicknameType,
  BolDisplayType,
  CollectionType,
  APType,
} from '@shared/types';
import { 
  PhonemeRepresentation,
  SargamRepresentation
} from '@shared/enums';
import { Meter, Pulse } from '@/js/meter.ts';
import ContextMenu from'@/comps/ContextMenu.vue';

export default defineComponent({
  name: 'TranscriptionLayer',
  components: {
    ContextMenu,
    AutomationWindow,
    TrajectoryAnnotator,
  },
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    showTranscription: {
      type: Boolean,
      required: true
    }, 
    xScale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
    },
    yScale: {
      type: Function as PropType<d3.ScaleLinear<number, number>>,
      required: true
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
    sargamLineColor: {
      type: String,
      required: true
    },
    minDrawDur: {
      type: Number,
      required: true
    },
    scrollX: {
      type: Number,
      required: true
    },
    clientWidth: {
      type: Number,
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
    sargamRepresentation: {
      type: String as PropType<SargamRepresentation>,
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
    scrollingContainer: {
      type: Object as PropType<HTMLElement>,
      required: true
    },
    editingInstIdx: {
      type: Number,
      required: true
    },
    meterMagnetMode: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    displayRange: {
      type: Array as PropType<number[]>,
      required: true,
      validator: (val: number[]) => {
        return val.length === 2;
      }
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
    preZoomPlayheadPxl: {
      type: Number,
      required: true
    },
    preZoomMiddleTime: {
      type: Number,
      required: true
    },
    editableCols: {
      type: Object as PropType<CollectionType[]>,
      required: true
    },
    audioPlayerRef: {
      type: Object as PropType<APType>,
      required: true
    },
  },
  emits: [
    'update:TrajSelStatus',
    'update:selPhraseDivUid',
    'update:insertPulses',
    'unsavedChanges',
    'horizontalMoveGraph',
    'moveToX',
    'update:selectedMode',
    'update:editingInstIdx',
    'update:prevMeter',
    'open:labelEditor',
    'update:currentTime',
    'update:trajTimePts',
    'verticalMoveGraph',
    'update:apStretchable',
    'update:region',
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
    'update:xAxisPhraseLabels',
    'update:slope',
  ],
  setup(props, { emit }) {
    const tranContainer = ref<HTMLDivElement | null>(null);
    const tranSvg = ref<SVGSVGElement | null>(null);
    const tracks: d3.Selection<SVGGElement, unknown, null, undefined>[] = [];
    const emptyOverlay = ref<HTMLDivElement | null>(null);
    const emptyDivs = ref<HTMLDivElement[]>([]);
    const editorMode = ref<EditorMode>(EditorMode.None);
    const shifted = ref<boolean>(false);
    const alted = ref<boolean>(false);
    const metad = ref<boolean>(false);
    const trajRenderStatus = ref<TrajRenderObj[][]>([]);
    const selectedPhraseDivUid = ref<string | undefined>(undefined);
    const lowOctOffsetRef = toRef(props, 'lowOctOffset');
    const highOctOffsetRef = toRef(props, 'highOctOffset');
    const selectedChikari = ref<ChikariDisplayType | undefined>(undefined);
    const selectedDragDotIdx = ref<number | undefined>(undefined);
    const trajTimePts = ref<TrajTimePoint[]>([]);
    const clipboardTrajs = ref<Trajectory[]>([]);
    const selectedMeter = ref<Meter | undefined>(undefined);
    const selectedPulse = ref<Pulse | undefined>(undefined);
    const insertPulses = ref<number[]>([]);
    const contextMenuX = ref<number>(0);
    const contextMenuY = ref<number>(0);
    const contextMenuClosed = ref<boolean>(true);
    const contextMenuChoices = ref<ContextMenuOptionType[]>([]);
    const autoWindowWidth = ref<number>(300);
    const autoTrajs = ref<Trajectory[]>([]);
    const autoWindowOpen = ref<boolean>(false);
    const autoWindowX = ref<number>(500);
    const autoWindowY = ref<number>(500);
    const trajAnnotatorOpen = ref<boolean>(false);
    const trajAnnotatorX = ref<number>(500);
    const trajAnnotatorY = ref<number>(500);
    const trajAnnotatorWidth = ref<number>(200);
    const trajAnnotatorHeight = ref<number>(200);
    const regionG = ref<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>(undefined);
    const regionStartPxl = ref<number | undefined>(undefined);
    const regionEndPxl = ref<number | undefined>(undefined);
    const regionStartX = ref<number | undefined>(undefined);
    const regionEndX = ref<number | undefined>(undefined);
    const playhead = ref<SVGRectElement | null>(null);
    const currentPlayheadX = ref<number>(0);
    const laggingDragDotX = ref<number>(0);
    const laggingDragDotY = ref<number>(0);
    const targetDragDotX = ref<number | undefined>(undefined);
    const targetDragDotY = ref<number | undefined>(undefined);
    const currentSec = ref<number>(0);
    const litTrajs = ref<(Trajectory | undefined)[]>(Array(props.instTracks.length).fill(undefined));
    const litChikaris = ref<string[][]>(props.instTracks.map(() => []));    
    const goToTimeModal = ref<boolean>(false);
    const goToHours = ref<string>('0');
    const goToMinutes = ref<string>('00');
    const controlled = ref<boolean>(false);
    const annotatingTraj = ref<Trajectory | undefined>(undefined);
    let playheadLineIdx = 0;
    let justDeletedPhraseDiv = false;
    const dragDotColor = 'purple';
    const selectedDragDotColor = '#d602d6';
    let dragDotIdx: number | undefined = undefined;
    const minTrajDur = 0.05;
    let pulseDragEnabled = false;
    let meterHovering: Meter | undefined = undefined;
    let selMeterHovering = false;
    let selBoxStartX: number | undefined = undefined;
    let selBoxStartY: number | undefined = undefined;
    let selBox: d3.Selection<SVGRectElement, unknown, null, undefined> | null = 
      null;
    let playheadRealStartTime = 0;
    let playheadMusicStartTime = 0;
    let playheadStartPxl = 0;
    let lastUpdateTime = 0;
    
    const fps = 30;
    const frameDur = 1 / fps;
    let everyOther = true;
    let looping = false;
    let smoothPositionX = 0;

    let animationFrameId: number | null = null;
    let movingPlayhead = false;
    let currentX = 0;

    const isBlock = computed(() => {
      return props.playheadAnimation === PlayheadAnimations.Block;
    })

    const emptyDivIdxMap = new Map<HTMLDivElement, number>();
    const maxEmptyDivWidth = props.clientWidth;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = emptyDivIdxMap.get(entry.target as HTMLDivElement)!;
        if (entry.isIntersecting) {
          const dur = chunkDur.value;
          for (let inst = 0; inst < props.piece.instrumentation.length; inst++) {
            props.piece.chunkedDisplaySargam(inst, dur)[idx].forEach(s => {
              renderSargam(s);
            });
            const insts = [Instrument.Vocal_M, Instrument.Vocal_F];
            if (insts.includes(props.piece.instrumentation[inst] as Instrument)) {
              props.piece.chunkedDisplayVowels(inst, dur)[idx].forEach(v => {
                renderVowel(v);
              })
              props.piece.chunkedDisplayConsonants(inst, dur)[idx].forEach(c => {
                renderEndingConsonant(c);
              })
            } else if (props.piece.instrumentation[inst] === Instrument.Sitar) {
              props.piece.chunkedDisplayChikaris(inst, dur)[idx].forEach(cd => {
                renderChikari(cd);
              });
              props.piece.chunkedDisplayBols(inst, dur)[idx].forEach(b => {
                renderBol(b);
              })
            }
            props.piece.chunkedTrajs(inst, dur)[idx].forEach(traj => {
              if (traj.id !== 12) renderTraj(traj);
            });
            props.piece.chunkedPhraseDivs(inst, dur)[idx].forEach(pd => {
              renderPhraseDiv(pd);
            });
          }
          props.piece.chunkedMeters(dur)[idx].forEach(m => {
            renderMeter(m);
          })
          observer.unobserve(entry.target);
        }
      })
    }, {
      root: emptyOverlay.value,
      rootMargin: '0px',
      threshold: 0.0
    });

    const resetTrajRenderStatus = (persistingTrajUIds: string[] = [], redraw = true) => {
      // Convert the persisting IDs into a Set for fast lookups.
      const persistingSet = new Set(persistingTrajUIds);
      
      for (let i = 0; i < props.piece.instrumentation.length; i++) {
        // Build a lookup for previous statuses for this track.
        const prevStatusMap = new Map<string, boolean>();
        if (trajRenderStatus.value[i] !== undefined) {
          for (const obj of trajRenderStatus.value[i]) {
            prevStatusMap.set(obj.uniqueId, obj.renderStatus);
          }
        }
        
        // Update the status for all trajectories in one pass.
        trajRenderStatus.value[i] = props.piece.allTrajectories(i).map(t => {
          const prev = prevStatusMap.get(t.uniqueId!);
          // If redraw is true, force status to false, otherwise reuse previous status.
          const status = redraw ? false : (prev ?? false);
          return { 
            uniqueId: t.uniqueId!, 
            renderStatus: status,
            selectedStatus: persistingSet.has(t.uniqueId!),
            track: i
          };
        });
      }
    };

    resetTrajRenderStatus();

    // computed values
    const trajStartTimes = computed(() => {
      const gridStartTimes = [];
      for (let i = 0; i < props.piece.instrumentation.length; i++) {
        const trajs = props.piece.allTrajectories(i);
        const durs = trajs.map(t => t.durTot);
        const startTimes = durs.reduce((acc, dur) => {
          if (typeof dur !== 'number') {
            throw new Error('Duration is not a number');
          }
          acc.push(acc[acc.length - 1] + dur);
          return acc;
        }, [0]);
        gridStartTimes.push(startTimes);
      };
      return gridStartTimes;
    });
    const trajEndTimes = computed(() => {
      const gridEndTimes = [];
      for (let i = 0; i < props.piece.instrumentation.length; i++) {
        const trajs = props.piece.allTrajectories(i);
        const durs = trajs.map(t => t.durTot);
        const endTimes = trajStartTimes.value[i].map((startTime, idx) => {
          return startTime + durs[idx];
        });
        gridEndTimes.push(endTimes);
      };
      return gridEndTimes;
    });
    const dynamicStyle = computed(() => {
      return {
        '--opacity': props.showTranscription ? 1 : 0,
        '--width': `${props.width}px`,
        '--height': `${props.height}px`
      }
    })
    const logMin = computed(() => {
      return Math.log2(props.piece.raga.fundamental) - lowOctOffsetRef.value;
    })
    const logMax = computed(() => {
      return Math.log2(props.piece.raga.fundamental) + highOctOffsetRef.value;
    })
    const logSargamVals = computed(() => {
      return props.piece.raga.getFrequencies({
        low: 2 ** logMin.value,
        high: 2 ** logMax.value
      }).map(freq => Math.log2(freq))
    });
    const visPitches = computed(() => {
      return props.piece.raga.getPitches({
        low: 2 ** logMin.value,
        high: 2 ** logMax.value
      })
    });
    const selectedTrajs = computed(() => {
      let track = 0;
      const uIds = trajRenderStatus.value.flat().filter(obj => {
        return obj.selectedStatus === true
      }).map(obj => {
        track = obj.track;
        return obj.uniqueId
     });
      const out = props.piece.allTrajectories(track).filter(traj => {
        return uIds.includes(traj.uniqueId!)
      });
      return out
    });
    const chunkDur = computed(() => {
      return props.xScale.invert(props.clientWidth)
    });
    const selectedTraj = computed(() => {
      return selectedTrajs.value.length === 1 ? 
        selectedTrajs.value[0] : 
        undefined;
    });
    // const playheadStyle = computed(() => {
    //   return {
    //     zIndex: 1000,
    //     // filter: 'blur(2px) drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
    //   }
    // });
    const targetPlayheadX = computed(() => {
      return props.xScale(props.currentTime)
    });
    const ipLims = computed(() => {
      // for inserting insert pulses, this lets us know the limits, based on
      // other meters and already inserted pulses.
      let out = [0, 0];
      if (insertPulses.value.length === 0) {
        return [0, props.piece.durTot!];
      } else {
        const mtrStarts = props.piece.meters.map(m => m.startTime);
        const ip = insertPulses.value[0];
        if (Math.min(...mtrStarts) > ip) {
          const afterIdx = findClosestStartTimeAfter(mtrStarts, ip);
          const after = props.piece.meters[afterIdx];
          if (after === undefined) {
            return [0, props.piece.durTot!];
          } else {
            return [0, after.startTime];
          }
        } else if (Math.max(...mtrStarts) < ip) {
          const beforeIdx = findClosestStartTime(mtrStarts, ip);
          const before = props.piece.meters[beforeIdx];
          return [before.startTime + before.durTot, props.piece.durTot!];
        } else {
          const beforeIdx = findClosestStartTime(mtrStarts, ip);
          const afterIdx = findClosestStartTimeAfter(mtrStarts, ip);
          const before = props.piece.meters[beforeIdx];
          const after = props.piece.meters[afterIdx];
          return [before.startTime + before.durTot, after.startTime];
        }
      }
    });
    const groupable = computed(() => {
      if (selectedTrajs.value.length > 1) {
        return selectedTrajsGroupable();
      } else {
        return false
      }
    })
    const removableCols = computed(() => {
      return props.editableCols.filter(c => {
        return c.transcriptions.includes(props.piece._id!)
      })
    })

    // watched values
    watch(() => props.sargamLineColor, () => {
      updateSargamLineColor();
    });
    watch(() => props.height, () => {
      if (tranSvg.value) {
        d3.select(tranSvg.value)
          .attr('height', props.height)
        updateSargamLineSpacing();
        resetTranscription();
      }
    });
    watch(() => props.width, () => {
      if (tranSvg.value) {
        d3.select(tranSvg.value)
          .attr('width', props.width)
        updateSargamLineWidth();
        if (regionStartX.value !== undefined) {
          regionStartPxl.value = props.xScale(regionStartX.value);
        }
        if (regionEndX.value !== undefined) {
          regionEndPxl.value = props.xScale(regionEndX.value);
        }
        resetTranscription();
        updatePlayheadPosition(props.currentTime);
        const c = props.preZoomPlayheadPxl;
        if (c > 0 && c < props.scrollingContainer.clientWidth) {
          nextTick(() => scrollToPlayhead())
        } else {
          scrollToOldMiddle();
        }
      }
    });
    watch(() => props.showSargam, () => {
      d3.selectAll('.sargamG')
        .style('opacity', Number(props.showSargam))
    });
    watch(() => props.showTranscription, () => {
      d3.selectAll('.transcriptionG')
        .style('opacity', Number(props.showTranscription))
      // d3.selectAll('.traj')
      //   .style('opacity', Number(props.showTranscription))
    });
    watch(() => props.showSargamLines, () => {
      d3.selectAll('.sargamLinesG')
        .style('opacity', Number(props.showSargamLines))
    });
    watch(() => props.showPhonemes, () => {
      d3.selectAll('.phonemeG')
        .style('opacity', Number(props.showPhonemes))
    });
    watch(() => props.phonemeRepresentation, () => {
      const opacities = ['IPA', 'Devanagari', 'English'].map(c => {
        return c === props.phonemeRepresentation ? 1 : 0;
      });
      d3.selectAll('.IPA')
        .attr('opacity', opacities[0])
      d3.selectAll('.Devanagari')
        .attr('opacity', opacities[1])
      d3.selectAll('.Latin')
        .attr('opacity', opacities[2])
    });
    watch(() => props.sargamRepresentation, () => {
      const opacities = Object.values(SargamRepresentation).map(c => {
        return c === props.sargamRepresentation ? 1 : 0;
      });
      d3.selectAll('.sargamLabel.sargam')
        .attr('opacity', opacities[0])
      d3.selectAll('.sargamLabel.solfege')
        .attr('opacity', opacities[1])
      d3.selectAll('.sargamLabel.pitchClass')
        .attr('opacity', opacities[2])
      d3.selectAll('.sargamLabel.westernPitch')
        .attr('opacity', opacities[3])
    })
    watch(selectedTrajs, (newVal, oldVal) => {
      oldVal.forEach(traj => {
        if (!newVal.includes(traj)) {
          const renderObj = trajRenderStatus.value.flat().find(obj => {
            return obj.uniqueId === traj.uniqueId
          });
          if (renderObj === undefined) return;
          const track = renderObj!.track;
          const selector = `.traj.uId${traj.uniqueId!}`;
          d3.selectAll(selector)
            .attr('stroke', props.instTracks[track].color)
          d3.selectAll(selector + '.pluck')
            .attr('fill', props.instTracks[track].color);
          const vowelSelector = `.vowelLabel.uId${traj.uniqueId}`;
          d3.selectAll(vowelSelector)
            .attr('stroke', 'black')
          const consonantSelector = `.consonantLabel.uId${traj.uniqueId}`;
          d3.selectAll(consonantSelector)
            .attr('stroke', 'black')
        }
      });
      newVal.forEach(traj => {
        const renderObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        const track = renderObj!.track;
        const selector = `.traj.uId${traj.uniqueId!}`;
        d3.selectAll(selector)
          .attr('stroke', props.instTracks[track].selColor)
        d3.selectAll(selector + '.pluck')
          .attr('fill', props.instTracks[track].selColor)
        const vowelSelector = `.vowelLabel.uId${traj.uniqueId}`;
        d3.selectAll(vowelSelector)
          .attr('stroke', props.instTracks[track].selColor)
        const consonantSelector = `.consonantLabel.uId${traj.uniqueId}`;
        d3.selectAll(consonantSelector)
          .attr('stroke', props.instTracks[track].selColor)
      });
      let status: TrajSelectionStatus = undefined;
      if (selectedTrajs.value.length > 0) {
        const traj = selectedTrajs.value[0];
        const track = props.piece.trackFromTraj(traj);
        const inst = props.piece.instrumentation[track] as Instrument;
        if (selectedTrajs.value.length === 1) {
          refreshDragDots();
        }
        status = { trajs: selectedTrajs.value, instrument: inst }
      }
      emit('update:TrajSelStatus', status);
    })
    watch(() => props.instTracks, (newVal) => {
      newVal.forEach((track, tIdx) => {
        const selector = `.track${tIdx}`;
        d3.selectAll(selector)
          .style('opacity', Number(track.displaying))
        d3.selectAll(`${selector} .traj`)
          .attr('stroke', track.color)
        d3.selectAll(`${selector} .pluck`)
          .attr('fill', track.color)
        d3.selectAll(`${selector} .pluck`)
          .attr('stroke', track.color)
        d3.selectAll(`${selector} .consonantSymbol`)
          .attr('fill', track.color)

        // chikaris
        d3.selectAll(`${selector} .chikari`)
          .attr('stroke', track.color)

        // phrase divs
        d3.selectAll(`${selector} .phraseDiv`)
          .attr('stroke', track.color)
      })
      selectedTrajs.value.forEach(traj => {
        const renderObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        const track = renderObj!.track;
        const selector = `.traj.uId${traj.uniqueId!}`;
        d3.selectAll(selector)
          .attr('stroke', props.instTracks[track].selColor)
        d3.selectAll(selector + '.pluck')
          .attr('fill', props.instTracks[track].selColor)
      })
    }, { deep: true });
    watch(() => props.showPhraseDivs, () => {
      d3.selectAll('.phraseDivG')
        .style('opacity', Number(props.showPhraseDivs))
    });
    watch(() => props.showMeter, () => {
      d3.selectAll('.meterG')
        .style('opacity', Number(props.showMeter))
    });
    watch(selectedPhraseDivUid, (newVal, oldVal) => {
      if (newVal !== undefined) {
        const track = props.piece.trackFromPhraseUId(newVal);
        const selColor = props.instTracks[track].selColor;
        const normColor = props.instTracks[track].color;
        const selector = `.phraseDiv.uId${newVal}`;
        d3.select(selector)
          .attr('stroke', selColor);
        if (oldVal !== undefined) {
          const oldSelector = `.phraseDiv.uId${oldVal}`;
          d3.select(oldSelector)
            .attr('stroke', normColor)
        }
        emit('update:selPhraseDivUid', newVal);
      } else {
        if (justDeletedPhraseDiv) {
          justDeletedPhraseDiv = false;
          return;
        } else {
          const track = props.piece.trackFromPhraseUId(oldVal!);
          const normColor = props.instTracks[track].color;
          const selector = `.phraseDiv.uId${oldVal}`;
          d3.select(selector)
            .attr('stroke', normColor)
          emit('update:selPhraseDivUid', undefined);
        }      
      }
    })
    watch(selectedChikari, (newVal, oldVal) => {
      if (newVal !== undefined) {
        const selector = `.chikari.uId${newVal.uId}`;
        const color = props.instTracks[newVal.track].selColor;
        d3.selectAll(selector)
          .attr('stroke', color)
        if (oldVal !== undefined) {
          const oldSelector = `.chikari.uId${oldVal.uId}`;
          const oldColor = props.instTracks[oldVal.track].color;
          d3.selectAll(oldSelector)
            .attr('stroke', oldColor)
        }
      } else if (oldVal !== undefined) {
        const selector = `.chikari.uId${oldVal.uId}`;
        const color = props.instTracks[oldVal.track].color;
        d3.selectAll(selector)
          .attr('stroke', color)
      }
    });
    watch(() => props.selectedMode, (mode, oldMode) => {
      if (oldMode === EditorMode.None && mode === EditorMode.Meter) {
        handleEscape({ includeMode: false, meterPersist: true });
      }
      else {
        handleEscape({ includeMode: false });
      }
      if (mode === EditorMode.None) {
        const svg = d3.select(tranSvg.value);
        svg.attr('cursor', 'default');
        if (meterHovering !== undefined) {
          d3.selectAll(`.metricGrid.meterId${meterHovering.uniqueId}`)
            .attr('cursor', 'default')
            .attr('stroke', props.meterColor)
        }
      } else if (mode === EditorMode.Chikari) {
        d3.select(tranSvg.value).attr('cursor', 'crosshair');
      } else if (mode === EditorMode.PhraseDiv) {
        d3.select(tranSvg.value).attr('cursor', 's-resize');
      } else if (mode === EditorMode.Trajectory) {
        d3.select(tranSvg.value).attr('cursor', 'crosshair');
      } else if (mode === EditorMode.Series) {
        d3.select(tranSvg.value).attr('cursor', 'crosshair');
      } else if (mode === EditorMode.Meter) {
        d3.select(tranSvg.value).attr('cursor', 's-resize');
        if (meterHovering !== undefined) {
          d3.selectAll(`.metricGrid.meterId${meterHovering.uniqueId}`)
            .attr('cursor', 'pointer')
            .attr('stroke', props.selectedMeterColor)
        }
      } else if (mode === EditorMode.Region) {
        d3.select(tranSvg.value).attr('cursor', 'alias');
      }
    });
    watch(() => props.editingInstIdx, (instIdx) => {
      if (selectedTraj.value !== undefined) {
        const track = props.piece.trackFromTraj(selectedTraj.value);
        if (track === instIdx) {
          const uId = selectedTraj.value.uniqueId!;
          handleEscape();
          selectTraj(uId!);
        } else {
          handleEscape()
        }
      } else {
        handleEscape()
      }
    });
    watch(() => props.currentTime, t => {
      if (props.playing) {
        if (t > props.displayRange[1]) {
          horizontalMoveGraph(0.85)
        }
        if (props.playheadAnimation === PlayheadAnimations.Block) {
          let doUpdate = false;
          if (Math.floor(props.currentTime) > currentSec.value) {
            doUpdate = true;
          } else if (props.loop) {
            doUpdate = true;
          }
          if (doUpdate) {
            currentSec.value = Math.floor(props.currentTime);
            updatePlayheadPosition(currentSec.value);
          }
        }
        if (props.highlightTrajs) {
          // here is where to use curTraj= props.piece.trajFromTime
          // within instTracks if instTrack is currently "displaying"
          // then swap to its selColor if its currently playing, 
          // go back to regular color otherwise (unless it is selected or 
          // still hovering)
          props.instTracks.forEach((track, idx) => {
            if (track.displaying) {
              // trajs
              const traj = props.piece.trajFromTime(t, idx);
              const litTraj = litTrajs.value[idx];
              if (traj.id !== 12) {
                if (litTraj !== undefined) {
                  if (litTraj !== traj) {
                    if (!selectedTrajs.value.includes(litTraj)) {
                      const litSelector = `.traj.uId${litTrajs.value[idx]!.uniqueId}`;
                      const litSelectorPluck = litSelector + '.pluck';
                      const litSelectorDiamond = litSelector + '.consonantSymbol';
                      d3.selectAll(litSelector)
                        .attr('stroke', track.color)
                      d3.selectAll(litSelectorPluck)
                        .attr('fill', track.color)
                      d3.selectAll(litSelectorDiamond)
                        .attr('fill', track.color)
                    }
                    const selector = `.traj.uId${traj.uniqueId}`;
                    const selectorPluck = selector + '.pluck';
                    const selectorDiamond = selector + '.consonantSymbol';
                    d3.selectAll(selector)
                      .attr('stroke', track.selColor)
                    d3.selectAll(selectorPluck)
                      .attr('fill', track.selColor)
                    d3.selectAll(selectorDiamond)
                      .attr('fill', track.selColor)
                  }
                } else {
                  const selector = `.traj.uId${traj.uniqueId}`;
                  const selectorPluck = selector + '.pluck';
                  const selectorDiamond = selector + '.consonantSymbol';
                  d3.selectAll(selector)
                    .attr('stroke', track.selColor)
                  d3.selectAll(selectorPluck)
                    .attr('fill', track.selColor)
                  d3.selectAll(selectorDiamond)
                    .attr('fill', track.selColor)
                }
                litTrajs.value[idx] = traj;
              } else {
                if (litTraj !== undefined) {
                  const selector = `.traj.uId${litTrajs.value[idx]!.uniqueId}`;
                  const selectorPluck = selector + '.pluck';
                  const selectorDiamond = selector + '.consonantSymbol';
                  d3.selectAll(selector)
                    .attr('stroke', track.color)
                  d3.selectAll(selectorPluck)
                    .attr('fill', track.color)
                  d3.selectAll(selectorDiamond)
                    .attr('fill', track.color)
                  litTrajs.value[idx] = undefined;
                }
              };
              // chikari
              const cs = props.piece.allDisplayChikaris(idx).filter(c => {
                const diff = t - c.time;
                return diff < 0.2 && diff > 0;
              });
              if (cs.length > 0) {
                const newLitChikaris: string[] = [];

                // Highlight new items and collect them in newLitChikaris
                cs.forEach(c => {
                  if (!litChikaris.value[idx].includes(c.uId)) {
                    const selector = '.uId' + c.uId;
                    d3.selectAll(selector).attr('stroke', track.selColor);
                  }
                  newLitChikaris.push(c.uId);
                });

                // Remove highlights from old items not in cs
                litChikaris.value[idx].forEach(c => {
                  if (!cs.map((cdt => cdt.uId)).includes(c)) {
                    const selector = '.uId' + c;
                    d3.selectAll(selector).attr('stroke', track.color);
                  }
                });

                // Update litChikaris.value to the new list
                litChikaris.value[idx] = newLitChikaris;
              } else {
                // Remove highlights from all items
                litChikaris.value[idx].forEach(c => {
                  const selector = '.uId' + c;
                  d3.selectAll(selector).attr('stroke', track.color);
                });
                litChikaris.value[idx] = [];
              }
            }
          })
        }
      } else {
        updatePlayheadPosition(props.currentTime);
      }
    });
    watch(() => props.selectedMeterColor, () => {
      d3.selectAll('.metricGrid.selected')
        .attr('stroke', props.selectedMeterColor)
    });
    watch(() => props.meterColor, () => {
      d3.selectAll('.metricGrid:not(.selected)')
        .attr('stroke', props.meterColor)
    });
    watch(() => props.maxMetricLayer, () => {
      for (let i = 0; i <= 4; i++) {
        d3.selectAll(`.metricGrid.layer${i}`)
          .filter((d, idx: number, nodes) => {
            return !d3.select(nodes[idx]).classed('overlay')
          })
          .style('opacity', i <= props.maxMetricLayer ? 1 : 0)
      }
    });
    watch(selectedMeter, (newVal, oldVal) => {
      if (oldVal !== undefined) {
        const oldSelector = `.metricGrid.meterId${oldVal.uniqueId}`;
        d3.selectAll(oldSelector)
          .classed('selected', false)
          .attr('stroke', props.meterColor)
      }
      if (newVal !== undefined) {
        const selector = `.metricGrid.meterId${newVal.uniqueId}`;
        d3.selectAll(selector)
          .classed('selected', true)
          .attr('stroke', props.selectedMeterColor)
        d3.select(tranSvg.value)
          .attr('cursor', 'default')
        nextTick(() => emit('update:selectedMeter', newVal.allPulses[0].uniqueId))
      } else {
        nextTick(() => emit('update:selectedMeter', undefined))
      }
      d3.selectAll('.metricGrid:not(.selected)')
        .attr('stroke', props.meterColor)
      if (newVal !== undefined) {
        const selector = `.metricGrid.uId${newVal.uniqueId}`;
        d3.selectAll(selector)
          .attr('stroke', props.selectedMeterColor)
      }
    });
    watch(selectedPulse, (newVal, oldVal) => {
      if (oldVal !== undefined) {
        const oldSelector = `#pulseId${oldVal.uniqueId}`;
        const color = selectedMeter.value ? 
          props.selectedMeterColor: 
          props.meterColor;
        d3.selectAll(oldSelector)
          .attr('stroke', color)
      }
      if (newVal !== undefined) {
        const selector = `#pulseId${newVal.uniqueId}`;
        d3.selectAll(selector)
          .attr('stroke', selectedDragDotColor)
      }
    });
    watch(alted, (newVal, oldVal) => {
      if (newVal && selMeterHovering) {
        d3.selectAll('.metricGrid')
          .attr('cursor', 'pointer')
      } else if (!newVal && selMeterHovering) {
        d3.selectAll('.metricGrid')
          .attr('cursor', 'col-resize')
      }      if (props.selectedMode === EditorMode.Trajectory) {
        if (newVal) {
          d3.select(tranSvg.value)
            .attr('cursor', 'not-allowed')
        } else {
          d3.select(tranSvg.value)
            .attr('cursor', 'crosshair')
        }
      }
    });
    watch(insertPulses, newVal => {
      emit('update:insertPulses', newVal);
    });
    watch(regionStartPxl, newVal => {
      if (newVal === undefined) {
        regionStartX.value = undefined;
      } else {
        regionStartX.value = props.xScale.invert(newVal);
      }
    });
    watch(regionEndPxl, newVal => {
      if (newVal === undefined) {
        regionEndX.value = undefined;
      } else {
        regionEndX.value = props.xScale.invert(newVal);
      }
    });
    watch(regionStartX, newVal => {
      if (newVal === undefined) {
        regionStartPxl.value = undefined;
      } else {
        regionStartPxl.value = props.xScale(newVal);
      };
    });
    watch(regionEndX, newVal => {
      if (newVal === undefined) {
        regionEndPxl.value = undefined;
      } else {
        regionEndPxl.value = props.xScale(newVal);
      }
    });
    watch(() => props.playheadColor, newVal => {
      d3.selectAll('.playhead')
        .attr('stroke', newVal)
    });
    watch(() => props.showBols, newVal => {
      d3.selectAll('.bolsG')
        .style('opacity', Number(newVal))
    });
    // watch(() => props.playing, newVal => {
    //   if (newVal) {
    //     console.log('triggering watcher at: ', performance.now()/1000)
    //     // updatePlayheadPosition();
    //     startPlayingTransition();
    //   } else {
    //     stopPlayingTransition();
    //   }
    // });

    const goToTime = () => {
      goToTimeModal.value = false;
      const hours = parseInt(goToHours.value);
      const minutes = parseInt(goToMinutes.value);
      const time = minutes + hours * 60;
      const x = props.xScale(time);
      emit('moveToX', x);
    }
    const smooth = (current: number, target: number, smoothing: number = 0.5) => {
      return current + (target - current) * smoothing;
    }
    let playheadAnimation: Animation | undefined = undefined;

    const replaceSilenceWithConnection = (
        silentTraj: Trajectory, 
        track: number
      ) => {
      if (silentTraj.id !== 12) {
        throw new Error('Trajectory is not silent');
      }
      const phrase = props.piece.phraseGrid[track][silentTraj.phraseIdx!];
      // if (silentTraj.num === 0 || silentTraj.num === phrase.trajectories.length - 1) {
      //   throw new Error('Silent trajectory is at the beginning or end of phrase');
      // }
      let prevTraj: Trajectory | undefined = undefined;
      let nextTraj: Trajectory | undefined = undefined;

      if (silentTraj.num === 0) {
        if (silentTraj.phraseIdx === 0) {
          throw new Error('Silent trajectory is at the beginning of the piece');
        }
        const prevPhrase = props.piece.phraseGrid[track][silentTraj.phraseIdx! - 1];
        prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
        nextTraj = phrase.trajectories[1];
      } else if (silentTraj.num === phrase.trajectories.length - 1) {
        if (silentTraj.phraseIdx === props.piece.phraseGrid[track].length - 1) {
          throw new Error('Silent trajectory is at the end of the piece');
        }
        prevTraj = phrase.trajectories[silentTraj.num! - 1];
        const nextPhrase = props.piece.phraseGrid[track][silentTraj.phraseIdx! + 1];
        nextTraj = nextPhrase.trajectories[0];
      } else {
        prevTraj = phrase.trajectories[silentTraj.num! - 1];
        nextTraj = phrase.trajectories[silentTraj.num! + 1];
      }
      if (prevTraj.id === 12 || nextTraj.id === 12) {
        throw new Error('Adjacent trajectory is silent');
      }
      const p1 = new Pitch(prevTraj.pitches[prevTraj.pitches.length - 1]);
      const p2 = new Pitch(nextTraj.pitches[0]);
      const newTrajId = p1.logFreq === p2.logFreq ? 0 : 1;
      const newTraj = new Trajectory({
        id: newTrajId,
        pitches: [p1, p2],
        durTot: silentTraj.durTot,
        instrumentation: props.piece.instrumentation[track],
        articulations: {},
      });
      removeTraj(silentTraj)
      phrase.trajectories[silentTraj.num!] = newTraj;
      phrase.reset();
      resetTrajRenderStatus()
      renderTraj(newTraj);
      emit('unsavedChanges', true);
    }

    const startPlayingTransition = () => {
      // Only animate if playheadAnimation is Animated; otherwise, update playhead position immediately.
      if (props.playheadAnimation !== PlayheadAnimations.Animated) {
        updatePlayheadPosition(props.currentTime);
        return;
      }
      movingPlayhead = true;
      const startTime = props.audioPlayerRef.regionSpeedOn ? 
          props.audioPlayerRef.getStretchedCurTime() :
          props.audioPlayerRef.getCurTime();
      currentX = props.xScale(startTime);
      playheadMusicStartTime = startTime;
      const animate = () => {
        if (!movingPlayhead) return;
        let curTime = props.audioPlayerRef.regionSpeedOn ? 
          props.audioPlayerRef.getStretchedCurTime() :
          props.audioPlayerRef.getCurTime();

        let targetX = props.xScale(curTime);
        if (
          props.loop &&
          regionEndPxl.value !== undefined &&
          regionStartPxl.value !== undefined &&
          regionEndX.value !== undefined &&
          regionStartX.value !== undefined
        ) {
          const regionStart = regionStartX.value; 
          const regionEnd = regionEndX.value;    
          const regionDuration = regionEnd - regionStart;
          if (curTime >= regionEnd) {
            curTime = regionStart + (curTime - regionEnd);
          }
          targetX =
            regionStartPxl.value +
            ((curTime - regionStart) / regionDuration) *
              (regionEndPxl.value - regionStartPxl.value);
        }
        currentX += (targetX - currentX) * 0.7;
        playhead.value!.setAttribute('transform', `translate(${currentX}, 0)`);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    };

    const stopPlayingTransition = () => {
      // Only perform animated stop if playheadAnimation is Animated; otherwise, update playhead immediately.
      if (props.playheadAnimation !== PlayheadAnimations.Animated) {
        updatePlayheadPosition(props.currentTime);
        return;
      }
      movingPlayhead = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const scrollToPlayhead = () => {
      const curPxl = curPlayheadPxl();
      const diff = curPxl - props.preZoomPlayheadPxl;
      props.scrollingContainer.scrollLeft += diff;
    };
    const scrollToOldMiddle = () => {
      const curLeft = props.scrollingContainer.scrollLeft;
      const timeDiff = curMiddleTime() - props.preZoomMiddleTime;
      const diff = props.xScale(timeDiff);
      props.scrollingContainer.scrollLeft = curLeft - diff;
    }

    const curPlayheadPxl = () => {
      const leftTime = props.xScale.invert(props.scrollingContainer.scrollLeft);
      const diff = props.currentTime - leftTime;
      return props.xScale(diff);
    };
    const curMiddleTime = () => {
      const leftTime = props.xScale.invert(props.scrollingContainer.scrollLeft);
      const halfPxl = props.scrollingContainer.clientWidth / 2;
      const halfTime = props.xScale.invert(halfPxl);
      return leftTime + halfTime;
     
    }

    const updatePlayheadPosition = (time: number) => {
      if (!props.playing) {
        const pxlX = props.xScale(time);
        playhead.value!.setAttribute('transform',`matrix(1, 0, 0, 1, ${pxlX}, 0)`);
        smoothPositionX = pxlX;
        currentSec.value = Math.floor(time);
      } else if (props.playheadAnimation === PlayheadAnimations.Block) {
        const pxlX = props.xScale(time);
        playhead.value!.setAttribute('transform',`matrix(1, 0, 0, 1, ${pxlX}, 0)`);
        smoothPositionX = pxlX;

      } else {
        
        throw new Error('Playing transition not implemented');
      }
    }
  
    const addRegionG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        regionG.value = svg.append('g')
          .attr('class', 'regionG')
      }
    };
    
    // adding svg groups
    const addSargamG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const trackG = tracks[i];
          const sargamG = trackG.append('g')
            .attr('class', `sargamG`)
            .style('opacity', Number(props.showSargam))
        }
      }
    };
    const addChikariG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const trackG = tracks[i];
          trackG.append('g')
            .attr('class', `chikariG`)
            .style('opacity', Number(props.showSargamLines))
        }
      }
    };
    const addSargamLineG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        svg.insert('g', 'rect')
          .attr('class', 'sargamLinesG')
          .style('opacity', Number(props.showSargamLines))
      }
    };
    const addMeterG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        svg.insert('g', 'rect')
          .attr('class', 'meterG')
          .style('opacity', Number(props.showMeter))
      }
    };
    const addPhonemeG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const trackG = tracks[i];
          trackG.append('g')
            .attr('class', `phonemeG`)
            .style('opacity', Number(props.showPhonemes))
        }
      }
    };
    const addTrajG = () => {
      if (tranSvg.value) {
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const trackG = tracks[i];
          trackG.append('g')
            .attr('class', `trajG`)
        }
      }
    };
    const addPhraseDivG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const trackG = tracks[i];
          trackG.append('g')
            .attr('class', `phraseDivG`)
            .style('opacity', Number(props.showPhraseDivs))
        }
      }
    };
    const addBolsG = () => {
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          if (props.piece.instrumentation[i] === Instrument.Sitar) {
            const trackG = tracks[i];
            trackG.append('g')
              .attr('class', `bolsG`)
              .style('opacity', Number(props.showBols))
          }
        }
      }
    };
    const addMarkers = () => {
      const markerBoxWidth = 4;
      const markerBoxHeight= 4;
      const refX = markerBoxWidth / 2;
      const refY = markerBoxHeight / 2;
      const arrowPoints: [number, number][] = [
        [0, 0],
        [0, markerBoxHeight],
        [markerBoxWidth, refY]
      ];
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        const defs = svg.append('defs');
        defs
          .append('marker')
          .attr('id', 'arrow')
          .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
          .attr('refX', refX)
          .attr('refY', refY)
          .attr('markerWidth', markerBoxWidth)
          .attr('markerHeight', markerBoxHeight)
          .attr('orient', 'auto-start-reverse')
          .append('path')
          .attr('d', d3.line()(arrowPoints))
          .attr('fill', 'black')
      }

    }

    // rendering / refreshing functions
    const renderTraj = (traj: Trajectory) => {
      const track = props.piece.trackFromTraj(traj);
      const renderObj = trajRenderStatus.value[track].find(obj => { 
        return obj.uniqueId === traj.uniqueId
      });
      if (renderObj === undefined) {
        throw new Error('Trajectory not found in render status array');
      }
      if (renderObj.renderStatus === true) return;
      if (traj.id !== 12) {
        renderMelodicCurve(traj, track);
        const inst = props.piece.instrumentation[track];
        if (inst === Instrument.Sitar) {
          renderPlucks(traj, track);
          renderDampener(traj, track);
          renderKrintin(traj, track);
        }
        if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
          renderConsonantSymbols(traj, track);
        }
      };
      renderObj.renderStatus = true;
      if (props.piece.instrumentation[track] as Instrument === Instrument.Sitar) {
        refreshTrajChikaris(traj);
      }
    };
    const renderMelodicCurve = (traj: Trajectory, track: number = 0) => {
        
      const trajUIds = props.piece.allTrajectories(track).map(t => t.uniqueId);
      const trajIdx = trajUIds.indexOf(traj.uniqueId);
      const trajStart = trajStartTimes.value[track][trajIdx];
      const trackG = tracks[track];
      const g = trackG.select('.trajG');
      const trajData = makeTrajData(traj, trajStart);
      const color = selectedTrajs.value.includes(traj) ? 
        props.instTracks[track].selColor : props.instTracks[track].color;
      g.append('path')
          .datum(trajData)
          .attr('d', trajCurve)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', '3px')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('class', `traj uId${traj.uniqueId!}`)
        g.append('path')
          .datum(trajData)
          .attr('d', trajCurve)
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', '10px')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('class', `trajShadow uId${traj.uniqueId!}`)
          .style('opacity', '0')
          .on('mouseover', () => handleTrajMouseOver(traj, track))
          .on('mouseout', () => handleTrajMouseOut(traj, track))
          .on('click', () => handleClickTraj(traj, track))
          .on('contextmenu', (e: MouseEvent) => handleTrajContextMenu(traj, track, e))
    };

    // const clearConsonantSymbols = (traj: Trajectory, track: number) => {
    //   const g = tracks[track].select('.trajG');
    //   g.selectAll(`.uId${traj.uniqueId}.consonantSymbol`).remove();
    // };

    const renderConsonantSymbols = (traj: Trajectory, track: number) => {
      const g = tracks[track].select('.trajG');
      g.selectAll(`.uId${traj.uniqueId}.consonantSymbol`).remove();
      const arts = traj.articulations;
      const a = arts['0.00'];
      const c1 = a !== undefined && a.name === 'consonant';
      const b = arts['1.00'];
      const c2 = b !== undefined && b.name === 'consonant';
      // const g = tracks[track].select('.trajG');
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      const sym = d3.symbol()
        .type(d3.symbolDiamond)
        .size(40);
      if (c1) {
        const x = phrase.startTime! + traj.startTime!;
        const y = traj.compute(0, true);
        const scaledX = props.xScale(x);
        const scaledY = props.yScale(y);
        g.append('path')
          .classed('consonantSymbol', true)
          .classed('traj', true)
          .classed(`uId${traj.uniqueId}`, true)
          .attr('d', sym)
          .attr('fill', props.instTracks[track].color)
          .attr('transform', `translate(${scaledX}, ${scaledY})`)
          .on('mouseover', () => handleTrajMouseOver(traj, track))
          .on('mouseout', () => handleTrajMouseOut(traj, track))
          .on('click', () => handleClickTraj(traj, track))
      }
      if (c2) {
        const x = phrase.startTime! + traj.startTime! + traj.durTot;
        const y = traj.compute(1, true);
        const scaledX = props.xScale(x);
        const scaledY = props.yScale(y);
        g.append('path')
          .classed('consonantSymbol', true)
          .classed('traj', true)
          .classed(`uId${traj.uniqueId}`, true)
          .attr('d', sym)
          .attr('fill', props.instTracks[track].color)
          .attr('transform', `translate(${scaledX}, ${scaledY})`)
          .on('mouseover', () => handleTrajMouseOver(traj, track))
          .on('mouseout', () => handleTrajMouseOut(traj, track))
          .on('click', () => handleClickTraj(traj, track))
      }

    };
    const renderPlucks = (traj: Trajectory, track: number) => {
      const trajUIds = props.piece.allTrajectories(track).map(t => t.uniqueId);
      const trajIdx = trajUIds.indexOf(traj.uniqueId);
      const trajStart = trajStartTimes.value[track][trajIdx];
      const trackG = tracks[track];
      const g = trackG.select('.trajG');
      const size = 40;
      const offset = (size ** 0.5) / 2;
      const color = selectedTrajs.value.includes(traj) ? 
        props.instTracks[track].selColor : props.instTracks[track].color;
      const keys = Object.keys(traj.articulations)
        .filter(key => {
          const art = traj.articulations[key];
          return art.name === 'pluck'
        })
      if (keys.length > 0) {
        const pluckData = keys.map(p => {
          const logY = traj.compute(Number(p), true);
          const y = props.yScale(logY);
          const x = props.xScale(trajStart + Number(p));
          return { x, y }
        });
        const sym = d3.symbol()
          .size(size)
          .type(d3.symbolTriangle);
        g.append('path')
          .data(pluckData)
          .attr('d', sym)
          .attr('stroke-width', 1.5)
          .attr('stroke', color)
          .attr('fill', color)
          .attr('transform', d => `translate(${d.x + offset}, ${d.y}) rotate(90)`)
          .classed(`traj pluck uId${traj.uniqueId!}`, true)  
        g.append('path')
          .data(pluckData)
          .attr('d', sym)
          .attr('stroke-width', 3.5)
          .attr('stroke', 'black')
          .attr('transform', d => `translate(${d.x + offset}, ${d.y}) rotate(90)`)
          .style('opacity', '0')
          .classed(`pluckShadow uId${traj.uniqueId!}`, true)
          .on('mouseover', () => handleTrajMouseOver(traj, track))
          .on('mouseout', () => handleTrajMouseOut(traj, track))
          .on('click', () => handleClickTraj(traj, track))
      }
    };
    const renderDampener = (traj: Trajectory, track: number) => {
      const trajUIds = props.piece.allTrajectories(track).map(t => t.uniqueId);
      const trajIdx = trajUIds.indexOf(traj.uniqueId);
      const trajStart = trajStartTimes.value[track][trajIdx];
      const color = selectedTrajs.value.includes(traj) ? 
        props.instTracks[track].selColor : props.instTracks[track].color;
      const keys = Object.keys(traj.articulations)
        .filter(key => traj.articulations[key].name === 'dampen')
      keys.forEach(() => {
        const obj = {
          x: trajStart + traj.durTot,
          y: traj.compute(1, true)
        }
        const trackG = tracks[track];
        const g = trackG.select('.trajG');
        g.append('path')
          .data([obj])
          .attr('d', d3.line()([[-2, -8], [0, -8], [0, 8], [-2, 8]]))
          .attr('stroke', color)
          .attr('stroke-width', '3px')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('fill', 'none')
          .attr('transform', d => {
            return `translate(${props.xScale(d.x)}, ${props.yScale(d.y)})`
          })
          .classed(`traj dampen uId${traj.uniqueId!}`, true)
        g.append('path')
          .data([obj])
          .attr('d', d3.line()([[-2, -8], [0, -8], [0, 8], [-2, 8]]))
          .attr('stroke', 'black')
          .attr('stroke-width', '5px')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('fill', 'none')
          .attr('transform', d => {
            return `translate(${props.xScale(d.x)}, ${props.yScale(d.y)})`
          })
          .style('opacity', '0')
          .classed(`dampenShadow uId${traj.uniqueId!}`, true)
          .on('mouseover', () => handleTrajMouseOver(traj, track))
          .on('mouseout', () => handleTrajMouseOut(traj, track))
          .on('click', () => handleClickTraj(traj, track))
      })
    };
    const renderKrintin = (traj: Trajectory, track: number) => {
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      const startTime = phrase.startTime! + traj.startTime!;
      const keys = Object.keys(traj.articulations);
      // hamer offs
      const hammerOffKeys = keys.filter(key => {
        return traj.articulations[key].name === 'hammer-off'
      });
      const hammerOffData = hammerOffKeys.map((key, kIdx) => {
        const x = props.xScale(startTime + Number(key) * traj.durTot);
        const y = props.yScale(traj.compute(Number(key) - 0.01, true));
        return { x, y, kIdx }
      });
      hammerOffData.forEach(obj => {
        const trackG = tracks[track];
        const g = trackG.select('.trajG');
        const color = 'black';
        g.append('path')
          .classed('articulation', true)
          .classed('hammer-off', true)
          .classed('uId' + traj.uniqueId, true)
          .classed('kIdx' + obj.kIdx, true)
          .attr('d', d3.line()([[-10, 0], [0, 0], [0, 10]]))
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#arrow)')
          .attr('transform', `translate(${obj.x}, ${obj.y})`)
      });
      // hammer ons
      const hammerOnKeys = keys.filter(key => {
        return traj.articulations[key].name === 'hammer-on'
      });
      const hammerOnData = hammerOnKeys.map((key, kIdx) => {
        const x = props.xScale(startTime + Number(key) * traj.durTot);
        const y = props.yScale(traj.compute(Number(key) - 0.01, true));
        return { x, y, kIdx }
      });
      hammerOnData.forEach(obj => {
        const trackG = tracks[track];
        const g = trackG.select('.trajG');
        const color = 'black';
        g.append('path')
          .classed('articulation', true)
          .classed('hammer-on', true)
          .classed('uId' + traj.uniqueId, true)
          .classed('kIdx' + obj.kIdx, true)
          .attr('d', d3.line()([[-10, 0], [0, 0], [0, -10]]))
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#arrow)')
          .attr('transform', `translate(${obj.x}, ${obj.y})`)
      });
      // slides
      const slideKeys = keys.filter(key => {
        return traj.articulations[key].name === 'slide'
      });
      const slideData = slideKeys.map((key, kIdx) => {
        const x = props.xScale(startTime + Number(key) * traj.durTot);
        const y = props.yScale(traj.compute(Number(key) - 0.01, true));
        const dirUp = props.yScale(traj.compute(Number(key), true)) < y;
        return { x, y, kIdx, dirUp }
      });
      slideData.forEach(obj => {
        const yMotion = obj.dirUp ? [10, -10] : [-10, 10];
        const trackG = tracks[track];
        const g = trackG.select('.trajG');
        const color = 'black';
        g.append('path')
          .classed('articulation', true)
          .classed('slide', true)
          .classed('uId' + traj.uniqueId, true)
          .classed('kIdx' + obj.kIdx, true)
          .attr('d', d3.line()([[0, yMotion[0]], [0, yMotion[1]]]))
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#arrow)')
          .attr('transform', `translate(${obj.x}, ${obj.y})`)
      });

    }
    const renderChikari = (cd: ChikariDisplayType) => {
      const sym = d3.symbol().type(d3.symbolX).size(80);
      const trajIdxAtTime = props.piece.trajStartTimes(cd.track)
        .reduceRight((lastIndex, t, index) => {
        return t <= cd.time && lastIndex === -1 ? index : lastIndex;
      }, -1);
      const traj = props.piece.allTrajectories(cd.track)[trajIdxAtTime];
      const trajStart = props.piece.trajStartTimes(cd.track)[trajIdxAtTime];
      const durTot = traj.durTot;
      const xTime = (cd.time - trajStart) / durTot;
      let logFreq = Math.log2(props.piece.raga.fundamental);
      if (traj.id !== 12) {
        logFreq = traj.compute(xTime, true);
      }
      const y = props.yScale(logFreq);
      const x = props.xScale(cd.time);
      const trackG = tracks[cd.track];
      const g = trackG.select('.chikariG');
      const color = (selectedChikari.value && selectedChikari.value.uId === cd.uId) ? 
        props.instTracks[cd.track].selColor : 
        props.instTracks[cd.track].color;  
      g.append('path')
        .attr('d', sym)
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('transform', d => `translate(${x}, ${y})`)
        .attr('class', `chikari uId${cd.uId}`)
      g.append('path')
        .attr('d', sym)
        .attr('stroke', 'black')
        .attr('stroke-width', 5)
        .attr('stroke-linecap', 'round')
        .style('opacity', 0)
        .attr('transform', d => `translate(${x}, ${y})`)
        .attr('class', `chikariShadow uId${cd.uId}`)
        .on('click', () => handleClickChikari(cd))
        .on('mouseover', () => handleChikariMouseOver(cd))
        .on('mouseout', () => handleChikariMouseOut(cd))
    }
    const renderSargam = (s: SargamDisplayType) => {
      const svg = d3.select(tranSvg.value);
      const y = props.yScale(s.logFreq);
      const x = props.xScale(s.time);
      const positions = [
          { x: 0, y: 15 },
          { x: 0, y: -15 },
          { x: -5, y: -15 },
          { x: -5, y: 15 },
          { x: 5, y: -15 },
          { x: 5, y: 15 }
        ]
      const choices = Object.values(SargamRepresentation);
      const opacities = choices.map(c => {
        return c === props.sargamRepresentation ? 1 : 0;
      });
      const track = props.piece.trackFromTrajUId(s.uId);
      const trackG = tracks[track];
      const g = trackG.select('.sargamG');
      g.append('text')
        .text(s.sargam)
        .attr('x', x + positions[s.pos!].x)
        .attr('y', y + positions[s.pos!].y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'black')
        .attr('class', `sargamLabel sargam uId${s.uId}`)
        .attr('opacity', opacities[0])
      g.append('text')
        .text(s.solfege)
        .attr('x', x + positions[s.pos!].x)
        .attr('y', y + positions[s.pos!].y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'black')
        .attr('class', `sargamLabel solfege uId${s.uId}`)
        .attr('opacity', opacities[1])
      g.append('text')
        .text(s.pitchClass)
        .attr('x', x + positions[s.pos!].x)
        .attr('y', y + positions[s.pos!].y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'black')
        .attr('class', `sargamLabel pitchClass uId${s.uId}`)
        .attr('opacity', opacities[2])
      g.append('text')
        .text(s.westernPitch)
        .attr('x', x + positions[s.pos!].x)
        .attr('y', y + positions[s.pos!].y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'black')
        .attr('class', `sargamLabel westernPitch uId${s.uId}`)
        .attr('opacity', opacities[3])
      
    };

    const refreshBol = (b: BolDisplayType) => {
      d3.select(`.bolLabel.uId${b.uId}`).remove();
      renderBol(b);
    }

    const renderBol = (b: BolDisplayType) => {
      const y = props.yScale(b.logFreq);
      const x = props.xScale(b.time);
      const track = props.piece.trackFromTrajUId(b.uId);
      const trackG = tracks[track];
      const g = trackG.select('.bolsG');
      // console.log(b.bol, b.time)
      g.append('text')
        .text(b.bol)
        .attr('x', x)
        .attr('y', y - 15)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'black')
        .attr('class', `bolLabel uId${b.uId}`)
    };

    const renderVowel = (v: VowelDisplayType) => {
      const svg = d3.select(tranSvg.value);
      const verticalOffset = 14;
      const y = props.yScale(v.logFreq) - verticalOffset;
      const x = props.xScale(v.time);
      const track = props.piece.trackFromTrajUId(v.uId);
      const trackG = tracks[track];
      const g = trackG.select('.phonemeG');
      const choices = ['IPA', 'Devanagari', 'English'];
      const opacities = choices.map(c => {
        return c === props.phonemeRepresentation ? 1 : 0;
      });
      const selTs = selectedTrajs.value.map(t => t.uniqueId);
      const color = selTs.includes(v.uId) ? 
        props.instTracks[track].selColor : 
        'black';
        
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `vowelLabel IPA uId${v.uId}`)
        .attr('opacity', opacities[0])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(v.ipaText)
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `vowelLabel Devanagari uId${v.uId}`)
        .attr('opacity', opacities[1])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(v.devanagariText)
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `vowelLabel Latin uId${v.uId}`)
        .attr('opacity', opacities[2])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(v.englishText)
    };
    const renderEndingConsonant = (c: ConsonantDisplayType) => {
      const svg = d3.select(tranSvg.value);
      const verticalOffset = 14;
      const y = props.yScale(c.logFreq) - verticalOffset;
      const x = props.xScale(c.time);
      const track = props.piece.trackFromTrajUId(c.uId);
      const trackG = tracks[track];
      const g = trackG.select('.phonemeG');
      const choices = ['IPA', 'Devanagari', 'English'];
      const opacities = choices.map(c => {
        return c === props.phonemeRepresentation ? 1 : 0;
      });
      const selTs = selectedTrajs.value.map(t => t.uniqueId);
      const color = selTs.includes(c.uId) ? 
        props.instTracks[track].selColor : 
        'black';
        'black';
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `consonantLabel IPA uId${c.uId}`)
        .attr('opacity', opacities[0])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(c.ipaText)
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `consonantLabel Devanagari uId${c.uId}`)
        .attr('opacity', opacities[1])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(c.devanagariText)
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 15)
        .attr('stroke', color)
        .attr('class', `consonantLabel Latin uId${c.uId}`)
        .attr('opacity', opacities[2])
        .attr('transform', d => `translate(${x}, ${y})` )
        .text(c.englishText)
    };
    const renderPhraseDiv = (pd: PhraseDivDisplayType) => {
      const x = props.xScale(pd.time);
      const thickness = pd.type === 'section' ? 4 : 2;
      const y1 = props.yScale.range()[0];
      const y2 = props.yScale.range()[1];
      const trackG = tracks[pd.track];
      const g = trackG.select('.phraseDivG');
      const color = selectedPhraseDivUid.value === pd.uId ? 
        props.instTracks[pd.track].selColor : props.instTracks[pd.track].color;
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('stroke', color)
        .attr('stroke-width', thickness)
        .attr('class', `phraseDiv pIdx${pd.idx} uId${pd.uId}`)
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('stroke', 'white')
        .attr('stroke-width', 8)
        .style('opacity', 0)
        .attr('cursor', 'pointer')
        .on('click', () => handleClickPhraseDiv(pd))
        .attr('class', `phraseDivShadow pIdx${pd.idx} uId${pd.uId}`)
    };
    const renderMeter = (meter: Meter) => {
      d3.selectAll('.metricGrid.meterId' + meter.uniqueId).remove();
      const pulses = meter.allCorporealPulses;
      const layerWidth = [1.5, 1, 0.5, 0.25];
      pulses.forEach((pulse => {
        let color = meter === selectedMeter.value ? 
        props.selectedMeterColor : props.meterColor;
        if (selectedPulse.value && pulse.uniqueId === selectedPulse.value!.uniqueId) {
          color = selectedDragDotColor;
        }
        const x = props.xScale(pulse.realTime);
        let strokeWidth = layerWidth[pulse.lowestLayer];
        if (pulse.lowestLayer === 0 && pulse.affiliations[0].strong) {
          strokeWidth += 0.5;
          if (pulse.affiliations[0].segmentedMeterIdx === 0) {
            strokeWidth += 0.5;
          }
        }
        const drag = (pulse: Pulse) => {
          return d3.drag<SVGPathElement, Datum>()
            .on('start', pulseDragStart(pulse))
            .on('drag', pulseDragging(pulse))
            .on('end', pulseDragEnd(pulse))
        };
        const opacity = props.maxMetricLayer >= pulse.lowestLayer ? 1 : 0;
        const line = d3.line()([
          [0, props.yScale(logMin.value)],
          [0, props.yScale(logMax.value)]
        ])
        const g = d3.select('.meterG');
        const p = g.append('path')
          .classed('metricGrid', true)
          .classed(`layer${pulse.lowestLayer}`, true)
          .classed(`meterId${pulse.meterId}`, true)
          .attr('id', `pulseId${pulse.uniqueId}`)
          .attr('stroke', color)
          .attr('stroke-width', strokeWidth)
          .attr('d', line)
          .attr('opacity', opacity)
          .attr('transform', `translate(${x},0)`)
          
        const pOverlay = g.append('path')
          .classed('metricGrid', true)
          .classed(`layer${pulse.lowestLayer}`, true)
          .classed(`meterId${pulse.meterId}`, true)
          .classed('overlay', true)
          .attr('id', `pulseId${pulse.uniqueId}`)
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', '6px')
          .attr('d', line)
          .attr('transform', `translate(${x},0)`)
          .on('mouseover', () => {
            if (props.selectedMode === EditorMode.Meter) {
              handleMouseOverMeter(meter)
            }
          })
          .on('mouseout', () => {
            if (props.selectedMode === EditorMode.Meter) {
              handleMouseOutMeter(meter)
            }
          })
          .on('click', (e) => {
            if (props.selectedMode === EditorMode.Meter) {
              handleClickMeter(meter, pulse, e)
            }
          }) as 
          d3.Selection<SVGPathElement, Datum, HTMLElement, any>;
        if (selectedMeter.value === meter) {
          p.classed('selected', true)
          pOverlay.classed('selected', true)
        }
        pOverlay.call(drag(pulse))
      }))
    };

    const pulseDragStart = (pulse: Pulse) => {
      return (e: d3.D3DragEvent<HTMLDivElement, any, MouseEvent>) => {
        if (props.selectedMode !== EditorMode.Meter) return;
        if (alted.value) return
        const aff = pulse.affiliations[0];
        const meter = props.piece.meters.find(m => m.uniqueId === pulse.meterId)!;
        if (pulse === meter.allCorporealPulses[0]) return

        // if (aff.idx === 0 && aff.layer === 0 && aff.segmentedMeterIdx === 0) return;
        if (selectedMeter.value && pulse.meterId === selectedMeter.value.uniqueId) {
          pulseDragEnabled = true;
        }
      }
    };
    const pulseDragging = (pulse: Pulse) => {
      return (e: d3.D3DragEvent<HTMLDivElement, any, MouseEvent>) => {
        if (props.selectedMode !== EditorMode.Meter) return;
        const c1 = selectedMeter.value;
        const c2 = pulse.meterId === selectedMeter.value!.uniqueId;
        if (c1 && c2 && props.editable) {
          const aff = pulse.affiliations[0];
          const psId = aff.psId;
          const ps = selectedMeter.value!.getPSFromId(psId);
          let minTime, maxTime;

          if (aff.idx === 0 && aff.segmentedMeterIdx === 0 && aff.layer === 0) {
            const psIdx = selectedMeter.value!.pulseStructures[0].indexOf(ps);
            let cycleNum, subdivs;
            const hierarchy = selectedMeter.value!.hierarchy[0];
            if (typeof hierarchy === 'number') {
              cycleNum = psIdx
              subdivs = hierarchy
            } else {
              cycleNum = Math.floor(psIdx / hierarchy.length);
              subdivs = sum(hierarchy);
            }
            const st = selectedMeter.value!.startTime;
            const center = st + selectedMeter.value!.cycleDur * cycleNum;
            const subDur = selectedMeter.value!.cycleDur / subdivs;
            const maxOff = subDur / 2;
            maxTime = center + maxOff;
            minTime = center - maxOff;
          } else {
            const maxOff = ps.pulseDur / 2;
            const pulseIdx = ps.pulses.map(p => p.uniqueId).indexOf(pulse.uniqueId);
            const center = ps.startTime + ps.pulseDur * pulseIdx;
            maxTime = center + maxOff;
            minTime = center - maxOff;
          }
          let newX = e.x;
          if (newX < props.xScale(minTime)) {
            newX = props.xScale(minTime);
          } else if (newX > props.xScale(maxTime)) {
            newX = props.xScale(maxTime);
          }
          if (pulseDragEnabled) {
            d3.select(`#pulseId${pulse.uniqueId}`)
              .attr('transform', `translate(${newX},0)`)
          }
        }
      }
    }

    const pulseDragEnd = (pulse: Pulse) => {
      return (e: d3.D3DragEvent<HTMLDivElement, any, MouseEvent>) => {
        if (props.selectedMode !== EditorMode.Meter) return;

        if (pulseDragEnabled && props.editable) {
          const aff = pulse.affiliations[0];
          const psId = aff.psId;
          const ps = selectedMeter.value!.getPSFromId(psId);
          let minTime, maxTime;

          if (aff.idx === 0 && aff.segmentedMeterIdx === 0 && aff.layer === 0) {
            const psIdx = selectedMeter.value!.pulseStructures[0].indexOf(ps);
            let cycleNum, subdivs;
            const hierarchy = selectedMeter.value!.hierarchy[0];
            if (typeof hierarchy === 'number') {
              cycleNum = psIdx
              subdivs = hierarchy
            } else {
              cycleNum = Math.floor(psIdx / hierarchy.length);
              subdivs = sum(hierarchy);
            }
            const st = selectedMeter.value!.startTime;
            const center = st + selectedMeter.value!.cycleDur * cycleNum;
            const subDur = selectedMeter.value!.cycleDur / subdivs;
            const maxOff = subDur / 2;
            maxTime = center + maxOff;
            minTime = center - maxOff;
          } else {
            const maxOff = ps.pulseDur / 2;
            const pulseIdx = ps.pulses.map(p => p.uniqueId).indexOf(pulse.uniqueId);
            const center = ps.startTime + ps.pulseDur * pulseIdx;
            maxTime = center + maxOff;
            minTime = center - maxOff;
          }
          let newX = e.x;
          if (newX < props.xScale(minTime)) {
            newX = props.xScale(minTime);
          } else if (newX > props.xScale(maxTime)) {
            newX = props.xScale(maxTime);
          }
          const oldTime = pulse.realTime;
          const newTime = props.xScale.invert(newX);
          const time = newTime - oldTime;
          selectedMeter.value!.offsetPulse(pulse, time, true);
          selectedMeter.value!.resetTempo();
          renderMeter(selectedMeter.value!);
          pulseDragEnabled = false;
          emit('unsavedChanges', true);
        }
      }
    }
    const handleMouseOverMeter = (meter: Meter) => {
      if (props.selectedMode === EditorMode.Meter) {
        if (selectedMeter.value && selectedMeter.value === meter) {
          const cursor = alted.value ? 'pointer' : 'col-resize';
          d3.selectAll(`.metricGrid.meterId${meter.uniqueId}`)
            .attr('cursor', cursor)
          selMeterHovering = true;
        } else {
          d3.selectAll(`.metricGrid.meterId${meter.uniqueId}`)
            .attr('cursor', 'pointer')
            .attr('stroke', props.selectedMeterColor)
        }
      }
      meterHovering = meter;
    };
    const handleMouseOutMeter = (meter: Meter) => {
      const meterMode = props.selectedMode === EditorMode.Meter;
      d3.selectAll(`.metricGrid.meterId${meter.uniqueId}:not(.selected)`)
        .attr('stroke', props.meterColor)
        .attr('cursor', meterMode ? 'crosshair' : 'default')
      selMeterHovering = false;
      meterHovering = undefined;
    };
    const handleClickMeter = (meter: Meter, pulse: Pulse, e: MouseEvent) => {
      const c1 = props.selectedMode === EditorMode.Meter;
      if (c1) {
        e.preventDefault();
        e.stopPropagation();
        if (meter === selectedMeter.value) {
          selectedPulse.value = pulse;
        } else {
          selectedMeter.value = meter;
        }
      }
    }

    // clearing / removing functions
    const clearTranscription = () => {
      d3.selectAll('.trajG').remove();
      d3.selectAll('.sargamG').remove();
      d3.selectAll('.phonemeG').remove();
      d3.selectAll('.phraseDivG').remove();
      d3.selectAll('.sargamLinesG').remove();
      d3.selectAll('.chikariG').remove();
      d3.selectAll('.bolsG').remove();
      d3.selectAll('.regionG').remove();
      d3.selectAll('.meterG').remove();

    };
    const removeTraj = (traj: Trajectory) => {
      const track = props.piece.trackFromTraj(traj);
      const renderObj = trajRenderStatus.value[track].find(obj => {
        return obj.uniqueId === traj.uniqueId
      });
      if (renderObj === undefined) {
        throw new Error('Trajectory not found in render status array');
      }
      // const trajG = tracks[track].select('.trajG');
      d3.selectAll(`.uId${traj.uniqueId}`).remove();
      if (renderObj.renderStatus === false) return;
      renderObj.renderStatus = false;
    };
    const clearSargam = (uId: string) => {
      const g = d3.select('.sargamG');
      g.selectAll(`.uId${uId}`).remove();
    };
    const clearVowel = (uId: string) => {
      const g = d3.select('.phonemeG');
      g.selectAll(`.vowelLabel.uId${uId}`).remove();
    };
    const clearEndingConsonant = (uId: string) => {
      const g = d3.select('.phonemeG');
      g.selectAll(`.consonantLabel.uId${uId}`).remove();
    };
    const removePhraseDiv = (uId: string) => {
      const track = props.piece.trackFromPhraseUId(uId);
      const g = tracks[track].select('.phraseDivG');
      g.selectAll(`.uId${uId}`).remove();
    };
    const clearChikari = (cd: ChikariDisplayType) => {
      const trackG = tracks[cd.track];
      const g = trackG.select('.chikariG');
      const selected = g.selectAll(`.uId${cd.uId}`);
      selected.remove();
    };

    const resetTranscription = () => {
      clearTranscription();
      const selectedTrajUIds = selectedTrajs.value.map(t => t.uniqueId!);
      resetTrajRenderStatus(selectedTrajUIds);
      resetEmptyObserverDivs();
      resetObserver();
      addMarkers();
      addSargamLineG();
      refreshSargamLines();
      addMeterG();
      initializeTracks();
      addPhraseDivG();
      addRegionG();
      addSargamG();
      addPhonemeG();
      addBolsG();
      addTrajG();
      addChikariG();
      clearDragDots();
      refreshDragDots();
      renderInsertPulses();
      if (regionStartX.value !== undefined && regionEndX.value !== undefined) {
        setUpRegion();
      }
      // updatePlayhead();
    };

    const deletePhraseDiv = (uId: string) => {
      const phrase = props.piece.phraseFromUId(uId);
      const track = props.piece.trackFromPhraseUId(uId);
      removePhraseDiv(uId);
      const prevPhrase = props.piece.phraseGrid[track][phrase.pieceIdx! - 1];
      const chikKeys = Object.keys(phrase.chikaris);
      chikKeys.forEach(key => {
        // console.log(key, prevPhrase.durTot)
        const newKey = (prevPhrase.durTot! + Number(key)).toFixed(2);
        prevPhrase.chikaris[newKey] = phrase.chikaris[key];
      })
      prevPhrase.trajectories.push(...phrase.trajectories);
      prevPhrase.consolidateSilentTrajs();
      props.piece.phraseGrid[track].splice(phrase.pieceIdx!, 1);
      props.piece.durArrayFromPhrases();
      justDeletedPhraseDiv = true;
      selectedPhraseDivUid.value = undefined;
      emit('unsavedChanges', true);
      emit('update:selPhraseDivUid', undefined);
      if (props.piece.sectionStartsGrid[track].includes(phrase.pieceIdx!)) {
        const sectionIdx = props.piece.sectionStartsGrid[track].indexOf(phrase.pieceIdx!);
        props.piece.sectionStartsGrid[track].splice(sectionIdx, 1);
        props.piece.sectionCatGrid[track].splice(sectionIdx, 1);
        props.piece.adHocSectionCatGrid[track].splice(sectionIdx, 1);
      }
      emit('update:xAxisPhraseLabels')
    }

    const deleteTrajs = (trajs: Trajectory[]) => {
      const affectedPhrases: Phrase[] = [];
      trajs.forEach(traj => {
        removeTraj(traj);
        clearSargam(traj.uniqueId!)
        const track = props.piece.trackFromTraj(traj);
        const inst = props.piece.instrumentation[track] as Instrument;
        if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
          clearVowel(traj.uniqueId!);
          clearEndingConsonant(traj.uniqueId!);
        }
        trajRenderStatus.value[track] = trajRenderStatus.value[track]
          .filter(obj => {
            return obj.uniqueId !== traj.uniqueId
          });
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        if (affectedPhrases.indexOf(phrase) === -1) {
          affectedPhrases.push(phrase);
        }
        const silentTraj = new Trajectory({
          id: 12,
          durTot: traj.durTot,
          fundID12: traj.fundID12,
          instrumentation: props.piece.instrumentation[track],
          num: traj.num,
        });
        phrase.trajectories.splice(traj.num!, 1, silentTraj);
        if (phrase.trajectories.length > traj.num! + 1) {
          const nextTraj = phrase.trajectories[traj.num! + 1];
          const instName = props.piece.instrumentation[track];
          const vox = ([Instrument.Vocal_M, Instrument.Vocal_F]).includes(instName);
          if (nextTraj.id !== 12 && vox) {
            refreshVowel(nextTraj.uniqueId!)
          }
          for (let add = 1; add + traj!.num! < phrase.trajectories.length; add++) {
            const laterTraj = phrase.trajectories[traj.num! + add];
            if (laterTraj.id !== 12) {
              refreshSargam(laterTraj.uniqueId!);
            }
          }
        }
        refreshDragDots();
      })
      affectedPhrases.forEach(p => {
        p.consolidateSilentTrajs();
        refreshPhraseChikaris(p);
      })
      props.piece.durArrayFromPhrases();
      emit('unsavedChanges', true);
      resetTrajRenderStatus()
    }

    const initializeTracks = () => {
      // for the number of instrumental tracks, have a different <g> element
      // for each track. I'd like to store these g's in an array.
      if (tranSvg.value) {
        const svg = d3.select(tranSvg.value);
        svg.selectAll('.transcriptionG').remove();
        tracks.length = 0;
        const transcriptionG = svg.insert('g', 'rect')
          .attr('class', 'transcriptionG')
        for (let i = 0; i < props.piece.instrumentation.length; i++) {
          const g = transcriptionG.append('g')
            .attr('class', `track${i}`)
            .style('opacity', Number(props.instTracks[i].displaying))
          tracks.push(g);
        }
      }
    }

    const makeTrajData = (traj: Trajectory, realStartTime: number) => {
      const endTime = realStartTime + traj.durTot;
      const timePts = Math.round((endTime - realStartTime) / props.minDrawDur);
      const drawTimes = linSpace(realStartTime, endTime, timePts);
      const drawXs = drawTimes.map(t => {
        return (t - realStartTime) / (endTime - realStartTime)
      });
      const drawYs = drawXs.map(x => traj.compute(x, true));
      return drawYs.map((y, idx) => {
        return { x: drawTimes[idx], y }
      });
    };

    const horizontalMoveGraph = (amt: number) => {
      emit('horizontalMoveGraph', amt);
    };

    const verticalMoveGraph = (amt: number) => {
      emit('verticalMoveGraph', amt);
    }

    const moveToPhraseUid = (uId: string) => {
      const phrase = props.piece.phraseFromUId(uId);
      const time = phrase.startTime!;
      const x = props.xScale(time);
      emit('moveToX', x);
    }

    const currentPhrase = () => {
      const tolerance = 0.1;
      const time = props.xScale.invert(props.scrollingContainer.scrollLeft);
      const starts = props.piece.phraseGrid[props.editingInstIdx]
        .map(p => p.startTime!);
      const idx = starts.reduceRight((lastIndex, t, index) => {
        return t <= time + tolerance && lastIndex === -1 ? index : lastIndex;
      }, -1);
      return [props.editingInstIdx, idx];
    }

    const moveToPhrase = (track: number, phraseIdx: number) => {
      const phrase = props.piece.phraseGrid[track][phraseIdx];
      moveToPhraseUid(phrase.uniqueId);
    };
    const moveToNextPhrase = () => {
      const [track, idx] = currentPhrase();
      if (idx < props.piece.phraseGrid[track].length - 1) {
        moveToPhrase(track, idx + 1);
      }
    };

    const moveToPrevPhrase = () => {
      const [track, idx] = currentPhrase();
      if (idx > 0) {
        moveToPhrase(track, idx - 1);
      }
    };

    const trajCurve = d3.line<{ x: number, y: number }>()
      .x(d => props.xScale(d.x))
      .y(d => props.yScale(d.y))
      .curve(d3.curveMonotoneX);

    const handleTrajContextMenu = (traj: Trajectory, track: number, e: MouseEvent) => {
      if (props.selectedMode === EditorMode.Meter) return;
      e.preventDefault();
      e.stopPropagation();
      const tIdx = traj.num!;
      const pIdx = traj.phraseIdx!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      contextMenuX.value = e.offsetX;
      contextMenuY.value = e.offsetY;
      if (traj.groupId === undefined) {
        let insertSilenceLeft = false;
        let insertSilenceRight = false;
        let insertFixedLeft = false;
        let insertFixedRight = false;
        let transcribeTrajRight = false;
        let transcribeTrajLeft = false;
        if (phrase.trajectories.length > tIdx + 1) {
          const nextTraj = phrase.trajectories[tIdx + 1];
          if (nextTraj.id !== 12) {
            insertSilenceRight = true;
          } 
          if (nextTraj.id !== 0 && traj.id !== 0) {
            insertFixedRight = true;
          }
          if (nextTraj.id === 12) {
            transcribeTrajRight = true;
          }
        } else if (props.piece.phraseGrid[track].length > pIdx + 1) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          if (nextPhrase.trajectories.length > 0) {
            const nextTraj = nextPhrase.trajectories[0];
            if (nextTraj.id !== 12) {
              insertSilenceRight = true;
            }
            if (nextTraj.id !== 0 && traj.id !== 0) {
              insertFixedRight = true;
            }
            if (nextTraj.id === 12) {
              transcribeTrajRight = true;
            }
          }
        }
        if (tIdx > 0) {
          const prevTraj = phrase.trajectories[tIdx - 1];
          if (prevTraj.id !== 12) {
            insertSilenceLeft = true;
          }
          if (prevTraj.id !== 0 && traj.id !== 0) {
            insertFixedLeft = true;
          }
          if (prevTraj.id === 12) {
            transcribeTrajLeft = true;
          }
        } else if (pIdx > 0) {
          const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
          if (prevPhrase.trajectories.length > 0) {
            const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
            if (prevTraj.id !== 12) {
              insertSilenceLeft = true;
            }
            if (prevTraj.id !== 0 && traj.id !== 0) {
              insertFixedLeft = true;
            }
            if (prevTraj.id === 12) {
              transcribeTrajLeft = true;
            }
          }
        }
        contextMenuChoices.value = [];
        if (insertSilenceLeft) {
          contextMenuChoices.value.push({
            text: 'Insert Silence Left',
            action: () => {
              insertSilentTrajLeft(traj, track);
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        };
        if (insertSilenceRight) {
          contextMenuChoices.value.push({
            text: 'Insert Silence Right',
            action: () => {
              insertSilentTrajRight(traj, track);
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        };
        if (insertFixedLeft) {
          contextMenuChoices.value.push({
            text: 'Insert Fixed Pitch Left',
            action: () => {
              insertFixedTrajLeft(traj, track);
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        };
        if (insertFixedRight) {
          contextMenuChoices.value.push({
            text: 'Insert Fixed Pitch Right',
            action: () => {
              insertFixedTrajRight(traj, track);
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        };
        if (transcribeTrajRight) {
          contextMenuChoices.value.push({
            text: 'Attach Trajectory Right',
            action: () => {
              emit('update:selectedMode', EditorMode.Trajectory);
              nextTick(() => {
                const time = phrase.startTime! + traj.startTime! + traj.durTot + 0.0000001;
                const logFreq = traj.logFreqs[traj.logFreqs.length - 1];
                const thisPIdx = traj.num === phrase.trajectories.length - 1 ? pIdx + 1 : pIdx;
                insertNewTrajDot(time, logFreq, track, thisPIdx);
                contextMenuClosed.value = true;
              })
            },
            enabled: props.editable
          })
        };
        if (transcribeTrajLeft) {
          contextMenuChoices.value.push({
            text: 'Attach Trajectory Left',
            action: () => {
              emit('update:selectedMode', EditorMode.Trajectory);
              nextTick(() => {
                const time = phrase.startTime! + traj.startTime! - 0.000001;
                const logFreq = traj.logFreqs[0];
                const thisPIdx = traj.num === 0 ? pIdx - 1 : pIdx;
                insertNewTrajDot(time, logFreq, track, thisPIdx, traj.num === 0);
                contextMenuClosed.value = true;
              })
            },
            enabled: props.editable
          })
        }
        if (canConnectToUpcomingTraj(traj, track)) {
          contextMenuChoices.value.push({
            text: 'Connect to next Traj',
            action: () => {
              contextMenuClosed.value = true;
              const phrase = props.piece.phraseGrid[track][pIdx];
              const silTraj = phrase.trajectories[tIdx + 1];
              replaceSilenceWithConnection(silTraj, track);
            },
            enabled: props.editable
          })
        };
        if (canConnectToEarlierTraj(traj, track)) {
          contextMenuChoices.value.push({
            text: 'Connect to last Traj',
            action: () => {
              contextMenuClosed.value = true;
              const phrase = props.piece.phraseGrid[track][pIdx];
              const silTraj = phrase.trajectories[tIdx - 1];
              replaceSilenceWithConnection(silTraj, track);
            },
            enabled: props.editable
          })
        };
        const sts = selectedTrajs.value;
        const stsGrouped = sts.length === sts.filter(t => t.groupId === sts[0].groupId).length;
        if (tIdx > 0) {
          const pt = phrase.trajectories[tIdx - 1];
          if (pt.groupId !== undefined && sts.includes(pt) && stsGrouped) {
            contextMenuChoices.value.push({
              text: 'Add to Selected Group',
              action: () => {
                addTrajToSelectedGroup(traj, track);
                contextMenuClosed.value = true;
              },
              enabled: props.editable
            })
          }
        }
        if (phrase.trajectories.length > tIdx + 1) {
          const nt = phrase.trajectories[tIdx + 1];
          if (nt.groupId !== undefined && sts.includes(nt) && stsGrouped) {
            contextMenuChoices.value.push({
              text: 'Add to Selected Group',
              action: () => {
                addTrajToSelectedGroup(traj, track);
                contextMenuClosed.value = true;
              },
              enabled: props.editable
            })
          }
        }
        
        const selTrajCond = sts.length === 1 && sts[0] === traj;
        const sarangi = props.piece.instrumentation[track] === Instrument.Sarangi;
        const vocal = ([Instrument.Vocal_M, Instrument.Vocal_F]).includes(props.piece.instrumentation[track]);
        if (
          (sts.length === 0 || selTrajCond) &&
          (sarangi || vocal)
        ) {
          contextMenuChoices.value.push({
            text: 'Adjust Volume',
            action: () => {
              const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
              const startTime = phrase.startTime! + traj.startTime!;
              const xStart = props.xScale(startTime);
              const xEnd = props.xScale(startTime + traj.durTot);
              autoWindowWidth.value = xEnd - xStart + 40;
              const minLogFreq = Math.min(...traj.logFreqs);
              const maxLogFreq = Math.max(...traj.logFreqs);
              const yPxl = props.yScale(minLogFreq);
              autoTrajs.value = [traj];
              autoWindowOpen.value = true;
              autoWindowX.value = xStart - 20;
              autoWindowY.value = yPxl + 20;
              if (autoWindowY.value + 100 > props.height) {
                const yBottomPxl = props.yScale(maxLogFreq);
                autoWindowY.value = yBottomPxl - 120;
              }
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        } else if (groupable.value && (sarangi || vocal)) {
          contextMenuChoices.value.push({
            text: 'Adjust Volume',
            action: () => {
              const startTraj = sts[0];
              const startTime = phrase.startTime! + startTraj.startTime!;
              const endTraj = sts[sts.length - 1];
              const endPIdx = endTraj.phraseIdx!;
              const endPhrase = props.piece.phraseGrid[track][endPIdx];
              const xStart = props.xScale(startTime);
              const endTime = endPhrase.startTime! + endTraj.startTime! + endTraj.durTot;
              const xEnd = props.xScale(endTime);
              autoWindowWidth.value = xEnd - xStart + 40;
              let minLogFreq = Infinity;
              let maxLogFreq = -Infinity;
              sts.forEach(t => {
                const min = Math.min(...t.logFreqs);
                const max = Math.max(...t.logFreqs);
                if (min < minLogFreq) {
                  minLogFreq = min;
                }
                if (max > maxLogFreq) {
                  maxLogFreq = max;
                }
              });
              const yPxl = props.yScale(minLogFreq);
              autoTrajs.value = sts;
              autoWindowOpen.value = true;
              autoWindowX.value = xStart - 20;
              autoWindowY.value = yPxl + 20;
              if (autoWindowY.value + 100 > props.height) {
                const yBottomPxl = props.yScale(maxLogFreq);
                autoWindowY.value = yBottomPxl - 120;
              }
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        }
      } else {
        let groupInsertSilenceLeft = false;
        let groupInsertSilenceRight = false;
        let groupInsertFixedLeft = false;
        let groupInsertFixedRight = false;
        const group = phrase.getGroupFromId(traj.groupId!)!;
        const firstTraj = group.trajectories[0];
        const lastTraj = group.trajectories[group.trajectories.length - 1];
        if (phrase.trajectories.length > lastTraj.num! + 1) {
          const nextTraj = phrase.trajectories[lastTraj.num! + 1];
          if (nextTraj.id === 12) {
            groupInsertSilenceRight = true;
          } 
          if (nextTraj.id !== 0 && lastTraj.id !== 0) {
            groupInsertFixedRight = true;
          }
        } else if (props.piece.phraseGrid[track].length > pIdx + 1) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          if (nextPhrase.trajectories.length > 0) {
            const nextTraj = nextPhrase.trajectories[0];
            if (nextTraj.id !== 12) {
              groupInsertSilenceRight = true;
            }
            if (nextTraj.id !== 0 && lastTraj.id !== 0) {
              groupInsertFixedRight = true;
            }
          }
        }
        if (firstTraj.num! > 0) {
          const prevTraj = phrase.trajectories[firstTraj.num! - 1];
          if (prevTraj.id === 12) {
            groupInsertSilenceLeft = true;
          }
          if (prevTraj.id !== 0 && firstTraj.id !== 0) {
            groupInsertFixedLeft = true;
          }
        } else if (pIdx > 0) {
          const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
          if (prevPhrase.trajectories.length > 0) {
            const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
            if (prevTraj.id === 12) {
              groupInsertSilenceLeft = true;
            }
            if (prevTraj.id !== 0 && firstTraj.id !== 0) {
              groupInsertFixedLeft = true;
            }
          }
        };
        contextMenuChoices.value = [];
        if (groupInsertSilenceLeft) {
          contextMenuChoices.value.push({
            text: 'Insert Silence Left',
            action: () => {
              insertSilentTrajLeft(firstTraj, track);
              contextMenuClosed.value = true;
            },
            enabled: true
          })
        };
        if (groupInsertSilenceRight) {
          contextMenuChoices.value.push({
            text: 'Insert Silence Right',
            action: () => {
              insertSilentTrajRight(lastTraj, track);
              contextMenuClosed.value = true;
            },
            enabled: true
          })
        }
        if (groupInsertFixedLeft) {
          contextMenuChoices.value.push({
            text: 'Insert Fixed Left',
            action: () => {
              insertFixedTrajLeft(firstTraj, track);
              contextMenuClosed.value = true;
            },
            enabled: true
          })
        }
        if (groupInsertFixedRight) {
          contextMenuChoices.value.push({
            text: 'Insert Fixed Right',
            action: () => {
              insertFixedTrajRight(lastTraj, track);
              contextMenuClosed.value = true;
            },
            enabled: true
          })
        }
        const sarangi = props.piece.instrumentation[track] === Instrument.Sarangi;
        const vocal = ([Instrument.Vocal_M, Instrument.Vocal_F]).includes(props.piece.instrumentation[track]);
        if (groupable.value && (sarangi || vocal)) {
          contextMenuChoices.value.push({
            text: 'Adjust Volume',
            action: () => {
              const startTime = phrase.startTime! + firstTraj.startTime!;
              const xStart = props.xScale(startTime);
              const endTime = phrase.startTime! + lastTraj.startTime! + lastTraj.durTot;
              const xEnd = props.xScale(endTime);
              autoWindowWidth.value = xEnd - xStart + 40;
              let minLogFreq = Infinity;
              let maxLogFreq = -Infinity;
              group.trajectories.forEach(t => {
                const min = Math.min(...t.logFreqs);
                const max = Math.max(...t.logFreqs);
                if (min < minLogFreq) {
                  minLogFreq = min;
                }
                if (max > maxLogFreq) {
                  maxLogFreq = max;
                }
              });
              const yPxl = props.yScale(minLogFreq);
              autoTrajs.value = group.trajectories;
              autoWindowOpen.value = true;
              autoWindowX.value = xStart - 20;
              autoWindowY.value = yPxl + 20;
              if (autoWindowY.value + 100 > props.height) {
                const yBottomPxl = props.yScale(maxLogFreq);
                autoWindowY.value = yBottomPxl - 120;
              }
              console.log(autoWindowY.value)
              contextMenuClosed.value = true;
            },
            enabled: props.editable
          })
        }
      };
      const pArt = traj.articulations['0.00'];
      if (pArt && pArt.name === 'pluck') {
        const nChoices: StrokeNicknameType[] = 
        ['da', 'di', 'd', 'ra', 'ri', 'r'];
        nChoices.forEach(n => {
          const add = pArt.strokeNickname === n ? ` \u2713` : '';
          contextMenuChoices.value.push({
            text: `Stroke: ${n + add}`,
            action: () => {
              if (pArt.strokeNickname !== n) {
                updatePluckNickname(traj, n);
                const bObj: BolDisplayType = {
                  bol: n,
                  time: traj.startTime! + phrase.startTime!,
                  track,
                  uId: traj.uniqueId!,
                  logFreq: traj.logFreqs[0]
                }
                refreshBol(bObj);
              }
              contextMenuClosed.value = true;
            },
            enabled: true
          })
        })
      }
      contextMenuChoices.value.push({
        text: 'Annotate Trajectory',
        action: () => {
          annotatingTraj.value = traj;
          const startTime = traj.startTime! + phrase.startTime!;
          const xStart = props.xScale(startTime);
          const endTime = startTime + traj.durTot;
          const xEnd = props.xScale(endTime);
          const xMiddle = (xStart + xEnd) / 2;
          const left = xMiddle - trajAnnotatorWidth.value / 2;
          trajAnnotatorX.value = left;
          let top = props.yScale(traj.logFreqs[0]) + 20;
          if (top + trajAnnotatorHeight.value > props.height) {
            top = props.height - trajAnnotatorHeight.value - 20;
          }
          trajAnnotatorY.value = top; // Assigning the calculated top value
          trajAnnotatorOpen.value = true;
          contextMenuClosed.value = true;
        },
        enabled: true
      })
      contextMenuChoices.value.push({
          text: 'Adjust Orientation Dots',
          action: () => {
            emit('update:selectedMode', EditorMode.Trajectory);
            // capture orientation dots from traj
            nextTick(() => {

              trajTimePts.value = traj.pitches!.map((d, dIdx) => {
                let durArrOffset: number;
                if (dIdx === 0) {
                  durArrOffset = 0;
                } else {
                  durArrOffset = traj.durArray!.slice(0, dIdx).reduce((acc, val) => acc + val, 0) * traj.durTot;
                }
                const pIdx = traj.phraseIdx!;
                const track = props.piece.trackFromTraj(traj);
                const phrase = props.piece.phraseGrid[track][pIdx];
                const time = phrase.startTime! + traj.startTime! + durArrOffset;
                const logFreq = traj.logFreqs[dIdx];
                const tIdx = traj.num!;
                return {
                  time,
                  logFreq,
                  pIdx,
                  tIdx,
                  track
                }
              })
  
              // delete traj from render status / view
              const renderObj = trajRenderStatus.value[track].find(obj => {
                return obj.uniqueId === traj.uniqueId
              });
              if (renderObj === undefined) {
                throw new Error('Trajectory not found in render status array');
              }
              d3.selectAll(`.uId${traj.uniqueId}`).remove();
              renderObj.renderStatus = false;
              renderObj.selectedStatus = false;
  
              // replace traj with silent traj in phrase
              const silentTraj = new Trajectory({
                id: 12,
                durTot: traj.durTot,
                fundID12: traj.fundID12,
                instrumentation: props.piece.instrumentation[track],
                num: traj.num,
              });
              const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
              phrase.trajectories.splice(traj.num!, 1, silentTraj);
              // phrase.consolidateSilentTrajs();
              phrase.reset();
  
              // enter into trajectory mode
              
              emit('unsavedChanges', true);
              refreshTimePts();
              emit('update:trajTimePts', trajTimePts.value);
            })

            
          },
          enabled: props.editable
        })
      const offset = 20 * (contextMenuChoices.value.length + 4);
      if (contextMenuY.value + offset > props.height) {
        contextMenuY.value = props.height - offset;
      }

      if (contextMenuChoices.value.length > 0) {
        contextMenuClosed.value = false;
      }
    };

    const updatePluckNickname = (traj: Trajectory, n: StrokeNicknameType) => {
      const dNames = ['da', 'd', 'di'];
      const rNames = ['ra', 'r', 'ri'];
      if (dNames.includes(n)) {
        traj.articulations['0.00'].stroke = 'd'
      } else if (rNames.includes(n)) {
        traj.articulations['0.00'].stroke = 'r'
      }
      traj.articulations['0.00'].strokeNickname = n;
      emit('unsavedChanges', true);
    };

    const addTrajToSelectedGroup = (traj: Trajectory, track: number) => {
      const longEnough = selectedTrajs.value.length > 1;
      if (longEnough && selectedTrajs.value[0].groupId !== undefined) {
        const pIdx = selectedTrajs.value[0].phraseIdx!;
        const phrase = props.piece.phraseGrid[track][pIdx];
        const group = phrase.getGroupFromId(selectedTrajs.value[0].groupId!)!;
        group.addTraj(traj);
        const renderObj = trajRenderStatus.value[track].find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        if (renderObj === undefined) {
          throw new Error('Trajectory not found in render status array');
        }
        renderObj.selectedStatus = true;
      }
    };

    const insertSilentTrajLeft = (traj: Trajectory, track: number, dur = 0.1) => {
      if (traj.durTot < 0.2) dur = 0.1 * traj.durTot;
      const pIdx = traj.phraseIdx!;
      const tIdx = traj.num!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      if (traj.id === 12) {
        throw new Error('Cannot insert silence to a silent trajectory');
      }
      if (tIdx === 0) {
        if (pIdx > 0) {
          const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
          const prevTrajs = prevPhrase.trajectories;
          const prevTraj = prevTrajs[prevTrajs.length - 1];
          if (prevTraj.id === 12) {
            throw new Error('Prev traj is already silent');
          }
        }
      } else {
        const prevTraj = phrase.trajectories[tIdx - 1];
        if (prevTraj.id === 12) {
          throw new Error('Prev traj is already silent');
        }
      }
      const newTraj = new Trajectory({
        id: 12,
        durTot: dur,
        pitches: [],
        fundID12: props.piece.raga.fundamental
      });
      if (traj.durArray!.length === 1) {
        traj.durTot -= dur;
      } else {
        const durs = traj.durArray!.map(d => d * traj.durTot);
        durs[0] -= dur;
        traj.durTot -= dur;
        traj.durArray = durs.map(d => d / traj.durTot);
      }
      phrase.trajectories.splice(tIdx, 0, newTraj);
      phrase.reset();
      refreshTraj(traj);
      emit('unsavedChanges', true);
      resetTrajRenderStatus()
    };

    const canConnectToUpcomingTraj = (traj: Trajectory, track: number) => {
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      if (traj.num! + 2 > phrase.trajectories.length) {
        return false;
      }
      const nextTraj = phrase.trajectories[traj.num! + 1];
      if (nextTraj.id !== 12) {
        return false;
      }
      const followingTraj = phrase.trajectories[traj.num! + 2];
      if (followingTraj && followingTraj.id === 12) {
        return false;
      }
      return true;
    }

    const canConnectToEarlierTraj = (traj: Trajectory, track: number) => {
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      if (traj.num! < 2) {
        return false;
      }
      const prevTraj = phrase.trajectories[traj.num! - 1];
      if (prevTraj.id !== 12) {
        return false;
      }
      const preceedingTraj = phrase.trajectories[traj.num! - 2];
      if (preceedingTraj.id === 12) {
        return false;
      }
      return true;
    }

    const insertSilentTrajRight = (traj: Trajectory, track: number, dur = 0.1) => {
      if (traj.durTot < 0.2) dur = 0.1 * traj.durTot;
      const pIdx = traj.phraseIdx!;
      const tIdx = traj.num!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      if (traj.id === 12) {
        throw new Error('Cannot insert silence to a silent trajectory');
      }
      if (tIdx === phrase.trajectories.length - 1) {
        if (pIdx < props.piece.phraseGrid[track].length - 1) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          const nextTrajs = nextPhrase.trajectories;
          const nextTraj = nextTrajs[0];
          if (nextTraj.id === 12) {
            throw new Error('Next traj is already silent');
          }
        }
      } else {
        const nextTraj = phrase.trajectories[tIdx + 1];
        if (nextTraj.id === 12) {
          throw new Error('Next traj is already silent');
        }
      }
      const newTraj = new Trajectory({
        id: 12,
        durTot: dur,
        pitches: [],
        fundID12: props.piece.raga.fundamental
      });
      if (traj.durArray!.length === 1) {
        traj.durTot -= dur;
      } else {
        const durs = traj.durArray!.map(d => d * traj.durTot);
        durs[durs.length - 1] -= dur;
        traj.durTot -= dur;
        traj.durArray = durs.map(d => d / traj.durTot);
      }
      phrase.trajectories.splice(tIdx + 1, 0, newTraj);
      phrase.reset();
      refreshTraj(traj);
      emit('unsavedChanges', true);
      resetTrajRenderStatus();

    }

    const insertFixedTrajLeft = (traj: Trajectory, track: number, dur = 0.1) => {
      if (traj.durTot < 0.2) dur = 0.1 * traj.durTot;
      const pIdx = traj.phraseIdx!;
      const tIdx = traj.num!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      if (traj.id === 0) {
        throw new Error('Cannot insert fixed pitch to a fixed pitch trajectory');
      }
      const newPitch = new Pitch(traj.pitches[0]);
      const art = traj.articulations['0.00'];
      const newArts = art && art.name === 'pluck' ? 
        [{ '0.00': new Articulation({
          name: 'pluck',
          stroke: 'd',
          strokeNickname: 'da'
        }) }] :
        [{ }];
      const newTraj = new Trajectory({
        id: 0,
        durTot: dur,
        pitches: [newPitch],
        articulations: newArts,
        vowel: traj.vowel,
        vowelEngTrans: traj.vowelEngTrans,
        vowelHindi: traj.vowelHindi,
        vowelIpa: traj.vowelIpa,
        startConsonant: traj.startConsonant,
        startConsonantEngTrans: traj.startConsonantEngTrans,
        startConsonantHindi: traj.startConsonantHindi,
        startConsonantIpa: traj.startConsonantIpa,
      });
      traj.startConsonant = undefined;
      traj.startConsonantEngTrans = undefined;
      traj.startConsonantHindi = undefined;
      traj.startConsonantIpa = undefined;
      if (art && art.name === 'consonant') {
        delete traj.articulations['0.00'];
      }
      if (art && art.name === 'pluck') {
        delete traj.articulations['0.00'];
      }
      if (traj.durArray!.length === 1) {
        traj.durTot -= dur
      } else {
        const durs = traj.durArray!.map(d => d * traj.durTot);
        durs[0] -= dur;
        traj.durTot -= dur;
        traj.durArray = durs.map(d => d / traj.durTot);
      }
      phrase.trajectories.splice(tIdx, 0, newTraj);
      phrase.reset();
      trajRenderStatus.value[track].push({
        uniqueId: newTraj.uniqueId!,
        renderStatus: false,
        selectedStatus: true, 
        track
      });
      refreshTraj(traj);
      refreshTraj(newTraj);
      emit('unsavedChanges', true);
    }

    const insertFixedTrajRight = (traj: Trajectory, track: number, dur = 0.1) => {
      if (traj.durTot < 0.2) dur = 0.1 * traj.durTot;
      const pIdx = traj.phraseIdx!;
      const tIdx = traj.num!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      if (traj.id === 0) {
        throw new Error('Cannot insert fixed pitch to a fixed pitch trajectory');
      }
      const newPitch = new Pitch(traj.pitches[traj.pitches.length - 1]);
      const newTraj = new Trajectory({
        id: 0,
        durTot: dur,
        pitches: [newPitch],
        articulations: {},
        vowel: traj.vowel,
        vowelEngTrans: traj.vowelEngTrans,
        vowelHindi: traj.vowelHindi,
        vowelIpa: traj.vowelIpa,
        endConsonant: traj.endConsonant,
        endConsonantEngTrans: traj.endConsonantEngTrans,
        endConsonantHindi: traj.endConsonantHindi,
        endConsonantIpa: traj.endConsonantIpa,
      });
      traj.endConsonant = undefined;
      traj.endConsonantEngTrans = undefined;
      traj.endConsonantHindi = undefined;
      traj.endConsonantIpa = undefined;
      const art = traj.articulations['1.00'];
      if (art && art.name === 'consonant') {
        delete traj.articulations['1.00'];
      }
      if (traj.durArray!.length === 1) {
        traj.durTot -= dur
      } else {
        const durs = traj.durArray!.map(d => d * traj.durTot);
        durs[durs.length - 1] -= dur;
        traj.durTot -= dur;
        traj.durArray = durs.map(d => d / traj.durTot);
      }
      phrase.trajectories.splice(tIdx + 1, 0, newTraj);
      phrase.reset();
      trajRenderStatus.value[track].push({
        uniqueId: newTraj.uniqueId!,
        renderStatus: false,
        selectedStatus: true, 
        track
      });
      refreshTraj(traj);
      refreshTraj(newTraj);
      emit('unsavedChanges', true);
    };

    

    const handleClickTraj = (traj: Trajectory, track: number) => {
      if (props.selectedMode === EditorMode.Meter) return;
      if (props.selectedMode === EditorMode.Trajectory) return;
      if (props.selectedMode === EditorMode.Series) return;
      emit('update:selectedMode', EditorMode.None);
      nextTick(() => {
        selectedPhraseDivUid.value = undefined;
        if (shifted.value && track !== props.editingInstIdx) {
          console.log('getting cancelled out')
          return
        }
        emit('update:editingInstIdx', track);
        if (!shifted.value) {
          clearDragDots();
          selectedTrajs.value.forEach(traj => {
            const rObj = trajRenderStatus.value.flat().find(obj => {
              return obj.uniqueId === traj.uniqueId
            });
            rObj!.selectedStatus = false;
          })
          if (traj.groupId !== undefined) {
            // const group = props.piece.trajGroups[traj.groupId];
            const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
            const group = phrase.getGroupFromId(traj.groupId)!;
            group.trajectories.forEach(t => {
              const rObj = trajRenderStatus.value.flat().find(obj => {
                return obj.uniqueId === t.uniqueId
              });
              rObj!.selectedStatus = true;
            })
          } else {
            const rObj = trajRenderStatus.value[track].find(obj => {
              return obj.uniqueId === traj.uniqueId
            });
            rObj!.selectedStatus = true;
          }
        } else {
          if (track === props.editingInstIdx) {
            clearDragDots();
            const renderObj = trajRenderStatus.value[track].find(obj => {
              return obj.uniqueId === traj.uniqueId
            });
            renderObj!.selectedStatus = true;
          }
          if (traj.groupId !== undefined) {
            const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
            const group = phrase.getGroupFromId(traj.groupId)!;
            group.trajectories.forEach(t => {
              const rObj = trajRenderStatus.value.flat().find(obj => {
                return obj.uniqueId === t.uniqueId
              });
              rObj!.selectedStatus = true;
            })
          }
        }
        selectedChikari.value = undefined;
      })
    };

    const handleClickPhraseDiv = (pd: PhraseDivDisplayType) => {
      emit('update:editingInstIdx', pd.track);
      clearDragDots();
      selectedPhraseDivUid.value = pd.uId;
      selectedTrajs.value.forEach(traj => {
        const rObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        rObj!.selectedStatus = false;
      })
      selectedChikari.value = undefined;
    }
      

    const handleClickChikari = (cd: ChikariDisplayType) => {
      selectedChikari.value = cd;
      selectedPhraseDivUid.value = undefined;
      selectedTrajs.value.forEach(traj => {
        const rObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        rObj!.selectedStatus = false;
      });
      clearDragDots();
    };

    interface Datum {
      x: number,
      y: number
    }

    const constrainTime = (initTime: number, idx: number) => {
      let time = initTime;
      const traj = selectedTrajs.value[0];
      const track = props.piece.trackFromTraj(traj);
      const tIdx = traj.num!;
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      let times = [0, ...traj.durArray!.map(cumsum())];
      const startTime = phrase.startTime! + traj.startTime!;
      times = times.map(t => t * traj.durTot + startTime);
      if (idx === 0) {
        let start: number = 0;
        let prevTraj: Trajectory;
        if (tIdx > 0){
          prevTraj = phrase.trajectories[tIdx - 1];
          if (prevTraj.durArray && prevTraj.durArray.length > 1) {
            let prevTrajTimes = [0, ...prevTraj.durArray!.map(cumsum())];
            prevTrajTimes = prevTrajTimes.map(t => {
              const pst = phrase.startTime! + prevTraj.startTime!;
              return t * prevTraj.durTot + pst;
            })
            start = prevTrajTimes[prevTrajTimes.length - 2];
          } else {
            start = phrase.startTime! + prevTraj.startTime!;
          }
        } else if (traj.phraseIdx! > 0) {
          const prevPhrase = props.piece.phraseGrid[track][traj.phraseIdx! - 1];
          const pTrajs = prevPhrase.trajectories;
          prevTraj = pTrajs[pTrajs.length - 1];
          if (prevTraj.durArray && prevTraj.durArray.length > 1) {
            let prevTrajTimes = [0, ...prevTraj.durArray!.map(cumsum())];
            prevTrajTimes = prevTrajTimes.map(t => {
              const pst = prevPhrase.startTime! + prevTraj.startTime!;
              return t * prevTraj.durTot + pst;
            })
            start = prevTrajTimes[prevTrajTimes.length - 2];
          } else {
            start = prevPhrase.startTime! + prevTraj.startTime!;
          }
        };
        if (prevTraj!.id === 12) {
          if (time < start) time = start
        } else {
          if (time < start + minTrajDur) {
            time = start + minTrajDur;
          }
        }
        if (time > times[1] - minTrajDur) {
          time = times[1] - minTrajDur;
        }
      } else if (idx < times.length - 1) {
        if (time < times[idx - 1] + minTrajDur) {
          time = times[idx - 1] + minTrajDur;
        }
        if (time > times[idx + 1] - minTrajDur) {
          time = times[idx + 1] - minTrajDur;
        }
      } else {
        let nextEnd: number = 0;
        let nextTraj: Trajectory;
        if (time < times[idx - 1] + minTrajDur) {
          time = times[idx - 1] + minTrajDur;
        }
        if (phrase.trajectories[tIdx + 1]) {
          nextTraj = phrase.trajectories[tIdx + 1];
          if (nextTraj.durArray && nextTraj.durArray.length > 1) {
            let nextTrajTimes = [0, ...nextTraj.durArray!.map(cumsum())];
            nextTrajTimes = nextTrajTimes.map(t => {
              const pst = phrase.startTime! + nextTraj.startTime!;
              return t * nextTraj.durTot + pst;
            })
            nextEnd = nextTrajTimes[1];
          } else {
            nextEnd = phrase.startTime! + nextTraj.startTime! + nextTraj.durTot;
          }
        } else if (props.piece.phraseGrid[track][traj.phraseIdx! + 1]) {
          const nextPhrase = props.piece.phraseGrid[track][traj.phraseIdx! + 1];
          nextTraj = nextPhrase.trajectories[0];
          if (nextTraj.durArray && nextTraj.durArray.length > 1) {
            let nextTrajTimes = [0, ...nextTraj.durArray!.map(cumsum())];
            nextTrajTimes = nextTrajTimes.map(t => {
              const pst = nextPhrase.startTime! + nextTraj.startTime!;
              return t * nextTraj.durTot + pst;
            })
            nextEnd = nextTrajTimes[1];
          } else {
            const start = nextPhrase.startTime! + nextTraj.startTime!;
            nextEnd = start + nextTraj.durTot;
          }
        }
        if (nextTraj!.id === 12) {
          if (time > nextEnd) time = nextEnd;
        } else {
          if (time > nextEnd - minTrajDur) {
            time = nextEnd - minTrajDur;
          }
        }
      }
      return time;
    };
    
    const calculateNewDurArray = (
        phrase: Phrase,
        traj: Trajectory,
        idx: number,
        time: number
        ) => {
      let times = [0, ...traj.durArray!.map(cumsum())];
      const startTime = phrase.startTime! + traj.startTime!;
      times = times.map(t => t * traj.durTot + startTime);
      const newTimes = times.slice();
      newTimes[idx] = time;
      let durArray = newTimes.slice(1).map((v, i) => v - newTimes[i]);
      const daSum = durArray.reduce((a, b) => a + b, 0);
      durArray = durArray.map(d => d / daSum);
      return durArray;
    };

    const newDurArrayA = (traj: Trajectory, delta: number) => {
      const initPortionA = traj.durArray![0] * traj.durTot;
      const newDur = traj.durTot - delta;
      const newPropA = (initPortionA - delta) / newDur;
      let newDurArray = traj.durArray!.map((i => i * traj.durTot / newDur));
      newDurArray[0] = newPropA;
      return newDurArray
    };

    const newDurArrayZ = (traj: Trajectory, delta: number) => {
      const initPartZ = traj.durArray![traj.durArray!.length-1] * traj.durTot;
      const newDur = traj.durTot + delta;
      const newPropZ = (initPartZ + delta) / newDur;
      let newDurArray = traj.durArray!.map((i => i * traj.durTot / newDur));
      newDurArray[newDurArray.length - 1] = newPropZ;
      return newDurArray;
    };

    let dragDotDragging = false;
    let dragDotDraggingCt = 0;

    const dragDotAnimationStep = () => {
      if (dragDotDragging) {
        if (dragDotDraggingCt % 2 === 0) {
          if (targetDragDotX.value === undefined) {
            throw new Error('targetDragDotX is undefined');
          }
          if (targetDragDotY.value === undefined) {
            throw new Error('targetDragDotY is undefined');
          }
          laggingDragDotX.value = smooth(laggingDragDotX.value, targetDragDotX.value, 0.2);
          laggingDragDotY.value = smooth(laggingDragDotY.value, targetDragDotY.value, 0.2);
          d3.select(`#dragDot${dragDotIdx}`)
            .attr('cx', laggingDragDotX.value)
            .attr('cy', laggingDragDotY.value);
          }
        dragDotDraggingCt ^= 1;
        requestAnimationFrame(dragDotAnimationStep);
      }
    }

    const dragDotStart = (e: d3.D3DragEvent<
      SVGCircleElement, Datum, MouseEvent
    >) => {
      if (alted.value) return;
      if (
        selectedDragDotIdx.value === undefined ||
        (
          selectedDragDotIdx.value !== undefined && 
          selectedDragDotIdx.value !== Number(e.sourceEvent.target.id.slice(7))
        )
      ) {
        handleClickDragDot(e.sourceEvent);
        return
      }
      const traj = selectedTrajs.value[0];
      const track = props.piece.trackFromTraj(traj);
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      const startTime = phrase.startTime! + traj.startTime!;
      let times = [0, ...traj.durArray!.map(cumsum())];
      times = times.map(t => t * traj.durTot + startTime);
      dragDotIdx = Number(e.sourceEvent.target.id.split('dragDot')[1]);
      const time = times[dragDotIdx];
      const logFreq = traj.logFreqs[dragDotIdx] || traj.logFreqs[dragDotIdx - 1]
      const trajData = makeTrajData(traj, startTime);
      dragDotDragging = true;
      targetDragDotX.value = e.x
      targetDragDotY.value = e.y;
      laggingDragDotX.value = e.x;
      laggingDragDotY.value = e.y;
      requestAnimationFrame(dragDotAnimationStep);
    };

    const updateDurArray = (traj: any, delta: number) => {
      if (traj.durArray && traj.durArray.length > 1) {
        const initPortionA = traj.durArray[0] * traj.durTot;
        const newDur = traj.durTot - delta;
        const newPropA = (initPortionA - delta) / newDur;
        const newDurArr = traj.durArray.map((i: number) => i * traj.durTot / newDur);
        newDurArr[0] = newPropA;
        traj.durArray = newDurArr;
      }
    };

    const updatePrevTraj = (prevTraj: any, delta: number) => {
      if (prevTraj.durArray && prevTraj.durArray.length > 1) {
        prevTraj.durArray = newDurArrayZ(prevTraj, delta);
      }
      prevTraj.durTot += delta;
    };

    const updateNextTraj = (nextTraj: any, delta: number) => {
      if (nextTraj.durArray && nextTraj.durArray.length > 1) {
        nextTraj.durArray = newDurArrayA(nextTraj, delta);
      }
      nextTraj.durTot -= delta;
      nextTraj.startTime! += delta;
    };

    const updatePhraseChikaris = (phrase: any, delta: number) => {
      Object.keys(phrase.chikaris).forEach(key => {
        const nk = (Math.round(100 * (Number(key) - delta)) / 100).toString();
        if (nk !== key) {
          phrase.chikaris[nk] = phrase.chikaris[key];
          delete phrase.chikaris[key];
        }
      });
    };

    const updateTargetDragDot = (e: d3.D3DragEvent<SVGCircleElement, Datum, MouseEvent>) => {
      if (alted.value) return;
      const initTime = props.xScale.invert(e.x);
      const time = constrainTime(initTime, dragDotIdx!);
      targetDragDotX.value = props.xScale(time);
      targetDragDotY.value = e.y;
    };


    const dragDotMove = (e: d3.D3DragEvent<SVGCircleElement, Datum, MouseEvent>) => {
      if (alted.value) return;
      const initTime = props.xScale.invert(e.x);
      const time = constrainTime(initTime, dragDotIdx!);
      const x = props.xScale(time);
      // d3.select(`#dragDot${dragDotIdx}`)
      //   .attr('cx', x)
      //   .attr('cy', e.y);
      const traj = selectedTrajs.value[0];
      const track = props.piece.trackFromTraj(traj);
      const idx = dragDotIdx!;
      const tIdx = traj.num!;
      const pIdx = traj.phraseIdx!;
      const phrase = props.piece.phraseGrid[track][pIdx];
      const logFreq = props.yScale.invert(e.y);
      if (traj.logFreqs[idx]) {
        const basePitch = new Pitch(traj.pitches[idx]);
        basePitch.logOffset = 0;
        const logOffset = logFreq - basePitch.logFreq;
        traj.pitches[idx].logOffset = logOffset;
      }
      if (idx > 0 && idx < traj.durArray!.length) {
        const newDurArray = calculateNewDurArray(phrase, traj, idx, time);
        traj.durArray = newDurArray;
      } else if (idx === 0) {
        const delta = time - (phrase.startTime! + traj.startTime!);
        if (tIdx === 0) {
          const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
          const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
          updatePrevTraj(prevTraj, delta);
          updateDurArray(traj, delta);
          traj.durTot -= delta;
          phrase.startTime! += delta;
          updatePhraseChikaris(phrase, delta);
        } else {
          const prevTraj = phrase.trajectories[tIdx - 1];
          updatePrevTraj(prevTraj, delta);
          updateDurArray(traj, delta);
          traj.durTot -= delta;
          phrase.durArrayFromTrajectories();
          phrase.assignStartTimes();
        }
      } else if (idx === traj.durArray!.length) {
        const delta = time - (phrase.startTime! + traj.startTime! + traj.durTot);
        if (tIdx < phrase.trajectories.length - 1) {
          const nextTraj = phrase.trajectories[tIdx + 1];
          updateNextTraj(nextTraj, delta);
          if (traj.durArray!.length > 1) {
            traj.durArray = newDurArrayZ(traj, delta);
          }
          traj.durTot += delta;
          phrase.durArrayFromTrajectories();
        } else if (props.piece.phraseGrid[track][pIdx + 1]) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          const nextTraj = nextPhrase.trajectories[0];
          updateNextTraj(nextTraj, delta);
          nextPhrase.startTime! += delta;
          nextPhrase.durArrayFromTrajectories();
          nextPhrase.assignStartTimes();
          const tda = traj.durArray!;
          if (tda.length > 1) {
            const initPartZ = tda[tda.length - 1] * traj.durTot;
            const newDur = traj.durTot + delta;
            const newPropZ = (initPartZ + delta) / newDur;
            const newDurArray = tda.map((i => i * traj.durTot / newDur));
            newDurArray[tda.length - 1] = newPropZ;
            traj.durArray = newDurArray;
          }
          traj.durTot += delta;
          phrase.durArrayFromTrajectories();
          phrase.assignStartTimes();
          updatePhraseChikaris(nextPhrase, delta);
        }
      }
      
      // this looks good, but it maybe is causing visual discomfort ...
      // updateTrajCurve(traj, phrase.startTime! + traj.startTime!);
    };

    const updateKrintinArticulations = (traj: Trajectory) => {
        const plucked = traj.articulations['0.00']?.name === 'pluck';
        const offset = plucked ? 1 : 0;
        const artKeys = Object.keys(traj.articulations).map(k => Number(k)).sort();
        if (traj.id === 7 || traj.id === 11) {
          traj.articulations[traj.durArray![0]] = traj.articulations[artKeys[offset]];
          if (traj.durArray![0] !== artKeys[offset]) {
            delete traj.articulations[artKeys[offset]];
          }
        } else if (traj.id === 8) {
          const key1 = traj.durArray![0];
          const key2 = sum(traj.durArray!.slice(0, 2));
          const wasKey1New = !(key1 in traj.articulations);
          const wasKey2New = !(key2 in traj.articulations);
          if (wasKey1New) traj.articulations[key1] = traj.articulations[artKeys[offset]];
          if (wasKey2New) traj.articulations[key2] = traj.articulations[artKeys[offset + 1]];
          if (wasKey1New) delete traj.articulations[artKeys[offset]];
          if (wasKey2New) delete traj.articulations[artKeys[offset + 1]];
        } else if (traj.id === 9) {
          const key1 = traj.durArray![0];
          const key2 = sum(traj.durArray!.slice(0, 2));
          const key3 = sum(traj.durArray!.slice(0, 3));
          const wasKey1New = !(key1 in traj.articulations);
          const wasKey2New = !(key2 in traj.articulations);
          const wasKey3New = !(key3 in traj.articulations);
          if (wasKey1New) traj.articulations[key1] = traj.articulations[artKeys[offset]];
          if (wasKey2New) traj.articulations[key2] = traj.articulations[artKeys[offset + 1]];
          if (wasKey3New) traj.articulations[key3] = traj.articulations[artKeys[offset + 2]];
          if (wasKey1New) delete traj.articulations[artKeys[offset]];
          if (wasKey2New) delete traj.articulations[artKeys[offset + 1]];
          if (wasKey3New) delete traj.articulations[artKeys[offset + 2]];
        } else if (traj.id === 10) {
          const key1 = traj.durArray![0];
          const key2 = sum(traj.durArray!.slice(0, 2));
          const key3 = sum(traj.durArray!.slice(0, 3));
          const key4 = sum(traj.durArray!.slice(0, 4));
          const key5 = sum(traj.durArray!.slice(0, 5));
          const wasKey1New = !(key1 in traj.articulations);
          const wasKey2New = !(key2 in traj.articulations);
          const wasKey3New = !(key3 in traj.articulations);
          const wasKey4New = !(key4 in traj.articulations);
          const wasKey5New = !(key5 in traj.articulations);
          if (wasKey1New) traj.articulations[key1] = traj.articulations[artKeys[offset]];
          if (wasKey2New) traj.articulations[key2] = traj.articulations[artKeys[offset + 1]];
          if (wasKey3New) traj.articulations[key3] = traj.articulations[artKeys[offset + 2]];
          if (wasKey4New) traj.articulations[key4] = traj.articulations[artKeys[offset + 3]];
          if (wasKey5New) traj.articulations[key5] = traj.articulations[artKeys[offset + 4]];
          if (wasKey1New) delete traj.articulations[artKeys[offset]];
          if (wasKey2New) delete traj.articulations[artKeys[offset + 1]];
          if (wasKey3New) delete traj.articulations[artKeys[offset + 2]];
          if (wasKey4New) delete traj.articulations[artKeys[offset + 3]];
          if (wasKey5New) delete traj.articulations[artKeys[offset + 4]];
        }
      };

    const dragDotEnd = (e: d3.D3DragEvent<
      SVGCircleElement, Datum, MouseEvent
    >) => {
      if (alted.value) return;
      if (!dragDotDragging) return;
      dragDotMove(e);
      dragDotDragging = false;
      emit('unsavedChanges', true);
      const idx = dragDotIdx!;
      const traj = selectedTrajs.value[0];
      const track = props.piece.trackFromTraj(traj);
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      const pIdx = traj.phraseIdx!;
      const tIdx = traj.num!;
      const initTime = props.xScale.invert(e.x);
      let newTime = constrainTime(initTime, idx);
      let logFreq = props.yScale.invert(e.y);
      if (props.sargamMagnetMode) {
        logFreq = getClosest(logSargamVals.value, logFreq);
      } else {

        if (idx === 0 && traj.num! > 1) {
          const silTraj = phrase.trajectories[traj.num! - 1];
          const prevTraj = phrase.trajectories[traj.num! - 2];
          if (prevTraj.id !== 12 && silTraj.id === 12) {
            const prevPitch = prevTraj.pitches[prevTraj.pitches.length - 1];
            const diff = Math.abs(logFreq - prevPitch.logFreq);
            const prevTime = phrase.startTime! + prevTraj.startTime! + prevTraj.durTot;
            const timeDiff = Math.abs(newTime - prevTime);
            if (diff < 0.05 && timeDiff < 0.1) {
              logFreq = prevPitch.logFreq;
              newTime = prevTime;
            }
          } else if (silTraj.id !== 12) {
            const silPitch = silTraj.pitches[0];
            const diff = Math.abs(logFreq - silPitch.logFreq);
            if (diff < 0.05) {
              logFreq = silPitch.logFreq;
            }
          }
        }
        if (idx === traj.pitches.length - 1 && traj.num! < phrase.trajectories.length - 2) {
          const nextTraj = phrase.trajectories[traj.num! + 2];
          const silTraj = phrase.trajectories[traj.num! + 1];
          if (nextTraj.id !== 12 && silTraj.id === 12) {
            const nextPitch = nextTraj.pitches[0];
            const diff = Math.abs(logFreq - nextPitch.logFreq);
            const nextTime = phrase.startTime! + nextTraj.startTime!;
            const timeDiff = Math.abs(nextTime - newTime);
            if (diff < 0.05 && timeDiff < 0.1) {
              logFreq = nextPitch.logFreq;
              newTime = nextTime;
            }
          } else if (silTraj.id !== 12) {
            const silPitch = silTraj.pitches[0];
            const diff = Math.abs(logFreq - silPitch.logFreq);
            if (diff < 0.05) {
              logFreq = silPitch.logFreq;
            }
          }
        }

      }
      const y = props.yScale(logFreq);
      const selectedDragDot = d3.select(`#dragDot${idx}`);
      selectedDragDot.attr('cy', y);
      const newPitch = () => {
        return props.piece.raga.pitchFromLogFreq(logFreq)
      };
      if (traj.logFreqs[idx]) {
        traj.pitches[idx] = newPitch();
        if (idx === 0 && (traj.id === 0 || traj.id === 13)) { // if first dot of fixed traj
          traj.pitches[1] = newPitch();
          d3.select(`#dragDot1`)
            .attr('cy', y);
        } else if (idx === 1 && (traj.id === 0 || traj.id === 13)) { // if second dot of fixed traj
          traj.pitches[0] = newPitch();
          d3.select(`#dragDot0`)
            .attr('cy', y);
        }
      }
      const affectedTrajs = [traj];
      let affectedPhraseDivUid = undefined;
      if (idx === 0) {
        if (tIdx === 0) {
          if (pIdx > 0) {
            const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
            const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
            affectedTrajs.push(prevTraj);
            affectedPhraseDivUid = phrase.uniqueId;
            
          }
        } else {
          const prevTraj = phrase.trajectories[tIdx - 1];
          affectedTrajs.push(prevTraj);
        }
      } else if (idx === traj.durArray!.length) {
        if (tIdx < phrase.trajectories.length - 1) {
          const nextTraj = phrase.trajectories[tIdx + 1];
          affectedTrajs.push(nextTraj);
        } else if (props.piece.phraseGrid[track][pIdx + 1]) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          const nextTraj = nextPhrase.trajectories[0];
          affectedTrajs.push(nextTraj);
          affectedPhraseDivUid = nextPhrase.uniqueId;
        }
      }
      affectedTrajs.forEach(traj => {
        const affectedIds = [7, 8, 9, 10, 11];
        if (affectedIds.includes(traj.id)) updateKrintinArticulations(traj)
        refreshTraj(traj)
      });
      if (affectedPhraseDivUid !== undefined) {
        removePhraseDiv(affectedPhraseDivUid);
        const pdObj = props.piece.allPhraseDivs(track).find(pd => {
          return pd.uId === affectedPhraseDivUid
        });
        if (pdObj === undefined) {
          throw new Error('PhraseDiv not found in allPhraseDivs array');
        }
        renderPhraseDiv(pdObj);
      }
    };

    const refreshTraj = (traj: Trajectory) => {
      const track = props.piece.trackFromTraj(traj);
      const instrument = props.piece.instrumentation[track] as Instrument;
      removeTraj(traj);
      renderTraj(traj);
      refreshSargam(traj.uniqueId!);
      if (instrument === Instrument.Vocal_M || instrument === Instrument.Vocal_F) {

        refreshVowel(traj.uniqueId!);
        refreshEndingConsonant(traj.uniqueId!);
      }
      refreshDragDots();
    };

    const refreshTrajChikaris = (traj: Trajectory) => {
      const track = props.piece.trackFromTraj(traj);
      if (props.piece.instrumentation[track] as Instrument === Instrument.Sitar) {
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        phrase.chikarisDuringTraj(traj, track).forEach(cd => {
          clearChikari(cd);
          renderChikari(cd);
        })
      }
    };

    const refreshPhraseChikaris = (phrase: Phrase) => {
      phrase.trajectories.forEach(traj => {
        refreshTrajChikaris(traj);
      })
    }

    const renderTimePt = (tpObj: { 
      time: number,
      logFreq: number,
      pIdx: number,
      tIdx: number,
      track: number
    }) => {
      const { time, logFreq, pIdx, tIdx, track } = tpObj;
      const trackG = tracks[track];
      const x = props.xScale(time);
      const y = props.yScale(logFreq);
      trackG.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .attr('class', `timePt`)
        .style('fill', 'green')
        .on('click', (e: MouseEvent) => {
          if (alted.value) {
            e.preventDefault();
            e.stopPropagation();
            trajTimePts.value = trajTimePts.value.filter(tp => {
              return tp.time !== time || tp.logFreq !== logFreq
            });
            emit('update:trajTimePts', trajTimePts.value);
            refreshTimePts();
          }
        });
    };

    const clearTimePts = () => {
      d3.selectAll('.timePt').remove();
    };

    const refreshTimePts = () => {
      clearTimePts();
      trajTimePts.value.forEach(tpObj => {
        renderTimePt(tpObj);
      })

    };

    const refreshDragDots = () => {
      if (selectedTrajs.value.length === 1) {
        const traj = selectedTrajs.value[0];
        const track = props.piece.trackFromTrajUId(traj.uniqueId!);
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        d3.selectAll('.dragDots').remove();
        d3.selectAll('.dragDot').remove();
        const drag = () => {
          return d3.drag<SVGCircleElement, Datum>()
            .on('start', dragDotStart)
            .on('drag', updateTargetDragDot)
            .on('end', dragDotEnd)
        };
        const dragDotsG = d3.select(tranSvg.value)
          .append('g')
          .attr('class', `dragDots track${track}` )
        let times = [0, ...traj.durArray!.map(cumsum())];
        const startTime = phrase.startTime! + traj.startTime!;
        times = times.map(t => t * traj.durTot + startTime);
        const logFreqs = times.map((_, i) => {
          return traj.logFreqs[i] || traj.logFreqs[i - 1]
        });
        times.forEach((t, i) => {
          const color = selectedDragDotIdx.value === i ? 
            selectedDragDotColor : dragDotColor;
          const cy = props.yScale(logFreqs[i]);
          dragDotsG.append('circle')
            .attr('id', `dragDot${i}`)
            .attr('class', `refreshed dragDot track${track}`)
            .attr('cx', props.xScale(t))
            .attr('cy', cy)
            .attr('r', 4)
            .style('fill', color)
            .attr('cursor', 'pointer')
            .on('click', handleClickDragDot)
            .on('contextmenu', handleContextMenuDragDot)
        })
        if (props.editable) {
          (dragDotsG.selectAll('circle') as d3.Selection<
              SVGCircleElement, Datum, SVGGElement, undefined
            >)
            .call(drag())
        }
      } else {
        d3.selectAll('.dragDots').remove();
      }
    }

    const handleClickDragDot = (e: MouseEvent) => {
        e.preventDefault();
        const target = e.target as SVGCircleElement;
        const idx = Number(target.id.split('dragDot')[1]);
        const traj = selectedTrajs.value[0];
        d3.select(`#dragDot${idx}`)
          .style('fill', selectedDragDotColor);
        selectedDragDotIdx.value = idx;
    }

    const handleContextMenuDragDot = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      contextMenuX.value = e.offsetX;
      contextMenuY.value = e.offsetY;
      contextMenuClosed.value = false;
      const target = e.target as SVGCircleElement;
      const idx = Number(target.id.split('dragDot')[1]);
      const traj = selectedTraj.value!;
      contextMenuChoices.value = [];
      contextMenuChoices.value.push({
        text: 'Quantize to Sargam',
        action: () => {
          const logFreq = traj.logFreqs[idx] || traj.logFreqs[idx - 1];
          const newLogFreq = getClosest(logSargamVals.value, logFreq);
          const newPitch = props.piece.raga.pitchFromLogFreq(newLogFreq);
          traj.pitches[idx] = newPitch;
          const y = props.yScale(newLogFreq);
          d3.select(`#dragDot${idx}`)
            .attr('cy', y);
          if (traj.id === 0) {
            const otherNewPitch = props.piece.raga.pitchFromLogFreq(newLogFreq);
            if (idx === 0) {
              traj.pitches[1] = otherNewPitch;
              d3.select(`#dragDot1`)
                .attr('cy', y);
            } else if (idx === 1) {
              traj.pitches[0] = otherNewPitch;
              d3.select(`#dragDot0`)
                .attr('cy', y);
            }
          }
          refreshTraj(traj);
          emit('unsavedChanges', true);
          contextMenuClosed.value = true;
        },
        enabled: (() => {
          const logFreq = traj.logFreqs[idx] || traj.logFreqs[idx - 1];
          const closest = getClosest(logSargamVals.value, logFreq);
          return closest !== logFreq;
        })()
      })
    };

    const handleTrajMouseOver = (traj: Trajectory, track: number) => {
      if (shifted.value && track !== props.editingInstIdx) {
        return
      }
      if (props.selectedMode === EditorMode.Meter) return;
      if (props.selectedMode === EditorMode.Trajectory) return;
      if (props.selectedMode === EditorMode.Series) return;
      const selector = `.traj.uId${traj.uniqueId!}`
      d3.selectAll(selector)
        .attr('stroke', props.instTracks[track].selColor)
      d3.selectAll(selector + '.pluck')
        .attr('fill', props.instTracks[track].selColor)
      d3.selectAll(selector + '.consonantSymbol')
        .attr('fill', props.instTracks[track].selColor)
      
      
      const cursorTrajSelector = `.trajShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorTrajSelector)
        .attr('cursor', 'pointer')
      const cursorDampenSelector = `.dampenShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorDampenSelector)
        .attr('cursor', 'pointer');
      const cursorPluckSelector = `.pluckShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorPluckSelector)
        .attr('cursor', 'pointer');
      if (traj.groupId !== undefined) {
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        const group = phrase.getGroupFromId(traj.groupId)!;
        group.trajectories.forEach(t => {
          const selector = `.traj.uId${t.uniqueId!}`
          d3.selectAll(selector)
            .attr('stroke', props.instTracks[track].selColor)
          d3.selectAll(selector + '.pluck')
            .attr('fill', props.instTracks[track].selColor)
        })
      }
    }
    const handleTrajMouseOut = (traj: Trajectory, track: number) => {
      if (props.selectedMode === EditorMode.Meter) return;
      const selector = `.traj.uId${traj.uniqueId!}`
      const renderObj = trajRenderStatus.value[track].find(obj => {
        return obj.uniqueId === traj.uniqueId
      });
      if (renderObj === undefined) {
        return
      }
      if (renderObj!.selectedStatus === false) {
        d3.selectAll(selector)
          .attr('stroke', props.instTracks[track].color)
        d3.selectAll(selector + '.pluck')
          .attr('fill', props.instTracks[track].color)
        d3.selectAll(selector + '.consonantSymbol')
          .attr('fill', props.instTracks[track].color)
      } else {
        d3.selectAll(selector)
          .attr('stroke', props.instTracks[track].selColor)
        d3.selectAll(selector + '.pluck')
          .attr('fill', props.instTracks[track].selColor)
        d3.selectAll(selector + '.consonantSymbol')
          .attr('fill', props.instTracks[track].selColor)
      }
      const cursorSelector = `.trajShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorSelector)
        .attr('cursor', 'default')
      const cursorDampenSelector = `.dampenShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorDampenSelector)
        .attr('cursor', 'default')
      const cursorPluckSelector = `.pluckShadow.uId${traj.uniqueId!}`
      d3.selectAll(cursorPluckSelector)
        .attr('cursor', 'default');
      
      if (traj.groupId !== undefined) {
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        const group = phrase.getGroupFromId(traj.groupId)!;
        group.trajectories.forEach(t => {
          const selector = `.traj.uId${t.uniqueId!}`
          const renderObj = trajRenderStatus.value[track].find(obj => {
            return obj.uniqueId === t.uniqueId
          });
          if (renderObj!.selectedStatus === false) {
            d3.selectAll(selector)
              .attr('stroke', props.instTracks[track].color)
            d3.selectAll(selector + '.pluck')
              .attr('fill', props.instTracks[track].color)
          } else {
            d3.selectAll(selector)
              .attr('stroke', props.instTracks[track].selColor)
            d3.selectAll(selector + '.pluck')
              .attr('fill', props.instTracks[track].selColor)
          }
        })
      }
    }

    const handleChikariMouseOver = (cd: ChikariDisplayType) => {
      const selector = `.chikari.uId${cd.uId}`
      d3.selectAll(selector)
        .attr('stroke', props.instTracks[cd.track].selColor)
        .attr('cusor', 'pointer')
    };
    const handleChikariMouseOut = (cd: ChikariDisplayType) => {
      const selector = `.chikari.uId${cd.uId}`
      const color = selectedChikari.value?.uId === cd.uId ? 
        props.instTracks[cd.track].selColor : 
        props.instTracks[cd.track].color;
      d3.selectAll(selector)
        .attr('stroke', color)
        .attr('cursor', 'default')
    };

    const updateSargamLineSpacing = () => {
      if (tranSvg.value) {
        d3.select(tranSvg.value)
          .selectAll('line')
          .data(logSargamVals.value)
          .attr('y1', d => props.yScale(d))
          .attr('y2', d => props.yScale(d))
      }
    }

    const updateSargamLineWidth = () => {
      if (tranSvg.value) {
        d3.select(tranSvg.value)
          .selectAll('line')
          .attr('x2', props.width)
      }
    }

    const updateSargamLineColor = () => {
      if (tranSvg.value) {
        d3.select(tranSvg.value)
          .selectAll('.sargamLine')
          .attr('stroke', props.sargamLineColor)
      }
    }

    const refreshSargamLines = () => {
      const svg = d3.select(tranSvg.value);
      const saFilter = (logFreq: number) => {
        const logSa = Math.log2(props.piece.raga.fundamental);
        return (logFreq - logSa) % 1 === 0
      }
      const paFilter = (idx: number) => {
        return visPitches.value[idx].swara === 4
      };
      const strokeWidth = (s: number, idx: number) => {
        return saFilter(s) || paFilter(idx) ? 2 : 1
      }
      const sargamLinesG = svg.select('.sargamLinesG');
      sargamLinesG.selectAll('.sargamLine').remove();
      logSargamVals.value.forEach((s, idx) => {
        sargamLinesG.append('line')
          .classed('sargamLine', true)
          .attr('x1', 0)
          .attr('x2', props.width)
          .attr('y1', props.yScale(s))
          .attr('y2', props.yScale(s))
          .attr('stroke', props.sargamLineColor)
          .attr('stroke-width', strokeWidth(s, idx))
      })
    }

    const resetEmptyObserverDivs = () => {
      observer.disconnect();
      emptyDivs.value.forEach(div => {
        emptyOverlay.value?.removeChild(div);
      });
      emptyDivs.value = [];
      emptyDivIdxMap.clear();
      const numDivs = Math.ceil(props.width / maxEmptyDivWidth);
      for (let i = 0; i < numDivs; i++) {
        const div = document.createElement('div');
        const width = Math.min(maxEmptyDivWidth, 
          props.width - i * maxEmptyDivWidth);
        div.style.width = `${width}px`;
        div.style.height = `${props.height}px`;
        emptyOverlay.value?.appendChild(div);
        emptyDivs.value.push(div);
        emptyDivIdxMap.set(div, i);
        observer.observe(div);
      }
    };

    const resetObserver = () => {
      observer.disconnect();
      emptyDivs.value.forEach(div => {
        observer.observe(div);
      });
    };

    const handleEscape = (options: {
        includeMode?: boolean,
        includeRegion?: boolean,
        meterPersist?: boolean
      } = {
        includeMode: true,
        includeRegion: true,
        meterPersist: false
      }) => {
      if (options.includeMode) emit('update:selectedMode', EditorMode.None);
      selectedTrajs.value.forEach(traj => {
        const renderObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        const track = renderObj!.track;
        const selector = `.traj.uId${traj.uniqueId!}`;
        d3.selectAll(selector)
          .attr('stroke', props.instTracks[track].color)
        d3.selectAll(selector + '.pluck')
          .attr('fill', props.instTracks[track].color)
        d3.selectAll(selector + '.consonantSymbol')
          .attr('fill', props.instTracks[track].color)
        renderObj!.selectedStatus = false;
      });
      clearDragDots();
      clearTimePts();
      clearInsertPulses();
      selectedChikari.value = undefined;
      selectedPhraseDivUid.value = undefined;
      selectedDragDotIdx.value = undefined;
      if (!options.meterPersist) selectedMeter.value = undefined;
      selectedPulse.value = undefined;
      trajTimePts.value = [];
      d3.selectAll('#selBox').remove();
      d3.selectAll('.metricGrid')
        .attr('cursor', null);
      contextMenuClosed.value = true;
      if (options.includeRegion) {
        d3.selectAll('.region').remove();
        d3.selectAll('.regionStart').remove();
        d3.selectAll('.regionEnd').remove();
        regionStartX.value = undefined;
        regionEndX.value = undefined;
        emit('cancelRegionSpeed')
      }
      autoWindowOpen.value = false;
      trajAnnotatorOpen.value = false;
      emit('clearTSP');
      goToTimeModal.value = false;
    }

    const clearDragDots = () => {
      selectedDragDotIdx.value = undefined;
      d3.selectAll('.dragDots').remove();
    }

    const handleKeydown = (e: KeyboardEvent) => {
      const inst = props.instTracks[props.editingInstIdx].inst;
      if (e.key === 'Escape') {
        if (selectedPulse.value) {
          selectedPulse.value = undefined;
        } else {
          handleEscape();
        }
      } else if (e.code === 'KeyS') {
        if (metad.value) {
          e.preventDefault();
          emit('savePiece');
        } else if (alted.value) {
          emit('toggle:sargamMagnet')
        } else {
          emit('update:selectedMode', EditorMode.Series);
        }
      } else if (e.key === 't') {
        emit('update:selectedMode', EditorMode.Trajectory);
      } else if (e.key === 'c') {
        if (metad.value) {
          clipboardTrajs.value = [...selectedTrajs.value];
        } else if (props.instTracks[props.editingInstIdx].inst === Instrument.Sitar) {
          emit('update:selectedMode', EditorMode.Chikari);
        }
      } else if (e.key === 'v') {
        if (metad.value) {
          pasteTrajs();
        }
      } else if (e.key === 'm') {
        emit('update:selectedMode', EditorMode.Meter);
      } else if (e.key === 'd') {
        if (selectedTraj.value !== undefined && inst === Instrument.Sitar) {
          emit('update:toggleDampen')
        }
      } else if (e.key === 'p') {
        if (selectedTraj.value !== undefined && inst === Instrument.Sitar) {
          emit('update:togglePluck')
        } else {
          emit('update:selectedMode', EditorMode.PhraseDiv);
        }
      } else if (e.key === 'r') {
        emit('update:selectedMode', EditorMode.Region);
      } else if (e.code === 'KeyG') {
        if (alted.value) {
          goToTimeModal.value = true;
        }
      } else if (e.key === 'Shift') {
        shifted.value = true;
      } else if (e.key === 'Backspace') {
        if (selectedChikari.value !== undefined) {
          const cd = selectedChikari.value;
          console.log(cd)
          const phrase = props.piece.phraseGrid[cd.track][cd.phraseIdx];
          delete phrase.chikaris[cd.phraseTimeKey];
          clearChikari(cd);
          emit('unsavedChanges', true);
          selectedChikari.value = undefined;
        } else if (selectedPhraseDivUid.value !== undefined) {
          deletePhraseDiv(selectedPhraseDivUid.value);
        } else if (selectedTrajs.value.length > 0) {
          deleteTrajs(selectedTrajs.value);
        } else if (selectedMeter.value  !== undefined) {
          emit('deleteMeter', selectedMeter.value);
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedChikari.value !== undefined) {
          e.preventDefault();
          nudgeChikari(-.02);
        } else if (selectedPhraseDivUid.value !== undefined) {
          e.preventDefault();
          nudgePhraseDiv(-1);
        } else if (selectedDragDotIdx.value !== undefined) {
          e.preventDefault();
          nudgeDragDot('left')
        } else if (selectedPulse.value !== undefined) {
          e.preventDefault();
          nudgePulse('left');
        } else if (selectedTraj.value !== undefined && alted.value) {
          e.preventDefault(); 
          nudgeSlope('left');
        } else {
          e.preventDefault();
          horizontalMoveGraph(-0.1);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedChikari.value !== undefined) {
          e.preventDefault();
          nudgeChikari(.02);
        } else if (selectedPhraseDivUid.value !== undefined) {
          e.preventDefault();
          nudgePhraseDiv(1);
        } else if (selectedDragDotIdx.value !== undefined) {
          e.preventDefault();
          nudgeDragDot('right')
        } else if (selectedPulse.value !== undefined) {
          e.preventDefault();
          nudgePulse('right');
        } else if (selectedTraj.value !== undefined && alted.value) {
          e.preventDefault();
          nudgeSlope('right');
        } else {
          e.preventDefault();
          horizontalMoveGraph(0.1);
        }
      } else if (e.key === 'ArrowDown') {
        if (selectedDragDotIdx.value !== undefined) {
          e.preventDefault();
          nudgeDragDot('down')
        } else if (selectedTraj.value !== undefined && alted.value) {
          e.preventDefault();
          nudgeSlope('down');
        } else {
          e.preventDefault();
          verticalMoveGraph(-0.1);
        }
      } else if (e.key === 'ArrowUp') {
        if (selectedDragDotIdx.value !== undefined) {
          e.preventDefault();
          nudgeDragDot('up')
        } else if (selectedTraj.value !== undefined && alted.value) {
          e.preventDefault();
          nudgeSlope('up');
        } else {
          e.preventDefault();
          verticalMoveGraph(0.1);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (shifted.value) {
          if (selectedTraj.value !== undefined && selectedTrajs.value.length === 1) {
            selectPrevTraj();
          } else {
            moveToPrevPhrase();
          }
        } else {
          if (selectedTraj.value !== undefined && selectedTrajs.value.length === 1) {
            selectNextTraj();
          } else {
            moveToNextPhrase();
          }
        }
      } else if (e.key === 'Alt') {
        alted.value = true;
      } else if (e.key === '[') {
        e.preventDefault();
        horizontalMoveGraph(-0.5);
      } else if (e.key === ']') {
        e.preventDefault();
        horizontalMoveGraph(0.5);
      } else if (e.key === 'Meta' && props.browser.os!.includes('Mac OS')) {
        console.log('mac meta')
        metad.value = true;
      } else if (e.key === 'Control' && props.browser.os!.includes('Windows')) {
        metad.value = true
      }
    }

    const selectTraj = (uId: string) => {
      const renderObj = trajRenderStatus.value.flat().find(obj => {
        return obj.uniqueId === uId
      });
      if (renderObj === undefined) {
        throw new Error('Traj not found in trajRenderStatus array');
      }
      renderObj.selectedStatus = true;
    }

    const selectNextTraj = () => {
      if (selectedTraj.value === undefined) {
        throw new Error('No traj selected');
      }
      const traj = selectedTraj.value;
      const track = props.piece.trackFromTraj(traj);
      const allTrajs = props.piece.allTrajectories(track)
        .filter(t => {
          return t.id !== 12
        })
      const trajIdx = allTrajs.findIndex(t => {
        return t.uniqueId === traj.uniqueId
      });
      if (trajIdx === -1) {
        throw new Error('Traj not found in allTrajs array');
      }
      if (trajIdx === allTrajs.length - 1) {
        return;
      }
      const nextTraj = allTrajs[trajIdx + 1];
      const nextPhrase = props.piece.phraseGrid[track][nextTraj.phraseIdx!];
      const trajEnd = nextPhrase.startTime! + nextTraj.startTime! + nextTraj.durTot;
      const nextTrajUId = nextTraj.uniqueId!;
      const renderObj = trajRenderStatus.value[track].find(obj => {
        return obj.uniqueId === traj.uniqueId
      })
      renderObj!.selectedStatus = false;
      selectTraj(nextTrajUId);
      if (trajEnd > props.displayRange[1]) {
        horizontalMoveGraph(0.85);
      }
    }

    const selectPrevTraj = () => {
      if (selectedTraj.value === undefined) {
        throw new Error('No traj selected');
      }
      const traj = selectedTraj.value;
      const track = props.piece.trackFromTraj(traj);
      const allTrajs = props.piece.allTrajectories(track)
        .filter(t => {
          return t.id !== 12
        })
      const trajIdx = allTrajs.findIndex(t => {
        return t.uniqueId === traj.uniqueId
      });
      if (trajIdx === -1) {
        throw new Error('Traj not found in allTrajs array');
      }
      if (trajIdx === 0) {
        return;
      }
      const prevTraj = allTrajs[trajIdx - 1];
      const prevPhrase = props.piece.phraseGrid[track][prevTraj.phraseIdx!];
      const trajStart = prevPhrase.startTime! + prevTraj.startTime!;
      const prevTrajUId = prevTraj.uniqueId!;
      const renderObj = trajRenderStatus.value[track].find(obj => {
        return obj.uniqueId === traj.uniqueId
      })
      renderObj!.selectedStatus = false;
      selectTraj(prevTrajUId);
      if (trajStart < props.displayRange[0]) {
        horizontalMoveGraph(-0.85);
      }
    }

    const nudgePhraseDiv = (amt: 1 | -1) => {
      if (selectedPhraseDivUid.value === undefined) {
        throw new Error('No phrase div selected');
      }
      const phrase = props.piece.phraseFromUId(selectedPhraseDivUid.value);
      const track = props.piece.trackFromPhraseUId(selectedPhraseDivUid.value);
      const pIdx = phrase.pieceIdx!;
      const phrases = props.piece.phraseGrid[track];
      if (amt === 1) {
        if (phrase.trajectories.length < 2) {
          return;
        }
        const prevPhrase = phrases[pIdx - 1];
        const firstTraj = phrase.trajectories[0];
        prevPhrase.trajectories.push(firstTraj);
        phrase.trajectories.shift();
        prevPhrase.durArrayFromTrajectories();
        prevPhrase.assignStartTimes();
        prevPhrase.assignTrajNums()
        phrase.durArrayFromTrajectories();
        phrase.assignStartTimes();
        phrase.assignTrajNums();
        props.piece.durArrayFromPhrases();
        const divType = props.piece.sectionStartsGrid[track].includes(pIdx) ? 
          'section' : 'phrase';
        const pd: PhraseDivDisplayType = {
          time: phrase.startTime!,
          type: divType,
          idx: pIdx,
          track,
          uId: phrase.uniqueId
        };
        removePhraseDiv(selectedPhraseDivUid.value);
        renderPhraseDiv(pd);
      } else {
        if (pIdx === 0) {
          return;
        }
        const prevPhrase = phrases[pIdx - 1];
        if (prevPhrase.trajectories.length < 2) {
          return;
        }
        const lastTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
        prevPhrase.trajectories.pop();
        phrase.trajectories.unshift(lastTraj);
        prevPhrase.durArrayFromTrajectories();
        prevPhrase.assignStartTimes();
        prevPhrase.assignTrajNums();
        phrase.durArrayFromTrajectories();
        phrase.assignStartTimes();
        phrase.assignTrajNums();
        props.piece.durArrayFromPhrases();
        const divType = props.piece.sectionStartsGrid[track].includes(pIdx) ? 
          'section' : 'phrase';
        const pd: PhraseDivDisplayType = {
          time: phrase.startTime!,
          type: divType,
          idx: pIdx,
          track,
          uId: phrase.uniqueId
        };
        removePhraseDiv(selectedPhraseDivUid.value);
        renderPhraseDiv(pd);
      };
      emit('update:xAxisPhraseLabels');
      emit('unsavedChanges', true);
    };

    const nudgeChikari = (amt: number) => {
      const cd = selectedChikari.value!;
      const phrase = props.piece.phraseGrid[cd.track][cd.phraseIdx];
      const newPhraseTime = String(Math.round(100 * (Number(cd.phraseTimeKey) + amt)) / 100);
      const newTime = cd.time + amt;
      phrase.chikaris[newPhraseTime] = cd.chikari;
      delete phrase.chikaris[cd.phraseTimeKey];
      const newCd: ChikariDisplayType = {
        uId: cd.uId,
        phraseIdx: cd.phraseIdx,
        phraseTimeKey: newPhraseTime,
        time: newTime,
        chikari: cd.chikari,
        track: cd.track
      };
      selectedChikari.value = newCd;
      clearChikari(cd);
      nextTick(() => {
        renderChikari(newCd);
      });
      emit('unsavedChanges', true);
    };

    const nudgePulse = (dir: 'left' | 'right') => {
      if (selectedPulse.value === undefined) {
        throw new Error('No pulse selected');
      }
      if (!props.editable) return;
      if (selectedPulse.value === selectedMeter.value!.allCorporealPulses[0]) {
        return;
      }
      const pulse = selectedMeter.value!.allCorporealPulses.find(p => {
        return p.uniqueId === selectedPulse.value!.uniqueId
      })!;
      const amt = 0.01;
      const aff = pulse.affiliations[0];
      const psId = aff.psId;
      const ps = selectedMeter.value!.getPSFromId(psId);
      let minTime, maxTime, newX;
      if (aff.idx === 0 && aff.segmentedMeterIdx === 0 && aff.layer === 0) {
        const psIdx = selectedMeter.value!.pulseStructures[0].indexOf(ps);
        let cycleNum, subdivs;
        const hierarchy = selectedMeter.value!.hierarchy[0];
        if (typeof hierarchy === 'number') {
          cycleNum = psIdx
          subdivs = hierarchy
        } else {
          cycleNum = Math.floor(psIdx / hierarchy.length);
          subdivs = sum(hierarchy);
        }
        const st = selectedMeter.value!.startTime;
        const center = st + selectedMeter.value!.cycleDur * cycleNum;
        const subDur = selectedMeter.value!.cycleDur / subdivs;
        const maxOff = subDur / 2;
        maxTime = center + maxOff;
        minTime = center - maxOff;
      } else {
        const maxOff = ps.pulseDur / 2;
        const pulseIdx = ps.pulses.map(p => p.uniqueId).indexOf(pulse.uniqueId);
        if (pulseIdx === -1) {
          throw new Error('Pulse not found in pulse structure');
        }
        const center = ps.startTime + ps.pulseDur * pulseIdx;
        maxTime = center + maxOff;
        minTime = center - maxOff;
      }
      if (dir === 'left') {
        newX = props.xScale(pulse.realTime - amt);
      } else {
        newX = props.xScale(pulse.realTime + amt);
      }
      if (newX < props.xScale(minTime)) {
        newX = props.xScale(minTime);
      } else if (newX > props.xScale(maxTime)) {
        newX = props.xScale(maxTime);
      }
      const oldTime = pulse.realTime;
      const newTime = props.xScale.invert(newX);
      const time = newTime - oldTime;
      nextTick(() => {
        selectedMeter.value!.offsetPulse(pulse, time, true);
        selectedMeter.value!.resetTempo();
        renderMeter(selectedMeter.value!);
      });
      emit('unsavedChanges', true);
    };

    const nudgeSlope = (dir: 'left' | 'right' | 'up' | 'down') => {
      if (selectedTraj.value === undefined) {
        throw new Error('No trajectory selected');
      }
      const traj = selectedTraj.value!;
      if (traj.sloped) {
        if (dir === 'left' || dir === 'down') {
          const logSlope = Math.log2(traj.slope);
          let offset = logSlope - 0.1 < 0 ? 0 : logSlope - 0.1;
          emit('update:slope', offset);
        } else {
          const logSlope = Math.log2(traj.slope);
          let offset = logSlope + 0.1 > 3 ? 3 : logSlope + 0.1;
          emit('update:slope', offset);
        }
      }
    }

    const nudgeDragDot = (dir: 'left' | 'right' | 'up' | 'down') => {
      const traj = selectedTraj.value!;
      const track = props.piece.trackFromTraj(traj);
      const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
      const trajStart = phrase.startTime! + traj.startTime!;
      const idx = selectedDragDotIdx.value!;
      const summedDurArr = [0, ...traj.durArray!].map(cumsum())[idx];
      const curTime = trajStart + summedDurArr * traj.durTot;
      const amt = 0.01;
      const logAmt = 0.0025;
      let newTime = curTime;
      let newLogFreq = traj.logFreqs.length > idx ? traj.logFreqs[idx] : 
        traj.logFreqs[idx - 1];
      if (dir === 'left') {
        newTime = constrainTime(curTime - amt, idx);
        const x = props.xScale(newTime);
        d3.select(`#dragDot${idx}`)
          .attr('cx', x);
        // if idx is 0, and the diff between newTime and the previous traj's end (assuming
        // that traj.id !== 12) is less than some min, and the logFreq of the new time is close to the 
        // logFreq of the previous traj's last pitch, then set newTime to the previous
        // traj's end time, and set newLogFreq to the previous traj's last pitch.logFreq
        // idx is about the dot, traj index is traj.num
        if (idx === 0) {
          if (traj.num! > 1) {
            const silTraj = phrase.trajectories[traj.num! - 1];
            const prevTraj = phrase.trajectories[traj.num! - 2];
            if (silTraj.id === 12 && prevTraj.id !== 12) {
              const prevPitch = prevTraj.pitches[prevTraj.pitches.length - 1];
              const diff = Math.abs(newLogFreq - prevPitch.logFreq);
              const prevTime = phrase.startTime! + prevTraj.startTime! + prevTraj.durTot;
              const timeDiff = Math.abs(newTime - prevTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newTime = prevTime;
                newLogFreq = prevPitch.logFreq;
                const x = props.xScale(newTime);
                const y = props.yScale(newLogFreq);
                d3.select(`#dragDot${idx}`)
                  .attr('cx', x)
                  .attr('cy', y);
              }
            }
          }
        }
      } else if (dir === 'right') {
        newTime = constrainTime(curTime + amt, idx);
        const x = props.xScale(newTime);
        d3.select(`#dragDot${idx}`)
          .attr('cx', x);
        if (idx === traj.pitches.length - 1) {
          if (traj.num! < phrase.trajectories.length - 2) {
            const silTraj = phrase.trajectories[traj.num! + 1];
            const nextTraj = phrase.trajectories[traj.num! + 2];
            if (silTraj.id === 12 && nextTraj.id !== 12) {
              const nextPitch = nextTraj.pitches[0];
              const diff = Math.abs(newLogFreq - nextPitch.logFreq);
              const nextTime = phrase.startTime! + nextTraj.startTime!;
              const timeDiff = Math.abs(nextTime - newTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newTime = nextTime;
                newLogFreq = nextPitch.logFreq;
                const x = props.xScale(newTime);
                const y = props.yScale(newLogFreq);
                d3.select(`#dragDot${idx}`)
                  .attr('cx', x)
                  .attr('cy', y);
              }
            }
          }
        }
      } else if (dir === 'up') {
        if (props.sargamMagnetMode) {
          const curPitch = traj.pitches[idx];
          const swaraObjs = props.piece.raga.swaraObjects;
          const swaraIdx = swaraObjs.findIndex(sObj => {
            const c1 = sObj.swara === curPitch.swara;
            const c2 = sObj.raised === curPitch.raised;
            return c1 && c2;
          })
          const newSwaraIdx = (swaraIdx + 1) % swaraObjs.length;
          let oct = curPitch.oct;
          if (newSwaraIdx === 0) {
            oct += 1;
          }
          const newPitch = new Pitch({
            swara: swaraObjs[newSwaraIdx].swara,
            raised: swaraObjs[newSwaraIdx].raised,
            oct,
            fundamental: props.piece.raga.fundamental,
            ratios: curPitch.ratios
          });
          newLogFreq = newPitch.logFreq;
        } else {
          newLogFreq = newLogFreq + logAmt;
          // if there is a traj before this one, and that traj.id is not === 12, 
          // and the difference between newLogFreq and the previous traj's last 
          // pitch.logFreq is less than 0.05, then set newLogFreq to the previous
          // traj's last pitch.logFreq
          if (idx === 0 && traj.num! > 1) {
            const silTraj = phrase.trajectories[traj.num! - 1];
            const prevTraj = phrase.trajectories[traj.num! - 2];
            if (prevTraj.id !== 12 && silTraj.id === 12) {
              const prevPitch = prevTraj.pitches[prevTraj.pitches.length - 1];
              const diff = Math.abs(newLogFreq - prevPitch.logFreq);
              const prevTime = phrase.startTime! + prevTraj.startTime! + prevTraj.durTot;
              const timeDiff = Math.abs(newTime - prevTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newLogFreq = prevPitch.logFreq;
                newTime = prevTime;
              }
            } else if (silTraj.id !== 12) {
              const silPitch = silTraj.pitches[0];
              const diff = Math.abs(newLogFreq - silPitch.logFreq);
              if (diff < 0.05) {
                newLogFreq = silPitch.logFreq;
              }
            }
          }
          if (idx === traj.pitches.length - 1 && traj.num! < phrase.trajectories.length - 2) {
            const nextTraj = phrase.trajectories[traj.num! + 2];
            const silTraj = phrase.trajectories[traj.num! + 1];
            if (nextTraj.id !== 12 && silTraj.id === 12) {
              const nextPitch = nextTraj.pitches[0];
              const diff = Math.abs(newLogFreq - nextPitch.logFreq);
              const nextTime = phrase.startTime! + nextTraj.startTime!;
              const timeDiff = Math.abs(nextTime - newTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newLogFreq = nextPitch.logFreq;
                newTime = nextTime;
              }
            } else if (silTraj.id !== 12) {
              const silPitch = silTraj.pitches[0];
              const diff = Math.abs(newLogFreq - silPitch.logFreq);
              if (diff < 0.05) {
                newLogFreq = silPitch.logFreq;
              }
            }
          }
        }
      } else if (dir === 'down') {
        if (props.sargamMagnetMode) {
          const curPitch = traj.pitches[idx];
          const swaraObjs = props.piece.raga.swaraObjects;
          const swaraIdx = swaraObjs.findIndex(sObj => {
            const c1 = sObj.swara === curPitch.swara;
            const c2 = sObj.raised === curPitch.raised;
            return c1 && c2;
          })
          if (swaraIdx === -1) {
            throw new Error('Swara not found in swaraObjects');
          }
          let newSwaraIdx = (swaraIdx - 1) % swaraObjs.length;
          while (newSwaraIdx < 0) {
            newSwaraIdx += swaraObjs.length;
          }
          let oct = curPitch.oct;
          if (newSwaraIdx === swaraObjs.length - 1) {
            oct -= 1;
          }
          const newPitch = new Pitch({
            swara: swaraObjs[newSwaraIdx].swara,
            raised: swaraObjs[newSwaraIdx].raised,
            oct: oct,
            fundamental: props.piece.raga.fundamental,
            ratios: curPitch.ratios
          });
          newLogFreq = newPitch.logFreq;
        } else {
          newLogFreq = newLogFreq - logAmt;
          if (idx === 0 && traj.num! > 1) {
            const prevTraj = phrase.trajectories[traj.num! - 2];
            const silTraj = phrase.trajectories[traj.num! - 1];
            if (prevTraj.id !== 12 && silTraj.id === 12) {
              const prevPitch = prevTraj.pitches[prevTraj.pitches.length - 1];
              const diff = Math.abs(newLogFreq - prevPitch.logFreq);
              const prevTime = phrase.startTime! + prevTraj.startTime! + prevTraj.durTot;
              const timeDiff = Math.abs(newTime - prevTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newLogFreq = prevPitch.logFreq;
                newTime = prevTime;
              }
            } else if (silTraj.id !== 12) {
              const silPitch = silTraj.pitches[0];
              const diff = Math.abs(newLogFreq - silPitch.logFreq);
              if (diff < 0.05) {
                newLogFreq = silPitch.logFreq;
              }
            }
          }
          if (idx === traj.pitches.length - 1 && traj.num! < phrase.trajectories.length - 2) {
            const nextTraj = phrase.trajectories[traj.num! + 2];
            const silTraj = phrase.trajectories[traj.num! + 1];
            if (nextTraj.id !== 12 && silTraj.id === 12) {
              const nextPitch = nextTraj.pitches[0];
              const diff = Math.abs(newLogFreq - nextPitch.logFreq);
              const nextTime = phrase.startTime! + nextTraj.startTime!;
              const timeDiff = Math.abs(nextTime - newTime);
              if (diff < 0.05 && timeDiff < 0.1) {
                newLogFreq = nextPitch.logFreq;
                newTime = nextTime;
              }
            } else if (silTraj.id !== 12) {
              const silPitch = silTraj.pitches[0];
              const diff = Math.abs(newLogFreq - silPitch.logFreq);
              if (diff < 0.05) {
                newLogFreq = silPitch.logFreq;
              }
            }
          }
        }
      }
      const newPitch = () => {
        return props.piece.raga.pitchFromLogFreq(newLogFreq)
      }
      const y = props.yScale(newLogFreq);
      if (traj.logFreqs[idx]) {
        traj.pitches[idx] = newPitch();
        if (idx === 0 && (traj.id === 0 || traj.id === 13)) {
          traj.pitches[1] = newPitch();
          d3.select(`#dragDot1`)
            .attr('cy', y);
        } else if (idx === 1 && (traj.id === 0 || traj.id === 13)) {
          traj.pitches[0] = newPitch();
          d3.select(`#dragDot0`)
            .attr('cy', y);
        }
      }

      if (idx > 0 && idx < traj.durArray!.length) {
        const newDurArray = calculateNewDurArray(phrase, traj, idx, newTime);
        traj.durArray = newDurArray;
      } else if (idx === 0) {
        const delta = newTime - (phrase.startTime! + traj.startTime!);
        if (traj.num === 0) {
          const prevPhrase = props.piece.phraseGrid[track][traj.phraseIdx! - 1];
          const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
          updatePrevTraj(prevTraj, delta);
          updateDurArray(traj, delta);
          traj.durTot -= delta;
          phrase.startTime! += delta;
          updatePhraseChikaris(phrase, delta);
        } else {
          const prevTraj = phrase.trajectories[traj.num! - 1];
          updatePrevTraj(prevTraj, delta);
          updateDurArray(traj, delta);
          traj.durTot -= delta;
          phrase.durArrayFromTrajectories();
          phrase.assignStartTimes();
        }
      } else if (idx === traj.durArray!.length) {
        const delta = newTime - (phrase.startTime! + traj.startTime! + traj.durTot);
        if (traj.num! < phrase.trajectories.length - 1) {
          const nextTraj = phrase.trajectories[traj.num! + 1];
          updateNextTraj(nextTraj, delta);
          if (traj.durArray!.length > 1) {
            traj.durArray = newDurArrayZ(traj, delta);
          }
          traj.durTot += delta;
          phrase.durArrayFromTrajectories();
        } else if (props.piece.phraseGrid[track][traj.phraseIdx! + 1]) {
          const nextPhrase = props.piece.phraseGrid[track][traj.phraseIdx! + 1];
          const nextTraj = nextPhrase.trajectories[0];
          updateNextTraj(nextTraj, delta);
          nextPhrase.startTime! += delta;
          nextPhrase.durArrayFromTrajectories();
          nextPhrase.assignStartTimes();
          const tda = traj.durArray!;
          if (tda.length > 1) {
            const initPartZ = tda[tda.length - 1] * traj.durTot;
            const newDur = traj.durTot + delta;
            const newPropZ = (initPartZ + delta) / newDur;
            const newDurArray = tda.map((i => i * traj.durTot / newDur));
            newDurArray[tda.length - 1] = newPropZ;
            traj.durArray = newDurArray;
          }
          traj.durTot += delta;
          phrase.durArrayFromTrajectories();
          phrase.assignStartTimes();
          updatePhraseChikaris(nextPhrase, delta);
        }
        
      }
      const affectedTrajs = [traj];
      let affectedPhraseDivUid = undefined;
      const tIdx = traj.num!;
      const pIdx = traj.phraseIdx!;
      if (idx === 0) {
        if (tIdx === 0) {
          if (pIdx > 0) {
            const prevPhrase = props.piece.phraseGrid[track][pIdx - 1];
            const prevTraj = prevPhrase.trajectories[prevPhrase.trajectories.length - 1];
            affectedTrajs.push(prevTraj);
            affectedPhraseDivUid = phrase.uniqueId;
            
          }
        } else {
          const prevTraj = phrase.trajectories[tIdx - 1];
          affectedTrajs.push(prevTraj);
        }
      } else if (idx === traj.durArray!.length) {
        if (tIdx < phrase.trajectories.length - 1) {
          const nextTraj = phrase.trajectories[tIdx + 1];
          affectedTrajs.push(nextTraj);
        } else if (props.piece.phraseGrid[track][pIdx + 1]) {
          const nextPhrase = props.piece.phraseGrid[track][pIdx + 1];
          const nextTraj = nextPhrase.trajectories[0];
          affectedTrajs.push(nextTraj);
          affectedPhraseDivUid = nextPhrase.uniqueId;
        }
      }

      affectedTrajs.forEach(traj => {
        const affectedIds = [7, 8, 9, 10, 11];
        if (affectedIds.includes(traj.id)) updateKrintinArticulations(traj)
        refreshTraj(traj)
      });

      if (affectedPhraseDivUid !== undefined) {
        removePhraseDiv(affectedPhraseDivUid);
        const pdObj = props.piece.allPhraseDivs(track).find(pd => {
          return pd.uId === affectedPhraseDivUid
        });
        if (pdObj === undefined) {
          throw new Error('PhraseDiv not found in allPhraseDivs array');
        }
        renderPhraseDiv(pdObj);
      }
      emit('unsavedChanges', true);
    }

    const handleKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shifted.value = false;
      } else if (e.key === 'Alt') {
        alted.value = false;
      } else if (e.key === 'Meta' && props.browser.os!.includes('Mac OS')) {
        metad.value = false;
      } else if (e.key === 'Control' && props.browser.os!.includes('Windows')) {
        metad.value = false;
      }
    }

    const selBoxDragStart = (e: d3.D3DragEvent<SVGSVGElement, Datum, SVGSVGElement>) => {
      if (shifted.value) {
        selBoxStartX = e.x;
        selBoxStartY = e.y;
        selBox = d3.select(tranSvg.value)
          .append('rect')
          .attr('id', 'selBox')
      } else if (alted.value) {
        regionStartPxl.value = e.x;
      }
    }

    const selBoxDragMove = (e: d3.D3DragEvent<SVGSVGElement, Datum, SVGSVGElement>) => {
      if (selBoxStartX !== undefined && selBoxStartY !== undefined) {
        if (shifted.value) {
          const x = Math.min(selBoxStartX, e.x);
          const y = Math.min(selBoxStartY, e.y);
          const width = Math.abs(selBoxStartX - e.x);
          const height = Math.abs(selBoxStartY - e.y);
          selBox?.attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5, 5')
        } else {
          selBoxDragEnd(e);
        }
      }
    }

    const setUpRegion = () => {
      if (regionStartPxl.value === undefined || regionEndPxl.value === undefined) {
        throw new Error('Region start or end is undefined');
      }
      emit('update:region')
      if (props.hasRecording) {
        nextTick(() => emit('update:apStretchable', true))
      }
      const regionLine = d3.line()([
        [0, 0],
        [0, props.height]
      ]);
      d3.selectAll('.region').remove();
      d3.selectAll('.regionStart').remove();
      d3.selectAll('.regionEnd').remove();
     
      const regionG = d3.select(tranSvg.value)
        .select('.regionG');
      regionG
        .append('rect')
        .classed('region', true)
        .style('pointer-events', 'none')
        .attr('width', regionEndPxl.value - regionStartPxl.value)
        .attr('height', props.height)
        .attr('fill', 'white')
        .attr('opacity', 0.4)
        .attr('transform', `translate(${regionStartPxl.value}, 0)`);
      regionG
        .append('path')
        .classed('regionStart', true)
        .attr('d', regionLine)
        .attr('stroke', 'grey')
        .attr('opacity', 0.5)
        .attr('stroke-width', 1)
        .attr('transform', `translate(${regionStartPxl.value}, 0)`);
      regionG
        .append('path')
        .classed('regionEnd', true)
        .attr('d', regionLine)
        .attr('stroke', 'grey')
        .attr('opacity', 0.5)
        .attr('stroke-width', 1)
        .attr('transform', `translate(${regionEndPxl.value}, 0)`);

    };

    const selBoxDragEnd = (e: d3.D3DragEvent<SVGSVGElement, Datum, SVGSVGElement>) => {
      if (alted.value && regionStartPxl.value !== undefined) {
        if (e.x < regionStartPxl.value!) {
          regionEndPxl.value = regionStartPxl.value;
          regionStartPxl.value = e.x;
        } else {
          regionEndPxl.value = e.x;
        }
        const timeDiff = Math.abs(props.xScale.invert(regionStartPxl.value) - 
          props.xScale.invert(regionEndPxl.value));
        if (timeDiff < 0.01) {
          regionStartPxl.value = undefined;
          regionEndPxl.value = undefined;
        } else {
          setUpRegion();
        }
      } else {
        const c = selBoxStartX === e.x && selBoxStartY === e.y;
        if (selBoxStartX !== undefined && selBoxStartY !== undefined && !c) {
          const x = Math.min(selBoxStartX, e.x);
          const y = Math.min(selBoxStartY, e.y);
          const width = Math.abs(selBoxStartX - e.x);
          const height = Math.abs(selBoxStartY - e.y);
          d3.select('#selBox').remove();
          const startTime = props.xScale.invert(x);
          const endTime = props.xScale.invert(x + width);
          const lowLogFreq = props.yScale.invert(y + height);
          const highLogFreq = props.yScale.invert(y);
          selBoxSelectTrajs({
            startTime,
            endTime,
            minLogFreq: lowLogFreq,
            maxLogFreq: highLogFreq,
            track: props.editingInstIdx
          });
        } else {
          debouncedHandleClick(e.sourceEvent! as MouseEvent);
        }
        selBoxStartX = undefined;
        selBoxStartY = undefined;
      }
    }

    const possibleTrajDivs = (track: number, pIdx?: number) => {
      if (pIdx !== undefined) {
        // returns times on left and right of phrase div (so, current phrase 
        // and next phrase)
        const phraseA = props.piece.phraseGrid[track][pIdx];
        const phraseB = props.piece.phraseGrid[track][pIdx + 1];
        // get all trajs except first one, and collect all start times
        const stA = phraseA.startTime!;
        const stB = phraseB.startTime!;
        const divs = phraseA.trajectories.slice(1).map(t => stA + t.startTime!);
        divs.push(...phraseB.trajectories.map(t => stB + t.startTime!));
        return divs
      } else {
        const divs: number[] = [];
        props.piece.phraseGrid[track].forEach(phrase => {
          const st = phrase.startTime!;
          divs.push(...phrase.trajectories.slice(1).map(t => st + t.startTime!))
        });
        return divs
      }
    };

    const setUpSvg = () => {
      const svg = (d3.select(tranSvg.value) as 
        d3.Selection<SVGSVGElement, Datum, null, undefined>);
      const drag = d3.drag<SVGSVGElement, Datum>()
        .on('start', selBoxDragStart)
        .on('drag', selBoxDragMove)
        .on('end', selBoxDragEnd);
      svg
        .attr('width', props.width)
        .attr('height', props.height)
        .call(drag)
        .on('click', debouncedHandleClick)
        .on('dblclick', handleDoubleClick)
        .on('contextmenu', backgroundContextMenuClick)
    };

    const timeWithinMeter = (time: number) => {
      let out = false;
      props.piece.meters.forEach(meter => {
        const corpTimes = meter.realCorpTimes;
        if (time >= corpTimes[0] && time <= corpTimes[corpTimes.length - 1]) {
          out = true;
        }
      });
      return out;
    }

    const insertPulse = (e: MouseEvent) => {
      const time = props.xScale.invert(e.offsetX);
      let inserted = false;
      if (!timeWithinMeter(time)) {
        if (insertPulses.value.length > 0) {
          if (time >= ipLims.value[0] && time < ipLims.value[1]) {
            insertPulses.value.push(time);
            inserted = true;
          }
        } else {
          insertPulses.value.push(time);
          inserted = true;
        }
        if (inserted) {
          const meterG = d3.select('.meterG');
          const x = props.xScale(time);
          const line = d3.line()([
            [0, props.yScale(logMin.value)],
            [0, props.yScale(logMax.value)]
          ]);
          meterG.append('path')
            .classed('insertPulse', true)
            .attr('stroke', props.selectedMeterColor)
            .attr('stroke-width', 2)
            .attr('d', line)
            .attr('transform', `translate(${x}, 0)`);
        }
        if (insertPulses.value.length === 0) {
          emit('update:prevMeter', false)
        } else {
          const mtrStarts = props.piece.meters.map(m => m.startTime);
          emit('update:prevMeter', Math.min(...mtrStarts) < insertPulses.value[0])
        }

      }
    };

    const clearInsertPulses = () => {
      insertPulses.value = [];
      d3.selectAll('.insertPulse').remove();
      emit('update:prevMeter', false);
    };

    const renderInsertPulses = () => {
      d3.selectAll('.insertPulse').remove();
      insertPulses.value.forEach(time => {
        const meterG = d3.select('.meterG');
        const x = props.xScale(time);
        const line = d3.line()([
          [0, props.yScale(logMin.value)],
          [0, props.yScale(logMax.value)]
        ]);
        meterG.append('path')
          .classed('insertPulse', true)
          .attr('stroke', props.selectedMeterColor)
          .attr('stroke-width', 2)
          .attr('d', line)
          .attr('transform', `translate(${x}, 0)`);
      });
    };

    const backgroundContextMenuClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      contextMenuX.value = e.offsetX;
      contextMenuY.value = e.offsetY;
      contextMenuClosed.value = false;
      const time = props.xScale.invert(e.offsetX);
      const pIdx = props.piece.phraseIdxFromTime(time, props.editingInstIdx);
      const ss = props.piece.sectionStartsGrid[props.editingInstIdx];
      const sectionIdx = ss.findLastIndex(s => s <= pIdx);
      contextMenuChoices.value = [];
      contextMenuChoices.value.push({
        text: `Edit Section ${sectionIdx + 1} labels`,
        action: () => {
          contextMenuClosed.value = true;
          d3.select(tranSvg.value)
            .attr('cursor', 'default');
          const options: LabelEditorOptions = {
            type: 'Section',
            idx: sectionIdx,
            track: props.editingInstIdx
          }
          emit('open:labelEditor', options)
        },
        enabled: true
      });
      contextMenuChoices.value.push({
        text: `Edit Phrase ${pIdx + 1} labels`,
        action: () => {
          contextMenuClosed.value = true;
          d3.select(tranSvg.value)
            .attr('cursor', 'default');
          const options: LabelEditorOptions = {
            type: 'Phrase',
            idx: pIdx,
            track: props.editingInstIdx
          }
          emit('open:labelEditor', options)
        },
        enabled: true
      });
      contextMenuChoices.value.push({
        text: `Add to Collection`,
        action: () => {
          contextMenuClosed.value = true;
          emit('open:addToCollection');
        }, 
        enabled: true
      })
      if (removableCols.value.length > 0) {
        contextMenuChoices.value.push({
          text: `Remove from Collection`,
          action: () => {
            contextMenuClosed.value = true;
            emit('open:removeFromCollection');

          },
          enabled: true
        })
      }
    }
 
    const handleClick = (e: MouseEvent) => {
      let time = props.xScale.invert(e.offsetX);
      const logFreq = props.yScale.invert(e.offsetY);
      const track = props.editingInstIdx;
      const pIdx = props.piece.phraseIdxFromTime(time, track);
      if (props.selectedMode === EditorMode.Chikari) {
        insertNewChikari(time, track, pIdx);
      } else if (props.selectedMode === EditorMode.PhraseDiv) {
        insertNewPhraseDiv(time, track, pIdx);
      } else if (props.selectedMode === EditorMode.Trajectory) { 
        if (!alted.value) {

          insertNewTrajDot(time, logFreq, track, pIdx);
        }
      } else if (props.selectedMode === EditorMode.Series) {
        insertNewTrajDot(time, logFreq, track, pIdx);
      } else if (props.selectedMode === EditorMode.Meter) {
        // need to implement this stuff
        if (selectedMeter.value) {
          handleEscape();
        }
        insertPulse(e);

      } else if (props.selectedMode === EditorMode.None) {
        const target = e.target! as HTMLElement;
        const classes = [
          'tranSvg', 
          'sargamLine', 
          'sargamLabel', 
          'vowelLabel',
          'consonantLabel'
        ];
        const f = classes.some(c => target.classList.contains(c));
        if (f && !shifted.value) {
          handleEscape({ includeRegion: false });
        }
      } else if (props.selectedMode === EditorMode.Region) {
        const phrase = props.piece.phraseGrid[track][pIdx];
        regionStartX.value = phrase.startTime!;
        regionEndX.value = phrase.startTime! + phrase.durTot!;
        emit('update:selectedMode', EditorMode.None);
        nextTick(() => setUpRegion());
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      let time = props.xScale.invert(e.offsetX);
      emit('update:currentTime', time);

      updatePlayheadPosition(time);

    }

    const debouncedHandleClick = debounce(handleClick, 100);

    const meterMagnetize = (time: number) => {
      let outTime = undefined
      props.piece.meters.forEach(meter => {
        const corpTimes = meter.realCorpTimes;
        // const corpPulses = meter.allCorporealPulses;
        const start = corpTimes[0];
        const end = corpTimes[corpTimes.length - 1]
        if (time >= start && time <= end) {
          const nearestTime = corpTimes.reduce((a, b) => {
            const aDiff = Math.abs(a - time);
            const bDiff = Math.abs(b - time);
            if (aDiff < bDiff) {
              return a
            } else {
              return b
            }
          })
          outTime = nearestTime
        }
      })
      if (outTime === undefined) {
        outTime = time
      }
      return outTime
    };

    const insertNewTrajDot = (
      time: number, 
      logFreq: number, 
      track: number, 
      pIdx: number, 
      atPhraseDiv: boolean = false
    ) => {
      if (props.meterMagnetMode) {
        time = meterMagnetize(time)
      }
      if (
        props.selectedMode === EditorMode.Series && 
        trajTimePts.value.length === 1
      ) {
        if (time < trajTimePts.value[0].time) {
          return;
        }
      }
      if (props.sargamMagnetMode) {
        const pitch = props.piece.raga.pitchFromLogFreq(logFreq);
        pitch.logOffset = 0;
        logFreq = pitch.logFreq;
      }
      const phrase = props.piece.phraseGrid[track][pIdx];
      let tIdx: number;
      if (atPhraseDiv) {
        tIdx = phrase.trajectories.length - 1;
      } else {
        tIdx = phrase.trajIdxFromTime(time)!;
      }
      let traj = phrase.trajectories[tIdx];
      if (traj.id === 12) {
        // if close, attach to prev traj
        if (tIdx > 0) {
          const prevTraj = phrase.trajectories[tIdx - 1];
          if (prevTraj.id !== 12) {
            const lastPitch = prevTraj.pitches[prevTraj.pitches.length - 1];
            const diff = Math.abs(lastPitch.logFreq - logFreq);
            const lastTime = prevTraj.startTime! + prevTraj.durTot;
            const timeDiff = Math.abs(time - lastTime);
            if (diff < 0.05 && timeDiff < 0.1) {
              logFreq = lastPitch.logFreq;
            }
          }
        }
        // if close, attach to next traj
        if (tIdx < phrase.trajectories.length - 1) {
          const nextTraj = phrase.trajectories[tIdx + 1];
          if (nextTraj.id !== 12) {
            const firstPitch = nextTraj.pitches[0];
            const diff = Math.abs(firstPitch.logFreq - logFreq);
            const lastTime = traj.startTime! + traj.durTot;
            const timeDiff = Math.abs(lastTime - time);
            if (diff < 0.05 && timeDiff < 0.1) {
              logFreq = firstPitch.logFreq;
            }
          }
        }
        let setIt = true;
        if (trajTimePts.value.length > 0) {
          const c1 = trajTimePts.value[0].tIdx === tIdx;
          const c2 = trajTimePts.value[0].pIdx === pIdx;
          const c3 = trajTimePts.value[0].track === track;
          if (!(c1 && c2 && c3)) {
            setIt = false;
          }
        }
        const diffs = trajTimePts.value.map(ttp => {
          return Math.abs(ttp.time - time)
        });
        const minDiff = Math.min(...diffs);
        setIt = minDiff > 0.05;
        if (setIt) {
          const startTime = phrase.startTime! + traj.startTime!;
          if (time - startTime < minTrajDur) {
            time = startTime
          } else if (startTime + traj.durTot - time < minTrajDur) {
            time = startTime + traj.durTot
          }
          const tpObj = {
            time,
            logFreq, 
            pIdx,
            tIdx,
            track
          };
          trajTimePts.value.push(tpObj);
          renderTimePt(tpObj);
          emit('update:trajTimePts', trajTimePts.value);
        }
      }
    };

    const selectedTrajsGroupable = () => {// tests whether all trajs in this.selectedTrajs
      // are adjacent to one another and part of the same phrase
      const uniquePIdxs = [...new Set(selectedTrajs.value.map(t => t.phraseIdx))]
      if (uniquePIdxs.length === 1) {
        // sort by num
        selectedTrajs.value.sort((a, b) => a.num! - b.num!);
        const nums = selectedTrajs.value.map(traj => traj.num!);
        const diffs = nums.slice(1).map((num, nIdx) => {
          return num - nums[nIdx];
        })
        const c1 = diffs.every(diff => diff === 1);
        const c2 = selectedTrajs.value.every(traj => {
          return traj.groupId === selectedTrajs.value[0].groupId
        });
        return c1 && c2
      } else {
        return false
      }
    };

    const insertNewPhraseDiv = (time: number, track: number, pIdx: number) => {
      const phrase = props.piece.phraseGrid[track][pIdx];
      const tIdx = phrase.trajIdxFromTime(time)!;
      const traj = phrase.trajectories[tIdx];
      if (traj.groupId !== undefined) {
        const group = phrase.getGroupFromId(traj.groupId)!;
        const firstTraj = group.trajectories[0];
        const lastTraj = group.trajectories[group.trajectories.length - 1];
        const startTime = phrase.startTime! + firstTraj.startTime!;
        let endTime = lastTraj.startTime! + lastTraj.durTot;
        endTime = endTime + phrase.startTime!;
        if (endTime - time <= time - startTime) {
          time = endTime;
        } else {
          time = startTime;
        }
      }
      if (traj.id === 12) {
        // make current traj durTot such that it ends at current time, and 
        // make new traj start at current time, update the phrase to reflect
        // and reset zoom ? Or ... do I have to manually rename all the 
        // following trajs if there are any?
        const firstTrajDur = time - (phrase.startTime! + traj.startTime!);
        const secondTrajDur = traj.durTot - firstTrajDur;
        traj.durTot = firstTrajDur;
        const ntObj: {
          id: number,
          durTot: number,
          pitches: Pitch[],
          fundID12: number,
          instrumentation?: Instrument
        } = {
          id: 12,
          durTot: secondTrajDur,
          pitches: [],
          fundID12: props.piece.raga.fundamental,
        };
        ntObj.instrumentation = props.piece.instrumentation[track];
        const newTraj = new Trajectory(ntObj);
        phrase.trajectories.splice(tIdx + 1, 0, newTraj);
        phrase.reset();
        // right here, I need to reid all the following trajectories
        
      }
      const possibleTimes = possibleTrajDivs(track);
      const finalTime = getClosest(possibleTimes, time);
      const ftIdx = possibleTimes.indexOf(finalTime);
      const ptPerP = props.piece.phraseGrid[track]
        .map(p => p.trajectories.length - 1);
      // look into this cumsum issue ...
      const lims = [0, ...ptPerP.map(cumsum()).slice(0, ptPerP.length - 1)];
      const pIdx_ = lims.findLastIndex(lim => ftIdx >= lim);
      const start = lims[pIdx_];
      const trajIdx = ftIdx - start;
      const phrase_ = props.piece.phraseGrid[track][pIdx_];
      const end = phrase_.trajectories.length - (trajIdx + 1);
      const newTrajs = phrase_.trajectories.splice(trajIdx+1, end);
      phrase_.durTotFromTrajectories();
      phrase_.durArrayFromTrajectories();
      const newPhraseObj: {
        trajectories: Trajectory[],
        raga: Raga,
        chikaris?: { [key: string]: Chikari },
        instrumentation?: string[]
      } = {
        trajectories: newTrajs,
        raga: phrase_.raga!
      };
      const keys = Object.keys(phrase_.chikaris);
      keys.forEach(key => {
        if (Number(key) >= phrase_.durTot!) {
          newPhraseObj.chikaris = newPhraseObj.chikaris || {};
          const newTime = String(Math.round(100 * 
            (Number(key) - phrase_.durTot!)) / 100);
          newPhraseObj.chikaris[newTime] = phrase_.chikaris[key];
          delete phrase_.chikaris[key];
        }
      })

      if (props.piece.instrumentation) {
        newPhraseObj.instrumentation = props.piece.instrumentation;
      }
      const newPhrase = new Phrase(newPhraseObj)
      props.piece.phraseGrid[track].splice(phrase_.pieceIdx! + 1, 0, newPhrase);
      props.piece.durTotFromPhrases();
      props.piece.durArrayFromPhrases();
      props.piece.updateStartTimes();
      const pd: PhraseDivDisplayType = {
        time: newPhrase.startTime!,
        type: 'phrase',
        idx: newPhrase.pieceIdx!,
        track: track,
        uId: newPhrase.uniqueId
      };
      renderPhraseDiv(pd);
      emit('unsavedChanges', true);
      emit('update:selectedMode', EditorMode.None);
      emit('update:xAxisPhraseLabels')
    }

    const insertNewChikari = (time: number, track: number, pIdx: number) => {
      const phrase = props.piece.phraseGrid[track][pIdx];
        const phraseTime = time - phrase.startTime!;
        const c = new Chikari();
        const strTime = String(Math.round(100 * phraseTime) / 100);
        phrase.chikaris[strTime] = c;
        const cd: ChikariDisplayType = {
          time,
          phraseTimeKey: strTime,
          phraseIdx: phrase.pieceIdx!,
          track: track,
          chikari: c,
          uId: c.uniqueId
        };
        renderChikari(cd);
        emit('unsavedChanges', true);
        emit('update:selectedMode', EditorMode.None);
    }

    const collectTrajs = (
        timelyTrajs: Trajectory[], 
        options: { 
          startTime?: number, 
          endTime?: number, 
          minLogFreq?: number, 
          maxLogFreq?: number
        } = {
      startTime: undefined,
      endTime: undefined,
      minLogFreq: undefined,
      maxLogFreq: undefined
    }
    ) => {
      if (options.startTime === undefined || options.endTime === undefined ||
          options.minLogFreq === undefined || options.maxLogFreq === undefined) {
        throw new Error('Missing selection box parameters');
      }
      const startTime = options.startTime;
      const endTime = options.endTime;
      const lowFreq = options.minLogFreq;
      const highFreq = options.maxLogFreq;
      const collectedTrajs: Trajectory[] = [];
      const sampleDur = 0.01;
      timelyTrajs.forEach(async (traj, tIdx) => {
        const track = props.piece.trackFromTraj(traj);
        const phrase = props.piece.phraseGrid[track][traj.phraseIdx!];
        const trajStart = phrase.startTime! + traj.startTime!;
        const trajEnd = trajStart + traj.durTot;
        let sampleTimes;
        if (tIdx === 0) {
          if (timelyTrajs.length === 1) {
            const div = Math.floor((endTime - startTime) / sampleDur);
            sampleTimes = linSpace(0, 1, div);
          } else {
            const div = Math.floor((trajEnd - startTime) / sampleDur);
            sampleTimes = linSpace(0, 1, div)
          }
        } else if (tIdx === timelyTrajs.length - 1) {
          const div = Math.floor((endTime - trajStart) / sampleDur);
          sampleTimes = linSpace(0, 1, div)
        } else {
          const div = Math.floor((trajEnd - trajStart) / sampleDur);
          sampleTimes = linSpace(0, 1, div)
        }
        let trigger = false;
        let override = false;
        let ct = 0;
        while ((!trigger) && (!override)) {
          const logFreq = traj.compute(sampleTimes[ct], true);
          if (logFreq >= lowFreq && logFreq <= highFreq) {
            trigger = true;
          } else if (ct === sampleTimes.length - 1) {
            override = true;
          } else {
            ct++;
          }
        }
        if (trigger) {
          collectedTrajs.push(traj);
        }
        if (ct > 1000) {
          throw new Error('ct > 1000')
        }
        return
      });
      return collectedTrajs
    };

    const selBoxSelectTrajs = (options: { 
      startTime?: number, 
      endTime?: number, 
      minLogFreq?: number, 
      maxLogFreq?: number,
      track?: number
    } = {
      startTime: undefined,
      endTime: undefined,
      minLogFreq: undefined,
      maxLogFreq: undefined,
      track: undefined
    }) => {
      
      if (options.startTime === undefined || 
          options.endTime === undefined ||
          options.minLogFreq === undefined || 
          options.maxLogFreq === undefined || 
          options.track === undefined) {
        throw new Error('Missing selection box parameters');
      }
      const startTime = options.startTime;
      const endTime = options.endTime;
      const minLogFreq = options.minLogFreq;
      const maxLogFreq = options.maxLogFreq;
      const trajs = props.piece.allTrajectories(options.track)
        .filter(traj => {
          const track = props.piece.trackFromTraj(traj);
          const phraseStart = props.piece.phraseGrid[track][traj.phraseIdx!].startTime!;
          const trajStart = phraseStart + traj.startTime!;
          const trajEnd = trajStart + traj.durTot;
          const c1 = trajStart >= startTime && trajStart <= endTime;
          const c2 = trajEnd >= startTime && trajEnd <= endTime;
          const c3 = trajStart <= startTime && trajEnd >= endTime;
          const c4 = traj.id !== 12;
          return (c1 || c2 || c3) && c4;
        })
      const overlappingTrajs = collectTrajs(trajs, options);
      if (selectedTraj.value) {
        if (overlappingTrajs.length > 0) {
          if (overlappingTrajs.length === 1) {
            if (selectedTraj.value.uniqueId !== overlappingTrajs[0].uniqueId) {
              clearDragDots();
            }
          } else {
            clearDragDots();
          }
        }
      }
      overlappingTrajs.forEach(traj => {
        const rObj = trajRenderStatus.value.flat().find(obj => {
          return obj.uniqueId === traj.uniqueId
        });
        rObj!.selectedStatus = true;
      })
    };

    const refreshSargam = (trajUId: string) => {
      const track = props.piece.trackFromTrajUId(trajUId);
      const sargamDisplayObjs = props.piece.allDisplaySargam(track)
        .filter(obj => obj.uId === trajUId);
      if (sargamDisplayObjs.length > 0) {
        clearSargam(trajUId);
        sargamDisplayObjs.forEach(obj => {
          renderSargam(obj);
        })
      }
    };

    const refreshVowel = (trajUId: string) => {
      const track = props.piece.trackFromTrajUId(trajUId);
      const vowelDisplayObjs = props.piece.allDisplayVowels(track)
        .filter(obj => obj.uId === trajUId);
      clearVowel(trajUId);
      if (vowelDisplayObjs.length > 0) {
        vowelDisplayObjs.forEach(obj => {
          renderVowel(obj);
        })
      }
    };

    const refreshEndingConsonant = (trajUId: string) => {
      const track = props.piece.trackFromTrajUId(trajUId);
      const consonantDisplayObjs = props.piece.allDisplayEndingConsonants(track)
        .filter(obj => obj.uId === trajUId);
      clearEndingConsonant(trajUId);
      if (consonantDisplayObjs.length === 1) {
        renderEndingConsonant(consonantDisplayObjs[0]);
      }
    }

    const pasteTrajs = () => {
      if (clipboardTrajs.value.length === 0) {
        return;
      }
      clipboardTrajs.value.sort((a, b) => {
        const phrases = props.piece.phraseGrid[props.editingInstIdx];
        const aPhrase = phrases[a.phraseIdx!];
        const aStart = aPhrase.startTime! + a.startTime!;
        const bPhrase = phrases[b.phraseIdx!];
        const bStart = bPhrase.startTime! + b.startTime!;
        return aStart - bStart;
      });
      const track = props.editingInstIdx;
      const fTraj = clipboardTrajs.value[0];
      const fPhrase = props.piece.phraseGrid[track][fTraj.phraseIdx!];
      const fPhraseStart = fPhrase.startTime! + fTraj.startTime!;
      const lTraj = clipboardTrajs.value[clipboardTrajs.value.length - 1];
      const lPhrase = props.piece.phraseGrid[track][lTraj.phraseIdx!];
      const lPhraseEnd = lPhrase.startTime! + lTraj.startTime! + lTraj.durTot;
      const dur = lPhraseEnd - fPhraseStart;
      let realST: number = props.currentTime;
      const startPIdx = props.piece.phraseIdxFromTime(realST, track);
      const startPhrase = props.piece.phraseGrid[track][startPIdx];
      const startTIdx = startPhrase.trajIdxFromTime(realST)!;
      const startTraj = startPhrase.trajectories[startTIdx];
      const realET = realST + dur;
      const endPIdx = props.piece.phraseIdxFromTime(realET, track);
      const endPhrase = props.piece.phraseGrid[track][endPIdx];
      const endTIdx = endPhrase.trajIdxFromTime(realET)!;
      if (startPIdx === endPIdx && startTIdx === endTIdx && startTraj.id === 12) {
        // save groupings in order to reapply to pasted trajs
        let groupedIdxs: { idxs: number[], uId: string}[] = [];
        clipboardTrajs.value.forEach((traj, idx) => {
          if (traj.groupId !== undefined) {
            const gIdx = groupedIdxs.findIndex(g => g.uId === traj.groupId);
            if (gIdx === -1) {
              groupedIdxs.push({ idxs: [idx], uId: traj.groupId });
            } else {
              groupedIdxs[gIdx].idxs.push(idx);
            }
          }
        });
        const pastedTrajs: Trajectory[] = [];
        clipboardTrajs.value.forEach((traj, tIdx) => {
          const origPhrase = props.piece.phraseGrid[track][traj.phraseIdx!];
          const origTrajStart = traj.startTime! + origPhrase.startTime!;
          const offsetTrajStart = origTrajStart - fPhraseStart;
          const newTrajStart = realST + offsetTrajStart;
          const targetPhrase = props.piece.phraseGrid[track][startPIdx];
          const targetTIdx = targetPhrase.trajIdxFromTime(newTrajStart)!;
          const targetT = targetPhrase.trajectories[targetTIdx];
          const copyObj = JSON.parse(JSON.stringify(traj));
          copyObj.uniqueId = undefined;
          copyObj.groupId = undefined;
          copyObj.pitches.forEach((pitch: object, pIdx: number) => {
            copyObj.pitches[pIdx] = new Pitch(pitch);
          })
          const newTraj = new Trajectory(copyObj);
          const startingTime = newTrajStart - targetPhrase.startTime!;
          const startsTogether = targetT.startTime! === startingTime;
          const targetEnd = targetT.startTime! + targetT.durTot;
          const computedEnd = newTrajStart - targetPhrase.startTime! + newTraj.durTot;
          const endsTogether = targetEnd === computedEnd;
          const trajs = targetPhrase.trajectories;
          if (startsTogether && endsTogether) {
            trajs.splice(startTIdx, 1, newTraj);
            targetPhrase.reset();
          } else if (startsTogether) {
            targetT.durTot = targetT.durTot - newTraj.durTot;
            trajs.splice(targetTIdx, 0, newTraj);
            targetPhrase.reset();
          } else if (endsTogether) {
            targetT.durTot = targetT.durTot - newTraj.durTot;
            trajs.splice(targetTIdx + 1, 0, newTraj);
            targetPhrase.reset();
          } else {
            const firstDur = newTrajStart - targetPhrase.startTime! - targetT.startTime!;
            const lastDur = targetT.durTot - firstDur - newTraj.durTot;
            targetT.durTot = firstDur;
            const lstObj: {
              id: number,
              durTot: number,
              pitches: Pitch[],
              fundID12: number,
              instrument?: string
            } = {
              id: 12,
              durTot: lastDur,
              pitches: [],
              fundID12: props.piece.raga.fundamental
            };
            lstObj.instrument = props.piece.instrumentation[track];
            const lastTraj = new Trajectory(lstObj);
            trajs.splice(targetTIdx + 1, 0, newTraj, lastTraj);
            targetPhrase.reset();
          }
          pastedTrajs.push(newTraj);
        })
        groupedIdxs.forEach(g => {
          const trajsToBeGrouped = pastedTrajs.filter((_, idx) => {
            return g.idxs.includes(idx);
          });
          const phrase = props.piece.phraseGrid[track][startPIdx];
          const group = new Group({ trajectories: trajsToBeGrouped });
          phrase.getGroups().push(group);
        });
        resetTrajRenderStatus(pastedTrajs.map(t => t.uniqueId!), false);
        pastedTrajs.forEach(traj => {
          renderTraj(traj);
        });
      }


    }

    const mutateTraj = (newIdx: number) => {
      if (selectedTraj.value === undefined) {
        throw new Error('No selected trajectory');
      };
      const trajObj = selectedTraj.value.toJSON();
      trajObj.id = newIdx;
      const newTraj = new Trajectory(trajObj);
      const pIdx = selectedTraj.value.phraseIdx!;
      const track = props.piece.trackFromTraj(selectedTraj.value);
      const phrase = props.piece.phraseGrid[track][pIdx];
      const tIdx = selectedTraj.value.num!;
      phrase.trajectories[tIdx] = newTraj;
      phrase.assignStartTimes();
      phrase.assignPhraseIdx();
      phrase.assignTrajNums();
      removeTraj(selectedTraj.value);
      renderTraj(newTraj);
      refreshSargam(newTraj.uniqueId!);
      const inst = props.piece.instrumentation[track] as Instrument;
      if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
        refreshVowel(newTraj.uniqueId!);
        refreshEndingConsonant(newTraj.uniqueId!);
      }
      emit('unsavedChanges', true);
    };

    onMounted(() => {
      if (tranSvg.value) {
        setUpSvg();
        resetTranscription();
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('keyup', handleKeyup);
      };

    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    });

    return { 
      dynamicStyle,
      tranContainer,
      tranSvg,
      trajRenderStatus,
      trajStartTimes,
      trajEndTimes,
      chunkDur,
      resetTranscription,
      emptyOverlay,
      emptyDivs,
      emptyDivIdxMap,
      selectedTrajs,
      selectedTraj,
      editorMode,
      shifted,
      tracks,
      mutateTraj,
      refreshDragDots,
      refreshVowel,
      refreshEndingConsonant,
      refreshTraj,
      lowOctOffsetRef,
      highOctOffsetRef,
      logMin,
      logMax,
      removePhraseDiv,
      renderPhraseDiv,
      moveToPhraseUid,
      moveToPhrase,
      currentPhrase,
      selectedChikari,
      resetTrajRenderStatus,
      renderTraj,
      clearDragDots,
      refreshSargam,
      selectTraj,
      // playheadStyle,
      targetPlayheadX,
      refreshTimePts,
      trajTimePts,
      metad,
      clipboardTrajs,
      selectedMeter,
      renderMeter,
      clearInsertPulses,
      contextMenuX,
      contextMenuY,
      contextMenuClosed,
      contextMenuChoices,
      selectedPhraseDivUid,
      setUpRegion,
      regionStartPxl,
      regionEndPxl,
      regionStartX,
      regionEndX,
      playhead,
      // playheadStyle,
      autoWindowOpen,
      autoTrajs,
      autoWindowX,
      autoWindowY,
      autoWindowWidth,
      isBlock,
      curPlayheadPxl,
      refreshSargamLines,
      alted,
      renderConsonantSymbols,
      goToTimeModal,
      goToHours,
      goToMinutes,
      goToTime,
      controlled,
      startPlayingTransition,
      stopPlayingTransition,
      trajAnnotatorX,
      trajAnnotatorY,
      trajAnnotatorWidth,
      trajAnnotatorHeight,
      trajAnnotatorOpen,
      annotatingTraj,
    }
  }
})
</script>

<style scopred>
.tranContainer {
  position: relative;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  width: var(--width);
  height: var(--height);
}

.emptyOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  width: var(--width);
  height: var(--height);
  display: flex;
  flex-direction: row;
}

.playhead {
  will-change: transform;
}

.time-entry-modal {
  position: fixed;
  top: 25%;
  left: 25%;
  transform: translate(-50%, -50%);
  background-color: lightgray;
  border-radius: 5px;
  border: 1px solid black;
  width: 150px;
  height: 70px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.time-entry-modal > * {
  margin: 5px;
}

.time-entry-modal input {
  width: 25px;
}

.timeModalOuter {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background-color: rgba(0, 0, 0, 0.5); */
  z-index: 100;
}

</style>
