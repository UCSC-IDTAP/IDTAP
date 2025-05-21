<template>
  <div id='nav' @click='handleNavClick'>
    <router-link 
      class='routerLink' 
      v-for='choice in navChoices' 
      :key='choice.name'
      :to='choice.path'
      @click='clickLink(choice.path)'
      >
      <div 
        class='link'
        :class='{active: $route.path === choice.path}'
        >
        {{ choice.name }}
      </div>
    </router-link>
    <div class='gap'></div>
    <div class='imgBox' @click='handleUsrImgClick'>
      <img 
        v-if='usrImgUrl' 
        :src='usrImgUrl' 
        class='usrImg'
        referrerpolicy="no-referrer"
        > 
      <img 
        v-else
        :src='defaultUsrImgUrl'
        class='usrImg'
        >
    </div> 
  </div>
  <div id='userMenu' v-if='showUserMenu'>
    <div class='userMenuRow' @click='logIn'>
      <span>Log in</span>
    </div>
    <div class='userMenuRow last' @click='logOut'>
      <span>Log out</span>
    </div>
  </div>
</template>

<script lang='ts'>
import { 
  decodeCredential, 
  googleLogout, 
  googleOneTap, 
  googleAuthCodeLogin 
} from 'vue3-google-login';
// import { detect } from 'detect-browser';
import { 
  userLoginGoogle, 
  handleGoogleAuthCode, 
} from '@/js/serverCalls.ts';
import  { 
  UserDataType
} from '@shared/types';
import { defineComponent } from 'vue';
import defaultUsrImgUrl from '@/assets/icons/user_head.svg';
import { LocationQueryRaw } from 'vue-router';
import { useTitle } from '@vueuse/core';

type NavBarDataType = {
  usrImgUrl?: string,
  userID?: string,
  firstName?: string,
  returning: boolean,
  firstTime: boolean,
  showUserMenu: boolean,
  userMenuWidth: number,
  defaultUsrImgUrl: string,
  lastName?: string,
  name?: string,
  navChoices: { name: string, path: string }[]
}

