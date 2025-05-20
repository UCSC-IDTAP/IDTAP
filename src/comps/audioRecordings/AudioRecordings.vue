<template>
  <div class='blackBackground'>
    <FilterableTable
      ref='filterableTable'
      v-if='
        allRecordings.length > 0 && 
        userID !== undefined && 
        allMusicians && 
        allMusicians.length > 0
        '
      :labels='ftLabels'
      :items='allRecordings'
      :userID='userID'
      :canEdit='(permissiontoEdit as UserCheckType)'
      :canView='(canView as UserCheckType)'
      :heightOffset='100'
      :navHeight='navHeight'
      @rightClick='handleRightClickEmit'
      @click='handleClickEmit'
      @doubleClick='handleDoubleClickEmit'
      @searched='resetPlayingHighlight'
    />
  </div>
  <div class='main'>
    <AudioPlayer 
      :audioSource='audioSource'
      :id='audioRecId'
      ref='audioPlayer'
      @emitNextTrack='nextTrack'
    />
  </div>
  <ContextMenu
    :x='dropDownLeft'
    :y='dropDownTop'
    :closed='contextMenuClosed'
    :choices='contextMenuChoices'
    />
  <UploadRecording 
    v-if='!uploadRecModalClosed'
    :navHeight='navHeight'
    :frameView='recModalFrame'
    :recId='editingRecId'  
    @closeModal='handleCloseRecModal'
    @updateFrameView='newVal => recModalFrame = newVal'
    @updateEditingRecId='newVal => editingRecId = newVal'
  />
  <AddToCollection 
    v-if='!addToCollectionModalClosed && selectedRecording'
    :possibleCollections='possibleCols'
    :navHeight='navHeight'
    :recID='selectedRecording._id!'
    addType='recording'
    @close='addToCollectionModalClosed = true'
  />
  <RemoveFromCollection
    v-if='!removeFromCollectionModalClosed && selectedRecording'
    :possibleCollections='removableCols'
    :navHeight='navHeight'
    :recID='selectedRecording._id!'
    removeType='recording'
    @close='removeFromCollectionModalClosed = true'
  />
  <PermissionsModal
    v-if='!permissionsModalClosed && artifactID && selectedRecording &&
      selectedRecording.explicitPermissions'
    :navHeight='navHeight'
    :artifactID='artifactID'
    :explicitPermissions='selectedRecording.explicitPermissions'
    artifactType='audioRecording'
    @close='handleClosePermissionsModal'
    />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import AudioPlayer from '@/comps/audioRecordings/ARAudioPlayer.vue';
import ContextMenu from '@/comps/ContextMenu.vue';
import UploadRecording from '@/comps/audioRecordings/UploadRecording.vue';
import AddToCollection from '@/comps/AddToCollection.vue';
import RemoveFromCollection from '@/comps/RemoveFromCollection.vue';
import { 
  getAllAudioRecordingMetadata, 
  getSortedMusicians,
  getAllTransOfAudioFile,
  deleteRecording,
  getEditableCollections
} from '@/js/serverCalls.ts';
import { displayTime } from '@/ts/utils.ts';
import { 
  CollectionType, 
  ContextMenuOptionType,
  RecType,
  FilterableTableType,
  SortFuncType,
  GetDisplayType,
  UserCheckType,
  MusicianNameType
} from '@shared/types';
import { SortState } from '@shared/enums';
import PermissionsModal from '@/comps/PermissionsModal.vue';
import FilterableTable from '@/comps/FilterableTable.vue';

type AudioRecordingsDataType = {
  audioSource: string | undefined,
  audioRecId: string | undefined,
  allRecordings: RecType[],
  initialMouseX?: number,
  allMusicians?: MusicianNameType[],
  selectedSortIdx: number,
  activeRecording: RecType | undefined,
  contextMenuClosed: boolean,
  contextMenuChoices: ContextMenuOptionType[],
  userID: string | undefined,
  dropDownLeft: number,
  dropDownTop: number,
  dropDownWidth: number,
  dropDownHeight: number,
  uploadRecModalClosed: boolean,
  possibleCols: CollectionType[],
  removableCols: CollectionType[],
  addToCollectionModalClosed: boolean,
  removeFromCollectionModalClosed: boolean,
  selectedRecording: RecType | undefined,
  recModalFrame: 'uploadRec' | 'editRecMetadata',
  editingRecId?: string,
  permissionsModalClosed: boolean,
  artifactID: string | undefined,
  ftLabels: FilterableTableType[],
  playingItemId?: number
}

