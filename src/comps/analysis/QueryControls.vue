<template>
  <div class='controlsOuter'>
    <div class='controlsBox primary'>
      <div class='controlsRow'>
        <label for='segmentation'>Segmentation: </label>
        <select name='segmentation' v-model='segmentation'>
          <option 
            v-for='segmentation in possibleSegmentations' 
            :value='segmentation.value'
            :key='segmentation.value'
            >
            {{ segmentation.text }}
          </option>
        </select>
      </div>
      <div class='controlsRow' v-if='segmentation === "sequenceOfTrajectories"'>
      <label>Sequence Size: </label>
        <input 
          type='number' 
          v-model='sequenceLength' 
          min='1' 
          step='1' 
          class='numQueries'
          @input='sequenceLength = Math.round(sequenceLength)'
          @keypress='preventDecimal'
          />
      </div>
      <div class='controlsRow'>
        <label>Queries: </label>
        <input 
          type='number' 
          v-model='numQueries' 
          min='1' 
          step='1' 
          class='numQueries'
          @input='numQueries = Math.round(numQueries)'
          @keypress='preventDecimal'
          />
        <label for='everyRadio' class='everySome'>Every</label>
        <input id='everyRadio' type='radio' :value='true' v-model='all' />
        <label for='someRadio' class='everySome'>Some</label>
        <input id='someRadio' type='radio' :value='false' v-model='all' />
      </div>
      <div class='controlsRow dur'>
        <label>Min Dur: </label>
        <input type='number' v-model='minDur' min='0' :max='maxDur' step='1' />
        <label>Max Dur: </label>
        <input type='number' v-model='maxDur' :min='minDur' step='1' />
      </div>
      <div class='controlsRow'>
        <label for='propToggle'>Proportional Vertical Display: </label>
        <input 
          id='propToggle'
          type='checkbox' 
          v-model='proportionalVertical' 
          @change='updateProportionalVertical'
          />
      </div>
      <div class='controlsRow'>
        <button @click='runQuery'>Search</button>
        <button @click='showSaveQueryModal=true'>Save Query</button>
        <button @click='showLoadQueryModal=true'>Load Query</button>
      </div>
      <div class='controlsRow'>
        <button 
          @click='downloadSegmentDisplays'
          :disabled='!resultsSize'
          >
          Download Results
        </button>
      </div>
    </div>
    <div class='queriesContainer'>
      <div 
        class='controlsBox' 
        v-for='(q, qIdx) in numQueries'
        :key='qIdx'
      >
        <div class='controlsRow title'>
          Query {{ q }}
        </div>  
        <div class='controlsRow'>
          <label for='category'>Category: </label>
          <select name='category' v-model='categories[qIdx].value'>
            <option 
              v-for='category in possibleCategories' 
              :value='category.value'
              :key='category.value'
              >
              {{ category.text }}
            </option>
          </select>
        </div>
        <div class='controlsRow' v-if='categories[qIdx].value === "pitch"'>
          <label>Pitch: </label>
          <select 
            name='pitch' 
            v-model='pitchNames[qIdx]' 
            >
            <option 
              v-for='pitchName in reversedSargamNames' 
              :value='pitchName'
              :key='pitchName'
              >
              {{ pitchName }}
            </option>
          </select>
          <label>Octave: </label>
          <select name='octave' v-model='octs[qIdx]'>
            <option 
              v-for='oct in range(-2, 4, true)' 
              :value='oct'
              :key='oct'>
              {{ oct }}
            </option>
          </select>
        </div>
        <div 
          class='controlsRow' 
          v-if='categories[qIdx].value.slice(0, 13) === "pitchSequence"'
          >
          <label>Number of Pitches: </label>
          <select 
            name='numPitches' 
            v-model='numPitches[qIdx]' 
            @change='updateNumPitches(qIdx)'
            >
            <option 
              v-for='numP in range(2, 7, true)' 
              :value='numP'
              :key='numP'
              >
              {{ numP }}
            </option>
          </select>
        </div>
        <div 
          class='controlsRow'
          v-if='categories[qIdx].value.slice(0, 13) === "pitchSequence"'
          >
          <label>Sequence: </label>
          <div 
            class='pitchOct' 
            v-for='(_, seqIdx) in pitchSeqObjs[qIdx].length' 
            :key='seqIdx'
            >
            <select 
              name='pitch' 
              v-model='pitchSeqObjs[qIdx][seqIdx].swara' 
              >
              <option 
                v-for='pitchName in reversedSargamNames' 
                :value='pitchName'
                :key='pitchName'
                >
                {{ pitchName }}
              </option>
            </select>
            <select name='octave' v-model='pitchSeqObjs[qIdx][seqIdx].oct'>
              <option 
                v-for='oct in range(-2, 4, true)' 
                :value='oct'
                :key='oct'>
                {{ oct }}
              </option>
            </select>
          </div>
        </div>
        <div
          class='controlsRow'
          v-if='categories[qIdx].value.slice(0, 12) === "trajSequence"'
          >
          <label>Number of Trajectories: </label>
          <select
            name='numTrajs'
            v-model='numTrajs[qIdx]'
            @change='updateNumTrajs(qIdx)'
            >
            <option
              v-for='numT in range(2, 5, true)'
              :value='numT'
              :key='numT'
              >
              {{ numT }}
            </option>
          </select>
        </div>
        <div 
          class='controlsRow big'
          v-if='categories[qIdx].value.slice(0, 12) === "trajSequence"'
          >
          <label>Sequence: </label>
          <div class='seqCol'>
            <div 
              v-for='(_, seqIdx) in trajIdSeqs[qIdx].length'
              >
              <select
                v-model='trajIdSeqs[qIdx][seqIdx]'
                >
                <option
                  v-for='trajName in trajNames'
                  :value='trajName.value'
                  :key='trajName.value'
                  >
                  {{ trajName.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div 
          class='controlsRow' 
          v-if='categories[qIdx].value === "trajectoryID"'
          >
          <label>Trajectory: </label>
          <select 
            name='trajectory' v-model='trajectoryIDs[qIdx]'
            >
            <option 
              v-for='(trajName) in trajNames' 
              :value='trajName.value'
              :key='trajName.value'
              >
              {{ trajName.name }}
            </option>
          </select>

        </div>
        <div class='controlsRow' v-if='categories[qIdx].value === "vowel"'>
          <label>Vowel: </label>
          <select 
            name='vowel' 
            v-model='vowels[qIdx]'
            >
            <option 
              v-for='vowel in possibleVowels' 
              :value='vowel'
              >
              {{ vowel }}
            </option>
          </select>
        </div>
        <div class='controlsRow' v-if='isConsonantCategory[qIdx]'>
          <label>Consonant: </label>
          <select 
            name='consonant' 
            v-model='consonants[qIdx]'
            >
            <option 
              v-for='consonant in possibleConsonants' 
              :value='consonant'
              >
              {{ consonant }}
            </option>
          </select>
        </div>
        <div v-for='selObj in selectRowData' :key='selObj.key'>
          <div 
            class='controlsRow' 
            v-if='categories[qIdx].value === selObj.category'
            >
            <label>{{ selObj.label }}</label>
            <select 
              name='category' 
              v-model='selObj.vModelArr[qIdx]'
              >
              <option 
                v-for='option in selObj.options' 
                :value='option'
                >
                {{ option }}
              </option>
            </select>
          </div>
        </div>
        <div class='controlsRow'>
          <label>Designator: </label>
          <select name='designator' v-model='designators[qIdx].value'>
            <option 
              v-for='designator in possibleDesignators(categories[qIdx].value)' 
              :value='designator.value'
              >
              {{ designator.text }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-if='showSaveQueryModal' class='saveQueryModal'>
      <div class='modalRow'>
        <label for='queryTitle'>Query Title:</label>
        <input type='text' v-model='queryTitle' />
        <button @click='saveQuery'>Save</button>
        <button @click='showSaveQueryModal=false'>Cancel</button>
      </div>
    </div>
    <LoadQueryModal 
      v-if='showLoadQueryModal'
      :navHeight='navHeight'
      :transcriptionID='piece._id!'
      @close='showLoadQueryModal=false'
      @loadQuery='loadQuery'
    />
  </div>
</template>

<script lang='ts'>
import phonemes from '@/assets/json/phonemes.json';
import { defineComponent, PropType } from 'vue';
import categoryData from '@/assets/json/categorization.json';
import JSZip from 'jszip';
import { 
  SegmentationType, 
  QueryType, 
  CategoryType,
  DesignatorType,
  MultipleOptionType,
  SecCatType,
  PhraseCatType, 
  PitchNameType,
  ParamType,
  PitchSeqObjType
} from '@shared/types';
import {
  Pitch,
  Raga,
  Trajectory,
  Piece
} from '@/js/classes.ts';
import {
  saveMultiQuery
} from '@/js/serverCalls.ts';
import { Instrument } from '@shared/enums';
import LoadQueryModal from '@/comps/analysis/LoadQueryModal.vue';
type QueryControlsDataType = {
  segmentation: SegmentationType,
  numQueries: number,
  categories: { value: CategoryType, text: string }[],
  designators: { value: DesignatorType, text: string }[],
  trajectoryIDs: number[],
  trajectoryNames: string[],
  vowels: string[],
  consonants: string[],
  possibleSegmentations: { value: SegmentationType, text: string }[],
  all: boolean,
  sequenceLength: number,
  minDur: number,
  maxDur: number,
  pitchNames: PitchNameType[],
  octs: number[],
  Trajectory: typeof Trajectory,
  possibleVowels: string[],
  possibleConsonants: string[],
  numPitches: number[],
  numTrajs: number[],
  pitchSeqObjs: PitchSeqObjType[][],
  trajIdSeqs: number[][],
  sectionTopLevels: SecCatType["Top Level"][],
  alapSections: (keyof SecCatType["Alap"])[],
  topLevelOptions: SecCatType["Top Level"][],
  alapSectionOptions: (keyof SecCatType["Alap"])[],
  compTypeOptions: (keyof SecCatType["Composition Type"])[],
  compSecTempoOptions: (keyof SecCatType["Comp.-section/Tempo"])[],
  talaOptions: (keyof SecCatType["Tala"])[],
  talas: (keyof SecCatType["Tala"])[],
  compTypes: (keyof SecCatType["Composition Type"])[],
  compSecTempos: (keyof SecCatType["Comp.-section/Tempo"])[],
  phraseTypeOptions: (keyof PhraseCatType["Phrase"])[],
  elborationTypeOptions: (keyof PhraseCatType["Elaboration"])[],
  vocalArtTypeOptions: (keyof PhraseCatType["Vocal Articulation"])[],
  instArtTypeOptions: (keyof PhraseCatType["Instrumental Articulation"])[],
  incidentalOptions: (keyof PhraseCatType["Incidental"])[],
  phraseTypes: (keyof PhraseCatType["Phrase"])[],
  elaborationTypes: (keyof PhraseCatType["Elaboration"])[],
  vocalArtTypes: (keyof PhraseCatType["Vocal Articulation"])[],
  instArtTypes: (keyof PhraseCatType["Instrumental Articulation"])[],
  incidentals: (keyof PhraseCatType["Incidental"])[],
  proportionalVertical: boolean,
  showSaveQueryModal: boolean,
  showLoadQueryModal: boolean,
  queryTitle: string,
}

const sectionData = categoryData['Section'];
const phraseData = categoryData['Phrase'];

export default defineComponent({
  name: 'QueryControls',
  data(): QueryControlsDataType {
    return {
      segmentation: 'phrase',
      numQueries: 1,
      categories: [{ value: 'pitch', text: 'Pitch' }],
      designators: [{ value: 'includes', text: 'Includes' }],
      pitchNames: ['Sa'],
      octs: [0],
      trajectoryIDs: [0],
      vowels: ['a'],
      consonants: ['ra'],
      possibleSegmentations: [
        { value: 'phrase', text: 'Phrase' },
        { value: 'group', text: 'Group' },
        { value: 'sequenceOfTrajectories', text: 'Trajectory Sequence' },
        { 
          value: 'connectedSequenceOfTrajectories', 
          text: 'Connected Trajectories' 
        },
      ],
      all: true,
      sequenceLength: 20,
      minDur: 0,
      maxDur: 60,
      trajectoryNames: ['Fixed'],
      Trajectory: Trajectory,
      possibleVowels: phonemes.filter(p => {
        return p.type === 'vowel'
      }).map(p => p.eng_trans),
      possibleConsonants: phonemes.filter(p => {
        return p.type === 'consonant'
      }).map(p => p.iso_15919),
      numPitches: [2],
      numTrajs: [2],
      pitchSeqObjs: [[{ swara: 'Sa', oct: 0 }, { swara: 'Sa', oct: 0 }]],
      trajIdSeqs: [[0, 0]],
      sectionTopLevels: ["Alap"],
      alapSections: ["Alap"],
      compTypes: ["Dhrupad"],
      compSecTempos: ["Vilambit"],
      talas: ["Tintal"],
      topLevelOptions: Object.keys(sectionData) as SecCatType["Top Level"][],
      alapSectionOptions: sectionData['Alap'] as (keyof SecCatType["Alap"])[],
      compTypeOptions: sectionData['Composition']['Composition Type'] as 
        (keyof SecCatType["Composition Type"])[],
      compSecTempoOptions: sectionData['Composition']['Comp.-section/Tempo'] as 
        (keyof SecCatType["Comp.-section/Tempo"])[],
      talaOptions: sectionData['Composition']['Tala'] as 
        (keyof SecCatType["Tala"])[],
      phraseTypeOptions: phraseData['Phrase Type'] as 
        (keyof PhraseCatType["Phrase"])[],
      elborationTypeOptions: phraseData['Elaboration Type'] as 
        (keyof PhraseCatType["Elaboration"])[],
      vocalArtTypeOptions: phraseData['Articulation Type']['Vocal'] as
        (keyof PhraseCatType["Vocal Articulation"])[],
      instArtTypeOptions: phraseData['Articulation Type']['Instrumental'] as
        (keyof PhraseCatType["Instrumental Articulation"])[],
      incidentalOptions: phraseData['Incidental'] as
        (keyof PhraseCatType["Incidental"])[],
      phraseTypes: ['Mohra'],
      elaborationTypes: ['Tan (Sapat)'],
      vocalArtTypes: ['Non-Tom'],
      instArtTypes: ['Bol'],
      incidentals: ['Tuning'],
      proportionalVertical: true,
      showSaveQueryModal: false,
      showLoadQueryModal: false,
      queryTitle: '',
    }
  },

  components: {
    LoadQueryModal
  },

  props: {
    raga: {
      type: Object as PropType<Raga>,
      required: true,
    },

    trajIdxs: {
      type: Array as PropType<number[]>,
      required: true,
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true,
    },
    navHeight: {
      type: Number,
      required: true,
    },
    resultsSize: {
      type: Number,
      required: false,
    },
    instIdx: {
      type: Number,
      required: true,
    }
  },

  watch: {
    numQueries(newVal, oldVal) {
      const params: { param: ParamType[], init: ParamType }[]  = [
        { param: this.categories, init: { value: 'pitch', text: 'Pitch' } },
        { param: this.pitchNames, init: 'Sa' },
        { param: this.octs, init: 0 },
        { 
          param: this.designators, 
          init: { value: 'includes', text: 'Includes' } 
        },
        { param: this.trajectoryNames, init: 'Fixed' },
        { param: this.trajectoryIDs, init: 0 },
        { param: this.numPitches, init: 2 },
        { 
          param: this.pitchSeqObjs, 
          init: [{ swara: 'Sa', oct: 0 }, { swara: 'Sa', oct: 0 }] 
        },
        { param: this.trajIdSeqs, init: [0, 0] },
        { param: this.vowels, init: 'a' },
        { param: this.consonants, init: 'ra' },
        { param: this.sectionTopLevels, init: "Alap" },
        { param: this.alapSections, init: "Alap" },
        { param: this.compTypes, init: "Dhrupad" },
        { param: this.compSecTempos, init: "Vilambit" },
        { param: this.talas, init: "Tintal" },
        { param: this.phraseTypes, init: 'Mohra' },
        { param: this.elaborationTypes, init: 'Tan (Sapat)' },
        { param: this.vocalArtTypes, init: 'Non-Tom' },
        { param: this.instArtTypes, init: 'Bol' },
        { param: this.incidentals, init: 'Tuning' },
      ]
      if (newVal > oldVal) {
        params.forEach(p => {
          this.growParam(p.param, p.init, newVal, oldVal);
        })
      } else {
        params.forEach(p => {
          p.param.splice(newVal, oldVal - newVal);
        })
      }
    }
  },

  mounted() {
    // listener for esc key to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.showSaveQueryModal = false;
        this.showLoadQueryModal = false;
      }
    });
  },

  unmounted() {
    window.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.showSaveQueryModal = false;
        this.showLoadQueryModal = false;
      }
    });
  },

  computed: {

    vocal() {
      const vox = [Instrument.Vocal_M, Instrument.Vocal_F];
      const inst = this.piece.instrumentation[this.instIdx];
      return vox.includes(inst);
    },

    selectRowData() {
      const out: {
        label: string,
        vModelArr: string[],
        options: string[],
        key: number,
        category: CategoryType,
      }[] = [
        {
          label: 'Section Type: ',
          vModelArr: this.sectionTopLevels,
          options: this.topLevelOptions,
          key: 0,
          category: 'sectionTopLevel',
        },
        { 
          label: 'Alap Section: ',
          vModelArr: this.alapSections,
          options: this.alapSectionOptions,
          key: 1,
          category: 'alapSection',
        },
        { 
          label: 'Composition Type: ',
          vModelArr: this.compTypes,
          options: this.compTypeOptions,
          key: 2,
          category: 'compType',
        },
        { 
          label: 'Comp.-section/Tempo: ',
          vModelArr: this.compSecTempos,
          options: this.compSecTempoOptions,
          key: 3,
          category: 'compSecTempo',
        },
        { 
          label: 'Tala: ',
          vModelArr: this.talas,
          options: this.talaOptions,
          key: 4,
          category: 'tala',
        },
        { 
          label: 'Phrase Type: ',
          vModelArr: this.phraseTypes,
          options: this.phraseTypeOptions,
          key: 5,
          category: 'phraseType',
        },
        { 
          label: 'Elaboration Type: ',
          vModelArr: this.elaborationTypes,
          options: this.elborationTypeOptions,
          key: 6,
          category: 'elaborationType',
        },
        { 
          label: 'Incidental: ',
          vModelArr: this.incidentals,
          options: this.incidentalOptions,
          key: 7,
          category: 'incidental',
        },
      ];
      

      if (this.vocal) {
        out.push({
          label: 'Articulation Type: ',
          vModelArr: this.vocalArtTypes ,
          options: this.vocalArtTypeOptions,
          key: 8,
          category: 'vocalArtType',
        })
      } else {
        out.push({
          label: 'Articulation Type: ',
          vModelArr: this.instArtTypes,
          options: this.instArtTypeOptions,
          key: 8,
          category: 'instArtType',
        })
      }
      return out
    },

    trajNames() {
      return this.trajIdxs.map(ti => {
        return { name: Trajectory.names()[ti], value: ti }
      })
    },

    reversedSargamNames() {
      return this.raga.sargamNames.slice().reverse()
    },

    isConsonantCategory() {
      return this.categories.map(cat => {
        return cat.value === 'startingConsonant' || 
          cat.value === 'endingConsonant' || 
          cat.value === 'anyConsonant'
      })
    },

    queries(): QueryType[] {
      return this.categories.map((category, i) => {
        let query: QueryType = {
          category: category.value,
          designator: this.designators[i].value,
          instrumentIdx: this.instIdx
        }
        if (
          category.value === 'startingConsonant' || 
          category.value === 'endingConsonant' || 
          category.value === 'anyConsonant'
          ) {
          query.consonant = this.consonants[i]
        } else if (category.value === 'trajectoryID') {
          query.trajectoryID = this.trajectoryIDs[i]
        } else if (category.value === 'pitch') {
          query.pitch = this.pitches[i]
        } else if (category.value === 'vowel') {
          query.vowel = this.vowels[i]
        } else if (category.value.slice(0, 13) === 'pitchSequence') {
          query.pitchSequence = this.pitchSeqObjs[i].map(p => {
            return new Pitch({ swara: p.swara, oct: p.oct })
          })
        } else if (category.value.slice(0, 12) === 'trajSequence') {
          console.log('this')
          query.trajIdSequence = this.trajIdSeqs[i]
        } else if (category.value === 'sectionTopLevel') {
          query.sectionTopLevel = this.sectionTopLevels[i]
        } else if (category.value === 'alapSection') {
          query.alapSection = this.alapSections[i]
        } else if (category.value === 'compType') {
          query.compType = this.compTypes[i]
        } else if (category.value === 'compSecTempo') {
          query.compSecTempo = this.compSecTempos[i]
        } else if (category.value === 'tala') {
          query.tala = this.talas[i]
        } else if (category.value === 'phraseType') {
          query.phraseType = this.phraseTypes[i]
        } else if (category.value === 'elaborationType') {
          query.elaborationType = this.elaborationTypes[i]
        } else if (category.value === 'vocalArtType') {
          query.vocalArtType = this.vocalArtTypes[i]
        } else if (category.value === 'instArtType') {
          query.instArtType = this.instArtTypes[i]
        } else if (category.value === 'incidental') {
          query.incidental = this.incidentals[i]
        }
        return query
      })
    },

    options(): MultipleOptionType {
      return {
        segmentation: this.segmentation,
        sequenceLength: this.sequenceLength,
        minDur: this.minDur,
        maxDur: this.maxDur,
        every: this.all,
        instrumentIdx: this.instIdx
      }
    },


    possibleCategories(): { value: CategoryType, text: string }[] {
      const cats: { value: CategoryType, text: string }[] = [
        { value: 'pitch', text: 'Pitch' },
        { value: 'pitchSequenceStrict', text: 'Strict Pitch Sequence'},
        { value: 'pitchSequenceLoose', text: 'Loose Pitch Sequence' },
        { value: 'trajectoryID', text: 'Trajectory' },
        { value: 'trajSequenceStrict', text: 'Strict Trajectory Sequence' },
        { value: 'trajSequenceLoose', text: 'Loose Traj Sequence' },
        
      ];
      if (
        this.segmentation !== 'sequenceOfTrajectories' && 
        this.segmentation !== 'connectedSequenceOfTrajectories'
        ) {
        cats.push(
          { value: 'sectionTopLevel', text: 'Section Type' },
          { value: 'alapSection', text: 'Alap Section' },
          { value: 'compType', text: 'Composition Type' },
          { value: 'compSecTempo', text: 'Comp.-section/Tempo' },
          { value: 'tala', text: 'Tala' },
          { value: 'phraseType', text: 'Phrase Type' },
          { value: 'elaborationType', text: 'Elaboration Type' },
          { value: 'incidental', text: 'Incidental' }
        )
        if (this.vocal) {
          cats.push({ value: 'vocalArtType', text: 'Articulation Type' })
        } else {
          cats.push({ value: 'instArtType', text: 'Articulation Type' })
        }
      }
      if (this.vocal) {
        cats.push(
          { value: 'vowel', text: 'Vowel' },
          { value: 'startingConsonant', text: 'Starting Consonant' },
          { value: 'endingConsonant', text: 'Ending Consonant' },
          { value: 'anyConsonant', text: 'Any Consonant' },
        )
      }
      return cats;
    },

    pitches(): Pitch[] {
      return this.pitchNames.map((pitchName, i) => {
        return new Pitch({swara: pitchName, oct: this.octs[i]})
      })
    }
  },

  methods: {

    async downloadSegmentDisplays() {
      const jsZip = new JSZip();
      const svgEls = document.querySelectorAll('svg');
      for (let i = 0; i < svgEls.length; i++) {
        const el = svgEls[i];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const data = (new XMLSerializer()).serializeToString(el);
        const DOMURL = window.URL || window.webkitURL || window;
        const img = new Image();
        const svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        const url = DOMURL.createObjectURL(svg);

        await new Promise<void>((resolve) => {
          img.onload = () => {
            const scaleFactor = 2;
            const borderSize = 10;
            canvas.width = (img.width + 2 * borderSize) * scaleFactor;
            canvas.height = (img.height + 2 * borderSize) * scaleFactor;
            ctx!.fillStyle = 'white';
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
            ctx!.scale(scaleFactor, scaleFactor);
            ctx!.drawImage(img, borderSize, borderSize);
            DOMURL.revokeObjectURL(url);
            canvas.toBlob((blob) => {
              jsZip.file(`${i}.png`, blob!);
              resolve();
            }, 'image/png');
          };
          img.src = url;
        });
      }

      const content = await jsZip.generateAsync({ type: 'blob' });
      const fileName = 'queryResults.zip';
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(content);
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


      
    },

    async saveQuery() {
      try {
        const id = this.piece._id!;
        const userID = this.$store.state.userID!;
        await saveMultiQuery(this.queryTitle, userID, id, this.queries, this.options);
        this.showSaveQueryModal = false;
      } catch (err) {
        console.error(err);
      }
    },

    async loadQuery(queries: QueryType[], options: MultipleOptionType) {
      const pitchNames: PitchNameType[] = [
        'Sa', 're', 'Re', 'ga', 'Ga', 'ma', 'Ma', 'Pa', 'dha', 'Dha', 'ni', 'Ni'
      ]
      this.numQueries = queries.length;
      await this.$nextTick();
      queries.forEach((q, qIdx) => {
        if (qIdx === 0) {
          this.$emit('update:instIdx', q.instrumentIdx);
        }
        this.categories[qIdx] = { value: q.category, text: q.category }
        this.designators[qIdx] = { value: q.designator, text: q.designator }
        if (q.consonant) {
          this.consonants[qIdx] = q.consonant
        } else if (q.pitch) {
          const pitch = new Pitch(q.pitch);
          const chroma = pitch.chroma;
          this.pitchNames[qIdx] = pitchNames[chroma];
          this.octs[qIdx] = pitch.oct;
        } else if (q.trajectoryID) {
          this.trajectoryIDs[qIdx] = q.trajectoryID
        } else if (q.pitchSequence) {
          this.numPitches[qIdx] = q.pitchSequence.length
          this.pitchSeqObjs[qIdx] = q.pitchSequence.map(p => {
            const pitch = new Pitch(p);
            const chroma = pitch.chroma;
            return { swara: pitchNames[chroma], oct: p.oct }
          })
        } else if (q.trajIdSequence) {
          this.numTrajs[qIdx] = q.trajIdSequence.length
          this.trajIdSeqs[qIdx] = q.trajIdSequence
        } else if (q.sectionTopLevel) {
          this.sectionTopLevels[qIdx] = q.sectionTopLevel
        } else if (q.alapSection) {
          this.alapSections[qIdx] = q.alapSection
        } else if (q.compType) {
          this.compTypes[qIdx] = q.compType
        } else if (q.compSecTempo) {
          this.compSecTempos[qIdx] = q.compSecTempo
        } else if (q.tala) {
          this.talas[qIdx] = q.tala
        } else if (q.phraseType) {
          this.phraseTypes[qIdx] = q.phraseType
        } else if (q.elaborationType) {
          this.elaborationTypes[qIdx] = q.elaborationType
        } else if (q.vocalArtType) {
          this.vocalArtTypes[qIdx] = q.vocalArtType
        } else if (q.instArtType) {
          this.instArtTypes[qIdx] = q.instArtType
        } else if (q.incidental) {
          this.incidentals[qIdx] = q.incidental
        }
      })
      this.segmentation = options.segmentation!;
      this.sequenceLength = options.sequenceLength!;
      this.minDur = options.minDur!;
      this.maxDur = options.maxDur!;
      this.all = options.every!;
      this.runQuery();
      this.showLoadQueryModal = false;
    },

    updateProportionalVertical() {
      console.log(this.proportionalVertical)
      this.$emit('updateProportionalVertical', this.proportionalVertical)
    },

    possibleDesignators(category: CategoryType) {
      const out: { value: DesignatorType, text: string }[] = [
        { value: 'includes', text: 'Includes' },
        { value: 'excludes', text: 'Excludes' },
      ];
      if (category !== 'sectionTopLevel') {
        out.push(
          { value: 'startsWith', text: 'Starts With' },
          { value: 'endsWith', text: 'Ends With' }
        )
      }
      return out;
    },

    updateNumPitches(qIdx: number) {
      const n = this.numPitches[qIdx];
      const oldLen = this.pitchSeqObjs[qIdx].length;
      if (n > oldLen) {
        const init = { swara: 'Sa', oct: 0 } as ParamType;
        this.growParam(this.pitchSeqObjs[qIdx], init, n, oldLen);
      } else {
        this.pitchSeqObjs[qIdx].splice(n, oldLen - n);
      }
    },

    updateNumTrajs(qIdx: number) {
      const n = this.numTrajs[qIdx];
      const oldLen = this.trajIdSeqs[qIdx].length;
      if (n > oldLen) {
        this.growParam(this.trajIdSeqs[qIdx], 0, n, oldLen);
      } else {
        this.trajIdSeqs[qIdx].splice(n, oldLen - n);
      }
    },

    growParam(param: ParamType[], preset: ParamType, nV: number, oV: number) {
      let add = [];
      if (preset instanceof Object) {
        add = Array.from({ length: nV - oV }, () => ({ ...preset }));
      } else {
        add = Array(nV - oV).fill(preset);
      }
      param.splice(oV, 0, ...add);
    },

    runQuery() {
      this.$emit('runQuery', this.queries, this.options)
    },

    range(start: number, end: number, reverse: boolean = false) {
      let out = Array(end - start).fill(0).map((_, idx) => start + idx);
      if (reverse) {
        out.reverse();
      }
      return out;
    },

    preventDecimal(event: KeyboardEvent) {
      if (event.key === '.') {
        event.preventDefault();
      }
    },

    updateTrajectoryID(tIdx: number) {
      const nIdx = Trajectory.names().indexOf(this.trajectoryNames[tIdx]);
      this.trajectoryIDs[tIdx] = nIdx;
    }
  }
})


