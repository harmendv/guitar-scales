import { describe, expect, it } from "vitest";
import {
    buildBorrowedChords,
    buildDiatonicChords,
    buildSecondaryDominants,
    spellByLetter,
    spellChord,
    type DisplayChord,
} from "@/lib/harmony";
import { getScaleNotes } from "@/lib/notes";
import { scales } from "@/lib/scales";

function key(scaleSlug: string, mode: number, parent: string, toneCount: 3 | 4 = 4) {
    const scaleIndex = scales.findIndex((scale) => scale.slug === scaleSlug);
    const formula = scales[scaleIndex].formula;
    const notes = spellByLetter(getScaleNotes(scaleIndex, mode, parent));
    const rotated = [...formula.slice(mode - 1), ...formula.slice(0, mode - 1)];
    const diatonic = buildDiatonicChords(notes, rotated, toneCount);
    return {
        notes,
        diatonic,
        secondary: buildSecondaryDominants(diatonic, toneCount),
        borrowed: buildBorrowedChords(notes, diatonic, toneCount),
    };
}

const name = (chord: DisplayChord) => `${chord.note}${chord.chord}`;
const spelled = (chord: DisplayChord) => chord.tones.map((tone) => tone.note).join(" ");

describe("spellChord", () => {
    it("spells by interval number, not by key signature", () => {
        expect(spellChord("A", ["1", "3", "5", "♭7"], 0).map((tone) => tone.note)).toEqual(["A", "C♯", "E", "G"]);
        expect(spellChord("Eb", ["1", "3", "5"], 0).map((tone) => tone.note)).toEqual(["Eb", "G", "Bb"]);
    });

    it("gives degrees relative to the tonic", () => {
        expect(spellChord("E", ["1", "3", "5"], 0).map((tone) => tone.degree)).toEqual(["3", "♭6", "7"]);
    });
});

describe("diatonic chords", () => {
    it("keeps the existing C major sevenths", () => {
        expect(key("major", 1, "C").diatonic.map(name)).toEqual(["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7♭5"]);
        expect(key("major", 1, "C").diatonic.map((chord) => chord.id)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    });
});

describe("secondary dominants", () => {
    it("builds V7 of ii, iii, IV, V and vi in C major", () => {
        const { secondary } = key("major", 1, "C");
        expect(secondary.map((chord) => chord.numeral)).toEqual(["V7/ii", "V7/iii", "V7/IV", "V7/V", "V7/vi"]);
        expect(secondary.map(name)).toEqual(["A7", "B7", "C7", "D7", "E7"]);
        expect(spelled(secondary[0])).toBe("A C♯ E G");
        expect(spelled(secondary[4])).toBe("E G♯ B D");
        expect(secondary[0].id).toBe("V/2");
        expect(secondary[0].caption).toBe("→ Dm7");
    });

    it("leaves out dominants already in the key", () => {
        // V/IV in C is a plain C triad, which is I
        expect(key("major", 1, "C", 3).secondary.map(name)).toEqual(["A", "B", "D", "E"]);
        // In A minor V/III is G7, the key's own ♭VII7
        expect(key("major", 6, "C").secondary.map(name)).not.toContain("G7");
    });

    it("spells from the target's letter in flat keys", () => {
        const { secondary } = key("major", 1, "F");
        expect(secondary.map(name)).toEqual(["D7", "E7", "F7", "G7", "A7"]);
        expect(spelled(secondary.find((chord) => chord.note === "D")!)).toBe("D F♯ A C");
        expect(key("major", 1, "Eb").secondary.map(name)).toEqual(["C7", "D7", "Eb7", "F7", "G7"]);
    });

    it("is only offered for seven-note scales", () => {
        expect(key("minor-pentatonic", 1, "A").secondary).toEqual([]);
    });
});

describe("borrowed chords", () => {
    it("suggests the usual borrowings from minor in C major", () => {
        const { borrowed } = key("major", 1, "C", 3);
        expect(borrowed.slice(0, 4).map((chord) => chord.numeral)).toEqual(["iv", "♭VI", "♭VII", "♭III"]);
        expect(borrowed.slice(0, 4).map(name)).toEqual(["Fm", "Ab", "Bb", "Eb"]);
        expect(borrowed[0].source).toBe("Aeolian");
        // iv and ♭VII lead home, ♭VI on to ♭VII, ♭III to IV
        expect(borrowed.slice(0, 4).map((chord) => chord.caption)).toEqual(["→ C", "→ B♭", "→ C", "→ F"]);
        expect(borrowed[0].id).toBe("aeolian-4");
        expect(borrowed.length).toBeLessThanOrEqual(7);
    });

    it("borrows from major in a minor key", () => {
        const names = key("major", 6, "C", 3).borrowed.map(name);
        expect(names).toContain("D");
        expect(names).toContain("E");
        const picardy = key("major", 6, "A", 3).borrowed.find((chord) => chord.numeral === "I");
        expect(picardy?.caption).toBe("Final chord");
    });

    it("never repeats a chord from the key or itself", () => {
        const { diatonic, borrowed } = key("major", 1, "G");
        const all = [...diatonic, ...borrowed].map(spelled);
        expect(new Set(all).size).toBe(all.length);
    });
});

describe("borrowed sevenths", () => {
    it("offers one chord per degree, from the most familiar mode", () => {
        const { borrowed } = key("major", 1, "C");
        expect(borrowed.filter((chord) => chord.degree === "♭6").map(name)).toEqual(["Abmaj7"]);
        expect(borrowed.find((chord) => chord.degree === "♭6")?.source).toBe("Aeolian");
    });
});
