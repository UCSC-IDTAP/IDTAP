<template>
  <div class='main'>
    <div class='bigInfoRow'>
      <div class='bigInfoCol'>
        <select v-model='selectedRaag'>
          <option v-for='(name, i) in raagNames' :key='i'>{{name}}</option>
        </select>
        <input 
          type='text' 
          class='textInput' 
          v-if='selectedRaag === "Other (specify)"'
          v-model='otherRaagName'
          >
      </div>
    </div>
    <div class='infoRow'>
      <div class='sapa'>
        <label for='saToggle' class='small'>Sa</label>
        <input id='saToggle' type='checkbox' v-model='rules.sa'>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sargam'>
        <label class='small'>Re</label>
        <div class='infoCol'>
          <div class='smallInfoRow'>
            <label for='lowReToggle'>Lowered</label>
            <input id='lowReToggle' type='checkbox' v-model='rules.re.lowered'>
          </div>
          <div class='smallInfoRow'>
            <label for='hiReToggle'>Raised</label>
            <input id='hiReToggle' type='checkbox' v-model='rules.re.raised'>
          </div>
        </div>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sargam'>
        <label class='small'>Ga</label>
        <div class='infoCol'>
          <div class='smallInfoRow'>
            <label for='loGaToggle'>Lowered</label>
            <input id='loGaToggle' type='checkbox' v-model='rules.ga.lowered'>
          </div>
          <div class='smallInfoRow'>
            <label for='hiGaToggle'>Raised</label>
            <input id='hiGaToggle' type='checkbox' v-model='rules.ga.raised'>
          </div>
        </div>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sargam'>
        <label class='small'>Ma</label>
        <div class='infoCol'>
          <div class='smallInfoRow'>
            <label for='loMaToggle'>Lowered</label>
            <input id='loMaToggle' type='checkbox' v-model='rules.ma.lowered'>
          </div>
          <div class='smallInfoRow'>
            <label for='hiMaToggle'>Raised</label>
            <input id='hiMaToggle' type='checkbox' v-model='rules.ma.raised'>
          </div>
        </div>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sapa'>
        <label for='paToggle' class='small'>Pa</label>
        <input id='paToggle' type='checkbox' v-model='rules.pa'>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sargam'>
        <label class='small'>Dha</label>
        <div class='infoCol'>
          <div class='smallInfoRow'>
            <label for='loDhaToggle'>Lowered</label>
            <input id='loDhaToggle' type='checkbox' v-model='rules.dha.lowered'>
          </div>
          <div class='smallInfoRow'>
            <label for='hiDhaToggle'>Raised</label>
            <input id='hiDhaToggle' type='checkbox' v-model='rules.dha.raised'>
          </div>
        </div>
      </div>
    </div>
    <div class='infoRow'>
      <div class='sargam'>
        <label class='small'>Ni</label>
        <div class='infoCol'>
          <div class='smallInfoRow'>
            <label for='lowNiToggle'>Lowered</label>
            <input id='lowNiToggle' type='checkbox' v-model='rules.ni.lowered'>
          </div>
          <div class='smallInfoRow'>
            <label for='hiNiToggle'>Raised</label>
            <input id='hiNiToggle' type='checkbox' v-model='rules.ni.raised'>
          </div>
        </div>
      </div>
    </div>
    <div class='infoRow' v-if='selectedRaag !== undefined'>
      <button @click='save'>save</button>
    </div>
    <div class='infoRow' v-if='selectedRaag !== undefined'>
      <span>{{savedMsg}}</span>
    </div>
  </div>
</template>
<script lang='ts'>
 
import { getRagaNames, getRaagRule, saveRaagRules } from '@/js/serverCalls.ts';
import { RuleProfileType } from '@shared/types';
import cloneDeep from 'lodash/cloneDeep';


type RaagEditorDataType = {
  raagNames: string[],
  selectedRaag: string | undefined,
  otherRaagName: string | undefined,
  rules: RuleProfileType,
  rulesTemplate: RuleProfileType,
  savedMsg: string
}
export default {
  name: 'RaagEditor',
  
  data(): RaagEditorDataType {
    return {
      raagNames: [],
      selectedRaag: undefined,
      otherRaagName: undefined,
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
      savedMsg: 'unsaved'
    }
  },
  
  created() {
    if (this.$store.state.userID === undefined) {
      if (this.$cookies.get('userID') === undefined) {
        this.$router.push('/')
      }     
    }
  },
  
  async mounted() {
    
    this.raagNames = await getRagaNames();
    this.raagNames.push('Other (specify)');
  },
  
  watch: {
    async selectedRaag(newVal) {
      console.log(newVal)
      try {
        const rules = await getRaagRule(newVal);
        if (rules.rules) {
          this.rules = rules.rules;
          const date = new Date(rules.updatedDate);
          this.savedMsg = 'Saved: ' + date.toLocaleString();
        } else {
          console.log('resetting rules')
          this.rules = cloneDeep(this.rulesTemplate);
          this.savedMsg = 'unsaved'
        }
      } catch (err) {
        console.error(err)
      }
      
    }
  },
  
  methods: {
    
    async save() {
      const date = new Date();
      const name = this.selectedRaag === 'Other (specify)' ? 
        this.otherRaagName : 
        this.selectedRaag;
      const res = await saveRaagRules(
        name, this.rules, date
        );
      if (res) {
        this.savedMsg = 'Saved: ' + date.toLocaleString()
      }
    }
  }
}
</script>

<style scoped>

.bigInfoRow {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.infoRow {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.bigInfoCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  max-width: 250px;
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

label {
  width: 70px;
  text-align: right;
  margin-right: 10px;
}

label.small {
  width: 50px;
  min-width: 50px;
  font-weight: bold;
  
}

select {
  width: 250px;
  background-color: var(--Primary);
  color: white;
}

input {
  color: black;
}

button.right {
  margin-left: 10px;
}

.main {
  background-image: linear-gradient(black, var(--Primary));
  height: 100%;
  color: white;
  user-select: none;
}


</style>
