<template>
  <div class='main_'>
    <div class='analysisControls'>
      <div class='analysisTypeRow'>
        <div 
          :class='`analysisType ${atIdx === selectedATIdx ? "selected" : ""}`' 
          v-for='(at, atIdx) in analysisTypes'
          :key='at'
          @click='handleClickAnalysisType(atIdx)'
          >
          {{ at }}
        </div>
        <ModeSelector
        v-if='piece'
          class='modeSelector'
          :height='typeRowHeight'
          :selectedMode='instIdx'
          :enum='instTracksEnum'
          :noneEnumItem='-1'
          :tooltipTexts='instTrackTexts'
          @update:selectedMode='instIdx = $event'
          @showTooltip='showTooltip($event)'
          @hideTooltip='hideTooltip'
        />
      </div>
      <div class='controls' v-if='selectedATIdx === 0'>
        <div class='scrollingCBHolder' :style="{
          '--cbWidth': controlBoxWidth + 'px',
        }">
          <div class='controlBox'>
            <div v-for='prType in pitchRepresentationTypes' :key='prType'>
              <input 
                type='radio' 
                :id='prType' 
                :value='prType' 
                v-model='pitchRepresentation'
                >
                <label :for='prType'>{{ prType }}</label>
            </div>
            <div v-if='pitchRepresentation === "Pitch Onsets"'>
              <label for='fadeTime'>Fade Time (s)</label>
              <input type='number' id='fadeTime' v-model.number='fadeTime'>
            </div>
          </div>
          <div class='controlBox'>
            <div v-for='ppType in pitchPrevalenceTypes' :key='ppType'>
              <input 
                type='radio' 
                :id='ppType' 
                :value='ppType' 
                v-model='segmentationType'
                >
              <label :for='ppType'>{{ ppType }}</label>
            </div>
            <div v-if='segmentationType === "Duration"'>
              <input type='number' id='duration' v-model.number='duration'>
              <label for='duration'>(s)</label>
            </div>
          </div>
          <div class='controlBox'>
            <div>
              <input id='pitchChromaToggle' type='checkbox' v-model='pitchChroma'/>
              <label for='pitchChromaToggle'>Pitch Chroma</label>
            </div>
            <div>
              <input id='condensedToggle' type='checkbox' v-model='condensed'/>
              <label for='condensedToggle'>Condensed</label>
            </div>
            <div>
              <input id='heatmapToggle' type='checkbox' v-model='heatmap'/>
              <label for='heatmapToggle'>Heatmap</label>
            </div>
          </div>
          <div class='controlBox' v-if='segmentationType !== "Duration"'>
            <div class='title'>Section Type</div>
            <div class='scrolling'>
              <div v-for='tl in secTopLevels'>
                <input type='checkbox' v-model='tl.bool' :id='tl.name'>
                <label :for='tl.name'>{{ tl.name }}</label>
              </div>
            </div>
          </div>
          <div class='controlBox' v-if='segmentationType === "Phrase"'>
            <div class='title'>Phrase Type</div>
            <div class='scrolling'>
              <div>
                <input 
                  type='radio' 
                  v-model='diffs.phraseTypeDiff' 
                  value='include' 
                  id='phraseTypeDiffInclude'
                  >
                <label for='phraseTypeDiffInclude'>Include</label>
              </div>
              <div class='spaceBelow'>
                <input 
                  type='radio' 
                  v-model='diffs.phraseTypeDiff' 
                  value='exclude' 
                  id='phraseTypeDiffExclude'
                  >
                <label for='phraseTypeDiffExclude'>Exclude</label>
              </div>
              <div v-for='pt in phraseInfo.phraseTypes'>
                <input type='checkbox' v-model='pt.bool' :id='pt.name'>
                <label :for='pt.name'>{{ pt.name }}</label>
              </div>
            </div>
          </div>
          <div class='controlBox' v-if='segmentationType === "Phrase"'>
            <div class='title'>Elaboration</div>
            <div class='scrolling'>
              <div>
                <input 
                  type='radio' 
                  v-model='diffs.elaborationDiff' 
                  value='include' 
                  id='elaborationDiffInclude'
                  >
                <label for='elaborationDiffInclude'>Include</label>
              </div>
              <div class='spaceBelow'>
                <input 
                  type='radio' 
                  v-model='diffs.elaborationDiff' 
                  value='exclude' 
                  id='elaborationDiffExclude'
                  >
                <label for='elaborationDiffExclude'>Exclude</label>
              </div>
              <div v-for='e in phraseInfo.elaborations'>
                <input type='checkbox' v-model='e.bool' :id='e.name'>
                <label :for='e.name'>{{ e.name }}</label>
              </div>
            </div>
          </div>
          <div class='controlBox' v-if='segmentationType === "Phrase"'>
            <div class='title'>Articulation</div>
            <div class='scrolling'>
              <div>
                <input 
                  type='radio' 
                  v-model='diffs.articulationDiff' 
                  value='include' 
                  id='articulationDiffInclude'
                  >
                <label for='articulationDiffInclude'>Include</label>
              </div>
              <div class='spaceBelow'>
                <input 
                  type='radio' 
                  v-model='diffs.articulationDiff' 
                  value='exclude' 
                  id='articulationDiffExclude'
                  >
                <label for='articulationDiffExclude'>Exclude</label>
              </div>
              <div v-for='va in phraseInfo.vocalArticulations' v-if='vocal'>
                <input type='checkbox' v-model='va.bool' :id='va.name'>
                <label :for='va.name'>{{ va.name }}</label>
              </div>
              <div v-for='ia in phraseInfo.instArticulations' v-else>
                <input type='checkbox' v-model='ia.bool' :id='ia.name'>
                <label :for='ia.name'>{{ ia.name }}</label>
              </div>
            </div>
          </div>
          <div class='controlBox' v-if='segmentationType === "Phrase"'>
            <div class='title'>Incidental</div>
            <div class='scrolling'>
              <div>
                <input 
                  type='radio' 
                  v-model='diffs.incidentalDiff' 
                  value='include' 
                  id='incidentalDiffInclude'
                  >
                <label for='incidentalDiffInclude'>Include</label>
              </div>
              <div class='spaceBelow'>
                <input 
                  type='radio' 
                  v-model='diffs.incidentalDiff' 
                  value='exclude' 
                  id='incidentalDiffExclude'
                  >
                <label for='incidentalDiffExclude'>Exclude</label>
              </div>
              <div v-for='i in phraseInfo.incidentals'>
                <input type='checkbox' v-model='i.bool' :id='i.name'>
                <label :for='i.name'>{{ i.name }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class='controlBox button'>
          <button class='generate' @click='createGraph'>
            Generate Visualization
          </button>
        </div>       
      </div>
      <div class='controls' v-if='selectedATIdx === 1'>
        <div class='controlBox'>
          <div v-for='ppType in patternCountTypes' :key='ppType'>
            <input 
              type='radio' 
              :id='ppType' 
              :value='ppType' 
              v-model='segmentationType'
              >
            <label :for='ppType'>{{ ppType }}</label>
          </div>
          <div v-if='segmentationType === "Duration"'>
            <input type='number' id='duration' v-model.number='duration'>
            <label for='duration'>(s)</label>
          </div>
        </div>
        <div class='controlBox'>
          <div v-for='pType in pitchTypes' :key='pType'>
            <input 
              type='radio' 
              :id='pType' 
              :value='pType' 
              v-model='pitchType'
              >
              <label :for='pType'>{{ pType }}</label>
          </div>
          <div>
            <input 
              id='chromaToggle'
              type='checkbox' 
              v-model='pitchChroma' 
              @change='updateChroma'
              />
            <label for='chromaToggle'>Chroma</label>
          </div>
        </div>
        <div class='controlBox'>
          <div class='rightInputRow'>
            <label for='targetToggle'>Target</label>
            <input id='targetToggle'type='checkbox' v-model='targetPitchBool'>
            <select 
              v-model='targetPitchIdx' 
              id='targetPitch' 
              v-if='targetPitchBool'
              >
              <option 
                v-for='(tpc, idx) in targetPitchChoices' 
                :key='tpc' 
                :value='idx'
                >
                {{ tpc }}
              </option>
            </select>
            <div id='targetPitch' v-else></div>
          </div>
          <div class='rightInputRow'>
            <label>Fade Time (s)</label>
            <input type='number' v-model.number='fadeTime' id='fadeTime'>
          </div>
        </div>
        <div class='controlBox'>
          <label class='patternSizeLabel'>Pattern Size</label>
          <div class='patternSizeMatrix'>
            <div 
              class='patternSizeColumn'
              v-for='(_, pcIdx) in 3'
              :key='pcIdx'
              >
              <div class='patternSizeRow' v-for='(_, prIdx) in 3' :key='prIdx'>
                <input type='checkbox' 
                  :id='`cb_${pcIdx * 3 + prIdx}`' 
                  :value='patternSizes[pcIdx * 3 + prIdx]'
                  v-model='selectedPatternSizes[pcIdx * 3 + prIdx]'
                  >
                <label :for='`cb_${pcIdx * 3 + prIdx}`'>
                  {{ 2 + pcIdx * 3 + prIdx }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class='controlBox'>
          <div>
            <input type='checkbox' v-model='minPatternSize' id='minPatternSize'>
            <label for='minPatternSize'>Minimum Size</label>
          </div>
          <div v-if='minPatternSize'>
            <input 
              class='minPatternSizeInput'
              type='number' 
              step='1' 
              v-model.number='minPatternSizeValue'
              onkeypress="return /[0-9]/i.test(event.key)">
          </div>
          <div>
            <input type='checkbox' v-model='plot' id='plot'>
            <label for='plot'>Plot</label>
          </div>
        </div>
        <div class='controlBox button'>
          <button class='generate' @click='createGraph'>
            Generate Visualization
          </button>
        </div>   
      </div>
      <QueryControls 
        class='controls' 
        v-if='piece && selectedATIdx === 2' 
        @runQuery='handleRunQuery'
        @updateProportionalVertical='verticalProportionalDisplay = $event'
        :raga='piece.raga'
        :trajIdxs='piece.trajIdxs'
        :piece='piece'
        :navHeight='navHeight'
        :resultsSize='displayTrajs?.length'
        :instIdx='instIdx'
        @update:instIdx='instIdx = $event'
        />
      <ExcelDatasets
        v-if='piece && selectedATIdx === 3'
        :piece='piece'
        :instIdx='instIdx'
        />
    </div>
    <div 
      class='segmentDisplayHolder' 
      v-if='piece && displayTrajs && selectedATIdx === 2'
      >
        <SegmentDisplay
          :id='`segmentDisplay${idx}`'
          v-for='(trajectories, idx) in displayTrajs'
          :key='idx'
          class='segmentDisplay'
          :piece='piece'
          :trajectories='trajectories'
          :displayWidth='segmentDisplayWidths[idx]'
          :displayHeight='segmentDisplayHeight'
          :horizontalProportionalDisplay='horizontalProportionalDisplay'
          :style="{ 
            width: segmentDisplayWidths[idx] + 'px', 
            minWidth: segmentDisplayWidths[idx] + 'px' 
            }"
          :proportion='proportions[idx]'
          :logFreqOverride='logFreqOverride'
          :vocal='vocal'
          :queryAnswer='queryAnswers[idx]'
          />
    </div>


    <div class='graphContainer' v-if='selectedATIdx === 1'>
      <div class='graph' ref='graph'>
      </div>
    </div>
    <PitchPrevalence
      ref='pitchPrevalence' 
      :segmentation='segmentationType'
      :duration='duration'
      :pitchChroma='pitchChroma'
      :condensed='condensed'
      :heatmap='heatmap'
      :pitchRepresentation='pitchRepresentation'
      :piece='piece'
      :fadeTime='fadeTime'
      :height='600'
      :secTopLevels='secTopLevels'
      :diffs='diffs'
      :phraseInfo='phraseInfo!'
      :horizontalProportionalDisplay='horizontalProportionalDisplay'
      v-if='selectedATIdx === 0 && piece'
      :instIdx='instIdx'
    />
  </div>
  <Tooltip
    :x='tooltipX'
    :y='tooltipY'
    :text='tooltipText'
    :open='tooltipOpen'
    />
</template>

<script lang='ts'>
const linSpace = (
  startValue: number, 
  stopValue: number, 
  cardinality: number
) => {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + (step * i));
  }
  return arr;
};

