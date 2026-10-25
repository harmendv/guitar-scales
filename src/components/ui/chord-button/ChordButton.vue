<script setup lang="ts">
import { formatNoteLabel } from "@/composables/useNotes";

defineProps<{
    active: boolean;
    chord: string;
    note: string;
    numeral: string;
    tones: string[];
}>();

defineEmits(["click"]);
</script>

<template>
    <button
        type="button"
        :aria-pressed="active"
        :class="[
            'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active
                ? 'border-tone-chord bg-tone-chord text-[#10213d]'
                : 'border-border bg-card hover:border-foreground/30',
        ]"
        @click="$emit('click')"
    >
        <span class="tabular-nums text-[11px] opacity-70">{{ numeral }}</span>
        <span class="mt-1 font-display text-lg leading-none font-bold">
            {{ formatNoteLabel(note) }}<sup class="ml-0.5 text-[11px] font-semibold">{{ chord }}</sup>
        </span>
        <span class="mt-2 tabular-nums text-[10px] tracking-wide opacity-70">
            {{ tones.map(formatNoteLabel).join(" · ") }}
        </span>
    </button>
</template>
