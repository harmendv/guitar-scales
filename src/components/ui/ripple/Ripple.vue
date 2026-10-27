<script setup lang="ts">
// A shape that grows and fades behind whatever was just played. Bump `count` to fire it again.
defineProps<{
    count: number;
    // How far the circle grows, relative to its own size
    scale?: number;
}>();
</script>

<template>
    <span
        v-if="count"
        :key="count"
        class="pointer-events-none absolute animate-[note-ripple_600ms_ease-out_forwards]"
        :style="scale ? { '--ripple-scale': scale } : undefined"
    ></span>
</template>
