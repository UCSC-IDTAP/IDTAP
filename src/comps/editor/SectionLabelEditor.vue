<template>
  <div class='outerSecLabel'>
    <div class='topRow'>
      <label>
      {{`Section ${sNum + 1}`  }}
      </label>
    </div>
    <div class='middleRow' v-if='labelScheme === LabelScheme.Structured'>
      <select 
        v-model='topLevel' 
        @change='updateTopLevel' 
        @keydown='preventSpaceSelect'
        :disabled='!editable'
        >
        <option v-for='option in topLevelOptions' :value='option'>
          {{option}}
        </option>
      </select>
    </div>
    <div class='bottomContainer' v-if='labelScheme === LabelScheme.Structured'>
      <div class='checkColumn' v-if='topLevel === "Alap"'>
        <div class='titleRow'>
          <label>Alap Section</label>
        </div>
        <select 
          v-model='alapType' 
          @change='updateAlapType'
          @keydown='preventSpaceSelect'
          :disabled='!editable'
          >
          <option 
            v-for='option in Object.keys(section.categorization["Alap"])' 
            :value='option'
            >
            {{option}}
          </option>
        </select>
      </div>
      <div class='selectComposition' v-if='topLevel === "Composition"'>
        <div class='checkColumn'>
          <div class='titleRow'>
            <label>Composition Type</label>
          </div>
          <select 
            v-model='compositionType' 
            @change='updateCompositionType'
            @keydown='preventSpaceSelect'
            :disabled='!editable'
            >
            <option 
              v-for='option in 
                Object.keys(section.categorization["Composition Type"])' 
              :value='option'
              >
              {{option}}
            </option>
          </select>
        </div>
        <div class='checkColumn'>
          <div class='titleRow'>
            <label>Section/Tempo</label>
          </div>
          <select 
            v-model='section_tempo' 
            @change='updateSection_Tempo'
            @keydown='preventSpaceSelect'
            :disabled='!editable'
            >
            <option 
              v-for='option in 
                Object.keys(section.categorization["Comp.-section/Tempo"])' 
              :value='option'
              >
              {{option}}
            </option>
          </select>
        </div>
        <div class='checkColumn'>
          <div class='titleRow'>
            <label>Tala</label>
          </div>
          <select 
            v-model='tala' 
            @change='updateTala' 
            @keydown='preventSpaceSelect'
            :disabled='!editable'
            >
            <option 
              v-for='option in Object.keys(section.categorization["Tala"])' 
              :value='option'
              >
              {{option}}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-if="labelScheme === LabelScheme.AdHoc" class="adhoc-wrapper">
      <div class="adhoc-list">
        <div
          v-for="(field, idx) in adHocFields"
          :key="idx"
          class="adhoc-field"
        >
          <input
            type="text"
            v-model="adHocFields[idx]"
            :placeholder="`Label ${idx + 1}`"
            :disabled="!editable"
            @keydown.stop
            @input='updateAdHocField(idx)'
          />
        </div>
      </div>
      <div class="adhoc-controls">
        <button
          type="button"
          @click="removeLastAdHocField"
          :disabled="adHocFields.length === 1"
        >-</button>
        <button type="button" @click="addAdHocField">+</button>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { Piece, initSecCategorization, Section } from '@/js/classes.ts';
import { LabelScheme } from '@/ts/enums.ts';
type topLevelOptionsType = (
  'Pre-Chiz Alap' | 
  'Alap' | 
  'Composition' | 
  'None' |
  'Improvisation' |
  'Other'
  );

type Section_TempoType = keyof Section['categorization']['Comp.-section/Tempo'];
type CompositionType = keyof Section['categorization']['Composition Type'];
type TalaType = keyof Section['categorization']['Tala'];
type AlapType = keyof Section['categorization']['Alap'];

type SectionLabelEditorType = {
  topLevelOptions: topLevelOptionsType[],
  topLevel: topLevelOptionsType,
  compositionType?: CompositionType,
  section_tempo?: Section_TempoType,
  tala?: TalaType,
  alapType?: AlapType,
  LabelScheme: typeof LabelScheme,
  adHocFields: string[],
}

