<template>
  <div class="modal">
    <div class="modal-content">
      <div class='modalFrame' v-if='frameView === "uploadRec"'>
        <h2>Upload Recording</h2>
        <div class='modalRow'>
          <input 
            type="file" 
            @change="handleFileChange" 
            accept="audio/*"
            ref='file'
            />
        </div>
        <div class='modalRow taller'>
          <div class='subColumn'>
            <div class='subRow' v-if='allAudioEvents.length > 0'>
              <input 
                type='radio' 
                id='addToAudioEvent' 
                value='addToAudioEvent' 
                name='uploadType'
                v-model='aeChoice'>
              <label for='addToAudioEvent'>Add to Audio Event</label>
            </div>
            <div class='subRow'>
              <input 
                type='radio' 
                id='createNewAudioEvent' 
                value='createNewAudioEvent' 
                name='uploadType'
                v-model='aeChoice'>
              <label for='createNewAudioEvent'>Create New Audio Event</label>
            </div>
            <div class='subRow'>
              <input 
                type='radio' 
                id='noAudioEvent' 
                value='noAudioEvent' 
                name='uploadType'
                v-model='aeChoice'>
              <label for='noAudioEvent'>No Audio Event</label>
            </div>
          </div>
          <div class='subColumn' v-if='aeChoice === "addToAudioEvent"'>
            <select v-model='selectedAE'>
              <option 
                v-for='(ae, i) in allAudioEvents' 
                :key='i'
                :value='ae'
                >
                {{ae.name}}
              </option>
            </select>
          </div>
          <div 
            class='subColumn newAE' 
            v-if='aeChoice === "createNewAudioEvent"'
            >
            <div class='subRow'>
              <label>Event Name</label>
              <input type='text' class='textInput' v-model='newAEName'>
            </div>
            <div class='subRow'>
              <label>Event Type</label>
              <select v-model='newAEType'>
                <option 
                  v-for='(aeType, i) in aeTypes' 
                  :key='i'
                  :value='aeType'
                  >
                  {{aeType}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class='modalRow'>
          <button 
            @click="uploadRecording" 
            :disabled='uploadButtonDisabled'
            v-if='!uploadDone && !processingDone'
            >
            Upload
          </button>
          <div class='progressContainer' v-if='!uploadDone'>
            <div class='progress'></div>
          </div>
          <div v-if='uploadDone && !processingDone'>
            Processing...
          </div>
          <audio 
            controls 
            v-if='processingDone'
            ref='audio'
            >
            <source :src='`https://swara.studio/audio/mp3/${audioFileId}.mp3`'>
        </audio>
        </div>
      </div>
      <div class='modalFrame' v-if='frameView === "editRecMetadata"'>
        <h2>Edit Recording Metadata</h2>
        <div class='modalRow'>
          <audio 
            controls 
            ref='audio'
            >
            <source :src='`https://swara.studio/audio/mp3/${audioFileId}.mp3`'>
          </audio>
        </div>

        <div class='editingSubFrame' v-if='editRecIdx === 0'>
          <div class='modalRow'>
            <label>Title</label>
            <input type='text' v-model='recTitle'>
          </div>
          <div class='modalRow numMusicians'>
            <label>Number of Musicians</label>
            <input 
              type='number' 
              v-model='numMusicians' 
              min='0' 
              max='6'
              step='1'
              @input='updateNumMusicians'>
          </div>
          <div class='modalRow tall musicians'>
            <div class='modalCol' v-for='(mus, i) in editMus' :key='i'>
              <div class='modalColRow'>
                <label>Name</label>
                <div class='selHolder'>
                  <select 
                    v-model='mus.name' 
                    @change='mus.name ? handleSelMusChange(mus.name, i) : ""'
                    >
                    <option 
                      v-for='(aMus, amIdx) in allMusicians' 
                      :key='amIdx'
                      :value='aMus["Full Name"]'
                      >
                      {{aMus["Full Name"]}}
                    </option>
                  </select>
                  <input 
                    type='text' 
                    v-model='newMusNames[i]' 
                    v-if='mus.name === "Other"'
                    >
                </div>
              </div>
              <div class='modalColRow'>
                <label>Role</label>
                <select v-model='mus.role'>
                  <option value='Soloist'>Soloist</option>
                  <option value='Accompanist'>Accompanist</option>
                  <option value='Percussionist'>Percussionist</option>
                  <option value='Drone'>Drone</option>
                </select>
              </div>
              <div class='modalColRow'>
                <label>Instrument</label>
                <select v-model='mus.instrument'>
                  <option 
                    v-for='(inst, i) in allInstruments' 
                    :key='i'
                    :value='inst'
                    >
                    {{inst}}
                  </option>
                </select>
                </div>
              <div class='modalColRow'>
                <label>Gharana</label>
                <div class='selHolder'>
                  <select v-model='mus.gharana'>
                    <option 
                      v-for='(gharana, i) in allGharanas' 
                      :key='i'
                      :value='gharana.name'
                      >
                      {{gharana.name}}
                    </option>
                  </select>
                  <input 
                  type='text' 
                  v-model='newGharanas[i]' 
                  v-if='mus.gharana === "Other"'
                  >
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class='editingSubFrame' v-if='editRecIdx === 1'>
          <!-- location -->
          <div class='modalRow'>
            <label>Location</label>
            <select v-model='selectedContinent'>
              <option 
                v-for='(cont, i) in getContinents' 
                :key='i'
                :value='cont'
                >
                {{cont}}
              </option>
            </select>
            <div class='selHolder'>
              <select 
                v-model='selCountry' 
                v-if='selectedContinent !== undefined'>
                <option 
                  v-for='(coun, i) in getCountries' 
                  :key='i'
                  :value='coun'
                  >
                  {{coun}}
                </option>
              </select>
              <input 
                type='text' 
                v-model='newselCountry' 
                v-if='selCountry === "Other (specify)"'
                >
            </div>
            <div class='selHolder'>
              <select 
                v-model='selectedCity' 
                v-if='selCountry !== undefined && selCountry !== "Unknown"'
                >
                <option 
                  v-for='(city, i) in getCities' 
                  :key='i'
                  :value='city'
                  >
                  {{city}}
                </option>
              </select>
              <input 
                type='text' 
                v-model='newSelectedCity' 
                v-if='selectedCity === "Other (specify)"'
                >
            </div>
          </div>
          <!-- date -->
          <div class='modalRow'>
            <label>Date</label>
            <select v-model='selectedYear'>
              <option 
                v-for='(year, i) in getYears' 
                :key='i'
                :value='year'
                >
                {{year}}
              </option>
            </select>
            <select v-model='selectedMonth' v-if='selectedYear !== undefined'>
              <option 
                v-for='(month, i) in months' 
                :key='i'
                :value='month'
                >
                {{month}}
              </option>
            </select>
            <select v-model='selectedDay' v-if='selectedMonth !== undefined'>
              <option 
                v-for='(day, i) in possibleDays' 
                :key='i'
                :value='day'
                >
                {{day}}
              </option>
            </select>
          </div>
          <!-- raag -->
          <div class='modalRow'>
            <label>Raag</label>
            <div class='selHolder'>
              <select v-model='selRaag'>
                <option 
                  v-for='(raag, i) in allRaags' 
                  :key='i'
                  :value='raag'
                  >
                  {{raag}}
                </option>
              </select>
              <input 
                type='text' 
                v-model='newRaag' 
                v-if='selRaag === "Other (specify)"'
                >
            </div>
          </div>
        </div>

        <div class='editingSubFrame' v-if='editRecIdx === 2'>
          <div class='modalRow'>
            <label>Number of Sections</label>
            <input 
              type='number' 
              min='1' 
              max='10' 
              step='1' 
              v-model='numSecs'
              @input='updateNumSecs'
              >
              
          </div>
          <div class='modalRow'>
            <div 
              class='modalCol' 
              v-for='(sec, i) in editingSecs' 
              :key='i'
              v-if='selRaag !== undefined'
              >
              <div class='modalColRow'>
                <label>Section</label>
                <select v-model='sec.name'>
                  <option 
                    v-for='(pSec, i) in performanceSections' 
                    :key='i'
                    :value='pSec'
                    >
                    {{pSec}}
                  </option>
                </select>
                <!-- <input type='text' v-model='sec.name'> -->
              </div>
              
            </div>
            <div v-else>
              Please select a raag first
            </div>
          </div>
        </div>

        <div class='editingSubFrame' v-if='editRecIdx === 3'>
          <div class='modalRow'>
            <label>Visibility</label>
            <select v-model='editingRec!.explicitPermissions!.publicView'>
              <option :value='true'>Public</option>
              <option :value='false'>Private</option>
            </select>
          </div>
          <div class='modalRow'>
            <label>Edit</label>
            <select 
              multiple 
              v-model='editingRec!.explicitPermissions!.edit'
              class='users'>
              <option 
                v-for='(user, i) in allUsers' 
                :key='i'
                :value='user._id'
                >
                {{ `${user.name} , (${user.email})` }}
              </option>
            </select>
          
          
            <label v-if='!editingRec!.explicitPermissions!.publicView'>
              View
            </label>
            <select 
              v-if='!editingRec!.explicitPermissions!.publicView'
              multiple 
              v-model='editingRec!.explicitPermissions!.view'
              class='users'>
              <option 
                v-for='(user, i) in allUsers' 
                :key='i'
                :value='user._id'
                >
                {{ `${user.name} , (${user.email})` }}
              </option>
            </select>
          </div>
        </div>

        <div class='modalRow centered short'>
          <button @click='editRecIdx--' :disabled='editRecIdx===0'>
            {{ "<" }}
          </button>
          <button @click='saveUpdates'>Save Updates</button>
          <button @click='editRecIdx++' :disabled='editRecIdx>2'>
            {{ ">" }}
          </button>
        </div>
        <div class='modalRow centered short'>
          <span>{{ dateModified }}</span>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { 
  getAllAEMetadata, 
  newUploadFile,
  getAudioRecording,
  getAllMusicians,
  getAllGharanas,
  getInstruments,
  getLocationObject,
  getRagaNames,
  getPerformanceSections,
  addMusicianToDB,
  addGharanaToDB,
  addCountryToDB,
  addCityToDB,
  addRaagToDB,
  updateAudioRecording,
  verifySpectrogram,
  verifyMelograph,
  getEventTypes,
  getAllUsers
} from '@/js/serverCalls.ts';
import SaTuner from '@/comps/audioRecordings/SaTuner.vue';
import { 
  MusicianDBType, 
  GharanaType, 
  UserType,
  RecType, 
  PSecType, 
  MusicianType,
  RecUpdateType,
  EditingSecType,
  AudioEventMetadataType,
} from '@shared/types';
type UploadRecordingDataType = {
  progressWidth: number;
  file: File | null;
  aeChoice: string;
  allAudioEvents: AudioEventMetadataType[];
  selectedAE: AudioEventMetadataType | undefined;
  newAEName: string;
  progressContainerWidth: number;
  uploadDone: boolean;
  audioFileId: string;
  processingDone: boolean;
  numFiles: number;
  editingRec?: RecType;
  numMusicians: number;
  allMusicians: MusicianDBType[];
  allGharanas: GharanaType[];
  editMus: {
    name?: string;
    id?: string;
    role?: 'Soloist' | 'Accompanist' | 'Percussionist' | 'Drone';
    gharana?: string,
    instrument?: string,
  }[],
  allInstruments: string[],
  newMusNames: (string | undefined)[],
  newGharanas: (string | undefined)[],
  editRecIdx: number, // which page of metadata editing you're on
  locObj: {[continent: string]: {[country: string]: string[]}},
  selectedContinent?: string,
  selCountry?: string,
  selectedCity?: string,
  months: string[],
  selectedYear?: number,
  selectedMonth?: string,
  selectedDay?: number,
  newselCountry?: string,
  newSelectedCity?: string,
  allRaags: string[],
  selRaag?: string,
  newRaag?: string,
  numSecs: number,
  editingSecs: EditingSecType[],
  performanceSections: string[],
  saEstimate: number,
  saVerified: boolean,
  octOffset: -1 | 0,
  spectrogramExists: boolean,
  melographExists: boolean,
  newAEType?: string,
  aeTypes: string[],
  startedUpload: boolean,
  visible: boolean,
  allUsers: UserType[],
  recTitle: string,
}
export default defineComponent({
  data(): UploadRecordingDataType {
    return {
      progressWidth: 0,
      file: null as File | null,
      aeChoice: 'addToAudioEvent',
      allAudioEvents: [],
      selectedAE: undefined,
      newAEName: '',
      progressContainerWidth: 150,
      uploadDone: false,
      audioFileId: '',
      processingDone: false,
      numFiles: 0,
      editingRec: undefined,
      numMusicians: 1,
      allMusicians: [],
      editMus: [],
      allGharanas: [],
      newMusNames: new Array(6).fill(undefined),
      newGharanas: new Array(6).fill(undefined),
      allInstruments: [],
      editRecIdx: 0,
      locObj: {},
      selectedContinent: undefined,
      selCountry: undefined,
      selectedCity: undefined,
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ], 
      newselCountry: undefined,
      newSelectedCity: undefined,
      selectedYear: undefined,
      selectedMonth: undefined,
      selectedDay: undefined,
      allRaags: [],
      selRaag: undefined,
      newRaag: undefined,
      numSecs: 1,
      editingSecs: [],
      performanceSections: [],
      saEstimate: 0,
      saVerified: false,
      octOffset: 0,
      spectrogramExists: false,
      melographExists: false,
      newAEType: "Unknown",
      aeTypes: [],
      startedUpload: false,
      visible: true,
      allUsers: [],
      recTitle: '',
    };
  },

  components: {
    SaTuner
  },

  computed: {

    dateModified() {
      if (this.editingRec) {
        const date = new Date(this.editingRec.dateModified);
        const optionsDate: Intl.DateTimeFormatOptions = { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        };
        const optionsTime: Intl.DateTimeFormatOptions = { 
          hour: '2-digit', 
          minute: '2-digit' 
        };
        const strDate = date.toLocaleDateString(undefined, optionsDate);
        const strTime = date.toLocaleTimeString(undefined, optionsTime);
        return `Last Modified: ${strDate} ${strTime}`;
      } else {
        return '';
      }
    },
    
    uploadButtonDisabled() {
      return this.numFiles < 1 || this.startedUpload;
    },

    getCountries() {
      if (this.selectedContinent && this.locObj) {
        const countries = Object.keys(this.locObj[this.selectedContinent]);
        return countries.concat(['Unknown', 'Other (specify)'])
      } else {
        return ['Unknown', 'Other (specify)']
      }
    },
    
    getContinents() {
      return this.locObj ? Object.keys(this.locObj) : [];
    },
  
    getCities() {
      const sCont = this.selectedContinent;
      const loc = this.locObj;
      const sCoun = this.selCountry;
      if (sCont && loc && sCoun && loc[sCont][sCoun]) {
        const cities = loc[sCont][sCoun];
        return cities.concat(['Unknown', 'Other (specify)'])
      } else {
        return ['Unknown', 'Other (specify)']
      }
    },
  
    getYears() {
      const stop = (new Date()).getFullYear();
      const start = 1903;
      const len = { length: stop - start + 1 };
      const out: (string | number)[] = Array.from(len, (_, i) => start + i);
      out.push('Unknown')
      return out
    },
  
    possibleDays() {
      if (this.selectedMonth) {
        const monthNum = this.months.indexOf(this.selectedMonth) + 1
        return (new Date(Number(this.selectedYear), monthNum, 0)).getDate()
      } else {
        return 31
      }
      
    },
  },

  async mounted() {
    // esc closes modal
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.$emit('closeModal');
      }
    });
    //  if you click outside modal-content, it closes the modal
    window.addEventListener('click', (e) => {
      const modal = this.$el as HTMLElement;
      if (e.target === modal) {
        this.$emit('closeModal');
      }
    });
    try {
      if (this.recId && this.frameView === 'editRecMetadata') {
        this.audioFileId = this.recId;
        await this.prepareForEditing();
      } else if (this.frameView === 'uploadRec') {
        this.allAudioEvents = await getAllAEMetadata();
        this.allAudioEvents = this.allAudioEvents.filter(ae => {
          return this.permissionToEditAE(ae)
        });
        if (this.allAudioEvents.length === 0) {
          this.aeChoice = 'createNewAudioEvent'
        }
        this.aeTypes = await getEventTypes()
      }
    } catch (err) {
      console.log(err);
    }
  },

  unmounted() {
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('click', () => {});
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    },

    frameView: {
      type: String as PropType<'uploadRec' | 'editRecMetadata'>,
      required: true
    },

    recId: {
      type: String,
      required: false
    }
  },

  watch: {

    recId(newVal) {
      console.log('changed')
      if (newVal) {
        this.audioFileId = newVal;
      }
    }
  },

  methods: {

    handleSelMusChange(name: string, selIdx: number) {
      const mus = this.allMusicians.find(m => {
        return m['Full Name'] === name
      });
      if (mus) {
        if (mus.Instrument === 'Vocal') {
          if (mus.Gender === 'M') {
            this.editMus[selIdx].instrument = "Vocal (M)"
          } else {
            this.editMus[selIdx].instrument = "Vocal (F)"
          }
        } else {
          this.editMus[selIdx].instrument = mus.Instrument;
        }
        this.editMus[selIdx].gharana = mus.Gharana;
      }
    },

    permissionToViewAE(audioEvent: AudioEventMetadataType) {
      const ep = audioEvent.explicitPermissions!;
      const id = this.$store.state.userID!;
      const out = ep.publicView || 
        ep.view.includes(id) || 
        ep.edit.includes(id) ||
        audioEvent.userID === id;
      return out;
    },

    permissionToEditAE(audioEvent: AudioEventMetadataType) {
      const ep = audioEvent.explicitPermissions!;
      const id = this.$store.state.userID!;
      const out = ep.edit.includes(id) || audioEvent.userID === id;
      return out;
    },

    permissionToViewRec(rec: RecType) {
      const ep = rec.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.publicView || 
        ep.view.includes(id) || 
        ep.edit.includes(id) ||
        rec.userID === id;
    },

    permissionToEditRec(rec: RecType) {
      const ep = rec.explicitPermissions!;
      const id = this.$store.state.userID!;
      return ep.edit.includes(id) || rec.userID === id;
    },

    async saveMusicians(recUpdates: RecUpdateType) {
      this.editMus.forEach(async (mus, musIdx) => {
        try {
          const gharana = mus.gharana === 'Other' ? 
            this.newGharanas[musIdx] : 
            mus.gharana;
          let musId: string = '';
          if (mus.name === 'Other')  {
            recUpdates.musicians[this.newMusNames[musIdx]!] = {
              role: mus.role,
              gharana: gharana,
              instrument: mus.instrument,
            }
            const res = await addMusicianToDB({ // needs to be tested
              fullName: this.newMusNames[musIdx]!,
              initName: this.newMusNames[musIdx]!,
              instrument: mus.instrument!,
              gharana: gharana!,
            })
            musId = res.insertedId;
          } else {
            recUpdates.musicians[mus.name!] = {
              role: mus.role,
              gharana: gharana,
              instrument: mus.instrument,
            };
            const mObj = this.allMusicians.find(m => {
              return m['Full Name'] === mus.name
            });
            musId = mObj? mObj!._id: '';
          }
          if (mus.gharana === 'Other') {
            const res = await addGharanaToDB({
              name: this.newGharanas[musIdx]!,
              members: [musId],
            })
          }
        } catch (err) {
          console.log(err);
        }
      })
    },

    async saveLocation(recUpdates: RecUpdateType) {
      try {
        if (this.selectedContinent) {
          recUpdates.location.continent = this.selectedContinent;
          if (this.selCountry) {
            if (this.selCountry === 'Other (specify)') {
              recUpdates.location.country = this.newselCountry!;
              const continent = this.selectedContinent;
              const country = this.newselCountry!;
              const res = await addCountryToDB(continent, country);
            } else {
              recUpdates.location.country = this.selCountry;
            }
            if (this.selectedCity) {
              if (this.selectedCity === 'Other (specify)') {
                recUpdates.location.city = this.newSelectedCity!;
                const continent = this.selectedContinent;
                const country = this.selCountry;
                const city = this.newSelectedCity!;
                const res = await addCityToDB(continent, country, city);
              } else {
                recUpdates.location.city = this.selectedCity;
              }
            }
          }
        };
      } catch (err) {
        console.log(err);
      }
    },

    saveDate(recUpdates: RecUpdateType) {
      recUpdates.date.year = this.selectedYear !== undefined ? 
        String(this.selectedYear) : 
        undefined;
      recUpdates.date.month = this.selectedMonth;
      recUpdates.date.day = this.selectedDay !== undefined ? 
        String(this.selectedDay) : 
        undefined;
    },

    async saveRaag(update: RecUpdateType) {
      try {
        if (this.selRaag) {
          const pSecNames = this.editingSecs.map((pSec) => pSec.name);
          if (this.selRaag === 'Other (specify)') {
            const res = await addRaagToDB(this.newRaag!);
            update.raags[this.newRaag!] = {
              'performance sections': {},
            };
            pSecNames.forEach(psn => {
              if (psn !== undefined) {
                update.raags[this.newRaag!]['performance sections'][psn] = {
                  start: 0,
                  end: 0,
                }
              }
            })
          } else {
            update.raags[this.selRaag] = {
              'performance sections': {},
            };
            pSecNames.forEach(psn => {
              if (psn !== undefined) {
                update.raags[this.selRaag!]['performance sections'][psn] = {
                  start: 0,
                  end: 0,
                }
              }
            })
          }
        }
      } catch (err) {
        console.log(err);
      }
    },

    async saveUpdates() {
      const recUpdates: RecUpdateType = {
        musicians: {},
        location: {},
        date: {},
        raags: {},
        saEstimate: this.saEstimate,
        saVerified: this.saVerified,
        octOffset: this.octOffset,
        explicitPermissions: this.editingRec!.explicitPermissions!,
        title: this.recTitle,

      };
      try {
        await this.saveMusicians(recUpdates);
        await this.saveLocation(recUpdates);
        this.saveDate(recUpdates);
        await this.saveRaag(recUpdates);
        const res = await updateAudioRecording(
          this.audioFileId, 
          recUpdates, 
          this.editingRec!.parentID,
          this.editingRec!.parentTrackNumber,
          );
        // reload the editing rec
        await this.prepareForEditing();

      } catch (err) {
        console.log(err);
      }
      
    },

    updateNumMusicians() {
      while (this.editMus.length < this.numMusicians) {
        this.groweditMus();
      }
      while (this.editMus.length > this.numMusicians) {
        this.shrinkeditMus();
      }
    },

    updateNumSecs () {
      while (this.editingSecs.length < this.numSecs) {
        this.growEditingSecs();
      }
      while (this.editingSecs.length > this.numSecs) {
        this.shrinkEditingSecs();
      }
    },

    growEditingSecs() {
      this.editingSecs.push({
        name: undefined,
        start: 0,
        end: 0,
        startHours: '00',
        startMins: '00',
        startSecs: '00',
        endHours: '00',
        endMins: '00',
        endSecs: '00',
      })
    },

    shrinkEditingSecs() {
      this.editingSecs.pop();
    },

    groweditMus() {
      this.editMus.push({
        name: undefined,
        id: undefined,
        role: undefined,
        gharana: undefined
      })
    },

    shrinkeditMus() {
      this.editMus.pop();
    },

    async prepareForEditing() {
      this.editingSecs = []
      

      try {
        this.editingRec = await getAudioRecording(this.audioFileId);
        this.numMusicians = Object.keys(this.editingRec!.musicians).length;
        this.allMusicians = await getAllMusicians();
        this.allMusicians.push({
          'Full Name': 'Other',
          'Initial Name': 'Other',
          _id: '',
        })
        
        this.allGharanas = await getAllGharanas();
        this.allGharanas.push({
          name: 'Other',
          _id: '',
          members: []
        })

        this.allInstruments = await getInstruments(false);

        this.locObj = await getLocationObject();
        this.allRaags = await getRagaNames();
        this.allRaags.push('Other (specify)');
        this.performanceSections = await getPerformanceSections();
        this.allUsers = await getAllUsers();

        this.selectedContinent = this.editingRec!.location.continent;
        this.selCountry = this.editingRec!.location.country;
        this.selectedCity = this.editingRec!.location.city;
        this.selectedYear = this.editingRec!.date.year ? 
          Number(this.editingRec!.date.year): 
          undefined;
        this.selectedMonth = this.editingRec!.date.month;
        this.selectedDay = this.editingRec!.date.day ? 
          Number(this.editingRec!.date.day): 
          undefined;
        const raags = Object.keys(this.editingRec!.raags);
        let numSecs = 0;
        if (raags.length > 0) {
          this.selRaag = raags[0];
          raags.forEach(raagKey => {
            const raag = this.editingRec!.raags[raagKey];
            const pSecs = raag['performance sections']!;
            const pSecKeys = Object.keys(pSecs);
            numSecs += pSecKeys.length;
            pSecKeys.forEach(pSecKey => {
              const pSec = pSecs[pSecKey] as EditingSecType;
              pSec.name = pSecKey;

              const sHrs = Math.floor(pSec.start / 3600);
              const sMins = Math.floor((pSec.start - Number(sHrs) * 3600) / 60);
              const sSecs = pSec.start - Number(sHrs) * 3600 - sMins * 60;
              const eHrs = Math.floor(pSec.end / 3600);
              const eMins = Math.floor((pSec.end - Number(eHrs) * 3600) / 60);
              const eSecs = pSec.end - Number(eHrs) * 3600 - Number(eMins) * 60;

              pSec.startHours = String(sHrs);
              pSec.startMins = String(sMins);
              if (pSec.startMins.length === 1) {
                pSec.startMins = '0' + pSec.startMins;
              }
              pSec.startSecs = String(sSecs);
              if (pSec.startSecs.length === 1) {
                pSec.startSecs = '0' + pSec.startSecs;
              }
              pSec.endHours = String(eHrs);
              pSec.endMins = String(eMins);
              if (pSec.endMins.length === 1) {
                pSec.endMins = '0' + pSec.endMins;
              }
              pSec.endSecs = String(eSecs);
              if (pSec.endSecs.length === 1) {
                pSec.endSecs = '0' + pSec.endSecs;
              }
              this.editingSecs.push(pSec);
            })
          })
          

        }
        if (this.editingRec.title !== undefined) {
          this.recTitle = this.editingRec.title;
        }

        if (this.numMusicians === 0) {
          this.numMusicians = 1;
          this.editMus = [];
          this.groweditMus();
        } else {
          const keys = Object.keys(this.editingRec!.musicians);
          this.editMus = keys.map((musKey) => {
            const mus = this.editingRec!.musicians[musKey];
            const musObj = this.allMusicians.find((m) => {
              return m['Full Name'] === musKey
            });
            return {
              name: musKey,
              id: musObj ? musObj._id: undefined,
              role: mus.role,
              gharana: mus.gharana ? 
                mus.gharana : 
                (musObj ? musObj.Gharana : undefined),
              instrument: mus.instrument ? 
                mus.instrument : 
                (musObj ? musObj.Instrument : undefined),
            }
          })
        };

        if (this.editingSecs.length === 0) {
          this.numSecs = 1;
          this.editingSecs = [];
          this.growEditingSecs();
        }

        this.saEstimate = this.editingRec!.saEstimate;
        this.octOffset = this.editingRec!.octOffset as -1 | 0;
        this.saVerified = this.editingRec!.saVerified;
        this.spectrogramExists = await verifySpectrogram(this.audioFileId);
        this.melographExists = await verifyMelograph(this.audioFileId)
      } catch (err) {
        console.log(err);
      }

      
    },

    handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.file = target.files[0];
        this.numFiles = target.files.length;
      }
    },

    async uploadRecording() {
      // Perform the upload logic here
      console.log('Uploading recording...');
      this.startedUpload = true;
      const fileElem = this.$refs.file as HTMLInputElement;
      if (fileElem.files && fileElem.files.length > 0) {
        const file = fileElem.files[0];
        this.processingDone = false;
        this.uploadDone = false;
        this.progressWidth = 0;
        try {
          if (file.type.slice(0, 5) === 'audio') {
            let audioEventType: 'add' | 'create' | 'none' = 'add';
            if (this.aeChoice === 'createNewAudioEvent') {
              audioEventType = 'create';
            } else if (this.aeChoice === 'noAudioEvent') {
              audioEventType = 'none';
            }
            let recIdx = 0;
            if (this.selectedAE && this.selectedAE.recordings) {
              recIdx = Object.keys(this.selectedAE!.recordings).length;
            }
            const res = await newUploadFile(file, this.onProgress, {
              audioEventType,
              audioEventID: this.selectedAE?._id,
              recIdx,
              userID: this.$store.state.userID,
              aeName: this.newAEName,
              aeType: this.newAEType,
            });
            this.audioFileId = res.data.audioFileId;
            this.processingDone = true;
            this.$emit('updateFrameView', 'editRecMetadata');
            this.$emit('updateEditingRecId', this.audioFileId);
            await this.prepareForEditing();
          } else {
            throw new Error('File must be an audio file');
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        throw new Error('No file selected');
      }
    },

    onProgress(percent: number) {
      this.progressWidth = this.progressContainerWidth * percent / 100;
      if (percent === 100) {
        this.uploadDone = true;
      }
    }
  },
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
}

