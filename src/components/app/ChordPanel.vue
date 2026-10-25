<script setup lang="ts">
import { ref } from "vue";
import { ChordButton } from "@/components/ui/chord-button";
import { useEdgeFade } from "@/composables/useEdgeFade";

defineProps<{
    activeChord?: number;
    chords: { chord: string; degree: string; note: string; numeral: string; tones: { note: string }[] }[];
}>();

defineEmits<{
    toggle: [index: number];
}>();

const row = ref<HTMLElement | null>(null);
const edgeFade = useEdgeFade(row);
</script>

<template>
    <section>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 class="section-label">Diatonic chords</h2>
            <p class="text-xs text-muted-foreground">
                Select a chord to highlight its tones on the neck
            </p>
        </div>
        <!-- Phones: one swipeable row running edge to edge; sm and up: a grid -->
        <div
            ref="row"
            :style="edgeFade"
            class="edge-fade no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:[mask-image:none] lg:grid-cols-7"
        >
            <ChordButton
                class="w-[8.5rem] shrink-0 snap-start sm:w-auto"
                v-for="(chord, index) in chords"
                :key="`${chord.note}-${chord.chord}-${index}`"
                :active="activeChord === index + 1"
                :note="chord.note"
                :chord="chord.chord"
                :numeral="chord.numeral"
                :tones="chord.tones.map((tone) => tone.note)"
                @click="$emit('toggle', index)"
            />
        </div>
    </section>
</template>
