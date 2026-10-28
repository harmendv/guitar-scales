<script lang="ts" setup>
import { computed, ref, watch, nextTick } from "vue";
import { type ResolvedAccidentalPreference, type ScaleNote } from "@/lib/notes"
import { type ChordTones } from "@/lib/chords";
import FretboardString from "./FretboardString.vue";

interface GuitarString {
    note: string;
    octave: number;
}

const props = withDefaults(
    defineProps<{
        strings: GuitarString[];
        frets: number;
        scaleNotes: ScaleNote[];
        shapeFretsByString?: number[][];
        shapeActive?: boolean;
        viewMode?: "full" | "3nps" | "position";
        positionStartFret?: number;
        positionSpan?: number;
        notePreference?: ResolvedAccidentalPreference;
        showDegrees: boolean | string;
        showRest: boolean | string;
        rootPitchClass: number | null;
        chordTones: ChordTones;
        // Strings left out of a chord shape, low to high; marked × at the nut
        mutedStrings?: boolean[];
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
        shapeFretsByString: () => [],
        shapeActive: false,
        viewMode: "full",
        positionStartFret: 0,
        positionSpan: 5,
        notePreference: "sharp",
        showDegrees: false,
        showRest: false,
        rootPitchClass: null,
        chordTones: () => ({}),
        mutedStrings: () => [],
    }
);

const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

const reversedStrings = computed<GuitarString[]>(() => {
    return Array.from(props.strings).reverse();
});

const reversedShapeFretsByString = computed<number[][]>(() =>
    Array.from(props.shapeFretsByString).reverse()
);

const reversedMutedStrings = computed<boolean[]>(() => {
    const muted = props.strings.map((_, index) => props.mutedStrings[index] ?? false);
    return muted.reverse();
});

// --fret-min is 36px on phones and 40px from sm up (set on the wrapper below).
const fretColumns = computed(
    () => `44px repeat(${props.frets - 1}, minmax(var(--fret-min), 1fr))`
);

// Thin treble strings on top, thicker wound strings below.
function stringThickness(index: number) {
    const count = reversedStrings.value.length;
    return 1 + (index / Math.max(count - 1, 1)) * 1.75;
}

const activeRange = computed<[number, number] | null>(() => {
    if (props.viewMode === "position") {
        return [props.positionStartFret, props.positionStartFret + props.positionSpan - 1];
    }
    if (props.shapeActive) {
        const frets = props.shapeFretsByString.flat();
        if (!frets.length) return null;
        return [Math.min(...frets), Math.max(...frets)];
    }
    return null;
});

function inActiveRange(fret: number) {
    return activeRange.value != null && fret >= activeRange.value[0] && fret <= activeRange.value[1];
}

// When the neck is wider than the screen (phones), bring the selected position into view.
const scroller = ref<HTMLElement | null>(null);
watch(
    () => activeRange.value?.[0],
    async (startFret) => {
        await nextTick();
        const element = scroller.value;
        if (startFret == null || !element || element.scrollWidth <= element.clientWidth) return;
        const column = element.querySelector<HTMLElement>(`[data-fret="${startFret}"]`);
        if (!column) return;
        element.scrollTo({ left: Math.max(column.offsetLeft - 16, 0), behavior: "smooth" });
    }
);
</script>

<template>
    <div ref="scroller" class="overflow-x-auto pb-1">
        <div
            class="min-w-[800px] [--fret-min:36px] sm:min-w-[880px] sm:[--fret-min:40px]"
            :style="{ '--fret-columns': fretColumns }"
        >
            <div class="relative overflow-hidden rounded-xl bg-[var(--wood)] shadow-[inset_0_0_40px_var(--board-shadow)] ring-1 ring-[var(--board-edge)]">
                <div class="absolute inset-0 grid" style="grid-template-columns: var(--fret-columns)">
                    <div
                        v-for="(_, fret) in frets"
                        :key="`fret-${fret}`"
                        :data-fret="fret"
                        :class="[
                            'relative',
                            fret === 0
                                ? 'border-r-4 border-[var(--nut)] bg-[var(--wood-open)]'
                                : 'border-r-2 border-[var(--fret-wire)] last:border-r-0',
                            inActiveRange(fret) ? 'bg-[var(--wood-highlight)]' : '',
                        ]"
                    >
                        <span
                            v-if="SINGLE_INLAYS.includes(fret)"
                            class="absolute top-1/2 left-1/2 size-2.5 -translate-1/2 rounded-full bg-[var(--inlay)]"
                        ></span>
                        <template v-if="DOUBLE_INLAYS.includes(fret)">
                            <span class="absolute top-1/3 left-1/2 size-2.5 -translate-1/2 rounded-full bg-[var(--inlay)]"></span>
                            <span class="absolute top-2/3 left-1/2 size-2.5 -translate-1/2 rounded-full bg-[var(--inlay)]"></span>
                        </template>
                    </div>
                </div>
                <div class="relative py-1.5">
                    <FretboardString
                        v-for="(start, index) in reversedStrings"
                        :frets="frets"
                        :start="start.note"
                        :start-octave="start.octave"
                        :key="index"
                        :highlight="scaleNotes"
                        :shape-frets="reversedShapeFretsByString[index] || []"
                        :shape-active="shapeActive"
                        :muted="reversedMutedStrings[index]"
                        :view-mode="viewMode"
                        :position-start-fret="positionStartFret"
                        :position-span="positionSpan"
                        :note-preference="notePreference"
                        :chord-tones="chordTones"
                        :root-pitch-class="rootPitchClass"
                        :show-degrees="showDegrees"
                        :show-rest="showRest"
                        :thickness="stringThickness(index)"
                    />
                </div>
            </div>
            <div class="mt-2 grid" style="grid-template-columns: var(--fret-columns)">
                <span
                    v-for="(_, fret) in frets"
                    :key="`fret-number-${fret}`"
                    :class="[
                        'text-center tabular-nums text-[11px]',
                        SINGLE_INLAYS.includes(fret) || DOUBLE_INLAYS.includes(fret)
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground',
                    ]"
                >
                    {{ fret }}
                </span>
            </div>
        </div>
    </div>
</template>
