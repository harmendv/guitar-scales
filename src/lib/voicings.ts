import type { ChordTone } from "@/lib/harmony";
import { getPitchClass } from "@/lib/notes";
import type { InstrumentString } from "@/lib/tunings";

// A playable way to finger a chord: one fret per string from low to high, null for a string
// that isn't played.
export interface Voicing {
    label: string;
    frets: (number | null)[];
    // The chord interval each sounding string plays ("1", "♭3", …)
    intervals: (string | null)[];
    // Lowest fretted note, or 0 for an open-position shape; where the diagram starts
    baseFret: number;
}

// A chord tone's role in a shape: root, third (or the sus note), fifth, seventh (or sixth).
type Slot = "R" | "3" | "5" | "7";

interface Template {
    name: string;
    // One slot per string of a six-string guitar, low to high; null is a muted string
    strings: (Slot | null)[];
}

// Shapes written as the chord tone each string plays rather than as frets, so one template
// fits every chord of the same make-up and is placed onto whatever the strings are tuned to.
const TRIAD_TEMPLATES: Template[] = [
    { name: "E shape", strings: ["R", "5", "R", "3", "5", "R"] },
    { name: "A shape", strings: [null, "R", "5", "R", "3", "5"] },
    { name: "C shape", strings: [null, "R", "3", "5", "R", "3"] },
    { name: "G shape", strings: ["R", "3", "5", "R", "3", "R"] },
    { name: "D shape", strings: [null, null, "R", "5", "R", "3"] },
];
const SEVENTH_TEMPLATES: Template[] = [
    { name: "E shape", strings: ["R", "5", "7", "3", "5", "R"] },
    { name: "A shape", strings: [null, "R", "5", "7", "3", "5"] },
    { name: "C shape", strings: [null, "R", "3", "7", "R", "3"] },
    { name: "D shape", strings: [null, null, "R", "5", "7", "3"] },
    { name: "Drop 3", strings: ["R", null, "7", "3", "5", null] },
    { name: "Drop 2", strings: [null, "R", "5", "7", "3", null] },
    { name: "Shell", strings: ["R", null, "7", "3", null, null] },
    { name: "Shell", strings: [null, "R", "3", "7", null, null] },
];

// How far a shape may stretch: four frets under the fingers, and at most four fingers with
// the lowest fret barred.
const MAX_SPAN = 3;
const MAX_FINGERS = 4;
// Fewer template shapes than this and the search adds its own
const MIN_TEMPLATE_VOICINGS = 3;
// Frets either side of the root a shape's other notes are looked for in
const REACH = 4;

function slotOf(interval: string): Slot | null {
    const number = Number.parseInt(interval.replace(/^[♭♯]+/, ""), 10);
    if (number === 1) return "R";
    if (number >= 2 && number <= 4) return "3";
    if (number === 5) return "5";
    if (number === 6 || number === 7) return "7";
    return null;
}

// The chord's tones by slot, or null when it has a tone no template covers (add9, 11ths) or
// two tones in one slot.
function slotTones(tones: ChordTone[]): Map<Slot, ChordTone> | null {
    const slots = new Map<Slot, ChordTone>();
    for (const tone of tones) {
        const slot = tone.interval ? slotOf(tone.interval) : null;
        if (!slot || slots.has(slot)) return null;
        slots.set(slot, tone);
    }
    return slots.has("R") ? slots : null;
}

// Fits a six-string template to the instrument: a seven-string leaves its low string out, a
// shorter neck only works if the template doesn't use the strings it lacks.
function alignTemplate(template: Template, stringCount: number): (Slot | null)[] | null {
    const extra = stringCount - template.strings.length;
    if (extra >= 0) return [...Array<null>(extra).fill(null), ...template.strings];
    const dropped = template.strings.slice(0, -extra);
    return dropped.every((slot) => slot == null) ? template.strings.slice(-extra) : null;
}

function fingerCount(frets: (number | null)[]): number {
    const fretted = frets.filter((fret): fret is number => fret != null && fret > 0);
    if (!fretted.length) return 0;
    const lowest = Math.min(...fretted);
    return fretted.filter((fret) => fret > lowest).length + 1;
}

