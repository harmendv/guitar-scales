<script setup lang="ts">
import { ref } from "vue";
import { ChordButton } from "@/components/ui/chord-button";
import { playChord } from "@/composables/useAudio";
import { chordColor } from "@/composables/useChords";
import { useEdgeFade } from "@/composables/useEdgeFade";
import type { ChordSize } from "@/composables/useFretboardState";
import { Segmented } from "@/components/ui/segmented";

defineProps<{
    selectedChords: number[];
    chords: { chord: string; degree: string; note: string; numeral: string; tones: { note: string }[] }[];
}>();

defineEmits<{
    toggle: [index: number];
}>();

const chordSize = defineModel<ChordSize>("chordSize", { required: true });
const chordSizeOptions: { label: string; value: ChordSize }[] = [
    { label: "Triads", value: "triads" },
    { label: "7ths", value: "sevenths" },
];

const row = ref<HTMLElement | null>(null);
const edgeFade = useEdgeFade(row);
</script>

<template>
    <section>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-3">
                <h2 class="font-display text-lg font-semibold tracking-tight">Chords</h2>
                <Segmented
                    v-model="chordSize"
                    :options="chordSizeOptions"
                    class="p-0.5 [&_button]:h-6 [&_button]:px-2.5 [&_button]:text-[13px]"
                />
            </div>
            <p class="text-xs text-muted-foreground">
                Select chords to compare their tones on the neck
            </p>
        </div>
        <!-- Phones: one swipeable row running edge to edge, padded so the play ripple isn't
             clipped by the scroller; sm and up: a grid -->
        <div
            ref="row"
            :style="edgeFade"
            class="edge-fade no-scrollbar -mx-4 -my-3 flex gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:my-0 sm:py-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:[mask-image:none] lg:grid-cols-7"
        >
            <ChordButton
                class="w-[8.5rem] shrink-0 sm:w-auto"
                v-for="(chord, index) in chords"
                :key="`${chord.note}-${chord.chord}-${index}`"
                :active="selectedChords.includes(index + 1)"
                :color="chordColor(index)"
                :note="chord.note"
                :chord="chord.chord"
                :numeral="chord.numeral"
                :tones="chord.tones.map((tone) => tone.note)"
                @click="$emit('toggle', index)"
                @play="playChord(chord.tones.map((tone) => tone.note))"
            />
        </div>
    </section>
</template>
