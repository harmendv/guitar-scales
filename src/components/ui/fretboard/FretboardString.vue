<script lang="ts" setup>
import { computed } from "vue";
import { getNoteByOffset, playTone } from "@/composables/useNotes";
import { type ChordNotes } from "@/composables/useChords";
import { cn } from "@/lib/utils";

interface Highlight {
    note: string;
    degree?: string;
}

const props = withDefaults(
    defineProps<{
        start: string;
        startOctave: number;
        frets?: number;
        highlight?: Highlight[];
        degrees?: Record<string, string>;
        showDegrees?: boolean | string;
        showRest?: boolean | string;
        root: string;
        chordRoot?: string | number | null;
        chordNotes?: ChordNotes;
    }>(),
    {
        frets: 19,
        highlight: () => [],
        degrees: () => ({}),
        showDegrees: false,
        showRest: false,
        chordRoot: null,
        chordNotes: () => ({}),
    }
);

const highlightNotes = computed<string[]>(() => {
    return props.highlight.flatMap((i) => i.note);
});

const notes = computed(() => {
    const notesArr: Array<{
        name: string;
        octave: number;
        highlight: boolean;
        root: boolean;
        degree: string | false;
    }> = [];
    let ccounter = 0;
    for (let i = 0; i < props.frets; i++) {
        const note = getNoteByOffset(props.start, i);
        const highlightNoteIndex = highlightNotes.value.indexOf(note);
        if (note === "C" && i !== 0) {
            ccounter += 1;
        }
        const octave = props.startOctave + ccounter;
        notesArr.push({
            name: note,
            octave,
            highlight: props.chordRoot
                ? Boolean(props.chordNotes[note])
                : highlightNotes.value.includes(note),
            root: props.chordRoot
                ? note === props.chordRoot
                : note === props.root,
            degree:
                highlightNoteIndex >= 0
                    ? (props.highlight[highlightNoteIndex].degree ?? false)
                    : false,
        });
    }
    return notesArr;
});
</script>

<template>
    <div
        class="relative w-full flex justify-between"
        :style="`--divider: ${frets};`"
    >
        <div
            v-for="(note, index) in notes"
            :key="index"
            class="flex-grow text-center p-2 flex justify-center border-r-2 border-slate-300 dark:border-slate-900 relative first:border-r-4 first:bg-slate-200 dark:first:bg-slate-700 last:border-r-0"
        >
            <!-- Horizontal line (was ::before) -->
            <div
                class="absolute left-0 top-1/2 w-full h-0.5 bg-slate-300 dark:bg-slate-900 z-10"
            ></div>
            <div
                :class="
                    cn([
                        'relative bg-slate-100 dark:bg-slate-800 z-10 w-8 h-8 flex font-mono text-xs md:text-md font-bold items-center justify-center rounded-full text-slate-900 dark:text-white border-2 border-transparent flex-shrink-0 transition cursor-pointer hover:scale-110',
                        index === 0 ? '' : '',
                        note.highlight
                            ? 'bg-indigo-500 dark:bg-indigo-600 text-white'
                            : '',
                        note.root
                            ? 'bg-red-500 dark:bg-red-500 text-white'
                            : '',
                        !note.highlight && showRest !== true ? 'opacity-0' : '',
                        note.degree === 'scale' ? 'bg-slate-400' : '',
                    ])
                "
                @click="playTone(note.name, note.octave)"
            >
                <div
                    class="absolute w-full h-full flex items-center justify-center top-0"
                >
                    <template v-if="chordRoot">
                        <template
                            v-if="
                                showDegrees && chordNotes[note.name]?.interval
                            "
                        >
                            {{ chordNotes[note.name].interval }}
                        </template>
                        <template v-else>
                            {{ note.name }}
                        </template>
                    </template>
                    <template v-else>
                        <template v-if="showDegrees && note.degree">
                            {{ note.degree }}
                        </template>
                        <template v-else>
                            {{ note.name }}
                        </template>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
