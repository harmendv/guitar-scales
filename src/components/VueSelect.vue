<template>
  <div class="vue-select">
    <select class="vue-select__select" @change="onChange">
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
  methods: {
    onChange(event) {
      this.$emit('input', event.target.value);
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

  &__select {
    border: 0;
    padding: 20px 40px 20px 20px;
    display: inline-block;
    font-size: 16px;
    outline: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent url(http://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png) no-repeat 100% center;
    background-size: 8px;
    background-position-x: calc(100% - 15px);
  }
}
</style>