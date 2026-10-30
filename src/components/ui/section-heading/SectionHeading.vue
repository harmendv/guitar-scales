<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

defineProps<{
    title: string;
}>();

const collapsed = defineModel<boolean>("collapsed", { required: true });
</script>

<template>
    <!-- The title folds its section away; the chevron points down while it's open -->
    <h2 class="font-display text-lg font-semibold tracking-tight">
        <button
            type="button"
            :aria-expanded="!collapsed"
            class="group -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="collapsed = !collapsed"
        >
            {{ title }}
            <ChevronDown
                :class="[
                    'size-4 text-muted-foreground transition-transform group-hover:text-foreground',
                    collapsed && '-rotate-90',
                ]"
            />
        </button>
    </h2>
</template>
