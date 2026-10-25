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
        <div class="flex w-full min-w-0 flex-col gap-4 sm:w-auto">
            <div class="flex items-end justify-between gap-4">
                <div>
                    <p class="text-sm text-muted-foreground">{{ subheading }}</p>
                    <h1 class="font-display text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
                        {{ heading }}
                    </h1>
                </div>
                <!-- Phones: tuning moves under the neck, so Play sits next to the title -->
                <button
                    type="button"
                    aria-label="Play scale"
                    class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring outline-none sm:hidden"
                    @click="$emit('play')"
                >
                    <Play class="size-4 fill-current" />
                </button>
            </div>

            <ol class="flex w-full overflow-hidden rounded-xl border bg-card sm:w-fit">
                <li
                    v-for="(scaleNote, index) in scaleNotes"
                    :key="`${scaleNote.note}-${index}`"
                    :class="[
                        'flex min-w-0 flex-1 flex-col items-center gap-0.5 border-l px-1 py-2 first:border-l-0 sm:w-14 sm:flex-none',
                        index === 0 ? 'border-tone-root bg-tone-root text-white' : '',
                    ]"
                >
                    <span class="font-display text-base leading-none font-semibold">
                        {{ formatNoteLabel(scaleNote.note) }}
                    </span>
                    <span
                        :class="[
                            'tabular-nums text-[10px]',
                            index === 0 ? 'text-white/80' : 'text-muted-foreground',
                        ]"
                    >
                        {{ scaleNote.degree }}
                    </span>
                </li>
            </ol>
        </div>

        <div class="hidden items-center gap-3 sm:flex">
            <slot />
            <button
                type="button"
                class="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                @click="$emit('play')"
            >
                <Play class="size-3.5 fill-current" />
                Play scale
            </button>
        </div>
    </header>
</template>
