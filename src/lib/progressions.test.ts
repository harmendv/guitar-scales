import { describe, expect, it } from "vitest";
import {
    buildBorrowedChords,
    buildDiatonicChords,
    buildSecondaryDominants,
    spellByLetter,
    type DisplayChord,
} from "@/lib/harmony";
import { getScaleNotes } from "@/lib/notes";
import { findProgressions, progressions } from "@/lib/progressions";
import { scales } from "@/lib/scales";

function key(scaleSlug: string, mode: number, parent: string, toneCount: 3 | 4 = 3) {
    const scaleIndex = scales.findIndex((scale) => scale.slug === scaleSlug);
    const formula = scales[scaleIndex].formula;
    const notes = spellByLetter(getScaleNotes(scaleIndex, mode, parent));
    const rotated = [...formula.slice(mode - 1), ...formula.slice(0, mode - 1)];
    const diatonic = buildDiatonicChords(notes, rotated, toneCount);
    const outside = [
        ...buildSecondaryDominants(diatonic, toneCount),
        ...buildBorrowedChords(notes, diatonic, toneCount, Infinity),
    ];
    const found = findProgressions(diatonic, outside, rotated[0].mode.split(" / ")[0]);
    return {
        found,
        chordsOf: (id: string) => found.find((entry) => entry.progression.id === id)?.chords.map(name),
    };
}

const name = (chord: DisplayChord) => `${chord.note}${chord.chord}`;

describe("progressions", () => {
    it("have unique ids", () => {
        const ids = progressions.map((progression) => progression.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("plays the pop progression from the key's own chords", () => {
        const { found, chordsOf } = key("major", 1, "C");
        expect(chordsOf("pop")).toEqual(["C", "G", "Am", "F"]);
        expect(found[0].progression.id).toBe("pop");
        expect(found[0].numerals).toEqual(["I", "V", "vi", "IV"]);
        expect(found[0].outside).toBe(0);
    });

    it("follows the Triads/7ths setting", () => {
        expect(key("major", 1, "C", 4).chordsOf("ii-v-i")).toEqual(["Dm7", "G7", "Cmaj7"]);
    });

    it("lists progressions that stay in the key before ones that borrow", () => {
        const { found } = key("major", 1, "C");
        const outside = found.map((entry) => entry.outside);
        expect(outside).toEqual([...outside].sort((left, right) => left - right));
        const mixolydian = found.find((entry) => entry.progression.id === "mixolydian-rock");
        expect(mixolydian?.chords.map(name)).toEqual(["C", "Bb", "F", "C"]);
        expect(mixolydian?.outside).toBe(1);
    });

    it("groups them like the chords", () => {
        const kinds = (id: string) => key("major", 1, "C").found.find((entry) => entry.progression.id === id)?.kind;
        expect(kinds("pop")).toBe("diatonic");
        expect(kinds("ragtime")).toBe("secondary");
        expect(kinds("lydian-vamp")).toBe("borrowed");
        expect(kinds("mixolydian-rock")).toBe("borrowed");
    });

    it("reaches chords outside the key through secondary dominants", () => {
        const { found } = key("major", 1, "C");
        const ragtime = found.find((entry) => entry.progression.id === "ragtime");
        expect(ragtime?.chords.map(name)).toEqual(["E", "A", "D", "G", "C"]);
        expect(ragtime?.numerals).toEqual(["V/vi", "V/ii", "V/V", "V", "I"]);

    });

    it("only reads an outside chord as a secondary dominant when it resolves", () => {
        // C–D never reaches G, so its D is Lydian's II, not V/V
        const lydian = key("major", 1, "C").found.find((entry) => entry.progression.id === "lydian-vamp");
        expect(lydian?.numerals).toEqual(["I", "II"]);
        expect(lydian?.chords[1].source).toBe("Lydian");
        // In A minor the Dorian vamp's D is Dorian's IV, not the V of G
        const dorian = key("major", 6, "C").found.find((entry) => entry.progression.id === "dorian-vamp");
        expect(dorian?.numerals).toEqual(["i", "IV"]);
        expect(dorian?.chords[1].source).toBe("Dorian");
    });

    it("puts a mode's own progressions first", () => {
        expect(key("major", 5, "C").found[0].progression.id).toBe("mixolydian-rock");
        expect(key("major", 2, "C").found[0].progression.id).toBe("dorian-vamp");
        expect(key("major", 2, "C").chordsOf("dorian-vamp")).toEqual(["Dm", "G"]);
    });

    it("only offers progressions written for the key's tonic", () => {
        const major = key("major", 1, "C").found.map((entry) => entry.progression.tonic);
        expect(new Set(major)).toEqual(new Set(["major"]));
        const minor = key("major", 6, "C").found.map((entry) => entry.progression.tonic);
        expect(new Set(minor)).toEqual(new Set(["minor"]));
    });

    it("borrows the major V for the Andalusian cadence in natural minor", () => {
        const { found } = key("major", 6, "C");
        const andalusian = found.find((entry) => entry.progression.id === "andalusian");
        expect(andalusian?.chords.map(name)).toEqual(["Am", "G", "F", "E"]);
        expect(andalusian?.outside).toBe(1);
    });

    it("leaves out progressions that are mostly outside the key", () => {
        // E Phrygian dominant could borrow C♯m and B for the pop progression, but that's E major
        const ids = key("harmonic-minor", 5, "A").found.map((entry) => entry.progression.id);
        expect(ids[0]).toBe("flamenco");
        expect(ids).not.toContain("pop");
        expect(key("major", 1, "C").found.map((entry) => entry.progression.id)).not.toContain("flamenco");
    });

    it("finds nothing for a tonic that isn't a major or minor triad", () => {
        expect(key("major", 7, "C").found).toEqual([]);
    });
});
