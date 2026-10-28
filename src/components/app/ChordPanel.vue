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
const groupOptions = computed(() => tabOptions((label, selected) => (selected ? `${label} · ${selected}` : label)));
// Phones have no room for the count next to Triads/7ths, so a dot marks a tab with selections
const compactGroupOptions = computed(() => tabOptions((label, selected) => (selected ? `${label} •` : label)));
const GROUP_LABELS = [
    { label: "In key", value: "diatonic" },
    { label: "Secondary", value: "secondary" },
    { label: "Borrowed", value: "borrowed" },
] as const;
function tabOptions(format: (label: string, selected: number) => string) {
    return GROUP_LABELS.filter((option) => groups.value[option.value].length > 0).map((option) => {
        const selected = groups.value[option.value].filter((chord) =>
            props.selectedChords.includes(chord.id)
        ).length;
        return { label: format(option.label, selected), value: option.value };
    });
}
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
        <div class="mb-3 flex flex-col gap-1">
            <!-- From sm up both toggles sit small at the end of the title row, like the Key header's -->
            <div class="flex h-7 items-center justify-between gap-3">
                <h2 class="font-display text-lg font-semibold tracking-tight">Chords</h2>
                <div class="hidden items-center gap-2 sm:flex">
                    <Segmented
                        v-if="groupOptions.length > 1"
                        v-model="group"
                        :options="groupOptions"
                        class="p-0.5 [&_button]:h-6 [&_button]:px-2.5 [&_button]:text-[13px]"
                    />
                    <Segmented
                        v-model="chordSize"
                        :options="chordSizeOptions"
                        class="p-0.5 [&_button]:h-6 [&_button]:px-2.5 [&_button]:text-[13px]"
                    />
                </div>
            </div>
            <p class="text-xs text-muted-foreground">
                {{ descriptions[group] }}
            </p>
        </div>
        <!-- Phones: both toggles side by side under the description, big enough to tap -->
        <div class="mb-3 flex gap-2 sm:hidden">
            <Segmented
                v-model="chordSize"
                :options="chordSizeOptions"
                class="shrink-0 [&_button]:px-2.5 [&_button]:text-[13px]"
            />
            <Segmented
                v-if="compactGroupOptions.length > 1"
                v-model="group"
                :options="compactGroupOptions"
                class="flex min-w-0 flex-1 [&_button]:flex-1 [&_button]:px-1.5 [&_button]:text-[13px]"
            />
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
