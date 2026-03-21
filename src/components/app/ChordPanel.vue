<script setup lang="ts">
import { ChordButton } from "@/components/ui/chord-button";
import { Label } from "@/components/ui/label";

defineProps<{
    activeChord?: number;
    chords: { chord: string; degree: string; note: string }[];
}>();

defineEmits<{
    toggle: [index: number];
}>();
</script>

<template>
    <Label class="mb-4">Diatonic Chords</Label>
    <div class="grid grid-cols-4 md:flex w-full gap-6 mb-8">
        <ChordButton
            v-for="(chord, index) in chords"
            :key="`${chord.note}-${chord.chord}-${index}`"
            :active="activeChord === index + 1"
            :note="chord.note"
            :chord="chord.chord"
            @click="$emit('toggle', index)"
        />
    </div>
</template>
