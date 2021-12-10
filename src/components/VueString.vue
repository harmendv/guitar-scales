<template>
  <div
    class="vue-string"
    :style="`--divider: ${frets};`"
  >
    <div
      class="vue-string__cell"
      v-for="(note, index) in notes"
      :key="index"
    >
      <div
        class="vue-string__note"
        :class="{
          'vue-string__note--highlight': !!note.highlight,
          'vue-string__note--root': !!note.root,
          'vue-string__note--hidden': (!note.highlight && showRest !== 'true'),
        }"
      >
        {{ showInterval === 'true' && note.interval ? note.interval : note.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { getNoteByOffset } from '../utils/notes';

export default {
  props: {
    start: {
      type: String,
      required: true,
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
      type: [Boolean, String],
      default: false,
    },
    showRest: {
      type: [Boolean, String],
      default: false,
    },
  },
  computed: {
    highlightNotes() {
      return this.highlight.flatMap((i) => i.note);
    },
    notes() {
      const notes = [];
      for(let i = 0; i < this.frets; i++) {
        const note = getNoteByOffset(this.start, i);
        const highlightNoteIndex = this.highlightNotes.indexOf(note);
        const obj = {
          name: note,
          highlight: !!this.highlightNotes.includes(note),
          root: (highlightNoteIndex === 0),
          interval: highlightNoteIndex >= 0 ? this.highlight[highlightNoteIndex].interval : false,
        };
        notes.push(obj);
      }
      return notes;
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
    &--highlight {
      background: #011028;
      color: #fff;
    }
    &--root {
      background: #dc3704;
      color: #fff;
    }
    &--hidden {
      opacity: 0;
    }
  }

  &__interval {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background-color: #fff;
    color: #494949;
    width: 15px;
    height: 15px;
    display: flex;
    border-radius: 100%;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    text-align: center;
  }
}
</style>