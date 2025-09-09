interface Tuning {
    label: string;
    data: { note: string; octave: number }[];
    value: string;
}

export const tunings: Tuning[] = [
    {
        label: "Default",
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
        label: "Drop-C",
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
        label: "Drop-D",
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
        label: "Open C",
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
        label: "Open D",
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
        label: "Open E",
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
        label: "Open G",
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
        label: "DAD-GAD",
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
        label: "B standard",
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
        label: "Ukelele",
        data: [
            { note: "G", octave: 4 },
            { note: "C", octave: 4 },
            { note: "E", octave: 4 },
            { note: "A", octave: 4 },
        ],
        value: "ukelele",
    },
];
