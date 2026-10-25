<script setup lang="ts">
import { Segmented } from "@/components/ui/segmented";
import KeyPicker from "./pickers/KeyPicker.vue";
import ModePicker from "./pickers/ModePicker.vue";
import ScalePicker from "./pickers/ScalePicker.vue";

defineProps<{
    accidentalPreferenceOptions: { label: string; value: string }[];
    modeOptions: { label: string; value: number }[];
    notesOptions: { label: string; value: string }[];
    scalesOptions: { label: string; value: string }[];
}>();

const note = defineModel<string>("note", { required: true });
const scale = defineModel<string>("scale", { required: true });
const mode = defineModel<number>("mode", { required: true });
const accidentalPreference = defineModel<string>("accidentalPreference", { required: true });
</script>

<template>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <section>
            <div class="mb-3 flex h-7 items-center justify-between gap-3">
                <h2 class="font-display text-lg font-semibold tracking-tight">Key</h2>
                <Segmented
                    v-model="accidentalPreference"
                    :options="accidentalPreferenceOptions"
                    class="p-0.5 [&_button]:h-6 [&_button]:min-w-7 [&_button]:px-2 [&_button]:text-[13px]"
                />
            </div>
            <KeyPicker v-model="note" :notes-options="notesOptions" />
        </section>

        <section>
            <h2 class="mb-3 flex h-7 items-center font-display text-lg font-semibold tracking-tight">Scale</h2>
            <ScalePicker v-model="scale" :scales-options="scalesOptions" />
        </section>

        <section>
            <h2 class="mb-3 flex h-7 items-center font-display text-lg font-semibold tracking-tight">Mode</h2>
            <ModePicker v-model="mode" :mode-options="modeOptions" />
        </section>
    </div>
</template>