.modal-content {
  background-color: lightgrey;
  padding: 20px;
  border-radius: 4px;
  height: 500px;
  width: 700px;
  display: flex;
  flex-direction: column;
  justify-content: top;
}
.modalCol > * > select {
  width: 100px;
  box-sizing: border-box;
}
.modalCol > * > * > select {
  width: 100px;
  box-sizing: border-box;
}

.modalCol > * > input[type='text'] {
  width: 100px;
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
}

.modalRow > select {
  width: 100px;
  box-sizing: border-box;
  margin-left: 5px;
  margin-right: 5px;
}

.modalRow > .selHolder > select {
  width: 100px;
  box-sizing: border-box;
}

.modalRow > .selHolder {
  margin-left: 5px;
  margin-right: 5px;
}

.modalColRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  min-height: 30px;
  max-height: 45px;
  width: 200px;
}

.modalColRow > label {
  min-width: 80px;
  text-align: right;
  margin-right: 10px;
}

.modalRow > label {
  min-width: 80px;
  text-align: right;
  margin-right: 5px;

} 

.modalRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 60px;
}

.modalRow.centered {
  justify-content: center;

}

.modalRow.centered > button {
  margin: 5px 5px;
}

.modalRow.tall {
  height: 200px;
}

.modalRow.tall.musicians {
  overflow-x: scroll;
}

