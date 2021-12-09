/* eslint-disable */
/* Array of all the notes */
const scales = [
  {
    id: 1,
    name: 'Major Pentatonic',
    slug: 'major-pentatonic',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 3, interval: 2 },
      { chromatic: 5, interval: 3 },
      { chromatic: 8, interval: 5 },
      { chromatic: 10, interval: 6 },
    ]
  },
  {
    id: 2,
    name: 'Minor Pentatonic',
    slug: 'minor-pentatonic',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 4, interval: 2 },
      { chromatic: 6, interval: 3 },
      { chromatic: 8, interval: 5 },
      { chromatic: 11, interval: 6 },
    ]
  },
  {
    id: 3,
    name: 'Major Blues',
    slug: 'major-blues',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 3, interval: 2 },
      { chromatic: 4, interval: 'b' },
      { chromatic: 5, interval: 3 },
      { chromatic: 8, interval: 5 },
      { chromatic: 10, interval: 6 },
    ]
  },
  {
    id: 4,
    name: 'Minor Blues',
    slug: 'minor-blues',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 4, interval: 2 },
      { chromatic: 6, interval: 3 },
      { chromatic: 7, interval: 'b' },
      { chromatic: 8, interval: 5 },
      { chromatic: 11, interval: 6 },
    ]
  },
  {
    id: 5,
    name: 'Major',
    slug: 'major',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 3, interval: 2 },
      { chromatic: 5, interval: 3 },
      { chromatic: 6, interval: 4 },
      { chromatic: 8, interval: 5 },
      { chromatic: 10, interval: 6 },
      { chromatic: 12, interval: 7 },
    ]
  },
  {
    id: 6,
    name: 'Natural Minor',
    slug: 'natural-minor',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 3, interval: 2 },
      { chromatic: 4, interval: 3 },
      { chromatic: 6, interval: 4 },
      { chromatic: 8, interval: 5 },
      { chromatic: 9, interval: 6 },
      { chromatic: 11, interval: 7 },
    ]
  },
  {
    id: 7,
    name: 'Harmonic Minor',
    slug: 'harmonic-minor',
    formula: [
      { chromatic: 1, interval: 1 },
      { chromatic: 3, interval: 2 },
      { chromatic: 4, interval: 3 },
      { chromatic: 6, interval: 4 },
      { chromatic: 8, interval: 5 },
      { chromatic: 9, interval: 6 },
      { chromatic: 12, interval: 7 },
    ]
  },
];

/* Flat Map of all the notes */
const scalesFlatMap = scales.flatMap((i) => i.slug);

export {
  scalesFlatMap,
  scales,
}