import { 
  instantiatePiece, 
  segmentByDuration, 
  durationsOfPitchOnsets,
  patternCounter,
  chromaSeqToCondensedPitchNums
} from '@/js/analysis.ts';
import { 
  durationsOfFixedPitches, 
  Pitch, 
  pitchNumberToChroma,
  Trajectory,
  Piece,
} from '@/js/classes.ts';
import { pieceExists } from '@/js/serverCalls.ts';
import Gradient from 'javascript-color-gradient';
import * as d3 from 'd3';
import { defineComponent } from 'vue';

import SegmentDisplay from '@/comps/analysis/SegmentDisplay.vue';
import QueryControls from '@/comps/analysis/QueryControls.vue';
import PitchPrevalence from '@/comps/analysis/PitchPrevalence.vue';
import categorization from '@/assets/json/categorization.json';
import ExcelDatasets from '@/comps/analysis/ExcelDatasets.vue';

const phraseTop = categorization['Phrase'];
const phraseTypes = phraseTop['Phrase Type'] as 
  (keyof PhraseCatType['Phrase'])[];
const elaborations = phraseTop['Elaboration Type'] as 
  (keyof PhraseCatType['Elaboration'])[];
const vocalArticulations = phraseTop['Articulation Type']['Vocal'] as
  (keyof PhraseCatType['Vocal Articulation'])[];
const instArticulations = phraseTop['Articulation Type']['Instrumental'] as
  (keyof PhraseCatType['Instrumental Articulation'])[];
const incidentals = phraseTop['Incidental'] as
  (keyof PhraseCatType['Incidental'])[];

import { 
  Query, 
} from '@/js/query.ts';

import { displayTime } from '@/ts/utils.ts';
import  {
  QueryType, 
  MultipleOptionType, 
  QueryAnswerType,
  SecCatType,
  PCountType,
  PhraseCatType,
  TooltipData,
} from '@shared/types'
import {
  Instrument
} from '@shared/enums';

import ModeSelector from '@/comps/editor/renderer/ModeSelector.vue';
import Tooltip from '@/comps/Tooltip.vue';

const shouldTextBeBlack = (backgroundcolor: string) => {
  return computeLuminence(backgroundcolor) > 0.179;
}

