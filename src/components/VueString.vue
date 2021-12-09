<template>
  <div
    class="vue-string"
    :style="`--divider: ${frets};`"
  >
    <div
      class="vue-string__cell"
      v-for="(fret, index) in frets"
      :key="fret"
    >
      <div class="vue-string__note">{{ getNoteByOffset(root, index)['note'] }}</div>
    </div>
  </div>
</template>

<script>
import { getNoteByOffset } from '../utils/notes';

export default {
  props: {
    root: {
      type: String,
      required: true,
    },
    frets: {
      type: Number,
      default: 19,
    }
  },
  methods: {
    getNoteByOffset(root, offset) {
      return getNoteByOffset(root, offset);
    }
  }
};
</script>

<style lang="scss">
.vue-string {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;

  &__cell {
    position: relative;

    width: calc(100% / var(--divider));
    text-align: center;
    padding: 10px;
    display: flex;
    justify-content: center;
    border-right: 2px solid #000;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      height: 2px;
      width: 100%;
      background-color: black;
      z-index: 1;
    }
    &:first-of-type {
      border-right: 4px solid #000;
      background-color: #a5b2c9;
    }
    &:last-of-type {
      border-right: 0;
    }
  }

  &__note {
    position: relative;
    background: #cdd6e7;
    z-index: 1;
    padding: 3px;
    width: 20px;
    height: 20px;
    display: flex;
    font-family: monospace;
    font-size: 13px;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
  }
}
</style>