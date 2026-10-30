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
    <header class="min-w-0">
        <p class="text-sm text-muted-foreground">{{ subheading }}</p>
        <!-- The play button follows the title as a quiet round button, red only on hover -->
        <div class="flex items-center gap-3">
            <h1 class="min-w-0 font-display text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
                {{ heading }}
            </h1>
            <div class="relative flex shrink-0">
                <Ripple :count="ripples" :scale="1.8" class="inset-0 rounded-full bg-primary" />
                <button
                    type="button"
                    aria-label="Play scale"
                    title="Play scale"
                    class="relative inline-flex size-9 items-center justify-center rounded-full bg-surface text-primary transition outline-none hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 lg:size-10"
                    @click="play"
                >
                    <Play class="ml-0.5 size-4 fill-current" />
                </button>
            </div>
        </div>
    </header>
</template>
