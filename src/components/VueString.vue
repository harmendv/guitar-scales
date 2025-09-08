<script>
import { getNoteByOffset } from "../utils/notes";
import { cn } from "@/lib/utils";

export default {
    props: {
        start: {
            type: String,
            required: true,
        },
        startOctave: {
            type: Number,
            required: true,
        },
        frets: {
            type: Number,
            default: 19,
        },
        highlight: {
            type: Array,
            default: () => [],
        },
        degrees: {
            type: Object,
            default: () => ({}),
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
    data() {
        return {
            cn,
        }
    },
    computed: {
        highlightNotes() {
            return this.highlight.flatMap((i) => i.note);
        },
        notes() {
            const notes = [];
            let ccounter = 0;
            for (let i = 0; i < this.frets; i++) {
                // Get the note by offset
                const note = getNoteByOffset(this.start, i);
                // Get the index of the note (to check if root)
                const highlightNoteIndex = this.highlightNotes.indexOf(note);
                // Get the octave
                if(note === 'C' && i !== 0){
                    ccounter += 1;
                }
                const octave = this.startOctave + ccounter;

                const obj = {
                    name: note,
                    octave: octave,
                    highlight: this.chordRoot ? this.chordNotes[note] : this.highlightNotes.includes(note),
                    root: this.chordRoot ? note === this.chordRoot : note === this.root,
                    degree: highlightNoteIndex >= 0 ? this.highlight[highlightNoteIndex].degree : false,
                };
                notes.push(obj);
            }
            return notes;
        },
    },
};
</script>

<template>
    <div class="relative w-full flex justify-between" :style="`--divider: ${frets};`">
        <div
            v-for="(note, index) in notes"
            :key="index"
            class="flex-grow text-center p-2 flex justify-center border-r-2 border-slate-300 dark:border-slate-900 relative first:border-r-4 first:bg-slate-200 dark:first:bg-slate-700 last:border-r-0"
        >
            <!-- Horizontal line (was ::before) -->
            <div class="absolute left-0 top-1/2 w-full h-0.5 bg-slate-300 dark:bg-slate-900 z-10"></div>
            <div
                :class="cn([
                    'relative bg-slate-100 dark:bg-slate-800 z-10 w-8 h-8 flex font-mono text-xs md:text-md font-bold items-center justify-center rounded-full text-slate-900 dark:text-white border-2 border-transparent flex-shrink-0',
                    index === 0 ? '' : '',
                    note.highlight ? 'bg-indigo-500 dark:bg-indigo-600 text-white' : '',
                    note.root ? 'bg-red-500 dark:bg-red-500 text-white' : '',
                    !note.highlight && (showRest !== true) ? 'opacity-0' : '',
                    note.degree === 'scale' ? 'bg-slate-400' : '',
                ])"
            >
                <div class="absolute w-full h-full flex items-center justify-center top-0">
                    <template v-if="chordRoot">
                        <template v-if="showDegrees && chordNotes[note.name]?.interval">
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