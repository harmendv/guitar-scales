import { chords as chordDefinitions } from "@/lib/chords";
import {
    formatPitchClass,
    getPitchClass,
    getScaleNotes,
    type ScaleNote,
} from "@/lib/notes";
import { scales, type ScaleFormulaEntry } from "@/lib/scales";

export type ChordKind = "diatonic" | "secondary" | "borrowed";
export type ChordTone = ScaleNote & { interval?: string };

export interface DisplayChord {
    // Diatonic chords are their degree ("2"), secondary dominants their target ("V/2"),
    // borrowed chords their source mode and degree ("aeolian-6")
    id: string;
    kind: ChordKind;
    note: string;
    chord: string;
    degree: string;
    numeral: string;
    tones: ChordTone[];
    // Where a chord from outside the key usually goes next ("→ Dm7")
    caption?: string;
    // The parallel mode a borrowed chord comes from
    source?: string;
}

const INTERVAL_SEMITONES: Record<string, number> = {
    "1": 0, "♭2": 1, "2": 2, "♭3": 3, "3": 4, "4": 5, "♭5": 6, "5": 7,
    "♯5": 8, "♭6": 8, "6": 9, "♭♭7": 9, "♭7": 10, "7": 11, "♭9": 1, "9": 2, "11": 5, "13": 9,
};
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];
const DEGREES = ["1", "♭2", "2", "♭3", "3", "4", "♭5", "5", "♭6", "6", "♭7", "7"];
const SEMITONE_INTERVALS = ["1", "♭2", "2", "♭3", "3", "4", "♭5", "5", "♯5", "6", "♭7", "7"];

// The note with this letter and pitch class (G♯ rather than A♭ when the letter is G).
// E♯, C♭ and double accidentals aren't supported elsewhere, so those keep an enharmonic name.
function spellOnLetter(letterIndex: number, pitchClass: number, fallback: string): string {
    const letter = LETTERS[letterIndex % 7];
    const offset = ((pitchClass - LETTER_PITCH_CLASSES[letterIndex % 7] + 18) % 12) - 6;
    const accidental = offset === 1 ? "♯" : offset === -1 ? "b" : offset === 0 ? "" : null;
    const note = `${letter}${accidental ?? ""}`;
    return accidental != null && getPitchClass(note) === pitchClass ? note : fallback;
}

export function spellByLetter(notes: ScaleNote[]): ScaleNote[] {
    const rootLetterIndex = LETTERS.indexOf(notes[0]?.note[0] ?? "");
    if (rootLetterIndex < 0) return notes;
    const rootPitchClass = notes[0].pitchClass;
    return notes.map((scaleNote, index) => {
        const semitones = (scaleNote.pitchClass - rootPitchClass + 12) % 12;
        const degreeOffset = semitones - LETTER_PITCH_CLASSES[index];
        const degreeAccidental = degreeOffset === 1 ? "♯" : degreeOffset === -1 ? "♭" : degreeOffset === 0 ? "" : null;
        return {
            ...scaleNote,
            note: spellOnLetter(rootLetterIndex + index, scaleNote.pitchClass, scaleNote.note),
            degree: degreeAccidental != null ? `${degreeAccidental}${index + 1}` : scaleNote.degree,
        };
    });
}

// Spells a chord from its root by interval number, so a 3rd is always two letters up:
// A7 is A C♯ E G, never A D♭ E G. Degrees are relative to the tonic.
export function spellChord(root: string, intervals: string[], tonicPitchClass: number): ChordTone[] {
    const rootPitchClass = getPitchClass(root);
    const rootLetterIndex = LETTERS.indexOf(root[0] ?? "");
    if (rootPitchClass == null || rootLetterIndex < 0) return [];
    const preference = root.includes("b") ? "flat" : "sharp";
    return intervals.map((interval) => {
        const pitchClass = (rootPitchClass + (INTERVAL_SEMITONES[interval] ?? 0)) % 12;
        const number = Number.parseInt(interval.replace(/^[♭♯]+/, ""), 10);
        return {
            pitchClass,
            note: spellOnLetter(rootLetterIndex + number - 1, pitchClass, formatPitchClass(pitchClass, preference)),
            degree: DEGREES[(pitchClass - tonicPitchClass + 12) % 12],
            interval,
        };
    });
}

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
    let best: { abbreviation: string; tones: ChordTone[]; score: number } | null = null;
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
            best = { abbreviation, tones: tones as ChordTone[], score };
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

