import { indent } from '../util/index.js'

const voidElements = [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', ]

export function render(state) {
  // See TODO below
  // if (state.attrs.length > 1) state.multilineAttrs = true
  const tag = [`<${state.tagName}`]
  for (const attrLines of state.attrs) {
    tag[0] += ` ${attrLines}`
    // TODO: make this behavior switch/configurable
    // This makes the attrs multiple lines - old behavior
    // if (state.multilineAttrs) {
    // tag.push(...indent(attrLines))
  }
  if (state.childLines.length > 0) {
    tag[0] += `>`
    // if (state.multilineAttrs) {
    // tag.push('>')
  }

  const isVoid = voidElements.includes(state.tagName.toLowerCase())
  if (state.childLines.length > 0) {
    if (state.childLines.length === 1 && tag.length === 1 && !state.attrs.length && state.isChildText) {
      state.lines.push(`${tag[0]}${state.childLines[0]}</${state.tagName}>`)
    } else {
      state.lines.push(...tag)
      state.lines.push(...indent(state.childLines))
      state.lines.push(`</${state.tagName}>`)
    }
  } else if (tag.length > 1) {
    state.lines.push(...tag)
    state.lines.push(isVoid ? '>' : '/>')
  } else {
    state.lines.push(`${tag[0]}${isVoid ? '' : ' /'}>`)
  }
}
