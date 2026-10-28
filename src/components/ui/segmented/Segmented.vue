<script setup lang="ts" generic="T extends string | number">
import { cn } from "@/lib/utils";

defineProps<{
    // `badge` puts a count on the option's top-right corner, left off when it's 0
    options: { label: string; value: T; badge?: number }[];
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
                'relative h-8 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                model === option.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="model = option.value"
        >
            {{ option.label }}
            <span
                v-if="option.badge"
                class="absolute -top-1.5 -right-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] leading-none font-semibold text-background tabular-nums"
                :aria-label="`${option.badge} selected`"
            >{{ option.badge }}</span>
        </button>
        <slot />
    </div>
</template>
