<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useUrlSearchParams } from "@vueuse/core";
import { Pencil, Plus } from "lucide-vue-next";
import { scales, scalesFlatMap } from "@/composables/useScales";
import { notes as baseNotes, getScaleNotes } from "@/composables/useNotes";
import {
    chordsByPrimaryAbbreviation,
    getChordIntervals,
    getChordNotes,
    useDiatonicChords,
} from "@/composables/useChords";
import { use3nps } from "@/composables/use3nps";
import { useCustomTunings } from "@/composables/useCustomTunings";
import {
    builtInTunings,
    deserializeTuning,
    serializeTuning,
    type InstrumentString,
} from "@/composables/useTunings";
import { Fretboard } from "@/components/ui/fretboard";
import { Logo } from "@/components/ui/logo";
import DialogTuningEditor from "@/components/tuning-editor/Dialog.TuningEditor.vue";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChordButton } from "@/components/ui/chord-button";

// URL search params (reactive)
const params = useUrlSearchParams("history");
const {
    allTunings,
    saveTuning,
    deleteTuning,
    getTuningById,
} = useCustomTunings();

const defaultTuning = builtInTunings[0];

const note = ref<string>((params.note as string) || "C");
const scale = ref<string>((params.scale as string) || "major");
const mode = ref<number>(Number.parseInt(params.mode as string, 10) || 1);
const chord = ref<number | null>(
    params.chord ? Number.parseInt(params.chord as string, 10) : null
);

function resolveInitialTuningId(): string {
    const builtinFromLegacyParam = builtInTunings.find(
        (tuning) => tuning.value === params.tuning
    );
    if (builtinFromLegacyParam) return builtinFromLegacyParam.id;

    if (typeof params.tuning === "string") {
        const byId = getTuningById(params.tuning);
        if (byId) return byId.id;
    }

    const fromUrl = typeof params.tuningData === "string"
        ? deserializeTuning(params.tuningData)
        : null;
    if (!fromUrl) return defaultTuning.id;

    const saved = saveTuning({
        label: (params.tuningLabel as string) || fromUrl.label || "Shared custom tuning",
        data: fromUrl.data,
    });
    return saved?.id || defaultTuning.id;
}

const selectedTuningId = ref<string>(resolveInitialTuningId());
const tuning = computed(
    () => getTuningById(selectedTuningId.value) || defaultTuning
);

const isEditingCustomTuning = ref(false);
const tuningEditorMode = ref<"create" | "edit">("create");
const draftTuning = ref<{
    id?: string;
    label: string;
    data: InstrumentString[];
}>({
    label: "Custom tuning",
    data: tuning.value.data.map((stringData) => ({
        note: stringData.note,
        octave: stringData.octave,
    })),
});

const noteNames = ref<string>((params.noteNames as string) || "notes");
const noteVisibility = ref<string>((params.noteVisibility as string) || "all");
const show3nps = ref<boolean>((params.show3nps as string) === "1");
const threeNpsShapeIndex = ref<number>(
    Math.max(0, (Number.parseInt(params.shape as string, 10) || 1) - 1)
);
const fretCount = 20;

const noteNamesOptions = [
    { label: "Scale and chord Degrees", value: "degrees" },
    { label: "Scale Notes", value: "notes" },
];
const noteVisibilityOptions = [
    { label: "All Notes", value: "all" },
    { label: "Only Scale Notes", value: "only-scale" },
];

// Derived option lists
const scalesOptions = computed(() =>
    scales.map((s) => ({ label: s.name, value: s.slug }))
);
const notesOptions = computed(() =>
    baseNotes.map((n) => ({ label: n.name, value: n.name }))
);
const modeOptions = computed(() => {
    const opts: { label: string; value: number }[] = [];
    const idx = selectedScaleIndex.value;
    if (idx < 0) return opts;
    const formula = scales[idx].formula;
    formula.forEach((entry) =>
        opts.push({ label: entry.mode, value: entry.id })
    );
    return opts;
});
const tuningOptions = computed(() => allTunings.value);
const canEditSelectedTuning = computed(() => tuning.value.source === "custom");
const isEditingExistingCustomTuning = computed(
    () => Boolean(draftTuning.value.id) && tuning.value.source === "custom"
);

const selectedScaleIndex = computed(() => scalesFlatMap.indexOf(scale.value));

