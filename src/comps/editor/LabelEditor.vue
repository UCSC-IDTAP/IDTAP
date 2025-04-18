<template>
  <div class='outerBox'>
    <div class='hierarchyPicker'>
      <label>{{ `Track ${editingInstIdx + 1}: ${piece.instrumentation[editingInstIdx]}`}}</label>
      <label>
        <input type='radio' value='Section' v-model='selectedHierarchy'/>
        Section
      </label>
      <label>
        <input type='radio' value='Phrase' v-model='selectedHierarchy'/>
        Phrase
      </label>
      <div class='verticalDivider'></div>
      <label>
        <input type='radio' :value='LabelScheme.Structured' v-model='labelScheme'/>
        {{LabelScheme.Structured}}
      </label>
      <label>
        <input type='radio' :value='LabelScheme.AdHoc' v-model='labelScheme'/>
        {{LabelScheme.AdHoc}}
      </label>

    </div>
    <div 
      class='sectionLabelHolder' 
      v-show='selectedHierarchy === "Section"'
      ref='sectionLabelHolder'>
      <SectionLabelEditor 
      v-for='(section, i) in piece.sectionsGrid[editingInstIdx]'
        :sNum='i'
        :piece='piece'
        :editable='editable'
        :editingInstIdx='editingInstIdx'
        :section='section'
        :labelScheme='labelScheme'
        @unsavedChanges='$emit("unsavedChanges")'
        @dblclick='goToSection($event, i)'
        ref='sectionLabelEditors'
        :key='i'
      />
    </div>
    <div 
      class='phraseLabelHolder' 
      v-show='selectedHierarchy === "Phrase"'
      ref='phraseLabelHolder'
      >
      <PhraseLabelEditor 
      v-for='(phrase, i) in piece.phraseGrid[editingInstIdx]'
      @dblclick='goToPhrase($event, i)'
      :phraseNum='i'
      :vocal='vocal'
      :piece='piece'
      :editable='editable'
      :editingInstIdx='editingInstIdx'
      @unsavedChanges='$emit("unsavedChanges")'
      ref='phraseLabelEditors'
      />
    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import SectionLabelEditor from '@/comps/editor/SectionLabelEditor.vue';
import PhraseLabelEditor from '@/comps/editor/PhraseLabelEditor.vue';
import { Piece } from '@/js/classes.ts'
import { LabelScheme } from '@/ts/enums.ts'

export default defineComponent({
  name: 'LabelEditor',
  data() {
    return {
      selectedHierarchy: 'Section',
      LabelScheme,
      labelScheme: LabelScheme.Structured
    }
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
    editable: {
      type: Boolean,
      required: true
    }, 
    piece: {
      type: Object as PropType<Piece>,
      required: true
    },
    vocal: {
      type: Boolean,
      required: true
    },
    editingInstIdx: {
      type: Number,
      required: true
    }
  },
  components: {
    SectionLabelEditor,
    PhraseLabelEditor
  },
  methods: {
    goToPhrase(e: MouseEvent, pIdx: number) {
      this.$emit('goToPhraseEmit', pIdx);
    },

    goToSection(e: MouseEvent, sIdx: number) {
      this.$emit('goToSectionEmit', sIdx);
    },

    scrollToPhrase(pIdx: number) {
      this.selectedHierarchy = 'Phrase';
      const pLabelEditors = this.$refs.phraseLabelEditors as 
        typeof PhraseLabelEditor[];
      const pLabelEditor = pLabelEditors[pIdx];
      this.$nextTick(() => {
        const container = this.$refs.phraseLabelHolder as HTMLElement;
        container.scrollTo({
          left: pLabelEditor.$el.offsetLeft,
          // behavior: 'smooth'
        })
      })
      

    },

    scrollToSection(sIdx: number) {
      this.selectedHierarchy = 'Section';
      const sLabelEditors = this.$refs.sectionLabelEditors as 
        typeof SectionLabelEditor[];
      const sLabelEditor = sLabelEditors[sIdx];
      const container = this.$refs.sectionLabelHolder as HTMLElement;
      container.scrollTo({
        left: sLabelEditor.$el.offsetLeft,
        // behavior: 'smooth'
      })
    }
  }
});

</script>


<style scoped>

.outerBox {
  background-color: #202621;
  height: v-bind(height + 'px');
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  color: white;
  z-index: -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
}

.hierarchyPicker {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.hierarchyPicker > label {
  margin-left: 10px;
  margin-right: 10px;
}

.sectionLabelHolder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  overflow-x: scroll;
  box-sizing: border-box;
}

.phraseLabelHolder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  overflow-x: scroll;
  box-sizing: border-box;
}

.verticalDivider {
  width: 1px;
  height: 24px;
  background-color: #fff;
  margin: 0 10px;
}

</style>
