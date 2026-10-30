import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { scales, scalesFlatMap } from "@/lib/scales";
import {
    formatNoteLabel,
    formatPitchClass,
    getPitchClass,
    getScaleNotes,
    resolveAccidentalPreference,
    type AccidentalPreference,
    type ResolvedAccidentalPreference,
    type ScaleNote,
} from "@/lib/notes";
import {
    type ChordTones,
    chordColor,
    extraChordColor,
} from "@/lib/chords";
import {
    buildBorrowedChords,
    buildDiatonicChords,
    buildSecondaryDominants,
    spellByLetter,
    type DisplayChord,
} from "@/lib/harmony";
import { findProgressions } from "@/lib/progressions";
import { getVoicings } from "@/lib/voicings";
import { use3nps } from "@/composables/use3nps";
import { playSequence } from "@/lib/audio";
import { usePositionView } from "@/composables/usePositionView";
import type { ActiveShape, FretboardViewMode, ProgressionStep } from "@/composables/useAppState";
import type { Tuning } from "@/lib/tunings";

export type PositionStyle = "box" | "3nps";
// Triads stack three scale notes (1-3-5), sevenths four (1-3-5-7)
export type ChordSize = "triads" | "sevenths";

export function useFretboardState(input: {
    selectedChords: Ref<string[]>;
    chordSize: Ref<ChordSize>;
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
    activeShape: Ref<ActiveShape | null>;
    progressionStep: Ref<ProgressionStep | null>;
}) {
    const fretCount = 22;
    const noteNamesOptions = [
        { label: "Notes", value: "notes" },
        { label: "Intervals", value: "degrees" },
    ];
    const noteVisibilityOptions = [
        { label: "Scale only", value: "only-scale" },
        { label: "All notes", value: "all" },
    ];
    const accidentalPreferenceOptions = [
        { label: "Auto", value: "auto" },
        { label: "♯", value: "sharp" },
        { label: "♭", value: "flat" },
    ];
    const selectedScaleIndex = computed(() => scalesFlatMap.indexOf(input.scale.value));
    const selectedScale = computed(() => scales[selectedScaleIndex.value]);
    // The selected key is the mode's root; the parent scale starts this many semitones below it.
    const modeOffset = computed(
        () => (scales[selectedScaleIndex.value]?.formula[input.mode.value - 1]?.chromatic ?? 1) - 1
    );
    const parentPitchClass = computed(() => {
        const rootPitchClassValue = getPitchClass(input.note.value);
        return rootPitchClassValue == null ? null : (rootPitchClassValue - modeOffset.value + 12) % 12;
    });
    const keySignaturePreference = computed<ResolvedAccidentalPreference>(() =>
        parentPitchClass.value != null && FLAT_KEY_PITCH_CLASSES.includes(parentPitchClass.value)
            ? "flat"
            : "sharp"
    );
    const autoAccidentalPreference = computed<ResolvedAccidentalPreference>(() => {
        // Keep a spelling the user picked (D♭, F♯); otherwise follow the parent key signature.
        if (/[b♭♯#]/.test(input.note.value)) {
            return resolveAccidentalPreference(input.note.value, "auto");
        }
        return keySignaturePreference.value;
    });
    const resolvedAccidentalPreference = computed<ResolvedAccidentalPreference>(() =>
        input.accidentalPreference.value !== "auto"
            ? input.accidentalPreference.value
            : autoAccidentalPreference.value
    );
    const parentNote = computed(() =>
        parentPitchClass.value == null
            ? input.note.value
            : formatPitchClass(parentPitchClass.value, resolvedAccidentalPreference.value)
    );
    const scalesOptions = computed(() =>
        scales.map((scale) => ({ label: scale.name, value: scale.slug }))
    );
    const notesOptions = computed(() =>
        Array.from({ length: 12 }, (_, pitchClass) => {
            const note =
                input.accidentalPreference.value === "auto"
                    ? KEY_NAMES[pitchClass]
                    : formatPitchClass(pitchClass, input.accidentalPreference.value);
            return { label: formatNoteLabel(note), value: note };
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
    const modeName = computed(
        () => modeOptions.value[input.mode.value - 1]?.label.split(" / ")[0] ?? ""
    );
    function spellScaleNotes(preference: ResolvedAccidentalPreference, auto: boolean): ScaleNote[] {
        const parent =
            parentPitchClass.value == null
                ? input.note.value
                : formatPitchClass(parentPitchClass.value, preference);
        const notes = getScaleNotes(selectedScaleIndex.value, input.mode.value, parent, preference);
        if (!auto) return notes;
        // Seven-note scales get one note per letter (C D E♭ F♯ G A♭ B), with degrees to match.
        if (notes.length === 7) return spellByLetter(notes);
        // Otherwise, from a natural key, spell altered degrees by their degree: ♭5 as E♭ rather than D♯.
        if (/[b♭♯#]/.test(input.note.value)) return notes;
        return notes.map((scaleNote) => {
            const accidental = scaleNote.degree.match(/^[♭♯]/)?.[0];
            if (!accidental) return scaleNote;
            return {
                ...scaleNote,
                note: formatPitchClass(scaleNote.pitchClass, accidental === "♭" ? "flat" : "sharp"),
            };
        });
    }
    const scaleNotes = computed(() =>
        spellScaleNotes(resolvedAccidentalPreference.value, input.accidentalPreference.value === "auto")
    );
    // Chords keep the key's own spelling, so forcing ♯ doesn't turn E♭maj7♯5 into D♯maj7♯5 under ♭III.
    // A forced ♯/♭ also respells the key note itself (E♭ → D♯), so go by the key signature then.
    const chordScaleNotes = computed(() =>
        spellScaleNotes(
            input.accidentalPreference.value === "auto"
                ? autoAccidentalPreference.value
                : keySignaturePreference.value,
            true
        )
    );
    const modeFormula = computed(() => {
        const scale = scales[selectedScaleIndex.value];
        if (!scale) return [];
        return [
            ...scale.formula.slice(input.mode.value - 1),
            ...scale.formula.slice(0, input.mode.value - 1),
        ];
    });
    const toneCount = computed(() => (input.chordSize.value === "triads" ? 3 : 4));
    const chords = computed<DisplayChord[]>(() =>
        buildDiatonicChords(chordScaleNotes.value, modeFormula.value, toneCount.value)
    );
    // Beyond the key: dominants of its chords, and chords borrowed from parallel modes
    const secondaryChords = computed(() => buildSecondaryDominants(chords.value, toneCount.value));
    // Every borrowed chord, most common first; progressions can reach any of them
    const allBorrowedChords = computed(() =>
        buildBorrowedChords(chordScaleNotes.value, chords.value, toneCount.value, Infinity)
    );
    // The panel suggests the usual few, plus any other one picked from a progression
    const borrowedChords = computed(() =>
        allBorrowedChords.value.filter(
            (chord, index) => index < BORROWED_SUGGESTIONS || input.selectedChords.value.includes(chord.id)
        )
    );
    const allChords = computed(() => [
        ...chords.value,
        ...secondaryChords.value,
        ...borrowedChords.value,
    ]);
    // Progressions this key can play, reaching for any borrowed chord, not only the ones the panel
    // suggests. Each chord keeps its degree's colour; ones from outside the key take extra colours.
    const progressions = computed(() =>
        findProgressions(
            chords.value,
            [
                ...secondaryChords.value,
                ...allBorrowedChords.value,
            ],
            modeName.value
        ).map((entry) => {
            const outsideIds = [...new Set(entry.chords.filter((chord) => chord.kind !== "diatonic").map((chord) => chord.id))];
            return {
                ...entry,
                colors: entry.chords.map((chord) =>
                    chord.kind === "diatonic"
                        ? chordColor(Number(chord.id) - 1)
                        : extraChordColor(outsideIds.indexOf(chord.id))
                ),
            };
        })
    );
    // A key or mode the progression can't be played in clears its chord; one it can keeps it going
    watch(
        () => progressions.value.map((entry) => entry.progression.id),
        (ids) => {
            const step = input.progressionStep.value;
            if (step && !ids.includes(step.id)) input.progressionStep.value = null;
        },
        { immediate: true }
    );
    const playingProgression = computed(() => {
        const step = input.progressionStep.value;
        return (step && progressions.value.find((entry) => entry.progression.id === step.id)) || null;
    });
    const progressionChord = computed(() => {
        const step = input.progressionStep.value;
        const active = playingProgression.value;
        if (!step || !active) return null;
        const index = step.index % active.chords.length;
        return { chord: active.chords[index], color: active.colors[index] };
    });
    // Chords from outside the key take the first free extra colour when selected and keep it
    // until they're deselected, so picking another never recolours the ones already showing.
    const extraColorSlots = ref<Record<string, number>>({});
    watch(
        () => input.selectedChords.value,
        (selected) => {
            const slots: Record<string, number> = {};
            for (const id of selected) {
                if (/^\d+$/.test(id)) continue;
                const previous = extraColorSlots.value[id];
                if (previous != null) slots[id] = previous;
            }
            for (const id of selected) {
                if (/^\d+$/.test(id) || slots[id] != null) continue;
                const used = new Set(Object.values(slots));
                let slot = 0;
                while (used.has(slot)) slot++;
                slots[id] = slot;
            }
            extraColorSlots.value = slots;
        },
        { immediate: true }
    );
    function colorOf(chord: DisplayChord): string {
        return chord.kind === "diatonic"
            ? chordColor(Number(chord.id) - 1)
            : extraChordColor(extraColorSlots.value[chord.id] ?? 0);
    }
    const chordColors = computed<Record<string, string>>(() =>
        Object.fromEntries(allChords.value.map((chord) => [chord.id, colorOf(chord)]))
    );
    // Selected chords in panel order (in key, secondary, borrowed), each with its colour
    const selectedChordList = computed(() =>
        allChords.value
            .filter((chord) => input.selectedChords.value.includes(chord.id))
            .map((chord) => ({ chord, color: colorOf(chord) }))
    );
    // The selected chords as the progressions panel filters by them
    const progressionFilter = computed(() =>
        selectedChordList.value.map(({ chord, color }) => ({
            id: chord.id,
            name: `${formatNoteLabel(chord.note)}${chord.chord}`,
            color,
        }))
    );
    // What the neck and the shapes strip show: the progression's current chord, if any, else the
    // selection
    const shownChordList = computed(() =>
        progressionChord.value ? [progressionChord.value] : selectedChordList.value
    );
    // With nothing selected or playing, the shapes strip offers every chord in the key, while the
    // neck keeps to the scale until one of them is picked
    const showsEveryChord = computed(() => shownChordList.value.length === 0);
    const shapeChordList = computed(() =>
        showsEveryChord.value
            ? chords.value.map((chord, index) => ({ chord, color: chordColor(index) }))
            : shownChordList.value
    );
    const selectedChordNames = computed(() =>
        shapeChordList.value.map(({ chord }) => `${formatNoteLabel(chord.note)}${chord.chord}`)
    );
    // Every chord's shapes in one list up the neck, so shapes of different chords that lie close
    // together sit side by side; picking one shows just that shape on the neck
    const chordShapes = computed(() =>
        shapeChordList.value
            .flatMap(({ chord, color }) =>
                getVoicings(chord.tones, input.tuning.value.data, fretCount).map((voicing, index) => ({
                    chord,
                    color,
                    voicing,
                    index,
                }))
            )
            .sort((left, right) => left.voicing.baseFret - right.voicing.baseFret)
    );
    const activeChordShape = computed(() => {
        const active = input.activeShape.value;
        if (!active) return null;
        return chordShapes.value.find((shape) => shape.chord.id === active.chord && shape.index === active.index) ?? null;
    });
    // Deselecting the shape's chord, or a key or tuning that gives it other shapes, clears the pick
    watch(
        () => {
            const active = input.activeShape.value;
            if (!active) return null;
            const shapes = chordShapes.value.filter((shape) => shape.chord.id === active.chord);
            return `${active.chord}|${shapes.map((shape) => shape.voicing.frets.join(",")).join(";")}`;
        },
        (now, previous) => {
            if (!now || !previous || now === previous) return;
            if (now.split("|")[0] === previous.split("|")[0]) input.activeShape.value = null;
        }
    );
    // A picked shape takes over the neck from the position and 3NPS views
    const neckShape = computed(() => {
        const voicing = activeChordShape.value?.voicing;
        if (!voicing) {
            return {
                active: show3nps.value,
                fretsByString: activeThreeNpsShape.value,
                viewMode: input.viewMode.value,
                mutedStrings: [] as boolean[],
            };
        }
        return {
            active: true,
            fretsByString: voicing.frets.map((fret) => (fret == null ? [] : [fret])),
            viewMode: "full" as FretboardViewMode,
            mutedStrings: voicing.frets.map((fret) => fret == null),
        };
    });
    function selectShape(shape: ActiveShape | null) {
        input.activeShape.value = shape;
    }
    // With a shape picked, the neck shows only its chord, in that chord's colour
    const neckChordList = computed(() => {
        const active = activeChordShape.value;
        return active ? shapeChordList.value.filter(({ chord }) => chord.id === active.chord.id) : shownChordList.value;
    });
    const modeRootNote = computed(() => scaleNotes.value[0]?.note ?? input.note.value);
    const rootPitchClass = computed(() => scaleNotes.value[0]?.pitchClass ?? null);
    // While a progression plays it changes no colours: the neck keeps the selected chords' fills (or
    // the plain scale) and only rings the chord it's on
    const progressionFills = computed(() =>
        progressionChord.value && !activeChordShape.value ? selectedChordList.value : null
    );
    const chordTones = computed<ChordTones>(() => {
        const tones: ChordTones = {};
        const inScale = new Set(scaleNotes.value.map((scaleNote) => scaleNote.pitchClass));
        const entryFor = (tone: DisplayChord["tones"][number]) =>
            (tones[String(tone.pitchClass)] ??= {
                colors: [],
                note: tone.note,
                outside: !inScale.has(tone.pitchClass),
            });
        const fills = progressionFills.value;
        for (const { chord, color } of fills ?? neckChordList.value) {
            const chordRoot = getPitchClass(chord.note);
            for (const tone of chord.tones) {
                const entry = entryFor(tone);
                if (!entry.colors.includes(color)) entry.colors.push(color);
                // A note that's some chord's root is labelled as that root (1). While a progression
                // plays the rings are the playing chord's, so roots go unringed.
                if (tone.pitchClass === chordRoot) {
                    if (!fills) entry.rootColor ??= color;
                    entry.interval = tone.interval;
                } else if (!entry.rootColor) {
                    entry.interval ??= tone.interval;
                }
            }
        }
        const current = fills && progressionChord.value?.chord;
        if (current) {
            for (const tone of current.tones) entryFor(tone).active = true;
        }
        return tones;
    });
    // The chords on the neck, and while a progression plays the chord it's on, marked active (only
    // ringed if it isn't one of them)
    const chordLegend = computed(() => {
        const list = progressionFills.value ?? neckChordList.value;
        const current = progressionFills.value ? progressionChord.value?.chord : undefined;
        const items = list.map(({ chord, color }) => ({
            label: `${formatNoteLabel(chord.note)}${chord.chord}`,
            color: color as string | undefined,
            active: chord.id === current?.id,
        }));
        if (current && !items.some((item) => item.active)) {
            items.push({ label: `${formatNoteLabel(current.note)}${current.chord}`, color: undefined, active: true });
        }
        return items;
    });
    // Numbered positions follow the scale degrees on the lowest string, climbing up from the root.
    const positionSpanFrets = 5;
    const degreeFrets = computed<number[]>(() => {
        const lowestPitchClass = getPitchClass(input.tuning.value.data[0]?.note ?? "");
        const rootPitchClassValue = rootPitchClass.value;
        if (lowestPitchClass == null || rootPitchClassValue == null) return [];
        const rootFret = (rootPitchClassValue - lowestPitchClass + 12) % 12;
        return scaleNotes.value.map((scaleNote) => {
            const fret = rootFret + ((scaleNote.pitchClass - rootPitchClassValue + 12) % 12);
            return fret + positionSpanFrets > fretCount ? fret - 12 : fret;
        });
    });
    // A box starts one fret below its degree, so the index finger sits there and the degree falls
    // under the second finger. Boxes are kept at least two frets apart so neighbours don't overlap
    // almost entirely, and boxes that run off the neck wrap down an octave below position 1.
    const positionStartFrets = computed<number[]>(() => {
        const lowestPitchClass = getPitchClass(input.tuning.value.data[0]?.note ?? "");
        const rootPitchClassValue = rootPitchClass.value;
        if (lowestPitchClass == null || rootPitchClassValue == null) return [];
        const rootFret = (rootPitchClassValue - lowestPitchClass + 12) % 12;

        let previous = Number.NEGATIVE_INFINITY;
        const starts = scaleNotes.value.map((scaleNote) => {
            const fret = rootFret + ((scaleNote.pitchClass - rootPitchClassValue + 12) % 12);
            previous = Math.max(fret - 1, previous + 2, 0);
            return previous;
        });
        const wrapped = starts.map((start) =>
            start + positionSpanFrets > fretCount ? start - 12 : start
        );
        for (let index = wrapped.length - 1; index > 0; index--) {
            if (wrapped[index] === starts[index]) break;
            const next = index === wrapped.length - 1 ? wrapped[0] : wrapped[index + 1];
            wrapped[index] = Math.max(Math.min(wrapped[index], next - 2), 0);
        }
        return wrapped;
    });
    const { shapes: threeNpsShapes, notesPerString: shapeNotesPerString } = use3nps(
        scaleNotes,
        computed(() => input.tuning.value.data),
        fretCount,
        degreeFrets
    );
    const {
        safeStartFret: safePositionStartFret,
        safeSpan: safePositionSpan,
    } = usePositionView(
        input.positionStartFret,
        input.positionSpan,
        computed(() => fretCount)
    );
    const show3nps = computed(() => input.viewMode.value === "3nps");
    const positionCount = computed(() => scaleNotes.value.length);
    const activePosition = computed<number | null>(() =>
        input.viewMode.value === "full" ? null : input.threeNpsShapeIndex.value
    );
    const positionStyle = ref<PositionStyle>(input.viewMode.value === "3nps" ? "3nps" : "box");
    const activeThreeNpsShape = computed<number[][]>(
        () => threeNpsShapes.value[input.threeNpsShapeIndex.value] ?? []
    );
    // The frets of the chosen box or 3NPS position, or null on the full neck
    const positionFretRange = computed<[number, number] | null>(() => {
        if (input.viewMode.value === "position") {
            return [safePositionStartFret.value, safePositionStartFret.value + safePositionSpan.value - 1];
        }
        if (input.viewMode.value === "3nps") {
            const frets = activeThreeNpsShape.value.flat();
            return frets.length ? [Math.min(...frets), Math.max(...frets)] : null;
        }
        return null;
    });
    // How the shapes strip names the position it's limited to
    const positionLabel = computed(() => {
        if (!positionFretRange.value) return null;
        const number = input.threeNpsShapeIndex.value + 1;
        return input.viewMode.value === "3nps" ? `3NPS position ${number}` : `box ${number}`;
    });
    // Inside a position, only the shapes the hand can play without moving: a fret's stretch either
    // side of it still counts, and open strings do when that reaches the nut
    const SHAPE_STRETCH = 1;
    const visibleChordShapes = computed(() => {
        const range = positionFretRange.value;
        if (!range) return chordShapes.value;
        const first = range[0] - SHAPE_STRETCH;
        const last = range[1] + SHAPE_STRETCH;
        return chordShapes.value.filter(({ voicing }) =>
            voicing.frets.every((fret) => fret == null || (fret === 0 ? first <= 1 : fret >= first && fret <= last))
        );
    });
    // Choosing another position shows that position, not the shape that was on the neck
    watch([() => input.viewMode.value, () => input.threeNpsShapeIndex.value], () => {
        input.activeShape.value = null;
    });
    const heading = computed(() => `${formatNoteLabel(modeRootNote.value)} ${modeName.value}`.trim());
    const subheading = computed(
        () =>
            `Mode ${input.mode.value} of ${formatNoteLabel(parentNote.value)} ${selectedScale.value?.name ?? input.scale.value}`
    );
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
    watch(positionCount, (count) => {
        if (input.threeNpsShapeIndex.value > count - 1) {
            input.syncShapeIndex(Math.max(count - 1, 0));
        }
    });
    // Box positions follow the key, scale and tuning.
    watch(
        [() => input.viewMode.value, () => positionStartFrets.value[input.threeNpsShapeIndex.value]],
        ([viewMode, startFret]) => {
            if (viewMode !== "position" || startFret == null) return;
            input.positionStartFret.value = startFret;
            input.positionSpan.value = positionSpanFrets;
        },
        { immediate: true }
    );

    // Changing the selection takes the neck back from a progression
    function toggleChord(id: string) {
        input.progressionStep.value = null;
        const selected = input.selectedChords.value;
        input.selectedChords.value = selected.includes(id)
            ? selected.filter((value) => value !== id)
            : [...selected, id];
    }

    // A progression borrows the neck from the selected chords, which come back once its chord is off
    function showProgressionStep(step: ProgressionStep | null) {
        input.progressionStep.value = step;
    }

    function selectPosition(index: number | null) {
        if (index == null) {
            input.viewMode.value = "full";
            return;
        }
        input.syncShapeIndex(index);
        input.viewMode.value = positionStyle.value === "3nps" ? "3nps" : "position";
    }

    function setPositionStyle(style: PositionStyle) {
        positionStyle.value = style;
        if (activePosition.value != null) selectPosition(activePosition.value);
    }

    function playScale() {
        const rootPitchClassValue = rootPitchClass.value;
        if (rootPitchClassValue == null) return;
        // Start from the root in octave 3 (MIDI 48 = C3).
        const rootMidi = 48 + rootPitchClassValue;
        const sequence = [...scaleNotes.value, scaleNotes.value[0]].map((scaleNote, index, all) => {
            const offset = index === all.length - 1
                ? 12
                : (scaleNote.pitchClass - rootPitchClassValue + 12) % 12;
            return { note: scaleNote.note, octave: Math.floor((rootMidi + offset) / 12) - 1 };
        });
        playSequence(sequence, 0.18);
    }

    return {
        activeChordShape,
        positionLabel,
        progressionChord,
        progressions,
        showProgressionStep,
        progressionFilter,
        selectedChordNames,
        showsEveryChord,
        borrowedChords,
        chordShapes: visibleChordShapes,
        neckShape,
        selectShape,
        chordColors,
        chordLegend,
        chordTones,
        accidentalPreferenceOptions,
        activePosition,
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
    };
}

const BORROWED_SUGGESTIONS = 7;
// F, B♭, E♭, A♭, D♭: parent keys that are written with flats.
const FLAT_KEY_PITCH_CLASSES = [5, 10, 3, 8, 1];
const KEY_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F♯", "G", "Ab", "A", "Bb", "B"];
