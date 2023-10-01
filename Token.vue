<script>
const isAbsent = Symbol()
</script>

<script setup>
import { useSlots, ref, inject, watch, computed } from 'vue'
import { generateSourceCode } from './generate-source.js'

const props = defineProps({
  state: null,
  component: {
    type: null,
    default: isAbsent
  },
  useShiki: {
    type: Boolean,
    default: true
  },
  lang: String
})
const usingSlots = computed(() => props.component === isAbsent)

const highlighter = inject('highlighter', null)
const highlightTheme = inject('highlightTheme', null)
const transformCode = (code) => (highlighter && props.useShiki) ? highlighter.codeToHtml(code, { lang: props.lang || 'vue-html', theme: highlightTheme }) : code

const slots = useSlots()
const resultText = ref('')
const updateText = async () => {
  if (!usingSlots.value && !props.component) return // bail if the ref hasn't resolved yet
  const vnode = usingSlots.value ? slots.default?.() : props.component?.__vnode
  const lines =  await generateSourceCode(vnode)
  const code = lines.join('\n')
  resultText.value = transformCode(code)
}

watch(() => props.state, updateText, { deep: true, immediate: true })
if (!usingSlots.value) watch(() => props.component, updateText)
</script>

<template>
  <slot :code="resultText" />
  <div v-if="usingSlots" v-html="resultText" v-bind="$attrs" class="itsy-token" />
</template>