.modalCol {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: center;
  height: 100%;
  min-width: 220px;
  max-width: 220px;
}

.taller {
  height: 80px;

}

.progressContainer {
  width: v-bind(progressContainerWidth + 'px');
  height: 20px;
  background-color: white;
  border: 1px solid black;
  margin-left: 10px;
}

.progress {
  width: v-bind(progressWidth + 'px');
  height: 100%;
  background-color: lightblue;
}

.subColumn {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-right: 20px;
  height: 100%;
  width: 250px;

}

.subColumn.newAE > * > select {
  max-width: 150px;
  box-sizing: border-box;
}

.subColumn.newAE > * > input {
  max-width: 150px;
  box-sizing: border-box;
}

.subColumn.newAE > * > label {
  width: 100px;
  text-align: right;
  margin-right: 5px;
}

select {
  width: 250px;
}

input[type='text'] {
  width: 250px;
}

.numMusicians > input[type='number'] {
  width: 30px;
  margin-left: 10px;
}

.subRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 100%;
}

.modalFrame {
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  height: 100%;
  width: 100%;
}

audio {
  width: 100%;
}

.selHolder {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: left;
  box-sizing: border-box;
  width: 100px;
  min-height: 30px;
  max-height: 45px;
}

.selHolder > input[type='text'] {
  width: 100px;
  margin-top: 5px;
  box-sizing: border-box;
}

.editingSubFrame {
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  min-height: 220px;
  max-height: 220px;
  width: 100%;
}

*, *::before, *::after {
  box-sizing: border-box;
}

select.users {
  width: 200px;
}

</style>
