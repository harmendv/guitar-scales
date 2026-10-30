<script setup lang="ts">
import { computed } from "vue";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCollapsedSection } from "@/composables/useCollapsedSection";
import { Fretboard } from "@/components/ui/fretboard";
import DialogTuningEditor from "@/components/tuning-editor/Dialog.TuningEditor.vue";
import AppHeader from "@/components/app/AppHeader.vue";
import { HarmenDevLogo } from "@/components/ui/harmen-dev-logo";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ChordPanel from "@/components/app/ChordPanel.vue";
import ChordShapes from "@/components/app/ChordShapes.vue";
import ProgressionPanel from "@/components/app/ProgressionPanel.vue";
import PickerBar from "@/components/app/PickerBar.vue";
import ScaleControls from "@/components/app/ScaleControls.vue";
import TuningControls from "@/components/app/TuningControls.vue";
import ViewModeControls from "@/components/app/ViewModeControls.vue";
import { useAppState } from "@/composables/useAppState";
import { useFretboardState } from "@/composables/useFretboardState";

const {
    accidentalPreference,
    canEditSelectedTuning,
    closeCustomTuningEditor,
    draftTuning,
    isEditingCustomTuning,
    isEditingExistingCustomTuning,
    mode,
    note,
    noteNames,
    noteVisibility,
    onDeleteCustomTuning,
    onSaveCustomTuning,
    openCreateCustomTuning,
    openEditCustomTuning,
    positionSpan,
    positionStartFret,
    scale,
    selectedTuningId,
    syncPositionSpan,
    syncPositionStart,
    syncShapeIndex,
    threeNpsShapeIndex,
    tuning,
    tuningEditorMode,
    tuningOptions,
    viewMode,
    selectedChords,
    chordSize,
    activeShape,
    progressionStep,
} = useAppState();

const {
    accidentalPreferenceOptions,
    activePosition,
    chordShapes,
    neckShape,
    positionLabel,
    progressionChord,
    progressions,
    showProgressionStep,
    progressionFilter,
    selectedChordNames,
    showsEveryChord,
    selectShape,
    borrowedChords,
    chordColors,
    chordLegend,
    chordTones,
    chords,
    fretCount,
    heading,
    modeOptions,
    noteNamesOptions,
    noteVisibilityOptions,
    notesOptions,
    playScale,
    positionCount,
    positionStyle,
    resolvedAccidentalPreference,
    rootPitchClass,
    safePositionSpan,
    safePositionStartFret,
    scaleNotes,
    scalesOptions,
    secondaryChords,
    selectPosition,
    setPositionStyle,
    shapeNotesPerString,
    subheading,
    toggleChord,
} = useFretboardState({
    accidentalPreference,
    chordSize,
    mode,
    note,
    positionSpan,
    positionStartFret,
    scale,
    selectedChords,
    syncPositionSpan,
    syncPositionStart,
    syncShapeIndex,
    threeNpsShapeIndex,
    tuning,
    viewMode,
    activeShape,
    progressionStep,
});

const fretboardCollapsed = useCollapsedSection("fretboard");
const tuningCollapsed = useCollapsedSection("tuning");

// Whether any chord fills the neck; a playing progression on its own only rings its chord's notes
const legendFilled = computed(() => chordLegend.value.some((item) => item.color));

const hasOutsideTones = computed(() => Object.values(chordTones.value).some((tone) => tone.outside));
</script>