export default defineComponent({
  name: 'NavBar',
  data(): NavBarDataType {
    return {
      usrImgUrl: undefined,
      userID: undefined,
      firstName: undefined,
      returning: false,
      firstTime: false,
      showUserMenu: false,
      userMenuWidth: 200,
      defaultUsrImgUrl: defaultUsrImgUrl,
      lastName: undefined,
      name: undefined,
      navChoices: [
        { name: 'Transcriptions', path: '/transcriptions' },
        { name: 'Editor', path: '/editor' },
        // { name: 'Audio Events', path: '/audioEvents' },
        { name: 'Recordings', path: '/audioRecordings'},
        { name: 'Raag Editor', path: '/raagEditor' },
        { name: 'Analyzer', path: '/analyzer' },
        { name: 'Collections', path: '/collections' }
      ]
    }
  },

  props: {
    navHeight: {
      type: Number,
      required: true
    }
  },
  async mounted() {
    this.userID = this.$cookies.get('userID');
    if (this.userID === 'undefined') this.userID = undefined;
    this.usrImgUrl = this.$cookies.get('usrImgUrl');
    if (this.usrImgUrl === 'undefined') this.usrImgUrl = undefined;
    this.firstName = this.$cookies.get('firstName');
    if (this.firstName === 'undefined') this.firstName = undefined;
    this.lastName = this.$cookies.get('lastName');
    if (this.lastName === 'undefined') this.lastName = undefined;
    this.name = this.$cookies.get('name');
    if (this.name === 'undefined') this.name = undefined;
    if (this.userID) {
      this.$store.commit('update_userID', this.userID);
      this.$store.commit('update_returning', true);
      this.$store.commit('update_firstName', this.firstName);
      this.$store.commit('update_lastName', this.lastName);
      this.$store.commit('update_name', this.name);
      let pieceId = this.$cookies.get('currentPieceId');
      if (this.$route.query.id !== undefined) {
        pieceId = this.$route.query.id as string
      };
      if (pieceId !== null) this.$store.commit('update_id', pieceId); 
        //just for now
    } else {
      try {
        console.log('trying this first')
        const res = await googleOneTap({ autoLogin: false });
          const userData = decodeCredential(res.credential) as UserDataType;
          await this.loggedIn(userData);     
      } catch (err) {
        console.error(err);
      }
    }
  },

  methods: {
    async loggedIn(userData: UserDataType) {
      this.usrImgUrl = userData.picture;
      const result = await userLoginGoogle(userData);
      this.userID = result.value._id;    
      this.firstName = result.value.given_name;
      this.$cookies.set('userID', this.userID);
      this.$cookies.set('usrImgUrl', this.usrImgUrl);
      this.$cookies.set('firstName', this.firstName);
      this.$cookies.set('lastName', result.value.family_name);
      this.$cookies.set('name', result.value.name);
      this.$store.commit('update_firstName', this.firstName);
      this.$store.commit('update_lastName', result.value.family_name);
      this.$store.commit('update_name', result.value.name);
      this.$store.commit('update_userID', this.userID);
      if (!result.lastErrorObject.updatedExisting) {
        this.firstTime = true;
        this.$store.commit('update_firstTime', this.firstTime)
        this.$router.push('/logIn')
      } else if (!result.value.waiverAgreed) {
        this.firstTime = true;
        this.$store.commit('update_firstTime', this.firstTime);
        this.$router.push('/logIn');
      } else {
        this.returning = true
        this.$store.commit('update_returning', this.returning);
        if (this.$store.state.query) {
          const q = this.$store.state.query as unknown as LocationQueryRaw;
          this.$router.push({
            name: 'EditorComponent',
            query: q
          })
        }
        if (this.$store.state.incomingFullPath !== undefined) {
          this.$router.push(this.$store.state.incomingFullPath);
        }
      }
    },

    clickLink(category: string) {
      if (this.$store.state.userID === undefined) {
        // this.$store.commit('update_query', this.$route.query);
        this.$router.push('/logIn');
      } else {
        if (category === '/transcriptions') {
          useTitle('Transcriptions')
        } else if (category === '/audioEvents') {
          useTitle('Audio Events')
        } else if (category === '/audioRecordings') {
          useTitle('Audio Recordings')
        } else if (category === '/raagEditor') {
          useTitle('Raag Editor')
        }
      }
      
    },

    handleUsrImgClick(e: Event) {
      this.showUserMenu = !this.showUserMenu;
      e.stopPropagation();
    },

    logOut() {
      googleLogout();
      this.$store.commit('update_userID', undefined);
      this.usrImgUrl = undefined;
      this.$store.commit('update_firstTime', false);
      this.$store.commit('update_returning', false);
      this.$store.commit('update_firstName', undefined);
      this.$store.commit('update_lastName', undefined);
      this.$store.commit('update_name', undefined);
      this.showUserMenu = false;
      this.$cookies.set('userID', undefined);
      this.$cookies.set('usrImgUrl', undefined);
      this.$cookies.set('firstName', undefined);
      this.$cookies.set('lastName', undefined);
      this.$cookies.set('name', undefined);
      this.$router.push('/logIn')    
    },
    
    async logIn() {
      this.showUserMenu = false;
      if (this.$store.state.userID === undefined) {
        try {
          const response = await googleAuthCodeLogin();
          const reURL = window.location.href;
          const userData = await handleGoogleAuthCode(response.code, reURL);
          await this.loggedIn(userData);
        } catch (err) {
          console.error(err)
        }
      }
    },

    handleNavClick() {
      if (this.showUserMenu) this.showUserMenu = false
    }
  }

})

</script>

<style>

.usrImg {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.imgBox {
  width: v-bind(navHeight+'px');
  height: v-bind(navHeight+'px');
  min-width: v-bind(navHeight+'px');
  min-height: v-bind(navHeight+'px');
  cursor: pointer;
  border-radius: 4px;
}

html, body {
  scroll-behavior: smooth;
}

div {
  width: 100%
}

body {
  margin: 0px;
  display: flex;
  flex-direction: row;
  overflow: none;
  position: fixed;
  width: 100%;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.routerBox {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
}

.routerLink {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  color: white;
  border-radius: 4px;
  padding-left: 10px;
  padding-right: 10px;
}

.routerLink:hover {
  background-color: #242424;
}

#nav {
  display: flex;
  flex-direction: row;
  text-align: center;
  background-color: black;
}

.link {
  width: 100px;
  height: v-bind(navHeight+'px');
  display: flex;
  align-items: center;
  justify-content: center;
}

.active {
  background-color: #242424;
}

a {
  text-decoration: none;
  color: inherit;
}

.gap {
  width: 100%
}

#userMenu {
  width: v-bind(userMenuWidth + 'px');
  background-color: black;
  position: fixed;
  right: 1px;
  border: 1px solid grey;
  top: v-bind(navHeight+1+'px');
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  user-select: none;
  z-index: 5
}

.userMenuRow {
  width: v-bind(userMenuWidth-24+'px');
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  color: white;
  padding-left: 8px;
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 6px;
  border-radius: 5px;
}

.userMenuRow.last {
  margin-bottom: 6px;
}

.userMenuRow:hover {
  background-color: blue;
  cursor: pointer;
}

.routerViewContainer {
  width: 100%;
  height: 100%;
}

span {
  padding: 5px;
}

</style>
