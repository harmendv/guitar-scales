<script setup lang="ts">
import { getPitchClass } from "@/composables/useNotes";
import { pill, pillActive, pillIdle } from "./styles";

defineProps<{
    notesOptions: { label: string; value: string }[];
}>();

const note = defineModel<string>({ required: true });

defineEmits<{
    select: [];
}>();
</script>

<template>
    <div class="grid grid-cols-6 gap-1.5">
        <button
            v-for="option in notesOptions"
            :key="option.value"
            type="button"
            :class="[
                pill,
                'px-0',
                getPitchClass(note) === getPitchClass(option.value) ? pillActive : pillIdle,
            ]"
            @click="note = option.value; $emit('select')"
        >
            {{ option.label }}
        </button>
    </div>
</template>
