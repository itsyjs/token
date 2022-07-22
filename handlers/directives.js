import { serializeAndCleanJs } from '../util/index.js'
import { vModelText, vModelCheckbox, vModelSelect, vModelRadio, vModelDynamic } from 'vue'

const vModelDirectives = [vModelText, vModelCheckbox, vModelSelect, vModelRadio, vModelDynamic]

export const useGenerateDirective = ({ attrs, multilineAttrs }) => (dirName, dir, valueCode) => {
  let modifiers = ''
  for (const key in dir.modifiers) if (dir.modifiers[key]) modifiers += `.${key}`
  let arg = ''
  if (dir.arg) arg = `:${dir.arg}`
  if (valueCode) valueCode = valueCode.replace(/^\$(setup|props|data)\./g, '')
  const valueLines = valueCode ? [valueCode] : serializeAndCleanJs(dir.value)
  const attr = []
  const dirAttr = `v-${dirName}${arg}${modifiers}="`
  if (valueLines.length > 1) {
    attr.push(`${dirAttr}${valueLines[0]}`)
    attr.push(...valueLines.slice(1, valueLines.length - 1))
    attr.push(`${valueLines[valueLines.length - 1]}"`)
    multilineAttrs = true
  } else {
    attr.push(`${dirAttr}${valueLines[0] ?? ''}"`)
  }
  attrs.push(attr)
}

export function directives(state) {
  const generateDirective = useGenerateDirective(state)
  const { vnode } = state
  for (const dir of vnode.dirs ?? []) {
    // vModel
    if (vModelDirectives.includes(dir.dir)) {
      const listenerKey = `onUpdate:${dir.arg ?? 'modelValue'}`
      const listener = vnode.props[listenerKey]
      let valueCode = null
      if (listener) {
        state.skipProps.push(listenerKey)
        const listenerSource = listener.toString()
        const result = /\(\$event\) => (.*?) = \$event/.exec(listenerSource)
        valueCode = result?.[1]
      }
      generateDirective('model', dir, valueCode)
    } else if (dir.instance._ || dir.instance.$) {
      const target = dir.instance.$ ?? dir.instance._
      let dirName
      for (const directives of [target.directives, target.appContext.directives]) {
        for (const key in directives) {
          if (target.directives[key] === dir.dir) {
            dirName = key
            break
          }
        }
        if (dirName) break
      }
      if (dirName) generateDirective(dirName, dir)
    }
  }
}
