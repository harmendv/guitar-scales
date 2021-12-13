<template>
  <div
    class="vue-fret-number"
    :class="{'vue-fret-number--highlight': !!highlight}"
    :style="`--divider: ${frets};`"
  >
    <div class="vue-fret-number__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    frets: {
      type: Number,
      default: 19,
    },
    highlight: {
      type: Boolean,
      default: false,
    }
  },
};
</script>

<style lang="scss">
.vue-fret-number {
  $self: &;
  position: relative;
  width: calc(100% / var(--divider));
  text-align: center;
  padding: 10px;
  display: flex;
  justify-content: center;
  border-right: 2px solid transparent;
  background: #6b7a93;
  color: #fff;
  &--highlight {
    #{$self}__content {
      background: #020b1a;
    }

  }
  &:first-of-type {
    border-right: 4px solid transparent;
  }
  &:last-of-type {
    border-right: 0;
  }
  &__content {
    position: relative;
    background: #58657e;
    z-index: 1;
    padding: 3px;
    width: 23px;
    height: 23px;
    display: flex;
    font-family: monospace;
    font-size: 13px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
}
</style>