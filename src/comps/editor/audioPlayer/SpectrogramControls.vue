<template>
  <div 
    class='outerSpecSettings' 
    :style='dynamicStyle'
    ref='outerSpecSettings'
    >
    <div class='col'>
      <div class='titleBox'>
        <label>Spectrogram</label>
      </div>
      <div class='rowBox'>
        <label>Colormap</label>
        <SwatchSelect 
          :initCMap='initCMap'
          v-model='cMapName'
        />
        <button @click='updateColorMap'>Update</button>
      </div>
      <div class='rowBox'>
        <label>Intensity Power</label>
        <input 
          type='number' v-model='intensityPower'
          min='1' max='5' step=0.1 
          />
          <button @click='updateIntensity'>Update</button>
      </div>
        
    </div>
    <div class='col'>
      <div class='titleBox'>
        <label>"Sa" Frequency</label>
      </div>
      <div class='rowBox'>
        <div class='row'>
          <input 
          type='number' 
          v-model='saFreqDisplay'
          min='100' 
          max='400' 
          step='1' 
          @change='handleSaFreqChange'
          />
          <input 
            type='range' 
            v-model='logSaFreq' 
            :min='Math.log2(100)' 
            :max='Math.log2(400)' 
            step=0.001
            @input='handleLogSaFreqChange'
          />
        </div>
        <div class='row'>
          <label class='gain'>Gain</label>
          <input
            type='range'
            v-model='saGain'
            min='0'
            max='1'
            step='0.001'
          />
        </div>
        <div class='row'>
          <button @click='updateSaFreq'>Update</button>
        </div>
      </div>
      <div class='rowBox'>
        <div class='row'>
          <label>Max Pitch</label>
          <select v-model='maxPitchIdx'>
            <option v-for='(pitch, idx) in maxPitchOptions' :value='idx'>
              {{  pitch.octavedSargamLetter }}
            </option>
          </select>
        </div>
        <div class='row'>
          <label>Min Pitch</label>
          <select v-model='minPitchIdx'>
            <option v-for='(pitch, idx) in minPitchOptions' :value='idx'>
              {{  pitch.octavedSargamLetter }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class='col colors'>
      <div class='titleBox'>
        <label>Colors</label>
      </div>
      <div class='rowBox tall'>
        <div class='row'>
          <label>Background</label>
          <input type='color' v-model='bgColor'/>
        </div>
        <div class='row'>
          <label>Axes</label>
          <input type='color' v-model='axColor'/>
        </div>
        <div class='row'>
          <label>Melograph</label>
          <input type='color' v-model='melColor'/>
        </div>
        <div class='row'>
          <label>Sargam Lines</label>
          <input type='color' v-model='sLineColor'/>
        </div>
        <div class='row'>
          <label>Meter</label>
          <input type='color' v-model='metColor'/>
        </div>
        <div class='row'>
          <label>Selected Meter</label>
          <input type='color' v-model='selMetColor'/>
        </div>
        <div class='row'>
          <label>Playhead</label>
          <input type='color' v-model='selPlayheadColor'/>
        </div>
      </div>
    </div>

    <div class='col visibility'>
      <div class='titleBox'>
        <label>Visibility</label>
      </div>
      <div class='rowBox tall'>
        <div class='row' v-if='hasRecording'>
          <label for='spectrogramToggle'>Spectrogram</label>
          <input 
            id='spectrogramToggle' 
            type='checkbox'
            v-model='spectrogramToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row' v-if='hasRecording'>
          <label for='melographToggle'>Melograph</label>
          <input 
            id='melographToggle' 
            type='checkbox'
            v-model='melographToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='sargamToggle'>Pitch Labels</label>
          <input 
            id='sargamToggle' 
            type='checkbox'
            v-model='sargamToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='sargamLinesToggle'>Sargam Lines</label>
          <input 
            id='sargamLinesToggle' 
            type='checkbox'
            v-model='sargamLinesToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row' v-if='hasSitar'>
          <label for='bolsToggle'>Bols</label>
          <input 
            id='bolsToggle' 
            type='checkbox'
            v-model='bolsToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='transcriptionToggle'>Transcription</label>
          <input
            id='transcriptionToggle'
            type='checkbox'
            v-model='transcriptionToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='meterToggle'>Meter</label>
          <input 
            id='meterToggle' 
            type='checkbox'
            v-model='meterToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row' v-if='hasVocal'>
          <label for='phonemesToggle'>Phonemes</label>
          <input 
            id='phonemesToggle' 
            type='checkbox'
            v-model='phonemesToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='phraseDivsToggle'>Phrase Divs</label>
          <input 
            id='phraseDivsToggle' 
            type='checkbox'
            v-model='phraseDivsToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
        <div class='row'>
          <label for='phraseLabels'>Phrase Labels</label>
          <input 
            id='phraseLabels' 
            type='checkbox'
            v-model='phraseLabelsToggleProxy'
            @click='preventSpaceToggle'
          />
        </div>
      </div>
    </div>


    <div class='col'>
      <div class='titleBox'>
        <label>Tracks</label>
      </div>
      <div class='scrollableContainer'>
        <div class='rowBox' v-for='(track, idx) in instTracks'>
          <label class='bold'>{{ track.inst }}</label>
          <div class='row tracks'>
            <label :for='`displayToggle${idx}`'>Display</label>
            <input 
              :id='`displayToggle${idx}`'
              type='checkbox' v-model='tempTracks[track.idx].displaying'
            />
            <label>Traj</label>
            <input type='color' v-model='tempTracks[track.idx].color'/>
          </div>
          <div class='row tracks'>
            <label :for='`instSonifyToggle${idx}`'>Sonify</label>
            <input 
              :id='`instSonifyToggle${idx}`'
              type='checkbox' v-model='tempTracks[track.idx].sounding'
              />
            <label>Sel Traj</label>
            <input type='color' v-model='tempTracks[track.idx].selColor'/>
          </div>
        </div>
      </div>
    </div>
    <div class='col'>
      <div class='titleBox'>
        <label>Playback Animation</label>
      </div>
      <div class='rowBox'>
        <label>Playhead</label>
        <div class='row'>
          <select v-model='playheadAnimationProxy'>
            <option 
              v-for='animation in playheadAnimations' 
              :value='animation'
              >
              {{ animation }}
            </option>
          </select>
        </div>
      </div>
      <div class='rowBox'>
        <div class='row'>
          <label for='highlightTrajsToggle'>Highlight Trajs</label>
          <input id='highlightTrajsToggle' type='checkbox' v-model='highlightTrajsProxy'/>
        </div>
      </div>
    </div>
    <div class='col'>
      <div class='titleBox'>
        <label>Scale System</label>
      </div>
      <div class='rowBox'>
        <div class='row'>
          <select v-model='scaleSystemProxy'>
            <option v-for='system in possibleScaleSystems' :value='system'>
              {{ system }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class='col'>
      <div class='titleBox'>
        <label>Display Settings</label>
      </div>
      <div class='rowBox'>
        <label>Saved Settings</label>
        <div class='row'>
          <select 
            v-model='selectedSetting' 
            class='wide' 
            @change='loadSetting'
            >
            <option v-for='setting in savedSettings' :value='setting'>
              {{ setting.title }}
            </option>
          </select>
        </div>
        <div class='row'>
          <button 
            @click='deleteSetting'
            :disabled='selectedSetting.uniqueId === "ffa38001-f592-4778-a91e-c4ef5c99b081"'
            >
            Delete
          </button>
          <button 
            @click='setAsDefaultSetting'
            >Set Default</button>
        </div>
      </div>
      <div class='rowBox'>
        <label>Save Current Settings</label>
        <input 
          type='text' 
          v-model='displaySettingsTitle' 
          placeholder='Enter settings title here'
          @keydown.space.stop
          />
          <div class='row'>
          <button 
            @click='updateDisplaySetting'
            :disabled='settingMatchesSaved || selectedSetting.title === "Default"'>
            Update Current
          </button>
          <button 
            @click='saveSettings' 
            :disabled='
              displaySettingsTitle === "Default" || 
              settingMatchesSaved ||
              savedSettingsTitles.includes(displaySettingsTitle)'
              >
            New Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { 
  isEqual
} from 'lodash';
import { 
  defineComponent, 
  ref,
  PropType,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue';
import { getWorker, resetWorker } from '@/ts/workers/workerManager.ts'
import { 
  CMap, 
  InstrumentTrackType, 
  DisplaySettings,
  ExcerptRange,
  ProcessMessage
} from '@shared/types';
import { PlayheadAnimations, ScaleSystem } from '@shared/enums';
import SwatchSelect from '@/comps/SwatchSelect.vue';
import {
  Pitch, 
  Raga
} from '@/js/classes.ts';
import { 
  getSavedSettings, 
  saveDisplaySettings,
  getDefaultSettings,
  setDefaultSettings,
  updateSavedDisplaySettings,
  deleteSavedDisplaySettings
} from '@/js/serverCalls.ts'
import { useStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
export default defineComponent({
  name: 'SpectrogramControls',
  components: {
    SwatchSelect
  },
  props: {
    height: {
      type: Number,
      required: true
    },
    playerHeight: {
      type: Number,
      required: true
    },
    audioID: {
      type: String,
      required: false
    },
    saFreq: {
      type: Number,
      required: true
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
    extLowOctOffset: {
      type: Number,
      required: true
    },
    extHighOctOffset: {
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
    ac: {
      type: AudioContext,
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
    raga: {
      type: Object as PropType<Raga>,
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
    playheadColor: {
      type: String,
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
    hasRecording: {
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
    durTot: {
      type: Number,
      required: true
    },
    showPhraseLabels: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'update:backgroundColor',
    'update:axisColor',
    'update:melographColor',
    'update:sargamLineColor',
    'update:extLowOctOffset',
    'update:extHighOctOffset',
    'update:instTracks',
    'update:meterColor',
    'update:selectedMeterColor',
    'update:playheadColor',
    'update:saFreq',
    'update:maxPitch',
    'update:minPitch',
    'update:playheadAnimation',
    'update:highlightTrajs',
    'update:zoomFactors',
    'update:scaleSystem',
    'update:showSpectrogram',
    'update:showMelograph',
    'update:showSargam',
    'update:showSargamLines',
    'update:showBols',
    'update:showTranscription',
    'update:showMeter',
    'update:showPhonemes',
    'update:showPhraseDivs',
    'update:showPhraseLabels'
  ],
  setup(props, { emit }) {

    const defaultSetting = {
      "title": "Default",
      "colors": {
          "background": "#f0f8ff",
          "axes": "#c4b18b",
          "melograph": "#006400",
          "sargamLines": "#808080",
          "meter": "#0D3D0E",
          "selectedMeter": "#3dcc63",
          "playhead": "#808080"
      },
      "instruments": [
          {
              "display": true,
              "sonify": true,
              "trajColor": "#204580",
              "selectedTrajColor": "#4089ff"
          }
      ],
      "spectrogram": {
          "colorMap": "interpolateViridis",
          "intensity": 1
      },
      "pitchRange": {
          "max": {
              "swara": 0,
              "raised": true,
              "oct": 2
          },
          "min": {
              "swara": 0,
              "raised": true,
              "oct": -1
          }
      },
      "playheadAnimationStyle": PlayheadAnimations.Animated,
      "highlightTrajs": true,
      "uniqueId": "ffa38001-f592-4778-a91e-c4ef5c99b081",
      "scaleSystem": ScaleSystem.Sargam,
    } as DisplaySettings;

    const intensityPower = ref(1);
    const lowOctOffset = ref(props.extLowOctOffset);
    const highOctOffset = ref(props.extHighOctOffset);
    const cMapName = ref<CMap>(CMap.Viridis);
    const cMapEnum = ref(CMap);
    const swatches = ref<SVGSVGElement[]>([]);
    const initCMap = ref<CMap>(CMap.Viridis);
    const saFreq = ref(props.saFreq);
    const logSaFreq = ref(Math.log2(props.saFreq));
    const saGain = ref(0);
    const bgColor = ref(props.backgroundColor);
    const axColor = ref(props.axisColor);
    const melColor = ref(props.melographColor);
    const sLineColor = ref(props.sargamLineColor);
    const gainNode = ref<GainNode | undefined>(undefined);
    const oscNode = ref<OscillatorNode | undefined>(undefined);
    const maxPitchObj = ref(props.maxPitch);
    const minPitchObj = ref(props.minPitch);
    const tempTracks = ref(props.instTracks);
    const metColor = ref(props.meterColor);
    const selMetColor = ref(props.selectedMeterColor);
    const selPlayheadColor = ref(props.playheadColor);
    const displaySettingsTitle = ref('');
    const savedSettings = ref<DisplaySettings[]>([]);
    const selectedSetting = ref<DisplaySettings>(defaultSetting);
    const possibleScaleSystems = Object.values(ScaleSystem);

    const playheadAnimations = Object.values(PlayheadAnimations);
    const store = useStore();

    const playheadAnimationProxy = computed({
      get() {
        return props.playheadAnimation;
      },
      set(val) {
        emit('update:playheadAnimation', val);
      }
    });
    const highlightTrajsProxy = computed({
      get() {
        return props.highlightTrajs;
      },
      set(val) {
        emit('update:highlightTrajs', val);
      }
    });
    const scaleSystemProxy = computed({
      get() {
        return props.scaleSystem;
      },
      set(val) {
        emit('update:scaleSystem', val);
      }
    })
    const spectrogramToggleProxy = computed({
      get() {
        return props.showSpectrogram;
      },
      set(val) {
        emit('update:showSpectrogram', val);
      }
    })
    const melographToggleProxy = computed({
      get() {
        return props.showMelograph;
      },
      set(val) {
        emit('update:showMelograph', val);
      }
    })
    const sargamToggleProxy = computed({
      get() {
        return props.showSargam;
      },
      set(val) {
        emit('update:showSargam', val);
      }
    })
    const sargamLinesToggleProxy = computed({
      get() {
        return props.showSargamLines;
      },
      set(val) {
        emit('update:showSargamLines', val);
      }
    })
    const bolsToggleProxy = computed({
      get() {
        return props.showBols;
      },
      set(val) {
        emit('update:showBols', val);
      }
    })
    const transcriptionToggleProxy = computed({
      get() {
        return props.showTranscription;
      },
      set(val) {
        emit('update:showTranscription', val);
      }
    })
    const meterToggleProxy = computed({
      get() {
        return props.showMeter;
      },
      set(val) {
        emit('update:showMeter', val);
      }
    })
    const phonemesToggleProxy = computed({
      get() {
        return props.showPhonemes;
      },
      set(val) {
        emit('update:showPhonemes', val);
      }
    })
    const phraseDivsToggleProxy = computed({
      get() {
        return props.showPhraseDivs;
      },
      set(val) {
        emit('update:showPhraseDivs', val);
      }
    })
    const phraseLabelsToggleProxy = computed({
      get() {
        return props.showPhraseLabels;
      },
      set(val) {
        emit('update:showPhraseLabels', val);
      }
    })



    

    const pitchIsEqual = (p1: Pitch, p2: Pitch) => {
      const swara = p1.swara === p2.swara;
      const oct = p1.oct === p2.oct;
      const raised = p1.raised === p2.raised;
      return swara && oct && raised;
    }

    const maxPitchIdx = computed({
      get() {
        return maxPitchOptions.value.findIndex(pitch => {
          return pitchIsEqual(pitch, maxPitchObj.value);
        })
      },
      set(idx) {
        maxPitchObj.value = new Pitch(maxPitchOptions.value[idx]);
        maxPitchObj.value.fundamental = saFreq.value;
        emit('update:maxPitch', maxPitchObj.value);
        if (spectrogramWorker !== undefined) {
          nextTick(() => {
            const processOptions = {
              type: 'crop',
              logMin: logSaFreq.value - lowOctOffset.value,
              logMax: logSaFreq.value + highOctOffset.value,
              newVerbose: true,
            };
            spectrogramWorker!.postMessage({
              msg: 'process',
              payload: processOptions
            })
          })
        };
      }
    })
    const maxPitchOptions = computed(() => {
      const pitches = props.raga.getPitches({
        low: saFreq.value,
        high: 2400 // in the spec data generation, this is the max freq
      }).reverse();
      return pitches;
    })
    const minPitchIdx = computed({
      get() {
        return minPitchOptions.value.findIndex(pitch => {
          return pitchIsEqual(pitch, minPitchObj.value);
        })
      },
      set(idx) {
        minPitchObj.value = new Pitch(minPitchOptions.value[idx]);
        minPitchObj.value.fundamental = saFreq.value;
        emit('update:minPitch', minPitchObj.value);
        if (spectrogramWorker !== undefined) {
          nextTick(() => {
            const processOptions = {
              type: 'crop',
              logMin: logSaFreq.value - lowOctOffset.value,
              logMax: logSaFreq.value + highOctOffset.value
            };
            spectrogramWorker!.postMessage({
              msg: 'process',
              payload: processOptions
            })
          })
        }
      }
    })
    const minPitchOptions = computed(() => {
      const pitches = props.raga.getPitches({
        low: 40, // in the spec data generation, this is the min freq
        high: saFreq.value
      }).reverse();
      return pitches;
    })
    const saFreqDisplay = computed({
      get: () => saFreq.value.toFixed(0),
      set: (newVal) => {
        saFreq.value = parseFloat(newVal);
      }
    })
    const dynamicStyle = computed(() => ({
      '--height': `${props.height}px`,
      '--playerHeight': `${props.playerHeight}px`
    }))
    const savedSettingsTitles = computed(() => {
      return savedSettings.value.map(setting => setting.title);
    })
    const settingMatchesSaved = computed(() => {
      let out = true;
      const dp = getDisplaySettings(selectedSetting.value.uniqueId);
      const keys = Object.keys(dp) as (keyof DisplaySettings)[];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!isEqual(dp[key], selectedSetting.value[key])) {
          out = false;
          break;
        }
      }
      return out;
    })


    watch(bgColor, newVal => {
      emit('update:backgroundColor', newVal);
    });
    watch(axColor, newVal => {
      emit('update:axisColor', newVal);
    });
    watch(melColor, newVal => {
      emit('update:melographColor', newVal);
    });
    watch(sLineColor, newVal => {
      emit('update:sargamLineColor', newVal);
    });
    watch(() => props.extHighOctOffset, newVal => {
      highOctOffset.value = newVal;
    });
    watch(() => props.extLowOctOffset, newVal => {
      lowOctOffset.value = newVal;
    });
    watch(tempTracks, newVal => {
      emit('update:instTracks', newVal);
    }, { deep: true });
    watch(() => props.editingInstIdx, newVal => {
      props.instTracks[newVal].displaying = true;
    });
    watch(metColor, newVal => {
      emit('update:meterColor', newVal);
    });
    watch(selMetColor, newVal => {
      emit('update:selectedMeterColor', newVal);
    });
    watch(selPlayheadColor, newVal => {
      emit('update:playheadColor', newVal);
    });
        // watch for changes in saGain, update gain node
    watch(saGain, newVal => {
      if (gainNode.value) {
        const curVal = gainNode.value.gain.value;
        const now = props.ac.currentTime;
        gainNode.value.gain.setValueAtTime(curVal, now);
        gainNode.value.gain.linearRampToValueAtTime(newVal, now + lag);
      }
    });
    watch(saFreq, newVal => {
      if (oscNode.value) {
        const curVal = oscNode.value.frequency.value;
        const now = props.ac.currentTime;
        oscNode.value.frequency.setValueAtTime(curVal, now);
        oscNode.value.frequency.exponentialRampToValueAtTime(newVal, now + lag);
      }
    });
    watch(cMapName, newVal => {
      initCMap.value = newVal;
    })

    

    let spectrogramWorker: Worker | undefined = undefined;
    if (props.audioID !== undefined && props.saFreq !== undefined) {
      spectrogramWorker = getWorker();
    }
    const sendInitWorkerMsg = () => {
      const logSa = Math.log2(props.saFreq);
      const low = logSa - lowOctOffset.value;
      const high = logSa + highOctOffset.value;
      const processOptions: ProcessMessage = {
        type: 'initial',
        logMin: low,
        logMax: high,
        newScaledShape: [props.scaledHeight, props.scaledWidth],
        audioID: props.audioID,
        newVerbose: false,
        newPower: intensityPower.value,
        newCMap: cMapName.value
      }
      if (props.excerptRange !== undefined) {
        const normedStart = props.excerptRange.start / props.durTot;
        const normedEnd = props.excerptRange.end / props.durTot;
        processOptions.normedStart = normedStart;
        processOptions.normedEnd = normedEnd;
      }
      if (spectrogramWorker === undefined) return;
      spectrogramWorker.postMessage({
        msg: 'process',
        payload: processOptions
      })
    }

    const updateColorMap = () => {
      if (spectrogramWorker === undefined) return;
      const processOptions = {
        type: 'color',
        newCMap: cMapName.value,
      }
      spectrogramWorker.postMessage({
        msg: 'process',
        payload: processOptions
      })
    }

    const updateIntensity = () => {
      if (spectrogramWorker === undefined) return;
      const processOptions = {
        type: 'power',
        newPower: intensityPower.value
      }
      spectrogramWorker.postMessage({
        msg: 'process',
        payload: processOptions
      })
    };

    const updateIntensityAndColorMap = () => {
      if (spectrogramWorker === undefined) return;
      const processOptions = {
        type: 'powerAndColor',
        newPower: intensityPower.value,
        newCMap: cMapName.value
      }
      spectrogramWorker.postMessage({
        msg: 'process',
        payload: processOptions
      })
    }

    const updateSaFreq = () => {
      logSaFreq.value = Math.log2(saFreq.value);
      emit('update:saFreq', saFreq.value);
      if (spectrogramWorker === undefined) return;
      nextTick(() => {
        const processOptions = {
          type: 'crop',
          logMin: logSaFreq.value - lowOctOffset.value,
          logMax: logSaFreq.value + highOctOffset.value
        };
        spectrogramWorker.postMessage({
          msg: 'process',
          payload: processOptions
        })
      })
    };

    const deleteSetting = async () => {
      try {
        const res = await deleteSavedDisplaySettings(store.state.userID, selectedSetting.value.uniqueId);
        console.log(res);
        await resyncToServerSettings();
        selectedSetting.value = defaultSetting;
        loadSetting();
      } catch (e) {
        console.error(e);
      }
    }

    const handleLogSaFreqChange = () => {
      saFreq.value = Math.pow(2, logSaFreq.value);
    }

    const handleSaFreqChange = () => {
      logSaFreq.value = Math.log2(saFreq.value);
    }

    const lag = 0.01;

    const getDisplaySettings = (id?: string): DisplaySettings => {
      // this gets settings as currently set on the controls of this component
      // and displaying to the transcriptionLayer. 
      const colors = {
        background: props.backgroundColor,
        axes: props.axisColor,
        melograph: props.melographColor,
        sargamLines: props.sargamLineColor,
        meter: props.meterColor,
        selectedMeter: props.selectedMeterColor,
        playhead: props.playheadColor
      };
      const instruments = props.instTracks.map(track => {
        return {
          display: track.displaying,
          sonify: track.sounding,
          trajColor: track.color,
          selectedTrajColor: track.selColor
        }
      });
      const spectrogram = {
        colorMap: cMapName.value,
        intensity: intensityPower.value,  
      };
      const pitchRange = {
        max: {
          swara: maxPitchObj.value.swara as number,
          raised: maxPitchObj.value.raised,
          oct: maxPitchObj.value.oct
        },
        min: {
          swara: minPitchObj.value.swara as number,
          raised: minPitchObj.value.raised,
          oct: minPitchObj.value.oct
        }
      };
      const visibility = {
        spectrogram: spectrogramToggleProxy.value,
        melograph: melographToggleProxy.value,
        sargam: sargamToggleProxy.value,
        sargamLines: sargamLinesToggleProxy.value,
        bols: bolsToggleProxy.value,
        transcription: transcriptionToggleProxy.value,
        meter: meterToggleProxy.value,
        phonemes: phonemesToggleProxy.value,
        phraseDivs: phraseDivsToggleProxy.value
      }
      const uId = id ? id : uuidv4();
      return {
        title: displaySettingsTitle.value,
        colors,
        instruments,
        spectrogram,
        pitchRange,
        uniqueId: uId, 
        playheadAnimationStyle: playheadAnimationProxy.value,
        highlightTrajs: highlightTrajsProxy.value,
        zoomXFactor: props.zoomXFactor,
        zoomYFactor: props.zoomYFactor,
        scaleSystem: scaleSystemProxy.value,
        visibility
      }
    };
    const resyncToServerSettings = async (selectedId?: string) => {
      const userID = store.state.userID;
      savedSettings.value = await getSavedSettings(userID);
      savedSettings.value.unshift(defaultSetting);
      const defaultID = await getDefaultSettings(userID);
      selectedSetting.value = savedSettings.value.find(setting => {
        return setting.uniqueId === (selectedId ? selectedId : defaultID)
      }) || defaultSetting
        // loadSetting();
    
    }

    const saveSettings = async () => {
      const newSettings = getDisplaySettings();
      try {
        await saveDisplaySettings(store.state.userID, newSettings);
        await resyncToServerSettings(selectedSetting.value.uniqueId);
        selectedSetting.value = newSettings;

      } catch (e) {
        console.error(e);
      }
    }

    const loadSetting = () => {
      const s = selectedSetting.value;
      bgColor.value = s.colors.background;
      axColor.value = s.colors.axes;
      melColor.value = s.colors.melograph;
      sLineColor.value = s.colors.sargamLines;
      metColor.value = s.colors.meter;
      selMetColor.value = s.colors.selectedMeter;
      selPlayheadColor.value = s.colors.playhead;
      for (let i = 0; i < tempTracks.value.length; i++) {
        if (s.instruments[i]) {
          tempTracks.value[i].displaying = s.instruments[i].display;
          tempTracks.value[i].sounding = s.instruments[i].sonify;
          tempTracks.value[i].color = s.instruments[i].trajColor;
          tempTracks.value[i].selColor = s.instruments[i].selectedTrajColor;
        }
      };
      cMapName.value = s.spectrogram.colorMap;
      intensityPower.value = s.spectrogram.intensity;
      maxPitchObj.value = new Pitch(s.pitchRange.max);
      minPitchObj.value = new Pitch(s.pitchRange.min);
      displaySettingsTitle.value = s.title;
      if (s.playheadAnimationStyle !== undefined) {
        playheadAnimationProxy.value = s.playheadAnimationStyle;
      }
      if (s.highlightTrajs !== undefined) {
        highlightTrajsProxy.value = s.highlightTrajs;
      }
      if (s.zoomXFactor !== undefined && s.zoomYFactor !== undefined) {
        emit('update:zoomFactors', {x: s.zoomXFactor, y: s.zoomYFactor});
      }
      if (s.scaleSystem !== undefined) {
        scaleSystemProxy.value = s.scaleSystem;
      }
      if (s.visibility !== undefined) {
        spectrogramToggleProxy.value = s.visibility.spectrogram;
        melographToggleProxy.value = s.visibility.melograph;
        sargamToggleProxy.value = s.visibility.sargam;
        sargamLinesToggleProxy.value = s.visibility.sargamLines;
        bolsToggleProxy.value = s.visibility.bols;
        transcriptionToggleProxy.value = s.visibility.transcription;
        meterToggleProxy.value = s.visibility.meter;
        phonemesToggleProxy.value = s.visibility.phonemes;
        phraseDivsToggleProxy.value = s.visibility.phraseDivs;
      }
      updateIntensityAndColorMap();

    };

    const setAsDefaultSetting = () => {
      setDefaultSettings(store.state.userID, selectedSetting.value.uniqueId);
      
    }

    const updateDisplaySetting = async () => {
      const uid = selectedSetting.value.uniqueId;
      const newSettings = getDisplaySettings(uid);
      try {
        // selectedSetting.value = newSettings;
        await updateSavedDisplaySettings(store.state.userID, uid, newSettings);
        await resyncToServerSettings(selectedSetting.value.uniqueId);

      } catch (e) {
        console.error(e);
      }
    }

    const preventSpaceToggle = (e: MouseEvent) => {
      if (e && e.clientX === 0) e.preventDefault();
    }



    onMounted( async () => {
      gainNode.value = props.ac.createGain();
      gainNode.value.gain.value = saGain.value;
      gainNode.value.connect(props.ac.destination);
      oscNode.value = props.ac.createOscillator();
      oscNode.value.frequency.value = saFreq.value;
      oscNode.value.connect(gainNode.value);
      oscNode.value.start();
      try {
        const userID = store.state.userID;
        savedSettings.value = await getSavedSettings(userID);
        savedSettings.value.unshift(defaultSetting);
        // selectedSetting.value = savedSettings.value[0];
        const defaultID = await getDefaultSettings(userID);
        selectedSetting.value = savedSettings.value.find(setting => {
          return setting.uniqueId === defaultID
        }) || defaultSetting;
        loadSetting();
        await nextTick();
        sendInitWorkerMsg();
      } catch (e) {
        console.error(e);
      }
    })
    onUnmounted(() => {
      resetWorker()
    })
    
    
    return {
      intensityPower,
      lowOctOffset,
      highOctOffset,
      cMapName,
      dynamicStyle,
      cMapEnum,
      swatches,
      initCMap,
      updateColorMap,
      updateIntensity,
      updateSaFreq,
      saFreq,
      logSaFreq,
      handleLogSaFreqChange,
      handleSaFreqChange,
      saFreqDisplay,
      saGain,
      bgColor,
      axColor,
      melColor,
      sLineColor,
      maxPitchOptions,
      maxPitchObj,
      maxPitchIdx,
      minPitchOptions,
      minPitchObj,
      minPitchIdx,
      tempTracks,
      metColor,
      selMetColor,
      selPlayheadColor,
      savedSettings,
      getDisplaySettings,
      savedSettingsTitles,
      displaySettingsTitle,
      selectedSetting,
      saveSettings,
      loadSetting,
      setAsDefaultSetting,
      updateDisplaySetting,
      settingMatchesSaved,
      deleteSetting,
      playheadAnimations,
      playheadAnimationProxy,
      highlightTrajsProxy,
      possibleScaleSystems,
      scaleSystemProxy,
      preventSpaceToggle,
      spectrogramToggleProxy,
      melographToggleProxy,
      sargamToggleProxy,
      sargamLinesToggleProxy,
      bolsToggleProxy,
      transcriptionToggleProxy,
      meterToggleProxy,
      phonemesToggleProxy,
      phraseDivsToggleProxy,
      phraseLabelsToggleProxy,
    }
  }
})

</script>

<style scoped>

.outerSpecSettings {
  background-color: #202621;
  height: var(--height);
  position: absolute;
  right: 0px;
  bottom: var(--playerHeight);
  color: white;
  z-index: -1;
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: top;
  overflow-x: auto;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0px;
  width: 210px;
  min-width: 190px;
  border-right: 1px solid white;
}

.col > select {
  width: 100px;
}

.col > input {
  width: 40px;
}

.col.colors > * > .row {
  height: 25px;
  min-height: 25px;
  max-height: 25px;
}


.rowBox {
  width: 100%;
  max-height: 80px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
  border-top: 1px solid white;
}

.rowBox.tall {
  max-height: 160px;
  min-height: 160px;
  overflow-y: scroll;
  overflow-x: hidden;

}


.titleBox {
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  min-height: 20px;
  max-height: 20px;
  box-sizing: border-box;
}

.row > input[type='range'] {
  width: 90px;
  box-sizing: border-box;
}

.row > input[type='number'] {
  width: 45px;
  box-sizing: border-box;
}

.row > label {
  width: 110px;
  box-sizing: border-box;
  text-align: right;
}
.row > label.gain {
  width: 45px;
}

.row > input[type='color'] {
  width: 45px;
  height: 20px;
  box-sizing: border-box;
}
.row > select.wide {
  width: 120px
}

select {
  font-family: Arial, sans-serif;
}

.bold {
  font-weight: bold;
}

.tracks > label {
  width: 60px;
  margin-right: 5px;
}

.scrollableContainer {
  width: 100%;
  max-height: 160px;
  min-height: 160px;
  overflow-y: scroll;
  overflow-x: hidden;
}

.visibility .row {
  min-height: 22px;
  justify-content: center;
}

.visibility .row > input {
  margin-left: 10px;
}
</style>
