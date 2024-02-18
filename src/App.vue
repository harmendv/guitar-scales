<template>
    <div class="view">
        <div
            class="fixed"
            v-if="breakpoints.greaterOrEqual.lg"
        >
            <lv-theme-toggle
                class="theme-toggle"
                v-model="theme"
            ></lv-theme-toggle>
        </div>

        <lv-flex
            align-items="center"
            justify-content="center"
            direction="column"
            v-space-after="2"
        >
            <img
                src="/logo.svg"
                alt=""
                width="200"
            />
            <span>
                made by
                <a
                    class="link"
                    target="_blank"
                    href="https://github.com/harmendv"
                    >harmendv</a
                >
            </span>
        </lv-flex>

        <lv-flex
            align-items="start"
            justify-content="center"
            direction="column"
            v-space-after="1"
        >
            <lv-heading
                as="span"
                inline
                level="5"
                >{{ title }}</lv-heading
            >
        </lv-flex>

        <vue-fretboard
            :strings="JSON.parse(tuning)"
            :scale-notes="scaleNotes"
            :frets="20"
            :chord-root="chordRoot"
            :chord-notes="chordNotes"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            v-space-after="2"
        />

        <lv-fieldset legend="Diatonic Chords">
            <vue-chords
                :chords="chords"
                :active="chord"
                v-space-after="2"
                @click-chord="onClickChord"
            ></vue-chords>
        </lv-fieldset>

        <div
            v-space-after="1"
            class="options"
        >
            <lv-grid
                v-space-after="1"
                gap="1.5rem"
            >
                <lv-grid-row gap="1.5rem">
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Root">
                            <lv-select
                                v-model="note"
                                :options="notes"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Scale">
                            <lv-select
                                v-model="scale"
                                :options="scales"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Mode">
                            <lv-select
                                v-model="mode"
                                :options="modes"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                </lv-grid-row>
                <lv-grid-row gap="1.5rem">
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Note Names">
                            <lv-select
                                v-model="noteNames"
                                :options="noteNamesOptions"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Notes visibility">
                            <lv-select
                                v-model="noteVisibility"
                                :options="noteVisibilityOptions"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                    <lv-grid-column
                        :width="4"
                        :md="12"
                    >
                        <lv-fieldset legend="Tuning">
                            <lv-select
                                v-model="tuning"
                                :options="tuningOptions"
                                :clearable="false"
                            ></lv-select>
                        </lv-fieldset>
                    </lv-grid-column>
                </lv-grid-row>
            </lv-grid>
        </div>

        <lv-flex
            align-items="center"
            justify-content="center"
            direction="row"
            v-if="!breakpoints.greaterOrEqual.lg"
        >
            <lv-theme-toggle
                class="theme-toggle"
                v-model="theme"
            ></lv-theme-toggle>
            toggle dark/light
        </lv-flex>
    </div>
</template>

<script>
import {
    LvSelect,
    LvFlex,
    LvCheckbox,
    LvFieldset,
    LvThemeToggle,
    LvCard,
    LvHeading,
    useBreakpoints,
    LvDrawer,
    LvButton,
    LvIcon,
    LvGrid,
    LvGridRow,
    LvGridColumn,
    LvSlider,
    LvSpinner,
} from "@libvue/core";
import { useUrlSearchParams } from "@vueuse/core";
import VueFretboard from "./components/VueFretboard.vue";
import VueChords from "./components/VueChords.vue";
import { scales, scalesFlatMap } from "./utils/scales.js";
import { notes, getNoteByOffset } from "./utils/notes.js";
import { chordsByPrimaryAbbreviation } from './utils/chords.js';

const params = useUrlSearchParams("history");