// Open strings only belong in open-position shapes, not ringing under a hand at the 8th fret
const OPEN_POSITION_MAX_FRET = 4;

function isPlayable(frets: (number | null)[], minStrings: number): boolean {
    const sounding = frets.filter((fret) => fret != null);
    if (sounding.length < minStrings) return false;
    const fretted = sounding.filter((fret): fret is number => fret > 0);
    if (!fretted.length) return true;
    const highest = Math.max(...fretted);
    if (highest - Math.min(...fretted) > MAX_SPAN) return false;
    if (sounding.includes(0) && highest > OPEN_POSITION_MAX_FRET) return false;
    return fingerCount(frets) <= MAX_FINGERS;
}

// Semitones from the low string in standard tuning, for the six strings a template is written for
const STANDARD_OFFSETS = [0, 5, 10, 15, 19, 24];

// A template's CAGED name only means something if the strings it uses are tuned like standard
// (E♭ standard and drop D's top five strings are; open G isn't).
function tunedLikeStandard(aligned: (Slot | null)[], stringPitchClasses: number[]): boolean {
    const offset = aligned.length - STANDARD_OFFSETS.length;
    const used = aligned.map((slot, string) => (slot == null ? null : string)).filter((string): string is number => string != null);
    const first = used[0];
    return used.every(
        (string) =>
            (stringPitchClasses[string] - stringPitchClasses[first] + 120) % 12 ===
            (STANDARD_OFFSETS[string - offset] - STANDARD_OFFSETS[first - offset]) % 12
    );
}

function rootStringLabel(frets: (number | null)[]): string {
    return `Root on string ${frets.length - frets.findIndex((fret) => fret != null)}`;
}

function toVoicing(label: string, frets: (number | null)[], stringPitchClasses: number[], tones: ChordTone[]): Voicing {
    const intervalByPitchClass = new Map(tones.map((tone) => [tone.pitchClass, tone.interval ?? null]));
    const fretted = frets.filter((fret): fret is number => fret != null && fret > 0);
    // An open-position shape (any open string, nothing past the 4th fret) draws from the nut
    const highest = fretted.length ? Math.max(...fretted) : 0;
    const open = frets.some((fret) => fret === 0) && highest <= 4;
    return {
        label,
        frets,
        intervals: frets.map((fret, string) =>
            fret == null ? null : (intervalByPitchClass.get((stringPitchClasses[string] + fret) % 12) ?? null)
        ),
        baseFret: open || !fretted.length ? 0 : Math.min(...fretted),
    };
}

function fromTemplates(
    slots: Map<Slot, ChordTone>,
    stringPitchClasses: number[],
    fretCount: number,
    tones: ChordTone[]
): Voicing[] {
    const templates = slots.size === 4 && slots.has("7") ? SEVENTH_TEMPLATES : slots.size === 3 && !slots.has("7") ? TRIAD_TEMPLATES : [];
    const root = slots.get("R")!.pitchClass;
    const voicings: Voicing[] = [];
    for (const template of templates) {
        const aligned = alignTemplate(template, stringPitchClasses.length);
        if (!aligned) continue;
        const rootString = aligned.indexOf("R");
        for (let rootFret = 0; rootFret < fretCount; rootFret++) {
            if ((stringPitchClasses[rootString] + rootFret) % 12 !== root) continue;
            const frets = aligned.map((slot, string) => {
                if (slot == null) return null;
                const pitchClass = slots.get(slot)!.pitchClass;
                // The one fret within reach of the root that plays this tone (they're 12 apart)
                for (let distance = 0; distance <= REACH; distance++) {
                    for (const fret of [rootFret - distance, rootFret + distance]) {
                        if (fret >= 0 && fret < fretCount && (stringPitchClasses[string] + fret) % 12 === pitchClass) {
                            return fret;
                        }
                    }
                }
                return undefined;
            });
            if (frets.includes(undefined)) continue;
            const complete = frets as (number | null)[];
            if (!isPlayable(complete, 3)) continue;
            const label = tunedLikeStandard(aligned, stringPitchClasses) ? template.name : rootStringLabel(complete);
            voicings.push(toVoicing(label, complete, stringPitchClasses, tones));
        }
    }
    return voicings;
}

