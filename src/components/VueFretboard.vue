<template>
    <div class="flex flex-col overflow-x-auto w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-y-hidden shadow">
        <div class="flex-grow">
            <vue-string
                v-for="(start, index) in reversedStrings"
                :frets="frets"
                :start="start"
                :key="index"
                :highlight="scaleNotes"
                :chord-root="chordRoot"
                :chord-notes="chordNotes"
                :root="root"
                :show-degrees="showDegrees"
                :show-rest="showRest"
            />
        </div>
        <div class="relative w-full flex justify-between border-t border-slate-300">
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
        scaleNotes: {
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
        chordRoot: {
            type: [String, Number],
            default: null,
        },
        chordNotes: {
            type: Object,
            default: () => ({}),
        }
    },
    computed: {
        reversedStrings() {
            return Array.from(this.strings).reverse();
        },
    },
};
</script>
