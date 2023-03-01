<template>
  <div
    class="vue-fret-number"
    :class="{'vue-fret-number--highlight': !!highlight}"
    :style="`--divider: ${frets};`"
  >
    <div class="vue-fret-number__content">
      <div class="vue-fret-number__number">
        <slot />
      </div>
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
  background: #000000;
  color: #fff;
  &--highlight {
    #{$self}__content {
      background: #1a1a1a;
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
    background: #000000;
    z-index: 1;
    padding: 3px;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    display: flex;
    font-family: monospace;
    font-size: 1rem;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
  }
  &__number {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
