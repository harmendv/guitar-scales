<template>
    <div class="vue-chords">
        <lv-flex fill :wrap="false" >
            <lv-card class="vue-chords__chord" :padding="false" inline v-for="(chord, index) in chords" :class="{'vue-chords__chord--active': active === index + 1}" @click="onClickChord(index)">
                <div class="vue-chords__chord-degree">{{ chord.degree }}</div>
                <div class="vue-chords__chord-name">{{ chord.note }}{{ chord.chord }}</div>
            </lv-card>
        </lv-flex>
    </div>
</template>

<script>
import { LvFlex, LvCard, useBreakpoints  } from '@libvue/core';
export default {
    setup() {
        const { breakpoints } = useBreakpoints();
        return {
            breakpoints,
        };
    },
    components: {
        LvFlex,
        LvCard,
        useBreakpoints
    },
    props: {
        chords: {
            type: Array,
            default: () => [],
        },
        active: {
            type: [String, Number],
            default: null,
        }
    },
    emits: ['click-chord'],
    methods: {
        onClickChord(index) {
            this.$emit('click-chord', index + 1);
        }
    }
};
</script>

<style lang="scss">
.vue-chords {
    overflow-x: auto;
    &__chord {
        $chord: &;
        cursor: pointer;

        &-degree {
            padding: .25rem;
            background-color: var(--border-color-light);
            border-radius: var(--border-radius) var(--border-radius) 0 0;
        }
        &-name {
            padding: .5rem .25rem;

        }
        &--active {
            border: 1px solid var(--color-primary);
            #{$chord}-degree {
                background-color: var(--color-primary-dimmed);
            }
        }
    }
}
</style>
