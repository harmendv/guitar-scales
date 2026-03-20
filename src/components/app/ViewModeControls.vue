<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { FretboardViewMode } from "@/composables/useAppState";

defineProps<{
    fretCount: number;
    maxPositionStartFret: number;
    minPositionStartFret: number;
    positionSpan: number;
    show3nps: boolean;
    showPosition: boolean;
    threeNpsShapesCount: number;
    viewModeOptions: { label: string; value: FretboardViewMode }[];
}>();

const viewMode = defineModel<FretboardViewMode>("viewMode", { required: true });
const positionStartFret = defineModel<number>("positionStartFret", { required: true });
const positionSpanModel = defineModel<number>("positionSpan", { required: true });

defineEmits<{
    next3npsShape: [];
    nextPosition: [];
    prev3npsShape: [];
    prevPosition: [];
    resetPositionToRoot: [];
}>();
</script>

<template>
    <div class="flex flex-wrap items-center gap-3 mb-8">
        <Select v-model="viewMode">
            <SelectTrigger class="w-40">
                <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem
                    v-for="option in viewModeOptions"
                    :key="option.value"
                    :value="option.value"
                >
                    {{ option.label }}
                </SelectItem>
            </SelectContent>
        </Select>
        <Button
            v-if="show3nps"
            variant="outline"
            :disabled="!threeNpsShapesCount"
            @click="$emit('prev3npsShape')"
        >
            Prev Shape
        </Button>
        <Button
            v-if="show3nps"
            variant="outline"
            :disabled="!threeNpsShapesCount"
            @click="$emit('next3npsShape')"
        >
            Next Shape
        </Button>
        <template v-if="showPosition">
            <Button
                variant="outline"
                @click="$emit('prevPosition')"
            >
                Prev Position
            </Button>
            <Button
                variant="outline"
                @click="$emit('nextPosition')"
            >
                Next Position
            </Button>
            <Button
                variant="outline"
                @click="$emit('resetPositionToRoot')"
            >
                Reset to root
            </Button>
            <label class="text-sm flex items-center gap-2">
                Start
                <input
                    v-model.number="positionStartFret"
                    type="number"
                    :min="minPositionStartFret"
                    :max="maxPositionStartFret"
                    class="w-20 rounded-md border bg-transparent px-2 py-1"
                />
            </label>
            <label class="text-sm flex items-center gap-2">
                Span
                <input
                    v-model.number="positionSpanModel"
                    type="number"
                    min="1"
                    :max="fretCount"
                    class="w-20 rounded-md border bg-transparent px-2 py-1"
                />
            </label>
        </template>
    </div>
</template>
