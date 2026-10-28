<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChordButton } from "@/components/ui/chord-button";
import { playChord } from "@/lib/audio";
import type { DisplayChord } from "@/lib/harmony";
import { useEdgeFade } from "@/composables/useEdgeFade";
import type { ChordSize } from "@/composables/useFretboardState";
import { Segmented } from "@/components/ui/segmented";

type ChordGroup = "diatonic" | "secondary" | "borrowed";

const props = defineProps<{
    selectedChords: string[];
    chords: DisplayChord[];
    secondaryChords: DisplayChord[];
    borrowedChords: DisplayChord[];
    chordColors: Record<string, string>;
}>();

defineEmits<{
    toggle: [id: string];
}>();

const chordSize = defineModel<ChordSize>("chordSize", { required: true });
const chordSizeOptions: { label: string; value: ChordSize }[] = [
    { label: "Triads", value: "triads" },
    { label: "7ths", value: "sevenths" },
];

const group = ref<ChordGroup>("diatonic");
const groups = computed(() => ({
    diatonic: props.chords,
    secondary: props.secondaryChords,
    borrowed: props.borrowedChords,
}));
// Each tab counts its selected chords, so a selection on another tab isn't forgotten
const groupOptions = computed(() =>
    (
        [
            { label: "In key", value: "diatonic" },
            { label: "Secondary", value: "secondary" },
            { label: "Borrowed", value: "borrowed" },
        ] as const
    )
        .filter((option) => groups.value[option.value].length > 0)
        .map((option) => {
            const selected = groups.value[option.value].filter((chord) =>
                props.selectedChords.includes(chord.id)
            ).length;
            return { label: selected ? `${option.label} · ${selected}` : option.label, value: option.value };
        })
);
const descriptions: Record<ChordGroup, string> = {
    diatonic: "Select chords to compare their tones on the neck",
    secondary: "Dominants that lead into the chords of the key",
    borrowed: "Chords from other modes on the same root, for a darker or brighter turn",
};
const visibleChords = computed(() => groups.value[group.value]);
// Scales without secondary or borrowed chords (pentatonics, symmetric scales) fall back to the key
watch(groupOptions, (options) => {
    if (!options.some((option) => option.value === group.value)) group.value = "diatonic";
});

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
                {{ descriptions[group] }}
            </p>
        </div>
        <Segmented
            v-if="groupOptions.length > 1"
            v-model="group"
            :options="groupOptions"
            class="mb-3 p-0.5 [&_button]:h-7 [&_button]:px-3 [&_button]:text-[13px]"
        />
        <!-- Phones: one swipeable row running edge to edge, padded so the play ripple isn't
             clipped by the scroller; sm and up: a grid -->
        <div
            ref="row"
            :style="edgeFade"
            class="edge-fade no-scrollbar -mx-4 -my-3 flex gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:my-0 sm:py-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:[mask-image:none] lg:grid-cols-7"
        >
            <ChordButton
                class="w-[8.5rem] shrink-0 sm:w-auto"
                v-for="chord in visibleChords"
                :key="chord.id"
                :active="selectedChords.includes(chord.id)"
                :color="chordColors[chord.id]"
                :note="chord.note"
                :chord="chord.chord"
                :numeral="chord.numeral"
                :caption="chord.caption"
                :source="chord.source"
                :tones="chord.tones.map((tone) => tone.note)"
                @click="$emit('toggle', chord.id)"
                @play="playChord(chord.tones.map((tone) => tone.note))"
            />
        </div>
    </section>
</template>
