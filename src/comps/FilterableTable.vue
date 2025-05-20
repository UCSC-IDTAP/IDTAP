<template>
  <div class='tableMain'>
    <div class='searchBar'>
      <input
        class='search'
        type='text'
        placeholder='Search'
        v-model='searchQuery'
        @input='handleSearch'
        >
        <button 
          v-show='searchQuery'
          @click='cancelSearch'
          class='clearSearch'
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.354 4.646a.5.5 0 0 1 0 .708l-3 3 3 3a.5.5 0 0 1-.708.708l-3-3-3 3a.5.5 0 0 1-.708-.708l3-3-3-3a.5.5 0 0 1 .708-.708l3 3 3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
    </div>
    <div class='labelRow'>
      <div 
        class='metadataLabels'
        v-for='(labelObj, lIdx) in labels'
        :style='{
          "width": colWidths[lIdx] + "px",
          "min-width": colWidths[lIdx] + "px",
          "position": "relative",
        }'
        >
        <span class='field'>
          {{ labelObj.label }}
          <span
            v-if='labelObj.sortFunction !== undefined'
            :class='`sortTriangle ${ sortStates[lIdx] }`'
            @click='toggleSort(lIdx)'
            :style='{
              "color": lIdx === selectedSortIdx ? "white" : "black",
            }'
            >
            &#9654;
          </span>
        </span>
        <div
          v-if='lIdx !== labels.length - 1'
          class='draggableBorder'
          draggable='true'
          @dragstart='handleDragStart(lIdx, $event)'
          @drag='handleDrag(lIdx, $event)'
          @dragend='handleDragEnd(lIdx, $event)'
          >
        </div>
      </div>
    </div>
    <div
      class='fileContainer'
      @contextmenu='handleRightClick'
      @click='handleClick'
      @dblclick='handleDoubleClick'
      ref='fileContainer'
      >
      <div
        v-for='(row, rIdx) in highlightedData'
        :class='`dataRow ${viewable[rIdx] ? "" : "disabled"}`'
        :id='`row${rIdx}`'
        @dblclick='viewable[rIdx] ? 
          $emit("rowdblclick", items[rIdx]) : 
          null'
        >
        <div
          class='metadataLabels'
          v-for='(labelObj, lIdx) in labels'
          :style='{
            "width": colWidths[lIdx] + "px",
            "min-width": colWidths[lIdx] + "px",
          }'
          >
          <span class='field' v-html="highlightedData[rIdx][lIdx]"></span>
          <div
            v-if='lIdx !== labels.length - 1'
            class='draggableBorder'
            draggable='true'
            @dragstart='handleDragStart(lIdx, $event)'
            @drag='handleDrag(lIdx, $event)'
            @dragend='handleDragEnd(lIdx, $event)'
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { SortState } from '@shared/enums';
import { 
  RecType, 
  FilterableTableType, 
  TransMetadataType,
  UserCheckType,
} from '@shared/types';

type FilterableTableDataType = {
  colWidths: number[],
  sortStates: SortState[],
  selectedSortIdx: number,
  initialMouseX?: number,
  initialWidths: number[],
  labelRowHeight: number,
  displayableData: (string | number)[][],
  filteredData: (string | number)[][],
  viewable: boolean[],
  editable: boolean[],
  searchBarHeight: number,
  searchQuery: string,
  itemIdxMapping: number[],
}

