<template>
  <div class="container">
    <canvas id="babylon" class="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ShowCase} from "@/entity/ShowCase";

export default defineComponent({
  name: 'BabylonExamples',
  mounted() {
    const canvas = document.querySelector("canvas")!;
    new ShowCase(canvas, 'h9')
  },
});
</script>

<style scoped>
.container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0;
}

.canvas {
  flex: 1;
  display: block;
}
</style>
