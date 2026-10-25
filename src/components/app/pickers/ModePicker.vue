<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { SelectRoot, SelectTrigger } from "reka-ui";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { splitModeLabel } from "./scaleGroups";
import { selectTrigger } from "./styles";

const props = defineProps<{
    modeOptions: { label: string; value: number }[];
}>();

const mode = defineModel<number>({ required: true });

const options = computed(() =>
    props.modeOptions.map((option) => ({ value: option.value, ...splitModeLabel(option.label) }))
);
const selected = computed(() => options.value.find((option) => option.value === mode.value));
</script>

<template>
    <SelectRoot v-model="mode">
        <SelectTrigger :class="selectTrigger" aria-label="Mode">
            <span class="tabular-nums text-xs text-muted-foreground">{{ selected?.value }}</span>
            <span class="truncate">{{ selected?.name }}</span>
            <ChevronDown class="ml-auto size-4 shrink-0 text-muted-foreground" />
        </SelectTrigger>
        <SelectContent align="start">
            <SelectItem v-for="option in options" :key="option.value" :value="option.value">
                <span class="w-3 tabular-nums text-xs text-muted-foreground">{{ option.value }}</span>
                {{ option.name }}
                <span v-if="option.alias" class="text-xs text-muted-foreground">{{ option.alias }}</span>
            </SelectItem>
        </SelectContent>
    </SelectRoot>
</template>
