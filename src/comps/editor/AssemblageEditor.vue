<template>
	<div class="assemblageOuter">
    <div class='col'>
      <div class='creator top'>
        <select 
          :disabled="piece.assemblages.length === 0"
          v-model='selectedAssemblage'
          >
          <option 
            v-for="assemblage in piece.assemblages" 
            :key="assemblage.id" 
            :value="assemblage.id"
            >
            {{ assemblage.name }}
          </option>
        </select>
        <button @click='deleteAssemblage' :disabled="!selectedAssemblage">
          Delete Assemblage
        </button>
      </div>
      <div class='creator'>
        <input 
          type="text" 
          placeholder="Assemblage Name" 
          v-model="assemblageName" 
          @keydown='handleKeydown($event)'
        />
        <button @click=createAssemblage>
          Create Assemblage
        </button>
      </div>
    </div>
    <div class='col' v-if='selectedAssemblage'>
      <div class='title'>
        <span>
          {{ 
          selectedAssemblageName === '' ?
          '' :
          'Assemblage: ' + selectedAssemblageName
          }}
        </span>
      </div>
      <div class='colSection'>
        <input 
          type='text'
          placeholder='Strand Name'
          v-model='newStrandName'
          @keydown='handleKeydown($event)'
        />
        <button 
          @click='createStrand'
          :disabled='!selectedAssemblage'
        >
          Add Strand
        </button>
      </div>
    </div>
    <div 
      class='col'
      v-if='selectedAssemblageObj'
      v-for='strand in selectedAssemblageObj.strands'
      :key='strand.id'
      >
      <div class='title'>
        <span>{{ "Strand: " + strand.label }}</span>
      </div>
      <div class='strandSection' v-if='!editorSelectedPhrase || editorSelectedPhraseStrandId === strand.id'>
        <button
          @click='addPhrase(strand.id)'
          :disabled='editorSelectedPhrase !== null && editorSelectedPhraseStrandId === strand.id'
        >
          Add Phrase
        </button>
        <button 
          @click='deleteStrand(strand.id)'
          :disabled='editorSelectedPhrase !== null && editorSelectedPhraseStrandId === strand.id'
        >Delete Strand</button>
      </div>
      <div class='strandSection' v-else>
        <button
          @click='moveToStrand(editorSelectedPhrase, strand.id)'
        >
        Move to Strand
        </button>
      </div>
      <div class="phraseList">
        <div
          v-for="phrase in strand.phrases.slice().sort((a, b) => a.pieceIdx! - b.pieceIdx!)"
          :key="phrase.uniqueId"
          :class="['phraseItem', 'phrase-' + phrase.uniqueId]"
          @click='editorSelectPhrase(phrase)'
        >
          {{ `Phrase ${phrase.pieceIdx! + 1}` }}
        </div>
      </div>
    </div>
    <div class='col' v-if='selectedAssemblageObj'>
      <div class='title'>
        <span>Loose Phrases</span>
      </div>
      <div class='strandSection' v-if='!editorSelectedPhrase || editorSelectedPhraseStrandId === undefined'>
        <button
        @click='addPhrase()'
        >
          Add Loose Phrase
        </button>
      </div>
      <div class='strandSection' v-else>
        <button
          @click='moveToStrand(editorSelectedPhrase, undefined)'
        >
          Move to Loose Phrases
        </button>
      </div>
      <div class="phraseList">
        <div
          v-for="phrase in selectedAssemblageObj.loosePhrases.slice().sort((a, b) => a.pieceIdx! - b.pieceIdx!)"
          :key="phrase.uniqueId"
          :class="['phraseItem', 'phrase-' + phrase.uniqueId]"
          @click='editorSelectPhrase(phrase)'
        >
          {{ `Phrase ${phrase.pieceIdx! + 1}` }}
        </div>
      </div>
    </div>
	</div>
</template>
<script lang="ts">
import { 
  defineComponent, 
  PropType, 
  ref, 
  nextTick,
  computed,
  onMounted,
  onUnmounted
} from 'vue';
import { Piece, Phrase } from '@model';
import { Assemblage } from '@model'
import { EditorMode } from '@shared/enums';