export default defineComponent({
  name: 'SectionLabelEditor',
  data(): SectionLabelEditorType {
    return {
      topLevelOptions: [
        'Pre-Chiz Alap',
        'Alap',
        'Composition',
        'Improvisation',
        'Other',
        'None'
      ],
      topLevel: 'None',
      compositionType: undefined,
      section_tempo: undefined,
      tala: undefined,
      alapType: undefined,
      LabelScheme,
      adHocFields: ['']
    }
  },
  props: {
    sNum: {
      type: Number,
      required: true
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    section: {
      type: Object as PropType<Section>,
      required: true
    },
    editable: {
      type: Boolean,
      required: true
    },
    editingInstIdx: {
      type: Number,
      required: true
    },
    labelScheme: {
      type: Object as PropType<LabelScheme>,
      required: true
    }
  },

  mounted() {
    this.updateFromSectionProp();
    // this.adHocFields = this.piece.adHocSectionCatGrid[this.editingInstIdx][this.sNum];

  },

  watch: {
    section() {
      this.updateFromSectionProp();
    },

    editingInstIdx() {
      this.adHocFields = this.piece.adHocSectionCatGrid[this.editingInstIdx][this.sNum];
    }
  },

  methods: {

    updateAdHocField(idx: number) {
      while (this.piece.adHocSectionCatGrid[this.editingInstIdx].length <= this.sNum) {
        this.piece.adHocSectionCatGrid[this.editingInstIdx].push([]);
      }
      while (idx >= this.adHocFields.length) {
        this.piece.adHocSectionCatGrid[this.editingInstIdx][this.sNum].push('');
      }
      this.piece.adHocSectionCatGrid[this.editingInstIdx][this.sNum][idx] = this.adHocFields[idx];
      this.$emit('unsavedChanges');
    },

    addAdHocField() {
      this.adHocFields.push('');
    },
    removeLastAdHocField() {
      if (this.adHocFields.length > 1) {
        this.adHocFields.pop();
        this.piece.adHocSectionCatGrid[this.editingInstIdx][this.sNum].pop();
        this.$emit('unsavedChanges');
      }
    },

    updateFromSectionProp() {
      const cat = this.section.categorization;
      const com = cat['Composition Type'];
      const comSecTemp = cat['Comp.-section/Tempo'];
      const tala = cat['Tala'];
      const improv = cat['Improvisation'];
      const other = cat['Other'];
      const someTrue = (obj: object) => Object.values(obj).some(x => x);
      if (cat['Pre-Chiz Alap']['Pre-Chiz Alap']) {
        this.topLevel = 'Pre-Chiz Alap'
      } else if (someTrue(cat['Alap'])) {
        this.topLevel = 'Alap';
        const keys = Object.keys(cat['Alap']) as AlapType[];
        this.alapType = keys.find(key => cat['Alap'][key]);
      } else if (someTrue(com) || someTrue(comSecTemp) || someTrue(tala)) {
        this.topLevel = 'Composition';
        const comKeys = Object.keys(com) as CompositionType[];
        this.compositionType = comKeys.find(key => com[key]);
        const comSecTempKeys = Object.keys(comSecTemp) as Section_TempoType[];
        this.section_tempo = comSecTempKeys.find(key => comSecTemp[key]);
        const talaKeys = Object.keys(tala) as TalaType[];
        this.tala = talaKeys.find(key => tala[key]);
      } else if (improv['Improvisation']) {
        this.topLevel = 'Improvisation'
      } else if (other['Other']) {
        this.topLevel = 'Other'
      } else {
        this.topLevel = 'None'
      }
      if (cat['Top Level'] !== undefined) {
        this.topLevel = cat['Top Level'];
      }
      this.adHocFields = this.section.adHocCategorization;
      if (this.adHocFields.length === 0) {
        this.adHocFields = [''];
      }
    },

    preventSpaceSelect(e?: KeyboardEvent) {
      if (e) {
        if (e.key === ' ') {
          e.preventDefault();
        }
      }
    },

    updateTopLevel() {
      this.compositionType = undefined,
      this.section_tempo = undefined,
      this.section.categorization = initSecCategorization();
      this.piece.sectionCatGrid[this.editingInstIdx][this.sNum] = initSecCategorization();

      if (this.topLevel === 'Pre-Chiz Alap') {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        cat['Pre-Chiz Alap']['Pre-Chiz Alap'] = true;
        altCat['Pre-Chiz Alap']['Pre-Chiz Alap'] = true;
      } else if (this.topLevel === 'Improvisation') {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        cat['Improvisation']['Improvisation'] = true;
        altCat['Improvisation']['Improvisation'] = true;
      } else if (this.topLevel === 'Other') {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        cat['Other']['Other'] = true;
        altCat['Other']['Other'] = true;
      }
      this.section.categorization['Top Level'] = this.topLevel;
      this.piece.sectionCatGrid[this.editingInstIdx][this.sNum]['Top Level'] = this.topLevel;
      this.$emit('unsavedChanges');
    },
    updateCompositionType() {
      if (this.compositionType) {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        const allKeys = Object.keys(cat['Composition Type']) as 
          CompositionType[];
        allKeys.forEach(key => cat['Composition Type'][key] = false);
        cat['Composition Type'][this.compositionType] = true;
        altCat['Composition Type'][this.compositionType] = true;
      }
      this.$emit('unsavedChanges');
    },
    updateSection_Tempo() {
      if (this.section_tempo) {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        const allKeys = Object.keys(cat['Comp.-section/Tempo']) as 
          Section_TempoType[];
        allKeys.forEach(key => cat['Comp.-section/Tempo'][key] = false);
        cat['Comp.-section/Tempo'][this.section_tempo] = true;
        altCat['Comp.-section/Tempo'][this.section_tempo] = true;
      }
      this.$emit('unsavedChanges');
    },
    updateTala() {
      if (this.tala) {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        const allKeys = Object.keys(cat['Tala']) as TalaType[];
        allKeys.forEach(key => cat['Tala'][key] = false);
        cat['Tala'][this.tala] = true;
        altCat['Tala'][this.tala] = true;
      }
      this.$emit('unsavedChanges');
    },
    updateAlapType() {
      if (this.alapType) {
        const cat = this.section.categorization;
        const altCat = this.piece.sectionCatGrid[this.editingInstIdx][this.sNum];
        const allKeys = Object.keys(cat['Alap']) as AlapType[];
        allKeys.forEach(key => cat['Alap'][key] = false);
        cat['Alap'][this.alapType] = true;
        altCat['Alap'][this.alapType] = true;
      }
      this.$emit('unsavedChanges');
    }
  }
})
</script>

<style scoped>

.outerSecLabel {
  background-color: #202621;
  box-sizing: border-box;
  width: 420px;
  min-width: 420px;
  border: 1px solid black;
  border-left: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  
}

.topRow {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size:18px;
}

.topRow > select {
  margin-left: 10px;
}

.bottomContainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  overflow-y: auto;
  margin-bottom: 10px;
  scrollbar-width: none;
}

.checkColumn {
  width: 150px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
}

.checkRow {
  width: 100%;
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.checkRow > label {
  margin-left: 5px;
}

select {
  width: 120px;

  outline: none
}

.selectAlap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  /* padding-top: 10px; */
}

.selectAlap > select {
  margin-top: 5px;
}

.titleRow {
  width: 100%;
  min-height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.selectComposition {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

select:disabled {
  color: black;
}

.adhoc-field {
  overflow-y: auto;
  max-height: 100px;
}

.adhoc-wrapper {
   display: flex;
   flex-direction: column;
   flex: 1 1 auto;
   width: 100%;
   min-height: 0;
}

.adhoc-list {
   flex: 1 1 auto;
   overflow-y: auto;
   width: 100%;
   min-height: 0;
}

.adhoc-controls {
   display: flex;
   justify-content: center;
   margin: 5px 0;
   flex: 0 0 auto;
}
</style>
