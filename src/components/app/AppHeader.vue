<script setup lang="ts">
import { Play } from "lucide-vue-next";
import { formatNoteLabel, type ScaleNote } from "@/composables/useNotes";

defineProps<{
    heading: string;
    subheading: string;
    scaleNotes: ScaleNote[];
}>();

defineEmits<{
    play: [];
}>();
</script>

<template>
    <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 class="font-display text-3xl font-bold tracking-tight lg:text-4xl">
                    {{ heading }}
                </h1>
                <span class="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                    {{ subheading }}
                </span>
            </div>
            <ol class="mt-3 flex flex-wrap gap-x-4 gap-y-2 sm:mt-4 sm:gap-x-5">
                <li
                    v-for="(scaleNote, index) in scaleNotes"
                    :key="`${scaleNote.note}-${index}`"
                    class="flex min-w-6 flex-col items-center"
                >
                    <span
                        :class="[
                            'text-sm font-semibold',
                            index === 0 ? 'text-tone-root' : '',
                        ]"
                    >
                        {{ formatNoteLabel(scaleNote.note) }}
                    </span>
                    <span class="tabular-nums text-[10px] text-muted-foreground">
                        {{ scaleNote.degree }}
                    </span>
                </li>
            </ol>
        </div>

        <!-- On phones the tuning stretches and Play shrinks to an icon, so both fit on one row -->
        <div class="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <slot />
            <button
                type="button"
                aria-label="Play scale"
                class="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring outline-none sm:px-4"
                @click="$emit('play')"
            >
                <Play class="size-3.5 fill-current" />
                <span class="hidden sm:inline">Play scale</span>
            </button>
        </div>
    </header>
</template>
