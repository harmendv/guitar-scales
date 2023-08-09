<template>
    <div class="view">

        <div class="fixed" v-if="breakpoints.greaterOrEqual.lg">
            <lv-theme-toggle class="theme-toggle" v-model="theme"></lv-theme-toggle>
        </div>

        <vue-fretboard
            :strings="strings"
            :highlight="highlight"
            :frets="frets"
            :show-degrees="showDegrees"
            :degrees="degrees"
            :root="note"
            :show-rest="showRest"
            v-space-after="2"
        />
        <div class="options">
            <lv-fieldset label="Scale" v-space-after="1">
                <lv-flex fill>
                    <lv-select v-model="note" :options="notes" :clearable="false"></lv-select>
                    <lv-select v-model="scale" :options="scales" :clearable="false"></lv-select>
                    <lv-select v-model="mode" :options="modes" :clearable="false"></lv-select>
                </lv-flex>
            </lv-fieldset>
            <lv-fieldset label="Options" v-space-after="1">
                <lv-flex fill>
                    <lv-select v-model="showDegrees" :options="showDegreesOptions" :clearable="false"></lv-select>
                    <lv-select v-model="showRest" :options="showRestOptions" :clearable="false"></lv-select>
                </lv-flex>
            </lv-fieldset>
            <lv-fieldset label="Degrees">
                <lv-card>
                    <lv-flex>
                        <lv-checkbox label="1st" v-model="degrees['1']" :disabled="!availableDegrees.includes(1)"/>
                        <lv-checkbox label="2nd" v-model="degrees['2']" :disabled="!availableDegrees.includes(2)"/>
                        <lv-checkbox label="3rd" v-model="degrees['3']" :disabled="!availableDegrees.includes(3)"/>
                        <lv-checkbox label="4th" v-model="degrees['4']" :disabled="!availableDegrees.includes(4)"/>
                        <lv-checkbox label="5th" v-model="degrees['5']" :disabled="!availableDegrees.includes(5)"/>
                        <lv-checkbox label="6th" v-model="degrees['6']" :disabled="!availableDegrees.includes(6)"/>
                        <lv-checkbox label="7th" v-model="degrees['7']" :disabled="!availableDegrees.includes(7)"/>
                    </lv-flex>
                </lv-card>
            </lv-fieldset>
        </div>
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
    breakpointMixin,
    LvDrawer,
    LvButton,
    LvIcon
} from '@libvue/core';
import { useUrlSearchParams } from "@vueuse/core";
import VueFretboard from "./components/VueFretboard.vue";
import { scales, scalesFlatMap } from "./utils/scales.js";
import { notes, getNoteByOffset } from "./utils/notes.js";

const params = useUrlSearchParams('history');

export default {
    mixins: [breakpointMixin],
    components: {
        LvIcon,
        VueFretboard,
        LvCheckbox,
        LvSelect,
        LvFlex,
        LvFieldset,
        LvThemeToggle,
        LvCard,
        LvDrawer,
        LvButton,
    },
    data() {
        return {
            showFilters: false,
            theme: this.preferredColorScheme(),
            strings: ['E', 'A', 'D', 'G', 'B', 'E'],
            frets: 19,
            note: params.note || 'C',
            scale: params.scale || 'major',
            mode: Number.parseInt(params.mode, 10) || 1,
            showDegrees: params.showDegrees || 'false',
            degrees: params.degrees ? (JSON.parse(decodeURIComponent(params.degrees))) : ({
                '1': true,
                '2': true,
                '3': true,
                '4': true,
                '5': true,
                '6': true,
                '7': true,
            }),
            showRest: params.showRest || 'true',
            showDegreesOptions: [
                {label: 'Show Scale Degrees', value: 'true'},
                {label: 'Show Scale Notes', value: 'false'}
            ],
            showRestOptions: [
                {label: 'All Notes', value: 'true'},
                {label: 'Only Scale Notes', value: 'false'}
            ]
        }
    },
    mounted() {
        if (localStorage.getItem('theme')) {
            this.theme = localStorage.getItem('theme');
            document.body.setAttribute('data-theme', this.theme);
        }
    },
    watch: {
        theme(val) {
            document.body.setAttribute('data-theme', val);
            localStorage.setItem('theme', val);
        },
        note: {
            handler(value) {
                params.note = value;
            },
        },
        showDegrees: {
            handler(value) {
                params.showDegrees = value;
            },
        },
        showRest: {
            handler(value) {
                params.showRest = value;
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
        degrees: {
            handler(value) {
                params.degrees = JSON.stringify(value);
            },
            deep: true,
        }
    },
    computed: {
        scales() {
            const options = [];
            scales.forEach((scale) => {
                options.push({label: scale.name, value: scale.slug})
            })
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
                options.push({label: note.name, value: note.name})
            })
            return options;
        },
        modes() {
            const options = [];
            const formula = scales[this.selectedScaleIndex].formula;
            formula.forEach((entry) => {
                options.push({label: entry.mode, value: entry.degree})
            })
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
                    note: getNoteByOffset(`${this.note}`, scaleFormula[i].chromatic - 1 + (12 - modeOffset)),
                    degree: scaleFormula[i].degree
                })
            }
            return highlight;
        },
        availableDegrees() {
            return this.highlight.flatMap((i) => i.degree)
        }
    },
    methods: {
        preferredColorScheme() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        },
    }
}
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
    min-width: 490px;
    display: flex;
    flex-direction: column;
    &--mobile {
        flex-direction: row;
    }
}
.mobile-button {
    position: fixed;
    left: 0;
    top: 0;
    border-radius: 0;
}
</style>
