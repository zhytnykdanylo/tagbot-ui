import {createApp} from 'vue'
import Axios from 'axios'
import {createRouter, createWebHistory} from 'vue-router'
import mitt from 'mitt'
import {createApi} from './api'
import {routes} from './routes'
import Main from './Main.vue'
import {createPinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import {pageMetaStore} from './store/pageMetaStore'
import authService from './services/auth'
import * as en from './locales/en.json'
import vue3GoogleLogin from 'vue3-google-login'

import './assets/css/style.css'

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en
    },
})

const router = createRouter({
    end: undefined, sensitive: undefined, strict: undefined,
    history: createWebHistory(),
    routes: routes,
})

router.beforeEach((to, from, next) => {
    const pagemeta = pageMetaStore()
    pagemeta.setPageMeta({title: to.meta.title, description: to.meta.description})
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!authService.isAuthenticated()) {
            next({
                name: 'login'
            })
        } else {
            next()
        }
    } else {
        next()
    }
})

const toastOptions = {
    position: "top-right",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
    transition: "Vue-Toastification__slideBlurred",
    maxToasts: 20,
    newestOnTop: true
}

const pinia = createPinia()
const api = createApi({handler: Axios, namespace: '/v1'})

const app = createApp(Main)
app.use(Toast, toastOptions)
app.use(i18n)
app.use(pinia)
app.use(api)
app.use(router)

// @ts-ignore
const googleClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID
app.use(vue3GoogleLogin, {
    clientId: googleClientId,
})

const eventbus = mitt()
app.config.globalProperties.$mitt = eventbus
app.config.globalProperties.$goTo = function (route_name: any) {
    this.$router.push({name: route_name})
}

import {stores} from './store'
app.config.globalProperties.$stores = stores
app.mount('#app')