export default defineComponent({
  name: 'FilterableTable',
  data(): FilterableTableDataType {
    return {
      colWidths: [],
      sortStates: [],
      selectedSortIdx: 0,
      initialMouseX: undefined,
      initialWidths: [],
      labelRowHeight: 40,
      searchBarHeight: 40,
      displayableData: [],
      filteredData: [],
      viewable: [],
      editable: [],
      searchQuery: '',
      itemIdxMapping: [],
    }
  },

  mounted() {
    this.colWidths = this.labels.map(label => label.minWidth);
    // get total window width. If it's more than the sum of the minWidths, then
    // distribute the extra space to the growable columns
    this.resetWidths();
    this.sortStates = this.labels.map(label => label.initSortState);
    this.toggleSort(0, true);
    this.displayableData = this.items.map((item, idx) => {
      return this.labels.map(label => label.getDisplay(item));
    })
    this.filteredData = this.displayableData;
    
    this.viewable = this.items.map(item => this.canView(item, this.userID));
    this.editable = this.items.map(item => this.canEdit(item, this.userID));
    this.$el.style.setProperty('--height-offset', `${this.heightOffset}px`);
    this.$el.style.setProperty('--nav-height', `${this.navHeight}px`);
    this.$el.style.setProperty('--label-row-height', `${this.labelRowHeight}px`);
    this.$el.style.setProperty('--search-bar-height', `${this.searchBarHeight}px`);
    window.addEventListener('resize', this.resetWidths);

    this.$nextTick(() => {
      this.toggleSort(7, true)
    })

  },

  beforeUnmount() {
    window.removeEventListener('resize', this.resetWidths);
  },

  props: {
    labels: {
      type: Array as PropType<FilterableTableType[]>,
      required: true
    },
    items: {
      type: Array as PropType<(RecType[] | TransMetadataType[] )>,
      required: true
    },
    canView: {
      type: Function as PropType<UserCheckType>,
      required: true
    },
    canEdit: {
      type: Function as PropType<UserCheckType>,
      required: true
    },
    userID: {
      type: String,
      required: true
    },
    heightOffset: {
      type: Number,
      required: true
    },
    navHeight: {
      type: Number,
      required: true
    }
  },

  computed: {
    highlightedData() {
      const query = this.searchQuery.toLowerCase();
      return this.filteredData.map(row => {
        return row.map(cell => {
          const cellStr = String(cell);
          if (query && cellStr.toLowerCase().includes(query)) {
            const modifiedQuery = this.escapeRegExp(query);
            const highlighted = cellStr.replace(new RegExp(`(${modifiedQuery})`, 'gi'), '<mark class="highlight">$1</mark>');
            return `<span class="preserve-space">${highlighted}</span>`;
          }
          return `<span class="preserve-space">${cellStr}</span>`;
        });
      });
    }
  },


  watch: {
    items() {
      this.toggleSort(this.selectedSortIdx, true);
      this.viewable = this.items.map(item => this.canView(item, this.userID));
      this.editable = this.items.map(item => this.canEdit(item, this.userID));
    }
  },

  methods: {

    escapeRegExp(string: string): string {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    },

    cancelSearch() {
      this.searchQuery = "";
      this.handleSearch();
    },

    handleSearch() {
      this.filteredData = this.displayableData.filter((row, rIdx) => {
        return row.some((cell, cIdx) => {
          return cell?.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
        })
      });
      this.itemIdxMapping = this.filteredData.map(fd => {
        return this.displayableData.indexOf(fd);
      })
      this.$emit('searched');
    },

    resetWidths() {
      const totalWidth = this.colWidths.reduce((acc, cur) => acc + cur, 0);
      if (totalWidth < window.innerWidth) {
        const growableCols = this.labels.filter(label => label.growable);
        const extraSpace = (window.innerWidth - totalWidth) / growableCols.length;
        growableCols.forEach((col, i) => {
          this.colWidths[this.labels.indexOf(col)] += extraSpace;
        })
      } else if (totalWidth > window.innerWidth) {
        const delta = totalWidth - window.innerWidth;
        this.colWidths.forEach((col, i) => {
          this.colWidths[i] -= delta * (col / totalWidth);
        })
        const lessThanMinIdxs = this.colWidths.reduce((acc, cur, idx) => {
          if (cur < this.labels[idx].minWidth) {
            acc.push(idx);
          }
          return acc;
        }, [] as number[]);
        let overshoot = 0;
        lessThanMinIdxs.forEach(idx => {
          overshoot += this.labels[idx].minWidth - this.colWidths[idx];
          this.colWidths[idx] = this.labels[idx].minWidth;
        })
        const restIdxs = this.colWidths.reduce((acc, cur, idx) => {
          if (!lessThanMinIdxs.includes(idx)) {
            acc.push(idx);
          }
          return acc;
        }, [] as number[]);
        const restDelta = overshoot / restIdxs.length;
        restIdxs.forEach(idx => {
          this.colWidths[idx] += restDelta;
        })
      }
    },

    toggleSort(idx: number, ensureCurrentState = false) {
      const field = this.labels[idx];
      if (field.sortFunction === undefined) {
        return;
      }
      if (this.selectedSortIdx === idx) {
        if (
          (this.sortStates[idx] === SortState.down && !ensureCurrentState) ||
          (this.sortStates[idx] === SortState.up && ensureCurrentState)
        ) {
          this.sortStates[idx] = SortState.up;
          this.sortItems({
            sortFunc: field.sortFunction,
            fromTop: false
          })
        } else {
          this.sortStates[idx] = SortState.down;
          this.sortItems({
            sortFunc: field.sortFunction,
            fromTop: true
          })
        }
      } else {
        this.sortItems({
          sortFunc: field.sortFunction,
          fromTop: this.sortStates[idx] === SortState.down
        })
      }
      this.displayableData = this.items.map((item, idx) => {
        return this.labels.map(label => label.getDisplay(item));
      })
      this.handleSearch();
      this.selectedSortIdx = idx;
      // this.$emit('sorted');
    },

    sortItems({ 
      sortFunc = undefined, 
      fromTop = true 
    }: {
      sortFunc?: (a: any, b: any) => number,
      fromTop?: boolean
    } = {}) {
      this.items.sort(sortFunc);
      if (!fromTop) {
        this.items.reverse();
      }
    },

    handleClick(e: MouseEvent) {
      e.preventDefault();
      this.$emit('click', e);
    },

    handleDoubleClick(e: MouseEvent) {
      e.preventDefault();
      let el = e.target as HTMLElement;
      if (el) {
        if (el.classList.contains('metadataLabels')) {
          el = el.parentElement!;
        } else if (el.classList.contains('field')) {
          el = el.parentElement!.parentElement!;
        } else if (el.classList.contains('draggableBorder')) {
          el = el.parentElement!;
        } else if (el.classList.contains('preserve-space')) {
          el = el.parentElement!.parentElement!.parentElement!;

        }
        const id = Number(el.id.slice(3));
        const item = this.items[this.itemIdxMapping[id]];
        this.$emit('doubleClick', item, el);
      }
    },

    handleRightClick(e: MouseEvent) {
      e.preventDefault();
      let el = e.target as HTMLElement;
      if (el) {
        if (el.classList.contains('preserve-space')) {
          el = el.parentElement!;
        }
        
        if (el.classList.contains('field')) {
          el = el.parentElement!.parentElement!;
        }
        if (el.classList.contains('draggableBorder')) {
          el = el.parentElement!;
        }
        if (el.classList.contains('metadataLabels')) {
          el = el.parentElement!;
        }
        const id = Number(el.id.slice(3));
        const item = this.items[this.itemIdxMapping[id]];
        this.$emit('rightClick', item, e, el);
      }
    },

    handleDragStart(idx: number, e: DragEvent) {
      this.initialMouseX = e.clientX;
      this.initialWidths = this.colWidths.slice();
      document.body.style.cursor = 'ew-resize'; // might not need this one
    },

    handleDrag(idx: number, e: DragEvent) {
      const nextColExists = idx < this.colWidths.length - 1;
      document.body.style.cursor = 'col-resize';
      if (e.clientX !== 0) {
        const deltaX = e.clientX - this.initialMouseX!;
        const initW = this.initialWidths[idx];
        const nextInitW = this.initialWidths[idx + 1];
        const nextMinW = this.labels[idx + 1].minWidth;
        if (initW + deltaX < this.labels[idx].minWidth) {
          return;
        } else if (nextColExists && (nextInitW - deltaX < nextMinW)) {
          return;
        } else {
          this.colWidths[idx] = initW + deltaX;
          if (nextColExists) {
            this.colWidths[idx + 1] = nextInitW - deltaX;
          }
        }
      }
    },

    handleDragEnd(idx: number, e: DragEvent) {
      document.body.style.cursor = 'default';
      const nextColExists = idx < this.colWidths.length - 1;
      const deltaX = e.clientX - this.initialMouseX!;
      const nextMinCW = this.labels[idx + 1].minWidth;
      if (this.initialWidths[idx] + deltaX < this.labels[idx].minWidth) {
        return;
      } else if (nextColExists && (this.initialWidths[idx + 1] - deltaX < nextMinCW)) {
        return;
      } else {
        this.colWidths[idx] = this.initialWidths[idx] + deltaX;
        if (nextColExists) {
          this.colWidths[idx + 1] = this.initialWidths[idx + 1] - deltaX;
        }
      }
      this.initialMouseX = undefined;
    }
  }
})

