import { serializeAndCleanJs, cleanupExpression } from '../util/index.js'
import { useGenerateDirective } from './directives.js'

const isBooleanProp = (vnode, prop) => vnode?.type?.props?.[prop]?.type?.name === Boolean.name ||  vnode?.type?.props?.[prop]?.name === Boolean.name

const useAddAttr = (state) => (prop, value) => {
  const { attrs, skipProps, multilineAttrs, vnode } = state
  if (isBooleanProp(vnode, prop)) { // there's little value in showing <foo :prop=""> for boolean props, early return with special behavior
    if ((typeof value === 'boolean' && value) || value === '') return attrs.push([prop]) // either <foo prop> or <foo :prop="true">
    else return // <foo :prop="false">
  }
  if (typeof value !== 'string' || vnode.dynamicProps?.includes(prop)) {
    let directive = ':'
    if (prop.startsWith('on')) directive = '@'
    const arg = directive === '@' ? `${prop[2].toLowerCase()}${prop.slice(3)}` : prop

    // v-model on component
    const vmodelListener = `onUpdate:${prop}`
    if (directive === ':' && (vnode.dynamicProps?.includes(vmodelListener) || vnode.props[vmodelListener])) {
      // Listener
      skipProps.push(vmodelListener)
      const listener = vnode.props[vmodelListener]
      const listenerSource = listener.toString()
      let valueCode
      const result = /\(\$event\) => (.*?) = \$event/.exec(listenerSource)
      if (result) valueCode = result[1]

      // Modifiers
      const modifiersKey = `${prop === 'modelValue' ? 'model' : prop}Modifiers`
      const modifiers = vnode.props[modifiersKey] ?? {}
      skipProps.push(modifiersKey)

      // Directive
      const generateDirective = useGenerateDirective(state)
      generateDirective('model', { arg: prop === 'modelValue' ? null : prop, modifiers, value, }, valueCode)
      return
    }

    let serialized
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      // It was formatted from auto building object (slot props)
      serialized = cleanupExpression(value.substring(2, value.length - 2).trim()).split('\n')
    } else if (typeof value === 'function') {
      let code = cleanupExpression(value.toString().replace(/'/g, '\\\'').replace(/"/g, '\''))
      const testResult = /function ([^\s]+)\(/.exec(code)
      if (testResult) {
        // Function name only
        serialized = [testResult[1]]
      } else {
        if (code.startsWith('($event) => ')) {
          // Remove unnecessary `($event) => `
          code = code.substring('($event) => '.length)
        }
        serialized = code.split('\n')
      }
    } else {
      serialized = serializeAndCleanJs(value)
    }
    if (serialized.length > 1) {
      multilineAttrs = true
      const indented = [`${directive}${arg}="${serialized[0]}`]
      indented.push(...serialized.slice(1, serialized.length - 1))
      indented.push(`${serialized[serialized.length - 1]}"`)
      attrs.push(indented)
    } else {
      attrs.push([`${directive}${arg}="${serialized[0]}"`])
    }
  } else if ([vnode?.type?.props?.[prop]?.type?.name, vnode?.type?.props?.[prop]?.name].includes(Boolean.name)) {
    attrs.push([prop])
  } else {
    attrs.push([`${prop}="${value}"`])
  }
}

export function props(state) {
  const { vnode } = state
  const props = vnode.props
  const addAttr = useAddAttr(state)
  for (const prop in props) {
    if (!state.skipProps.includes(prop)) addAttr(prop, props[prop])
  }
}
