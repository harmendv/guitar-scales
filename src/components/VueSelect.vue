<template>
  <div class="vue-select" :class="{ 'vue-select--focused': focused }">
    <select class="vue-select__select" @change="onChange" @focus="onFocus" @blur="onBlur">
      <option
        :value="option.value"
        :selected="value === option.value"
        v-for="(option, index) in options"
        :key="index"
      >{{ option.title }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Boolean, Number],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      focused: false,
    };
  },
  methods: {
    onChange(event) {
      this.$emit('input', event.target.value);
    },
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.focused = false;
    }
  }
};
</script>

<style lang="scss">
.vue-select {
  display: inline-block;
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 5px 14px rgba(0,0,0,0.2);
  margin-right: 20px;
  font-family: monospace;
  margin-bottom: 10px;
  transition: .2s all;

  &--focused {
    box-shadow: 0 5px 14px rgba(0,0,0,0.2), 0 0 0 3px rgba(12, 94, 225, 0.4);
  }

  &__select {
    font-family: monospace;
    font-weight: bold;
    padding: 10px 30px 10px 10px;
    display: inline-block;
    font-size: 16px;
    outline: 0;
    appearance: none;
    background: transparent url(http://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png) no-repeat 100% center;
    background-size: 8px;
    background-position-x: calc(100% - 15px);
    border: 0;
  }
}
</style>