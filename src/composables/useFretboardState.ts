import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { scales, scalesFlatMap } from "@/composables/useScales";
import {
    formatNoteLabel,
    formatPitchClass,
    getPitchClass,
    getScaleNotes,
    resolveAccidentalPreference,
    type AccidentalPreference,
    type ResolvedAccidentalPreference,
    type ScaleNote,
} from "@/composables/useNotes";
import {
    type ChordTones,
    chordColor,
    chords as chordDefinitions,
    chordsByPrimaryAbbreviation,
} from "@/composables/useChords";
import { use3nps } from "@/composables/use3nps";
import { playTone } from "@/composables/useAudio";
import { usePositionView } from "@/composables/usePositionView";
import type { FretboardViewMode } from "@/composables/useAppState";
import type { Tuning } from "@/composables/useTunings";

export type PositionStyle = "box" | "3nps";
// Triads stack three scale notes (1-3-5), sevenths four (1-3-5-7)
export type ChordSize = "triads" | "sevenths";

export function useFretboardState(input: {
    selectedChords: Ref<number[]>;
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
    const chords = computed<DisplayChord[]>(() => {
        // Stack every other scale note and name the chord from the notes it actually contains.
        const notes = chordScaleNotes.value;
        const count = notes.length;
        const toneCount = input.chordSize.value === "triads" ? 3 : 4;
        return modeFormula.value.map((entry, index) => {
            const degree = notes[index]?.degree ?? entry.degree;
            // Stacking every other note of a five-note scale gives quartal shapes, so use the
            // fullest standard chord on this degree whose notes are all in the scale instead.
            const contained = count < 6 ? findContainedChord(notes, index, toneCount) : null;
            if (contained) {
                return {
                    note: notes[index].note,
                    chord: contained.abbreviation,
                    degree,
                    numeral: getRomanNumeral(degree, contained.abbreviation),
                    tones: contained.tones,
                };
            }
            const stacked = [index, index + 2, index + 4, count === 6 ? index + 5 : index + 6]
                .slice(0, toneCount)
                .map((noteIndex) => notes[noteIndex % count])
                .filter(Boolean);
            const rootPitchClassValue = stacked[0]?.pitchClass ?? 0;
            const semitones = stacked.map((tone) => (tone.pitchClass - rootPitchClassValue + 12) % 12);
            const match = findChordBySemitones(semitones, entry.chord);
            const order = stacked.map((_, toneIndex) => toneIndex);
            // Without a chord name, list the formula low to high so it reads like one: (♭3 4 ♭7).
            if (!match) order.sort((left, right) => semitones[left] - semitones[right]);
            const chord = match?.abbreviation ?? `(${order.slice(1).map((toneIndex) => SEMITONE_INTERVALS[semitones[toneIndex]]).join(" ")})`;
            const tones = order.map((toneIndex) => ({
                ...stacked[toneIndex],
                interval: match?.intervals[toneIndex] ?? SEMITONE_INTERVALS[semitones[toneIndex]],
            }));
            return {
                note: notes[index]?.note ?? "",
                chord,
                degree,
                numeral: getRomanNumeral(degree, chord),
                tones,
            };
        });
    });
    // Selected chords in degree order, each with its colour
    const selectedChordList = computed(() =>
        [...input.selectedChords.value]
            .sort((left, right) => left - right)
            .map((degree) => ({ degree, chord: chords.value[degree - 1], color: chordColor(degree - 1) }))
            .filter((entry) => entry.chord != null)
    );
    const modeRootNote = computed(() => scaleNotes.value[0]?.note ?? input.note.value);
    const rootPitchClass = computed(() => scaleNotes.value[0]?.pitchClass ?? null);
    const chordTones = computed<ChordTones>(() => {
        const tones: ChordTones = {};
        for (const { chord, color } of selectedChordList.value) {
            const chordRoot = getPitchClass(chord.note);
            for (const tone of chord.tones) {
                const entry = (tones[String(tone.pitchClass)] ??= { colors: [] });
                entry.colors.push(color);
                // A note that's some chord's root is labelled as that root (1)
                if (tone.pitchClass === chordRoot) {
                    entry.rootColor ??= color;
                    entry.interval = tone.interval;
                } else if (!entry.rootColor) {
                    entry.interval ??= tone.interval;
                }
            }
        }
        return tones;
    });
    const chordLegend = computed(() =>
        selectedChordList.value.map(({ chord, color }) => ({
            label: `${formatNoteLabel(chord.note)}${chord.chord}`,
            color,
        }))
    );
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
    const modeName = computed(
        () => modeOptions.value[input.mode.value - 1]?.label.split(" / ")[0] ?? ""
    );
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

    function toggleChord(index: number) {
        const degree = index + 1;
        const selected = input.selectedChords.value;
        input.selectedChords.value = selected.includes(degree)
            ? selected.filter((value) => value !== degree)
            : [...selected, degree];
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

    let playTimers: ReturnType<typeof setTimeout>[] = [];
    function playScale() {
        playTimers.forEach(clearTimeout);
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
        playTimers = sequence.map((step, index) =>
            setTimeout(() => playTone(step.note, step.octave), index * 280)
        );
    }

    return {
        chordLegend,
        chordTones,
        accidentalPreferenceOptions,
        activePosition,
        activeThreeNpsShape,
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
    };
}

// F, B♭, E♭, A♭, D♭: parent keys that are written with flats.
const FLAT_KEY_PITCH_CLASSES = [5, 10, 3, 8, 1];
const KEY_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F♯", "G", "Ab", "A", "Bb", "B"];

interface DisplayChord {
    note: string;
    chord: string;
    degree: string;
    numeral: string;
    tones: (ScaleNote & { interval?: string })[];
}

const INTERVAL_SEMITONES: Record<string, number> = {
    "1": 0, "♭2": 1, "2": 2, "♭3": 3, "3": 4, "4": 5, "♭5": 6, "5": 7,
    "♯5": 8, "♭6": 8, "6": 9, "♭♭7": 9, "♭7": 10, "7": 11, "♭9": 1, "9": 2, "11": 5, "13": 9,
};
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];

function spellByLetter(notes: ScaleNote[]): ScaleNote[] {
    const rootLetterIndex = LETTERS.indexOf(notes[0]?.note[0] ?? "");
    if (rootLetterIndex < 0) return notes;
    const rootPitchClassValue = notes[0].pitchClass;
    return notes.map((scaleNote, index) => {
        const letterIndex = (rootLetterIndex + index) % 7;
        const offset = ((scaleNote.pitchClass - LETTER_PITCH_CLASSES[letterIndex] + 18) % 12) - 6;
        const accidental = offset === 1 ? "♯" : offset === -1 ? "b" : offset === 0 ? "" : null;
        const note = `${LETTERS[letterIndex]}${accidental ?? ""}`;
        const semitones = (scaleNote.pitchClass - rootPitchClassValue + 12) % 12;
        const degreeOffset = semitones - LETTER_PITCH_CLASSES[index];
        const degreeAccidental = degreeOffset === 1 ? "♯" : degreeOffset === -1 ? "♭" : degreeOffset === 0 ? "" : null;
        return {
            ...scaleNote,
            // E♯, C♭ and double accidentals aren't supported elsewhere, so keep the enharmonic name there.
            note: accidental != null && getPitchClass(note) === scaleNote.pitchClass ? note : scaleNote.note,
            degree: degreeAccidental != null ? `${degreeAccidental}${index + 1}` : scaleNote.degree,
        };
    });
}

const SEMITONE_INTERVALS = ["1", "♭2", "2", "♭3", "3", "4", "♭5", "5", "♯5", "6", "♭7", "7"];
const NAMED_CHORDS = chordDefinitions
    .filter((chord) => chord.intervals.length <= 4)
    .map((chord) => ({
        abbreviations: chord.abbreviations,
        intervals: chord.intervals,
        key: chord.intervals.map((interval) => INTERVAL_SEMITONES[interval] ?? -1).join(","),
    }));

// Seventh chords first, then sixths and add9s, then triads, with sus chords last; a full
// chord beats one of the same size without its fifth.
function containedChordScore(intervals: string[], abbreviation: string): number {
    let score = intervals.length * 10;
    if (intervals.some((interval) => interval.endsWith("7"))) score += 3;
    else if (intervals.includes("6")) score += 2;
    else if (intervals.includes("9")) score += 1;
    if (abbreviation.includes("sus")) score -= 5;
    if (!intervals.some((interval) => interval.endsWith("5"))) score -= 2;
    return score;
}

function findContainedChord(notes: ScaleNote[], index: number, maxTones: number) {
    const root = notes[index];
    if (!root) return null;
    const byPitchClass = new Map(notes.map((note) => [note.pitchClass, note]));
    let best: { abbreviation: string; tones: DisplayChord["tones"]; score: number } | null = null;
    for (const chord of chordDefinitions) {
        if (chord.intervals.length > maxTones) continue;
        const tones = chord.intervals.map((interval) => {
            const pitchClass = (root.pitchClass + (INTERVAL_SEMITONES[interval] ?? -100) + 12) % 12;
            const note = byPitchClass.get(pitchClass);
            return note ? { ...note, interval } : null;
        });
        if (tones.some((tone) => tone == null)) continue;
        const abbreviation = chord.abbreviations[0];
        const score = containedChordScore(chord.intervals, abbreviation);
        if (!best || score > best.score) {
            best = { abbreviation, tones: tones as DisplayChord["tones"], score };
        }
    }
    return best;
}

function findChordBySemitones(semitones: number[], preferred: string) {
    const key = semitones.join(",");
    const matches = NAMED_CHORDS.filter((chord) => chord.key === key);
    const chord = matches.find((entry) => entry.abbreviations.includes(preferred)) ?? matches[0];
    if (!chord) return null;
    return {
        abbreviation: chord.abbreviations.includes(preferred) ? preferred : chord.abbreviations[0],
        intervals: chord.intervals,
    };
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

function getRomanNumeral(degree: string, chord: string): string {
    const accidental = degree.match(/^[♭♯]/)?.[0] ?? "";
    const degreeNumber = Number.parseInt(degree.replace(/^[♭♯]/, ""), 10);
    const numeral = ROMAN_NUMERALS[degreeNumber - 1] ?? degree;
    const isMinor = /^(m(?!aj)|dim)/.test(chord) || (chord.startsWith("(") && chord.includes("♭3"));
    let suffix = chord;
    if (chord === "m7♭5") suffix = "ø7";
    else if (chord.startsWith("dim")) suffix = chord.replace("dim", "°");
    else if (chord.startsWith("aug")) suffix = chord.replace("aug", "+");
    else if (chord.startsWith("mMaj")) suffix = chord.replace("mMaj", "maj");
    else if (isMinor && !chord.startsWith("(")) suffix = chord.slice(1);
    return `${accidental}${isMinor ? numeral.toLowerCase() : numeral}${suffix}`;
}
