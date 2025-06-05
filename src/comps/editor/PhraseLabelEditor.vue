<template>
  <div class='outerPhraseLabel'>
    <div class='topRow'>
      {{`Phrase ${phraseNum + 1}`  }}
    </div>
    <div class='bottomContainer' v-if='labelScheme === LabelScheme.Structured'>
      <div class='checkColumn'>
        <div class='titleRow'>
          <label>Phrase Type</label>
        </div>
        <div class='checkRow' v-for='(phraseType, ptIdx) in phraseTypes'>
          <input 
            type='checkbox' 
            :id='phraseType + "p" + phraseNum + "idx" + ptIdx' 
            :name='phraseType' 
            :value='phraseType'
            v-model='phrase.categorizationGrid[0].Phrase[phraseType]'
            @change='$emit("unsavedChanges")'
            :disabled='!editable'
            >
          <label :for='phraseType + "p" + phraseNum + "idx" + ptIdx'>
            {{phraseType}}
          </label>
        </div>
      </div>
      <div class='checkColumn'>
        <div class='titleRow'>
          <label>Elaboration Type</label>
        </div>
        <div 
          class='checkRow' 
          v-for='(elaborationType, etIdx) in elaborationTypes'
          >
          <input 
            type='checkbox' 
            :id='elaborationType + "p" + phraseNum + "idx" + etIdx' 
            :name='elaborationType' 
            :value='elaborationType'
            v-model='phrase.categorizationGrid[0].Elaboration[elaborationType]'
            @change='$emit("unsavedChanges")'
            :disabled='!editable'
            >
          <label :for='elaborationType + "p" + phraseNum + "idx" + etIdx'>
            {{elaborationType}}
          </label>
        </div>
      </div>
      <div class='checkColumn' v-if='vocal'>
        <div class='titleRow'>
          <label>Articulation Type</label>
        </div>
        <div 
          class='checkRow'
          v-for='(vArt, vaIdx) in vocalArtTypes'
          >
          <input 
            type='checkbox' 
            :id='vArt + "p" + phraseNum + "idx" + vaIdx' 
            :name='vArt' 
            :value='vArt'
            v-model='phrase.categorizationGrid[0]["Vocal Articulation"][vArt]'
            @change='$emit("unsavedChanges")'
            :disabled='!editable'
            >
          <label :for='vArt + "p" + phraseNum + "idx" + vaIdx' >
            {{vArt}}
          </label>
        </div>
      </div>
      <div class='checkColumn' v-else>
        <div class='titleRow'>
          <label>Articulation Type</label>
        </div>
        <div 
          class='checkRow'
          v-for='(iArtType, iaIdx) in instrumentalArtTypes'
          >
          <input 
            type='checkbox' 
            :id='iArtType + "p" + phraseNum + "idx" + iaIdx' 
            :name='iArtType' 
            :value='iArtType'
            v-model='iArtModelPath[iArtType]'
            @change='$emit("unsavedChanges")'
            :disabled='!editable'
            
            >
          <label :for='iArtType + "p" + phraseNum + "idx" + iaIdx'>
            {{iArtType}}
          </label>
        </div>
      </div>
      <div class='checkColumn'>
        <div class='titleRow'>
          <label>Incidental</label>
        </div>
        <div class='checkRow' v-for='(incType, itIdx) in incidentalTypes'>
          <input 
            type='checkbox' 
            :id='incType + "p" + phraseNum + "idx" + itIdx' 
            :name='incType' 
            :value='incType'
            v-model='phrase.categorizationGrid[0].Incidental[incType]'
            @change='$emit("unsavedChanges")'
            :disabled='!editable'
            >
          <label :for='incType + "p" + phraseNum + "idx" + itIdx'>
            {{incType}}
          </label>
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
            @click.capture.stop
            @dblclick.capture.stop
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
import { Piece, Phrase } from '@model';
import { PhraseCatType } from '@shared/types';
import { LabelScheme } from '@shared/enums';
import categoryData from '@/assets/json/categorization.json';
const phraseData = categoryData['Phrase'];
const articulationTypes = phraseData['Articulation Type'];

type PhraseLabelEditorDataType = {
  phraseTypes: PPhraseType[],
  elaborationTypes: PElaborationType[],
  vocalArtTypes: PVArtType[],
  instrumentalArtTypes: PIArtType[],
  incidentalTypes: PIncidentalType[],
  LabelScheme: typeof LabelScheme,
  adHocFields: string[],
}

type PPhraseType = keyof PhraseCatType['Phrase'];
type PElaborationType = keyof PhraseCatType['Elaboration'];
type PVArtType = keyof PhraseCatType['Vocal Articulation'];
type PIArtType = keyof PhraseCatType['Instrumental Articulation'];
type PIncidentalType = keyof PhraseCatType['Incidental'];



export default defineComponent({
  name: 'PhraseLabelEditor',
  computed: {
    iArtModelPath() {
      const cat = this.phrase.categorizationGrid[0];
      return cat['Instrumental Articulation'];
    },
    phrase() {
      return this.piece.phraseGrid[this.editingInstIdx][this.phraseNum];
    }
  },
  data(): PhraseLabelEditorDataType {
    return {
      phraseTypes: phraseData['Phrase Type'] as PPhraseType[],
      elaborationTypes: phraseData['Elaboration Type'] as PElaborationType[],
      vocalArtTypes: articulationTypes['Vocal'] as PVArtType[],
      instrumentalArtTypes: articulationTypes['Instrumental'] as PIArtType[],
      incidentalTypes: phraseData['Incidental'] as PIncidentalType[],
      LabelScheme,
      adHocFields: ['']
    }
  },
  mounted() {
    this.adHocFields = this.phrase.adHocCategorizationGrid;
    if (this.adHocFields.length === 0) {
      this.adHocFields.push('');
    }
  },
  props: {
    phraseNum: {
      type: Number,
      required: true
    },
    vocal: {
      type: Boolean,
      required: true
    },
    piece: {
      type: Object as PropType<Piece>,
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
  methods: {
    updateAdHocField(idx: number) {
      while (idx >= this.phrase.adHocCategorizationGrid.length) {
        this.phrase.adHocCategorizationGrid.push('');
      }
      this.phrase.adHocCategorizationGrid[idx] = this.adHocFields[idx];
      this.$emit('unsavedChanges');
    },
    addAdHocField() {
      this.adHocFields.push('')
    },
    removeLastAdHocField() {
      if (this.adHocFields.length > 1) {
        this.adHocFields.pop();
        this.phrase.adHocCategorizationGrid.pop();
        this.$emit('unsavedChanges');
      }
    }
  }
})
</script>

<style scoped>

.outerPhraseLabel {
  background-color: #202621;
  box-sizing: border-box;
  width: 650px;
  min-width: 650px;
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

.titleRow {
  width: 100%;
  min-height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  font-weight: bold;
}

.titleRow > label {
  margin-left: 5px;
}
</style>
