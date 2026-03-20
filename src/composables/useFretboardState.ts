import { computed, watch, type ComputedRef, type Ref } from "vue";
import { scales, scalesFlatMap } from "@/composables/useScales";
import {
    formatPitchClass,
    getNoteByOffset,
    getPitchClass,
    getScaleNotes,
    resolveAccidentalPreference,
    type AccidentalPreference,
} from "@/composables/useNotes";
import {
    chordsByPrimaryAbbreviation,
    getChordIntervals,
    getChordNotes,
    useDiatonicChords,
} from "@/composables/useChords";
import { use3nps } from "@/composables/use3nps";
import { usePositionView } from "@/composables/usePositionView";
import type { FretboardViewMode } from "@/composables/useAppState";
import type { Tuning } from "@/composables/useTunings";

export function useFretboardState(input: {
    chord: Ref<number | null>;
    accidentalPreference: Ref<AccidentalPreference>;
    note: Ref<string>;
    mode: Ref<number>;
    positionSpan: Ref<number>;
    positionStartFret: Ref<number>;
    scale: Ref<string>;
    syncPositionSpan: (value: number) => void;
    syncPositionStart: (value: number) => void;
    syncShapeIndex: (value: number) => void;
    threeNpsShapeIndex: Ref<number>;
    tuning: ComputedRef<Tuning>;
    viewMode: Ref<FretboardViewMode>;
}) {
    const fretCount = 22;
    const viewModeOptions: { label: string; value: FretboardViewMode }[] = [
        { label: "Full neck", value: "full" },
        { label: "3NPS", value: "3nps" },
        { label: "Position", value: "position" },
    ];
    const noteNamesOptions = [
        { label: "Scale and chord Degrees", value: "degrees" },
        { label: "Scale Notes", value: "notes" },
    ];
    const noteVisibilityOptions = [
        { label: "All Notes", value: "all" },
        { label: "Only Scale Notes", value: "only-scale" },
    ];
    const accidentalPreferenceOptions = [
        { label: "Auto", value: "auto" },
        { label: "Sharps", value: "sharp" },
        { label: "Flats", value: "flat" },
    ];
    const resolvedAccidentalPreference = computed(() =>
        resolveAccidentalPreference(input.note.value, input.accidentalPreference.value)
    );

    const selectedScaleIndex = computed(() => scalesFlatMap.indexOf(input.scale.value));
    const scalesOptions = computed(() =>
        scales.map((scale) => ({ label: scale.name, value: scale.slug }))
    );
    const notesOptions = computed(() =>
        Array.from({ length: 12 }, (_, pitchClass) => {
            const note = formatPitchClass(pitchClass, resolvedAccidentalPreference.value);
            return { label: note, value: note };
        })
    );
    const modeOptions = computed(() => {
        const index = selectedScaleIndex.value;
        if (index < 0) return [];
        return scales[index].formula.map((entry) => ({
            label: entry.mode,
            value: entry.id,
        }));
    });
    const scaleNotes = computed(() =>
        getScaleNotes(
            selectedScaleIndex.value,
            input.mode.value,
            input.note.value,
            input.accidentalPreference.value
        )
    );
    const chords = useDiatonicChords(scaleNotes, selectedScaleIndex, scales);
    const activeChord = computed<number | undefined>(() =>
        input.chord.value == null ? undefined : input.chord.value
    );
    const chordRoot = computed<string | number | undefined>(() =>
        input.chord.value ? chords.value[input.chord.value - 1]?.note : undefined
    );
    const rootPitchClass = computed(() => getPitchClass(input.note.value));
    const chordRootPitchClass = computed(() =>
        chordRoot.value == null ? null : getPitchClass(String(chordRoot.value))
    );
    const chordExtension = computed<string | number | undefined>(() =>
        input.chord.value ? chords.value[input.chord.value - 1]?.chord : undefined
    );
    const chordIntervals = computed(() =>
        getChordIntervals(chordExtension.value, chordsByPrimaryAbbreviation())
    );
    const chordNotes = computed(() =>
        getChordNotes(
            input.chord.value,
            scaleNotes.value,
            chordIntervals.value,
            selectedScaleIndex.value,
            scales
        )
    );
    const { shapes: threeNpsShapes } = use3nps(
        scaleNotes,
        computed(() => input.tuning.value.data),
        fretCount
    );
    const {
        minStartFret: minPositionStartFret,
        safeStartFret: safePositionStartFret,
        safeSpan: safePositionSpan,
        maxStartFret: maxPositionStartFret,
        renderedSpan: renderedPositionSpan,
    } = usePositionView(
        input.positionStartFret,
        input.positionSpan,
        computed(() => fretCount)
    );
    const show3nps = computed(() => input.viewMode.value === "3nps");
    const showPosition = computed(() => input.viewMode.value === "position");
    const activeThreeNpsShape = computed<number[][]>(() => {
        if (!threeNpsShapes.value.length) return [];
        const maxIndex = threeNpsShapes.value.length - 1;
        const safeIndex = Math.min(Math.max(input.threeNpsShapeIndex.value, 0), maxIndex);
        return threeNpsShapes.value[safeIndex];
    });
    const title = computed(() => {
        let nextTitle = `Scale: ${input.note.value}-${input.scale.value}`;
        if (input.mode.value > 1 && modeOptions.value[input.mode.value - 1]) {
            nextTitle += ` (${modeOptions.value[input.mode.value - 1].label})`;
        }
        if (input.chord.value) {
            nextTitle += ` / chord: ${chordRoot.value ?? ""}${chordExtension.value ?? ""}`;
        }
        return nextTitle;
    });

    watch(safePositionStartFret, (value) => {
        input.syncPositionStart(value);
    }, { immediate: true });
    watch(safePositionSpan, (value) => {
        input.syncPositionSpan(value);
    }, { immediate: true });
    watch(resolvedAccidentalPreference, (preference) => {
        const pitchClass = getPitchClass(input.note.value);
        if (pitchClass == null) return;

        const formattedNote = formatPitchClass(pitchClass, preference);
        if (formattedNote !== input.note.value) {
            input.note.value = formattedNote;
        }
    }, { immediate: true });
    watch(() => input.threeNpsShapeIndex.value, (value) => {
        input.syncShapeIndex(value);
    }, { immediate: true });
    watch(threeNpsShapes, (shapes) => {
        if (!shapes.length) {
            input.syncShapeIndex(0);
            return;
        }
        if (input.threeNpsShapeIndex.value > shapes.length - 1) {
            input.syncShapeIndex(shapes.length - 1);
        }
    });

    function toggleChord(index: number) {
        input.chord.value = input.chord.value === index + 1 ? null : index + 1;
    }

    function next3npsShape() {
        if (!threeNpsShapes.value.length) return;
        input.syncShapeIndex(
            (input.threeNpsShapeIndex.value + 1) % threeNpsShapes.value.length
        );
    }

    function prev3npsShape() {
        if (!threeNpsShapes.value.length) return;
        input.syncShapeIndex(
            (input.threeNpsShapeIndex.value - 1 + threeNpsShapes.value.length) %
            threeNpsShapes.value.length
        );
    }

    function nextPosition() {
        if (
            renderedPositionSpan.value < safePositionSpan.value &&
            safePositionStartFret.value >= 0
        ) return;
        input.positionStartFret.value = Math.min(
            safePositionStartFret.value + safePositionSpan.value,
            maxPositionStartFret.value
        );
    }

    function prevPosition() {
        if (
            renderedPositionSpan.value < safePositionSpan.value &&
            safePositionStartFret.value < 0
        ) return;
        input.positionStartFret.value = Math.max(
            safePositionStartFret.value - safePositionSpan.value,
            minPositionStartFret.value
        );
    }

    function resetPositionToRoot() {
        const lowestString = input.tuning.value.data[0];
        if (!lowestString) return;
        for (let fret = 0; fret < fretCount; fret++) {
            if (
                getPitchClass(
                    getNoteByOffset(lowestString.note, fret, resolvedAccidentalPreference.value)
                ) === rootPitchClass.value
            ) {
                input.positionStartFret.value = fret;
                return;
            }
        }
        input.positionStartFret.value = 0;
    }

    return {
        activeChord,
        activeFretboardChordNotes: computed(() =>
            input.chord.value == null ? {} : chordNotes.value
        ),
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
        resetPositionToRoot,
        resolvedAccidentalPreference,
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
    };
}
