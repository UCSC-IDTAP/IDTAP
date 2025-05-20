<template>
  <div 
    :class='`dropDown ${ closed ? "closed" : "" }`' 
    :style='{ top: y + "px", left: x + "px" }'
    >
    <div 
      :class='getClass(choices, choice, cIdx)'
      v-for='(choice, cIdx) in choices' 
      @click='choice.enabled ? choice.action() : null'

      >
      <div class='overflowX'>
        {{ choice.text }}
      </div>
      
    </div>
  </div>

</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { PropType } from 'vue';

import { ContextMenuOptionType } from '@shared/types';

type ContextMenuDataType = {
  dropDownWidth: number,
  rowHeight: number,
}


export default defineComponent({
  name: 'ContextMenu',
  props: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    choices: {
      type: Array as PropType<ContextMenuOptionType[]>,
      required: true
    },
    closed: {
      type: Boolean,
      required: true,
    }
  },

  data(): ContextMenuDataType {
    return {
      dropDownWidth: 200,
      rowHeight: 20,
    }
  },

  methods: {

    testmethod() {
      console.log('testmethod');
    },
    
    getClass(
      choices: ContextMenuOptionType[], 
      choice: ContextMenuOptionType, 
      cIdx: number
      ) {
      let classString = 'dropDownRow';
      if (choices && cIdx === choices!.length - 1) {
        classString += ' last';
      }
      if (choices && choice.enabled !== undefined && choice.enabled === false) {
        classString += ' inactive';
      }
      return classString;
    }

    
  }
});


</script>

<style scoped>

.dropDown {
  position: absolute;
  background-color: black;
  width: v-bind(dropDownWidth + 'px');
  border: 1px solid grey;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  user-select: none;
  z-index: 2;
}

.dropDown.closed {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s 0.15s, opacity 0.15s linear;
}

.dropDownRow {
  color: white;
  border-radius: 5px;
  height: v-bind(rowHeight + 'px');
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  padding-left: 8px;
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 6px;
  width: v-bind(dropDownWidth - 24 + 'px');
}

.overflowX {
  white-space: nowrap;
  text-align: left;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.overflowX::-webkit-scrollbar {
  width: 0em;
  height: 0em;
}

.overflowX::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0em;
}


.dropDownRow:hover {
  background-color: blue;
  cursor: pointer;
}

.dropDownRow.last {
  margin-bottom: 6px;
}

.dropDownRow.inactive:hover {
  background-color: black;
  cursor: auto;
}

.dropDownRow.inactive {
  color: grey;
}
</style>