// Adjusted scaleNotes (assert note string)
const scaleNotes = computed(() => {
    return getScaleNotes(selectedScaleIndex.value, mode.value, note.value);
});

const chords = useDiatonicChords(scaleNotes, selectedScaleIndex, scales);

// Refined chordRoot/Extension types (no null => undefined)
const chordRoot = computed<string | number | undefined>(() =>
    chord.value ? chords.value[chord.value - 1]?.note : undefined
);
const chordExtension = computed<string | number | undefined>(() =>
    chord.value ? chords.value[chord.value - 1]?.chord : undefined
);

const chordsMap = chordsByPrimaryAbbreviation();

const chordIntervals = computed(() =>
    getChordIntervals(chordExtension.value, chordsMap)
);

const chordNotes = computed(() =>
    getChordNotes(
        chord.value,
        scaleNotes.value,
        chordIntervals.value,
        selectedScaleIndex.value,
        scales
    )
);
const { shapes: threeNpsShapes } = use3nps(
    scaleNotes,
    computed(() => tuning.value.data),
    fretCount
);

const activeThreeNpsShape = computed<number[][]>(() => {
    if (!threeNpsShapes.value.length) return [];
    const maxIndex = threeNpsShapes.value.length - 1;
    const safeIndex = Math.min(Math.max(threeNpsShapeIndex.value, 0), maxIndex);
    return threeNpsShapes.value[safeIndex];
});

const title = computed(() => {
    let t = `Scale: ${note.value}-${scale.value}`;
    if (mode.value > 1 && modeOptions.value[mode.value - 1]) {
        t += ` (${modeOptions.value[mode.value - 1].label})`;
    }
    if (chord.value) {
        t += ` / chord: ${chordRoot.value ?? ""}${chordExtension.value ?? ""}`;
    }
    return t;
});

// Active value for chords component (exclude null)
const activeChord = computed<number | undefined>(() =>
    chord.value == null ? undefined : chord.value
);

// Watchers syncing to URL params
watch(note, (v) => (params.note = v));
watch(scale, (v) => {
    mode.value = 1;
    params.scale = v;
});
watch(mode, (v) => {
    chord.value = null;
    params.mode = v as any;
});
watch(chord, (v) => (params.chord = v as any));
watch(noteNames, (v) => (params.noteNames = v));
watch(noteVisibility, (v) => (params.noteVisibility = v));
watch(show3nps, (v) => (params.show3nps = v ? "1" : "0"));
watch(threeNpsShapeIndex, (v) => (params.shape = String(v + 1)));
watch(threeNpsShapes, (shapes) => {
    if (!shapes.length) {
        threeNpsShapeIndex.value = 0;
        return;
    }
    if (threeNpsShapeIndex.value > shapes.length - 1) {
        threeNpsShapeIndex.value = shapes.length - 1;
    }
});
watch(
    tuning,
    (activeTuning) => {
        if (activeTuning.source === "builtin") {
            params.tuning = activeTuning.value;
            delete params.tuningData;
            delete params.tuningLabel;
            return;
        }

        params.tuning = "custom";
        params.tuningData = serializeTuning({
            label: activeTuning.label,
            data: activeTuning.data,
        });
        params.tuningLabel = activeTuning.label;
    },
    { immediate: true, deep: true }
);

function onClickChord(index: number) {
    if (chord.value === index + 1) {
        chord.value = null;
    } else {
        chord.value = index + 1;
    }
}

function next3npsShape() {
    if (!threeNpsShapes.value.length) return;
    threeNpsShapeIndex.value =
        (threeNpsShapeIndex.value + 1) % threeNpsShapes.value.length;
}

function prev3npsShape() {
    if (!threeNpsShapes.value.length) return;
    threeNpsShapeIndex.value =
        (threeNpsShapeIndex.value - 1 + threeNpsShapes.value.length) %
        threeNpsShapes.value.length;
}

function openCreateCustomTuning() {
    tuningEditorMode.value = "create";
    draftTuning.value = {
        label: `${tuning.value.label} custom`,
        data: tuning.value.data.map((stringData) => ({
            note: stringData.note,
            octave: stringData.octave,
        })),
    };
    isEditingCustomTuning.value = true;
}

function openEditCustomTuning() {
    if (tuning.value.source !== "custom") return;
    tuningEditorMode.value = "edit";
    draftTuning.value = {
        id: tuning.value.id,
        label: tuning.value.label,
        data: tuning.value.data.map((stringData) => ({
            note: stringData.note,
            octave: stringData.octave,
        })),
    };
    isEditingCustomTuning.value = true;
}

