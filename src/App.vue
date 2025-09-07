<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import VueFretboard from './components/VueFretboard.vue';
import VueChords from './components/VueChords.vue';
import { scales, scalesFlatMap } from './utils/scales.js';
import { notes as baseNotes, getNoteByOffset } from './utils/notes.js';
import { chordsByPrimaryAbbreviation } from './utils/chords.js';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'


// URL search params (reactive)
const params = useUrlSearchParams('history');

// Helper
function preferredColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// State refs
const theme = ref<string>((localStorage.getItem('theme') as string) || preferredColorScheme());
const note = ref<string>((params.note as string) || 'C');
const scale = ref<string>((params.scale as string) || 'major');
const mode = ref<number>(Number.parseInt(params.mode as string, 10) || 1);
const chord = ref<number | null>(params.chord ? Number.parseInt(params.chord as string, 10) : null);
const tuning = ref<string>((params.tuning as string) || JSON.stringify(['E', 'A', 'D', 'G', 'B', 'E']));
const noteNames = ref<string>((params.noteNames as string) || 'notes');
const noteVisibility = ref<string>((params.noteVisibility as string) || 'all');

const noteNamesOptions = [
    { label: 'Scale and chord Degrees', value: 'degrees' },
    { label: 'Scale Notes', value: 'notes' }
];
const noteVisibilityOptions = [
    { label: 'All Notes', value: 'all' },
    { label: 'Only Scale Notes', value: 'only-scale' }
];
const tuningOptions = [
    { label: 'Default', value: JSON.stringify(['E', 'A', 'D', 'G', 'B', 'E']) },
    { label: 'Drop-C', value: JSON.stringify(['C', 'G', 'C', 'F', 'A', 'D']) },
    { label: 'Drop-D', value: JSON.stringify(['D', 'A', 'D', 'G', 'B', 'E']) },
    { label: 'Open C', value: JSON.stringify(['C', 'G', 'C', 'G', 'C', 'E']) },
    { label: 'Open D', value: JSON.stringify(['D', 'A', 'D', 'F♯', 'A', 'D']) },
    { label: 'Open E', value: JSON.stringify(['E', 'B', 'E', 'G♯', 'B', 'E']) },
    { label: 'Open G', value: JSON.stringify(['D', 'G', 'D', 'G', 'B', 'D']) },
    { label: 'DAD-GAD', value: JSON.stringify(['D', 'A', 'D', 'G', 'A', 'D']) },
    { label: 'B standard', value: JSON.stringify(['B', 'E', 'A', 'D', 'F♯', 'B']) },
    { label: 'Ukelele', value: JSON.stringify(['G', 'C', 'E', 'A']) }
];

// Derived option lists
const scalesOptions = computed(() =>
    scales.map(s => ({ label: s.name, value: s.slug }))
);
const notesOptions = computed(() =>
    baseNotes.map(n => ({ label: n.name, value: n.name }))
);

const selectedScaleIndex = computed(() => scalesFlatMap.indexOf(scale.value));

// Adjusted scaleNotes (assert note string)
const scaleNotes = computed(() => {
    const arr: { note: string; degree: string }[] = [];
    const idx = selectedScaleIndex.value;
    if (idx < 0) return arr;
    const scaleFormula = scales[idx].formula;
    const scaleFormulaLength = scaleFormula.length;
    const modeOffset = scaleFormula[mode.value - 1].chromatic - 1;
    for (let i = 0; i < scaleFormulaLength; i++) {
        const n = getNoteByOffset(`${note.value}`, scaleFormula[i].chromatic - 1 + (12 - modeOffset)) as string;
        arr.push({ note: n, degree: scaleFormula[i].degree });
    }
    return arr;
});

const chords = computed(() => {
    const list: { note: string; chord: string; degree: string }[] = [];
    const idx = selectedScaleIndex.value;
    if (idx < 0) return list;
    const formula = scales[idx].formula;
    formula.forEach((entry, index) => {
        const n = scaleNotes.value[index]?.note;
        list.push({ note: n, chord: entry.chord, degree: entry.degree });
    });
    return list;
});

// Refined chordRoot/Extension types (no null => undefined)
const chordRoot = computed<string | number | undefined>(() => (chord.value ? chords.value[chord.value - 1]?.note : undefined));
const chordExtension = computed<string | number | undefined>(() => (chord.value ? chords.value[chord.value - 1]?.chord : undefined));

