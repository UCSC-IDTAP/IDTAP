import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
import {store } from '@/main.ts'
import ChangelogView from '@/comps/ChangeLog.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/transcriptions',
    name: 'Transcriptions',
    component: () => import('@/comps/files/FileManager.vue')
  },
  {
    path: '/audioRecordings',
    name: 'AudioRecordings',
    component: () => import('@/comps/audioRecordings/AudioRecordings.vue')
  },
  {
    path: '/raagEditor',
    name: 'RaagEditor',
    component: () => import('@/comps/RaagEditor.vue')
  },
  {
    path: '/editor',
    name: 'EditorComponent',
    component: () => import('@/comps/editor/EditorComponent.vue')
  },
  {
    path: '/analyzer',
    name: 'AnalyzerComponent',
    component: () => import('@/comps/analysis/AnalyzerComponent.vue')

  },
  {
    path: '/logIn',
    name: 'LogIn',
    component: () => import('@/comps/LogIn.vue')
  },
  {
    path: '/',
    name: 'LandingPage',
    component: () => import('@/comps/LandingPage.vue')
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/comps/collections/CollectionsComponent.vue')
  },
  {
    path:'/editorInstructions',
    name: 'Editor Instructions',
    component: () => import('@/comps/EditorInstructions.vue')
  },
  {
    path:'/analysisInstructions',
    name: 'Analysis Instructions',
    component: () => import('@/comps/AnalysisInstructions.vue')
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: ChangelogView
  },
  {
    path: '/generalInstructions',
    name: 'General Instructions',
    component: () => import('@/comps/GeneralInstructions.vue')
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  const userID = window.$cookies.get('userID')
  if (
    to.name !== 'LandingPage' &&
    to.name !== 'LogIn' &&
    to.name !== 'Changelog' &&
    to.name !== 'General Instructions' &&
    (userID === 'undefined' || userID === null || userID === undefined)
  ) {
    store.commit('update_incomingFullPath', to.fullPath)

    next({ name: 'LogIn' })
  } else {
      next()
  }
})

export default router; 
