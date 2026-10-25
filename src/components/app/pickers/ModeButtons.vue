<script setup lang="ts">
import { splitModeLabel } from "./scaleGroups";
import { pill, pillActive, pillIdle } from "./styles";

defineProps<{
    modeOptions: { label: string; value: number }[];
}>();

const mode = defineModel<number>({ required: true });

defineEmits<{
    select: [];
}>();
</script>

<template>
    <div class="grid grid-cols-2 gap-1.5">
        <button
            v-for="option in modeOptions"
            :key="option.value"
            type="button"
            :class="[
                pill,
                'flex h-auto min-h-9 items-center gap-2 py-1.5 text-left leading-tight',
                mode === option.value ? pillActive : pillIdle,
            ]"
            @click="mode = option.value; $emit('select')"
        >
            <span class="tabular-nums text-[11px] opacity-60">{{ option.value }}</span>
            {{ splitModeLabel(option.label).name }}
        </button>
    </div>
</template>
