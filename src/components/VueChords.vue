<template>
    <div class="vue-chords">
        <lv-flex fill :wrap="false" >
            <lv-card class="vue-chords__chord" :padding="false" inline v-for="chord in chords">
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
    },
};
</script>

<style lang="scss">
.vue-chords {
    overflow-x: auto;
    &__chord {

        &-degree {
            padding: .25rem;
            background-color: var(--border-color-light)
        }
        &-name {
            padding: .5rem .25rem;

        }
    }
}
</style>