function onSaveCustomTuning(next: {
    id?: string;
    label: string;
    data: InstrumentString[];
}) {
    const saved = saveTuning(next);
    if (!saved) return;
    selectedTuningId.value = saved.id;
    isEditingCustomTuning.value = false;
}

function onDeleteCustomTuning(id?: string) {
    if (!id) return;
    const deleted = deleteTuning(id);
    if (!deleted) return;
    if (selectedTuningId.value === id) {
        selectedTuningId.value = defaultTuning.id;
    }
    isEditingCustomTuning.value = false;
}
</script>

<template>
    <div class="w-full max-w-[1300px] mx-auto flex flex-col">
        <Label class="mb-4">{{ title }}</Label>
        <Fretboard
            :strings="tuning.data"
            :scale-notes="scaleNotes"
            :frets="fretCount"
            :shape-active="show3nps"
            :shape-frets-by-string="activeThreeNpsShape"
            :chord-root="chordRoot"
            :chord-notes="chordNotes"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            class="mb-8"
        />

        <div class="flex flex-wrap items-center gap-3 mb-8">
            <button
                type="button"
                class="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-center rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                :class="{
                    '!border-indigo-700 !bg-indigo-100 dark:!bg-indigo-900 dark:!border-indigo-500':
                        show3nps,
                }"
                @click="show3nps = !show3nps"
            >
                3NPS
            </button>
            <button
                type="button"
                class="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-center rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!threeNpsShapes.length"
                @click="prev3npsShape"
            >
                Prev Shape
            </button>
            <button
                type="button"
                class="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-center rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!threeNpsShapes.length"
                @click="next3npsShape"
            >
                Next Shape
            </button>
            <span class="text-sm text-slate-500 dark:text-slate-300">
                {{
                    threeNpsShapes.length
                        ? `Shape ${threeNpsShapeIndex + 1} / ${threeNpsShapes.length}`
                        : "No 3NPS shape for this scale/tuning"
                }}
            </span>
        </div>

        <Label class="mb-4">Diatonic Chords</Label>
        <div class="grid grid-cols-4 md:flex w-full gap-6 mb-8">
            <ChordButton
                v-for="(chord, index) in chords"
                :active="activeChord === index + 1"
                :note="chord.note"
                :chord="chord.chord"
                @click="onClickChord(index)"
            />
        </div>

        <div class="mb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <Label class="mb-4">Root</Label>
                <Select v-model="note">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="option in notesOptions"
                            :value="option.value"
                            :key="option.value"
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
                            :value="option.value"
                            :key="option.value"
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
                            :value="option.value"
                            :key="option.label"
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
                            :value="option.value"
                            :key="option.value"
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
                            :value="option.value"
                            :key="option.value"
                        >
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
                                :value="option.id"
                                :key="option.id"
                            >
                                {{
                                    option.source === "custom"
                                        ? `Custom: ${option.label}`
                                        : option.label
                                }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <button
                        type="button"
                        class="rounded-md border p-2 text-sm"
                        title="Create custom tuning"
                        aria-label="Create custom tuning"
                        @click="openCreateCustomTuning"
                    >
                        <Plus :size="16" />
                    </button>
                    <button
                        type="button"
                        class="rounded-md border p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!canEditSelectedTuning"
                        title="Edit selected custom tuning"
                        aria-label="Edit selected custom tuning"
                        @click="openEditCustomTuning"
                    >
                        <Pencil :size="16" />
                    </button>
                </div>
            </div>
        </div>
        <DialogTuningEditor
            v-if="isEditingCustomTuning"
            :model-value="draftTuning"
            :show-delete="isEditingExistingCustomTuning"
            :mode="tuningEditorMode"
            @save="onSaveCustomTuning"
            @cancel="isEditingCustomTuning = false"
            @delete="onDeleteCustomTuning"
        />

        <div class="flex items-center justify-center flex-col mt-10">
            <Logo></Logo>

            <span class="text-sm mb-4">
                made by
                <a
                    class="text-indigo-500"
                    target="_blank"
                    href="https://github.com/harmendv"
                    >harmendv</a
                >
            </span>

            <ThemeToggle></ThemeToggle>
        </div>
    </div>
</template>
