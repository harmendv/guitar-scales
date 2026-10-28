<script setup lang="ts">
import { computed } from "vue";
import { Pencil, Plus } from "lucide-vue-next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import type { Tuning } from "@/lib/tunings";
import { cn } from "@/lib/utils";

const props = defineProps<{
    canEditSelectedTuning: boolean;
    tuning: Tuning;
    tuningOptions: Tuning[];
    // Bordered, full-width version for under its own heading (phones); default is the quiet inline one
    field?: boolean;
}>();

const selectedTuningId = defineModel<string>("selectedTuningId", { required: true });

defineEmits<{
    create: [];
    edit: [];
}>();

const tuningNotes = computed(() => props.tuning.data.map((string) => string.note).join(" "));

const iconButton = computed(() =>
    cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
        props.field ? "size-10 border bg-card hover:border-foreground/30" : "size-9 hover:bg-surface"
    )
);
</script>

<template>
    <div :class="field ? 'flex min-w-0 items-center gap-1.5' : '-mx-2.5 flex min-w-0 items-center gap-0.5 sm:mx-0'">
        <Select v-model="selectedTuningId">
            <SelectTrigger
                :class="
                    field
                        ? 'h-10 min-w-0 flex-1 data-[size=default]:h-10 rounded-lg border-border bg-card px-3 text-sm text-foreground shadow-none hover:border-foreground/30 dark:bg-card dark:hover:bg-card'
                        : 'h-9 min-w-0 data-[size=default]:h-9 rounded-lg border-transparent bg-transparent px-2.5 text-sm text-foreground shadow-none hover:bg-surface dark:bg-transparent dark:hover:bg-surface'
                "
                aria-label="Tuning"
            >
                <span class="truncate">
                    <span v-if="!field" class="mr-1.5 text-muted-foreground">Tuning</span>
                    <span class="font-medium">{{ tuning.label }}</span>
                    <span class="ml-1.5 text-muted-foreground">{{ tuningNotes }}</span>
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
:class="iconButton"
            title="Create custom tuning"
            aria-label="Create custom tuning"
            @click="$emit('create')"
        >
            <Plus :size="15" />
        </button>
        <button
            v-if="canEditSelectedTuning"
            type="button"
:class="iconButton"
            title="Edit selected custom tuning"
            aria-label="Edit selected custom tuning"
            @click="$emit('edit')"
        >
            <Pencil :size="14" />
        </button>
    </div>
</template>