const computeLuminence = (backgroundcolor: string) => {
  var colors = hexToRgb(backgroundcolor);
  if (!colors) {
    throw new Error('Invalid color: ' + backgroundcolor);
  }
  
  var components: ('r' | 'g' | 'b')[] = ['r', 'g', 'b'];
  for (var i in components) {
      var c = components[i];
      
      colors[c] = colors[c] / 255.0;

      if (colors[c] <= 0.03928) { 
          colors[c] = colors[c]/12.92;
      } else { 
          colors[c] = Math.pow (((colors[c] + 0.055) / 1.055), 2.4);
      }
  }
  
  var luminence = 0.2126 * colors.r + 0.7152 * colors.g + 0.0722 * colors.b;

  return luminence;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

type AnalyzerComponentDataType = {
  piece?: Piece,
  basicAnalysisTypes: string[],
  selectedATIdx: number,
  pitchPrevalenceTypes: string[],
  patternCountTypes: string[],
  pitchRepresentationTypes: string[],
  segmentationType: string,
  pitchRepresentation: string,
  duration: number,
  pitchChroma: boolean,
  condensed: boolean,
  heatmap: boolean,
  fadeTime: number,
  controlsHeight: number,
  typeRowHeight: number,
  graphHeight: number,
  targetPitchChoices: (string | number)[],
  targetPitchIdx: number,
  pitchTypes: string[],
  pitchType: string,
  patternSizes: number[],
  selectedPatternSizes: boolean[],
  controlBoxWidth: number,
  minPatternSize: boolean,
  minPatternSizeValue: number,
  targetPitchBool: boolean,
  plot: boolean,
  graphRowHeight?: number,
  svg?: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  topSvg?: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  segmentDisplayHeight: number,
  segmentDisplayWidth: number,
  displayTrajs?: Trajectory[][],
  segmentDisplayWidths: number[],
  minSegmentDisplayWidth: number,
  horizontalProportionalDisplay: boolean,
  verticalProportionalDisplay: boolean,
  durAvg: number,
  proportions: number[],
  logFreqOverride?: { low: number, high: number },
  queryAnswers: QueryAnswerType[],
  secTopLevels: { name: SecCatType['Top Level'], bool: boolean }[],
  diffs: {
    phraseTypeDiff: 'include' | 'exclude',
    elaborationDiff: 'include' | 'exclude',
    articulationDiff: 'include' | 'exclude',
    incidentalDiff: 'include' | 'exclude',
  },
  phraseInfo: {
    phraseTypes: { name: keyof PhraseCatType['Phrase'], bool: boolean }[],
    elaborations: { 
      name: keyof PhraseCatType['Elaboration'], 
      bool: boolean 
    }[],
    vocalArticulations: { 
      name: keyof PhraseCatType['Vocal Articulation'], 
      bool: boolean 
    }[],
    instArticulations: { 
      name: keyof PhraseCatType['Instrumental Articulation'], 
      bool: boolean 
    }[],
    incidentals: { name: keyof PhraseCatType['Incidental'], bool: boolean }[],
  },
  instIdx: number,
  tooltipX: number,
  tooltipY: number,
  tooltipOpen: boolean,
  tooltipText: string,
}

import { useTitle } from '@vueuse/core';

export default defineComponent({
  data(): AnalyzerComponentDataType {
    return {
      piece: undefined,
      basicAnalysisTypes: [
        'Pitch Prevalence', 
        'Pitch Patterns', 
        'Query Display',
        'Excel Datasets',
      ],
      selectedATIdx: 0,
      pitchPrevalenceTypes: ['Section', 'Phrase', 'Duration'],
      patternCountTypes: ['Transcription', 'Section', 'Duration'],
      pitchRepresentationTypes: ['Fixed Pitch', 'Pitch Onsets'],
      segmentationType: 'Section',
      pitchRepresentation: 'Fixed Pitch',
      duration: 30,
      pitchChroma: false,
      condensed: false,
      heatmap: false,
      fadeTime: 5,
      controlsHeight: 200,
      typeRowHeight: 30,
      graphHeight: 1000,
      targetPitchChoices: [0],
      targetPitchIdx: 0,
      pitchTypes: ['Pitch Number', 'Sargam'],
      pitchType: 'Pitch Number',
      patternSizes: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      selectedPatternSizes: [
        true, // 2
        true, // 3
        true, // 4
        true, // 5
        true, // 6
        false, // 7
        false, // 8
        false, // 9
        false, // 10
      ],
      controlBoxWidth: 150,
      minPatternSize: false,
      minPatternSizeValue: 1,
      targetPitchBool: true,
      plot: false,
      graphRowHeight: undefined,
      svg: undefined,
      topSvg: undefined,
      segmentDisplayHeight: 400,
      segmentDisplayWidth: 500,
      minSegmentDisplayWidth: 200,
      displayTrajs: undefined,
      segmentDisplayWidths: [],
      horizontalProportionalDisplay: true,
      verticalProportionalDisplay: false,
      durAvg: 0,
      proportions: [],
      logFreqOverride: undefined,
      queryAnswers: [],
      secTopLevels: [
        { name: 'Pre-Chiz Alap', bool: true },
        { name: 'Alap', bool: true },
        { name: 'Composition', bool: true },
        { name: 'Improvisation', bool: true },
        { name: 'Other', bool: true },
        { name: 'None', bool: true },
      ],
      diffs: {
        phraseTypeDiff: 'include',
        elaborationDiff: 'include',
        articulationDiff: 'include',
        incidentalDiff: 'include',
      },
      phraseInfo: {
        phraseTypes: phraseTypes.map(pt => ({ name: pt, bool: true })),
        elaborations: elaborations.map(e => ({ name: e, bool: true })),
        vocalArticulations: vocalArticulations.map(va => {
          return { name: va, bool: true }
        }),
        instArticulations: instArticulations.map(ia => { 
          return { name: ia, bool: true } 
        }),
        incidentals: incidentals.map(i => ({ name: i, bool: true })),
      },
      instIdx: 0,
      tooltipX: 0,
      tooltipY: 0,
      tooltipOpen: false,
      tooltipText: '',
    }
  },

  props: {
    navHeight: {
      type: Number, 
      required: true
    }
  },

  components: {
    SegmentDisplay,
    QueryControls,
    PitchPrevalence,
    ModeSelector,
    Tooltip,
    ExcelDatasets,
  },

  watch: {
    pitchType(newVal) {
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      const raga = this.piece.raga;
      if (newVal === 'Pitch Number') {
        if (this.pitchChroma) {
          this.targetPitchChoices = raga.getPitchNumbers(0, 11).reverse();
          this.targetPitchIdx = this.targetPitchChoices.indexOf(0);
        } else {
          const low = this.piece.lowestPitchNumber;
          const high = this.piece.highestPitchNumber;
          this.targetPitchChoices = raga.getPitchNumbers(low, high).reverse();
          this.targetPitchIdx = this.targetPitchChoices.indexOf(0);
        }
      } else if (newVal === 'Sargam') {
        if (this.pitchChroma) {
          const pitchChoices = raga.getPitchNumbers(0, 11).reverse();
          this.targetPitchChoices = pitchChoices.map(pn => {
            const pitch = Pitch.fromPitchNumber(pn);
            return pitch.octavedSargamLetter
          });
          this.targetPitchIdx = this.targetPitchChoices.indexOf('S');
        } else {
          const low = this.piece.lowestPitchNumber;
          const high = this.piece.highestPitchNumber;
          const pnChoices = raga.getPitchNumbers(low, high).reverse();
          this.targetPitchChoices = pnChoices.map(pn => {
            const pitch = Pitch.fromPitchNumber(pn);
            return pitch.octavedSargamLetter
          });
          this.targetPitchIdx = this.targetPitchChoices.indexOf('S');
        }         
      }
    }
  },

  computed: {

    analysisTypes(): string[] {
      return this.admin ? 
        this.basicAnalysisTypes :
        this.basicAnalysisTypes.filter(type => type !== 'Excel Datasets');
    },

    admin() {
      const jmId = '634d9506a6a3647e543b7641';
      const dnId = '63595c60a6a3647e54a62853';
      const currentId = this.$store.state.userID;
      console.log('currentId', currentId);
      if (currentId === jmId || currentId === dnId) {
        return true;
      } else {
        return false;
      }
    },

    vocal() {
      const inst = this.piece?.instrumentation[this.instIdx];
      if (inst == 'Vocal (M)' || inst == 'Vocal (F)') {
        return true;
      } else {
        return false;
      }
    },

    instTracksEnum() {
      const enumObj: Record<string, number> = {};
      const duplicateNames: Instrument[] = [];
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      this.piece.instrumentation.forEach(inst => {
        if (!duplicateNames.includes(inst)) {
          duplicateNames.push(inst);
        }
      })
      const allNames: string[] = [...this.piece.instrumentation];
      duplicateNames.forEach(n => {
        let ctr = 1;
        allNames.forEach((name, nIdx) => {
          if (name === n) {
            allNames[nIdx] = `${name}_${ctr}`;
          }
          ctr += 1;
        }) 
      })
      this.piece.instrumentation.forEach((_, i) => {
        enumObj[allNames[i]] = i;
      });
      enumObj['None'] = -1;
      return enumObj;
    },

    instTrackTexts() {
      return this.piece?.instrumentation.map((inst, idx) => {
        return `Track ${idx + 1}: ${inst}`;
      }) ?? [];
    }
  },

  methods: {
    hideTooltip() {
      this.tooltipOpen = false;
      this.tooltipText = '';
    },

    showTooltip(data: TooltipData) {
      this.tooltipText = data.text;
      this.tooltipOpen = true;
      this.tooltipX = data.x;
      this.tooltipY = data.y;
    },

    async handleRunQuery(queries: QueryType[], options: MultipleOptionType) {
      options.piece = this.piece;
      this.displayTrajs = [];
      try {
        const res = await Query.multiple(queries, options);
        this.displayTrajs = res[0];
        this.queryAnswers = res[2];
        this.setProportions();
      } catch (err) {
        console.log(err);
      }

    },

    updateChroma() {
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      const raga = this.piece.raga;
      if (this.pitchType === 'Pitch Number') {
        if (this.pitchChroma) {
          this.targetPitchChoices = raga.getPitchNumbers(0, 11).reverse();
          this.targetPitchIdx = this.targetPitchChoices.indexOf(0);
        } else {
          const low = this.piece.lowestPitchNumber;
          const high = this.piece.highestPitchNumber;
          this.targetPitchChoices = raga.getPitchNumbers(low, high).reverse();
          this.targetPitchIdx = this.targetPitchChoices.indexOf(0);
        }
      } else if (this.pitchType === 'Sargam') {
        if (this.pitchChroma) {
          const pitchChoices = raga.getPitchNumbers(0, 11).reverse();
          this.targetPitchChoices = pitchChoices.map(pn => {
            const pitch = Pitch.fromPitchNumber(pn);
            return pitch.octavedSargamLetter
          });
          this.targetPitchIdx = this.targetPitchChoices.indexOf('S');
        } else {
          const low = this.piece.lowestPitchNumber;
          const high = this.piece.highestPitchNumber;
          const pnChoices = raga.getPitchNumbers(low, high).reverse();
          this.targetPitchChoices = pnChoices.map(pn => {
            const pitch = Pitch.fromPitchNumber(pn);
            return pitch.octavedSargamLetter
          });
          this.targetPitchIdx = this.targetPitchChoices.indexOf('S');
        }  
      }
    },

    handleClickAnalysisType(atIdx: number) {
      this.selectedATIdx = atIdx;
      if (this.svg !== undefined) {
        if (this.topSvg === undefined) {
          throw new Error('Top SVG is undefined');
        }
        this.topSvg.selectAll('*').remove();
        this.topSvg.remove();
        this.topSvg = undefined;
        this.svg = undefined;
      }
      if (this.selectedATIdx === 1) {
        this.createGraph()
      }
    },

    addRect({
      x = undefined, 
      y = undefined, 
      w = undefined, 
      h = undefined, 
      fill = 'none',
      stroke = 'none',
    }: {
      x?: number,
      y?: number,
      w?: number,
      h?: number,
      fill?: string,
      stroke?: string,
    } = {}) {
      if (
        x === undefined || 
        y === undefined || 
        w === undefined || 
        h === undefined
      ) {
        throw new Error('x, y, w, or h is undefined');
      }
      return this.svg!.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', fill)
        .attr('stroke', stroke)
    },

    addLine({
      x1 = undefined,
      y1 = undefined,
      x2 = undefined,
      y2 = undefined,
      stroke = 'black',
    }: {
      x1?: number,
      y1?: number,
      x2?: number,
      y2?: number,
      stroke?: string,
    } = {}) {
      if (
        x1 === undefined || 
        y1 === undefined || 
        x2 === undefined || 
        y2 === undefined
        ) {
        throw new Error('x1, y1, x2, or y2 is undefined');
      }
      return this.svg!.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', stroke)
    },

    addText({
      x = undefined,
      y = undefined,
      text = '',
      fSize = '12px',
      fWeight = 'normal',
      fill = 'black',
      anchor = 'middle',
      element = undefined,
    }: {
      x?: number,
      y?: number,
      text?: string | number,
      fSize?: string,
      fWeight?: string,
      fill?: string,
      anchor?: string,
      element?: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    } = {}) {
      if (x === undefined || y === undefined || text === undefined) {
        throw new Error('x, y, or text is undefined');
      }
      if (element === undefined) {
        element = this.svg;
      }
      return element!.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', fSize)
        .attr('font-weight', fWeight)
        .attr('fill', fill)
        .attr('text-anchor', anchor)
        .attr('alignment-baseline', 'middle')
        .text(text)
    },

    getHeatmapColor(val: number) {
      const gradientArray = new Gradient()
        .setColorGradient('#ffffff', '#000000')
        .setMidpoint(100)
        .getColors();
      val = Math.floor(100 * val);
      if (val === 100) val = 99;
      return gradientArray[val]
    },

    createPitchFrequencyGraph({
      segmentation = 'Duration', // or 'Phrase' or 'Section'
      duration = 30, // in seconds, only if segmentation is 'Duration'
      pitchChroma = false,
      condensed = false,
      heatmap = false,
      pitchRepresentation = 'Fixed Pitch',
    } = {}) {
      console.log('Creating pitch frequency graph');
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      let segments: Trajectory[][];
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      if (segmentation === 'Duration') {
        segments = segmentByDuration(this.piece, { 
          duration: duration,
          inst: this.instIdx, 
        });
      } else if (segmentation === 'Phrase') {
        segments = this.piece.phraseGrid[this.instIdx].map(p => p.trajectories);
      } else if (segmentation === 'Section') {
        segments = this.piece.sectionsGrid[this.instIdx].map(s => s.trajectories);
      } else {
        throw new Error('Invalid segmentation');
      }
      const func = pitchRepresentation === 'Fixed Pitch' ? 
        durationsOfFixedPitches : 
        durationsOfPitchOnsets;
      const durs = segments.map(seg => func(seg, {
        countType: 'proportional',
        outputType: pitchChroma ? 'chroma' : 'pitchNumber',
        maxSilence: this.fadeTime,

      }));
      let lowestKey: number = 10000, highestKey: number= -10000;
      durs.forEach(dur => {
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        keys.forEach(key => {
          if (lowestKey === undefined) lowestKey = Number(key);
          if (highestKey === undefined) highestKey = Number(key);
          if (Number(key) < lowestKey) {
            lowestKey = Number(key);
          }
          if (Number(key) > highestKey) {
            highestKey = Number(key);
          }
        })
      })
      if (condensed) {
        lowestKey = this.piece.raga.pitchNumberToScaleNumber(lowestKey!);
        highestKey = this.piece.raga.pitchNumberToScaleNumber(highestKey!);
      }
      let totalWidth = 900;
      let totalHeight = 600;
      const pnLen = this.piece.raga.getPitchNumbers(0, 11).length;
      const ppOct = condensed ? pnLen : 12; 
      const lkOct = Math.floor(lowestKey! / ppOct);
      const hOct = Math.floor(highestKey! / ppOct);
      let mTop = segmentation === 'Duration' ? 90 : 110;
      if (segmentation === 'Section') mTop = 180;
      if (segmentation === 'Phrase') mTop = 240;
      const margin = { top: mTop, right: 30, bottom: 20, left: 80 };
      let width = totalWidth - margin.left - margin.right;
      const height = totalHeight - margin.top - margin.bottom;
      let widthPerSeg = width / durs.length;
      let minWidthPerSeg = 40;
      if (segmentation === 'Section') minWidthPerSeg = 80;
      if (segmentation === 'Phrase') minWidthPerSeg = 80;
      if (widthPerSeg < minWidthPerSeg) {
        widthPerSeg = minWidthPerSeg;
        width = widthPerSeg * durs.length;
        totalWidth = width + margin.left + margin.right;
      }
      this.topSvg = d3.select('.graph')
        .append('svg')
        .attr('width', totalWidth)
        .attr('height', totalHeight)
        .style('background-color', 'white')
      this.svg = this.topSvg
        .append<SVGSVGElement>('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      let y = d3.scaleLinear()
        .domain([lowestKey-1, highestKey+1])
        .range([height, 0]);
      if (this.svg === undefined) {
        throw new Error('svg is undefined');
      }
      const axisNode = this.svg.append('g')
      const pitchNumbers = condensed ? 
        [...Array(1 + highestKey - lowestKey)].map((_, i) => i + lowestKey) : 
        this.piece.raga.getPitchNumbers(lowestKey, highestKey) ;
      const tickLabels =  condensed ? 
        pitchNumbers.map(sn => {
          return this.piece!.raga.scaleNumberToSargamLetter(sn);
        }) : 
        pitchNumbers.map(pn => {
        return this.piece!.raga.pitchNumberToSargamLetter(pn)
      }) 
      axisNode
        .call(d3.axisLeft(y)
          .tickValues(pitchNumbers)
          .tickFormat((_, i) => tickLabels[i] || '')
          .tickSize(0)
          .tickPadding(10))
        .style('color', 'black')
        .style('font-weight', 'normal')
      const sectionRects = [...Array(durs.length)]

      if (condensed) {
        // transform durs
        durs.forEach((dur, dIdx) => {
          if (dur === undefined) {
            throw new Error('dur is undefined');
          }
          const keys = Object.keys(dur);
          keys.forEach(key => {
            const sn = this.piece!.raga.pitchNumberToScaleNumber(Number(key));
            dur[sn] = dur[key];
            if (Number(key) !== Number(sn)) delete dur[key];
          })
        })
      }

      durs.forEach((dur, dIdx) => {
        let minVal: (number | undefined) = undefined; 
        let maxVal: (number | undefined) = undefined;
        let modeIdx: number | undefined = undefined; 
        let modeVal = 0;
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (minVal === undefined) {
              minVal = Number(key);
            }
            if (maxVal === undefined) {
              maxVal = Number(key);
            }
            if (Number(key) < minVal) {
              minVal = Number(key);
            }
            if (Number(key) > maxVal) {
              maxVal = Number(key);
            }
            if (Number(dur[key]) > modeVal) {
              modeVal = Number(dur[key]);
              modeIdx = Number(key);
            }
          })
          if (maxVal === undefined) {
            throw new Error('maxVal is undefined');
          }
          if (minVal === undefined) {
            throw new Error('minVal is undefined');
          }
          maxVal = maxVal + 0.5;
          minVal = minVal - 0.5;  
          const x_ = dIdx * width / durs.length;
          const y_ = y(maxVal);
          const w_ = width / durs.length;
          const h_ = y(minVal) - y(maxVal);
          if ((!pitchChroma) && (!heatmap)) {
            sectionRects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: heatmap ? 'none' : '#D3D3D3',
            })
          }

          
          keys.forEach((key, kIdx) => {
            let fillColor = 'black';
            const mY_ = y(Number(key)+0.5);
            const mH_ = y(Number(key)-0.5) - y(Number(key)+0.5);
            if (heatmap) {
              fillColor = this.getHeatmapColor(dur[key]);
              this.addRect({ x: x_, y: mY_, w: w_, h: mH_, fill: fillColor });
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)), 
                text: (100*dur[key]).toFixed(0)+'%',
                fill: dur[key] > 0.5 ? 'white' : 'black' 
              })
            } else {
              if (Number(key) === modeIdx) {
                fillColor = 'white'
                this.addRect({ x: x_, y: mY_, w: w_, h: mH_, fill: 'grey' })
              } else if (this.pitchChroma) {
                this.addRect({ x: x_, y: mY_, w: w_, h: mH_, fill: '#D3D3D3'})
              }
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)), 
                text: (100*dur[key]).toFixed(0)+'%', 
                fill: fillColor 
              })
            }
          })
          if ((!pitchChroma) && (heatmap)) {
            sectionRects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: heatmap ? 'none' : '#D3D3D3',
            })
          }
        }
      })
      sectionRects.forEach(rect => {
        rect?.attr('stroke', 'black')
      })
      
      for (let i = lkOct; i <= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i+1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey+ 1.5;
        }
        this.addText({ x: -45, y: y((lowY + highY) / 2 - 0.5), text: i })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5);
        this.addRect({ x: -60, y: y_, w: 30, h: h_, stroke: 'black' })
        const lY_ = y(lowY - 0.5);
        this.addLine({ x1: -30, y1: lY_, x2: width, y2: lY_ })
        if (i === hOct) this.addLine({ x1: -30, y1: y_, x2: width, y2: y_ })
        this.addLine({ x1: width, y1: lY_, x2: width, y2: y_ })
        if (segmentation === 'Duration') {
          this.addLine({ x1: -30, y1: -20, x2: width, y2: -20 })
          this.addLine({ x1: -30, y1: -40, x2: width, y2: -40 })
          this.addText({ x: -15, y: -10, text: 'End' })
          this.addText({ x: -15, y: -30, text: 'Start' })
          this.addLine({ x1: -30, y1: 0, x2: -30, y2: -70 })
          this.addLine({ x1: 0, y1: 0, x2: 0, y2: -40 })
          this.addLine({ x1: -30, y1: -70, x2: width, y2: -70 })
          this.addLine({ x1: width, y1: -70, x2: width, y2: 0 })
          const text = `Pitch Range and Percentage of Duration on each ` + 
            `Fixed Pitch, Segmented into ${duration}s Windows`;
          const x_ = (width - 30) / 2;
          this.addText({ 
            x: x_, 
            y: -55, 
            text: text, 
            fSize: '14px', 
            fWeight: 'bold' 
          });
          this.addLine({ x1: -60, y1: 0, x2: -60, y2: -40 })
          this.addLine({ x1: -60, y1: -40, x2: -30, y2: -40})
          this.addText({ x: -45, y: -20, text: 'Oct.' })
          durs.forEach((dur, dIdx) => {
            const tX_ = widthPerSeg * (dIdx + 0.5);
            const txt1 = displayTime(dIdx * duration);
            this.addText({ x: tX_, y: -30, text: txt1 });
            const txt2 = displayTime((dIdx + 1) * duration);
            this.addText({ x: tX_, y: -10, text: txt2 });
            if (dIdx !== durs.length - 1) {
              const x_ = widthPerSeg * (dIdx + 1)
              this.addLine({ 
                x1: x_, 
                y1: 0, 
                x2: x_, 
                y2: -40, 
                stroke: '#D3D3D3' 
              })
            }
          })
        } else if (segmentation === 'Section') {
          this.addLine({ x1: -60, y1: -60, x2: width, y2: -60 })
          this.addLine({ x1: -60, y1: -40, x2: width, y2: -40 })
          this.addLine({ x1: -60, y1: -20, x2: width, y2: -20 })
          this.addLine({ x1: -60, y1: -80, x2: width, y2: -80 })
          this.addLine({ x1: -60, y1: -140, x2: width, y2: -140 })
          this.addLine({ x1: -60, y1: 0, x2: -60, y2: -140 })
          this.addLine({ x1: 0, y1: 0, x2: 0, y2: -80 })
          this.addLine({ x1: width, y1: 0, x2: width, y2: -140 })
          this.addLine({ x1: -60, y1: -110, x2: width, y2: -110 })
          this.addText({ 
            x: width / 2, 
            y: -95, 
            text: 'Pitch Range and Percentage of Duration on each Fixed ' + 
              'Pitch, Segmented by Section', 
            fSize: '14px', 
            fWeight: 'bold' 
          });
          this.addText({
            x: width / 2,
            y: -125,
            text: this.piece.title,
            fSize: '14px',
            fWeight: 'bold'
          })
          this.addText({ x: -30, y: -50, text: 'Start' })
          this.addText({ x: -30, y: -70, text: 'Section #' })
          this.addText({ x: -30, y: -30, text: 'Duration'  })
          this.addText({ x: -30, y: -10, text: 'Sec. Type'  })

          durs.forEach((dur, dIdx) => {
            const sCats = this.piece!.sectionCategorization[dIdx];
            const secPhrases = this.piece!.sections[dIdx].phrases;
            const st = secPhrases[0].startTime!;
            const lastPhrase = secPhrases[secPhrases.length - 1];
            const et = lastPhrase.startTime! + lastPhrase.durTot!;
            const x_ = widthPerSeg * (dIdx + 0.5);
            this.addText({ x: x_, y: -50, text: displayTime(st) });
            this.addText({ x: x_, y: -70, text: dIdx + 1 })
            this.addText({ x: x_, y: -30, text: displayTime(et - st) });
            this.addText({ x: x_, y: -10, text: sCats['Top Level'] })
            if (dIdx !== durs.length - 1) {
              const x_ = widthPerSeg * (dIdx + 1)
              this.addLine({ 
                x1: x_, 
                y1: 0, 
                x2: x_, 
                y2: -80, 
                stroke: '#D3D3D3' 
              })
            }           
          })
        } else if (segmentation === 'Phrase') {
          this.addLine({ x1: -60, y1: 0, x2: -60, y2: -220 })
          this.addLine({ x1: 0, y1: 0, x2: 0, y2: -160 })
          this.addLine({ x1: width, y1: 0, x2: width, y2: -220 })
          const horizontals = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9.5, -11];
          horizontals.forEach(h => {
            const y_ = h * 20;
            this.addLine({ x1: -60, y1: y_, x2: width, y2: y_ })
          })
          // text labels
          this.addText({ 
            x: width / 2, 
            y: -175, 
            text: 'Pitch Range and Percentage of Duration on each Fixed ' + 
              'Pitch, Segmented by Phrase', 
            fSize: '14px', 
            fWeight: 'bold' 
          });
          this.addText({
            x: width / 2,
            y: -205,
            text: this.piece.title,
            fSize: '14px',
            fWeight: 'bold'
          })
          this.addText({ x: -30, y: -90, text: 'Start' })
          this.addText({ x: -30, y: -110, text: 'Phrase #' })
          this.addText({ x: -30, y: -150, text: 'Section #' })
          this.addText({ x: -30, y: -70, text: 'Duration'  })
          this.addText({ x: -30, y: -130, text: 'Section'  })
          this.addText({ x: -30, y: -50, text: 'Phrase'  })
          this.addText({ x: -30, y: -30, text: 'Elaboration' })
          this.addText({ x: -30, y: -10, text: 'Articulation' })
          const secStarts = this.piece.sectionStarts!;
          let secCt = 0;
          const secCats = this.piece.sectionCategorization;
            durs.forEach((dur, dIdx) => {
            const cat = this.piece!.phrases[dIdx].categorizationGrid[0];
            if (secStarts.includes(dIdx)) {
              const x = widthPerSeg * dIdx;
              this.addLine({ x1: x, y1: height, x2: x, y2: -160 });
              if (secCt >= 1) {
                const prevSecType = secCats[secCt-1]['Top Level'];
                const size = this.piece!.sections[secCt-1].phrases.length;
                const midpoint = x - (widthPerSeg * size ) / 2;
                this.addText({ x: midpoint, y: -130, text: prevSecType });
                this.addText({ x: midpoint, y: -150, text: secCt });
              }
              secCt += 1;
              if (secCt === secCats.length) {
                const prevSecType = secCats[secCt-1]['Top Level'];
                const size = this.piece!.sections[secCt-1].phrases.length;
                const midpoint = width - (widthPerSeg * size ) / 2;
                this.addText({ x: midpoint, y: -130, text: prevSecType });
                this.addText({ x: midpoint, y: -150, text: secCt });
              }
            }
            const ptKeys = Object.keys(cat['Phrase']) as 
              (keyof PhraseCatType['Phrase'])[];
            const phraseTypes = ptKeys.filter(k => {
              return cat['Phrase'][k] === true
            });
            const phraseType = phraseTypes[0];
            const etKeys = Object.keys(cat['Elaboration']) as 
              (keyof PhraseCatType['Elaboration'])[];
            const elaborationTypes = etKeys.filter(k => {
              return cat['Elaboration'][k] === true
            });
            const elaborationType = elaborationTypes[0];
            const art = this.vocal ? 
              'Vocal Articulation' : 
              'Instrumental Articulation';
            type VAType = keyof PhraseCatType['Vocal Articulation'];
            type IAType = keyof PhraseCatType['Instrumental Articulation'];
            let atKeys: 
              (VAType)[] | 
              (IAType)[];
            let articulationTypes: string[] = [];
            if (art === 'Vocal Articulation') {
              atKeys = Object.keys(cat[art]) as 
                (VAType)[];
              articulationTypes = atKeys.filter((k) => {
                const ca = cat[art]
                return ca[k] === true
              });
            } else {
              atKeys = Object.keys(cat[art]) as 
                (IAType)[];
              articulationTypes = atKeys.filter((k) => {
                const ca = cat[art]
                return ca[k] === true
              });
            } 
            const articulationType = articulationTypes[0];
            const phrase = this.piece!.phrases[dIdx];
            const st = phrase.startTime!;
            const et = st + phrase.durTot!;
            const x_ = widthPerSeg * (dIdx + 0.5);
            this.addText({ x: x_, y: -90, text: displayTime(st) });
            this.addText({ x: x_, y: -110, text: dIdx + 1 });
            this.addText({ x: x_, y: -70, text: displayTime(et - st) });
            if (phraseType) {
              this.addText({ x: x_, y: -50, text: phraseType });
            }
            if (elaborationType) {
              this.addText({ x: x_, y: -30, text: elaborationType });
            }
            if (articulationType) {
              this.addText({ x: x_, y: -10, text: articulationType });
            }
            if (dIdx !== durs.length - 1) {
              const lX_ = widthPerSeg * (dIdx + 1);
              this.addLine({ 
                x1: lX_, 
                y1: 0, 
                x2: lX_, 
                y2: -120, 
                stroke: '#D3D3D3' 
              });
            }
          })
        }
      }
    },

    createGraph() {
      if (this.selectedATIdx === 0) {
        const pp = this.$refs['pitchPrevalence'] as InstanceType<typeof PitchPrevalence>;
        if (pp !== undefined) pp.generateGraph();
      } else {
        if (this.piece === undefined) {
          throw new Error('Piece is undefined');
        }

        if (this.svg) {
          if (this.topSvg !== undefined) {
            this.topSvg.selectAll('*').remove();
            this.topSvg.remove();
            this.topSvg = undefined;
          }
          this.svg = undefined;
        }
        if (this.selectedATIdx === 1) {
          const sargam = this.pitchType === 'Sargam';
          let tpChoices;
          if (sargam) {
            const low = this.piece.lowestPitchNumber;
            const high = this.piece.highestPitchNumber;
            tpChoices = this.pitchChroma ?
              this.piece.raga.getPitchNumbers(0, 11).reverse() :
              this.piece.raga.getPitchNumbers(low, high).reverse();
          } else {
            tpChoices = this.targetPitchChoices;
          }
          const tp = tpChoices[this.targetPitchIdx];
          const targetPitch = this.targetPitchBool ? tp : undefined;
          const minPatSize = this.minPatternSize ? 
            this.minPatternSizeValue : 
            1;
          this.createPatternCounterGraph({
            segmentation: this.segmentationType,
            duration: this.duration,
            pitchChroma: this.pitchChroma,
            targetPitch: targetPitch,
            minSize: minPatSize,
            pitchType: this.pitchType,
            plot: this.plot,
          })
        }
      }
      

      
    },

    createPatternCounterGraph({
      segmentation = 'Section',
      duration = 30,
      pitchChroma = false,
      pitchType = 'Pitch Number',
      targetPitch = undefined,
      minSize = 1,
      plot = false

    }: {
      segmentation?: string,
      duration?: number,
      pitchChroma?: boolean,
      pitchType?: string,
      targetPitch?: number | string,
      minSize?: number,
      plot?: boolean,
    } = {}) {
      if (this.piece === undefined) {
        throw new Error('Piece is undefined');
      }
      const pSizes = this.patternSizes
          .filter((_, idx) => this.selectedPatternSizes[idx]);
      let segments, title;
      if (segmentation === 'Duration') {
        segments = segmentByDuration(this.piece, { 
          duration: duration,
          inst: this.instIdx,
        });
        title = `Patterns of Size ${pSizes.join(', ')}, ` + 
          `Segmented into ${duration}s Durations`;
      } else if (segmentation === 'Phrase') {
        segments = this.piece.phraseGrid[this.instIdx].map(p => p.trajectories);
        title = `Patterns of Size ${pSizes.join(', ')}, Segmented by Phrase`;
      } else if (segmentation === 'Section') {
        segments = this.piece.sectionsGrid[this.instIdx].map(s => {
          return s.trajectories
        });
        title = `Patterns of Size ${pSizes.join(', ')}, Segmented by Section`;
      } else if (segmentation === 'Transcription') {
        segments = [this.piece.allTrajectories(this.instIdx)];
        title = `Patterns of Size ${pSizes.join(', ')} in Full Transcription`;
      } else {
        throw new Error('Invalid segmentation type');
      }
      const pCounts = segments.map(s => {
        const pCount: PCountType = { maxSize: 0 };
        let maxSize = 0;          
        pSizes.forEach(ps => {
            const options = {
              size: ps,
              outputType: pitchChroma ? 'chroma' : 'pitchNumber',
              maxLagTime: this.fadeTime,
              sort: true,
              targetPitch: targetPitch,
              minSize: minSize
            }
            const pc = patternCounter(s, options);
            if (pc.length > maxSize) maxSize = pc.length;
            pCount[ps] = pc
          })
        pCount['maxSize'] = maxSize;
        return pCount;
      })
      let verticalTot = 20 * pCounts
        .map(pCount => (plot ? pCount.maxSize * 4 : pCount.maxSize) + 3)
        .reduce((acc, v) => acc + v, 0);
      const margin = { top: 100, right: 30, bottom: 20, left: 30 };
      const sum = pSizes.reduce((acc, ps) => acc + ps, 0);
      let totalWidth = (sum + 3 * pSizes.length) * 20 + margin.left;
      // let totalWidth = 900;
      let totalHeight = verticalTot + margin.top;
      this.topSvg = d3.select('.graph')
        .append('svg')
        .attr('width', totalWidth)
        .attr('height', totalHeight)
        .style('background-color', 'white')
      this.svg = this.topSvg
        .append<SVGSVGElement>('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // add title
      this.addText({
        x: totalWidth / 2,
        y: -75,
        text: this.piece.title,
        fSize: '14px',
        fWeight: 'bold'
      });
      this.addText({ 
        x: totalWidth / 2, 
        y: -55, 
        text: title, 
        fSize: '14px', 
        fWeight: 'bold' 
      });

      let verticalOffset = 0;
      pCounts.forEach((pCount, pcIdx) => {
        if (segmentation === 'Section') {
          this.addText({
            x: 0,
            y: verticalOffset * 20 - 15,
            text: 'Section ' + (pcIdx + 1),
            fSize: '12px',
            fWeight: 'bold',
            anchor: 'left'
          })
        } else if (segmentation === 'Duration') {
          const txt = displayTime(pcIdx * duration) + ' - ' + 
            displayTime((pcIdx + 1) * duration);
          this.addText({
            x: 0,
            y: verticalOffset * 20 - 15,
            text: txt,
            fSize: '12px',
            fWeight: 'bold',
            anchor: 'left'
          })
        }
        const sizes = Object.keys(pCount).filter(k => k !== 'maxSize');
        let ct = 0;
        sizes.forEach((size, sIdx) => {
          const arr = pCount[Number(size)];
          arr.forEach((patternObj, aIdx) => {
            const y = plot ? 
                (4 * aIdx + verticalOffset) * 20 : 
                (aIdx + verticalOffset) * 20;
            patternObj.pattern.forEach((patItem, patIdx) => {
              const x = patIdx * 20 + ct * 20;
              const chroma = pitchNumberToChroma(patItem);
              const colors = [
                '#e6194b', 
                '#3cb44b', 
                '#ffe119', 
                '#4363d8', 
                '#f58231', 
                '#911eb4', 
                '#46f0f0', 
                '#f032e6', 
                '#bcf60c', 
                '#fabebe', 
                '#008080', 
                '#e6beff',
              ]
              const co = colors[chroma];
              const x_ = x + 10;
              const y_ = y + 10;
              const blk = shouldTextBeBlack(co);
              const txtColor = blk ? 'black' : 'white';
              this.addRect({ x: x, y: y, w: 20, h: 20, fill: co });
              let txt;
              if (pitchType === 'Sargam') {
                const pitch = Pitch.fromPitchNumber(patItem);
                txt = pitch.octavedSargamLetter;
              } else if (pitchType === 'Pitch Number') {
                txt = patItem;
              }
              this.addText({ x: x_, y: y_, text: txt, fill: txtColor })
            })
            const x = Number(size) * 20 + ct * 20 + 15;
            // const y = (verticalOffset + aIdx) * 20 + 10;
            this.addRect({ x: x-10, y: y, w: 20, h: 20, fill: 'black' })
            const p_ct = patternObj.count;
            this.addText({ x: x, y: y + 10, text: p_ct, fill: 'white' })

            if (plot) {
              let pattern = patternObj.pattern;
              if (pitchChroma) {
                pattern = chromaSeqToCondensedPitchNums(pattern)
              }
              const pitches = pattern.map(p => {
                return Pitch.fromPitchNumber(p)
              })
              const da = [...Array(pitches.length-1)]
                .map(_ => 1 / (pitches.length-1))
              const trajObj = {
                id: 6,
                pitches: pitches,
                durArray: da,
              }
              const traj = new Trajectory(trajObj);
              const numPts = 50;
              const pts = linSpace(0, 1, numPts);
              let computes = pts.map(pt => traj.compute(pt, true));
              const min = Math.min(...computes);
              const initMax = Math.max(...computes);
              computes = computes.map(c => c - min);
              const max = Math.max(...computes);
              if (max > 0) computes = computes.map(c => c / max);


              const x_ = ct * 20;
              const xScale = d3.scaleLinear()
                .domain([0, 1])
                .range([x_ + 10, x_ + 20 * Number(size) - 10])
              const y = (4 * aIdx + verticalOffset) * 20 + 30;
              const yScale = d3.scaleLinear()
                .domain([0, 1])
                .range([y + 40, y])     
              const line = d3.line<number>()
                .x((d, i) => xScale(pts[i]))
                .y((d) => yScale(d))
              if (min !== initMax) {
                const nps = pitches.map(p => p.numberedPitch)
                const minP = Math.min(...nps);
                const maxP = Math.max(...nps);
                const pns = this.piece!.raga.getPitchNumbers(minP, maxP);
                const ps = pns.map(p => Pitch.fromPitchNumber(p));
                const lines = ps.map(p => {
                  return (p.logFreq - min) / (initMax - min)
                })
                
                lines.forEach(l => {
                  this.svg!.append('line')
                    .attr('x1', x_)
                    .attr('y1', yScale(l))
                    .attr('x2', x_ + 20 * Number(size))
                    .attr('y2', yScale(l))
                    .attr('stroke', 'lightgrey')
                    .attr('stroke-width', 1)
                })
              }
              if (this.svg === undefined) {
                  throw new Error('svg is undefined')
                }
              this.svg.append('path')
                .datum(computes)
                .attr('d', line)
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
            }
          })
          ct += Number(size);      
          ct += 3;
        })
        const offset = plot ? 3 * pCount.maxSize : pCount.maxSize;
        verticalOffset += offset;
        verticalOffset += 3;
      }) 
    },

    setProportions() {
      if (this.displayTrajs === undefined) {
        throw new Error('displayTrajs is undefined');
      }
      if (this.horizontalProportionalDisplay) {
        this.durAvg = this.displayTrajs
          .map(t => {
            const initP = this.piece!.phraseGrid[this.instIdx][t[0].phraseIdx!];
            if (initP === undefined) {
              debugger;
            }
            const initStart = initP.startTime! + t[0].startTime!;
            const lastP = this.piece!.phraseGrid[this.instIdx][t[t.length - 1].phraseIdx!];
            const lastStart = lastP.startTime! + t[t.length - 1].startTime!;
            const lastEnd = lastStart + t[t.length - 1].durTot!;
            return lastEnd - initStart;
          })
          .reduce((acc, v) => acc + v, 0)
        this.durAvg /= this.displayTrajs.length;
        this.segmentDisplayWidths = this.displayTrajs.map(t => {
          const initP = this.piece!.phraseGrid[this.instIdx][t[0].phraseIdx!];
          const initStart = initP.startTime! + t[0].startTime!;
          const lastP = this.piece!.phraseGrid[this.instIdx][t[t.length - 1].phraseIdx!];
          const lastStart = lastP.startTime! + t[t.length - 1].startTime!;
          const lastEnd = lastStart + t[t.length - 1].durTot!;
          const dur = lastEnd - initStart;
          this.proportions.push(dur / this.durAvg);
          const out = this.segmentDisplayWidth * dur / this.durAvg;
          if (out < this.minSegmentDisplayWidth) {
            return this.minSegmentDisplayWidth;
          } else {
            return out;
          }
        })
      } else {
        this.segmentDisplayWidths = this.displayTrajs.map(_ => {
          return this.segmentDisplayWidth
        });
      }
      if (this.verticalProportionalDisplay) {
        console.log('true vertprop')
        const max = this.displayTrajs.map(trajs => {
          const logFreqs = trajs.map(traj => traj.logFreqs).flat();
          const testXs = linSpace(0, 1, 25);
          return trajs.reduce((acc, traj) => {
            const yVals = testXs.map(x => traj.compute(x, true));
            const max = Math.max(...yVals);
            if (max > acc) {
              return max;
            } else {
              return acc;
            }
          }, logFreqs[0])
        }).reduce((acc, v) => {
          if (v > acc) {
            return v;
          } else {
            return acc;
          }
        }, 0);
        const min = this.displayTrajs.map(trajs => {
          const logFreqs = trajs.map(traj => traj.logFreqs).flat();
          const testXs = linSpace(0, 1, 25);
          return trajs.reduce((acc, traj) => {
            const yVals = testXs.map(x => traj.compute(x, true));
            const min = Math.min(...yVals);
            if (min < acc) {
              return min;
            } else {
              return acc;
            }
          }, logFreqs[0])
        }).reduce((acc, v) => {
          if (v < acc) {
            return v;
          } else {
            return acc;
          }
        }, 1000);
        this.logFreqOverride = { low: min, high: max }
      } else {
        this.logFreqOverride = undefined;
      
      }
    }
  },

  async mounted() {
    const nh = this.navHeight
    const aboveHeight = this.controlsHeight + this.typeRowHeight + nh;
    this.graphRowHeight = window.innerHeight - aboveHeight;
    try {
      const storedId = this.$store.state._id;
      const pieceDoesExist = await pieceExists(storedId);
      const id = pieceDoesExist ? storedId : '63445d13dc8b9023a09747a6';
      this.$router.push({
        name: 'AnalyzerComponent', 
        query: { 'id': id },
      })
      this.piece = await instantiatePiece(id);
      useTitle(this.piece.title)
      this.createGraph();
      const low = this.piece.lowestPitchNumber;
      const high = this.piece.highestPitchNumber;
      const raga = this.piece.raga;
      if (this.pitchChroma) {
        this.targetPitchChoices = raga.getPitchNumbers(0, 11).reverse();
        this.targetPitchIdx = this.targetPitchChoices.indexOf(0);
      } else {
        this.targetPitchChoices = raga.getPitchNumbers(low, high).reverse()
        this.targetPitchIdx = this.targetPitchChoices.indexOf(0)
      }
      
    } catch (err) {
      console.log(err);
    }
  }
})
</script>

