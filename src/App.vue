<template>
  <div id="app">
    <vue-fretboard
      :strings="strings"
      :frets="frets"
    />
    <vue-select :options="notes" v-model="note" />
    <vue-select :options="scales" v-model="scale" />
  </div>
</template>

<script>
import VueFretboard from "./components/VueFretboard";
import VueSelect from "./components/VueSelect";
import { scales } from "./utils/scales";
import { notes } from "./utils/notes";

export default {
  components: {
    VueFretboard,
    VueSelect
  },
  data() {
    return {
      strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      frets: 19,
      note: 'C',
      scale: 'major',
    }
  },
  computed: {
    scales() {
      const options = [];
      scales.forEach((scale) => {
        options.push({ title: scale.name, value: scale.slug })
      })
      return options;
    },
    notes() {
      const options = [];
      notes.forEach((note) => {
        options.push({ title: note.name, value: note.name })
      })
      return options;
    }
  }
}
</script>

<style lang="scss">
html {
  height: 100%;
  min-height: 100%;
}
body {
  margin: 0;
  padding: 50px;
  background: #cdd6e7;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

#app {
  max-width: 1200px;
  width: 100%;
}
</style>
