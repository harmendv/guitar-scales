import { notes } from "@/composables/useNotes";

export interface InstrumentString {
    note: string;
    octave: number;
}

export interface Tuning {
    id: string;
    label: string;
    value: string;
    source: "builtin" | "custom";
    data: InstrumentString[];
}

const NOTE_SET = new Set(notes.map((note) => note.name));
const MIN_STRINGS = 1;
const MAX_STRINGS = 12;
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 7;

export const builtInTunings: Tuning[] = [
    {
        id: "builtin-default",
        label: "Default",
        source: "builtin",
        data: [
            { note: "E", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "G", octave: 3 },
            { note: "B", octave: 3 },
            { note: "E", octave: 4 },
        ],
        value: "default",
    },
    {
        id: "builtin-drop-c",
        label: "Drop-C",
        source: "builtin",
        data: [
            { note: "C", octave: 2 },
            { note: "G", octave: 2 },
            { note: "C", octave: 3 },
            { note: "F", octave: 3 },
            { note: "A", octave: 3 },
            { note: "D", octave: 4 },
        ],
        value: "drop-c",
    },
    {
        id: "builtin-drop-d",
        label: "Drop-D",
        source: "builtin",
        data: [
            { note: "D", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "G", octave: 3 },
            { note: "B", octave: 3 },
            { note: "E", octave: 4 },
        ],
        value: "drop-d",
    },
    {
        id: "builtin-open-c",
        label: "Open C",
        source: "builtin",
        data: [
            { note: "C", octave: 2 },
            { note: "G", octave: 2 },
            { note: "C", octave: 3 },
            { note: "G", octave: 3 },
            { note: "C", octave: 4 },
            { note: "E", octave: 4 },
        ],
        value: "open-c",
    },
    {
        id: "builtin-open-d",
        label: "Open D",
        source: "builtin",
        data: [
            { note: "D", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "F♯", octave: 3 },
            { note: "A", octave: 3 },
            { note: "D", octave: 4 },
        ],
        value: "open-d",
    },
    {
        id: "builtin-open-e",
        label: "Open E",
        source: "builtin",
        data: [
            { note: "E", octave: 2 },
            { note: "B", octave: 2 },
            { note: "E", octave: 3 },
            { note: "G♯", octave: 3 },
            { note: "B", octave: 3 },
            { note: "E", octave: 4 },
        ],
        value: "open-e",
    },
    {
        id: "builtin-open-g",
        label: "Open G",
        source: "builtin",
        data: [
            { note: "D", octave: 2 },
            { note: "G", octave: 2 },
            { note: "D", octave: 3 },
            { note: "G", octave: 3 },
            { note: "B", octave: 3 },
            { note: "D", octave: 4 },
        ],
        value: "open-g",
    },
    {
        id: "builtin-dad-gad",
        label: "DAD-GAD",
        source: "builtin",
        data: [
            { note: "D", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "G", octave: 3 },
            { note: "A", octave: 3 },
            { note: "D", octave: 4 },
        ],
        value: "dad-gad",
    },
    {
        id: "builtin-b-standard",
        label: "B standard",
        source: "builtin",
        data: [
            { note: "B", octave: 1 },
            { note: "E", octave: 2 },
            { note: "A", octave: 2 },
            { note: "D", octave: 3 },
            { note: "F♯", octave: 3 },
            { note: "B", octave: 2 },
        ],
        value: "b-standard",
    },
    {
        id: "builtin-ukelele",
        label: "Ukelele",
        source: "builtin",
        data: [
            { note: "G", octave: 4 },
            { note: "C", octave: 4 },
            { note: "E", octave: 4 },
            { note: "A", octave: 4 },
        ],
        value: "ukelele",
    },
];

export const tunings = builtInTunings;

export function isValidTuning(tuning: unknown): tuning is Pick<Tuning, "label" | "data"> {
    if (!tuning || typeof tuning !== "object") return false;
    const asTuning = tuning as Partial<Tuning>;
    if (typeof asTuning.label !== "string" || !asTuning.label.trim()) return false;
    if (!Array.isArray(asTuning.data)) return false;
    if (asTuning.data.length < MIN_STRINGS || asTuning.data.length > MAX_STRINGS) {
        return false;
    }

    return asTuning.data.every((stringData) => {
        if (!stringData || typeof stringData !== "object") return false;
        const note = (stringData as InstrumentString).note;
        const octave = (stringData as InstrumentString).octave;
        if (typeof note !== "string" || !NOTE_SET.has(note)) return false;
        if (!Number.isInteger(octave) || octave < MIN_OCTAVE || octave > MAX_OCTAVE) {
            return false;
        }
        return true;
    });
}

export function serializeTuning(tuning: Pick<Tuning, "label" | "data">): string {
    return encodeURIComponent(
        JSON.stringify({
            label: tuning.label,
            data: tuning.data,
        })
    );
}

export function deserializeTuning(serialized: string): Pick<Tuning, "label" | "data"> | null {
    try {
        const parsed = JSON.parse(decodeURIComponent(serialized));
        if (!isValidTuning(parsed)) return null;
        return {
            label: parsed.label.trim(),
            data: parsed.data.map((stringData) => ({
                note: stringData.note,
                octave: stringData.octave,
            })),
        };
    } catch {
        return null;
    }
}