export default defineComponent({
  name: 'AssemblageEditor',
  props: {
	height: {
	  type: Number,
	  required: true
	},
	playerHeight: {
	  type: Number,
	  required: true
	},
	piece: {
	  type: Object as PropType<Piece>,
	  required: true
	},
  track: {
    type: Number,
    required: true
  }
  },
  setup(props, { emit }) {
    const assemblageName = ref('');
    const selectedAssemblage = ref<string | null>(null);
    const newStrandName = ref('');
    const selectingStrandId = ref<string | undefined>(undefined);
    const editorSelectedPhrase = ref<Phrase | null>(null);
    const editorSelectedPhraseStrandId = ref<string | undefined>(undefined);

    const handleGeneralKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const el = document.querySelector('.phraseItem.phrase-' + (editorSelectedPhrase.value?.uniqueId || ''));
        if (el) {
          (el as HTMLElement).style.backgroundColor = '';
        }
        editorSelectedPhrase.value = null;
        editorSelectedPhraseStrandId.value = undefined;
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (editorSelectedPhrase.value) {
          selectedAssemblageObj.value?.removePhrase(editorSelectedPhrase.value);
          emit('unsavedChanges', true);
          nextTick(() => {
            editorSelectedPhrase.value = null;
            editorSelectedPhraseStrandId.value = undefined;
          });

        }
      }
    };
    onMounted(() => {
      window.addEventListener('keydown', handleGeneralKeydown);
    });
    onUnmounted(() => {
      window.removeEventListener('keydown', handleGeneralKeydown);
    });

    const selectedAssemblageName = computed(() => {
      const assemblage = props.piece.assemblages.find(a => a.id === selectedAssemblage.value);
      return assemblage ? assemblage.name : '';
    })
    const selectedAssemblageObj = computed(() => {
      return props.piece.assemblages.find(a => a.id === selectedAssemblage.value);
    });

    const addPhrase = (strandId?: string) => {
      emit('update:selectedMode', EditorMode.AssemblagePhrasePick)
      selectingStrandId.value = strandId;
    };

    const selectPhrase = (phrase: Phrase) => {
      const assemblage = selectedAssemblageObj.value;
      if (!assemblage) return;
      if (!selectingStrandId.value) {
        // implement loose phrase addition
        console.log('adding loose phrase');
        assemblage.addPhrase(phrase);
      } else {
        console.log('selected strand id', selectingStrandId.value);
        assemblage.addPhrase(phrase, selectingStrandId.value);
      }
      const descriptorIdx = props.piece.assemblageDescriptors.findIndex(a => a.id === assemblage.id);
        if (descriptorIdx !== -1) {
          props.piece.assemblageDescriptors[descriptorIdx] = assemblage.descriptor;
        } else {
          throw new Error('Assemblage descriptor not found');
        }
        emit('unsavedChanges', true);
        nextTick(() => {
          selectingStrandId.value = undefined;
        });
    }

    const editorSelectPhrase = (phrase: Phrase) => {
      // Remove highlight from any previously selected phrase
      if (editorSelectedPhrase.value) {
        const prevEl = document.querySelector('.phraseItem.phrase-' + editorSelectedPhrase.value.uniqueId);
        if (prevEl) {
          (prevEl as HTMLElement).style.backgroundColor = '';
        }
      }
      const el = document.querySelector('.phraseItem.phrase-' + phrase.uniqueId);
      editorSelectedPhrase.value = phrase;
      const assemblage = selectedAssemblageObj.value;
      if (assemblage) {
        const strand = assemblage.strands.find(s => s.phraseIDs.includes(phrase.uniqueId));
        editorSelectedPhraseStrandId.value = strand ? strand.id : undefined;
      } else {
        editorSelectedPhraseStrandId.value = undefined;
      }
      if (el) {
        (el as HTMLElement).style.backgroundColor = '#576857';
      }
    }

    const createStrand = () => {
      if (!selectedAssemblage.value) return;
      const assemblage = selectedAssemblageObj.value;
      if (!assemblage) return;
      if (newStrandName.value.trim() === '') {
        alert('Please enter a valid strand name.');
        return;
      }
      assemblage.addStrand(newStrandName.value.trim());
      const descriptorIdx = props.piece.assemblageDescriptors.findIndex(a => a.id === assemblage.id);
      if (descriptorIdx !== -1) {
        props.piece.assemblageDescriptors[descriptorIdx] = assemblage.descriptor;
      } else {
        throw new Error('Assemblage descriptor not found');
      }
      emit('unsavedChanges', true);
      nextTick(() => {
        newStrandName.value = '';
      });
    }
    const deleteStrand = (strandId: string) => {
      if (!selectedAssemblage.value) return;
      const assemblage = selectedAssemblageObj.value;
      if (!assemblage) return;
      assemblage.removeStrand(strandId);
      const descriptorIdx = props.piece.assemblageDescriptors.findIndex(a => a.id === assemblage.id);
      if (descriptorIdx !== -1) {
        props.piece.assemblageDescriptors[descriptorIdx] = assemblage.descriptor;
      } else {
        throw new Error('Assemblage descriptor not found');
      }
      emit('unsavedChanges', true);
    }

    const moveToStrand = (phrase: Phrase, strandId?: string) => {
      if (!selectedAssemblage.value) return;
      const assemblage = selectedAssemblageObj.value;
      if (!assemblage) return;
      assemblage.movePhraseToStrand(phrase, strandId);
      const descriptorIdx = props.piece.assemblageDescriptors.findIndex(a => a.id === assemblage.id);
      if (descriptorIdx !== -1) {
        props.piece.assemblageDescriptors[descriptorIdx] = assemblage.descriptor;
      } else {
        throw new Error('Assemblage descriptor not found');
      }
      emit('unsavedChanges', true);
      nextTick(() => {
        editorSelectedPhrase.value = null;
        editorSelectedPhraseStrandId.value = undefined;
      });
    }

    const createAssemblage = () => {
      if (assemblageName.value.trim() === '') {
        alert('Please enter a valid assemblage name.');
        return;
      }
      const instrument = props.piece.instrumentation[props.track];
      const assemblage = new Assemblage(instrument, assemblageName.value.trim());
      props.piece.assemblageDescriptors.push(assemblage.descriptor);
      emit('unsavedChanges', true);
      nextTick(() => {
        selectedAssemblage.value = assemblage.id;
        assemblageName.value = '';
      })
    }
    const deleteAssemblage = () => {
      if (!selectedAssemblage.value) return;
      const assemblageIndex = props.piece.assemblageDescriptors.findIndex(a => a.id === selectedAssemblage.value);
      if (assemblageIndex !== -1) {
        props.piece.assemblageDescriptors.splice(assemblageIndex, 1);
        emit('unsavedChanges', true);
        nextTick(() => {
          if (props.piece.assemblageDescriptors.length > 0) {
            selectedAssemblage.value = props.piece.assemblageDescriptors[0].id;
          } else {
            selectedAssemblage.value = null;
          }
        });
      }
    }
    const handleKeydown = (e: KeyboardEvent) => {
      e.stopPropagation();
    }

    return { 
      assemblageName, 
      createAssemblage, 
      handleKeydown,
      selectedAssemblage,
      deleteAssemblage,
      selectedAssemblageName,
      newStrandName,
      createStrand,
      selectedAssemblageObj,
      deleteStrand,
      addPhrase,
      selectPhrase,
      editorSelectPhrase,
      editorSelectedPhrase,
      editorSelectedPhraseStrandId,
      moveToStrand,
    };
  }
});
</script>
<style scoped>

