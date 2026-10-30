export interface Chord {
    id: number;
    name: string;
    abbreviations: string[];
    intervals: string[];
}

// Fretboard view of the selected chords, keyed by pitch class: one colour per chord the note is
// in, the colour of the chord it's the root of (if any), the interval to label it with, the
// chord's spelling of the note, and whether it falls outside the key. While a progression plays,
// the tones of the chord it's on are marked active; one with no colours
// is only that, a ring around a plain note.
export type ChordTones = Record<
    string,
    {
        colors: string[];
        rootColor?: string;
        interval?: string;
        note?: string;
        outside?: boolean;
        active?: boolean;
    }
>;

// Each degree keeps its own colour, so adding or removing a chord never recolours the others.
export function chordColor(index: number): string {
    return `var(--chord-${(index % 8) + 1})`;
}

// Chords from outside the key take one of these while selected, clear of the degree colours.
export const EXTRA_CHORD_COLOR_COUNT = 4;
export function extraChordColor(index: number): string {
    return `var(--chord-${(index % EXTRA_CHORD_COLOR_COUNT) + 9})`;
}

const chords: Chord[] = [
    {
        id: 1,
        name: "Major",
        abbreviations: ["", "maj", "M", "Δ"],
        intervals: ["1", "3", "5"],
    },
    {
        id: 2,
        name: "Major 6th",
        abbreviations: ["6", "maj6", "M6"],
        intervals: ["1", "3", "5", "6"],
    },
    {
        id: 3,
        name: "Major 6th sharp fifth",
        abbreviations: ["6♯5"],
        intervals: ["1", "3", "♯5", "6"],
    },
    {
        id: 4,
        name: "Major 7th",
        abbreviations: ["maj7", "M7", "Δ7"],
        intervals: ["1", "3", "5", "7"],
    },
    {
        id: 28,
        name: "Major 7th flat fifth",
        abbreviations: ["maj7♭5"],
        intervals: ["1", "3", "♭5", "7"],
    },
    {
        id: 5,
        name: "Major 7th Sharp Fifth",
        abbreviations: ["maj7♯5"],
        intervals: ["1", "3", "♯5", "7"],
    },
    {
        id: 6,
        name: "Major 9th",
        abbreviations: ["maj9", "M9"],
        intervals: ["1", "3", "5", "7", "9"],
    },
    {
        id: 7,
        name: "Major 13th",
        abbreviations: ["maj13", "M13"],
        intervals: ["1", "3", "5", "7", "9", "13"],
    },
    {
        id: 8,
        name: "Dominant 7th",
        abbreviations: ["7", "dom7"],
        intervals: ["1", "3", "5", "♭7"],
    },
    {
        id: 9,
        name: "Dominant 7th flat fifth",
        abbreviations: ["7♭5"],
        intervals: ["1", "3", "♭5", "♭7"],
    },
    {
        id: 10,
        name: "Dominant 7th sharp fifth",
        abbreviations: ["7♯5"],
        intervals: ["1", "3", "♯5", "♭7"],
    },
    {
        id: 11,
        name: "Dominant 9th",
        abbreviations: ["9", "dom9"],
        intervals: ["1", "3", "5", "♭7", "9"],
    },
    {
        id: 12,
        name: "Dominant 11th",
        abbreviations: ["11", "dom11"],
        intervals: ["1", "3", "5", "♭7", "9", "11"],
    },
    {
        id: 13,
        name: "Minor",
        abbreviations: ["m", "min", "-"],
        intervals: ["1", "♭3", "5"],
    },
    {
        id: 14,
        name: "Minor 6th",
        abbreviations: ["m6", "min6"],
        intervals: ["1", "♭3", "5", "6"],
    },
    {
        id: 15,
        name: "Minor 7th",
        abbreviations: ["m7", "min7"],
        intervals: ["1", "♭3", "5", "♭7"],
    },

    {
        id: 16,
        name: "Minor 9th",
        abbreviations: ["m9", "min9"],
        intervals: ["1", "♭3", "5", "♭7", "9"],
    },
    {
        id: 17,
        name: "Minor 11th",
        abbreviations: ["m11", "min11"],
        intervals: ["1", "♭3", "5", "♭7", "9", "11"],
    },
    {
        id: 18,
        name: "Minor 13th",
        abbreviations: ["m13", "min13"],
        intervals: ["1", "♭3", "5", "♭7", "9", "13"],
    },
    {
        id: 19,
        name: "Minor Major 7th",
        abbreviations: ["mMaj7"],
        intervals: ["1", "♭3", "5", "7"],
    },
    {
        id: 20,
        name: "Diminished",
        abbreviations: ["dim", "°"],
        intervals: ["1", "♭3", "♭5"],
    },
    {
        id: 21,
        name: "Diminished 7th",
        abbreviations: ["dim7", "°7"],
        intervals: ["1", "♭3", "♭5", "♭♭7"],
    },
    {
        id: 22,
        name: "Half Diminished",
        abbreviations: ["m7♭5", "ø"],
        intervals: ["1", "♭3", "♭5", "♭7"],
    },
    {
        id: 23,
        name: "Augmented",
        abbreviations: ["aug", "+"],
        intervals: ["1", "3", "♯5"],
    },
    {
        id: 24,
        name: "Augmented 7th",
        abbreviations: ["aug7", "+7", "7+", "7♯5"],
        intervals: ["1", "3", "♯5", "♭7"],
    },
    {
        id: 25,
        name: "Sus 2",
        abbreviations: ["sus2"],
        intervals: ["1", "2", "5"],
    },
    {
        id: 26,
        name: "Sus 4",
        abbreviations: ["sus4"],
        intervals: ["1", "4", "5"],
    },
    {
        id: 27,
        name: "Add 9",
        abbreviations: ["add9"],
        intervals: ["1", "3", "5", "9"],
    },
    {
        id: 29,
        name: "Dominant 7th sus 4",
        abbreviations: ["7sus4"],
        intervals: ["1", "4", "5", "♭7"],
    },
    {
        // No fifth: the shape pentatonic scales give on their minor degrees (G B♭ C F)
        id: 30,
        name: "Minor 7th add 11",
        abbreviations: ["m7(11)"],
        intervals: ["1", "♭3", "11", "♭7"],
    },
];

export { chords };