export function getRomanNumeral(degree: string, chord: string): string {
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

// The chords of a scale, from its notes (rotated to the mode, tonic first) and its formula
// rotated the same way. Stacks every other scale note and names the chord it makes.
export function buildDiatonicChords(
    notes: ScaleNote[],
    formula: ScaleFormulaEntry[],
    toneCount: 3 | 4
): DisplayChord[] {
    const count = notes.length;
    return formula.map((entry, index) => {
        const degree = notes[index]?.degree ?? entry.degree;
        const id = String(index + 1);
        // Stacking every other note of a five-note scale gives quartal shapes, so use the
        // fullest standard chord on this degree whose notes are all in the scale instead.
        const contained = count < 6 ? findContainedChord(notes, index, toneCount) : null;
        if (contained) {
            return {
                id,
                kind: "diatonic",
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
        const rootPitchClass = stacked[0]?.pitchClass ?? 0;
        const semitones = stacked.map((tone) => (tone.pitchClass - rootPitchClass + 12) % 12);
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
            id,
            kind: "diatonic",
            note: notes[index]?.note ?? "",
            chord,
            degree,
            numeral: getRomanNumeral(degree, chord),
            tones,
        };
    });
}

// "", "m", "dim" or "aug" from the chord's third and fifth; null for sus and fifthless chords.
function triadQuality(chord: DisplayChord): string | null {
    const root = chord.tones[0]?.pitchClass ?? 0;
    const semitones = new Set(chord.tones.map((tone) => (tone.pitchClass - root + 12) % 12));
    if (semitones.has(4) && semitones.has(7)) return "";
    if (semitones.has(3) && semitones.has(7)) return "m";
    if (semitones.has(3) && semitones.has(6)) return "dim";
    if (semitones.has(4) && semitones.has(8)) return "aug";
    return null;
}

// Two chords are the same if they share a root and pitch classes, whatever they're called.
function chordKey(chord: DisplayChord): string {
    const pitchClasses = [...new Set(chord.tones.map((tone) => tone.pitchClass))].sort((a, b) => a - b);
    return `${chord.tones[0]?.pitchClass}:${pitchClasses.join(",")}`;
}

function baseNumeral(numeral: string): string {
    return numeral.match(/^[♭♯]?[ivIV]+/)?.[0] ?? numeral;
}

// The dominant a fifth above each major or minor chord of the key (V7/ii is A7 in C), leaving
// out the tonic, whose dominant is already in the key, and any that's in the key anyway.
export function buildSecondaryDominants(diatonic: DisplayChord[], toneCount: 3 | 4): DisplayChord[] {
    if (diatonic.length !== 7) return [];
    const tonicPitchClass = diatonic[0].tones[0]?.pitchClass ?? 0;
    const inKey = new Set(diatonic.map(chordKey));
    const intervals = toneCount === 4 ? ["1", "3", "5", "♭7"] : ["1", "3", "5"];
    const chord = toneCount === 4 ? "7" : "";
    return diatonic.flatMap((target, index) => {
        const quality = triadQuality(target);
        if (index === 0 || (quality !== "" && quality !== "m")) return [];
        const targetLetterIndex = LETTERS.indexOf(target.note[0] ?? "");
        const targetPitchClass = target.tones[0]?.pitchClass;
        if (targetLetterIndex < 0 || targetPitchClass == null) return [];
        const rootPitchClass = (targetPitchClass + 7) % 12;
        const root = spellOnLetter(targetLetterIndex + 4, rootPitchClass, formatPitchClass(rootPitchClass, "sharp"));
        const tones = spellChord(root, intervals, tonicPitchClass);
                const dominant: DisplayChord = {
            id: `V/${index + 1}`,
            kind: "secondary",
            note: root,
            chord,
            degree: tones[0]?.degree ?? "",
            numeral: `V${chord}/${baseNumeral(target.numeral)}`,
            tones,
            caption: `→ ${formatChordName(target.note, target.chord)}`,
        };
        return inKey.has(chordKey(dominant)) ? [] : [dominant];
    });
}

function formatChordName(note: string, chord: string): string {
    return `${note.replace(/^([A-G])b/, "$1♭")}${chord}`;
}

// The borrowed chords guitarists reach for most, by degree and triad quality, in that order.
const COMMON_BORROWED = ["4m", "♭6", "♭7", "♭3", "2dim", "5m", "♭2", "4", "5", "1", "2", "1m", "2m", "6m", "♭7m", "♭3m", "♭6m"];
// Where each borrowed chord usually goes, as a degree of the key and, where it matters, the
// triad it needs there: iv and ♭VII back home, ♭VI on to a major ♭VII, ii° and Lydian II to a
// major V. A major I in a minor key is the Picardy third that ends it.
const MAJOR = "";
const BORROWED_RESOLUTIONS: Record<string, { degree: string; quality?: string }> = {
    "4m": { degree: "1" },
    "♭6": { degree: "♭7", quality: MAJOR },
    "♭7": { degree: "1" },
    "♭3": { degree: "4" },
    "2dim": { degree: "5", quality: MAJOR },
    "5m": { degree: "1" },
    "♭2": { degree: "1" },
    "4": { degree: "1" },
    "5": { degree: "1" },
    "2": { degree: "5", quality: MAJOR },
    "2m": { degree: "5", quality: MAJOR },
    "♭7m": { degree: "1" },
    "♭6m": { degree: "1" },
};

// Parallel modes to borrow from, most familiar first, so the same chord is credited to the
// likeliest source.
const BORROW_SOURCE_MODES = [6, 2, 5, 3, 4, 1, 7];
const MAJOR_SCALE_INDEX = scales.findIndex((scale) => scale.slug === "major");

// Chords from the other modes of the major scale on the same tonic (Fm, A♭ and B♭ in C major),
// leaving out any that are in the key already. Only for seven-note scales.
export function buildBorrowedChords(
    scaleNotes: ScaleNote[],
    diatonic: DisplayChord[],
    toneCount: 3 | 4,
    limit = 7
): DisplayChord[] {
    const tonic = scaleNotes[0];
    const major = scales[MAJOR_SCALE_INDEX];
    if (scaleNotes.length !== 7 || !tonic || !major) return [];
    const seen = new Set(diatonic.map(chordKey));
    const borrowed: { chord: DisplayChord; rank: number; shape: string }[] = [];
    BORROW_SOURCE_MODES.forEach((mode, sourceIndex) => {
        const entry = major.formula[mode - 1];
        const parent = formatPitchClass(tonic.pitchClass - (entry.chromatic - 1), "sharp");
        const modeNotes = getScaleNotes(MAJOR_SCALE_INDEX, mode, parent, "sharp");
        // Spell from the key's own tonic, so it's D♭ Aeolian rather than C♯ Aeolian in D♭
        modeNotes[0] = { ...modeNotes[0], note: tonic.note };
        const formula = [...major.formula.slice(mode - 1), ...major.formula.slice(0, mode - 1)];
        const modeName = entry.mode.split(" / ")[0];
        buildDiatonicChords(spellByLetter(modeNotes), formula, toneCount).forEach((chord, index) => {
            // One suggestion per degree and triad, from the likeliest mode: A♭maj7 from Aeolian,
            // not also A♭7 from Locrian
            const key = chordKey(chord);
            const shape = `${chord.degree}${triadQuality(chord) ?? "?"}`;
            if (seen.has(key) || seen.has(shape)) return;
            seen.add(key);
            seen.add(shape);
            const common = COMMON_BORROWED.indexOf(shape);
            borrowed.push({
                chord: {
                    ...chord,
                    id: `${modeName.toLowerCase()}-${index + 1}`,
                    kind: "borrowed",
                    source: modeName,
                },
                rank: common >= 0 ? common : 100 + sourceIndex * 10 + index,
                shape,
            });
        });
    });
    // Name where each one goes in this key: the key's own chord on that degree, else a borrowed
    // one, followed on until it lands in the key (♭VI → ♭VII → I is A♭ → B♭ → C in C major)
    const candidates = [...diatonic, ...borrowed.map(({ chord }) => chord)];
    function caption(shape: string): string | undefined {
        if (shape === "1") return "Final chord";
        const steps: string[] = [];
        let resolution = BORROWED_RESOLUTIONS[shape];
        while (resolution != null && steps.length < 3) {
            const { degree, quality } = resolution;
            // ii° wants G, not the Gm of C Dorian, even if that means borrowing G as well
            const target = candidates.find(
                (chord) => chord.degree === degree && (quality == null || triadQuality(chord) === quality)
            );
            if (!target) break;
            steps.push(formatChordName(target.note, target.chord));
            if (target.kind === "diatonic") break;
            resolution = BORROWED_RESOLUTIONS[`${target.degree}${triadQuality(target) ?? "?"}`];
        }
        return steps.length ? `→ ${steps.join(" → ")}` : undefined;
    }
    return borrowed
        .sort((left, right) => left.rank - right.rank)
        .slice(0, limit)
        .map(({ chord, shape }) => ({ ...chord, caption: caption(shape) }));
}
