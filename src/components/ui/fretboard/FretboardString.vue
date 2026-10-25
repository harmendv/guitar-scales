<script lang="ts" setup>
import { computed } from "vue";
import { playTone } from "@/composables/useAudio";
import {
    formatNoteLabel,
    getNoteByOffset,
    getPitchClass,
    type ResolvedAccidentalPreference,
    type ScaleNote,
} from "@/composables/useNotes";
import { type ChordNotes } from "@/composables/useChords";
import { cn } from "@/lib/utils";

type NoteKind = "root" | "chord" | "scale" | "muted" | "other";

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
        notePreference?: ResolvedAccidentalPreference;
        showDegrees?: boolean | string;
        showLabels?: boolean;
        showRest?: boolean | string;
        rootPitchClass?: number | null;
        chordRootPitchClass?: number | null;
        chordNotes?: ChordNotes;
        thickness?: number;
    }>(),
    {
        frets: 19,
        highlight: () => [],
        shapeFrets: () => [],
        shapeActive: false,
        viewMode: "full",
        positionStartFret: 0,
        positionSpan: 5,
        notePreference: "sharp",
        showDegrees: false,
        showLabels: true,
        showRest: false,
        rootPitchClass: null,
        chordRootPitchClass: null,
        chordNotes: () => ({}),
        thickness: 1,
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
    const chordActive = props.chordRootPitchClass != null;
    const positionEndFret = props.positionStartFret + props.positionSpan - 1;

    return Array.from({ length: props.frets }, (_, i) => {
        const note = getNoteByOffset(props.start, i, props.notePreference);
        const pitchClass = getPitchClass(note);
        if (note === "C" && i !== 0) octave++;
        const scaleNote =
            pitchClass == null ? undefined : highlightByPitchClass.value.get(pitchClass);
        const chordNote = pitchClass == null ? undefined : props.chordNotes[String(pitchClass)];
        const rootPitchClass = chordActive ? props.chordRootPitchClass : props.rootPitchClass;

        let kind: NoteKind = "other";
        if (pitchClass != null && pitchClass === rootPitchClass) kind = "root";
        else if (chordActive && chordNote) kind = "chord";
        else if (scaleNote) kind = chordActive ? "muted" : "scale";

        const inView =
            props.viewMode === "position"
                ? i >= props.positionStartFret && i <= positionEndFret
                : props.shapeActive
                  ? props.shapeFrets.includes(i)
                  : true;

        // Use the scale's own spelling (E♭ in C Dorian), even if the neck defaults to sharps.
        let label: string = formatNoteLabel(scaleNote?.note ?? note);
        if (props.showDegrees) {
            if (chordActive && chordNote?.interval) label = chordNote.interval;
            else if (!chordActive && scaleNote) label = scaleNote.degree;
        }

        return {
            name: note,
            octave,
            kind,
            label,
            inView,
            visible: Boolean(props.showRest) || (inView && kind !== "other"),
        };
    });
});

const kindClasses: Record<NoteKind, string> = {
    root: "bg-tone-root text-white shadow-[0_0_0_4px_rgb(245_48_3/0.3)]",
    chord: "bg-tone-chord text-[#10213d] shadow-[0_0_0_4px_rgb(147_187_247/0.22)]",
    scale: "bg-tone-scale text-[#2a2420]",
    muted: "bg-[#ece6d6]/35 text-white/70",
    other: "bg-white/[0.07] text-white/30 font-medium",
};
</script>

<template>
    <div class="relative grid h-11" style="grid-template-columns: var(--fret-columns)">
        <div
            class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[var(--guitar-string)] shadow-[0_1px_1px_rgb(0_0_0/0.5)]"
            :style="{ height: `${thickness}px` }"
        ></div>
        <div
            v-for="(note, index) in notes"
            :key="index"
            class="relative flex items-center justify-center"
        >
            <button
                type="button"
                :tabindex="note.visible ? 0 : -1"
                :aria-label="`${note.name}${note.octave}`"
                :class="
                    cn(
                        'relative z-10 flex shrink-0 cursor-pointer items-center justify-center rounded-full tabular-nums text-[10px] font-semibold transition hover:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        showLabels ? 'size-[26px]' : 'size-3.5',
                        kindClasses[note.kind],
                        !note.inView && note.kind !== 'other' ? 'opacity-30 shadow-none' : '',
                        !note.visible ? 'pointer-events-none opacity-0' : '',
                    )
                "
                @click="playTone(note.name, note.octave)"
            >
                <template v-if="showLabels">{{ note.label }}</template>
            </button>
        </div>
    </div>
</template>