.assemblageOuter {
  background-color: #202621;
  height: v-bind(height + 'px');
  width: 100%;
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  color: white;
  z-index: -1;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  height: v-bind(height + 'px');
  width: 220px;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
}

.picker {
  width: 220px;
  height: v-bind(height / 2 + 'px');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
}

.picker > select {
	width: 180px;
}

.creator {
  width: 220px;
  height: v-bind(height / 2 + 'px');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.creator > input {
  width: 180px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.creator > button {
  width: 180px;
  box-sizing: border-box;
}

.creator > select {
  width: 180px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.creator.top {
  border-bottom: 1px solid #ccc;
}

.colSection {
  width: 220px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.colSection > input {
  width: 180px;
  margin-bottom: 10px;
  box-sizing: border-box;
}
.colSection > button {
  width: 180px;
  box-sizing: border-box;
}

.title {
  width: 220px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  font-weight: bold;
}

.strandSection {
  width: 220px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  border-bottom: 1px solid #ccc;
}

.phraseList {
  width: 100%;
  /* flex-grow: 1; */
  height: calc(100% - 80px);
  overflow-y: auto;
  box-sizing: border-box;
}

.phraseItem {
  width: 100%;
  height: 40px;
  border-bottom: 1px solid white;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.phraseItem:hover {
  background-color: #323c32
}
</style>
