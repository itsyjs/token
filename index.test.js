import { describe, it, assert, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { printVNode } from './generate-source.js'

beforeEach(() => { document.body.innerHTML = '' })

const domMount = (str) => {
  const el = document.createElement('div')
  el.innerHTML = str
  document.body.append(el)
  return el
}

describe('printVNode', () => {
  it('replicates DOM nodes', async () => {
    const root = ref(null)
    const template = '<div ref="root" class="foo"><h1>Hello world</h1></div>'
    const Fixture = { template, setup: () => ({ root }) }
    mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    const expected = domMount(template)
    const result = domMount(resultStr.join(''))
    // whitespace inserted for indented children, so remove to compare
    assert.equal(
      expected.innerHTML.replace(/\s/g, ''),
      result.innerHTML.replace(/\s/g, '')
    )
  })
  it('handles components', async () => {
    const root = ref(null)
    const template = '<div ref="root"><my-component /><h1>BBQ</h1></div>'
    const Comp = {
      name: 'MyComponent',
      template: '<article>OMG</article>'
    }
    const Fixture = {
      template,
      setup: () => ({ root }),
      components: { MyComponent: Comp }
    }
    const wrapper = mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    const expected = domMount(template)
    const result = domMount(resultStr.join(''))
    assert.ok(wrapper.find('article').exists()) // the component was mounted
    assert.equal(
      expected.innerHTML.replace(/\s/g, ''),
      result.innerHTML.replace(/\s/g, '')
    )
  })
  it('handles class bindings', async () => {
    const root = ref(null)
    const condition = ref(true)
    const template = `<div ref="root" class="foo" :class="{ 'bar': condition, 'baz': !condition }"><h1>Hello world</h1></div>`
    const Fixture = { template, setup: () => ({ root, condition }) }
    mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    const result = domMount(resultStr.join(''))
    assert.equal(result.querySelector('div').classList, 'foo bar')
    assert.notInclude(resultStr.join(''), ':class')
  })
  it('handles boolean - true - props', async () => {
    const root = ref(null)
    const condition = ref(true)
    const template = `<div ref="root"><my-component :foo="condition" /><h1>Hello world</h1></div>`
    const Comp = {
      name: 'MyComponent',
      template: '<article>OMG</article>',
      props: { foo: Boolean }
    }
    const Fixture = {
      template,
      setup: () => ({ root, condition }),
      components: { MyComponent: Comp }
    }
    mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    assert.include(resultStr.join(''), '<my-component foo />')
  })
  it('handles boolean - false - props', async () => {
    const root = ref(null)
    const condition = ref(false)
    const template = `<div ref="root"><my-component :foo="condition" /><h1>Hello world</h1></div>`
    const Comp = {
      name: 'MyComponent',
      template: '<article>OMG</article>',
      props: { foo: Boolean }
    }
    const Fixture = {
      template,
      setup: () => ({ root, condition }),
      components: { MyComponent: Comp }
    }
    mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    assert.include(resultStr.join(''), '<my-component />')
  })
  it('handles v-model', async () => {
    const root = ref(null)
    const model = ref('')
    const template = `<div ref="root"><my-component v-model="model" /><h1>Hello world</h1></div>`
    const Comp = {
      name: 'MyComponent',
      template: '<article>OMG</article>',
      props: { modelValue: null },
      emits: ['update:modelValue']
    }
    const Fixture = {
      template,
      setup: () => ({ root, model }),
      components: { MyComponent: Comp }
    }
    mount(Fixture)
    const resultStr = (await printVNode(root.value.__vnode)).lines
    assert.include(resultStr.join(''), `<my-component v-model="''" />`)
  })
})
