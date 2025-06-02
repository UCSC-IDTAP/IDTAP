<template>
  <div class='outer'>
    <div class="formContainer">
      <div class="formRow">
        <label>Title</label>
        <input v-model="title"/>
      </div>
      <div class='formRow'>
        <label>Audio Event</label>
        <select v-model='aeIdx' ref='audioEvent' :disabled='noAE'>
          <option 
            v-for='(ae, i) in allEvents' 
            :key='ae.name'
            :value='i'
          >
            {{ae.name}}
          </option>
        </select>
        <div class='noneSel'>
          {{ "(None: " }}
          <input 
          type='checkbox' 
          v-model='noAE' 
          :value='undefined'
          :disabled='aeDisabled'
          >
          {{ ")" }}
        </div>

      </div>
      <div class='formRow' v-if='(aeIdx && aeIdx >= 0)'>
        <label>Recording</label>
        <select 
          class='c2' 
          v-model='recording' 
          ref='audioRec'
        >
          <option
            v-for='(recIdx, i) in Object.keys(allEvents[aeIdx].recordings)'
            :key='i'
            :value='recIdx'
          >
            {{getShorthand(allEvents[aeIdx].recordings[Number(recIdx)])}}
          </option>
        </select>
      </div>
      <div class='formRow' v-if='noAE'>
        <label>Recording</label>
        <select 
          class='c2' 
          v-model='recording' 
          ref='audioRec'
          :disabled='noRec'
          >
          <option
            v-for='(rec, i) in looseRecs'
            :key='i'
            :value='rec'
          >
            {{getShorthand(rec)}}
          </option>
        </select>
        <div class='noneSel'>
          {{ "(None: " }}
          <input 
            type='checkbox' 
            v-model='noRec' 
            :value='undefined'
            :disabled='recDisabled'
            >
          {{ ")" }}
        </div>


      </div>
      <div class="formRow">
        <label class='ragaLabel'>Raga</label>
        <input class='ragaCheck' type='checkbox' v-model='showRaagEditor'>
        <select v-model='raga' ref='raga'>
          <option v-for='raag in raags' :key='raag'>
            {{raag}}
          </option>
        </select>
      </div>
      <div class='formRow'>
        <label>Visibility</label>
        <select v-model='explicitPermissions.publicView'>
          <option :value='true'>
            {{ "Public" }}
          </option>
          <option :value='false'>
            {{ "Private" }}
          </option>
        </select>
      </div>
      <div class='formRow veryTall'>
        <label>Editors</label>
        <UserSearch
          :users='allUsers'
          :includedUsers='explicitPermissions.edit'
          @addUser='explicitPermissions.edit.push($event)'
          @removeUser='explicitPermissions.edit = explicitPermissions.edit.filter(id => id !== $event)'
          />
      </div>
      <div class='formRow veryTall' v-if='!explicitPermissions.publicView'>
        <label>Viewers</label>
        <UserSearch
          :users='allUsers'
          :includedUsers='explicitPermissions.view'
          @addUser='explicitPermissions.view.push($event)'
          @removeUser='explicitPermissions.view = explicitPermissions.view.filter(id => id !== $event)'
          />
      </div>
      <div class='formRow'>
        <label>Number of Instruments</label>
        <input 
          class='numInstruments'
          type='number' 
          v-model='instrumentationLength' 
          min='1' 
          max='4'
          />
      </div>
      <div class='formRow tall' v-if='instrumentation'>
        <label>Instrumentation</label>
        <div class='selectCol'>
          <div class='selectRow' v-for='(inst, i) in instrumentation' :key='i'>
            <select v-model='instrumentation[i]'>
              <option v-for='inst in instruments' :key='inst'>
                {{inst}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class='formRow' v-if='recordingChosen'>
        <label class='ragaLabel'>Excerpt</label>
        <input 
          class='ragaCheck' 
          type='checkbox' 
          v-model='excerpt'
          :disabled='cloning'
          >
        <input 
          type='number' 
          class='time'
          v-model.number='startHours' 
          min='0' 
          max='3'
          placeholder='H'
          :disabled='!excerpt'
          @change='updateErrors'
          />
        <span>:</span>
        <input 
          type='text'
          class='timeInput' 
          v-model='formattedStartMinute' 
          placeholder='MM'
          :disabled='!excerpt'
          @change='updateErrors'
          />
        <span>:</span>
        <input 
          class='timeInput'
          type='text'
          v-model='formattedStartSecond'
          :disabled='!excerpt'
          @change='updateErrors'
          />
        <span>to</span>
        <input 
          type='number' 
          class='timeInput'
          v-model.number='endHours' 
          min='0'
          max='3'
          placeholder='H'
          :disabled='!excerpt'
          @change='updateErrors'
          />
        <span>:</span>
        <input 
          type='text'
          class='timeInput' 
          v-model.number='formattedEndMinute' 
          placeholder='MM'
          :disabled='!excerpt'
          @change='updateErrors'
          />
        <span>:</span>
        <input 
          type='text'
          class='timeInput' 
          v-model.number='formattedEndSecond'  
          placeholder='SS'
          :disabled='!excerpt'
          @change='updateErrors'
          />

      </div>
      <div class='buttonRow'>
        <div class='buttonCol'>
          <button 
            :class='readyToSubmit ? "" : "disabled"'
            @click="makeNewPiece"
            :disabled='!readyToSubmit'
            >submit</button>
        </div>
      </div>
      <div class='errorRow' v-for='err in errors' :key='err'>
        <span style='color: red'>{{err}}</span>
      </div>
    </div>
    <div class='raagEditorBox' v-if='showRaagEditor'>
      <div class='infoRow'>
        <div class='sapa'>
          <label class='small'>Sa</label>
          <input type='checkbox' v-model='rules.sa'>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sargam'>
          <label class='small'>Re</label>
          <div class='infoCol'>
            <div class='smallInfoRow'>
              <label>Lowered</label>
              <input type='checkbox' v-model='rules.re.lowered'>
            </div>
            <div class='smallInfoRow'>
              <label>Raised</label>
              <input type='checkbox' v-model='rules.re.raised'>
            </div>
          </div>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sargam'>
          <label class='small'>Ga</label>
          <div class='infoCol'>
            <div class='smallInfoRow'>
              <label>Lowered</label>
              <input type='checkbox' v-model='rules.ga.lowered'>
            </div>
            <div class='smallInfoRow'>
              <label>Raised</label>
              <input type='checkbox' v-model='rules.ga.raised'>
            </div>
          </div>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sargam'>
          <label class='small'>Ma</label>
          <div class='infoCol'>
            <div class='smallInfoRow'>
              <label>Lowered</label>
              <input type='checkbox' v-model='rules.ma.lowered'>
            </div>
            <div class='smallInfoRow'>
              <label>Raised</label>
              <input type='checkbox' v-model='rules.ma.raised'>
            </div>
          </div>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sapa'>
          <label class='small'>Pa</label>
          <input type='checkbox' v-model='rules.pa'>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sargam'>
          <label class='small'>Dha</label>
          <div class='infoCol'>
            <div class='smallInfoRow'>
              <label>Lowered</label>
              <input type='checkbox' v-model='rules.dha.lowered'>
            </div>
            <div class='smallInfoRow'>
              <label>Raised</label>
              <input type='checkbox' v-model='rules.dha.raised'>
            </div>
          </div>
        </div>
      </div>
      <div class='infoRow'>
        <div class='sargam'>
          <label class='small'>Ni</label>
          <div class='infoCol'>
            <div class='smallInfoRow'>
              <label>Lowered</label>
              <input type='checkbox' v-model='rules.ni.lowered'>
            </div>
            <div class='smallInfoRow'>
              <label>Raised</label>
              <input type='checkbox' v-model='rules.ni.raised'>
            </div>
          </div>
        </div>
      </div>
      <div class='infoRow'>
        <button @click='save'>save</button>
      </div>
      <div class='infoRow'>
        <span>{{savedMsg}}</span>
      </div>
    </div>
  </div>
  
</template>
<script lang='ts'>
import { 
  getAllAEMetadata, 
  getRagaNames, 
  getRaagRule, 
  saveRaagRules,
  getInstruments,
  getInstrumentation,
  getLooseRecordings,
  getAllUsers
} from '@/js/serverCalls.ts';
import { defineComponent } from 'vue';
import {
  PassedDataType,
  RecType, 
  UserType,
  AudioEventMetadataType,
  RulesType,
} from '@shared/types'
import { Instrument } from '@shared/enums'
import UserSearch from '@/comps/files/UserSearch.vue';

type NewPieceRegistrarDataType = {
  title?: string;
  transcriber?: string;
  raga?: string;
  allEvents: AudioEventMetadataType[];
  aeIdx?: number;
  recording?: number | RecType;
  raags?: string[];
  showRaagEditor: boolean;
  rules: RulesType,
  savedMsg: string;
  passedInData?: PassedDataType;
  permissions: string;
  explicitPermissions: {
    edit: string[],
    view: string[]
    publicView: boolean
  }
  cloning: boolean;
  permissionTypes: string[];
  rulesTemplate: RulesType;
  instrumentation: Instrument[];
  instruments: Instrument[];
  noAE: boolean;
  looseRecs: RecType[];
  noRec: boolean;
  ragaExists: boolean;
  errors: string[];
  allUsers: UserType[];
  aeDisabled: boolean;
  recDisabled: boolean;
  excerpt: boolean;
  startHours: number;
  startMinute: number;
  startSecond: number;
  endHours: number;
  endMinute: number;
  endSecond: number;
}
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
  name: 'NewPieceRegistrar',
  components: {
    UserSearch
  },
  data(): NewPieceRegistrarDataType {
    return {
      title: undefined,
      transcriber: undefined,
      raga: undefined,
      allEvents: [],
      aeIdx: undefined,
      recording: undefined,
      raags: undefined,
      showRaagEditor: false,
      rules: {
        sa: false,
        re: {
          lowered: false,
          raised: false
        },
        ga: {
          lowered: false,
          raised: false
        },
        ma: {
          lowered: false,
          raised: false
        },
        pa: false,
        dha: {
          lowered: false,
          raised: false
        },
        ni: {
          lowered: false,
          raised: false
        }
      },
      savedMsg: 'unsaved',
      passedInData: undefined,
      permissions: 'Public',
      explicitPermissions: {
        edit: [],
        view: [],
        publicView: true
      },
      cloning: false,
      permissionTypes: [
        'Public',
        'Private',
        'Publicly Editable'
      ],
      rulesTemplate: {
        sa: false,
        re: {
          lowered: false,
          raised: false
        },
        ga: {
          lowered: false,
          raised: false
        },
        ma: {
          lowered: false,
          raised: false
        },
        pa: false,
        dha: {
          lowered: false,
          raised: false
        },
        ni: {
          lowered: false,
          raised: false
        }
      },
      instrumentation: [Instrument.Sitar],
      instruments: [
        Instrument.Sarangi,
        Instrument.Sitar,
        Instrument.Vocal_F,
        Instrument.Vocal_M,
      ],
      noAE: false,
      looseRecs: [],
      noRec: false,
      ragaExists: false,
      errors: [],
      allUsers: [],
      aeDisabled: false,
      recDisabled: false,
      excerpt: false,
      startHours: 0,
      startMinute: 0,
      startSecond: 0,
      endHours: 0,
      endMinute: 0,
      endSecond: 0,
    }
  },
  
  props: {
    modalWidth: {
      type: Number,
      required: true,
    },
    modalHeight: {
      type: Number,
      required: true,
    },
    dataObj: {
      type: String,
      required: true
    },
  },

  computed: {
    readyToSubmit() {
      if (this.errors.length === 0) {
        return true
      } else {
        return false
      }
    },
    instrumentationLength: {
      get() {
        return this.instrumentation.length
      },
      set(newVal: number) {
        if (newVal > this.instrumentation.length) {
          for (let i = this.instrumentation.length; i < newVal; i++) {
            this.instrumentation.push(Instrument.Sitar)
          }
        } else if (newVal < this.instrumentation.length) {
          this.instrumentation = this.instrumentation.slice(0, newVal)
        }
      }
    },
    formattedStartSecond: {
      get(): string {
        return this.startSecond.toString().padStart(2, '0')
      },
      set(newVal: string) {
        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed)) {
          this.startSecond = 0;
        } else if (parsed < 0) {
          this.startSecond = 0;
        } else if (parsed > 59) {
          this.startSecond = 59;
        } else {
          this.startSecond = parsed;
        }
      }
    },
    formattedStartMinute: {
      get(): string {
        return this.startMinute.toString().padStart(2, '0')
      },
      set(newVal: string) {
        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed)) {
          this.startMinute = 0;
        } else if (parsed < 0) {
          this.startMinute = 0;
        } else if (parsed > 59) {
          this.startMinute = 59;
        } else {
          this.startMinute = parsed;
        }
      }
    },
    formattedEndMinute: {
      get(): string {
        return this.endMinute.toString().padStart(2, '0')
      },
      set(newVal: string) {
        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed)) {
          this.endMinute = 0;
        } else if (parsed < 0) {
          this.endMinute = 0;
        } else if (parsed > 59) {
          this.endMinute = 59;
        } else {
          this.endMinute = parsed;
        }
      }
    },
    formattedEndSecond: {
      get(): string {
        return this.endSecond.toString().padStart(2, '0')
      },
      set(newVal: string) {
        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed)) {
          this.endSecond = 0;
        } else if (parsed < 0) {
          this.endSecond = 0;
        } else if (parsed > 59) {
          this.endSecond = 59;
        } else {
          this.endSecond = parsed;
        }
      }
    },
    recordingDuration() {
      if (this.recording && typeof this.recording === 'object') {
        return this.recording.duration
      } else if (this.recording && typeof this.recording === 'string') {
        const rec = this.allEvents[this.aeIdx!].recordings[this.recording as number];
        return rec.duration
      } else {
        return 0
      }
    },
    excerptStartTime() {
      let val = 3600 * this.startHours + 60 * this.startMinute + this.startSecond;
      if (val > this.recordingDuration) {
        val = this.recordingDuration
      }
      this.startHours = Math.floor(val / 3600);
      this.startMinute = Math.floor((val % 3600) / 60);
      this.startSecond = Math.floor(val % 60);
      return val
    },
    excerptEndTime() {
      let val = 3600 * this.endHours + 60 * this.endMinute + this.endSecond;
      if (val > this.recordingDuration) {
        val = this.recordingDuration
      }
      this.endHours = Math.floor(val / 3600);
      this.endMinute = Math.floor((val % 3600) / 60);
      this.endSecond = Math.floor(val % 60);
      return val
    },
    recordingChosen() {
      const bool = this.recording !== undefined && this.recording !== null
      if (bool) {
        const dur = this.recordingDuration;
        this.endHours = Math.floor(dur / 3600);
        this.endMinute = Math.floor((dur % 3600) / 60);
        this.endSecond = Math.floor(dur % 60);
      }
      return bool
    }
  },
    
  async mounted() {
    this.updateErrors();
    try {
      this.allEvents = await getAllAEMetadata();
      this.raags = await getRagaNames();
      this.looseRecs = await getLooseRecordings(this.$store.state.userID!);
      this.allUsers = await getAllUsers();
      this.allUsers = this.allUsers.filter(user => {
        return user._id !== this.$store.state.userID
      });
      this.allUsers.sort((a, b) => {
        if (a.family_name < b.family_name) return -1;
        else if (a.family_name > b.family_name) return 1;
        else if (a.given_name < b.given_name) return -1;
        else if (a.given_name > b.given_name) return 1;
        else return 0
      })
      this.rules = cloneDeep(this.rulesTemplate);
      if (this.dataObj) { // this is exclusively for cloning
        this.clonePiece()
      }
      const aeName = this.$route.query.aeName;
      if (aeName !== 'null' && aeName !== undefined) {
        const allNames = this.allEvents.map(obj => obj.name);
        const parsedName = JSON.parse(aeName as string);
        this.aeIdx = allNames.indexOf(parsedName);
        const recs = this.allEvents[this.aeIdx].recordings;
        const allRecNames = await Object.keys(recs).map(key => {
          const rec = recs[Number(key)];
          return this.getShorthand(rec)
        });
        const parsed = JSON.parse(this.$route.query.afName as string);
        this.recording = allRecNames.indexOf(parsed);
        this.raga = Object.keys(recs[this.recording].raags)[0];
        const instrumentation = this.getInstrumentation();
        this.instrumentation = this.filterInstrumentation(instrumentation);
        console.log(this.instrumentation)
      } else if (this.$route.query.recID) {
        const id = this.$route.query.recID as string;
        this.noAE = true;
        this.noRec = false;
        await this.$nextTick();
        this.recording = this.looseRecs.find(rec => rec._id === id)!;
        this.raga = Object.keys(this.recording.raags)[0];
        const instrumentation = this.getInstrumentation();
        this.instrumentation = this.filterInstrumentation(instrumentation);
      }
      
      // leading if necessary

      
    } catch (err) {
      console.log(err)
    } 
  },
  
  watch: {
    aeIdx() {
      this.recording = undefined;
      this.updateErrors();
    },

    noAE(newVal) {
      if (newVal === true) {
        this.aeIdx = undefined;
        this.recording = undefined;
      }
      this.updateErrors();
    },
    
    async recording(newVal) {
      try {
        if (newVal) {
          let audioID;
          if (this.aeIdx === undefined) {
            const raags = newVal.raags;
            const keys = Object.keys(raags);
            if (keys.length === 1) {
              this.raga = keys[0]
            } else if (keys.length > 1) {
              this.raga = keys.filter(key => raags[key].start === 0)[0]
            }
            audioID = newVal._id;
          } else {
            const ae = this.allEvents[this.aeIdx];
            const raags = ae.recordings[newVal].raags;
            const keys = Object.keys(raags);
            if (keys.length === 1) {
              this.raga = keys[0]
            } else if (keys.length > 1) {
              this.raga = keys.filter(key => raags[key].start === 0)[0]
            }
            audioID = ae.recordings[newVal].audioFileId;
          }
          if (audioID === undefined) {
            throw new Error('audioID is undefined')
          }
          this.instrumentation = await getInstrumentation(audioID)
          this.instrumentation = this.filterInstrumentation(this.instrumentation);
        }
        this.updateErrors();
      } catch (err) {
        console.log(err)
      }   
    },
    
    raga(newVal) {
      getRaagRule(newVal).then(rules => {
        if (rules.rules) {
          this.rules = rules.rules;
          const date = new Date(rules.updatedDate);
          this.savedMsg = 'Saved: ' + date.toLocaleString();
          this.ragaExists = true;
        } else {
          this.rules = cloneDeep(this.rulesTemplate);
          this.savedMsg = 'unsaved';
          this.ragaExists = false;
        }
        this.updateErrors();
      })
    },

    dataObj(newObj) {
      this.passedInData = JSON.parse(newObj);
    },

    title(newTitle) {
      this.updateErrors();
    },

    instrumentation: {
      handler(newInst) {
      this.updateErrors();
      },
      deep: true
    },
  },
  
  methods: {

    updateErrors() {
      this.errors = [];
      if (this.title === undefined || this.title === '') {
       this.errors.push('No title')
      }
      if (this.raga === undefined) {
        this.errors.push('No selected raga')
      }
      if (this.raga && !this.ragaExists) {
        this.errors.push('Raga ruleset has not been saved.')
      }
      if (this.instrumentation.length === 0) {
        this.errors.push('No instrumentation')
      }
      const noAudio = this.aeIdx === undefined && this.recording === undefined;
      if (noAudio && !this.noRec) {
        this.errors.push('No audio event or recording has been selected. If no \
          recording is desired, "None" must be checked.' )
      }
      const disallowedInsts = [
        Instrument.Bansuri,
        Instrument.Esraj,
        Instrument.Rabab,
        Instrument.Santoor,
        Instrument.Sarod,
        Instrument.Shehnai,
        Instrument.Surbahar,
        Instrument.Veena_Saraswati,
        Instrument.Veena_Vichitra,
        Instrument.Veena_Rudra_Bin,
        Instrument.Violin,
        Instrument.Harmonium
      ]
      const wrongInstrumentation = this.instrumentation.filter(inst => {
        if (disallowedInsts.includes(inst)) {
          return inst
        }
      })
      if (wrongInstrumentation.length > 0) {
        this.errors.push('The following instruments are not allowed: ' + 
          wrongInstrumentation.join(', '))
      }
      if (this.excerpt) {
        if (this.excerptStartTime >= this.excerptEndTime) {
          console.log('in here')
          this.errors.push('Excerpt start time must be before end time')
        }
      }
    },

    async clonePiece() {
      this.cloning = true;
      try {
        this.passedInData = JSON.parse(this.dataObj)!;
        if (this.passedInData === undefined) {
          throw new Error('passedInData is undefined')
        }
        const d = this.passedInData!;
        const noAE = d.audioEvent === undefined;
        const noRec = d.audioRecording === undefined;
        if (noAE && noRec) {
          this.noAE = true;
          this.noRec = true;
        } else if (noAE && !noRec) {
          this.noAE = true;
          this.noRec = false;
        } else if (!noAE && noRec) {
          this.noAE = false;
          this.noRec = true;
        } else {
          this.noAE = false;
          this.noRec = false;
        }
        this.aeDisabled = true;
        this.recDisabled = true;
        this.title = this.passedInData.title;
        this.instrumentation = this.passedInData.instrumentation!;
        if (this.passedInData.audioEvent && this.passedInData.audioRecording) {
          this.aeIdx = this.allEvents.findIndex(ae => {
            return ae.name === this.passedInData!.audioEvent
          });
          const recs = this.allEvents[this.aeIdx].recordings;
          const allRecNames = await Object.keys(recs).map(key => {
            const rec = recs[Number(key)];
            return this.getShorthand(rec)
          });
          let rec;
          rec = this.getShorthand(this.passedInData.audioRecording);
          this.recording = allRecNames.indexOf(rec);
        }
        this.raga = this.passedInData.raga.name;
        const aeElem = this.$refs.audioEvent as HTMLSelectElement;
        const arElem = this.$refs.audioRec as HTMLSelectElement;
        const rElem = this.$refs.raga as HTMLSelectElement;
        aeElem.disabled = true;
        if (arElem) arElem.disabled = true;
        rElem.disabled = true;
      } catch (err) {
        console.log(err)
      }  
    },
    
    async save() {
      try {
        const date = new Date();
        const res = await saveRaagRules(this.raga!, this.rules!, date);
        if (res) {
          this.savedMsg = 'Saved: ' + date.toLocaleString();
          this.ragaExists = true;
        }
        this.updateErrors();
      } catch (err) {
        console.log(err)
      }
    },
    
    async makeNewPiece() {
      if (this.cloning) {
        if (this.passedInData === undefined) {
          throw new Error('passedInData is undefined')
        }
        let newPieceInfo;
        if (this.noAE) {
          // if (this.recording === undefined) {
          //   throw new Error('recording is undefined')
          // }
          newPieceInfo = {
            title: this.title,
            transcriber: this.passedInData.transcriber,
            raga: this.raga,
            permissions: this.permissions,
            explicitPermissions: this.explicitPermissions,
            clone: true,
            origID: this.passedInData.origID,
            soloist: this.passedInData.soloist,
            soloInstrument: this.passedInData.soloInstrument,
            instrumentation: this.instrumentation,
            audioID: this.recording ? (this.recording as RecType)._id: undefined,
            fundamental: this.passedInData.raga.fundamental,
          };
          
        } else {
          const ae = this.allEvents[this.aeIdx!];
          newPieceInfo = {
            title: this.title,
            transcriber: this.passedInData.transcriber,
            raga: this.passedInData.raga,
            permissions: this.permissions,
            explicitPermissions: this.explicitPermissions,
            audioID: ae.recordings[(this.recording as number)!].audioFileId,
            clone: true,
            origID: this.passedInData.origID,
            instrumentation: this.instrumentation,
            soloist: this.passedInData.soloist,
            soloInstrument: this.passedInData.soloInstrument,
            fundamental: this.passedInData.raga.fundamental,
          };
        }
        
        this.$emit('newPieceInfoEmit', newPieceInfo);
        // this.emitter.emit('newPieceInfo', newPieceInfo);
        
      } else {
        let newPieceInfo: {
            title?: string,
            transcriber?: string,
            raga?: string,
            permissions?: string,
            explicitPermissions?: {
              edit: string[],
              view: string[]
              publicView: boolean
            }
            clone: boolean,
            audioID?: string,
            instrumentation: Instrument[],
            soloist?: string,
            soloInstrument?: string,
            fundamental?: number,
            excerptRange?: {
              start: number,
              end: number
            }
          };
        if (this.noAE) {
          if (this.noRec) {
            const fundamental = 246;
            newPieceInfo = {
              title: this.title,
              transcriber: this.transcriber,
              raga: this.raga,
              permissions: this.permissions,
              explicitPermissions: this.explicitPermissions,
              clone: false,
              instrumentation: this.instrumentation,
              soloist: undefined,
              soloInstrument: undefined,
              fundamental: fundamental
            }
          } else {
            const rec = this.recording as RecType;
            const soloist = this.getSoloist(rec);
            const soloInstrument = soloist ? 
              rec.musicians[soloist].instrument : 
              undefined;
            const oct = this.instrumentation[0] === Instrument.Vocal_M ? 1 : 2; 
            newPieceInfo = {
              title: this.title,
              transcriber: this.transcriber,
              raga: this.raga,
              permissions: this.permissions,
              explicitPermissions: this.explicitPermissions,
              clone: false,
              instrumentation: this.instrumentation,
              audioID: rec._id,
              soloist: soloist,
              soloInstrument: soloInstrument,
              fundamental: oct * rec.saEstimate * 2 ** rec.octOffset
            }
          }
        } else {
          const rec = this.allEvents[this.aeIdx!].recordings[this.recording as number];
          const soloist = this.getSoloist(rec as RecType);
          const soloInstrument = soloist ? 
            (rec as RecType).musicians[soloist].instrument : 
            undefined;
          newPieceInfo = {
            title: this.title,
            transcriber: this.transcriber,
            raga: this.raga,
            permissions: this.permissions,
            explicitPermissions: this.explicitPermissions,
            clone: false,
            instrumentation: this.instrumentation,
            soloist: soloist,
            soloInstrument: soloInstrument,
          };
          if (this.aeIdx !== undefined && this.recording !== undefined) {
            newPieceInfo.audioID = rec.audioFileId;
            const oct = this.instrumentation[0] === Instrument.Vocal_M ? 1 : 2;
            newPieceInfo.fundamental = oct * rec.saEstimate * 2 ** rec.octOffset
          }
        }
        if (this.excerpt) {
          newPieceInfo.excerptRange = {
            start: this.excerptStartTime,
            end: this.excerptEndTime
          }
        }
        this.$emit('newPieceInfoEmit', newPieceInfo)
      }
    },

    getInstrumentation(): Instrument[] {
      let rec: RecType;
      if (!this.noAE) {
        const recNum = Number(this.recording);
        rec = this.allEvents[Number(this.aeIdx)].recordings[recNum];
      } else {
        rec = this.recording as RecType;
      }
      const musicians = Object.keys(rec.musicians);
      const instrumentation: Instrument[] = [];
      musicians.forEach(m => {
        if (rec.musicians[m].role === 'Soloist') {
          instrumentation.push(rec.musicians[m].instrument! as Instrument)
        }
      })
      return instrumentation
    },

    filterInstrumentation(instrumentation: Instrument[]): Instrument[] {
      return instrumentation.map(inst => {
        if (inst === Instrument.Bansuri) {
          return Instrument.Sarangi
        } else if (inst === Instrument.Esraj) {
          return Instrument.Sarangi
        } else if (inst === Instrument.Santoor) {
          return Instrument.Sitar
        } else if (inst === Instrument.Sarod) {
          return Instrument.Sitar
        } else if (inst === Instrument.Shehnai) {
          return Instrument.Sarangi
        } else if (inst === Instrument.Surbahar) {
          return Instrument.Sitar
        } else if (inst === Instrument.Veena_Saraswati) {
          return Instrument.Sitar
        } else if (inst === Instrument.Veena_Vichitra) {
          return Instrument.Sitar
        } else if (inst === Instrument.Veena_Rudra_Bin) {
          return Instrument.Sitar
        } else if (inst === Instrument.Violin) {
          return Instrument.Sarangi
        } else if (inst === Instrument.Harmonium) {
          return Instrument.Sarangi
        } else {
          return inst
        }
      })
    },

    getSoloist(rec: RecType): string | undefined {
      const musicians = Object.keys(rec.musicians);
      let out = undefined;
      for (let i = 0; i < musicians.length; i++) {
        if (rec.musicians[musicians[i]].role === 'Soloist') {
          out = musicians[i];
          break;
        }
      }
      return out
    },
    
    getShorthand(rec: RecType) {
      const out: string[] = [];
      const raagNames = Object.keys(rec.raags);
      raagNames.forEach(rn => {
        out.push(rn, ' - ');
        const obj = rec.raags[rn]['performance sections']!;
        const pSecs = Object.keys(obj);
        pSecs.forEach((pSec, i) => {
          out.push(pSec, i !== pSecs.length - 1 ? ', ' : '; ');
        })
      })
      return out.join('')
    },
  }
})
</script>

