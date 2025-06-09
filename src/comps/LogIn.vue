<template>
  <div class='main'>
    <div class='waiverContainer'>
      <div class='waiver' v-if='firstTime || returning || firstWelcome'>
        <div v-if='firstTime'>{{waiver}}</div>
        <input 
          type='checkbox' 
            @change='agreeToWaiver' 
            v-model='agreeBool' 
            v-if='firstTime'
            >
        <div v-if='returning'>{{`Welcome back, ${firstName}!`}}</div>
        <div v-if='firstWelcome'>{{`Welcome, ${firstName}!`}}</div>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>


// import { decodeCredential } from 'vue3-google-login';
import { agreeToWaiver } from '@/js/serverCalls.ts';

type LoginDataType = {
  firstTime: boolean,
  returning: boolean,
  waiver: string,
  agreeBool: boolean,
  firstName: string | undefined,
  userID: string | undefined,
  firstWelcome: boolean | undefined
}
export default {
  name: 'LogIn',
  
  data(): LoginDataType {
    return {
      firstTime: false,
      returning: false,
      waiver: 'I agree to only use the IDTAP for scholarly and \
        / or pedagogical purposes. I understand that any copywrited materials \
        that I upload to the IDTAP are liable to be taken down in response to \
        a DMCA takedown notice.',
      agreeBool: false,
      firstName: undefined,
      userID: undefined,
      firstWelcome: undefined
    }
  },
  
  mounted() {
    this.firstTime = this.$store.state.firstTime;
    this.returning = this.$store.state.returning;
    this.userID = this.$store.state.userID;
    this.firstName = this.$store.state.firstName;
  },
  
  computed: {
    getStoreFirstTime() {
      return this.$store.state.firstTime
    },
    
    getStoreFirstName() {
      return this.$store.state.firstName
    },
    
    getStoreUserID() {
      return this.$store.state.userID
    },
    
    getStoreReturning() {
      return this.$store.state.returning
    }
  },
  
  watch: {
    getStoreFirstTime(val) {
      this.firstTime = val
    },
    
    getStoreFirstName(val) {
      this.firstName = val
    },
    
    getStoreUserID(val) {
      this.userID = val
    },
    
    getStoreReturning(val) {
      this.returning = val
    }
  },
  
  methods: {
    
    agreeToWaiver() {
      if (this.agreeBool) {
        if (this.userID === undefined) {
          throw new Error('userID is undefined')
        }
        agreeToWaiver(this.userID);
        this.firstTime = false;
        this.$store.commit('update_firstTime', this.firstTime);
        this.firstWelcome = true;
        if (this.$store.state.incomingFullPath !== undefined) {
          this.$router.push(this.$store.state.incomingFullPath);
        }
        // this.returning = true
      }
    }
  }
}
</script>

<style scoped>

.waiver {
  width: 350px;
  /* height: 200px; */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: bottom;
  justify-content: bottom;
  color: white;
}

.waiverContainer {
  width: 100%;
  height: 40%;
  display: flex;
  flex-direction: column;
  justify-content: bottom;
  align-items: center;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-image: linear-gradient(black, var(--Primary));
}

</style>
