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
export function getNoteByOffset(start = "C", offset = 0): string | undefined {
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
        console.log("Something went wrong");
    }
}

/**
 * Play a tone for a given note and octave using Web Audio API
 * Smoothly ramps down gain to avoid clipping.
 */
export function playTone(note: string, octave: number): void {
    let nName = note.replace('♯', '#').replace('♭', 'b');
    const semitone = noteSemitoneMap[nName] ?? noteSemitoneMap[note];
    if (semitone === undefined) return;
    const midi = (octave + 1) * 12 + semitone;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    // Ramp down gain smoothly to avoid clipping
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28);
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
}

