<template>
  <div class="view">
    <vue-fretboard
        :strings="strings"
        :highlight="highlight"
        :frets="frets"
        :show-degrees="showDegrees"
        :degrees="degrees"
        :show-rest="showRest"
    />
    <div class="options">
      <vue-select :options="notes" v-model="note" />
      <vue-select :options="scales" v-model="scale" />
      <vue-select :options="showDegreesOptions" v-model="showDegrees" />
      <vue-select :options="showRestOptions" v-model="showRest" />
      <div class="degrees">
        <vue-checkbox label="1st" v-model="degrees['1']" :disabled="!availableDegrees.includes(1)" />
        <vue-checkbox label="2nd" v-model="degrees['2']" :disabled="!availableDegrees.includes(2)" />
        <vue-checkbox label="3rd" v-model="degrees['3']" :disabled="!availableDegrees.includes(3)" />
        <vue-checkbox label="4th" v-model="degrees['4']" :disabled="!availableDegrees.includes(4)" />
        <vue-checkbox label="5th" v-model="degrees['5']" :disabled="!availableDegrees.includes(5)" />
        <vue-checkbox label="6th" v-model="degrees['6']" :disabled="!availableDegrees.includes(6)" />
        <vue-checkbox label="7th" v-model="degrees['7']" :disabled="!availableDegrees.includes(7)" />
        <vue-checkbox label="Blue Note" v-model="degrees['b']" :disabled="!availableDegrees.includes('b')" />
      </div>
    </div>
  </div>
</template>

<script>
import VueFretboard from "../components/VueFretboard";
import VueSelect from "../components/VueSelect";
import VueCheckbox from "../components/VueCheckbox";
import { scales, scalesFlatMap } from "../utils/scales";
import { notes, getNoteByOffset } from "../utils/notes";

export default {
  components: {
    VueFretboard,
    VueSelect,
    VueCheckbox
  },
  data() {
    return {
      strings: ['E', 'A', 'D', 'G', 'B', 'E'],
      frets: 19,
      note: this.$route.query.note || 'C',
      scale: this.$route.query.scale || 'major',
      showDegrees: this.$route.query.showDegrees || 'true',
      degrees: this.$route.query.degrees ? (JSON.parse(decodeURIComponent(this.$route.query.degrees))) : ({
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': true,
        '7': true,
        'b': true,
      }),
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
    },
    degrees: {
      handler(value) {
        this.$router.push({
          path: '/',
          query: {
            ...this.$route.query,
            degrees: JSON.stringify(value),
          }
        }).catch(() => {});
      },
      immediate: true,
      deep: true,
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
    },
    availableDegrees() {
      return this.highlight.flatMap((i) => i.degree)
    }
  }
}
</script>

<style lang="scss">
.degrees {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>