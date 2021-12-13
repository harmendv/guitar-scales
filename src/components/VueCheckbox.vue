<template>
  <div class="vue-checkbox">
    <label class="vue-checkbox__label" v-if="label" :for="label">{{ label }}</label>
    <input :disabled="disabled" class="vue-checkbox__checkbox" :id="label" type="checkbox" :checked="value" @change="onChange">
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Boolean],
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    onChange(e) {
      this.$emit('change', e.target.checked || false);
    }
  }
}
</script>

<style lang="scss">
.vue-checkbox {
  font-family: monospace;
  display: flex;
  align-items: center;
  margin: 0 5px;
  flex-direction: row-reverse;

  &__label {
    font-size: 16px;
  }

  &__checkbox {
    width: 20px;
    height: 20px;
  }
}
</style>