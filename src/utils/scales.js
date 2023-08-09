/* eslint-disable */
/* Array of all the notes */
const scales = [
  {
    id: 1,
    name: 'Major',
    slug: 'major',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Ionian' },
      { chromatic: 3, degree: 2, mode: 'Dorian' },
      { chromatic: 5, degree: 3, mode: 'Phrygian' },
      { chromatic: 6, degree: 4, mode: 'Lydian' },
      { chromatic: 8, degree: 5, mode: 'Mixolydian' },
      { chromatic: 10, degree: 6, mode: 'Aeolian' },
      { chromatic: 12, degree: 7, mode: 'Locrian' },
    ]
  },
  {
    id: 2,
    name: 'Major Pentatonic',
    slug: 'major-pentatonic',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Ionian Pentatonic' },
      { chromatic: 3, degree: 2, mode: 'Dorian Pentatonic' },
      { chromatic: 5, degree: 3, mode: 'Phrygian Pentatonic' },
      { chromatic: 8, degree: 5, mode: 'Mixolydian Pentatonic' },
      { chromatic: 10, degree: 6, mode: 'Aeolian Pentatonic' },
    ]
  },
  {
    id: 3,
    name: 'Natural Minor',
    slug: 'natural-minor',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Aeolian' },
      { chromatic: 3, degree: 2, mode: 'Locrian' },
      { chromatic: 4, degree: 3, mode: 'Ionian' },
      { chromatic: 6, degree: 4, mode: 'Dorian' },
      { chromatic: 8, degree: 5, mode: 'Phrygian' },
      { chromatic: 9, degree: 6, mode: 'Lydian' },
      { chromatic: 11, degree: 7, mode: 'Mixolydian' },
    ]
  },
  {
    id: 4,
    name: 'Minor Pentatonic',
    slug: 'minor-pentatonic',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Aeolian' },
      { chromatic: 4, degree: 3, mode: 'Ionian' },
      { chromatic: 6, degree: 4, mode: 'Dorian' },
      { chromatic: 8, degree: 5, mode: 'Phrygian' },
      { chromatic: 11, degree: 7, mode: 'Mixolydian' },
    ]
  },
  {
    id: 5,
    name: 'Harmonic Minor',
    slug: 'harmonic-minor',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Harmonic minor' },
      { chromatic: 3, degree: 2, mode: 'Locrian 13 (or Locrian natural 6th)' },
      { chromatic: 4, degree: 3, mode: 'Ionian #5' },
      { chromatic: 6, degree: 4, mode: 'Dorian #4' },
      { chromatic: 8, degree: 5, mode: 'Phrygian dominant' },
      { chromatic: 9, degree: 6, mode: 'Lydian #2' },
      { chromatic: 12, degree: 7, mode: 'Super Locrian bb7' },
    ]
  },
  {
    id: 6,
    name: 'Melodic Minor',
    slug: 'melodic-minor',
    formula: [
      { chromatic: 1, degree: 1, mode: 'Melodic minor' },
      { chromatic: 3, degree: 2, mode: 'Dorian b2 (or Prhygian ♮6)' },
      { chromatic: 4, degree: 3, mode: 'Lydian augmented (Lydian #5)' },
      { chromatic: 6, degree: 4, mode: 'Lydian dominant' },
      { chromatic: 8, degree: 5, mode: 'Mixolydian b6' },
      { chromatic: 10, degree: 6, mode: 'Locrian ♮2 (Aeolocrian)' },
      { chromatic: 12, degree: 7, mode: 'Super Locrian (Altered scale)' },
    ]
  },
];

/* Flat Map of all the notes */
const scalesFlatMap = scales.flatMap((i) => i.slug);

export {
  scalesFlatMap,
  scales,
}