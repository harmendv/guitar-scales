<template>
  <div id="app">
    <vue-fretboard
      :strings="strings"
      :highlight="highlight"
      :frets="frets"
      :show-interval="showInterval"
    />
    <vue-select :options="notes" v-model="note" />
    <vue-select :options="scales" v-model="scale" />
  </div>
</template>

<script>
import VueFretboard from "./components/VueFretboard";
import VueSelect from "./components/VueSelect";
import { scales, scalesFlatMap } from "./utils/scales";
import { notes, getNoteByOffset } from "./utils/notes";

export default {
  components: {
    VueFretboard,
    VueSelect
  },
  data() {
    return {
      strings: ['E', 'A', 'D', 'G', 'B', 'E'],
      frets: 19,
      note: 'A',
      scale: 'natural-minor',
      showInterval: true,
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
    },
    highlight() {
      const highlight = [];
      const scaleIndex = scalesFlatMap.indexOf(this.scale);
      const scaleFormula = scales[scaleIndex].formula;
      const scaleFormulaLength = scaleFormula.length;
      for(let i = 0; i < scaleFormulaLength; i++) {
        highlight.push({
          note: getNoteByOffset(`${this.note}`, scaleFormula[i].chromatic - 1),
          interval: scaleFormula[i].interval,
        })
      }
      return highlight;
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
