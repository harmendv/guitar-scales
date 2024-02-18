/* Array of all the chords */
const chords = [
    
    /** Major */
    {
        id: 1,
        name: 'Major',
        abbreviations: ['', 'maj', 'M', 'Δ'],
        intervals: ['1','3','5']
    },
    {
        id: 2,
        name: 'Major 6th',
        abbreviations: ['6', 'maj6', 'M6'],
        intervals: ['1','3','5','6']
    },
    {
        id: 3,
        name: 'Major 6th sharp fifth',
        abbreviations: ['6♯5'],
        intervals: ['1','3','♯5','6']
    },
    {
        id: 4,
        name: 'Major 7th',
        abbreviations: ['maj7', 'M7', 'Δ7'],
        intervals: ['1','3','5','7']
    },
    {
        id: 5,
        name: 'Major 7th Sharp Fifth',
        abbreviations: ['maj7♯5'],
        intervals: ['1','3','♯5','7']
    },
    {
        id: 5,
        name: 'Major 7th Sharp Fifth',
        abbreviations: ['maj7♯5'],
        intervals: ['1','3','♯5','7']
    },
    {
        id: 6,
        name: 'Major 9th',
        abbreviations: ['maj9', 'M9'],
        intervals: ['1','3','5','7', '9']
    },
    {
        id: 7,
        name: 'Major 13th',
        abbreviations: ['maj13', 'M13'],
        intervals: ['1','3','5','7','9','13']
    },
    /** Dominant **/
    {
        id: 8,
        name: 'Dominant 7th',
        abbreviations: ['7', 'dom7'],
        intervals: ['1','3','5','♭7']
    },
    {
        id: 9,
        name: 'Dominant 7th flat fifth',
        abbreviations: ['7♭5'],
        intervals: ['1','3','♭5','♭7']
    },
    {
        id: 10,
        name: 'Dominant 7th sharp fifth',
        abbreviations: ['7♯5'],
        intervals: ['1','3','♯5','♭7']
    },
    {
        id: 11,
        name: 'Dominant 9th',
        abbreviations: ['9', 'dom9'],
        intervals: ['1','3','5','♭7', '9']
    },
    {
        id: 12,
        name: 'Dominant 11th',
        abbreviations: ['11', 'dom11'],
        intervals: ['1','3','5','♭7', '9', '11']
    },
    /** Minor */
    {
        id: 13,
        name: 'Minor',
        abbreviations: ['m', 'min', '-'],
        intervals: ['1','♭3','5']
    },
    {
        id: 14,
        name: 'Minor 6th',
        abbreviations: ['m6', 'min6'],
        intervals: ['1','♭3','5', '6']
    },
    {
        id: 15,
        name: 'Minor 7th',
        abbreviations: ['m7', 'min7'],
        intervals: ['1','♭3','5', '♭7']
    },
   
    {
        id: 16,
        name: 'Minor 9th',
        abbreviations: ['m9', 'min9'],
        intervals: ['1','♭3','5', '♭7', '9']
    },
    {
        id: 17,
        name: 'Minor 11th',
        abbreviations: ['m11', 'min11'],
        intervals: ['1','♭3','5', '♭7', '9', '11']
    },
    {
        id: 18,
        name: 'Minor 13th',
        abbreviations: ['m13', 'min13'],
        intervals: ['1','♭3','5', '♭7', '9', '13']
    },
    {
        id: 19,
        name: 'Minor Major 7th',
        abbreviations: ['mMaj7'],
        intervals: ['1','♭3','5', '7']
    },
    /** Diminished **/
    {
        id: 20,
        name: 'Diminished',
        abbreviations: ['dim', '°'],
        intervals: ['1','♭3','♭5']
    },
    {
        id: 21,
        name: 'Diminished 7th',
        abbreviations: ['dim7', '°7'],
        intervals: ['1','♭3','♭5', '♭♭7']
    },
    {
        id: 22,
        name: 'Half Diminished',
        abbreviations: ['m7♭5', 'ø'],
        intervals: ['1','♭3','♭5', '♭7']
    },
    /** Augmented **/
    {
        id: 23,
        name: 'Augmented',
        abbreviations: ['aug', '+'],
        intervals: ['1','3','♯5']
    },
    {
        id: 24,
        name: 'Augmented 7th',
        abbreviations: ['aug7', '+7', '7+', '7♯5'],
        intervals: ['1','3','♯5','♭7']
    },
    /** Sus & Add **/
    {
        id: 25,
        name: 'Sus 2',
        abbreviations: ['sus2'],
        intervals: ['1','2','5']
    },
    {
        id: 26,
        name: 'Sus 4',
        abbreviations: ['sus4'],
        intervals: ['1','4','5']
    },
    {
        id: 27,
        name: 'Add 9',
        abbreviations: ['add9'],
        intervals: ['1','3','5','9']
    },
];

const chordsByPrimaryAbbreviation = chords.reduce((acc,curr)=> (acc[curr.abbreviations[0]]=curr, acc),{});

export { chords, chordsByPrimaryAbbreviation };