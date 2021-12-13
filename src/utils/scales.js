/* eslint-disable */
/* Array of all the notes */
const scales = [
  {
    id: 1,
    name: 'Major Pentatonic',
    slug: 'major-pentatonic',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 3, degree: 2 },
      { chromatic: 5, degree: 3 },
      { chromatic: 8, degree: 5 },
      { chromatic: 10, degree: 6 },
    ]
  },
  {
    id: 2,
    name: 'Minor Pentatonic',
    slug: 'minor-pentatonic',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 4, degree: 2 },
      { chromatic: 6, degree: 3 },
      { chromatic: 8, degree: 5 },
      { chromatic: 11, degree: 6 },
    ]
  },
  {
    id: 3,
    name: 'Major Blues',
    slug: 'major-blues',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 3, degree: 2 },
      { chromatic: 4, degree: 'b' },
      { chromatic: 5, degree: 3 },
      { chromatic: 8, degree: 5 },
      { chromatic: 10, degree: 6 },
    ]
  },
  {
    id: 4,
    name: 'Minor Blues',
    slug: 'minor-blues',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 4, degree: 3 },
      { chromatic: 6, degree: 4 },
      { chromatic: 7, degree: 'b' },
      { chromatic: 8, degree: 5 },
      { chromatic: 11, degree: 7 },
    ]
  },
  {
    id: 5,
    name: 'Major',
    slug: 'major',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 3, degree: 2 },
      { chromatic: 5, degree: 3 },
      { chromatic: 6, degree: 4 },
      { chromatic: 8, degree: 5 },
      { chromatic: 10, degree: 6 },
      { chromatic: 12, degree: 7 },
    ]
  },
  {
    id: 6,
    name: 'Natural Minor',
    slug: 'natural-minor',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 3, degree: 2 },
      { chromatic: 4, degree: 3 },
      { chromatic: 6, degree: 4 },
      { chromatic: 8, degree: 5 },
      { chromatic: 9, degree: 6 },
      { chromatic: 11, degree: 7 },
    ]
  },
  {
    id: 7,
    name: 'Harmonic Minor',
    slug: 'harmonic-minor',
    formula: [
      { chromatic: 1, degree: 1 },
      { chromatic: 3, degree: 2 },
      { chromatic: 4, degree: 3 },
      { chromatic: 6, degree: 4 },
      { chromatic: 8, degree: 5 },
      { chromatic: 9, degree: 6 },
      { chromatic: 12, degree: 7 },
    ]
  },
];

/* Flat Map of all the notes */
const scalesFlatMap = scales.flatMap((i) => i.slug);

export {
  scalesFlatMap,
  scales,
}