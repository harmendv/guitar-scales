<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useUrlSearchParams } from "@vueuse/core";
import { scales, scalesFlatMap } from "@/composables/useScales";
import { tunings } from "@/composables/useTunings";
import { notes as baseNotes, getNoteByOffset, getScaleNotes } from "@/composables/useNotes";
import { chordsByPrimaryAbbreviation, getChordIntervals, getChordNotes, useDiatonicChords } from "@/composables/useChords";

import VueFretboard from "./components/VueFretboard.vue";
import VueChords from "./components/VueChords.vue";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// URL search params (reactive)
const params = useUrlSearchParams("history");


// Helper
function preferredColorScheme() {
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    }
    return "light";
}

// State refs
const theme = ref<string>(
    (localStorage.getItem("theme") as string) || preferredColorScheme()
);
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

watch(theme, (v) => {
    document.body.setAttribute("data-theme", v);
    localStorage.setItem("theme", v);
});

onMounted(() => {
    document.body.setAttribute("data-theme", theme.value);
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
    <div class="w-full max-w-[1300px] mx-auto flex flex-col">
        <Label class="mb-4">{{ title }}</Label>

        <vue-fretboard
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
        <vue-chords
            :chords="chords"
            :active="activeChord"
            class="mb-8 w-full"
            @click-chord="onClickChord"
        ></vue-chords>

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
            <svg
                width="200"
                viewBox="0 0 339 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M157.409 0C155.778 0 154.343 0.875374 153.42 2.10779C152.498 3.3402 152.001 4.91566 152.001 6.61707C151.999 16.2101 152.001 25.7994 152.001 35.3832C152.001 43.3547 158.014 49.7576 164.981 49.7576H173.228C180.218 49.7576 186.614 43.281 186.614 35.2449C186.614 25.7023 186.614 16.1597 186.614 6.61707C186.614 4.91566 186.117 3.3402 185.194 2.10779C184.271 0.875374 182.836 0 181.206 0C179.575 0 178.123 0.875374 177.2 2.10779C176.277 3.3402 175.797 4.91566 175.797 6.61707V12.7849C175.068 12.3866 174.25 12.1457 173.364 12.1457C171.728 12.1457 170.301 12.9147 169.29 14.1153C168.29 12.9332 166.884 12.163 165.251 12.163C164.358 12.163 163.544 12.4019 162.817 12.8022V6.61707C162.817 4.91566 162.321 3.3402 161.398 2.10779C160.475 0.875374 159.04 0 157.409 0V0ZM157.409 3.31717C157.951 3.31717 158.402 3.5426 158.829 4.11191C159.255 4.68123 159.572 5.58142 159.572 6.61707C159.571 11.9701 159.572 17.3249 159.572 22.6673H157.95C156.986 22.6673 156.063 22.8844 155.246 23.272V6.61707C155.246 5.58142 155.563 4.68123 155.989 4.11191C156.416 3.5426 156.867 3.31717 157.409 3.31717ZM181.206 3.31717C181.748 3.31717 182.199 3.5426 182.625 4.11191C183.052 4.68123 183.369 5.58142 183.369 6.61707C183.369 16.1597 183.369 25.7023 183.369 35.2449C183.369 41.4414 178.189 46.4404 173.228 46.4404H164.981C159.997 46.4404 155.246 41.644 155.246 35.3832C155.246 32.9919 155.246 30.5779 155.246 28.196C155.246 27.0298 156.217 25.9845 157.95 25.9845C161.041 26.0077 164.04 25.9845 167.144 25.9845C168.877 25.9845 169.848 27.0298 169.848 28.196C169.848 29.2164 169.099 30.1568 167.752 30.3728C165.805 30.4658 163.732 30.4071 161.736 30.4071C160.879 30.395 160.09 31.1894 160.09 32.0657C160.09 32.9421 160.879 33.7367 161.736 33.7243C163.702 33.7381 165.669 33.7055 167.634 33.7243C167.742 33.8275 167.944 34.0936 168.124 34.5017C168.485 35.3182 168.767 36.6664 168.767 38.1472C168.754 39.0234 169.532 39.8294 170.389 39.8294C171.246 39.8294 172.024 39.0234 172.012 38.1472C172.012 36.2614 171.698 34.5311 171.082 33.1369C170.994 32.9386 170.897 32.7519 170.795 32.5667C171.005 32.4149 171.199 32.2423 171.386 32.0657C172.763 32.0541 174.308 31.7364 175.747 31.0463C177.37 30.2676 179.042 28.762 179.042 26.5371C179.024 19.8779 179.042 13.2831 179.042 6.61683C179.042 5.58119 179.36 4.68099 179.786 4.11167C180.212 3.54236 180.663 3.31694 181.206 3.31694V3.31717ZM173.364 15.4629C174.587 15.4629 175.797 16.7345 175.797 18.6764V26.5374C175.797 27.0738 175.408 27.5461 174.378 28.0404C173.991 28.2258 173.534 28.3745 173.076 28.4896C173.082 28.3935 173.093 28.2935 173.093 28.196C173.093 26.4568 172.238 24.9487 170.93 23.9458C170.931 22.1049 170.93 20.2621 170.93 18.6764C170.93 16.7345 172.14 15.4629 173.364 15.4629V15.4629ZM165.251 15.4801C166.422 15.4801 167.685 16.8732 167.685 18.7454C167.683 20.0689 167.685 21.3742 167.685 22.7019C166.101 22.6169 164.439 22.6673 162.817 22.6673C162.817 21.3664 162.817 20.0364 162.817 18.7454C162.817 16.8732 164.081 15.4801 165.251 15.4801Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M19.8 22C19.325 21.125 18.6376 20.4625 17.7376 20.0125C16.8626 19.5375 15.825 19.3 14.625 19.3C12.55 19.3 10.8875 19.9875 9.63755 21.3625C8.38755 22.7125 7.76255 24.525 7.76255 26.8C7.76255 29.225 8.41255 31.125 9.71255 32.5C11.0375 33.85 12.85 34.525 15.15 34.525C16.725 34.525 18.0501 34.125 19.1251 33.325C20.225 32.525 21.025 31.375 21.525 29.875H13.3875V25.15H27.3376V31.1125C26.8626 32.7125 26.0501 34.2 24.9001 35.575C23.7751 36.95 22.3376 38.0625 20.5876 38.9125C18.8376 39.7625 16.8625 40.1875 14.6625 40.1875C12.0625 40.1875 9.73755 39.625 7.68755 38.5C5.66255 37.35 4.07505 35.7625 2.92505 33.7375C1.80005 31.7125 1.23755 29.4 1.23755 26.8C1.23755 24.2 1.80005 21.8875 2.92505 19.8625C4.07505 17.8125 5.66255 16.225 7.68755 15.1C9.71255 13.95 12.025 13.375 14.625 13.375C17.775 13.375 20.4251 14.1375 22.5751 15.6625C24.7501 17.1875 26.1875 19.3 26.8876 22H19.8Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M37.1895 13.675V29.425C37.1895 31 37.577 32.2125 38.352 33.0625C39.127 33.9125 40.2645 34.3375 41.7645 34.3375C43.2645 34.3375 44.4145 33.9125 45.2145 33.0625C46.0145 32.2125 46.4145 31 46.4145 29.425V13.675H52.827V29.3875C52.827 31.7375 52.327 33.725 51.327 35.35C50.327 36.975 48.977 38.2 47.277 39.025C45.602 39.85 43.727 40.2625 41.652 40.2625C39.577 40.2625 37.7145 39.8625 36.0645 39.0625C34.4395 38.2375 33.152 37.0125 32.202 35.3875C31.252 33.7375 30.777 31.7375 30.777 29.3875V13.675H37.1895Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M63.7424 13.675V40H57.3299V13.675H63.7424Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M87.327 13.675V18.8125H80.352V40H73.9395V18.8125H66.9645V13.675H87.327Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M106.933 35.35H97.1078L95.5328 40H88.8203L98.3453 13.675H105.77L115.295 40H108.508L106.933 35.35ZM105.283 30.4L102.02 20.7625L98.7953 30.4H105.283Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M131.619 40L126.144 30.0625H124.607V40H118.194V13.675H128.957C131.032 13.675 132.794 14.0375 134.244 14.7625C135.719 15.4875 136.819 16.4875 137.544 17.7625C138.269 19.0125 138.632 20.4125 138.632 21.9625C138.632 23.7125 138.132 25.275 137.132 26.65C136.157 28.025 134.707 29 132.782 29.575L138.857 40H131.619ZM124.607 25.525H128.582C129.757 25.525 130.632 25.2375 131.207 24.6625C131.807 24.0875 132.107 23.275 132.107 22.225C132.107 21.225 131.807 20.4375 131.207 19.8625C130.632 19.2875 129.757 19 128.582 19H124.607V25.525Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M209.85 40.2625C207.925 40.2625 206.2 39.95 204.675 39.325C203.15 38.7 201.925 37.775 201 36.55C200.1 35.325 199.625 33.85 199.575 32.125H206.4C206.5 33.1 206.838 33.85 207.413 34.375C207.988 34.875 208.738 35.125 209.663 35.125C210.613 35.125 211.363 34.9125 211.913 34.4875C212.463 34.0375 212.738 33.425 212.738 32.65C212.738 32 212.513 31.4625 212.063 31.0375C211.638 30.6125 211.1 30.2625 210.45 29.9875C209.825 29.7125 208.925 29.4 207.75 29.05C206.05 28.525 204.663 28 203.588 27.475C202.513 26.95 201.588 26.175 200.813 25.15C200.038 24.125 199.65 22.7875 199.65 21.1375C199.65 18.6875 200.538 16.775 202.313 15.4C204.088 14 206.4 13.3 209.25 13.3C212.15 13.3 214.488 14 216.263 15.4C218.038 16.775 218.988 18.7 219.113 21.175H212.175C212.125 20.325 211.813 19.6625 211.238 19.1875C210.663 18.6875 209.925 18.4375 209.025 18.4375C208.25 18.4375 207.625 18.65 207.15 19.075C206.675 19.475 206.438 20.0625 206.438 20.8375C206.438 21.6875 206.838 22.35 207.638 22.825C208.438 23.3 209.688 23.8125 211.388 24.3625C213.088 24.9375 214.463 25.4875 215.513 26.0125C216.588 26.5375 217.513 27.3 218.288 28.3C219.063 29.3 219.45 30.5875 219.45 32.1625C219.45 33.6625 219.063 35.025 218.288 36.25C217.538 37.475 216.438 38.45 214.988 39.175C213.538 39.9 211.825 40.2625 209.85 40.2625Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M222.309 26.8C222.309 24.2 222.871 21.8875 223.996 19.8625C225.121 17.8125 226.684 16.225 228.684 15.1C230.709 13.95 232.996 13.375 235.546 13.375C238.671 13.375 241.346 14.2 243.571 15.85C245.796 17.5 247.284 19.75 248.034 22.6H240.984C240.459 21.5 239.709 20.6625 238.734 20.0875C237.784 19.5125 236.696 19.225 235.471 19.225C233.496 19.225 231.896 19.9125 230.671 21.2875C229.446 22.6625 228.834 24.5 228.834 26.8C228.834 29.1 229.446 30.9375 230.671 32.3125C231.896 33.6875 233.496 34.375 235.471 34.375C236.696 34.375 237.784 34.0875 238.734 33.5125C239.709 32.9375 240.459 32.1 240.984 31H248.034C247.284 33.85 245.796 36.1 243.571 37.75C241.346 39.375 238.671 40.1875 235.546 40.1875C232.996 40.1875 230.709 39.625 228.684 38.5C226.684 37.35 225.121 35.7625 223.996 33.7375C222.871 31.7125 222.309 29.4 222.309 26.8Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M268.348 35.35H258.523L256.948 40H250.236L259.761 13.675H267.186L276.711 40H269.923L268.348 35.35ZM266.698 30.4L263.436 20.7625L260.211 30.4H266.698Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M286.022 35.05H294.422V40H279.61V13.675H286.022V35.05Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M303.893 18.8125V24.1375H312.481V29.0875H303.893V34.8625H313.606V40H297.481V13.675H313.606V18.8125H303.893Z"
                    fill="var(--color-indigo-500)"
                />
                <path
                    d="M327.294 40.2625C325.369 40.2625 323.644 39.95 322.119 39.325C320.594 38.7 319.369 37.775 318.444 36.55C317.544 35.325 317.069 33.85 317.019 32.125H323.844C323.944 33.1 324.281 33.85 324.856 34.375C325.431 34.875 326.181 35.125 327.106 35.125C328.056 35.125 328.806 34.9125 329.356 34.4875C329.906 34.0375 330.181 33.425 330.181 32.65C330.181 32 329.956 31.4625 329.506 31.0375C329.081 30.6125 328.544 30.2625 327.894 29.9875C327.269 29.7125 326.369 29.4 325.194 29.05C323.494 28.525 322.106 28 321.031 27.475C319.956 26.95 319.031 26.175 318.256 25.15C317.481 24.125 317.094 22.7875 317.094 21.1375C317.094 18.6875 317.981 16.775 319.756 15.4C321.531 14 323.844 13.3 326.694 13.3C329.594 13.3 331.931 14 333.706 15.4C335.481 16.775 336.431 18.7 336.556 21.175H329.619C329.569 20.325 329.256 19.6625 328.681 19.1875C328.106 18.6875 327.369 18.4375 326.469 18.4375C325.694 18.4375 325.069 18.65 324.594 19.075C324.119 19.475 323.881 20.0625 323.881 20.8375C323.881 21.6875 324.281 22.35 325.081 22.825C325.881 23.3 327.131 23.8125 328.831 24.3625C330.531 24.9375 331.906 25.4875 332.956 26.0125C334.031 26.5375 334.956 27.3 335.731 28.3C336.506 29.3 336.894 30.5875 336.894 32.1625C336.894 33.6625 336.506 35.025 335.731 36.25C334.981 37.475 333.881 38.45 332.431 39.175C330.981 39.9 329.269 40.2625 327.294 40.2625Z"
                    fill="var(--color-indigo-500)"
                />
            </svg>

            <span class="text-sm">
                made by
                <a
                    class="text-indigo-500"
                    target="_blank"
                    href="https://github.com/harmendv"
                    >harmendv</a
                >
            </span>
        </div>
    </div>
</template>
