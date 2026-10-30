import { getRomanNumeral, triadQuality, type ChordKind, type DisplayChord } from "@/lib/harmony";

export interface Progression {
    // Kept in the URL, so it shouldn't change
    id: string;
    name: string;
    style: string;
    // The tonic it's written for; it's only offered in keys whose own tonic chord matches
    tonic: "major" | "minor";
    // Each chord as its root's degree above the tonic and its triad: "6m" is vi, "♭7" is ♭VII and
    // "2dim" is ii°. The Triads/7ths setting decides whether it's played as a triad or a seventh.
    steps: string[];
    // Modes it's best known in, by name, where it's listed first
    home?: string[];
}

export interface KeyProgression {
    progression: Progression;
    chords: DisplayChord[];
    // Numerals by degree, so a secondary dominant reads II rather than V/V
    numerals: string[];
    // How many of its chords come from outside the key
    outside: number;
    // Grouped like the chords: in key, with a secondary dominant, or with a borrowed chord (which
    // wins when it has both, being the further from the key)
    kind: ChordKind;
}

export const progressions: Progression[] = [
    { id: "pop", name: "Pop", style: "Pop", tonic: "major", steps: ["1", "5", "6m", "4"], home: ["Ionian"] },
    { id: "pop-vi", name: "Pop from vi", style: "Pop", tonic: "major", steps: ["6m", "4", "1", "5"] },
    { id: "fifties", name: "’50s", style: "Doo-wop", tonic: "major", steps: ["1", "6m", "4", "5"] },
    { id: "three-chord", name: "Three-chord", style: "Rock, folk", tonic: "major", steps: ["1", "4", "5", "1"] },
    { id: "royal-road", name: "Royal road", style: "J-pop", tonic: "major", steps: ["4", "5", "3m", "6m"] },
    { id: "ii-v-i", name: "ii–V–I", style: "Jazz", tonic: "major", steps: ["2m", "5", "1"] },
    { id: "turnaround", name: "Turnaround", style: "Jazz", tonic: "major", steps: ["1", "6m", "2m", "5"] },
    {
        id: "canon",
        name: "Canon",
        style: "Classical",
        tonic: "major",
        steps: ["1", "5", "6m", "3m", "4", "1", "4", "5"],
    },
    { id: "mixolydian-rock", name: "Mixolydian rock", style: "Rock", tonic: "major", steps: ["1", "♭7", "4", "1"], home: ["Mixolydian"] },
    { id: "lydian-vamp", name: "Lydian vamp", style: "Film, fusion", tonic: "major", steps: ["1", "2"], home: ["Lydian"] },
    { id: "minor-plagal", name: "Minor plagal", style: "Ballad", tonic: "major", steps: ["1", "4", "4m", "1"] },
    { id: "backdoor", name: "Backdoor", style: "Jazz", tonic: "major", steps: ["4m", "♭7", "1"] },
    { id: "mario", name: "♭VI–♭VII–I", style: "Rock, games", tonic: "major", steps: ["♭6", "♭7", "1"] },
    { id: "ragtime", name: "Ragtime", style: "Ragtime, swing", tonic: "major", steps: ["3", "6", "2", "5", "1"] },
    { id: "minor-pop", name: "Minor pop", style: "Pop, epic", tonic: "minor", steps: ["1m", "♭6", "♭3", "♭7"], home: ["Aeolian"] },
    { id: "aeolian-rock", name: "Aeolian rock", style: "Rock", tonic: "minor", steps: ["1m", "♭7", "♭6", "♭7"], home: ["Aeolian"] },
    { id: "minor-three-chord", name: "Minor three-chord", style: "Folk, blues", tonic: "minor", steps: ["1m", "4m", "5m", "1m"], home: ["Aeolian"] },
    { id: "minor-cadence", name: "i–iv–V", style: "Classical, latin", tonic: "minor", steps: ["1m", "4m", "5", "1m"], home: ["Harmonic minor"] },
    { id: "andalusian", name: "Andalusian", style: "Flamenco", tonic: "minor", steps: ["1m", "♭7", "♭6", "5"], home: ["Harmonic minor"] },
    { id: "minor-ii-v-i", name: "Minor ii–V–i", style: "Jazz", tonic: "minor", steps: ["2dim", "5", "1m"], home: ["Harmonic minor"] },
    { id: "dorian-vamp", name: "Dorian vamp", style: "Funk, modal jazz", tonic: "minor", steps: ["1m", "4"], home: ["Dorian", "Melodic minor"] },
    { id: "phrygian-vamp", name: "Phrygian vamp", style: "Metal, flamenco", tonic: "minor", steps: ["1m", "♭2"], home: ["Phrygian"] },
    { id: "flamenco", name: "Flamenco", style: "Flamenco", tonic: "major", steps: ["4m", "♭3", "♭2", "1"], home: ["Phrygian dominant"] },
];

const DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const QUALITIES: Record<string, string> = { "": "", m: "m", dim: "dim", aug: "aug" };

// "♭7" → 10 semitones above the tonic and a major triad
function parseStep(step: string): { semitones: number; quality: string } | null {
    const match = step.match(/^([♭♯]?)([1-7])(m|dim|aug)?$/);
    if (!match) return null;
    const accidental = match[1] === "♭" ? -1 : match[1] === "♯" ? 1 : 0;
    const semitones = (DEGREE_SEMITONES[Number(match[2]) - 1] + accidental + 12) % 12;
    return { semitones, quality: QUALITIES[match[3] ?? ""] };
}

// The progressions that can be played in a key, from its own chords and, failing that, the ones
// it can reach outside (secondary dominants, then borrowed chords), as long as at least half its
// chords are the key's own. Those that stay in the key come first, then those with the fewest
// outside chords; within each, ones the mode is known for.
export function findProgressions(diatonic: DisplayChord[], outside: DisplayChord[], modeName: string): KeyProgression[] {
    const tonicChord = diatonic[0];
    const tonicPitchClass = tonicChord?.tones[0]?.pitchClass;
    if (tonicChord == null || tonicPitchClass == null) return [];
    const tonicQuality = triadQuality(tonicChord);
    const keyTonic = tonicQuality === "" ? "major" : tonicQuality === "m" ? "minor" : null;
    const candidates = [...diatonic, ...outside];
    const mode = modeName.toLowerCase();

    const found = progressions.flatMap((progression, order) => {
        if (progression.tonic !== keyTonic) return [];
        const chords: DisplayChord[] = [];
        for (const step of progression.steps) {
            const parsed = parseStep(step);
            const chord = parsed
                ? candidates.find(
                      (candidate) =>
                          ((candidate.tones[0]?.pitchClass ?? -1) - tonicPitchClass + 12) % 12 === parsed.semitones &&
                          triadQuality(candidate) === parsed.quality
                  )
                : undefined;
            if (!chord) return [];
            chords.push(chord);
        }
        const distinct = new Set(chords.map((chord) => chord.id));
        const outsideCount = [...distinct].filter((id) => !/^\d+$/.test(id)).length;
        if (outsideCount > Math.ceil(distinct.size / 2)) return [];
        const home = progression.home?.some((name) => name.toLowerCase() === mode) ?? false;
        return [
            {
                progression,
                chords,
                numerals: chords.map((chord) => getRomanNumeral(chord.degree, chord.chord)),
                outside: outsideCount,
                kind: chords.some((chord) => chord.kind === "borrowed")
                    ? ("borrowed" as const)
                    : chords.some((chord) => chord.kind === "secondary")
                      ? ("secondary" as const)
                      : ("diatonic" as const),
                rank: outsideCount * 1000 + (home ? 0 : 500) + order,
            },
        ];
    });
    return found.sort((left, right) => left.rank - right.rank).map(({ rank: _rank, ...entry }) => entry);
}
