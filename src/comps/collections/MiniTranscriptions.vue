<template>
  <div class='miniTMain' @contextmenu='handleChirp'>
    <div class='labelRow'>
      <div class='metadataLabels'
        v-for='(field, fIdx) in mdFields'
        :style='{
          "width": colWidths[fIdx] + "px",
          "max-width": fIdx === mdFields.length - 2 ? 
            "" : 
            colWidths[fIdx] + "px",
          "min-width": mincolWidths[fIdx] + "px",
          "flex-grow": fIdx === mdFields.length - 2 ? 1 : 0,
          "position": "relative",
        }'
      >
        <span class='field'>
          {{ field.name }}
          <span
            v-if='field.sortType !== undefined'
            :class='`sortTriangle ${field.sortState}`'
            @click='toggleSort(fIdx)'
            :style='{
              "color": fIdx === selectedSortIdx ? "white" : "black",
            }'
          >
          &#9654;
          </span>
        </span>
        <div 
          class='draggableBorder'
          draggable='true'
          @dragstart='handleDragStart(fIdx, $event)'
          @drag='handleDrag(fIdx, $event)'
          @dragend='handleDragEnd(fIdx, $event)'
          >
        </div>
      </div>
    </div>
    <div 
      class='fileContainer'
      ref='fileContainer'
      >
      <div 
        class='transcriptionRow'
        v-for='(transcription, rIdx) in trans'
        :id='`tRow${rIdx}`'
        @dblclick='handleDblClick(transcription)'
        >
        <div 
          class='metadataLabels' 
          v-for='(field, fIdx) in mdFields'
          :style='{ 
            "width": colWidths[fIdx] + "px", 
            "max-width": fIdx === mdFields.length - 2 ? 
              "" : 
              colWidths[fIdx] + "px",
            "min-width": mincolWidths[fIdx] + "px",
            "flex-grow": fIdx === mdFields.length - 2 ? 1 : 0 
            }'
          >
          <span class='field'>{{ field.func(transcription) }}</span>
          <div 
            class='draggableBorder'
            draggable='true'
            @dragstart='handleDragStart(fIdx, $event)'
            @drag='handleDrag(fIdx, $event)'
            @dragend='handleDragEnd(fIdx, $event)'
            >
          </div>
        </div>     
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { 
  getTranscriptionsFromIds, 
  getSortedMusicians 
} from '@/js/serverCalls.ts';
import { TransMetadataType, MusicianNameType } from '@shared/types';


// title, transcriber, raga, created, modified, permissions

