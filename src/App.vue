<script setup lang="ts">
import { Fretboard } from "@/components/ui/fretboard";
import DialogTuningEditor from "@/components/tuning-editor/Dialog.TuningEditor.vue";
import AppFooter from "@/components/app/AppFooter.vue";
import AppHeader from "@/components/app/AppHeader.vue";
import { Logo } from "@/components/ui/logo";
import ChordPanel from "@/components/app/ChordPanel.vue";
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
    chord,
} = useAppState();

const {
    activeChord,
    activeFretboardChordNotes,
    accidentalPreferenceOptions,
    activePosition,
    activeThreeNpsShape,
    chordRootPitchClass,
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
    selectPosition,
    setPositionStyle,
    shapeNotesPerString,
    show3nps,
    subheading,
    toggleChord,
} = useFretboardState({
    accidentalPreference,
    chord,
    mode,
    note,
    positionSpan,
    positionStartFret,
    scale,
    syncPositionSpan,
    syncPositionStart,
    syncShapeIndex,
    threeNpsShapeIndex,
    tuning,
    viewMode,
});

</script>

<template>
    <div class="mx-auto flex w-full max-w-[1300px] flex-col gap-6 px-4 pt-8 pb-28 sm:pb-8 lg:px-10 lg:py-12">
        <a href="/" class="flex w-fit items-center gap-2 text-primary">
            <Logo class="h-7 w-auto" />
            <span class="font-display text-xl font-bold tracking-tight">Guitar Scales</span>
        </a>

        <AppHeader
            :heading="heading"
            :subheading="subheading"
            :scale-notes="scaleNotes"
            @play="playScale"
        >
            <TuningControls
                v-model:selected-tuning-id="selectedTuningId"
                :can-edit-selected-tuning="canEditSelectedTuning"
                :tuning="tuning"
                :tuning-options="tuningOptions"
                @create="openCreateCustomTuning"
                @edit="openEditCustomTuning"
            />
        </AppHeader>

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
                :shape-active="show3nps"
                :shape-frets-by-string="activeThreeNpsShape"
                :view-mode="viewMode"
                :position-start-fret="safePositionStartFret"
                :position-span="safePositionSpan"
                :note-preference="resolvedAccidentalPreference"
                :chord-root-pitch-class="chordRootPitchClass"
                :chord-notes="activeFretboardChordNotes"
                :show-degrees="noteNames === 'degrees'"
                :show-labels="noteNames !== 'dots'"
                :root-pitch-class="rootPitchClass"
                :show-rest="noteVisibility === 'all'"
            />
            <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-tone-root"></span>Root
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full border border-foreground/15 bg-tone-scale"></span>Scale tone
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-tone-chord"></span>Chord tone
                </span>
                <span>Tap a note to hear it</span>
            </div>
        </div>

        <ChordPanel
            :active-chord="activeChord"
            :chords="chords"
            @toggle="toggleChord"
        />

        <!-- On phones these live in the sticky bottom bar instead -->
        <div class="hidden flex-col gap-6 sm:flex">
            <hr class="my-2" />

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


        <DialogTuningEditor
            v-if="isEditingCustomTuning"
            :model-value="draftTuning"
            :show-delete="isEditingExistingCustomTuning"
            :mode="tuningEditorMode"
            @save="onSaveCustomTuning"
            @cancel="closeCustomTuningEditor"
            @delete="onDeleteCustomTuning"
        />

        <AppFooter class="mt-6" />
    </div>
</template>
