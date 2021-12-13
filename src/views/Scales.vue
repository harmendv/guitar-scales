<template>
  <div class="view">
    <vue-fretboard
        :strings="strings"
        :highlight="highlight"
        :frets="frets"
        :show-degrees="showDegrees"
        :show-rest="showRest"
    />
    <div class="options">
      <vue-select :options="notes" v-model="note" />
      <vue-select :options="scales" v-model="scale" />
      <vue-select :options="showDegreesOptions" v-model="showDegrees" />
      <vue-select :options="showRestOptions" v-model="showRest" />
    </div>
  </div>
</template>

<script>
import VueFretboard from "../components/VueFretboard";
import VueSelect from "../components/VueSelect";
import { scales, scalesFlatMap } from "../utils/scales";
import { notes, getNoteByOffset } from "../utils/notes";

export default {
  components: {
    VueFretboard,
    VueSelect
  },
  data() {
    return {
      strings: ['E', 'A', 'D', 'G', 'B', 'E'],
      frets: 19,
      note: this.$route.query.note || 'A',
      scale: this.$route.query.scale || 'minor-pentatonic',
      showDegrees: this.$route.query.showDegrees || 'true',
      showRest: this.$route.query.showRest || 'true',
      showDegreesOptions: [
        { title: 'Show Scale Degrees', value: 'true' },
        { title: 'Hide Scale Degrees', value: 'false' }
      ],
      showRestOptions: [
        { title: 'All Notes', value: 'true' },
        { title: 'Only Scale Notes', value: 'false' }
      ]
    }
  },
  watch: {
    note: {
      handler(value) {
        this.$router.push({
          path: '/',
          query: {
            ...this.$route.query,
            note: value,
          }
        }).catch(() => {});
      },
      immediate: true,
    },
    showDegrees: {
      handler(value) {
        this.$router.push({
          path: '/',
          query: {
            ...this.$route.query,
            showDegrees: value,
          }
        }).catch(() => {});
      },
      immediate: true,
    },
    showRest: {
      handler(value) {
        this.$router.push({
          path: '/',
          query: {
            ...this.$route.query,
            showRest: value,
          }
        }).catch(() => {});
      },
      immediate: true,
    },
    scale: {
      handler(value) {
        this.$router.push({
          path: '/',
          query: {
            ...this.$route.query,
            scale: value,
          }
        }).catch(() => {});
      },
      immediate: true,
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
    selectedScale() {
      const scaleIndex = scalesFlatMap.indexOf(this.scale);
      return scales[scaleIndex].name;
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
          degree: scaleFormula[i].degree,
        })
      }
      return highlight;
    }
  }
}
</script>

<style lang="scss">
.header {
  font-family: monospace;
}
</style>