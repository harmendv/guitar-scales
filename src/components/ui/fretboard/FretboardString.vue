<script lang="ts" setup>
import { computed, ref } from "vue";
import { playTone } from "@/lib/audio";
import {
    formatNoteLabel,
    getNoteByOffset,
    getPitchClass,
    type ResolvedAccidentalPreference,
    type ScaleNote,
} from "@/lib/notes";
import { type ChordTones } from "@/lib/chords";
import { cn } from "@/lib/utils";
import { Ripple } from "@/components/ui/ripple";

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
        showRest?: boolean | string;
        rootPitchClass?: number | null;
        chordTones?: ChordTones;
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
        showRest: false,
        rootPitchClass: null,
        chordTones: () => ({}),
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
    const chordActive = Object.keys(props.chordTones).length > 0;
    const positionEndFret = props.positionStartFret + props.positionSpan - 1;

    return Array.from({ length: props.frets }, (_, i) => {
        const note = getNoteByOffset(props.start, i, props.notePreference);
        const pitchClass = getPitchClass(note);
        if (note === "C" && i !== 0) octave++;
        const scaleNote =
            pitchClass == null ? undefined : highlightByPitchClass.value.get(pitchClass);
        const chordTone = pitchClass == null ? undefined : props.chordTones[String(pitchClass)];

        // With chords selected, their tones take over and the rest of the scale steps back
        let kind: NoteKind = "other";
        if (chordActive) {
            if (chordTone) kind = "chord";
            else if (scaleNote) kind = "muted";
        } else if (pitchClass != null && pitchClass === props.rootPitchClass) kind = "root";
        else if (scaleNote) kind = "scale";

        const inView =
            props.viewMode === "position"
                ? i >= props.positionStartFret && i <= positionEndFret
                : props.shapeActive
                  ? props.shapeFrets.includes(i)
                  : true;

        // Use the scale's own spelling (E♭ in C Dorian), even if the neck defaults to sharps.
        // A chord tone from outside the key takes the chord's spelling (G♯ in E7, not A♭).
        let label: string = formatNoteLabel(scaleNote?.note ?? chordTone?.note ?? note);
        if (props.showDegrees) {
            if (chordActive && chordTone?.interval) label = chordTone.interval;
            else if (!chordActive && scaleNote) label = scaleNote.degree;
        }

        return {
            name: note,
            octave,
            kind,
            label,
            inView,
            chordStyle: chordTone ? chordToneStyle(chordTone) : undefined,
            outside: Boolean(chordTone?.outside),
            rippleColor: chordTone?.colors[0],
            visible: Boolean(props.showRest) || (inView && kind !== "other"),
        };
    });
});

// One chord fills the dot with its colour; a note shared by several is split into equal slices.
// A chord's root gets a ring in that chord's colour, set off from the dot by a gap of wood.
function chordToneStyle(tone: ChordTones[string]) {
    const { colors, rootColor } = tone;
    const slice = 100 / colors.length;
    return {
        background:
            colors.length === 1
                ? colors[0]
                : `conic-gradient(${colors.map((color, index) => `${color} ${index * slice}% ${(index + 1) * slice}%`).join(", ")})`,
        boxShadow: rootColor ? `0 0 0 2px var(--wood), 0 0 0 4px ${rootColor}` : undefined,
    };
}

const kindClasses: Record<NoteKind, string> = {
    root: "bg-tone-root text-white shadow-[0_0_0_4px_rgb(245_48_3/0.3)]",
    // Colour and root ring come from chordToneStyle
    chord: "text-[#1a1918]",
    scale: "bg-tone-scale text-[#2a2420]",
    // Opaque mix rather than opacity, so the string doesn't show through; the legend uses the same mix
    muted: "bg-[color-mix(in_srgb,var(--tone-scale)_35%,var(--wood))] text-white/75",
    // Opaque so the string doesn't run through the label; matches the wood behind it
    other: "bg-[var(--wood)] text-white/60 font-medium",
};

const rippleClasses: Record<NoteKind, string> = {
    root: "bg-tone-root",
    chord: "",
    scale: "bg-tone-scale",
    muted: "bg-tone-scale",
    other: "bg-tone-scale",
};

const ripples = ref<Record<number, number>>({});

function play(index: number) {
    const note = notes.value[index];
    ripples.value[index] = (ripples.value[index] ?? 0) + 1;
    playTone(note.name, note.octave);
}
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
            <Ripple
                :count="ripples[index] ?? 0"
                :class="['size-[26px] rounded-full', rippleClasses[note.kind]]"
                :style="note.rippleColor ? { background: note.rippleColor } : undefined"
            />
            <button
                type="button"
                :tabindex="note.visible ? 0 : -1"
                :aria-label="`${note.name}${note.octave}`"
                :class="
                    cn(
                        'relative z-10 flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-full tabular-nums text-[10px] font-semibold transition hover:scale-110 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        kindClasses[note.kind],
                        note.kind === 'other' && index === 0 ? 'bg-[var(--wood-open)]' : '',
                        note.kind === 'chord' && note.outside ? 'outside-tone' : '',
                        !note.inView && note.kind !== 'other' ? 'opacity-30 shadow-none' : '',
                        !note.visible ? 'pointer-events-none opacity-0' : '',
                    )
                "
                :style="note.chordStyle"
                @click="play(index)"
            >
                {{ note.label }}
            </button>
        </div>
    </div>
</template>