<style lang="css" scoped>
  .main_ {
    background-image: linear-gradient(black, #1e241e);
    height: 100vh;
    color: white;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
    overflow-y: scroll;
  }

  .main_::-webkit-scrollbar {
    display: none
  }

  .graph {
    overflow-x: scroll;
    overflow-y: scroll;
    width: 90vw;
    height: v-bind(graphRowHeight + 'px');
    display: relative;
  }

  .graph::-webkit-scrollbar {
    display: none
  }

  .graphContainer {
    width: 100%;
    height: calc(100% - v-bind(controlsHeight + typeRowHeight + 100 + 'px'));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;
  }

  .graphContainer::-webkit-scrollbar {
    display: none
  }

  .analysisControls {
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
    width: 100%;
    height: v-bind(controlsHeight + typeRowHeight + 'px');
    border-top: 1px solid black;
  }

  .analysisTypeRow {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    width: 100%;
    height: v-bind(typeRowHeight + 'px');
    background-color: #1e241e;
  }

  .analysisType {
    width: 180px;
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
  }

  .analysisType:hover {
    cursor: pointer;
    background-color: #586958;
  }

  .selected {
    background-color: #586958;
  }

  .controls { 
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: black;
    overflow: auto;
  }

  .controlBox {
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: left;
    width: v-bind(controlBoxWidth + 'px');
    height: v-bind(controlsHeight - 20 + 'px');
    padding: 5px;
    box-sizing: border-box;
  }
  
  .controlBox > div:not(.scrolling) {
    width: 100%;
    height: 25px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
  }

  .scrollingCBHolder {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    width: calc(100vw - var(--controlBoxWidth) - 20px);
    height: v-bind(controlsHeight - 20 + 'px');
    padding: 10px;
    overflow-x: scroll;
  }

  .scrollingCBHolder::-webkit-scrollbar {
    display: none
  }

  .scrolling > div {
    width: 100%;
    height: 25px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
  }

  .scrolling > div > input {
    margin: 5px;
  }

  .controlBox > div > input {
    margin: 5px;
  }

  .controlBox.button {
    justify-content: center;
    align-items: center;
  }

  button {
    cursor: pointer;
  }

  button.generate {
    width: 100px;
  }

  #duration {
    max-width: 50px;
    width: 50px;
  }

  #fadeTime {
    /* max-width: 50px; */
    width: 36px;
    max-width: 36px;
    padding: 0px;
    margin: 0px;
  }

  #targetPitch {
    max-width: 40px;
    min-width: 40px;
    width: 40px;
    /* margin-left: 5px; */
  }

  label {
    font-family: sans-serif;
    width: 120px;
    text-align: left;
    
  }

  button {
    font-family: sans-serif
  }

  input {
    font-family: sans-serif;
  }
  

  .rightInputRow {
    display: flex;
    flex-direction: row;
    justify-content: right;
    align-items: center;
    width: 100%;
    height: 25px;
  }

  .rightInputRow > label {
    text-align: right;
    margin-right: 5px;
  }

  .patternSizeLabel {
    text-align: center;
    height: 25px;
  }

  .patternSizeMatrix {
    height: v-bind(controlsHeight - 40 + 'px');
    min-height: v-bind(controlsHeight - 40 + 'px');
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
    width: 100%;
  }

  .patternSizeRow {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    width: v-bind(controlBoxWidth / 3 + 'px');
    height: 25px;
  }

  .patternSizeRow > label {
    margin-left: 5px;
  }

  .minPatternSizeInput {
    width: 30px;
    min-width: 30px;
    max-width: 30px;
  }

  .segmentDisplay {
    height: v-bind(segmentDisplayHeight + 'px');
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-right: 1px dotted black;
  }

  .segmentDisplayHolder {
    width: 100vw;
    height: v-bind(segmentDisplayHeight + 'px');
    background-color: white;
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
  }

  .segmentDisplayHolder::-webkit-scrollbar {
    display: none
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
    width: 100%;
  }

  .scrolling {
    overflow-y: scroll;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
  }

  .scrolling::-webkit-scrollbar {
    display: none
  }

  .spaceBelow {
    margin-bottom: 5px;
  }
</style>
