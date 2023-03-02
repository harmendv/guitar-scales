<template>
    <div
            class="vue-fret-number"
            :class="{'vue-fret-number--highlight': !!highlight}"
            :style="`--divider: ${frets};`"
    >
        <div class="vue-fret-number__content">
            <div class="vue-fret-number__number">
                <slot/>
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
    padding: 5px 10px;
    display: flex;
    justify-content: center;
    border-right: 2px solid transparent;
    background: var(--border-color-light);
    color: var(--text-color);

    &--highlight {
        #{$self}__content {
            background: var(--border-color)
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
        width: 100%;
        height: 0;
        padding-bottom: 100%;
        display: flex;
        font-family: monospace;
        font-size: clamp(7px, 1.2vw, 13px);
        align-items: center;
        justify-content: center;
        border-radius: 6px;
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