// Safe map cast for intervals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chordsMap = chordsByPrimaryAbbreviation as Record<string, { intervals: string[] }>;
const chordIntervals = computed<string[] | null>(() => (chordExtension.value ? chordsMap[String(chordExtension.value)]?.intervals ?? null : null));

const chordNotes = computed(() => {
    if (!chord.value || !scaleNotes.value.length || !chordIntervals.value) return {} as Record<string, any>;
    const idx = selectedScaleIndex.value;
    if (idx < 0) return {};
    const scaleFormula = scales[idx].formula;
    const scaleFormulaLength = scaleFormula.length;
    const chordTones: Record<string, any> = {};
    const chordToneIndexes = [
        chord.value - 1,
        chord.value - 1 + 2,
        chord.value - 1 + 4,
        scaleFormulaLength === 6 ? chord.value - 1 + 5 : chord.value - 1 + 6
    ];
    chordToneIndexes.forEach((i, iterator) => {
        if (i >= scaleFormulaLength) {
            const refIndex = i - scaleFormulaLength;
            chordTones[scaleNotes.value[refIndex].note] = {
                ...scaleNotes.value[refIndex],
                interval: chordIntervals.value?.[iterator]
            };
        } else {
            chordTones[scaleNotes.value[i].note] = {
                ...scaleNotes.value[i],
                interval: chordIntervals.value?.[iterator]
            };
        }
    });
    return chordTones;
});

const modes = computed(() => {
    const opts: { label: string; value: number }[] = [];
    const idx = selectedScaleIndex.value;
    if (idx < 0) return opts;
    const formula = scales[idx].formula;
    formula.forEach(entry => opts.push({ label: entry.mode, value: entry.id }));
    return opts;
});

const title = computed(() => {
    let t = `Scale: ${note.value}-${scale.value}`;
    if (mode.value > 1 && modes.value[mode.value - 1]) {
        t += ` (${modes.value[mode.value - 1].label})`;
    }
    if (chord.value) {
        t += ` / chord: ${chordRoot.value ?? ''}${chordExtension.value ?? ''}`;
    }
    return t;
});

// Active value for chords component (exclude null)
const activeChord = computed<number | undefined>(() => (chord.value == null ? undefined : chord.value));

// Watchers syncing to URL params
watch(note, v => (params.note = v));
watch(scale, v => { mode.value = 1; params.scale = v; });
watch(mode, v => { chord.value = null; params.mode = v as any; });
watch(chord, v => (params.chord = v as any));
watch(tuning, v => (params.tuning = v));
watch(noteNames, v => (params.noteNames = v));
watch(noteVisibility, v => (params.noteVisibility = v));

watch(theme, v => {
    document.body.setAttribute('data-theme', v);
    localStorage.setItem('theme', v);
});

onMounted(() => {
    document.body.setAttribute('data-theme', theme.value);
});

function onClickChord(index: number) {
    if (chord.value === index) {
        chord.value = null;
    } else {
        chord.value = index;
    }
}
</script>

<template>
    <div class="w-full max-w-[1200px] mx-auto flex flex-col">
        <div class="flex items-center justify-center flex-col mb-4">
            <img src="/logo.svg" alt="" width="200" />
            <span>
                made by
                <a class="link" target="_blank" href="https://github.com/harmendv">harmendv</a>
            </span>
        </div>

        <div class="flex items-center justify-center flex-col mb-2 text-xl font-bold text-indigo-500">
            {{ title }}
        </div>

        <vue-fretboard
            :strings="JSON.parse(tuning)"
            :scale-notes="scaleNotes"
            :frets="20"
            :chord-root="chordRoot"
            :chord-notes="chordNotes"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            class="mb-4"
        />

        <vue-chords
            :chords="chords"
            :active="activeChord"
            class="mb-4 w-full"
            @click-chord="onClickChord"
        ></vue-chords>

        <div class="mb-2 grid grid-cols-3 gap-4">
            <div>
                Root
                <Select v-model="note">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in notesOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                Scale
                <Select v-model="scale">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in scalesOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                Mode
                <Select v-model="mode">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in modes" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                Note names
                <Select v-model="noteNames">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in noteNamesOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                Notes visibility
                <Select v-model="noteVisibility">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in noteVisibilityOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                Tuning
                <Select v-model="tuning">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="Make a selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="option in tuningOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

        </div>

    </div>
</template>
