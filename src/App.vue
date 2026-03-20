<script setup lang="ts">
import { Label } from "@/components/ui/label";
import { Fretboard } from "@/components/ui/fretboard";
import DialogTuningEditor from "@/components/tuning-editor/Dialog.TuningEditor.vue";
import AppFooter from "@/components/app/AppFooter.vue";
import ChordPanel from "@/components/app/ChordPanel.vue";
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
    activeThreeNpsShape,
    chordRootPitchClass,
    chords,
    fretCount,
    maxPositionStartFret,
    minPositionStartFret,
    modeOptions,
    next3npsShape,
    nextPosition,
    noteNamesOptions,
    noteVisibilityOptions,
    notesOptions,
    prev3npsShape,
    prevPosition,
    resolvedAccidentalPreference,
    resetPositionToRoot,
    rootPitchClass,
    safePositionSpan,
    safePositionStartFret,
    scaleNotes,
    scalesOptions,
    show3nps,
    showPosition,
    title,
    toggleChord,
    viewModeOptions,
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
    <div class="w-full max-w-[1300px] mx-auto flex flex-col">
        <Label class="mb-4">{{ title }}</Label>

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
            :root-pitch-class="rootPitchClass"
            :show-rest="noteVisibility === 'all'"
            class="mb-8"
        />

        <ViewModeControls
            v-model:accidental-preference="accidentalPreference"
            v-model:view-mode="viewMode"
            v-model:position-start-fret="positionStartFret"
            v-model:position-span="positionSpan"
            :accidental-preference-options="accidentalPreferenceOptions"
            :fret-count="fretCount"
            :max-position-start-fret="maxPositionStartFret"
            :min-position-start-fret="minPositionStartFret"
            :show-3nps="show3nps"
            :show-position="showPosition"
            :three-nps-shapes-count="activeThreeNpsShape.length"
            :view-mode-options="viewModeOptions"
            @next-3nps-shape="next3npsShape"
            @prev-3nps-shape="prev3npsShape"
            @next-position="nextPosition"
            @prev-position="prevPosition"
            @reset-position-to-root="resetPositionToRoot"
        />

        <ChordPanel
            :active-chord="activeChord"
            :chords="chords"
            @toggle="toggleChord"
        />

        <ScaleControls
            v-model:note="note"
            v-model:scale="scale"
            v-model:mode="mode"
            v-model:note-names="noteNames"
            v-model:note-visibility="noteVisibility"
            :mode-options="modeOptions"
            :note-names-options="noteNamesOptions"
            :note-visibility-options="noteVisibilityOptions"
            :notes-options="notesOptions"
            :scales-options="scalesOptions"
        >
            <TuningControls
                v-model:selected-tuning-id="selectedTuningId"
                :can-edit-selected-tuning="canEditSelectedTuning"
                :tuning-options="tuningOptions"
                @create="openCreateCustomTuning"
                @edit="openEditCustomTuning"
            />
        </ScaleControls>

        <DialogTuningEditor
            v-if="isEditingCustomTuning"
            :model-value="draftTuning"
            :show-delete="isEditingExistingCustomTuning"
            :mode="tuningEditorMode"
            @save="onSaveCustomTuning"
            @cancel="closeCustomTuningEditor"
            @delete="onDeleteCustomTuning"
        />

        <AppFooter />
    </div>
</template>