</script>
<style scoped>

.tableMain {
  background-color: black;
  background-image: linear-gradient(black, #1e241e);
  color: white;
}

.labelRow { 
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: v-bind(labelRowHeight + 'px');
  background-color: #1e241e;
  border-top: 1px solid grey;
}

.dataRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: 40px;
  width: 100%;
  border-bottom: 1px solid grey;
}

.dataRow.disabled {
  color: grey;
}

.dataRow:hover {
  background-color: #1e241e;
}

.metadataLabels {
  text-align: center;
  border-right: 1px solid grey;
  height: 40px;
  position: relative;
  white-space: nowrap;
  box-sizing: border-box;
}

span.field {
  display: flex;
  align-items: center;
  justify-content: left;
  white-space: nowrap;
  overflow-x: auto;
  height: 40px;
  margin-left: 5px;
  margin-right: 5px;
  user-select: none;
  box-sizing: border-box;
  overflow-y: hidden;
}

span.field::-webkit-scrollbar {
  display: none;
}

.draggableBorder {
  position: absolute;
  right: -5px;
  top: 0;
  width: 10px;
  height: 100%;
  background-color: none;
  z-index: 1;
  opacity: 0;
  cursor: col-resize;
  
  user-select: none;
  background-color: pink
}

.draggableBorder:hover {
  cursor: col-resize
}

