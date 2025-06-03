<template>
	<div class="assemblageOuter">
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
</template>
<script lang="ts">
import { defineComponent, PropType, ref, nextTick } from 'vue';
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

    const createAssemblage = () => {
      if (assemblageName.value.trim() === '') {
        alert('Please enter a valid assemblage name.');
        return;
      }
      const instrument = props.piece.instrumentation[props.track];
      const assemblage = new Assemblage(instrument, assemblageName.value.trim());
      console.log('Creating assemblage:', assemblage);
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
      deleteAssemblage
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
  flex-direction: column;
  align-items: left;
  justify-content: top;
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
  border-right: 1px solid #ccc;
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
</style>
