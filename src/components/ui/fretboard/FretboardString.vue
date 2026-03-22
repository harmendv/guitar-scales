<script lang="ts" setup>
import { computed } from "vue";
import { playTone } from "@/composables/useAudio";
import {
    getNoteByOffset,
    getPitchClass,
    type ResolvedAccidentalPreference,
    type ScaleNote,
} from "@/composables/useNotes";
import { type ChordNotes } from "@/composables/useChords";
import { cn } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        start: string;
        startOctave: number;
        frets?: number;
        highlight?: ScaleNote[];
        shapeFrets?: number[];
        shapeActive?: boolean;
        viewMode?: "full" | "3nps" | "position";
        positionStartFret?: number;
        positionSpan?: number;
        degrees?: Record<string, string>;
        notePreference?: ResolvedAccidentalPreference;
        showDegrees?: boolean | string;
        showRest?: boolean | string;
        rootPitchClass?: number | null;
        chordRootPitchClass?: number | null;
        chordNotes?: ChordNotes;
    }>(),
    {
        frets: 19,
        highlight: () => [],
        shapeFrets: () => [],
        shapeActive: false,
        viewMode: "full",
        positionStartFret: 0,
        positionSpan: 5,
        degrees: () => ({}),
        notePreference: "sharp",
        showDegrees: false,
        showRest: false,
        rootPitchClass: null,
        chordRootPitchClass: null,
        chordNotes: () => ({}),
    }
);

const highlightByPitchClass = computed(() => {
    const map = new Map<number, ScaleNote>();
    props.highlight.forEach((highlight) => {
        map.set(highlight.pitchClass, highlight);
    });
    return map;
});

const notes = computed(() => {
    let octave = props.startOctave;
    const chordShapeOnlyMode =
        props.chordRootPitchClass != null && props.shapeActive;
    const positionEndFret = props.positionStartFret + props.positionSpan - 1;
    const isPositionMode = props.viewMode === "position";

    const notesArr = Array.from({ length: props.frets }, (_, i) => {
        const note = getNoteByOffset(props.start, i, props.notePreference);
        const pitchClass = getPitchClass(note);
        if (note === "C" && i !== 0) octave++;
        const highlightedNote =
            pitchClass == null
                ? undefined
                : highlightByPitchClass.value.get(pitchClass);
        const isShapeFret = props.shapeFrets.includes(i);
        const inActivePosition =
            i >= props.positionStartFret && i <= positionEndFret;
        const highlightInCurrentView = isPositionMode ? inActivePosition : true;
        return {
            name: note,
            pitchClass,
            octave,
            highlight:
                props.chordRootPitchClass != null && pitchClass != null
                    ? chordShapeOnlyMode
                        ? Boolean(props.chordNotes[String(pitchClass)]) &&
                          isShapeFret &&
                          highlightInCurrentView
                        : Boolean(props.chordNotes[String(pitchClass)]) &&
                          highlightInCurrentView
                    : props.shapeActive
                      ? Boolean(highlightedNote) &&
                        isShapeFret &&
                        highlightInCurrentView
                      : Boolean(highlightedNote) && highlightInCurrentView,
            root:
                pitchClass != null &&
                (props.chordRootPitchClass != null
                    ? pitchClass === props.chordRootPitchClass
                    : pitchClass === props.rootPitchClass) &&
                highlightInCurrentView,
            degree: highlightedNote?.degree ?? false,
        };
    });
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
            <div
                class="absolute left-0 top-1/2 w-full h-0.5 bg-slate-300 dark:bg-slate-900 z-10"
            ></div>
            <div
                :class="
                    cn([
                        'relative bg-slate-100 dark:bg-slate-800 z-10 w-6 h-6 lg:w-8 lg:h-8 flex font-mono text-xs lg:text-sm font-bold items-center justify-center rounded-full text-slate-400 dark:text-slate-500 border-1 border-transparent flex-shrink-0 transition cursor-pointer hover:scale-110',
                        note.highlight
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 border-indigo-600 dark:text-indigo-100 shadow-lg'
                            : '',
                        note.root && (!shapeActive || note.highlight)
                            ? 'bg-red-100 dark:bg-red-950 text-red-600 border-red-700'
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
                    <template
                        v-if="
                            chordRootPitchClass != null &&
                            showDegrees &&
                            chordNotes[String(note.pitchClass)]?.interval
                        "
                    >
                        {{ chordNotes[String(note.pitchClass)].interval }}
                    </template>
                    <template v-else-if="chordRootPitchClass != null">
                        {{ note.name }}
                    </template>
                    <template v-else-if="showDegrees && note.degree">
                        {{ note.degree }}
                    </template>
                    <template v-else>
                        {{ note.name }}
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
