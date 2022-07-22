<script setup>
import Foo from './Foo.vue'
import Token from '../../Token.vue'
import { ref } from 'vue'

const f = ref(null)
const model = ref(true)
</script>

<template>
  <div ref="f">
    <token :component="f" :use-shiki="false">
      <template #default="{ code }">
        <pre v-text="code" />
      </template>
    </token>
    <foo>
      <h1>Manual mode example</h1>
    </foo>
    <h2>Bar</h2>
    <hr />
    <token>
      <foo v-model="model"><h1>Fully automatic</h1></foo>
    </token>
  </div>
</template>
