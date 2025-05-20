<template>
  <div class='modal'>
    <div class='modal-content'>
      <div class='modalRow'>
        <label>Saved Queries</label>
        <select v-model='selectedQuery' class='query'>
          <option 
            v-for='(query, i) in possibleQueries' 
            :key='i'
            :value='query'
            >
            {{ query.title }}
          </option>
        </select>
      </div>
      <div class='modalRow'>
        <button 
          @click='loadQuery'
          :disabled='selectedQuery === undefined'
          >
          Load
        </button>
        <button 
          @click='deleteQuery'
          :disabled='selectedQuery === undefined'
          >
          Delete
        </button>
        <button @click='cancel'>Cancel</button>
      </div>

    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { QueryType, MultipleOptionType } from '@shared/types';
import { loadQueries, deleteQuery } from '@/js/serverCalls';

type LoadQueryModalDataType = {
  possibleQueries: { 
    title: string,
    queries: QueryType[],
    options: MultipleOptionType,
    _id: string 
  }[],
  selectedQuery: { 
    title: string,
    queries: QueryType[],
    options: MultipleOptionType,
    _id: string
  } | undefined
}

export default defineComponent({
  name: 'LoadQueryModal',
  data(): LoadQueryModalDataType {
    return {
      possibleQueries: [],
      selectedQuery: undefined
    }
  },
  props: {
    navHeight: {
      type: Number,
      required: true
    },
    transcriptionID: {
      type: String,
      required: true
    }
  },
  async mounted() {
    try {
      const userID = this.$store.state.userID!;
      this.possibleQueries = await loadQueries(userID, this.transcriptionID);
    } catch (e) {
      console.error(e);
    }
  },

  methods: {

    async deleteQuery() {
      const userID = this.$store.state.userID!;
      try {
        if (this.selectedQuery) {
          await deleteQuery(userID, this.selectedQuery._id)
          this.possibleQueries = await loadQueries(userID, this.transcriptionID);
          this.selectedQuery = undefined;
        }
      } catch (e) {
        console.error(e);
      }
    },

    cancel() {
      this.$emit('close');
    },

    loadQuery() {
      if (this.selectedQuery) {
        this.$emit('loadQuery', this.selectedQuery.queries, this.selectedQuery.options);
      }
    }
  }
});
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
  border: 1px solid black;
}

.modal-content {
  background-color: lightgrey;
  padding: 20px;
  border-radius: 4px;
  height: 80px;
  width: 350px;
  display: flex;
  flex-direction: column;
  justify-content: top;
  color: black;
}

select {
  width: 300px;
}

button {
  margin: 10px;
}

</style>
