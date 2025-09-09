import { type Scale, scales } from "@/composables/useScales";

export interface Note {
    id: number;
    name: string;
}

export interface ScaleNote {
    note: string;
    degree: string;
}

export const notes: Note[] = [
    { id: 1, name: "A" },
    { id: 2, name: "Bb" },
    { id: 3, name: "B" },
    { id: 4, name: "C" },
    { id: 5, name: "C♯" },
    { id: 6, name: "D" },
    { id: 7, name: "D♯" },
    { id: 8, name: "E" },
    { id: 9, name: "F" },
    { id: 10, name: "F♯" },
    { id: 11, name: "G" },
    { id: 12, name: "G♯" },
];

export const noteSemitoneMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'C♯': 1,
    'D': 2, 'D#': 3, 'Eb': 3, 'D♯': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'F♯': 6,
    'G': 7, 'G#': 8, 'Ab': 8, 'G♯': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'A♯': 10,
    'B': 11
};

/* Flat Map of all the notes */
export function notesFlatMap(): string[] {
    return notes.flatMap((i) => i.name)
};

/* Helper function to get the note by offset */
export function getNoteByOffset(start = "C", offset = 0): string {
    // Check Start exists of 1 number, and one letter
    const inputIndex = notesFlatMap().indexOf(start);

    if (
        typeof start === "string" && // First is a string
        notesFlatMap().includes(start) // And the string is allowed
    ) {
        // Iterate the amount the offset requires
        let outputIndex = inputIndex;

        for (let i = 0; i < offset; i++) {
            if (outputIndex + 1 < notes.length) {
                outputIndex += 1;
            } else {
                outputIndex = 0;
            }
        }

        const proxy = new Proxy(notesFlatMap(), {});
        return proxy[outputIndex];
    } else {
        return ''; // Return empty string if not found
    }
}

export function getScaleNotes(scaleIndex: number, mode: number, note: string): ScaleNote[] {
    const arr: ScaleNote[] = [];
    const idx = scaleIndex;

    if (idx < 0) return arr;
    const scaleFormula = scales[idx].formula;
    const scaleFormulaLength = scaleFormula.length;
    const modeOffset = scaleFormula[mode-1].chromatic - 1;
    for (let i = 0; i < scaleFormulaLength; i++) {
        const n = getNoteByOffset(
            `${note}`,
            scaleFormula[i].chromatic - 1 + (12 - modeOffset)
        ) as string;
        arr.push({ note: n, degree: scaleFormula[i].degree });
    }
    return arr;
}

/**
 * Helper to convert sharp notes to flat equivalents for file naming
 */
function toFlat(note: string): string {
    switch (note) {
        case "A#": case "A♯": return "Bb";
        case "C#": case "C♯": return "Db";
        case "D#": case "D♯": return "Eb";
        case "F#": case "F♯": return "Gb";
        case "G#": case "G♯": return "Ab";
        default: return note;
    }
}

/**
 * Play a tone for a given note and octave using an mp3 sample from public/sounds
 */
export function playTone(note: string, octave: number): void {
    // Convert sharps to flats for file naming
    let nName = note.replace('♯', '#').replace('♭', 'b');
    nName = toFlat(nName);
    // Build file name, e.g. Bb4.mp3
    const fileName = `${nName}${octave}.mp3`;
    const filePath = `public/sounds/${fileName}`;
    const audio = new window.Audio(filePath);
    audio.volume = 0.7;
    audio.play().catch(() => {
        // Optionally handle error (file not found, etc)
        // console.warn(`Audio file not found: ${filePath}`);
    });
}
