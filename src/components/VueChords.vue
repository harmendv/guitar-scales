<template>
    <div class="vue-chords">
        <lv-flex direction='row' fill>
            <lv-card v-for="chord in chords" inline>
              <strong>{{ chord.degree }}.</strong> {{ chord.note }}{{ chord.chord}}
            </lv-card>
        </lv-flex>

    </div>
</template>

<script>
import { LvFlex, LvCard } from '@libvue/core';
export default {
    components: {
        LvFlex,
        LvCard
    },
    props: {
        chords: {
            type: Array,
            default: () => [],
        },
    },
};
</script>

<style lang="scss"></style>
