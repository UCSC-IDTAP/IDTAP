<template>
  <div class='modal'>
    <div class='modal-content'>
      <h2>Add to Collection</h2>
      <div class='modalRow'>
        <select v-model='selectedCollection'>
          <option 
            v-for='(collection, i) in possibleCollections' 
            :key='i'
            :value='collection'
            :disabled='optionDisabled(collection)'
            >
            {{collection.userName + ' - ' + collection.title}}
          </option>
        </select>
      </div>
      <div class='modalRow'>
        <button 
          @click='addToCollection'
          :disabled='selectedCollection === undefined'
          >Add</button>
        <button @click='$emit("close")'>Close</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CollectionType } from '@shared/types';
import { 
  addRecordingToCollection,
  addAEToCollection,
  addTransToCollection
} from '@/js/serverCalls';

type AddToCollectionDataType = {
  selectedCollection: CollectionType | undefined  
}

export default defineComponent({
  name: 'AddToCollection',
  data(): AddToCollectionDataType {
    return {
      selectedCollection: undefined
    }
  },
  props: {
    possibleCollections: {
      type: Array as PropType<CollectionType[]>,
      required: true
    },
    navHeight: {
      type: Number,
      required: true
    },
    recID: {
      type: String,
      required: false
    },
    aeID: {
      type: String,
      required: false
    },
    tID: {
      type: String,
      required: false
    },
    addType: {
      type: String as PropType<'recording' | 'audioEvent' | 'transcription'>,
      required: true
    }
  },

  mounted() {
    // add event listener for keydown
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.$emit('close');
      }
    });

    //  if you click outside modal-content, it closes the modal
    window.addEventListener('click', (e) => {
      const modal = this.$el as HTMLElement;
      if (e.target === modal) {
        this.$emit('close');
      }
    })
  },

  unmounted() {
    // remove event listener for keydown
    window.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.$emit('close');
      }
    });

    window.removeEventListener('click', (e) => {
      const modal = this.$el as HTMLElement;
      if (e.target === modal) {
        this.$emit('close');
      }
    })
  },

  methods: {
    async addToCollection() {
      try {
        const sCollId = this.selectedCollection!._id!;
        if (this.addType === 'recording') {
          if (this.recID === undefined) throw new Error('recID is undefined');
          const res = await addRecordingToCollection(this.recID, sCollId);
        } else if (this.addType === 'audioEvent') {
          if (this.aeID === undefined) throw new Error('aeID is undefined');
          const res = await addAEToCollection(this.aeID, sCollId);
        } else if (this.addType === 'transcription') {
          if (this.tID === undefined) throw new Error('tID is undefined');
          const res = await addTransToCollection(this.tID, sCollId);
        } else {
          throw new Error('Invalid addType');
        }
        this.$emit('close');
      } catch (err) {
        console.log(err);
      }
    },

    optionDisabled(collection: CollectionType) {
      if (this.addType === 'recording') {
        if (this.recID === undefined) throw new Error('recID is undefined');
        return collection.audioRecordings.some((rec) => rec === this.recID);
      } else if (this.addType === 'audioEvent') {
        if (this.aeID === undefined) throw new Error('aeID is undefined');
        return collection.audioEvents.some((ae) => ae === this.aeID);
      } else if (this.addType === 'transcription') {
        if (this.tID === undefined) throw new Error('tID is undefined');
        return collection.transcriptions.some((t) => t === this.tID);
      } else {
        throw new Error('Invalid addType');
      }
    }
  }
})

</script>
<style scoped>

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  margin-top: v-bind(navHeight + 'px');
}

.modal-content {
  background-color: lightgrey;
  padding: 20px;
  border-radius: 4px;
  height: 130px;
  width: 350px;
  display: flex;
  flex-direction: column;
  justify-content: top;
}

select {
  width: 300px;
}

button {
  margin: 10px;
}
</style>