.sortTriangle.down {
  transform: rotate(90deg);
}

.sortTriangle.up {
  transform: rotate(-90deg);
}

.fileContainer {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - 
    var(--height-offset) - 
    var(--nav-height) - 
    var(--label-row-height) - 
    var(--search-bar-height)
  );
  width: 100%;
  user-select: none;
  overflow-y: scroll;
  overflow-x: hidden;
  border-top: 1px solid grey;
}

.fileContainer::-webkit-scrollbar {
  display: none;
}

.searchBar {
  height: v-bind(searchBarHeight + 'px');
  min-height: v-bind(searchBarHeight + 'px');
  background-color: #131713;
  /* border-bottom: 1px solid grey; */
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
  user-select: none;
  position: relative;
}

.clearSearch {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: #2e2e2e;
  color: #6e6e6e;
  /* border: 1px solid #ccc; */
  border: 0;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clearSearch:hover {
  background: #3e3e3e;
}

.searchOval {
  width: 400px;
  height: 30px;
  border-radius: 5px;
  background-color: black;
  border: 1px solid grey;
  box-sizing: border-box;
  margin-right: 5px;

}

input.search {
  width: 300px;
  height: 30px;
  background-color: black;
  border-radius: 5px;
  border: 1px solid grey;
  color: white;
  padding-left: 5px;
  padding-right: 5px;
  box-sizing: border-box;
  user-select: none;
}


:deep(.highlight) {
  background-color: #6dfc89;
  color: black;
}
</style>
