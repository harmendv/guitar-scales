<template>
    <div class="vue-fretboard">
        <div class="vue-fretboard__strings">
            <vue-string
                v-for="(start, index) in reversedStrings"
                :frets="frets"
                :start="start"
                :key="index"
                :highlight="highlight"
                :chord-index="chordIndex"
                :root="root"
                :show-degrees="showDegrees"
                :show-rest="showRest"
            />
        </div>
        <div class="vue-fretboard__fret-numbers">
            <vue-fret-number
                v-for="(fret, index) in frets"
                :key="`fret${index}`"
                :highlight="[3, 5, 7, 9, 12].includes(index)"
            >
                {{ index }}
            </vue-fret-number>
        </div>
    </div>
</template>

<script>
import VueString from "./VueString.vue";
import VueFretNumber from "./VueFretNumber.vue";

export default {
    components: {
        VueString,
        VueFretNumber,
    },
    props: {
        strings: {
            type: Array,
            default: () => ["E", "A", "D", "G", "B", "E"],
        },
        frets: {
            type: Number,
            default: 19,
        },
        highlight: {
            type: Array,
            default: () => [],
        },

        showDegrees: {
            type: [Boolean, String],
            default: false,
        },
        showRest: {
            type: [Boolean, String],
            default: false,
        },
        root: {
            type: String,
            required: true,
        },
        chordIndex: {
            type: [String, Number],
            default: null,
        }
    },
    computed: {
        reversedStrings() {
            return Array.from(this.strings).reverse();
        },
    },
};
</script>

<style lang="scss">
.vue-fretboard {
    container-name: fretboard;
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    width: 100%;
    background: var(--background-color);
    background-size: 100%;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow-y: hidden;
    box-shadow: var(--shadow);
    &__strings {
        flex-grow: 1;
    }
    &__fret-numbers {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--border-color);
    }
}
</style>
