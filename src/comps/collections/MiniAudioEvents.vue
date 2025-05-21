<template>
  <div class='miniAEMain' @contextmenu='handleContextMenu($event)'>
    <div class='labelRow'>
      <div class='metadataLabels'
        v-for='(field, fIdx) in mdFields'
        :style='{
          "width": colWidths[fIdx] + "px",
          "max-width": fIdx === 0 ? "" : colWidths[fIdx] + "px",
          "min-width": mincolWidths[fIdx] + "px",
          "flex-grow": fIdx === 0 ? 1 : 0,
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
        :class='`aeRowHolder ${permissionToViewAE(ae) ? "" : "disabled"}`' 
        v-for='(ae, aeIdx) in audioEvents'
        :style='{ "min-height": getAERowHeight(ae) + "px" }'
        :id='`aeRowHolder${aeIdx}`'
        >
        <div 
          :class='aeRowClass(aeIdx, audioEvents)'
          :id='`aeRow${aeIdx}`'
          @dblclick='toggleDisplay($event, ae, true)'
          >
          <div 
            class='metadataLabels'
            v-for='(field, fIdx) in mdFields'
            :style='{
              "width": colWidths[fIdx] + "px",
              "max-width": fIdx === 0 ? "" : colWidths[fIdx] + "px",
              "min-width": mincolWidths[fIdx] + "px",
              "flex-grow": fIdx === 0 ? 1 : 0,
            }'
            >
            <span class='field'>
              <span 
                class='tri' 
                v-if='fIdx === 0' 
                @click='toggleDisplay($event, ae, false)'
                >&#9654;</span>
              {{ field.func(ae) }}
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
          class='recsHolder'
          :style='{ "min-height": getAERowHeight(ae) - rowHeight + "px" }'
          v-if='ae.visible'
          >
          <div class='recsLabelRow'>
            <div class='recsMetadataLabels' 
              v-for='(field, fIdx) in recmdFields'
              :style='{
                "width": reccolWidths[fIdx] + "px",
                "max-width": fIdx === 1 ? "" : reccolWidths[fIdx] + "px",
                "min-width": recMincolWidths[fIdx] + "px",
                "flex-grow": fIdx === 1 ? 1 : 0,
                "position": "relative",
              }'
              >
              <span class='field'>
                {{ field.name }}
              </span>
              <div 
                class='draggableBorder'
                draggable='true'
                @dragstart='recHandleDragStart(fIdx, $event)'
                @drag='recHandleDrag(fIdx, $event)'
                @dragend='recHandleDragEnd(fIdx, $event)'
                >
              </div>
            </div>
          </div>
          <div 
            :class='`recRow \
      ${permissionToViewRec(ae.recordings[Number(recKey)]) ? "" : "disabled"}`'
            v-for='(recKey, recIdx) in Object.keys(ae.recordings)'
            @dblclick='handleDblClick($event, ae, recKey)'
            :id='`ae${aeIdx}rec${recIdx}`'
            >
            <div 
              :class='recClass(recIdx, aeIdx, audioEvents)'
              v-for='(field, fIdx) in recmdFields'
              :style='{
                "width": reccolWidths[fIdx] + "px",
                "max-width": fIdx === 1 ? "" : reccolWidths[fIdx] + "px",
                "min-width": recMincolWidths[fIdx] + "px",
                "flex-grow": fIdx === 1 ? 1 : 0,
              }'
              >
              <span class='field'>
                {{ field.func(ae.recordings[Number(recKey)]) }}
              </span>
              <div 
                class='draggableBorder'
                draggable='true'
                @dragstart='recHandleDragStart(fIdx, $event)'
                @drag='recHandleDrag(fIdx, $event)'
                @dragend='recHandleDragEnd(fIdx, $event)'
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { displayTime } from '@/ts/utils';
import { 
  RecType, 
  AudioEventType 
} from '@shared/types';
import { getAEsFromIds } from '@/js/serverCalls';

type MiniAudioEventsDataType = {
  audioEvents: AudioEventType[],
  mdFields: {
    name: string,
    func: (ae: AudioEventType) => string,
    sortState: 'up' | 'down',
    sortType?: string
  }[],
  recmdFields: {
    name: string,
    func: (rec: RecType) => string,
  }[],
  colWidths: number[],
  mincolWidths: number[],
  initialWidths: number[],
  reccolWidths: number[],
  recMincolWidths: number[],
  recInitialWidths: number[],
  selectedSortIdx: number,
  labelRowHeight: number,
  initialMouseX?: number,
  indentWidth: number,
  rowHeight: number,
  playingId: string | undefined
  
}

