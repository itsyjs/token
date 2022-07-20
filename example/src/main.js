import { createApp } from 'vue'
import { setWasm, setCDN, getHighlighter } from 'shiki'
import App from './App.vue'

setWasm('/shiki/dist/onigasm.wasm')
setCDN('/shiki/')

const highlighter = await getHighlighter({ theme: 'nord', langs: ['js', 'vue-html'] })

const app = createApp(App)
app.provide('highlighter', highlighter)
app.mount('#app')
