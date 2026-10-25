<script setup lang="ts">
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
    <div class="flex flex-wrap gap-1.5">
        <button
            v-for="option in modeOptions"
            :key="option.label"
            type="button"
            :class="[pill, mode === option.value ? pillActive : pillIdle]"
            @click="mode = option.value; $emit('select')"
        >
            <span class="mr-1 tabular-nums text-[10px] opacity-60">{{ option.value }}</span>
            {{ option.label.split(" / ")[0] }}
        </button>
    </div>
</template>
