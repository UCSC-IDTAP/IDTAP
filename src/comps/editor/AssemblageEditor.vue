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
      <div class='strandSection'>
        <button
          @click='addPhrase(strand.id)'
        >
          Add Phrase
        </button>
        <button 
          @click='deleteStrand(strand.id)'
        >Delete Strand</button>
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
  computed 
} from 'vue';
import { Piece } from '@model';
import { Assemblage } from '@model'

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

    const selectedAssemblageName = computed(() => {
      const assemblage = props.piece.assemblages.find(a => a.id === selectedAssemblage.value);
      return assemblage ? assemblage.name : '';
    })
    const selectedAssemblageObj = computed(() => {
      return props.piece.assemblages.find(a => a.id === selectedAssemblage.value);
    });

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
    // const deleteStrand = 

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
      selectedAssemblageObj
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
</style>
