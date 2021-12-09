<template>
  <div class="vue-fretboard">
    <vue-string
      v-for="(rootNote, index) in reversedStrings"
      :frets="frets"
      :root="rootNote"
      :key="index"
    />
  </div>
</template>

<script>
import VueString from "./VueString";

export default {
  components: {
    VueString,
  },
  props: {
    strings: {
      type: Array,
      default: () => ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
    },
    frets: {
      type: Number,
      default: 19,
    },
  },
  computed: {
    reversedStrings() {
      return Array.from(this.strings).reverse();
    }
  }
};
</script>


<style lang="scss">
.vue-fretboard {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  overflow-x: auto;
  width: 100%;
  box-shadow: 0 5px 16px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
</style>