<style scoped>

.formContainer {
  height: 100%;
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
}

.formRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 45px;
}

.formRow.tall {
  height: 80px;
}

.formRow.veryTall {
  height: 120px;
}

.errorRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  height: 30px;
}

.errorRow > span {
  color: red;
  font-weight: bold;
  margin-left: 10px;
  line-height: 15px;
  text-align: left;
}

label {

  width: 120px;
  min-width: 120px;
  display: flex;
  flex-direction: row;
  justify-content: right;
  padding-right: 10px;
}

.ragaLabel {
  width: 95px;
  min-width: 95px;
  max-width: 95px;
  padding-right: 0px;
  margin-right: 5px;
}

.ragaCheck {
  width: 20px;
  max-width: 20px;
  margin: 0px;
  margin-right: 10px;
}

.formRow input {
  width: 200px;
}

button {
  width: 80px;
  height: 25px;
}
button.disabled {
  background-color: #4f5f4f;
  color: #a0a0a0;
}

button:hover {
  background-color: #4f5f4f;
  color: white;
  cursor: pointer;
}

button.disabled:hover {
  background-color: #4f5f4f;
  color: #a0a0a0;
  cursor: auto;
}


.buttonRow {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  height: 50px;
}

select {
  width: 208px;
  max-width: 208px;
  min-width: 208px;
}

