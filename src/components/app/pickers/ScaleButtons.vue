<script setup lang="ts">
import { computed } from "vue";
import { groupScales } from "./scaleGroups";
import { pill, pillActive, pillIdle } from "./styles";

const props = defineProps<{
    scalesOptions: { label: string; value: string }[];
}>();

const scale = defineModel<string>({ required: true });

defineEmits<{
    select: [];
}>();

const groups = computed(() => groupScales(props.scalesOptions));
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-for="group in groups" :key="group.label">
            <h3 class="mb-1.5 text-xs text-muted-foreground">{{ group.label }}</h3>
            <div class="grid grid-cols-2 gap-1.5">
                <button
                    v-for="option in group.options"
                    :key="option.value"
                    type="button"
                    :class="[pill, 'h-auto min-h-9 py-1.5 text-left leading-tight', scale === option.value ? pillActive : pillIdle]"
                    @click="scale = option.value; $emit('select')"
                >
                    {{ option.label }}
                </button>
            </div>
        </div>
    </div>
</template>
