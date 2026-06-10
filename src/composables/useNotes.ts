import { scales } from "@/composables/useScales";

export interface Note {
    id: number;
    name: string;
}

export interface ScaleNote {
    pitchClass: number;
    note: string;
    degree: string;
}

export type AccidentalPreference = "auto" | "sharp" | "flat";
export type ResolvedAccidentalPreference = Exclude<AccidentalPreference, "auto">;

const CANONICAL_NOTE_NAMES = [
    "A",
    "Bb",
    "B",
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
] as const;

const NORMALIZED_PITCH_CLASS_ENTRIES = [
    ["C", 0],
    ["C#", 1],
    ["DB", 1],
    ["C♯", 1],
    ["D", 2],
    ["D#", 3],
    ["EB", 3],
    ["D♯", 3],
    ["E", 4],
    ["F", 5],
    ["F#", 6],
    ["GB", 6],
    ["F♯", 6],
    ["G", 7],
    ["G#", 8],
    ["AB", 8],
    ["G♯", 8],
    ["A", 9],
    ["A#", 10],
    ["BB", 10],
    ["A♯", 10],
    ["B", 11],
] as const;

function modulo(value: number, base: number): number {
    return ((value % base) + base) % base;
}

const DEGREE_BY_SEMITONE = [
    "1",
    "♭2",
    "2",
    "♭3",
    "3",
    "4",
    "♭5",
    "5",
    "♭6",
    "6",
    "♭7",
    "7",
] as const;

function normalizeNoteName(note: string): string {
    return note.trim().replaceAll("♭", "b").toUpperCase();
}

export function getPitchClass(note: string): number | null {
    if (typeof note !== "string") return null;
    const normalized = normalizeNoteName(note);
    return noteSemitoneMap[normalized] ?? null;
}

const SHARP_NOTE_NAMES = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
] as const;

const FLAT_NOTE_NAMES = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
] as const;

export function resolveAccidentalPreference(
    note: string,
    preference: AccidentalPreference = "auto"
): ResolvedAccidentalPreference {
    if (preference !== "auto") return preference;
    return note.includes("b") || note.includes("♭") ? "flat" : "sharp";
}

export function formatPitchClass(
    pitchClass: number,
    preference: ResolvedAccidentalPreference = "sharp"
): string {
    const normalizedPitchClass = modulo(pitchClass, 12);
    return preference === "flat"
        ? FLAT_NOTE_NAMES[normalizedPitchClass]
        : SHARP_NOTE_NAMES[normalizedPitchClass];
}

export const notes: Note[] = CANONICAL_NOTE_NAMES.map((name, index) => ({
    id: index + 1,
    name,
}));

export const noteSemitoneMap: Record<string, number> = Object.fromEntries(
    NORMALIZED_PITCH_CLASS_ENTRIES
) as Record<string, number>;

export function notesFlatMap(): string[] {
    return [...CANONICAL_NOTE_NAMES];
}

export function getNoteByOffset(
    start = "C",
    offset = 0,
    preference: AccidentalPreference = "auto"
): string {
    const startPitchClass = getPitchClass(start);
    if (startPitchClass == null) return "";

    return formatPitchClass(
        startPitchClass + Math.trunc(offset),
        resolveAccidentalPreference(start, preference)
    );
}

export function getScaleNotes(
    scaleIndex: number,
    mode: number,
    note: string,
    preference: AccidentalPreference = "auto"
): ScaleNote[] {
    const scale = scales[scaleIndex];
    if (!scale) return [];

    const modeEntry = scale.formula[mode - 1];
    if (!modeEntry) return [];

    const modeOffset = modeEntry.chromatic - 1;
    const parentPitchClass = getPitchClass(note);
    if (parentPitchClass == null) return [];

    const rotatedFormula = [
        ...scale.formula.slice(mode - 1),
        ...scale.formula.slice(0, mode - 1),
    ];

    return rotatedFormula.map((entry) => {
        const semitoneFromParent = entry.chromatic - 1;
        const semitoneFromModeRoot = modulo(semitoneFromParent - modeOffset, 12);

        return {
            pitchClass: modulo(parentPitchClass + semitoneFromParent, 12),
            note: getNoteByOffset(note, semitoneFromParent, preference),
            degree: DEGREE_BY_SEMITONE[semitoneFromModeRoot],
        };
    });
}

export function getModeRootNote(
    scaleIndex: number,
    mode: number,
    note: string,
    preference: AccidentalPreference = "auto"
): string {
    const scale = scales[scaleIndex];
    const modeEntry = scale?.formula[mode - 1];
    if (!modeEntry) return "";
    return getNoteByOffset(note, modeEntry.chromatic - 1, preference);
}
