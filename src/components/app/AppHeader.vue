<script setup lang="ts">
import { ref } from "vue";
import { Play } from "lucide-vue-next";
import { Ripple } from "@/components/ui/ripple";

defineProps<{
    heading: string;
    subheading: string;
}>();

const emit = defineEmits<{
    play: [];
}>();

const ripples = ref(0);

function play() {
    ripples.value++;
    emit("play");
}
</script>

<template>
    <!-- The play button is as tall as one subheading line plus one heading line (text-sm, then
         text-3xl/4xl at leading-tight), so it lines up with them; long titles wrap below it -->
    <header class="flex items-start gap-4">
        <div class="relative flex shrink-0">
            <Ripple :count="ripples" :scale="1.8" class="inset-0 rounded-2xl bg-primary" />
            <button
                type="button"
                aria-label="Play scale"
                title="Play scale"
                class="relative inline-flex size-[calc(1.25rem+1.875rem*1.25)] items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring outline-none lg:size-[calc(1.25rem+2.25rem*1.25)]"
                @click="play"
            >
                <Play class="ml-0.5 size-5 fill-current lg:size-6" />
            </button>
        </div>
        <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ subheading }}</p>
            <h1 class="font-display text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
                {{ heading }}
            </h1>
        </div>
    </header>
</template>
