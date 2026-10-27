<script setup lang="ts">
import { ref } from "vue";
import { Play } from "lucide-vue-next";
import { Ripple } from "@/components/ui/ripple";
import { formatNoteLabel } from "@/composables/useNotes";

defineProps<{
    active: boolean;
    chord: string;
    note: string;
    numeral: string;
    tones: string[];
}>();

const emit = defineEmits(["click", "play"]);

const ripples = ref(0);

function play() {
    ripples.value++;
    emit("play");
}
</script>

<template>
    <!-- Play sits beside the card's own button, since buttons can't be nested -->
    <div class="relative">
        <button
            type="button"
            :aria-pressed="active"
            :class="[
                'flex size-full flex-col items-start rounded-xl border py-3 pr-10 pl-4 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                    ? 'border-primary bg-primary text-primary-foreground'
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
        <div class="absolute top-2 right-2 size-7">
            <Ripple :count="ripples" :scale="2.2" :class="['inset-0 rounded-lg', active ? 'bg-white/40' : 'bg-primary']" />
            <button
                type="button"
                :aria-label="`Play ${formatNoteLabel(note)}${chord}`"
                :class="[
                    'relative inline-flex size-full items-center justify-center rounded-lg transition outline-none active:scale-90 focus-visible:ring-2 focus-visible:ring-ring',
                    active
                        ? 'bg-white/15 text-primary-foreground hover:bg-white/25'
                        : 'bg-surface text-muted-foreground hover:text-foreground',
                ]"
                @click="play"
            >
                <Play class="ml-px size-3 fill-current" />
            </button>
        </div>
    </div>
</template>
