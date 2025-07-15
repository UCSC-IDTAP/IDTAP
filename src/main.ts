import { createApp } from 'vue';
import App from '@/App.vue';
import router from './router';
import { createStore } from 'vuex';
import vue3GoogleLogin from 'vue3-google-login';
import VueCookies from 'vue-cookies';
import './assets/styles/global.css';
import { Color } from '@shared/enums'

const store = createStore({
  state() {
    return {
      _id: '63445d13dc8b9023a09747a6',
      userID: undefined,
      firstTime: false,
      returning: false,
      firstName: undefined,
      name: undefined,
      lastName: undefined,
      query: undefined,
      incomingFullPath: undefined
    }
  },
  mutations: {
    update_id(state, _id) {
      state._id = _id
    },
    
    update_userID(state, userID) {
      state.userID = userID
    },
    
    update_firstTime(state, firstTime) {
      state.firstTime = firstTime
    },
    
    update_returning(state, returning) {
      state.returning = returning
    },
    
    update_firstName(state, firstName) {
      state.firstName = firstName
    },

    update_name(state, name) {
      state.name = name
    },

    update_lastName(state, lastName) {
      state.lastName = lastName
    },

    update_query(state, query) {
      state.query = query
    },

    update_incomingFullPath(state, incomingFullPath) {
      state.incomingFullPath = incomingFullPath
    }
  }
})

// const loadFont = (name: string, url: string): Promise<void> => {
//   const font = new FontFace(name, `url(${url}) format('woff2')`);
//   return font.load().then((loadedFont) => {
//     (document.fonts as any).add(loadedFont);
//     console.log(`${name} loaded successfully`);
//   }).catch((error) => {
//     console.error(`Failed to load ${name}:`, error);
//   });
// };

// Promise.all([
//   loadFont('Bravura', 'https://cdn.jsdelivr.net/npm/@vexflow-fonts/bravura/bravura.woff2'),
//   loadFont('Academico', 'https://cdn.jsdelivr.net/npm/@vexflow-fonts/academico/academico.woff2')
// ]).then(() => {
//   console.log('All fonts loaded!');
//   // Now you can safely call your tuningData() function
// });

// for event bus
import mitt from 'mitt';
import { createHead } from '@vueuse/head';
const head = createHead();
const emitter = mitt();
const app = createApp(App);
export { store };
app.config.globalProperties.emitter = emitter;

const root = document.documentElement;
Object.entries(Color).forEach(([key, value]) => {
  root.style.setProperty(`--${key}`, value as string);
});

// For frontend, client ID can be public but we'll use env var for consistency
const GOOGLE_CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID || 
  "324767655055-crhq76mdupavvrcedtde986glivug1nm.apps.googleusercontent.com";

app
  .use(router)
  .use(store)
  .use(vue3GoogleLogin, {
    clientId: GOOGLE_CLIENT_ID
  })
  .use(VueCookies, { expires: '7d' })
  .use(head)
  .mount('#app');