type MiniTranscriptionsDataType = {
  trans: TransMetadataType[],
  colWidths: number[],
  mincolWidths: number[],
  initialWidths: number[],
  mdFields: {
    name: string,
    func: (t: TransMetadataType) => string,
    sortType?: string,
    sortState?: 'up' | 'down',
  }[],
  initialMouseX?: number,
  selectedSortIdx: number,
  labelRowHeight: number,
  allMusicians?: MusicianNameType[],
}
export default defineComponent({
  name: 'MiniTranscriptions',
  props: {
    tIds: {
      type: Array as PropType<string[]>,
      required: true
    },
  },
  data(): MiniTranscriptionsDataType {
    return {
      trans: [],
      mdFields: [
        {
          name: 'Title',
          func: (t: TransMetadataType) => t.title,
          sortType: 'title',
          sortState: 'down'
        },
        {
          name: 'Transcriber',
          func: (t: TransMetadataType) => t.name,
          sortType: 'transcriber',
          sortState: 'down'
        },
        {
          name: 'Soloist',
          func: (t: TransMetadataType) => {
            console.log(t)
            return t.soloist || ''
          },
          sortType: 'Soloist',
          sortState: 'down'
        },
        {
          name: 'Raga',
          func: (t: TransMetadataType) => t.raga.name,
          sortType: 'raga',
          sortState: 'down'
        },
        {
          name: 'Created',
          func: (t: TransMetadataType) => {
            const date = new Date(t.dateCreated);
            return date.toLocaleDateString();
          },
          sortType: 'created',
          sortState: 'down'
        },
        {
          name: 'Modified',
          func: (t: TransMetadataType) => {
            const date = new Date(t.dateModified);
            return date.toLocaleDateString();
          },
          sortType: 'modified',
          sortState: 'down'
        },
        {
          name: 'Editable',
          func: (t: TransMetadataType) => this.canEdit(t) ? 'Yes' : 'No',
          sortType: 'permissions',
          sortState: 'down'
        },
      ],
      colWidths: [140, 90, 100, 75, 100, 100, 50],
      mincolWidths: [140, 90, 100, 75, 100, 100, 50],
      initialWidths: [140, 90, 100, 75, 100, 100, 50],
      initialMouseX: undefined,
      selectedSortIdx: 0,
      labelRowHeight: 40,

    }
  },

  async mounted() {
    const summedWidths = this.colWidths.reduce((a, b) => a + b, 0);
    const ratio = this.$el.offsetWidth / summedWidths;
    this.colWidths = this.colWidths.map(width => width * ratio);
    this.initialWidths = this.colWidths.slice();
    try {
      const userID = this.$store.state.userID!;
      this.trans = await getTranscriptionsFromIds(this.tIds, userID);
      this.allMusicians = await getSortedMusicians(true)
    } catch (err) {
      console.error(err);
    }
  },

  watch: {
    async tIds() {
      try {
        this.updateTrans();
      } catch (err) {
        console.error(err);
      }
    },
  },

  methods: {

    soloistSorter(a: TransMetadataType, b: TransMetadataType) {
      const aObj = this.allMusicians!.find(m => {
        return m['Initial Name'] === a.soloist;
      });
      const bObj = this.allMusicians!.find(m => {
        return m['Initial Name'] === b.soloist;
      });
      const aLastName = aObj ? aObj['Last Name'] : '';
      const bLastName = bObj ? bObj['Last Name'] : '';
      const aFirstName = aObj ? aObj['First Name'] : '';
      const bFirstName = bObj ? bObj['First Name'] : '';
      const aMidName = aObj ? aObj['Middle Name'] : '';
      const bMidName = bObj ? bObj['Middle Name'] : '';

      if (aLastName === undefined && bLastName === undefined) {
        return 0;
      } else if (aLastName === undefined) {
        return -1;
      } else if (bLastName === undefined) {
        return 1;
      } else if (aLastName < bLastName) {
        return -1;
      } else if (aLastName > bLastName) {
        return 1;
      } else if (aFirstName === undefined && bFirstName === undefined) {
        return 0;
      } else if (aFirstName === undefined) {
        return -1;
      } else if (bFirstName === undefined) {
        return 1;
      } else if (aFirstName < bFirstName) {
        return -1;
      } else if (aFirstName > bFirstName) {
        return 1;
      } else if (aMidName === undefined && bMidName === undefined) {
        return 0;
      } else if (aMidName === undefined) {
        return -1;
      } else if (bMidName === undefined) {
        return 1;
      } else if (aMidName < bMidName) {
        return -1;
      } else if (aMidName > bMidName) {
        return 1;
      }
      return 0;
    },

    handleDblClick(t: TransMetadataType) {
      this.$store.commit('update_id', t._id);
      this.$cookies.set('currentPieceId', t._id);
      this.$router.push({
        name: 'EditorComponent',
        query: { id: t._id }
      })
    },

    canEdit(t: TransMetadataType) {
      const ep = t.explicitPermissions;
      const id = this.$store.state.userID!;
      return ep.edit.includes(id) || t.userID === id;
    },

    permissionToView(t: TransMetadataType) {
      const ep = t.explicitPermissions;
      const id = this.$store.state.userID!;
      return ep.view.includes(id) || 
        ep.publicView || 
        t.userID === id || 
        ep.edit.includes(id);
    },

    async updateTrans() {
      try {
        const userID = this.$store.state.userID!;
        this.trans = await getTranscriptionsFromIds(this.tIds, userID);
      } catch (err) {
        console.error(err);
      }
    },

    handleChirp() {
      this.$emit('chirp');
    },

    handleDragStart(fIdx: number, event: DragEvent) {
      // Store the initial mouse position and column widths
      // event.preventDefault();
      this.initialMouseX = event.clientX;
      this.initialWidths = this.colWidths.slice()
      // make cursor resize until drag end
      document.body.style.cursor = 'col-resize';
      

    },
    handleDrag(fIdx: number, event: DragEvent) {
      const nextCol = fIdx < this.colWidths.length - 1;
      // Calculate the new width based on the mouse movement
      document.body.style.cursor = 'col-resize';
        if (event.clientX !== 0) {
          const nextInitW = this.initialWidths[fIdx + 1];
          const initW = this.initialWidths[fIdx];
          const nextMinW = this.mincolWidths[fIdx + 1];
          
          const deltaX = event.clientX - this.initialMouseX!;
          if (initW! + deltaX < 50) {
            return;
          } else if (nextCol && (nextInitW! - deltaX < 50)) {
            return
          } else if (initW + deltaX < this.mincolWidths[fIdx]) {
            return
          } else if (nextCol && nextInitW - deltaX < nextMinW) {
            return
          } else {
            this.colWidths[fIdx] = initW! + deltaX;
            if (nextCol) {
              this.colWidths[fIdx + 1] = nextInitW - deltaX;
            }

          }
      }
    },
    handleDragEnd(fIdx: number, event: DragEvent) {
      document.body.style.cursor = 'auto';
      const nextCol = fIdx < this.colWidths.length - 1;
      const deltaX = event.clientX - this.initialMouseX!;
      const nextInitW = this.initialWidths[fIdx + 1];
      const initW = this.initialWidths[fIdx];
      const nextMinW = this.mincolWidths[fIdx + 1];
      if (initW + deltaX < 50) {
        return;
      } else if (nextCol && nextInitW - deltaX < 50) {
        return
      } else if (initW + deltaX < this.mincolWidths[fIdx]) {
        return
      } else if (nextCol && nextInitW -deltaX < nextMinW) {
        return
      } else {
        this.colWidths[fIdx] = initW + deltaX;
        if (nextCol) {
          this.colWidths[fIdx + 1] = nextInitW - deltaX;
        }  
      } 
    },

    toggleSort(fIdx: number, ensureCurrentState: boolean = false) {
      const field = this.mdFields[fIdx];
      if (this.selectedSortIdx === fIdx) {
        if (
          (field.sortState === 'down' && !ensureCurrentState) || 
          (field.sortState === 'up' && ensureCurrentState)
          ) {
          field.sortState = 'up';
          this.sortTranscriptions({ sort: field.sortType, fromTop: false });
        } else {
          field.sortState = 'down';
          this.sortTranscriptions({ sort: field.sortType, fromTop: true });
        }
      } else {
        this.sortTranscriptions({ 
          sort: field.sortType, 
          fromTop: field.sortState === 'down' 
        });
      }

      this.selectedSortIdx = fIdx;
    },

    titleSorter(a: TransMetadataType, b: TransMetadataType) {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      if (aTitle < bTitle) {
        return -1;
      } else if (aTitle > bTitle) {
        return 1;
      } else {
        return 0;
      }
    },

    transcriberSorter(a: TransMetadataType, b: TransMetadataType) {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName < bName) {
        return -1;
      } else if (aName > bName) {
        return 1;
      } else {
        return 0;
      }
    },

    ragaSorter(a: TransMetadataType, b: TransMetadataType) {
      const aRaga = a.raga.name.toLowerCase();
      const bRaga = b.raga.name.toLowerCase();
      if (aRaga < bRaga) {
        return -1;
      } else if (aRaga > bRaga) {
        return 1;
      } else {
        return 0;
      }
    },

    createdSorter(a: TransMetadataType, b: TransMetadataType) {
      const aDate = new Date(a.dateCreated);
      const bDate = new Date(b.dateCreated);
      if (aDate < bDate) {
        return -1;
      } else if (aDate > bDate) {
        return 1;
      } else {
        return 0;
      }
    },

    modifiedSorter(a: TransMetadataType, b: TransMetadataType) {
      const aDate = new Date(a.dateModified);
      const bDate = new Date(b.dateModified);
      if (aDate < bDate) {
        return -1;
      } else if (aDate > bDate) {
        return 1;
      } else {
        return 0;
      }
    },

    permissionsSorter(a: TransMetadataType, b: TransMetadataType) {
      const aPerm = a.permissions.toLowerCase();
      const bPerm = b.permissions.toLowerCase();
      if (aPerm < bPerm) {
        return -1;
      } else if (aPerm > bPerm) {
        return 1;
      } else {
        return 0;
      }
    },

    sortTranscriptions({
      sort='title',
      fromTop=true
    }: {
      sort?: string,
      fromTop?: boolean
    } = {}) {
      let sorter;
      if (sort === 'title') {
        sorter = this.titleSorter;
      } else if (sort === 'transcriber') {
        sorter = this.transcriberSorter;
      } else if (sort === 'raga') {
        sorter = this.ragaSorter;
      } else if (sort === 'created') {
        sorter = this.createdSorter;
      } else if (sort === 'modified') {
        sorter = this.modifiedSorter;
      } else if (sort === 'permissions') {
        sorter = this.permissionsSorter;
      } else if (sort === 'Soloist') {
        sorter = this.soloistSorter;
      }
      this.trans.sort(sorter);
      if (!fromTop) {
        this.trans.reverse();
      }

    }
  },
  computed: {
  }
})
</script>

<style scoped>

.miniTMain {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: white;
  box-sizing: border-box;
  border: 1px solid #ccc;
  /* width: 100%; */
  background-image: linear-gradient(black, var(--Primary));
}


.labelRow { 
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: v-bind(labelRowHeight + 'px');
  background-color: var(--Primary);
  border-top: 1px solid grey;
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
  overflow-y: hidden;
  height: 30px;
  margin-left: 5px;
  margin-right: 5px;
  user-select: none;
}

span.field::-webkit-scrollbar {
  display: none;
}

.sortTriangle.down {
  transform: rotate(90deg);
}

.sortTriangle.up {
  transform: rotate(-90deg);
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

.fileContainer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px - 40px);
  width: 100%;
  user-select: none;
  overflow-y: scroll;
  overflow-x: hidden;
  border-top: 1px solid grey;
}

.fileContainer::-webkit-scrollbar {
  display: none;
}

.transcriptionRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: 40px;
  width: 100%;
  border-bottom: 1px solid grey;
}

.transcriptionRow:hover {
  background-color: #2b332c;
}
</style>