export default defineComponent({
  name: 'AudioRecordings',
  
  data(): AudioRecordingsDataType {
    return {
      audioSource: undefined,
      audioRecId: undefined,
      allMusicians: undefined,
      allRecordings: [],
      activeRecording: undefined,
      selectedSortIdx: 0,
      contextMenuClosed: true,
      contextMenuChoices: [],
      userID: undefined,
      dropDownLeft: 200,
      dropDownTop: 300,
      dropDownWidth: 180,
      dropDownHeight: 30,
      uploadRecModalClosed: true,
      addToCollectionModalClosed: true,
      removeFromCollectionModalClosed: true,
      possibleCols: [],
      removableCols: [],
      selectedRecording: undefined,
      recModalFrame: 'uploadRec',
      permissionsModalClosed: true,
      artifactID: undefined,
      ftLabels: [
      {
        label: 'Soloist',
        minWidth: 90,
        prioritization: 0,
        sortFunction: this.soloistSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getSoloistDisplay as GetDisplayType
      },
      {
        label: 'Solo Instrument',
        minWidth: 165,
        prioritization: 1,
        sortFunction: this.soloInstSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getSoloInstDisplay as GetDisplayType
      },
      {
        label: 'Raag',
        minWidth: 80,
        prioritization: 2,
        sortFunction: this.raagSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getRaagDisplay as GetDisplayType
      },
      {
        label: 'Performance Section',
        minWidth: 190,
        prioritization: 3,
        sortFunction: this.pSecSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getPSecDisplay as GetDisplayType
      },
      {
        label: 'Title',
        minWidth: 100,
        prioritization: 4,
        sortFunction: this.eventSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getTitleDisplay as GetDisplayType
      },
      {
        label: 'Duration',
        minWidth: 100,
        prioritization: 4,
        sortFunction: this.durSorter as SortFuncType,
        growable: false,
        initSortState: SortState.down,
        getDisplay: this.getDurDisplay as GetDisplayType
      },
      {
        label: 'Audio Event',
        minWidth: 130,
        prioritization: 5,
        sortFunction: this.eventSorter as SortFuncType,
        growable: true,
        initSortState: SortState.down,
        getDisplay: this.getEventDisplay as GetDisplayType
      },
      {
        label: 'Track #',
        minWidth: 80,
        prioritization: 6,
        sortFunction: undefined,
        growable: false,
        initSortState: SortState.down,
        getDisplay: this.getTrackNumDisplay as GetDisplayType
      }
    ],
    playingItemId: undefined
    }
  },

  components: { 
    AudioPlayer, 
    ContextMenu, 
    UploadRecording, 
    AddToCollection,
    RemoveFromCollection,
    PermissionsModal,
    FilterableTable
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    }
  },

  async created() {
    window.addEventListener('keydown', this.handleKeydown);
    if (this.$store.state.userID === undefined) {
      if (this.$cookies.get('userID') === undefined) {
        this.$router.push('/')
      } else {
        this.userID = this.$cookies.get('userID');
      }
    } else {
      this.userID = this.$store.state.userID;
    }
    try {
      this.allRecordings = await getAllAudioRecordingMetadata();
      // this is not necessary, since sorting is now happening in the filterable
      // table component. But also doesn't really hurt anything.
      this.allMusicians = await getSortedMusicians(true) as { 
        'First Name'?: string,
        'Last Name'?: string,
        'Initial Name': string,
        'Middle Name'?: string,
      }[];
    } catch (err) {
      console.log(err);
    }
  },

  beforeUnmount() {
    const audioPlayer = this.$refs.audioPlayer as typeof AudioPlayer;
    audioPlayer.audio.pause();
    window.removeEventListener('keydown', this.handleKeydown);
  },
  
  methods: {

    resetPlayingHighlight() {
      const playingElem = document.querySelector('.playingRec');
      if (playingElem) playingElem.classList.remove('playingRec');
      const ft = this.$refs.filterableTable as typeof FilterableTable;
      // get index of playing item
      const rec = this.activeRecording;
      const recIdx = ft.items.indexOf(rec);
      const unmapped = ft.itemIdxMapping.indexOf(recIdx);
      const el = document.querySelector(`#row${unmapped}`);
      el?.classList.add('playingRec');
    },

    getSoloistDisplay(rec: RecType) {
      const keys = Object.keys(rec.musicians).filter(key => {
        return rec.musicians[key].role === 'Soloist';
      });
      if (keys.length > 0) {
        return keys[0];
      } else {
        return 'Unknown';
      }         
    },

    getSoloInstDisplay(rec: RecType) {
      const keys = Object.keys(rec.musicians).filter(key => {
        return rec.musicians[key].role === 'Soloist';
      });
      if (keys.length > 0) {
        return rec.musicians[keys[0]].instrument;
      } else {
        return '';
      }         
    },

    getRaagDisplay(rec: RecType) {
      return Object.keys(rec.raags).join(', ');
    },

    getPSecDisplay(rec: RecType) {
      const raags = Object.keys(rec.raags);
      return raags.map(raag => {
        if (rec.raags[raag]['performance sections']) {
          return Object.keys(rec.raags[raag]['performance sections']!);
        } else {
          return []; 
        }
      }).flat().join(', ');
    },

    getDurDisplay(rec: RecType) {
      return displayTime(rec.duration);
    },

    getEventDisplay(rec: RecType) {
      return rec.parentTitle !== undefined && rec.parentTitle !== null ? 
        rec.parentTitle : 
        'None';
    },

    getTitleDisplay(rec: RecType) {
      return rec.title ? rec.title : '';
    },

    getTrackNumDisplay(rec: RecType) {
      return rec.parentTrackNumber !== undefined ? 
        Number(rec.parentTrackNumber) : 
        'None';
    },

    canView(recording: RecType, userID: string) {
      const ep = recording.explicitPermissions!;
      return (
        ep!.view.includes(userID) ||
        ep!.edit.includes(userID) ||
        ep!.publicView ||
        recording.userID === userID
      ); 
    },

    permissiontoEdit(recording: RecType, userID: string) {
      const ep = recording.explicitPermissions!;
      return (
        ep!.edit.includes(userID!) ||
        recording.userID === userID
      );
    },

    async handleClosePermissionsModal() {
      this.permissionsModalClosed = true;
      try {
        this.allRecordings = await getAllAudioRecordingMetadata();
      } catch (err) {
        console.log(err);
      }
    },

    async handleCloseRecModal() {
      this.uploadRecModalClosed = true;
      try {
        this.allRecordings = await getAllAudioRecordingMetadata();
      } catch (err) {
        console.log(err);
      }
    },

    nextTrack(shuffling: boolean, initial: boolean) {
      const ft = this.$refs.filterableTable as typeof FilterableTable;
      if (this.activeRecording) {
        const playingElem = document.querySelector('.playingRec');
        if (playingElem) playingElem.classList.remove('playingRec');
        if (!shuffling) {
          const recIdx = ft.items.indexOf(this.activeRecording);
          const unmapped = ft.itemIdxMapping.indexOf(recIdx);
          const nextUnmapped = (unmapped + 1) % ft.itemIdxMapping.length;
          const nextIdx = ft.itemIdxMapping[nextUnmapped];
          this.activeRecording = ft.items[nextIdx];
          const nextElem = document.getElementById(`row${nextUnmapped}`);
          if (nextElem) nextElem.classList.add('playingRec');
          const id = this.activeRecording!._id;
          this.audioSource = `Https://swara.studio/audio/mp3/${ id }.mp3`;
        } else {
          // randomly choose from the list of presently displayed items
          const idx = Math.floor(Math.random() * ft.itemIdxMapping.length);
          const nextIdx = ft.itemIdxMapping[idx];
          this.activeRecording = ft.items[nextIdx];
          const nextElem = document.getElementById(`row${idx}`);
          if (nextElem) nextElem.classList.add('playingRec');
          const id = this.activeRecording!._id;
          this.audioSource = `Https://swara.studio/audio/mp3/${ id }.mp3`;

        }
      } else {
        if (!shuffling) {
          const idx = 0;
          const nextIdx = ft.itemIdxMapping[idx];
          this.activeRecording = ft.items[nextIdx];
          const nextElem = document.getElementById(`row${idx}`);
          if (nextElem) nextElem.classList.add('playingRec');
          const id = this.activeRecording!._id;
          this.audioSource = `Https://swara.studio/audio/mp3/${ id }.mp3`;
        } else {
          
          const idx = Math.floor(Math.random() * ft.itemIdxMapping.length);
          const nextIdx = ft.itemIdxMapping[idx];
          this.activeRecording = ft.items[nextIdx];
          const nextElem = document.getElementById(`row${idx}`);
          if (nextElem) nextElem.classList.add('playingRec');
          const id = this.activeRecording!._id;
          this.audioSource = `Https://swara.studio/audio/mp3/${ id }.mp3`;
        }
      }
    },

    handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.contextMenuClosed = true;
      }
    },

    handleClickEmit() {
      this.contextMenuClosed = true;
    },

    handleDoubleClickEmit(rec: RecType, target: HTMLElement) {
      if (this.canView(rec, this.userID!)) {
        this.sendAudioSource(target, rec);
      }
    },

    async handleRightClickEmit(rec: RecType, e: MouseEvent) {
      this.dropDownLeft = e.clientX;
      this.dropDownTop = e.clientY;
      this.contextMenuClosed = !this.contextMenuClosed;
      const fTable = this.$refs.filterableTable as typeof FilterableTable;
      const fileContainer = fTable.$refs.fileContainer as HTMLElement;
      const rect = fileContainer.getBoundingClientRect();
      if (this.dropDownLeft + this.dropDownWidth > rect.width - 20) {
        this.dropDownLeft = rect.width - 30 - this.dropDownWidth;
      }
      const editable = this.permissiontoEdit(rec, this.userID!);
      const viewable = this.canView(rec, this.userID!);
      const owned = rec.userID === this.userID;
      this.contextMenuChoices = [];
      this.contextMenuChoices.push({
        text: 'New Transcription',
        action: () => {
          let query: {
            aeName?: string,
            afName?: string,
            recID?: string
          } = {
            aeName: JSON.stringify(rec.parentTitle),
            afName: JSON.stringify(this.getShorthand(rec)),
          }
          if (rec.parentTitle === null) {
            query.recID = rec._id;
          }
          this.$router.push({
            name: 'Transcriptions',
            query
          })
          this.contextMenuClosed = true;
        },
        enabled: viewable
      });
      this.contextMenuChoices.push({
        text: 'Edit Recording',
        action: () => {
          this.openRecordingModal({ editing: true, recId: rec._id })
          this.contextMenuClosed = true;
        },
        enabled: editable
      });
      this.contextMenuChoices.push({
        text: 'Edit Permissions',
        action: () => {
          this.artifactID = rec._id!;
          this.permissionsModalClosed = false;
          this.contextMenuClosed = true;
          this.selectedRecording = rec
        },
        enabled: owned
      });
      this.contextMenuChoices.push({
        text: 'Delete Recording',
        action: async () => {
          this.contextMenuClosed = true;
          try { 
            await deleteRecording(rec._id!);
            this.allRecordings = await getAllAudioRecordingMetadata();
            const fTable = this.$refs.filterableTable as typeof FilterableTable;
            fTable.toggleSort(fTable.selectedSortIdx, true);
          } catch (err) {
            console.log(err); 
          }
        },
        enabled: owned
      });
      this.contextMenuChoices.push({
        text: 'Upload New Recording',
        action: () => {
          this.recModalFrame = 'uploadRec';
          this.openUploadModal();
          this.contextMenuClosed = true;
        },
        enabled: true
      });
      try {
        this.possibleCols = await getEditableCollections(this.userID!);
        if (this.possibleCols.length > 0) {
          this.contextMenuChoices.push({
            text: 'Add to Collection',
            action: () => {
              this.selectedRecording = rec;
              this.contextMenuClosed = true;
              this.addToCollectionModalClosed = false;
            },
            enabled: viewable
          });
          this.removableCols = this.possibleCols.filter(col => {
            return col.audioRecordings.includes(rec._id!);
          })
          if (this.removableCols.length > 0) {
            this.contextMenuChoices.push({
              text: 'Remove from Collection',
              action: () => {
                this.selectedRecording = rec;
                this.contextMenuClosed = true;
                this.removeFromCollectionModalClosed = false;
              },
              enabled: true
            })
          }
        }
        const tChoices = await getAllTransOfAudioFile(
          rec._id!, 
          this.userID!
        );
        tChoices.forEach(tc => {
          this.contextMenuChoices.push({
            text: `Open file: "${tc.title}" by ${tc.name}`,
            action: () => {
              this.$store.commit('update_id', tc._id);
              this.$cookies.set('currentPieceID', tc._id);
              this.$router.push({
                name: 'EditorComponent',
                  query: { id: tc._id }
              })
            },
            enabled: true
          })
        })
        this.dropDownHeight = this.contextMenuChoices.length * 30;
        const topPartHeight = rect.height + rect.top;
        if (this.dropDownTop + this.dropDownHeight > topPartHeight - 10) {
          this.dropDownTop = topPartHeight - 10 - this.dropDownHeight;
        }
      } catch (err) {
        console.log(err);
      }
    },

    getShorthand(rec: RecType) {
      const out: string[] = [];
      const raagNames = Object.keys(rec.raags);
      raagNames.forEach(rn => {
        const raag = rec.raags[rn];
        const pSecsObj = raag['performance sections'];
        if (pSecsObj === undefined) {
          throw new Error('no pSecsObj')
        }
        out.push(rn, ' - ');
        const pSecs = Object.keys(pSecsObj);
        pSecs.forEach((pSec, i) => {
          out.push(pSec, i !== pSecs.length - 1 ? ', ' : '; ');
        })
      })
      return out.join('')
    },

    eventSorter(a: RecType, b: RecType) {
      const apt = a.parentTitle;
      const bpt = b.parentTitle;
      const aptUndefined = apt === undefined || apt === null;
      const bptUndefined = bpt === undefined || bpt === null;
      if (aptUndefined && bptUndefined) {
        return 0;
      } else if (aptUndefined && !bptUndefined) {
        return 1;
      } else if (!aptUndefined && bptUndefined) {
        return -1;
      } else {
        const aTitleLower = apt ? apt.toLowerCase() : '';
        const bTitleLower = bpt? bpt.toLowerCase() : '';

        if (aTitleLower < bTitleLower) {
          return -1;
        } else if (aTitleLower > bTitleLower) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    durSorter(a: RecType, b: RecType) {
      if (a.duration > b.duration) {
        return -1;
      } else if (a.duration < b.duration) {
        return 1;
      } else {
        return 0;
      }
    },

    pSecSorter(a: RecType, b: RecType) {
      const aPSec = Object.keys(a.raags).map(raag => {
        if (a.raags[raag]['performance sections']) {
          return Object.keys(a.raags[raag]['performance sections']!);
        } else {
          return []; 
        }
      }).flat()[0];
      const bPSec = Object.keys(b.raags).map(raag => {
        if (b.raags[raag]['performance sections']) {
          return Object.keys(b.raags[raag]['performance sections']!);
        } else {
          return []; 
        }
      }).flat()[0];
      if (aPSec === undefined && bPSec === undefined) {
        return 0;
      } else if (aPSec === undefined && bPSec !== undefined) {
        return 1;
      } else if (aPSec !== undefined && bPSec === undefined) {
        return -1;
      } else if (aPSec === 'undefined') {
        if (bPSec === 'undefined') {
          return 0
        } else if (bPSec === undefined) {
          return -1;
        } else {
          return 1;
        }
      } else if (bPSec === 'undefined') {
        if (aPSec === undefined) {
          return 1;
        } else {
          return -1;
        }
      } else if (aPSec === 'Unknown') {
        if (bPSec === 'Unknown') {
          return 0;
        } else if (bPSec === undefined || bPSec === 'undefined') {
          return -1;
        } else {
          return 1;
        }
      } else if (bPSec === 'Unknown') {
        if (aPSec === undefined || aPSec === 'undefined') {
          return 1;
        } else {
          return -1;
        }
      
      } else {
        if (aPSec < bPSec) {
          return -1;
        } else if (aPSec > bPSec) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    raagSorter(a: RecType, b: RecType) {
      const aRaag = Object.keys(a.raags)[0];
      const bRaag = Object.keys(b.raags)[0];
      if (aRaag === undefined && bRaag === undefined) {
        return 0;
      } else if (aRaag === undefined && bRaag !== undefined) {
        return 1;
      } else if (aRaag !== undefined && bRaag === undefined) {
        return -1;
      } else if (aRaag === 'undefined') {
        if (bRaag === 'undefined') {
          return 0
        } else if (bRaag === undefined) {
          return -1;
        } else {
          return 1;
        }
      } else if (bRaag === 'undefined') {
        if (aRaag === undefined) {
          return 1;
        } else {
          return -1;
        }
      } else if (aRaag === 'Unknown') {
        if (bRaag === 'Unknown') {
          return 0;
        } else if (bRaag === undefined || bRaag === 'undefined') {
          return -1;
        } else {
          return 1;
        }
      } else if (bRaag === 'Unknown') {
        if (aRaag === undefined || aRaag === 'undefined') {
          return 1;
        } else {
          return -1;
        }
      
      } else {
        if (aRaag < bRaag) {
          return -1;
        } else if (aRaag > bRaag) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    trackNumSorter(a: RecType, b: RecType) {
      const ptn = (rec: RecType) => rec.parentTrackNumber;
      if (ptn(a) === undefined && ptn(b) === undefined) {
        return 0;
      } else if (ptn(a) === undefined && ptn(b) !== undefined) {
        return 1;
      } else if (ptn(a) !== undefined && ptn(b) === undefined) {
        return -1;
      } else {
        if (ptn(a)! < ptn(b)!) {
          return -1;
        } else if (ptn(a)! > ptn(b)!) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    soloistSorter(a: RecType, b: RecType) {
      // get last name by looking up soloist in allMusicians array,
      // then sort by last name, then first name, then middle name. If there 
      // is no last name, put after all other last names. If solist is Unknown,
      // put at the end
      const aSoloist = Object.keys(a.musicians).filter(key => {
        return a.musicians[key].role === 'Soloist';
      })[0];
      const bSoloist = Object.keys(b.musicians).filter(key => {
        return b.musicians[key].role === 'Soloist';
      })[0];
      if (aSoloist === 'Unknown') {
        return 1;
      } else if (bSoloist === 'Unknown') {
        return -1;
      } else if (aSoloist === undefined) {
        return 1;
      } else if (bSoloist === undefined) {
        return -1;
      } else {
        const aObj = this.allMusicians!.find(musician => {
          return musician['Initial Name'] === aSoloist;
        })
        const bObj = this.allMusicians!.find(musician => {
          return musician['Initial Name'] === bSoloist;
        })
        if (aObj === undefined && bObj === undefined) {
          return 0;
        } else if (aObj === undefined && bObj !== undefined) {
          return 1;
        } else if (aObj !== undefined && bObj === undefined) {
          return -1;
        } else {
          const aLastName = aObj!['Last Name'];
          const bLastName = bObj!['Last Name'];
          if (aLastName === undefined) {
            return 1;
          } else if (bLastName === undefined) {
            return -1;
          } else {
            const aFirstName = this.allMusicians!.find(musician => {
              return musician['Initial Name'] === aSoloist;
            })!['First Name'];
            const bFirstName = this.allMusicians!.find(musician => {
              return musician['Initial Name'] === bSoloist;
            })!['First Name'];
            const aMidName = this.allMusicians!.find(musician => {
              return musician['Initial Name'] === aSoloist;
            })!['Middle Name'];
            const bMidName = this.allMusicians!.find(musician => {
              return musician['Initial Name'] === bSoloist;
            })!['Middle Name'];
            if (aLastName < bLastName) {
              return -1;
            } else if (aLastName > bLastName) {
              return 1;
            } else {
              if (aFirstName !== undefined && bFirstName === undefined) {
                return -1;
              } else if (aFirstName === undefined && bFirstName !== undefined) {
                return 1;
              } else if (aFirstName === undefined && bFirstName === undefined) {
                return 0;
              } else {
                if (aFirstName! < bFirstName!) {
                  return -1;
                } else if (aFirstName! > bFirstName!) {
                  return 1;
                } else {
                  if (aMidName !== undefined && bMidName === undefined) {
                    return -1;
                  } else if (aMidName === undefined && bMidName !== undefined) {
                    return 1;
                  } else if (aMidName === undefined && bMidName === undefined) {
                    return 0;
                  } else {
                    if (aMidName! < bMidName!) {
                      return -1;
                    } else if (aMidName! > bMidName!) {
                      return 1;
                    } else {
                      return 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    soloInstSorter(a: RecType, b: RecType ) {
      const aSoloistKey = Object.keys(a.musicians).filter(key => {
        return a.musicians[key].role === 'Soloist';
      })[0];
      const aSoloInst = aSoloistKey !== undefined ? 
        a.musicians[aSoloistKey].instrument : undefined;
      const bSoloistKey = Object.keys(b.musicians).filter(key => {
        return b.musicians[key].role === 'Soloist';
      })[0];
      const bSoloInst = bSoloistKey !== undefined ? 
        b.musicians[bSoloistKey].instrument : undefined;
      if (aSoloInst === undefined && bSoloInst === undefined) {
        return 0;
      } else if (aSoloInst === undefined && bSoloInst !== undefined) {
        return 1;
      } else if (aSoloInst !== undefined && bSoloInst === undefined) {
        return -1;
      } else {
        if (aSoloInst! < bSoloInst!) {
          return -1;
        } else if (aSoloInst! > bSoloInst!) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    sendAudioSource(target: HTMLElement, recording: RecType) {
      const audioFileId = recording._id; 
      if (target.tagName === 'SPAN') {
        target = target.parentElement!;
        if (target.classList.contains('metadataLabels')) {
          target = target.parentElement!;
        }
      };
      const playingElem = document.querySelector('.playingRec');
      if (playingElem) {
        playingElem.classList.remove('playingRec');
      }
      target.classList.add('playingRec');
      const rowIdx = parseInt(target.id.slice(3));
      const ft = this.$refs.filterableTable as typeof FilterableTable;
      const unmappedIdx = ft.itemIdxMapping[rowIdx];
      this.playingItemId = unmappedIdx;
      this.audioSource = `Https://swara.studio/audio/mp3/${audioFileId}.mp3`;
      this.activeRecording = recording;
    },

    openRecordingModal({ 
      editing = true, 
      recId = undefined 
    }: { 
      editing?: boolean,
      recId?: string 
    } = {}) {
      // console.log(`open recording modal, ${editing}`);
      this.uploadRecModalClosed = false;
      this.recModalFrame = editing ? 'editRecMetadata' : 'uploadRec';
      if (editing) {
        this.editingRecId = recId;
      }
    },

    openUploadModal() {
      this.uploadRecModalClosed = false;
    }
  }
})
</script>

<style scoped>

.main {
  background-color: black;
  background-image: linear-gradient(black, #1e241e);
  color: white;
}



:deep(.playingRec) {
  background-color: #3e4a40;

}

.blackBackground {
  background-color: black;
  height: 100%;
}

</style>
