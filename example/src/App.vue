<script setup>
import Foo from './Foo.vue'
import Token from '../../Token.vue'
import { ref } from 'vue'

const f = ref(null)
</script>

<template>
  <div ref="f">
    <token :component="f" #default="{ code }" :use-shiki="false">
      <pre v-text="code" />
    </token>
    <foo>
      <h1>Manual mode example</h1>
    </foo>
    <h2>Bar</h2>
    <hr />
    <token>
      <foo><h1>Fully automatic</h1></foo>
    </token>
  </div>
</template>
