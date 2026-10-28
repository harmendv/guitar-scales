<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    // One fret per string, low to high; null for a muted string
    frets: (number | null)[];
    intervals: (string | null)[];
    // First fret drawn; 0 draws the nut
    baseFret: number;
    color: string;
}>();

const ROWS = 4;
const STRING_GAP = 11;
const ROW_HEIGHT = 13;
const LEFT = 16;
const TOP = 12;

const width = computed(() => LEFT + (props.frets.length - 1) * STRING_GAP + 8);
const height = TOP + ROWS * ROW_HEIGHT + 4;
// The fret the first row stands for: 1 from the nut, otherwise the shape's lowest fret
const firstFret = computed(() => (props.baseFret === 0 ? 1 : props.baseFret));

const dots = computed(() =>
    props.frets.flatMap((fret, string) =>
        fret == null || fret === 0
            ? []
            : [{
                  x: LEFT + string * STRING_GAP,
                  y: TOP + (fret - firstFret.value + 0.5) * ROW_HEIGHT,
                  root: props.intervals[string] === "1",
              }]
    )
);
</script>

<template>
    <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" aria-hidden="true">
        <!-- Strings, frets and the nut (or the starting fret's number) -->
        <line
            v-for="(_, string) in frets"
            :key="`string-${string}`"
            :x1="LEFT + string * STRING_GAP"
            :x2="LEFT + string * STRING_GAP"
            :y1="TOP"
            :y2="TOP + ROWS * ROW_HEIGHT"
            class="stroke-muted-foreground/60"
            stroke-width="1"
        />
        <line
            v-for="row in ROWS + 1"
            :key="`fret-${row}`"
            :x1="LEFT"
            :x2="LEFT + (frets.length - 1) * STRING_GAP"
            :y1="TOP + (row - 1) * ROW_HEIGHT"
            :y2="TOP + (row - 1) * ROW_HEIGHT"
            class="stroke-muted-foreground/60"
            :stroke-width="row === 1 && baseFret === 0 ? 3 : 1"
        />
        <text
            v-if="baseFret > 0"
            :x="LEFT - 6"
            :y="TOP + ROW_HEIGHT * 0.5 + 3"
            text-anchor="end"
            class="fill-muted-foreground text-[8px] tabular-nums"
        >{{ baseFret }}</text>
        <!-- Above the nut: × for a muted string, ○ for an open one -->
        <template v-for="(fret, string) in frets" :key="`top-${string}`">
            <text
                v-if="fret == null"
                :x="LEFT + string * STRING_GAP"
                :y="TOP - 4"
                text-anchor="middle"
                class="fill-muted-foreground text-[8px]"
            >×</text>
            <circle
                v-else-if="fret === 0"
                :cx="LEFT + string * STRING_GAP"
                :cy="TOP - 6"
                r="2.5"
                fill="none"
                class="stroke-muted-foreground"
                stroke-width="1"
            />
        </template>
        <!-- Roots get a dark ring so the shape's anchor stands out -->
        <circle
            v-for="(dot, index) in dots"
            :key="`dot-${index}`"
            :cx="dot.x"
            :cy="dot.y"
            r="4.25"
            :fill="color"
            :class="dot.root ? 'stroke-foreground' : 'stroke-transparent'"
            stroke-width="1.5"
        />
    </svg>
</template>