export default defineComponent({
  name: 'MiniAudioEvents',
  data(): MiniAudioEventsDataType {
    return {
      audioEvents: [],
      mdFields: [
        {
          name: 'Title',
          func: (ae: AudioEventType) => ae.name,
          sortState: 'down',
          sortType: 'title'
        },
        {
          name: 'Primary Soloist',
          func: this.getSoloist as (ae: AudioEventType) => string,
          sortState: 'down',
          sortType: 'soloist'
        },
        { 
          name: 'Event Type',
          func: (ae: AudioEventType) => ae['event type'],
          sortState: 'down',
          sortType: 'eventType'
        },
        {
          name: 'Recordings', // number of recordings
          func: (ae: AudioEventType) => {
            return Object.keys(ae.recordings).length.toString();
          },
          sortState: 'down',
          sortType: 'numRecs'
        },
        {
          name: 'Total Duration',
          func: (ae: AudioEventType) => {
            const recKeys = Object.keys(ae.recordings);
            let totalDuration = 0;
            recKeys.forEach(recKey => {
              const rec = ae.recordings[Number(recKey)];
              totalDuration += rec.duration;
            });
            return displayTime(totalDuration);
          },
          sortState: 'down',
          sortType: 'totalDuration'
        }
      ],

      colWidths: [200, 150, 150, 125, 140],
      initialWidths: [200, 150, 150, 125, 140],
      mincolWidths: [80, 150, 120, 125, 140],
      reccolWidths: [140, 160, 150, 150, 125],
      recInitialWidths: [140, 160, 150, 150, 125],
      recMincolWidths: [70, 80, 70, 80, 80],
      selectedSortIdx: 0,
      labelRowHeight: 40,
      initialMouseX: undefined,
      recmdFields: [
        {
          name: 'Track #',
          func: (rec: RecType) => {
            return rec.parentTrackNumber ? rec.parentTrackNumber : 'None';
          }, 
        },
        {
          name: 'Soloist',
          func: (rec: RecType) => {
            const keys = Object.keys(rec.musicians).filter(key => {
              return rec.musicians[key].role === 'Soloist';
            });
            if (keys.length > 0) {
              return keys[0];
            } else {
              return 'Unknown';
            }         
          },
        },
        {
          name: 'Raag',
          func: (rec: RecType) => {
            return Object.keys(rec.raags).join(', ');
          },
        },
        {
          name: 'Section',
          func: (rec: RecType) => {
            const raags = Object.keys(rec.raags);
            return raags.map(raag => {
              if (rec.raags[raag]['performance sections']) {
                return Object.keys(rec.raags[raag]['performance sections']!);
              } else {
                return []; 
              }
            }).flat().join(', ');
          }
        },
        {
          name: 'Duration',
          func: (rec: RecType) => {
            return displayTime(rec.duration);
          },
        },
      ],
      indentWidth: 20,
      rowHeight: 40,
      playingId: undefined
    }
  },
  props: {
    aeIds: {
      type: Array as PropType<string[]>,
      required: true
    },
  },

  watch: {

    async aeIds() {
      try {
        await this.updateAudioEvents();
      } catch (err) {
        console.log(err);
      }
    }
    
  },

  async mounted() {
    const summedWidths = this.colWidths.reduce((a, b) => a + b, 0);
    const ratio = this.$el.offsetWidth / summedWidths;
    this.colWidths = this.colWidths.map(w => w * ratio);
    this.initialWidths = this.colWidths.slice();

    const fullRecWidth = this.reccolWidths.reduce((a, b) => a + b, 0);
    const rRatio = (this.$el.offsetWidth - this.indentWidth) / fullRecWidth;
    this.reccolWidths = this.reccolWidths.map(w => w * rRatio);
    this.recInitialWidths = this.reccolWidths.slice();

    // handle resizing
    window.addEventListener('resize', () => {
      const summedWidths = this.colWidths.reduce((a, b) => a + b, 0);
      const ratio = this.$el.offsetWidth / summedWidths;
      this.colWidths = this.colWidths.map(w => w * ratio);
      this.initialWidths = this.colWidths.slice();

      const fullRecWidth = this.reccolWidths.reduce((a, b) => a + b, 0);
      const rRatio = (this.$el.offsetWidth - this.indentWidth) / fullRecWidth;
      this.reccolWidths = this.reccolWidths.map(w => w * rRatio);
      this.recInitialWidths = this.reccolWidths.slice();
    });
    try {
      this.audioEvents = await getAEsFromIds(this.aeIds);
      // add parentTrackNumber to each recording
      this.audioEvents.forEach(ae => {
        const recKeys = Object.keys(ae.recordings);
        recKeys.forEach(recKey => {
          const rec = ae.recordings[Number(recKey)];
          rec.parentTrackNumber = recKey;
        });
      });

    } catch (err) {
      console.log(err);
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', () => {
      const summedWidths = this.colWidths.reduce((a, b) => a + b, 0);
      const ratio = this.$el.offsetWidth / summedWidths;
      this.colWidths = this.colWidths.map(w => w * ratio);
      this.initialWidths = this.colWidths.slice();

      const fullRecWidth = this.reccolWidths.reduce((a, b) => a + b, 0);
      const rRatio = (this.$el.offsetWidth - this.indentWidth) / fullRecWidth;
      this.reccolWidths = this.reccolWidths.map(w => w * rRatio);
      this.recInitialWidths = this.reccolWidths.slice();
    });
  },
  components: {
  },
  computed: {
  },

  methods: {

    permissionToViewRec(recording: RecType) {
      const ep = recording.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.publicView || 
        ep.view.includes(id) || 
        ep.edit.includes(id) ||
        recording.userID === id
    },

    permissionToEditRec(recording: RecType) {
      const ep = recording.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.edit.includes(id) || recording.userID === id
    },

    permissionToViewAE(audioEvent: AudioEventType) {
      const ep = audioEvent.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.publicView || 
        ep.view.includes(id) || 
        ep.edit.includes(id) ||
        audioEvent.userID === id
    },

    permissionToEditAE(audioEvent: AudioEventType) {
      const ep = audioEvent.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.edit.includes(id) || audioEvent.userID === id
    },

    async updateAudioEvents() {
      try {
        this.audioEvents = await getAEsFromIds(this.aeIds);
        // add parentTrackNumber to each recording
        this.audioEvents.forEach(ae => {
          const recKeys = Object.keys(ae.recordings);
          recKeys.forEach(recKey => {
            const rec = ae.recordings[Number(recKey)];
            rec.parentTrackNumber = recKey;
          });
        });

      } catch (err) {
        console.log(err);
      }
    },

    handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      this.$emit('chirp')
    },

    handleDblClick(e: MouseEvent, ae: AudioEventType, recKey: string) {
      const rec = ae.recordings[Number(recKey)];
      if (this.permissionToViewRec(rec)) {
        const playingElem = document.querySelector('.playing');
        if (playingElem) {
          playingElem.classList.remove('playing');
        }
        // add `.playing` to the clicked element
        let target = e.target as HTMLElement;
        if (target.classList.contains('draggableBorder')) {
          target = target.parentElement!;
        }
        if (target.classList.contains('field')) {
          target = target.parentElement!;
        }
        if (target.classList.contains('recsMetadataLabels')) {
          target = target.parentElement!;
        }
        target.classList.add('playing');
        this.$emit('sendAudioSource', rec.audioFileId, 'audioEvent');
        this.playingId = `ae${this.audioEvents.indexOf(ae)}rec${recKey}`;
      }
      // find any with current class `.playing` and remove it
      
    },

    getAERowHeight(ae: AudioEventType) {
      if (ae.visible === undefined || ae.visible === false ) {
        return this.rowHeight;
      } else {
        const recKeys = Object.keys(ae.recordings);
        let totalHeight = this.rowHeight;
        recKeys.forEach(recKey => {
          const rec = ae.recordings[Number(recKey)];
          totalHeight += this.rowHeight;
        });
        totalHeight += this.rowHeight; // for the rec label row
        return totalHeight;
      }
    },

    sendNextTrack(shuffling: boolean, repeat: boolean) {
      // if .playing, remove it
      const playingElem = document.querySelector('.playing');
      if (playingElem) {
        playingElem.classList.remove('playing');
      }
      // if shuffling, pick a random one
      if (shuffling) {
        const recIds = this.getAllRecElemIds();
        const randomRecId = recIds[Math.floor(Math.random() * recIds.length)];
        const randomAEIdx = Number(randomRecId.split('ae')[1].split('rec')[0]);
        const randomRecIdx = Number(randomRecId.split('ae')[1].split('rec')[1]);
        const randomAE = this.audioEvents[randomAEIdx];
        const randomRecKey = Object.keys(randomAE.recordings)[randomRecIdx];
        const newRec = randomAE.recordings[Number(randomRecKey)];
        this.playingId = `ae${randomAEIdx}rec${randomRecIdx}`;
        this.$emit('sendAudioSource', newRec.audioFileId, 'audioEvent');
        // if exists, add .playing to the new one
        const newElem = document.getElementById(this.playingId!);
        if (newElem) {
          newElem.classList.add('playing');
        }
      } else {
        const recIds = this.getAllRecElemIds();
        const currentIdx = recIds.indexOf(this.playingId!);
        let nextIdx = currentIdx;
          nextIdx += 1;
          if (nextIdx > recIds.length - 1) {
            nextIdx = 0;
          }
          const nextId = recIds[nextIdx];
          const nextAEIdx = Number(nextId.split('ae')[1].split('rec')[0]);
          const nextRecIdx = Number(nextId.split('ae')[1].split('rec')[1]);
          const nextAE = this.audioEvents[nextAEIdx];
          const nextRecKey = Object.keys(nextAE.recordings)[nextRecIdx];
          const nextRec = nextAE.recordings[Number(nextRecKey)];
          this.playingId = `ae${nextAEIdx}rec${nextRecIdx}`;
          this.$emit('sendAudioSource', nextRec.audioFileId, 'audioEvent');
          const newElem = document.getElementById(this.playingId!);
          if (newElem) {
            newElem.classList.add('playing');
          }
      }
      
    },

    sendPrevTrack(shuffling: boolean, repeat: boolean) {
      // if .playing, remove it
      const playingElem = document.querySelector('.playing');
      if (playingElem) {
        playingElem.classList.remove('playing');
      }
      // if shuffling, pick a random one
      if (shuffling) {
        const recIds = this.getAllRecElemIds();
        const randomRecId = recIds[Math.floor(Math.random() * recIds.length)];
        const randomAEIdx = Number(randomRecId.split('ae')[1].split('rec')[0]);
        const randomRecIdx = Number(randomRecId.split('ae')[1].split('rec')[1]);
        const randomAE = this.audioEvents[randomAEIdx];
        const randomRecKey = Object.keys(randomAE.recordings)[randomRecIdx];
        const newRec = randomAE.recordings[Number(randomRecKey)];
        this.playingId = `ae${randomAEIdx}rec${randomRecIdx}`;
        this.$emit('sendAudioSource', newRec.audioFileId, 'audioEvent');
        // if exists, add .playing to the new one
        const newElem = document.getElementById(this.playingId!);
        if (newElem) {
          newElem.classList.add('playing');
        }
      } else {
        const recIds = this.getAllRecElemIds();
        const currentIdx = recIds.indexOf(this.playingId!);
        let prevIdx = currentIdx;
          prevIdx -= 1;
          if (prevIdx < 0) {
            prevIdx = recIds.length - 1;
          }
          const prevId = recIds[prevIdx];
          const prevAEIdx = Number(prevId.split('ae')[1].split('rec')[0]);
          const prevRecIdx = Number(prevId.split('ae')[1].split('rec')[1]);
          const prevAE = this.audioEvents[prevAEIdx];
          const prevRecKey = Object.keys(prevAE.recordings)[prevRecIdx];
          const prevRec = prevAE.recordings[Number(prevRecKey)];
          this.playingId = `ae${prevAEIdx}rec${prevRecIdx}`;
          this.$emit('sendAudioSource', prevRec.audioFileId, 'audioEvent');
          const newElem = document.getElementById(this.playingId!);
          if (newElem) {
            newElem.classList.add('playing');
          }
      }
    },

    toggleDisplay(t: MouseEvent, audioEvent: AudioEventType, parent: boolean) {
      if (!parent) {
        const target = t.target as HTMLElement;
        if (target.classList.contains('rotated')) {
          audioEvent.visible = undefined
        } else {
          audioEvent.visible = true;
        }
        target.classList.toggle('rotated');
        const row = target.parentElement!.parentElement!.parentElement!;
        row.classList.toggle('visible');
      } else {
        let target = t.target as HTMLElement;
        target = target.parentElement!;
        if (target.classList.contains('metadataLabels')) {
          target = target.parentElement!;
        }
        if (target.classList.contains('aeRow')) {
          target = target.querySelector('.tri') as HTMLElement;
          if (target.classList.contains('rotated')) {
            audioEvent.visible = undefined
          } else {
            audioEvent.visible = true;
          }
          target.classList.toggle('rotated')
          const row = target.parentElement!.parentElement!.parentElement!;
          row.classList.toggle('visible');
        } 
      }
      // check if playing id now exists, and if so add .playing class toi t
      this.$nextTick(() => {
        if (this.playingId) {
          const playingElem = document.getElementById(this.playingId!);
          if (playingElem) {
            playingElem.classList.add('playing');
          }
        }
      });
    },

    getAllRecElemIds() {
      const recElemIds: string[] = [];
      this.audioEvents.forEach((ae, aeIdx) => {
        const recKeys = Object.keys(ae.recordings);
        recKeys.forEach((recKey, recIdx) => {
          const rec = ae.recordings[Number(recKey)];
          if (this.permissionToViewRec(rec)) {
            recElemIds.push(`ae${aeIdx}rec${recIdx}`);
          }
        });
      });
      return recElemIds;
    },

    getSoloist(ae: AudioEventType) {
      const recKeys = Object.keys(ae.recordings);
      const soloists: { [key: string]: number } = {};
      recKeys.forEach(recKey => {
        const rec = ae.recordings[Number(recKey)]
        const musicians = rec.musicians;
        const musKeys = Object.keys(musicians);
        musKeys.forEach(musKey => {
          const mus = musicians[musKey];
          if (mus.role === 'Soloist') {
            if (soloists[musKey] !== undefined) {
              soloists[musKey] += 1;
            } else {
              soloists[musKey] = 1;
            }
          }
        })
      });
      const soloistKeys = Object.keys(soloists);
      if (soloistKeys.length === 0) {
        return '';
      } else {
        const soloistVals = soloistKeys.map(key => soloists[key]);
        const idxOfMaxVal = soloistVals.indexOf(Math.max(...soloistVals));
        return soloistKeys[idxOfMaxVal]
      }
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
          const initW = this.initialWidths[fIdx]!;
          const nextInitW = this.initialWidths[fIdx + 1]!;
          const nextMinW = this.mincolWidths[fIdx + 1];
          const deltaX = event.clientX - this.initialMouseX!;
          if (initW + deltaX < 50) {
            return;
          } else if (nextCol && (nextInitW - deltaX < 50)) {
            return
          } else if (initW + deltaX < this.mincolWidths[fIdx]) {
            return
          } else if (nextCol && nextInitW - deltaX < nextMinW) {
            return
          } else {
            this.colWidths[fIdx] = initW + deltaX;
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
      const initW = this.initialWidths[fIdx]!;
      const nextInitW = this.initialWidths[fIdx + 1]!;
      const nextMinW = this.mincolWidths[fIdx + 1];
      if (initW + deltaX < 50) {
        return;
      } else if (nextCol && nextInitW - deltaX < 50) {
        return
      } else if (initW + deltaX < this.mincolWidths[fIdx]) {
        return
      } else if (nextCol && nextInitW - deltaX < nextMinW) {
        return
      } else {
        this.colWidths[fIdx] = initW + deltaX;
        if (nextCol) {
          this.colWidths[fIdx + 1] = nextInitW - deltaX;
        }  
      } 
    },

    recHandleDragStart(fIdx: number, event: DragEvent) {
      // Store the initial mouse position and column widths
      // event.preventDefault();
      this.initialMouseX = event.clientX;
      this.recInitialWidths = this.reccolWidths.slice()
      // make cursor resize until drag end
      document.body.style.cursor = 'col-resize';
    },

    recHandleDrag(fIdx: number, event: DragEvent) {
      const nextCol = fIdx < this.reccolWidths.length - 1;
      // Calculate the new width based on the mouse movement
      document.body.style.cursor = 'col-resize';
        if (event.clientX !== 0) {
          const rInitW = this.recInitialWidths[fIdx]!;
          const nextRInitW = this.recInitialWidths[fIdx + 1]!;
          const nextRMinW = this.recMincolWidths[fIdx + 1];
          const deltaX = event.clientX - this.initialMouseX!;
          if (this.recInitialWidths[fIdx]! + deltaX < 50) {
            return;
          } else if (nextCol && (nextRInitW - deltaX < 50)) {
            return
          } else if (rInitW + deltaX < this.recMincolWidths[fIdx]) {
            return
          } else if (nextCol && nextRInitW - deltaX < nextRMinW) {
            return
          } else {
            this.reccolWidths[fIdx] = rInitW + deltaX;
            if (nextCol) {
              this.reccolWidths[fIdx + 1] = nextRInitW - deltaX;
            }

          }
      }
    },

    recHandleDragEnd(fIdx: number, event: DragEvent) {
      document.body.style.cursor = 'auto';
      const nextCol = fIdx < this.reccolWidths.length - 1;
      const deltaX = event.clientX - this.initialMouseX!;
      const rInitW = this.recInitialWidths[fIdx]!;
      const nextRInitW = this.recInitialWidths[fIdx + 1]!;
      const nextRMinW = this.recMincolWidths[fIdx + 1];
      if (rInitW + deltaX < 50) {
        return;
      } else if (nextCol && nextRInitW - deltaX < 50) {
        return
      } else if (rInitW + deltaX < this.recMincolWidths[fIdx]) {
        return
      } else if (nextCol && nextRInitW - deltaX < nextRMinW) {
        return
      } else {
        this.reccolWidths[fIdx] = rInitW + deltaX;
        if (nextCol) {
          this.reccolWidths[fIdx + 1] = nextRInitW - deltaX;
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
          this.sortRecordings({ sort: field.sortType, fromTop: false });
        } else {
          field.sortState = 'down';
          this.sortRecordings({ sort: field.sortType, fromTop: true });
        }
      } else {
        this.sortRecordings({ 
          sort: field.sortType, 
          fromTop: field.sortState === 'down' 
        });
      }
      this.selectedSortIdx = fIdx;
      document.querySelectorAll('.rotated') 
        .forEach(elem => elem.classList.remove('rotated'));
      this.audioEvents.forEach((ae, aeIdx) => {
        if (ae.visible) {
          console.log('doign this')
          const row = document.getElementById(`aeRow${aeIdx}`);
          if (row) {
            // select '.tri' and add rotated to class list
            const tri = row.querySelector('.tri');
            if (tri) {
              tri.classList.add('rotated');
            }
           }
        }
      })

    },

    titleSorter(a: AudioEventType, b: AudioEventType) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1
      } else {
        return 0;
      }
    },

    soloistSorter(a: AudioEventType, b: AudioEventType) {
      const aSoloist = this.getSoloist(a);
      const bSoloist = this.getSoloist(b);
      if (aSoloist < bSoloist) {
        return -1;
      } else if (aSoloist > bSoloist) {
        return 1
      } else {
        return 0;
      }
    },

    eventTypeSorter(a: AudioEventType, b: AudioEventType) {
      if (a['event type'] < b['event type']) {
        return -1;
      } else if (a['event type'] > b['event type']) {
        return 1
      } else {
        return 0;
      }
    },

    numRecsSorter(a: AudioEventType, b: AudioEventType) {
      const aNumRecs = Object.keys(a.recordings).length;
      const bNumRecs = Object.keys(b.recordings).length;
      if (aNumRecs < bNumRecs) {
        return -1;
      } else if (aNumRecs > bNumRecs) {
        return 1
      } else {
        return 0;
      }
    },

    totalDurationSorter(a: AudioEventType, b: AudioEventType) {
      const aRecKeys = Object.keys(a.recordings);
      let aTotalDuration = 0;
      aRecKeys.forEach(recKey => {
        const rec = a.recordings[Number(recKey)];
        aTotalDuration += rec.duration;
      });
      const bRecKeys = Object.keys(b.recordings);
      let bTotalDuration = 0;
      bRecKeys.forEach(recKey => {
        const rec = b.recordings[Number(recKey)];
        bTotalDuration += rec.duration;
      });
      if (aTotalDuration < bTotalDuration) {
        return -1;
      } else if (aTotalDuration > bTotalDuration) {
        return 1
      } else {
        return 0;
      }
    },

    sortRecordings({
      sort='title',
      fromTop=true
    }:{
      sort?: string,
      fromTop?: boolean
    } = {}) {
      const playingElem = document.querySelector('.playing');
      if (playingElem) {
        playingElem.classList.remove('playing');
      }
      const playingBool = this.playingId !== undefined;
      let oldAEIdx: number;
      let oldAE: AudioEventType;
      let oldRecIdx: number;

      if (playingBool) {
        oldAEIdx = Number(this.playingId!.split('ae')[1].split('rec')[0]);
        oldAE = this.audioEvents[oldAEIdx];
        oldRecIdx = Number(this.playingId!.split('ae')[1].split('rec')[1]);
      }
    
      let sortFunc: (a: AudioEventType, b: AudioEventType) => number;
      if (sort === 'title') {
        sortFunc = this.titleSorter;
      } else if (sort === 'soloist') {
        sortFunc = this.soloistSorter;
      } else if (sort === 'eventType') {
        sortFunc = this.eventTypeSorter;
      } else if (sort === 'numRecs') {
        sortFunc = this.numRecsSorter;
      } else if (sort === 'totalDuration') {
        sortFunc = this.totalDurationSorter;
      } else {
        sortFunc = this.titleSorter;
      }
      this.audioEvents.sort(sortFunc);
      if (!fromTop) {
        this.audioEvents.reverse();
      }
      if (playingBool) {
        const newAEIdx = this.audioEvents.indexOf(oldAE!);
        this.playingId = `ae${newAEIdx}rec${oldRecIdx!}`;
        this.$nextTick(() => {
          const newElem = document.getElementById(this.playingId!);
          if (newElem) {
            newElem.classList.add('playing');
          }
        });
      }
      
    },

    aeRowClass(aeIdx: number, AEs: AudioEventType[]) {
      if (aeIdx === 0) {
        return 'aeRow first';
      } else if (AEs[aeIdx-1].visible) {
        return 'aeRow borderAbove';
      } else {
        return 'aeRow';
      }
    },

    recClass(recIdx: number, aeIdx: number, AEs: AudioEventType[]) {
      const ae = AEs[aeIdx];
      const c1 = recIdx === (Object.keys(ae.recordings).length - 1);
      const c2 = aeIdx === (AEs.length - 1);
      if (c1 && c2) {
        return 'recsMetadataLabels lastRec';
      } else {
        return 'recsMetadataLabels';
      }
    }
  }
})
</script>