</script>
<style scoped>

.controlsOuter {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.controlsBox {
  width: 350px;
  min-width: 350px;
  height: 100%;
  /* background-color: green; */
  box-sizing: border-box;
  border-right: 1px solid white;
  display: flex;
  flex-direction: column;
}

.primary {
  width: 300px;
  min-width: 300px
}

.controlsRow {
  width: 100%;
  height: 40px;
  min-height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}

.controlsRow.big {
  height: 100px;
  min-height: 40px;
  /* min-height: 100px; */
}

.controlsRow.title {
  justify-content: center
}

.controlsRow > button {
  margin-left: 10px;
}

.controlsRow.dur > input {
  width: 40px;
  min-width: 40px;
  outline: none;
  user-select: none;
}

.everySome {
  margin-right: 2px;
}

select {
  color: white;
  background-color: black;
  outline: none
}

.numQueries {
  width: 40px;
  min-width: 40px;
  outline: none;
  user-select: none;
}

label {
  margin-right: 10px;
  margin-left: 10px;
}

.queriesContainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  overflow: auto;
  /* background-color: red; */
}

.queriesContainer::-webkit-scrollbar {
  display: none;
}

.pitchOct {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50px;
  max-width: 50px;
}

.pitchOct > select {
  width: 40px;
  min-width: 40px;
  outline: none;
  user-select: none;
}

.seqCol {
  display: flex;
  flex-direction: column;
}

.saveQueryModal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  background-color: lightgray;
  width: 450px;
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
}

.modalRow > label {
  color: black;
  margin: 0;
}

.modalRow > input {
  width: 200px;
}

.modalRow > button:hover {
  cursor: pointer;
} 

.modalRow {
  width: 95%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}
</style>
