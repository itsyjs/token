import { Text } from 'vue'
import { getTagName } from './util/index.js'
import * as handle from './handlers/index.js'

export async function generateSourceCode (vnode = []) {
  const list = Array.isArray(vnode) ? vnode : [vnode]
  const resultLines = []
  for (const vnode of list) resultLines.push((await printVNode(vnode)).lines)
  return resultLines.flat(Infinity)
}

export async function printVNode (vnode) {
  // bail early if we've hit text
  if (vnode.type === Text) return { lines: [vnode.children], isText: true }

  // state elements are shared by multiple handlers
  const state = {
    vnode,
    tagName: getTagName(vnode),
    attrs: [],
    skipProps: ['key'],
    multilineAttrs: false,
    childLines: [],
    isChildText: false,
    lines: []
  }

  if (typeof vnode.type === 'object' || typeof vnode.type === 'string') {
    // wait for async component before going on
    if (vnode.type?.__asyncLoader && !vnode.type.__asyncResolved) await vnode.type.__asyncLoader()
    handle.directives(state)
    handle.props(state)
    await handle.children(state, printVNode)
    await handle.slots(state, printVNode)
    handle.render(state)
  } else if (vnode?.shapeFlag & 1 << 4) {
    for (const child of vnode.children) state.lines.push(...(await printVNode(child)).lines)
  }

  return { lines: state.lines }
}
