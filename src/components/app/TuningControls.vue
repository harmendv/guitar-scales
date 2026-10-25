<script setup lang="ts">
import { computed } from "vue";
import { Pencil, Plus } from "lucide-vue-next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import type { Tuning } from "@/composables/useTunings";

const props = defineProps<{
    canEditSelectedTuning: boolean;
    tuning: Tuning;
    tuningOptions: Tuning[];
}>();

const selectedTuningId = defineModel<string>("selectedTuningId", { required: true });

defineEmits<{
    create: [];
    edit: [];
}>();

const tuningNotes = computed(() => props.tuning.data.map((string) => string.note).join(" "));
</script>

<template>
    <div class="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
        <Select v-model="selectedTuningId">
            <SelectTrigger
                class="h-10 min-w-0 flex-1 data-[size=default]:h-10 rounded-lg sm:flex-none border-border bg-card px-3 text-sm text-foreground shadow-none hover:border-foreground/30 dark:bg-card dark:hover:bg-card"
                aria-label="Tuning"
            >
                <span class="truncate">
                    {{ tuning.label }} · {{ tuningNotes }}
                </span>
            </SelectTrigger>
            <SelectContent>
                <SelectItem
                    v-for="option in tuningOptions"
                    :key="option.id"
                    :value="option.id"
                >
                    {{ option.source === "custom" ? `Custom: ${option.label}` : option.label }}
                </SelectItem>
            </SelectContent>
        </Select>
        <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            title="Create custom tuning"
            aria-label="Create custom tuning"
            @click="$emit('create')"
        >
            <Plus :size="15" />
        </button>
        <button
            v-if="canEditSelectedTuning"
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            title="Edit selected custom tuning"
            aria-label="Edit selected custom tuning"
            @click="$emit('edit')"
        >
            <Pencil :size="14" />
        </button>
    </div>
</template>
