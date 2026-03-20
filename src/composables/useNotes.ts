import { scales } from "@/composables/useScales";

export interface Note {
    id: number;
    name: string;
}

export interface ScaleNote {
    note: string;
    degree: string;
}

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

function normalizeNoteName(note: string): string {
    return note.trim().replaceAll("♭", "b").toUpperCase();
}

function getPitchClass(note: string): number | null {
    if (typeof note !== "string") return null;
    const normalized = normalizeNoteName(note);
    return noteSemitoneMap[normalized] ?? null;
}

function formatPitchClass(pitchClass: number): string {
    return CANONICAL_NOTE_NAMES[modulo(pitchClass - 9, CANONICAL_NOTE_NAMES.length)];
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

export function getNoteByOffset(start = "C", offset = 0): string {
    const startPitchClass = getPitchClass(start);
    if (startPitchClass == null) return "";

    return formatPitchClass(startPitchClass + Math.trunc(offset));
}

export function getScaleNotes(scaleIndex: number, mode: number, note: string): ScaleNote[] {
    const scale = scales[scaleIndex];
    if (!scale) return [];

    const modeEntry = scale.formula[mode - 1];
    if (!modeEntry) return [];

    const modeOffset = modeEntry.chromatic - 1;

    return scale.formula.map((entry) => ({
        note: getNoteByOffset(note, entry.chromatic - 1 + (12 - modeOffset)),
        degree: entry.degree,
    }));
}
