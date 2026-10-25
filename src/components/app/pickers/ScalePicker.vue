<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { SelectRoot, SelectTrigger } from "reka-ui";
import { SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { groupScales } from "./scaleGroups";
import { selectGroupLabel, selectTrigger } from "./styles";

const props = defineProps<{
    scalesOptions: { label: string; value: string }[];
}>();

const scale = defineModel<string>({ required: true });

const groups = computed(() => groupScales(props.scalesOptions));

const selectedLabel = computed(
    () => props.scalesOptions.find((option) => option.value === scale.value)?.label ?? ""
);
</script>

<template>
    <SelectRoot v-model="scale">
        <SelectTrigger :class="selectTrigger" aria-label="Scale">
            <span class="truncate">{{ selectedLabel }}</span>
            <ChevronDown class="ml-auto size-4 shrink-0 text-muted-foreground" />
        </SelectTrigger>
        <SelectContent align="start" class="max-h-[min(var(--reka-select-content-available-height),28rem)]">
            <SelectGroup v-for="group in groups" :key="group.label">
                <SelectLabel :class="selectGroupLabel">{{ group.label }}</SelectLabel>
                <SelectItem v-for="option in group.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                </SelectItem>
            </SelectGroup>
        </SelectContent>
    </SelectRoot>
</template>