<style scoped>

.miniAEMain {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: white;
  box-sizing: border-box;
  border: 1px solid #ccc;
  width: 100%;
  background-image: linear-gradient(black, #1e241e);
}

.miniAEMain *, .miniAEMain *::before, .miniAEMain *::after {
  box-sizing: inherit;
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

.metadataLabels {
  text-align: center;
  border-right: 1px solid grey;
  height: 40px;
  position: relative;
  white-space: nowrap;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  /* justify-content: center; */
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
  /* border-bottom: 1px solid grey; */
}

.fileContainer::-webkit-scrollbar {
  display: none;
}

.aeRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: 40px;
  width: 100%;
  border-bottom: 1px solid grey;
}

.aeRow.first {
  border-top: 1px solid grey;
}

.aeRow.borderAbove {
  border-top: 1px solid grey;

}

.aeRow:hover {
  background-color: #2b332c;
}

.tri {
  color: white;
}

.tri.rotated {
  transform: rotate(90deg);
}

.aeRowHolder {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: center;
  color: white;
  width: 100%;
}

.aeRowHolder.disabled {
  color: grey;
}

.recsHolder {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: center;
  width: calc(100% - 20px);
  margin-left: v-bind(indentWidth + 'px');
  box-sizing: border-box;
  border-left: 1px solid grey;
}

.recsLabelRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: v-bind(rowHeight + 'px');
  width: 100%;
  /* border-bottom: 1px solid grey; */
  box-sizing: border-box;
  background-color: #343A35;
  color: white;
}

.recsMetadataLabels {
  text-align: center;
  border-right: 1px solid grey;
  height: 40px;
  position: relative;
  white-space: nowrap;
  /* margin-left: 5px;
  margin-right: 5px; */
  user-select: none;
  box-sizing: border-box;
  border-bottom: 1px solid grey;
  display: flex;
  align-items: center;
}

.recsMetadataLabels.lastRec {
  border-bottom: 1px solid grey;
}

.recRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: v-bind(rowHeight + 'px');
  width: 100%;
  /* border-bottom: 1px solid grey; */
  box-sizing: border-box;
  background-color: #202621;
  color: white;
}

.recRow.disabled {
  color: grey
}

.recRow:hover {
  background-color: #2b332c;
}

.playing {
  background-color: #3e4a40
}

.visible {
  background-color: #212922
}
</style>
