<template>
  <div class='modal'>
    <div class='modal-content'>
      <h2>Remove From Collection</h2>
      <div class='modalRow'>
        <select v-model='selectedCollection'>
          <option 
            v-for='(collection, i) in possibleCollections' 
            :key='i'
            :value='collection'
            >
            {{collection.userName + ' - ' + collection.title}}
          </option>
        </select>
      </div>
      <div class='modalRow'>
        <button 
          @click='removeFromCollection'
          :disabled='selectedCollection === undefined'
          >Remove</button>
        <button @click='$emit("close")'>Close</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CollectionType } from '@shared/types';
import { 
  removeRecFromColl,
  removeAEfromColl,
  removeTFromColl
} from '@/js/serverCalls';

type RemoveFromCollectionDataType = {
  selectedCollection: CollectionType | undefined  
}

export default defineComponent({
  name: 'RemoveFromCollection',
  data(): RemoveFromCollectionDataType {
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
    removeType: {
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
    async removeFromCollection() {
      try {
        if (this.removeType === 'recording') {
          if (this.recID === undefined) {
            throw new Error('recID is undefined');
          }
          const remove = removeRecFromColl;
          const res = await remove(this.recID, this.selectedCollection!._id!);
        } else if (this.removeType === 'audioEvent') {
          if (this.aeID === undefined) {
            throw new Error('aeID is undefined');
          }
          const remove = removeAEfromColl;
          const res = await remove(this.aeID, this.selectedCollection!._id!);

        } else if (this.removeType === 'transcription') {
          if (this.tID === undefined) {
            throw new Error('tID is undefined');
          }
          const remove = removeTFromColl;
          const res = await remove(this.tID, this.selectedCollection!._id!);
        }
        this.$emit('close');
      } catch (err) {
        console.log(err);
      }
    },

    
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
