<script setup lang="ts">
import { Pencil, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Tuning } from "@/composables/useTunings";

defineProps<{
    canEditSelectedTuning: boolean;
    tuningOptions: Tuning[];
}>();

const selectedTuningId = defineModel<string>("selectedTuningId", { required: true });

defineEmits<{
    create: [];
    edit: [];
}>();
</script>

<template>
    <div>
        <Label class="mb-4">Tuning</Label>
        <div class="flex items-center gap-2">
            <Select v-model="selectedTuningId">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
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
            <Button
                variant="outline"
                size="icon"
                title="Create custom tuning"
                aria-label="Create custom tuning"
                @click="$emit('create')"
            >
                <Plus :size="16" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                :disabled="!canEditSelectedTuning"
                title="Edit selected custom tuning"
                aria-label="Edit selected custom tuning"
                @click="$emit('edit')"
            >
                <Pencil :size="16" />
            </Button>
        </div>
    </div>
</template>
