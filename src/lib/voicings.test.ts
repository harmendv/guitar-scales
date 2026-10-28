import { describe, expect, it } from "vitest";
import { spellChord } from "@/lib/harmony";
import { builtInTunings } from "@/lib/tunings";
import { getVoicings, type Voicing } from "@/lib/voicings";

const tuning = (label: string) => builtInTunings.find((entry) => entry.label === label)!.data;
const standard = tuning("Default");
const chord = (root: string, intervals: string[]) => spellChord(root, intervals, 0);
const shape = (voicing: Voicing) => voicing.frets.map((fret) => fret ?? "x").join(" ");
const shapes = (voicings: Voicing[]) => voicings.map((voicing) => `${voicing.label}: ${shape(voicing)}`);

function span(voicing: Voicing) {
    const fretted = voicing.frets.filter((fret): fret is number => fret != null && fret > 0);
    return fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
}

describe("triad shapes in standard tuning", () => {
    const c = getVoicings(chord("C", ["1", "3", "5"]), standard, 22);

    it("finds the CAGED shapes for C", () => {
        expect(shapes(c)).toEqual(expect.arrayContaining([
            "C shape: x 3 2 0 1 0",
            "A shape: x 3 5 5 5 3",
            "G shape: 8 7 5 5 5 8",
            "E shape: 8 10 10 9 8 8",
            "D shape: x x 10 12 13 12",
        ]));
    });

    it("lists them up the neck with the intervals each string plays", () => {
        expect(c.map((voicing) => voicing.baseFret)).toEqual([...c.map((voicing) => voicing.baseFret)].sort((a, b) => a - b));
        expect(c.find((voicing) => voicing.label === "E shape" && voicing.frets[0] === 8)?.intervals).toEqual(["1", "5", "1", "3", "5", "1"]);
    });

    it("plays minor chords from the same templates", () => {
        expect(shapes(getVoicings(chord("A", ["1", "♭3", "5"]), standard, 22))).toEqual(
            expect.arrayContaining(["A shape: x 0 2 2 1 0", "E shape: 5 7 7 5 5 5"])
        );
    });
});

describe("seventh shapes", () => {
    it("finds drop and shell voicings for Cmaj7", () => {
        expect(shapes(getVoicings(chord("C", ["1", "3", "5", "7"]), standard, 22))).toEqual(
            expect.arrayContaining(["Drop 3: 8 x 9 9 8 x", "Drop 2: x 3 5 4 5 x", "Shell: x 3 2 4 x x"])
        );
    });

    it("finds open G7", () => {
        expect(shapes(getVoicings(chord("G", ["1", "3", "5", "♭7"]), standard, 22))).toEqual(
            expect.arrayContaining(["E shape: 3 5 3 4 3 3"])
        );
    });
});

describe("any chord, any tuning", () => {
    it("never needs more than four frets or four fingers", () => {
        for (const intervals of [["1", "3", "5"], ["1", "♭3", "♭5", "♭7"], ["1", "4", "5", "♭7"], ["1", "♭3", "11", "♭7"]]) {
            for (const voicing of getVoicings(chord("F♯", intervals), standard, 22)) {
                expect(span(voicing)).toBeLessThanOrEqual(3);
            }
        }
    });

    it("drops shapes the tuning can't reach in drop D", () => {
        const dropD = getVoicings(chord("C", ["1", "3", "5"]), tuning("Drop-D"), 22);
        expect(dropD.length).toBeGreaterThan(0);
        dropD.forEach((voicing) => expect(span(voicing)).toBeLessThanOrEqual(3));
        expect(shapes(dropD)).toContain("C shape: x 3 2 0 1 0");
    });

    it("searches for shapes when no template fits", () => {
        // m7(11) has no fifth, so no template covers it
        const voicings = getVoicings(chord("A", ["1", "♭3", "11", "♭7"]), standard, 22);
        expect(voicings.length).toBeGreaterThan(0);
        expect(voicings.every((voicing) => voicing.label.startsWith("Root on string"))).toBe(true);
        expect(voicings.every((voicing) => voicing.intervals.find((interval) => interval != null) === "1")).toBe(true);
    });

    it("works on a four-string ukulele", () => {
        const voicings = getVoicings(chord("C", ["1", "3", "5"]), tuning("Ukulele"), 15);
        expect(voicings.length).toBeGreaterThan(0);
        voicings.forEach((voicing) => expect(voicing.frets).toHaveLength(4));
    });
});
