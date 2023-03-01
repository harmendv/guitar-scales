<template>
  <div
    class="vue-string"
    :style="`--divider: ${frets};`"
  >
    <div
      class="vue-string__cell"
      :class="{
        'vue-string__cell--first': index === 0,
      }"
      v-for="(note, index) in notes"
      :key="index"
    >
      <div
        class="vue-string__note"
        :class="{
          'vue-string__note--highlight': !!note.highlight && degrees[note.degree],
          'vue-string__note--root': !!note.root && degrees[note.degree],
          'vue-string__note--hidden': (!note.highlight && showRest !== 'true'),
        }"
      >
        <div class="vue-string__note-content">
            <template v-if="showDegrees === 'true' && note.degree">
                {{ note.degree }}
            </template>
            <template v-else>
                {{ note.name }}
            </template>
        </div>
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
    degrees: {
      type: Object,
      default: () => ({})
    },
    showDegrees: {
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
          degree: highlightNoteIndex >= 0 ? this.highlight[highlightNoteIndex].degree : false,
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
  $self: &;

  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;

  &__cell {
    position: relative;

    width: calc(100% / var(--divider));
    text-align: center;
    padding: 7px;
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
      background-color: #09090a;
    }
    &:last-of-type {
      border-right: 0;
    }

    &--first {
      #{$self}__note {
        background: #09090a;
        &--highlight {
          background: #004397;
          color: #fff;
        }
        &--root {
          background: #dc4a04;
          color: #fff;
        }
      }
    }
  }

  &__note {
    position: relative;
    background: #161618;
    z-index: 1;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    display: flex;
    font-family: monospace;
    font-size: clamp(7px, 1.2vw, 13px);
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: .2s all;
    color: #fff;
    &-content {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
    }
    &--highlight {
      background: #004397;
      color: #fff;
    }
    &--root {
      background: #dc4a04;
      color: #fff;
    }
    &--hidden {
      opacity: 0;
    }
  }

  &__degree {
    position: absolute;
    top: 2px;
    left: 3px;
    color: #fff;
    display: flex;
    border-radius: 100%;
    align-items: center;
    justify-content: center;
    font-size: clamp(4px, 1vw, 8px);
    text-align: center;
  }
}
</style>
