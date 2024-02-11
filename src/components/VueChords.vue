<template>
    <div class="vue-chords">

        <lv-grid class="vue-chords__grid">
            <lv-grid-row gap="0.4rem">
                <lv-grid-column
                    :width="3"
                    :md="12"
                    v-for="chord in chords"
                >
                    <lv-card >
                        <strong>{{ chord.degree }}.</strong> {{ chord.note }}{{ chord.chord }}
                    </lv-card>
                </lv-grid-column>
            </lv-grid-row>
        </lv-grid>

    </div>
</template>

<script>
import { LvFlex, LvCard, LvGrid, LvGridRow, LvGridColumn } from '@libvue/core';
export default {
    components: {
        LvFlex,
        LvCard,
        LvGrid,
        LvGridRow,
        LvGridColumn,
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
    &__grid {
        width: 100%;
    }
}
</style>
