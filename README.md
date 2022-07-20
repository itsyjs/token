# @itsy/token

easy token generation for Vue 3

## install

```sh
pnpm add -D @itsy/token
```

## use

```vue
<script setup>
import { Token } from '@itsy/token'
</script>

<template>
  <token>
    <h1>Hello world</h1>
  </token>
</template>
```

## api

### Token component

#### _default_ slot

Used to provide the DOM to be processed. When `component` is used, it instead will provide output via a slot-prop `code`.

#### state: _any_

This prop will be `watch`ed and update the token when changes occur. Can be f.ex an array of refs, or a single reactive.

#### lang: _String_

The language Shiki will use to style the token output

#### use-shiki: _Boolean_ (default is `true`)

Will use Shiki to style the token output

#### component: _Ref_

Advanced use; takes a [template ref](https://vuejs.org/guide/essentials/template-refs.html#template-refs=) that refers to the element to be tokenized

### JS exports

### generateSourceCode(vnode: VNode): string[]

The Token component uses this function, it's provided for full-manual control over input/output if needed.
