<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useUrlSearchParams } from "@vueuse/core";
import { scales, scalesFlatMap } from "@/composables/useScales";
import { tunings } from "@/composables/useTunings";
import { notes as baseNotes, getScaleNotes } from "@/composables/useNotes";
import {
    chordsByPrimaryAbbreviation,
    getChordIntervals,
    getChordNotes,
    useDiatonicChords,
} from "@/composables/useChords";
import { Fretboard } from "@/components/ui/fretboard";
import { Logo } from "@/components/ui/logo";

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

const note = ref<string>((params.note as string) || "C");
const scale = ref<string>((params.scale as string) || "major");
const mode = ref<number>(Number.parseInt(params.mode as string, 10) || 1);
const chord = ref<number | null>(
    params.chord ? Number.parseInt(params.chord as string, 10) : null
);
// Find initial tuning object by value, fallback to default
const initialTuning =
    tunings.find((t) => t.value === params.tuning) || tunings[0];
const tuning = ref(initialTuning);
const noteNames = ref<string>((params.noteNames as string) || "notes");
const noteVisibility = ref<string>((params.noteVisibility as string) || "all");

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
watch(tuning, (v) => (params.tuning = v.value)); // store kebab-case value
watch(noteNames, (v) => (params.noteNames = v));
watch(noteVisibility, (v) => (params.noteVisibility = v));

function onClickChord(index: number) {
    if (chord.value === index + 1) {
        chord.value = null;
    } else {
        chord.value = index + 1;
    }
}
</script>

<template>
    <div class="w-full max-w-[1300px] mx-auto flex flex-col">
        <Label class="mb-4">{{ title }}</Label>

        <Fretboard
            :strings="tuning.data"
            :scale-notes="scaleNotes"
            :frets="20"
            :chord-root="chordRoot"
            :chord-notes="chordNotes"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            class="mb-8"
        />

        <Label class="mb-4">Diatonic Chords</Label>
        <div class="grid grid-cols-4 md:flex w-full gap-6 mb-8">
            <ChordButton v-for="(chord, index) in chords" :active="activeChord === index + 1" :note="chord.note" :chord="chord.chord" @click="onClickChord(index)" />
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
                <Select v-model="tuning">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="option in tunings"
                            :value="option"
                            :key="option.value"
                        >
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

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
