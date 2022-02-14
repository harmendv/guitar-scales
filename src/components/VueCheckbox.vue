<template>
  <div class="vue-checkbox" :class="{ 'vue-checkbox--focused': focused }">
    <label class="vue-checkbox__label" v-if="label" :for="label">{{ label }}</label>
    <input @focus="onFocus" @blur="onBlur" :disabled="disabled" class="vue-checkbox__checkbox" :id="label" type="checkbox" :checked="value" @change="onChange">
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
  data() {
    return {
      focused: false,
    };
  },
  methods: {
    onChange(e) {
      this.$emit('change', e.target.checked || false);
    },
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.focused = false;
    }
  }
}
</script>

<style lang="scss">
.vue-checkbox {
  $self: &;

  font-family: monospace;
  display: flex;
  align-items: center;
  margin: 0 5px;
  flex-direction: row-reverse;
  user-select: none;

  &--focused {
    #{$self}__checkbox {
      box-shadow: 0 5px 14px rgba(0,0,0,0.2), 0 0 0 3px rgba(12, 94, 225, 0.4);
    }
  }


  &__label {
    font-size: 16px;
    font-weight: bold;
    margin-left: 3px;
  }

  &__checkbox {
    position: relative;
    width: 40px;
    height: 20px;
    appearance: none;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 5px 14px rgba(0,0,0,0.2);
    outline: none;
    transition: .2s all;

    &:before {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 14px;
      height: 14px;
      background-color: #cacaca;
      border-radius: 10px;
      transition: .2s all;
    }
    &:checked:before {
      right: 3px;
      left: inherit;
      background-color: #0c5ee1;
    }
    &:active:before {
      left: 3px;
      width: 24px;
    }
    &:checked:active:before {
      right: 3px;
      left: inherit;
      background-color: #0c5ee1;
    }
    &:disabled:checked:before {
      background-color: #4d6081;
    }
    &:disabled {
      opacity: 0.4;
    }
  }
}
</style>