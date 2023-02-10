<template>
  <BabylonExamples></BabylonExamples>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BabylonExamples from "@/components/BabylonExamples.vue";

export default defineComponent({
  name: 'App',
  components: {
    BabylonExamples
  }
});
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
