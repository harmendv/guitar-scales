<script setup lang="ts" generic="T extends string | number">
import { cn } from "@/lib/utils";

defineProps<{
    options: { label: string; value: T }[];
    class?: string;
}>();

const model = defineModel<T>();
</script>

<template>
    <div
        role="radiogroup"
        :class="cn('inline-flex items-center gap-0.5 rounded-lg bg-surface p-1', $props.class)"
    >
        <button
            v-for="option in options"
            :key="String(option.value)"
            type="button"
            role="radio"
            :aria-checked="model === option.value"
            :class="[
                'h-8 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                model === option.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="model = option.value"
        >
            {{ option.label }}
        </button>
        <slot />
    </div>
</template>
