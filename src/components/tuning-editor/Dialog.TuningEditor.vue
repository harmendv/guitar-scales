<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Plus } from "lucide-vue-next";
import { notes } from "@/composables/useNotes";
import { isValidTuning, type InstrumentString } from "@/composables/useTunings";

const MIN_STRINGS = 1;
const MAX_STRINGS = 12;
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 7;

const props = withDefaults(
    defineProps<{
        modelValue: {
            id?: string;
            label: string;
            data: InstrumentString[];
        };
        showDelete?: boolean;
        mode: "create" | "edit";
    }>(),
    {
        showDelete: false,
    }
);

const emit = defineEmits<{
    save: [
        {
            id?: string;
            label: string;
            data: InstrumentString[];
        },
    ];
    cancel: [];
    delete: [id?: string];
}>();

const draft = ref({
    id: props.modelValue.id,
    label: props.modelValue.label,
    data: props.modelValue.data.map((stringData) => ({
        note: stringData.note,
        octave: stringData.octave,
    })),
});

watch(
    () => props.modelValue,
    (next) => {
        draft.value = {
            id: next.id,
            label: next.label,
            data: next.data.map((stringData) => ({
                note: stringData.note,
                octave: stringData.octave,
            })),
        };
    },
    { deep: true }
);

const canAddString = computed(() => draft.value.data.length < MAX_STRINGS);
const dialogTitle = computed(() =>
    props.mode === "edit" ? "Edit custom tuning" : "Create custom tuning"
);

const validationError = computed(() => {
    const label = draft.value.label.trim();
    if (!label) return "Please provide a tuning name.";
    if (draft.value.data.length < MIN_STRINGS || draft.value.data.length > MAX_STRINGS) {
        return `String count must be between ${MIN_STRINGS} and ${MAX_STRINGS}.`;
    }
    if (!isValidTuning({ label, data: draft.value.data })) {
        return "Each string must have a valid note and an octave between 0 and 7.";
    }
    return "";
});

function updateOctave(index: number, value: string) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return;
    draft.value.data[index].octave = Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, parsed));
}

function addString() {
    if (!canAddString.value) return;
    draft.value.data.push({ note: "E", octave: 2 });
}

function removeString(index: number) {
    if (draft.value.data.length <= MIN_STRINGS) return;
    draft.value.data.splice(index, 1);
}

function onSave() {
    if (validationError.value) return;
    emit("save", {
        id: draft.value.id,
        label: draft.value.label.trim(),
        data: draft.value.data.map((stringData) => ({
            note: stringData.note,
            octave: stringData.octave,
        })),
    });
}
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
            type="button"
            class="absolute inset-0 bg-black/55"
            aria-label="Close dialog"
            @click="$emit('cancel')"
        />

        <div
            class="relative z-10 w-full max-w-xl rounded-lg border bg-white p-4 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            :aria-label="dialogTitle"
        >
            <div class="mb-3 flex items-center justify-between">
                <h3 class="text-base font-semibold">{{ dialogTitle }}</h3>
                <button
                    type="button"
                    class="rounded-md border px-2 py-1.5 text-xs"
                    @click="$emit('cancel')"
                >
                    Close
                </button>
            </div>

            <div class="mb-3">
                <label class="text-sm font-medium block mb-2">Tuning name</label>
                <input
                    v-model="draft.label"
                    type="text"
                    class="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                    placeholder="My tuning"
                />
            </div>

            <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium">Strings</label>
                <button
                    type="button"
                    class="rounded-md border px-2 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canAddString"
                    title="Add string"
                    aria-label="Add string"
                    @click="addString"
                >
                    <Plus :size="16" />
                </button>
            </div>

            <div class="space-y-2 mb-3 max-h-[45vh] overflow-y-auto pr-1">
                <div
                    v-for="(stringData, index) in draft.data"
                    :key="index"
                    class="grid grid-cols-[1fr_80px_96px] items-center gap-2"
                >
                    <select
                        v-model="stringData.note"
                        class="rounded-md border bg-transparent px-2 py-2 text-sm"
                    >
                        <option v-for="note in notes" :key="note.name" :value="note.name">
                            {{ note.name }}
                        </option>
                    </select>

                    <input
                        :value="stringData.octave"
                        type="number"
                        :min="MIN_OCTAVE"
                        :max="MAX_OCTAVE"
                        class="rounded-md border bg-transparent px-2 py-2 text-sm"
                        @input="updateOctave(index, ($event.target as HTMLInputElement).value)"
                    />

                    <button
                        type="button"
                        class="rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="draft.data.length <= MIN_STRINGS"
                        @click="removeString(index)"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <p v-if="validationError" class="text-sm text-red-600 mb-3">{{ validationError }}</p>

            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="rounded-md border px-3 py-2 text-sm"
                    @click="$emit('cancel')"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="rounded-md border px-3 py-2 text-sm bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="Boolean(validationError)"
                    @click="onSave"
                >
                    Save tuning
                </button>
                <button
                    v-if="showDelete"
                    type="button"
                    class="rounded-md border px-3 py-2 text-sm text-red-600"
                    @click="$emit('delete', draft.id)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
