import { createAutoBuildingObject, indent } from '../util/index.js'

export async function slots(state, printVNode) {
  const { vnode } = state
  if (!(typeof vnode.children === 'object' && !Array.isArray(vnode.children))) return
  for (const key in vnode.children) {
    if (typeof vnode.children[key] === 'function') {
      const autoObject = createAutoBuildingObject(key => `{{ ${key} }}`, (target, p) => {
        // Vue 3
        if (p === '__v_isRef') return () => false
      })
      const children = vnode.children[key](autoObject.proxy)
      const slotLines = []
      for (const child of children) {
        slotLines.push(...(await printVNode(child)).lines)
      }
      const slotProps = Object.keys(autoObject.cache)
      if (slotProps.length) {
        state.childLines.push(`<template #${key}="{ ${slotProps.join(', ')} }">`)
        state.childLines.push(...indent(slotLines))
        state.childLines.push('</template>')
      } else if (key === 'default') {
        state.childLines.push(...slotLines)
      } else {
        state.childLines.push(`<template #${key}>`)
        state.childLines.push(...indent(slotLines))
        state.childLines.push(`</template>`)
      }
    }
  }
}