// For chords and tunings without a template: every way to play the chord within four frets with
// the root in the bass, each tone at least once (a 7th chord may leave out its fifth) and no
// muted strings between sounding ones, keeping the fullest shape for each bass note.
function search(stringPitchClasses: number[], fretCount: number, tones: ChordTone[]): Voicing[] {
    const root = tones.find((tone) => tone.interval === "1") ?? tones[0];
    if (!root) return [];
    const chordPitchClasses = new Set(tones.map((tone) => tone.pitchClass));
    const optional = new Set(
        tones.length >= 4 ? tones.filter((tone) => tone.interval === "5").map((tone) => tone.pitchClass) : []
    );
    const best = new Map<string, { frets: (number | null)[]; score: number }>();
    const stringCount = stringPitchClasses.length;
    for (let start = 1; start + MAX_SPAN < fretCount; start++) {
        const options = stringPitchClasses.map((pitchClass) => {
            const frets: (number | null)[] = [null];
            if (chordPitchClasses.has(pitchClass)) frets.push(0);
            for (let fret = start; fret <= start + MAX_SPAN; fret++) {
                if (chordPitchClasses.has((pitchClass + fret) % 12)) frets.push(fret);
            }
            return frets;
        });
        const frets: (number | null)[] = [];
        const walk = (string: number) => {
            if (string === stringCount) {
                const sounding = frets.map((fret, index) => (fret == null ? null : index)).filter((index): index is number => index != null);
                if (sounding.length < Math.min(3, stringCount)) return;
                const first = sounding[0];
                const last = sounding[sounding.length - 1];
                if (last - first + 1 !== sounding.length) return;
                if ((stringPitchClasses[first] + frets[first]!) % 12 !== root.pitchClass) return;
                const played = new Set(sounding.map((index) => (stringPitchClasses[index] + frets[index]!) % 12));
                for (const pitchClass of chordPitchClasses) {
                    if (!played.has(pitchClass) && !optional.has(pitchClass)) return;
                }
                if (!isPlayable(frets, 3)) return;
                const fretted = frets.filter((fret): fret is number => fret != null && fret > 0);
                const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
                const score = sounding.length * 10 + played.size * 5 - span - fingerCount(frets);
                const key = `${first}:${frets[first]}`;
                const current = best.get(key);
                if (!current || score > current.score) best.set(key, { frets: [...frets], score });
                return;
            }
            for (const fret of options[string]) {
                frets[string] = fret;
                walk(string + 1);
            }
        };
        walk(0);
    }
    return [...best.values()].map(({ frets }) => toVoicing(rootStringLabel(frets), frets, stringPitchClasses, tones));
}

// Playable shapes for a chord on this instrument, lowest on the neck first: the familiar CAGED,
// drop and shell shapes where the chord and tuning allow, otherwise whatever the search finds.
export function getVoicings(tones: ChordTone[], strings: InstrumentString[], fretCount: number): Voicing[] {
    const stringPitchClasses = strings.map((string) => getPitchClass(string.note));
    if (!tones.length || stringPitchClasses.some((pitchClass) => pitchClass == null)) return [];
    const pitchClasses = stringPitchClasses as number[];
    const slots = slotTones(tones);
    let voicings = slots ? fromTemplates(slots, pitchClasses, fretCount, tones) : [];
    // Odd tunings leave few templates playable, so the search fills in
    if (voicings.length < MIN_TEMPLATE_VOICINGS) voicings = [...voicings, ...search(pitchClasses, fretCount, tones)];
    const seen = new Set<string>();
    return voicings
        .filter((voicing) => {
            const key = voicing.frets.join(",");
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((left, right) => left.baseFret - right.baseFret || left.label.localeCompare(right.label));
}
