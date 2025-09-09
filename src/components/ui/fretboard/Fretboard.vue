<script lang="ts" setup>
import { computed } from "vue";
import { type ScaleNote } from "@/composables/useNotes"
import { type ChordNotes } from "@/composables/useChords";
import FretboardString from "./FretboardString.vue";
import FretboardNumber from "./FretboardNumber.vue";

interface GuitarString {
    note: string;
    octave: number;
}

const props = withDefaults(
    defineProps<{
        strings: GuitarString[];
        frets: number;
        scaleNotes: ScaleNote[];
        showDegrees: boolean | string;
        showRest: boolean | string;
        root: string;
        chordRoot: string | number | undefined;
        chordNotes: ChordNotes;
    }>(),
    {
        strings: () => [
            { note: "E", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "G", octave: 3 },
            { note: "B", octave: 3 },
            { note: "E", octave: 4 },
        ],
        frets: 19,
        scaleNotes: () => [],
        showDegrees: false,
        showRest: false,
        chordRoot: undefined,
        chordNotes: () => ({}),
    }
);

const reversedStrings = computed<GuitarString[]>(() => {
    return Array.from(props.strings).reverse();
});
</script>

<template>
    <div
        class="flex flex-col overflow-x-auto w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-y-hidden border"
    >
        <div class="flex-grow">
            <FretboardString
                v-for="(start, index) in reversedStrings"
                :frets="frets"
                :start="start.note"
                :start-octave="start.octave"
                :key="index"
                :highlight="scaleNotes"
                :chord-root="chordRoot"
                :chord-notes="chordNotes"
                :root="root"
                :show-degrees="showDegrees"
                :show-rest="showRest"
            />
        </div>
        <div
            class="relative w-full flex justify-between border-t border-slate-300 dark:border-slate-900"
        >
            <FretboardNumber
                v-for="(fret, index) in frets"
                :key="`fret${index}`"
                :highlight="[3, 5, 7, 9, 12].includes(index)"
            >
                {{ index }}
            </FretboardNumber>
        </div>
    </div>
</template>
