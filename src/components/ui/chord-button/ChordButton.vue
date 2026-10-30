<script setup lang="ts">
import { ref } from "vue";
import { Play } from "lucide-vue-next";
import { Ripple } from "@/components/ui/ripple";
import { formatNoteLabel } from "@/lib/notes";

defineProps<{
    active: boolean;
    chord: string;
    // The chord's colour on the neck: a dot by its name, and the whole card while it's selected
    color: string;
    // Whether it's selected, which isn't always whether it's lit: a progression can light it alone
    selected: boolean;
    note: string;
    numeral: string;
    tones: string[];
    // Where a chord from outside the key goes next, and the mode a borrowed one comes from
    caption?: string;
    source?: string;
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
            :aria-pressed="selected"
            :class="[
                'flex size-full flex-col items-start rounded-xl border py-3 pr-10 pl-4 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'text-[#1a1918]' : 'border-border bg-card hover:border-foreground/30',
            ]"
            :style="active ? { background: color, borderColor: color } : undefined"
            @click="$emit('click')"
        >
            <span class="tabular-nums text-[11px] opacity-70">{{ numeral }}</span>
            <!-- A dot in the chord's colour before its name, as in the shape cards and the neck's legend;
                 a darker one once the whole card is that colour -->
            <span class="mt-1 flex items-center gap-1.5 font-display text-lg leading-none font-bold">
                <span
                    class="size-2 shrink-0 rounded-full"
                    :style="{ background: active ? 'rgb(0 0 0 / 0.3)' : color }"
                ></span>
                <span>{{ formatNoteLabel(note) }}<sup class="ml-0.5 text-[11px] font-semibold">{{ chord }}</sup></span>
            </span>
            <span class="mt-2 tabular-nums text-[10px] tracking-wide opacity-70">
                {{ tones.map(formatNoteLabel).join(" · ") }}
            </span>
            <span v-if="caption" class="mt-2 text-[11px] font-semibold">{{ caption }}</span>
            <span v-if="source" class="text-[10px] opacity-60">from {{ source }}</span>
        </button>
        <div class="absolute top-2 right-2 size-7">
            <Ripple :count="ripples" :scale="2.2" :class="['inset-0 rounded-lg', active ? 'bg-black/20' : 'bg-primary']" />
            <button
                type="button"
                :aria-label="`Play ${formatNoteLabel(note)}${chord}`"
                :class="[
                    'relative inline-flex size-full items-center justify-center rounded-lg transition outline-none active:scale-90 focus-visible:ring-2 focus-visible:ring-ring',
                    active
                        ? 'bg-black/10 text-[#1a1918] hover:bg-black/15'
                        : 'bg-surface text-muted-foreground hover:text-foreground',
                ]"
                @click="play"
            >
                <Play class="ml-px size-3 fill-current" />
            </button>
        </div>
    </div>
</template>
