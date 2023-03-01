<template>
    <div class="vue-select" :class="{ 'vue-select--focused': focused }">
        <select class="vue-select__select" @change="onChange" @focus="onFocus" @blur="onBlur">
            <option
                    :value="option.value"
                    :selected="modelValue === option.value"
                    v-for="(option, index) in options"
                    :key="index"
            >{{ option.title }}
            </option>
        </select>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
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
    emits: ['update:modelValue'],
    methods: {
        onChange(event) {
            this.$emit('update:modelValue', event.target.value);
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
    background: #000000;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
    margin-right: 20px;
    font-family: monospace;
    margin-bottom: 10px;
    transition: .2s all;
    color: #fff;

    &--focused {
        box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(12, 94, 225, 0.4);
    }

    &__select {
        font-family: monospace;
        font-weight: bold;
        padding: 10px 30px 10px 10px;
        display: inline-block;
        font-size: 16px;
        outline: 0;
        appearance: none;
        background: #000 url(https://upload.wikimedia.org/wikipedia/commons/9/9d/Caret_down_font_awesome_whitevariation.svg) no-repeat 100% center;
        background-size: 13px;
        background-position-x: calc(100% - 15px);
        border: 0;
        border-color: black;
        color: #fff;
    }
}
</style>
