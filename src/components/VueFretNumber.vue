<template>
    <div
        class="vue-fret-number"
        :class="{ 'vue-fret-number--highlight': !!highlight }"
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
        },
    },
};
</script>

<style lang="scss">
.vue-fret-number {
    $self: &;
    position: relative;
    width: calc(100% / var(--divider));
    text-align: center;
    padding: 1cqw 1cqw;
    display: flex;
    justify-content: center;
    border-right: 2px solid transparent;
    background: var(--border-color-light);
    color: var(--text-color);
    flex-grow: 1;

    &--highlight {
        #{$self}__content {
            background: var(--border-color);
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
        background: var(--border-color-light);
        z-index: 1;
        padding: 0;
        width: 4cqw;
        height: 4cqw;
        display: flex;
        font-family: monospace;
        font-size: 2cqw;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }

    &__number {
        width: 4cqw;
        height: 4cqw;
        flex-shrink: 0;
        position: absolute;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