<template>
    <div class="mx-auto flex w-full max-w-[1300px] flex-col gap-6 px-4 py-8 lg:px-10 lg:py-12">
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2.5">
                <a href="/" aria-label="Guitar Scales home">
                    <Logo class="h-9 w-[1.8rem]" />
                </a>
                <div class="flex flex-col">
                    <a href="/" class="font-display text-xl leading-tight font-bold tracking-tight text-primary">
                        Guitar Scales
                    </a>
                    <a
                        class="group inline-flex w-fit items-center gap-1 text-[11px] leading-tight text-muted-foreground hover:text-foreground"
                        target="_blank"
                        href="https://harmen.dev"
                    >
                        by
                        <HarmenDevLogo class="h-2.5 w-auto text-primary" />
                        <span class="font-medium group-hover:underline underline-offset-2">harmen.dev</span>
                    </a>
                </div>
            </div>

            <ThemeToggle />
        </div>

        <AppHeader
            :heading="heading"
            :subheading="subheading"
            @play="playScale"
        />

        <PickerBar
            v-model:note="note"
            v-model:scale="scale"
            v-model:mode="mode"
            v-model:accidental-preference="accidentalPreference"
            :accidental-preference-options="accidentalPreferenceOptions"
            :mode-options="modeOptions"
            :notes-options="notesOptions"
            :scales-options="scalesOptions"
        />

        <!-- On phones these open as sheets from the bar above instead -->
        <div class="hidden sm:block">
            <ScaleControls
                v-model:note="note"
                v-model:scale="scale"
                v-model:mode="mode"
                v-model:accidental-preference="accidentalPreference"
                :accidental-preference-options="accidentalPreferenceOptions"
                :mode-options="modeOptions"
                :notes-options="notesOptions"
                :scales-options="scalesOptions"
            />
        </div>

        <ChordPanel
            v-model:chord-size="chordSize"
            :selected-chords="selectedChords"
            :chords="chords"
            :secondary-chords="secondaryChords"
            :borrowed-chords="borrowedChords"
            :chord-colors="chordColors"
            @toggle="toggleChord"
        />

        <section>
            <div :class="['flex h-7 items-center', !fretboardCollapsed && 'mb-3']">
                <SectionHeading v-model:collapsed="fretboardCollapsed" title="Fretboard" />
            </div>
            <div v-if="!fretboardCollapsed" class="flex flex-col gap-6">
                <ViewModeControls
                    v-model:note-names="noteNames"
                    v-model:note-visibility="noteVisibility"
                    :active-position="activePosition"
                    :note-names-options="noteNamesOptions"
                    :note-visibility-options="noteVisibilityOptions"
                    :position-count="positionCount"
                    :position-style="positionStyle"
                    :shape-notes-per-string="shapeNotesPerString"
                    @select-position="selectPosition"
                    @set-position-style="setPositionStyle"
                />

                <div>
                    <Fretboard
                        :strings="tuning.data"
                        :scale-notes="scaleNotes"
                        :frets="fretCount"
                        :shape-active="neckShape.active"
                        :shape-frets-by-string="neckShape.fretsByString"
                        :muted-strings="neckShape.mutedStrings"
                        :view-mode="neckShape.viewMode"
                        :position-start-fret="safePositionStartFret"
                        :position-span="safePositionSpan"
                        :note-preference="resolvedAccidentalPreference"
                        :chord-tones="chordTones"
                        :show-degrees="noteNames === 'degrees'"
                        :root-pitch-class="rootPitchClass"
                        :show-rest="noteVisibility === 'all'"
                    />
                    <div class="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                            <!-- With chords selected the legend names each one in its colour; while a
                                 progression plays, its chords, the one it's on ringed -->
                            <template v-if="legendFilled">
                                <span
                                    v-for="item in chordLegend"
                                    :key="item.label"
                                    class="flex items-center gap-1.5 font-medium text-foreground"
                                >
                                    <span
                                        :class="['size-2.5 rounded-full', item.active && 'ring-2 ring-foreground ring-offset-2 ring-offset-background']"
                                        :style="{ background: item.color ?? 'color-mix(in srgb, var(--tone-scale) 35%, var(--wood))' }"
                                    ></span>{{ item.label }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="size-2.5 rounded-full ring-[1.5px] ring-foreground/60 ring-offset-[1.5px] ring-offset-background"></span>Chord root
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="size-2.5 rounded-full bg-[color-mix(in_srgb,var(--tone-scale)_35%,var(--wood))]"></span>Other scale tone
                                </span>
                                <span v-if="hasOutsideTones" class="flex items-center gap-1.5">
                                    <span class="outside-tone size-2.5 rounded-full bg-[var(--chord-8)] [outline-offset:-2px]"></span>Outside the key
                                </span>
                            </template>
                            <template v-else>
                                <span
                                    v-for="item in chordLegend"
                                    :key="item.label"
                                    class="flex items-center gap-1.5 font-medium text-foreground"
                                >
                                    <span class="size-2.5 rounded-full bg-tone-scale ring-2 ring-foreground ring-offset-2 ring-offset-background"></span>{{ item.label }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="size-2.5 rounded-full bg-tone-root"></span>Root
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="size-2.5 rounded-full border border-foreground/15 bg-tone-scale"></span>Scale tone
                                </span>
                            </template>
                            <span>Tap a note to hear it</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Right under the neck, so a looping progression and the neck stay on screen together -->
        <ProgressionPanel
            v-if="progressions.length"
            :progressions="progressions"
            :step="progressionStep"
            :filter="progressionFilter"
            @show="showProgressionStep"
            @toggle="toggleChord"
        />

        <!-- Under the neck and the progressions; with no chord selected it offers every chord in the key -->
        <ChordShapes
            :shapes="chordShapes"
            :active="activeShape"
            :strings="tuning.data"
            :chord-names="selectedChordNames"
            :position="positionLabel"
            :every-chord="showsEveryChord"
            @select="selectShape"
        />

        <!-- Under the neck and shapes, so the chords and neck stay on top -->
        <section>
            <div :class="['flex h-7 items-center', !tuningCollapsed && 'mb-3']">
                <SectionHeading v-model:collapsed="tuningCollapsed" title="Tuning" />
            </div>
            <TuningControls
                v-if="!tuningCollapsed"
                class="sm:max-w-md"
                field
                v-model:selected-tuning-id="selectedTuningId"
                :can-edit-selected-tuning="canEditSelectedTuning"
                :tuning="tuning"
                :tuning-options="tuningOptions"
                @create="openCreateCustomTuning"
                @edit="openEditCustomTuning"
            />
        </section>

        <DialogTuningEditor
            v-if="isEditingCustomTuning"
            :model-value="draftTuning"
            :show-delete="isEditingExistingCustomTuning"
            :mode="tuningEditorMode"
            @save="onSaveCustomTuning"
            @cancel="closeCustomTuningEditor"
            @delete="onDeleteCustomTuning"
        />
    </div>
</template>
