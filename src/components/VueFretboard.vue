<template>
  <div class="vue-fretboard">
    <vue-string
      v-for="(start, index) in reversedStrings"
      :frets="frets"
      :start="start"
      :key="index"
      :highlight="highlight"
      :show-interval="showInterval"
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
      default: () => ['E', 'A', 'D', 'G', 'B', 'E']
    },
    frets: {
      type: Number,
      default: 19,
    },
    highlight: {
      type: Array,
      default: () => []
    },
    showInterval: {
      type: Boolean,
      default: false,
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