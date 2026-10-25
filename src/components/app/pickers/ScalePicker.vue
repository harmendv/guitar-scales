<script setup lang="ts">
import { pill, pillActive, pillIdle } from "./styles";

defineProps<{
    scalesOptions: { label: string; value: string }[];
}>();

const scale = defineModel<string>({ required: true });

defineEmits<{
    select: [];
}>();
</script>

<template>
    <div class="flex flex-wrap gap-1.5">
        <button
            v-for="option in scalesOptions"
            :key="option.value"
            type="button"
            :class="[pill, scale === option.value ? pillActive : pillIdle]"
            @click="scale = option.value; $emit('select')"
        >
            {{ option.label }}
        </button>
    </div>
</template>
