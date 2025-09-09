<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from "reka-ui";

interface ChordButtonProps {
    active: boolean;
    note: string;
    chord: string;
}

const props = withDefaults(defineProps<ChordButtonProps & PrimitiveProps>(), {
    as: 'button'
});

const emit = defineEmits(['click']);

function onClickChord() {
    emit('click');
}
</script>

<template>
    <Primitive v-bind="props" class="border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-center gap-1 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" :class="{'!border-indigo-700 !bg-indigo-100 dark:!bg-indigo-900 dark:!border-indigo-500': active }" @click="onClickChord">
        {{ note }}<sup>{{ chord }}</sup>
    </Primitive>
</template>