export default {
    setup() {
        const { breakpoints } = useBreakpoints();
        return {
            breakpoints,
        };
    },
    components: {
        LvButton,
        LvCard,
        LvCheckbox,
        LvDrawer,
        LvFieldset,
        LvFlex,
        LvGrid,
        LvHeading,
        LvGridColumn,
        LvGridRow,
        LvIcon,
        LvSelect,
        LvSlider,
        LvSpinner,
        LvThemeToggle,
        VueChords,
        VueFretboard,
    },
    data() {
        return {
            showFilters: false,
            theme: this.preferredColorScheme(),
            note: params.note || "C",
            scale: params.scale || "major",
            mode: Number.parseInt(params.mode, 10) || 1,
            chord: Number.parseInt(params.chord, 10) || null,
            tuning: params.tuning || JSON.stringify(["E", "A", "D", "G", "B", "E"]),
            noteNames: params.noteNames || "notes",
            noteVisibility: params.noteVisibility || "all",
            noteNamesOptions: [
                { label: "Scale and chord Degrees", value: "degrees" },
                { label: "Scale Notes", value: "notes" },
            ],
            noteVisibilityOptions: [
                { label: "All Notes", value: "all" },
                { label: "Only Scale Notes", value: "only-scale" },
            ],
            tuningOptions: [
                { label: "Default", value: JSON.stringify(["E", "A", "D", "G", "B", "E"]) },
                { label: "Drop-C", value: JSON.stringify(["C", "G", "C", "F", "A", "D"]) },
                { label: "Drop-D", value: JSON.stringify(["D", "A", "D", "G", "B", "E"]) },
                { label: "Open C", value: JSON.stringify(["C", "G", "C", "G", "C", "E"]) },
                { label: "Open D", value: JSON.stringify(["D", "A", "D", "F♯", "A", "D"]) },
                { label: "Open E", value: JSON.stringify(["E", "B", "E", "G♯", "B", "E"]) },
                { label: "Open G", value: JSON.stringify(["D", "G", "D", "G", "B", "D"]) },
                { label: "DAD-GAD", value: JSON.stringify(["D", "A", "D", "G", "A", "D"]) },
                { label: "B standard", value: JSON.stringify(["B", "E", "A", "D", "F♯", "B"]) },
                { label: "Ukelele", value: JSON.stringify(["G", "C", "E", "A"]) },
            ],
        };
    },
    mounted() {
        if (localStorage.getItem("theme")) {
            this.theme = localStorage.getItem("theme");
            document.body.setAttribute("data-theme", this.theme);
        }
    },
    watch: {
        theme(val) {
            document.body.setAttribute("data-theme", val);
            localStorage.setItem("theme", val);
        },
        note: {
            handler(value) {
                params.note = value;
            },
        },
        tuning: {
            handler(value) {
                params.tuning = value;
            },
        },
        noteNames: {
            handler(value) {
                params.noteNames = value;
            },
        },
        noteVisibility: {
            handler(value) {
                params.noteVisibility = value;
            },
        },
        scale: {
            handler(value) {
                this.mode = 1;
                params.scale = value;
            },
        },
        chord: {
            handler(value) {
                params.chord = value;
            },
        },
        mode: {
            handler(value) {
                this.chord = null;
                params.mode = value;
            },
        },
    },
    computed: {
        title() {
            let title = `Scale: ${this.note}-${this.scale}`;
            if(this.mode > 1) {
                title += ` (${this.modes[this.mode - 1].label})`
            }
            if(this.chord) {
                title += ` / chord: ${this.chordRoot}${this.chordExtension}`
            }
            return title;
        },
        chordRoot() {
            return this.chords[this.chord - 1]?.note ?? null;
        },
        chordExtension() {
            return this.chords[this.chord - 1]?.chord ?? null;
        },
        chordNotes() {
            if(!this.chord || !this.scaleNotes || !this.chordIntervals) return {};

            const scaleIndex = scalesFlatMap.indexOf(this.scale);
            const scaleFormula = scales[scaleIndex].formula;
            const scaleFormulaLength = scaleFormula.length;
            const chordTones = {};

            const chordToneIndexes = [
                this.chord - 1,
                this.chord - 1 + 2,
                this.chord - 1 + 4,
                scaleFormulaLength === 6 ? this.chord - 1 + 5 : this.chord - 1 + 6,
            ];

            chordToneIndexes.forEach((index, iterator) => {
                if(index >= scaleFormulaLength) {
                    chordTones[this.scaleNotes[index - scaleFormulaLength].note] = {
                        ...this.scaleNotes[index - scaleFormulaLength],
                        interval: this.chordIntervals[iterator]
                    };
                } else {
                    chordTones[this.scaleNotes[index].note] = {
                        ...this.scaleNotes[index],
                        interval: this.chordIntervals[iterator]
                    };
                }
            })

            return chordTones;
        },
        chordIntervals() {
            return chordsByPrimaryAbbreviation[this.chordExtension]?.intervals ?? null;
        },
        scales() {
            const options = [];
            scales.forEach((scale) => {
                options.push({ label: scale.name, value: scale.slug });
            });
            return options;
        },
        selectedScaleIndex() {
            return scalesFlatMap.indexOf(this.scale);
        },
        notes() {
            const options = [];
            notes.forEach((note) => {
                options.push({ label: note.name, value: note.name });
            });
            return options;
        },
        chords() {
            const chords = [];
            const formula = scales[this.selectedScaleIndex].formula;
            formula.forEach((entry, index) => {
                // Get the corresponding note from computed notes();
                const note = this.scaleNotes[index].note;

                chords.push({
                    note,
                    chord: entry.chord,
                    degree: entry.degree,
                });
            });
            return chords;
        },
        modes() {
            const options = [];
            const formula = scales[this.selectedScaleIndex].formula;
            formula.forEach((entry) => {
                options.push({ label: entry.mode, value: entry.id });
            });
            return options;
        },
        scaleNotes() {
            const scaleNotes = [];
            const scaleIndex = scalesFlatMap.indexOf(this.scale);
            const scaleFormula = scales[scaleIndex].formula;
            const scaleFormulaLength = scaleFormula.length;
            // Calculate the extra note offset caused by the mode
            const modeOffset = scales[scaleIndex].formula[this.mode - 1].chromatic - 1;
            for (let i = 0; i < scaleFormulaLength; i++) {
                const note = getNoteByOffset(
                    `${this.note}`,
                    scaleFormula[i].chromatic - 1 + (12 - modeOffset)
                );
                scaleNotes.push({
                    note: note,
                    degree: scaleFormula[i].degree,
                });
            }
            return scaleNotes;
        },
    },
    methods: {
        preferredColorScheme() {
            if (
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
                return "dark";
            }
            return "light";
        },
        onClickChord(index) {
            if(this.chord === index) {
                this.chord = null;
            } else {
                this.chord = index;
            }
        }
    },
};
</script>

<style lang="scss">
.fixed {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 10;
}

.view {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.link {
    color: var(--color-primary);
}
</style>
