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



        <vue-fretboard
            :strings="strings"
            :highlight="highlight"
            :frets="frets"
            :show-degrees="noteNames === 'degrees'"
            :root="note"
            :show-rest="noteVisibility === 'all'"
            v-space-after="2"
        />

        <lv-fieldset legend="Chords">
            <vue-chords
                :chords="chords"
                v-space-after="2"
            ></vue-chords>
        </lv-fieldset>

        <div v-space-after="3" class="options">
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
                        <lv-fieldset :legend="`Number of frets (${frets})`">
                            <lv-slider
                                :min="6"
                                :max="19"
                                :step="1"
                                v-model="frets"
                                realtime-update
                            ></lv-slider>
                        </lv-fieldset>
                    </lv-grid-column>
                </lv-grid-row>
            </lv-grid>
        </div>

      <lv-flex align-items="center" justify-content="center" direction="column">
        <img
          src="/logo.svg"
          alt=""
          width="200"
        />
        <span>made by <a class="link" target="_blank" href="https://github.com/harmendv">harmendv</a></span>
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
            strings: ["E", "A", "D", "G", "B", "E"],
            frets: Number.parseInt(params.frets, 10) || 15,
            note: params.note || "C",
            scale: params.scale || "major",
            mode: Number.parseInt(params.mode, 10) || 1,
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
        frets: {
            handler(value) {
                params.frets = value;
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
        mode: {
            handler(value) {
                params.mode = value;
            },
        },
    },
    computed: {
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
        selectedModeOffset() {
            return scales[this.selectedScaleIndex].formula[this.mode].chromatic;
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
            const modeOffset =
                scales[scaleIndex].formula[this.mode - 1].chromatic - 1;
            for (let i = 0; i < scaleFormulaLength; i++) {
                highlight.push({
                    note: getNoteByOffset(
                        `${this.note}`,
                        scaleFormula[i].chromatic - 1 + (12 - modeOffset)
                    ),
                    degree: scaleFormula[i].degree,
                });
            }
            return highlight;
        },
        availableDegrees() {
            return this.highlight.flatMap((i) => i.degree);
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
    max-width: 980px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.link {
  color: var(--color-primary);
}
</style>
