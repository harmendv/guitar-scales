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
            <span v-space-after="1">
                made by
                <a
                    class="link"
                    target="_blank"
                    href="https://github.com/harmendv"
                >harmendv</a
                >
            </span >
        </lv-flex>

        <vue-fretboard
            :strings="JSON.parse(tuning)"
            :highlight="highlight"
            :frets="20"
            :chord-tone-root="chordToneRoot"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            v-space-after="2"
        />

        <lv-fieldset legend="Chords">
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
            noteNames: params.noteNames || "degrees",
            noteVisibility: params.noteVisibility || "only-scale",
            noteNamesOptions: [
                { label: "Scale Degrees", value: "degrees" },
                { label: "Scale Notes", value: "notes" },
            ],
            noteVisibilityOptions: [
                { label: "All Notes", value: "all" },
                { label: "Only Scale Notes", value: "only-scale" },
            ],
            tuningOptions: [
                { label: "EADGBE (Guitar)", value: JSON.stringify(["E", "A", "D", "G", "B", "E"]) },
                { label: "GCEA (Ukelele)", value: JSON.stringify(["G", "C", "E", "A"]) },
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
        chordToneRoot() {
            return this.chords[this.chord - 1]?.note ?? null;
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
                const note = this.highlight[index].note;

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
        highlight() {
            const highlight = [];
            const scaleIndex = scalesFlatMap.indexOf(this.scale);
            const scaleFormula = scales[scaleIndex].formula;
            const scaleFormulaLength = scaleFormula.length;
            // Calculate the extra note offset caused by the mode
            const modeOffset = scales[scaleIndex].formula[this.mode - 1].chromatic - 1;
            for (let i = 0; i < scaleFormulaLength; i++) {
                highlight.push({
                    note: getNoteByOffset(
                        `${this.note}`,
                        scaleFormula[i].chromatic - 1 + (12 - modeOffset)
                    ),
                    degree: scaleFormula[i].degree,
                });
            }
            // Now that we have prepared all highlight notes, create a proxy and
            // add the chord tones
            if (this.chord !== null) {
                const highlightProxy = new Proxy(highlight, {
                    get(target, prop) {
                        if (!isNaN(prop)) {
                            prop = parseInt(prop, 10);
                            if (prop < 0) {
                                prop += target.length;
                            } else if (prop >= target.length) {
                                prop -= target.length;
                            }
                        }
                        return target[prop];
                    }
                });
                // Set root to chordTone
                highlightProxy[this.chord - 1]['chordTone'] = true;
                highlightProxy[this.chord - 1 + 2]['chordTone'] = true;
                highlightProxy[this.chord - 1 + 4]['chordTone'] = true;
                highlightProxy[this.chord - 1 + 6]['chordTone'] = true;
            }


            return highlight;
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
