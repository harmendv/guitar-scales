<script setup lang="ts">
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

defineProps<{
    modeOptions: { label: string; value: number }[];
    noteNamesOptions: { label: string; value: string }[];
    noteVisibilityOptions: { label: string; value: string }[];
    notesOptions: { label: string; value: string }[];
    scalesOptions: { label: string; value: string }[];
}>();

const note = defineModel<string>("note", { required: true });
const scale = defineModel<string>("scale", { required: true });
const mode = defineModel<number>("mode", { required: true });
const noteNames = defineModel<string>("noteNames", { required: true });
const noteVisibility = defineModel<string>("noteVisibility", { required: true });
</script>

<template>
    <div class="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div>
            <Label class="mb-4">Root</Label>
            <Select v-model="note">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in notesOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label class="mb-4">Scale</Label>
            <Select v-model="scale">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in scalesOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label class="mb-4">Mode</Label>
            <Select v-model="mode">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in modeOptions"
                        :key="option.label"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label class="mb-4">Note names</Label>
            <Select v-model="noteNames">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in noteNamesOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label class="mb-4">Note visibility</Label>
            <Select v-model="noteVisibility">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Make a selection" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in noteVisibilityOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <slot />
    </div>
</template>