.buttonCol {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.formCol {
  display: flex;
  flex-direction: column;
  width: 200px;
  
}

.raagEditorBox {
  width: 200px;
}

.infoRow {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.infoCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  max-width: 150px;
}

.smallInfoRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}

.smallInfoRow > label {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}

.sapa {
  width: 200px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.sargam {
  width: 200px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.outer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #202621;
  border: 1px solid white;
  border-radius: 5px;
  color: white;
  width: v-bind(modalWidth+'px');
  height: v-bind(modalHeight+'px');
  z-index: 2;
}

.raagEditorBox label {
  width: 70px;
  text-align: right;
  margin-right: 10px;
}

.raagEditorBox label.small {
  width: 50px;
  min-width: 50px;
  font-weight: bold;
  
}

.closeWindow {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: black;
  right: 0;
  top: 0;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

input {
  background-color: #2f3830;
  color: white
}

select {
  background-color: #2f3830;
  color: white
}

select[multiple] {
  height: 70px;
}

button {
  background-color: #2f3830;
  color: white
}

.noneSel {
  width: 120px;
  max-width: 120px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  margin-left: 10px;
}

.noneSel > input {
  width: 20px;
  max-width: 20px;
  margin: 0px;
}

.timeInput {
  max-width: 25px;
}

input.time::-webkit-outer-spin-button,
input.time::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For Firefox */
input.time[type="number"] {
  -moz-appearance: textfield;
}

.selectCol {
  max-width: 200px;
}

.numInstruments {
  max-width: 30px;
}
</style>
