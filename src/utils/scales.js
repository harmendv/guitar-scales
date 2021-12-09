/* eslint-disable */
/* Array of all the notes */
const scales = [
  {
    id: 1,
    name: 'Major Pentatonic',
    slug: 'major-pentatonic',
    formula: [1, 3, 5, 8, 10]
  },
  {
    id: 2,
    name: 'Minor Pentatonic',
    slug: 'minor-pentatonic',
    formula: [1, 4, 6, 8, 11]
  },
  {
    id: 3,
    name: 'Major Blues',
    slug: 'major-blues',
    formula: [1, 3, 4, 5, 8, 10]
  },
  {
    id: 4,
    name: 'Minor Blues',
    slug: 'minor-blues',
    formula: [1, 4, 6, 7, 8, 11]
  },
  {
    id: 5,
    name: 'Major',
    slug: 'major',
    formula: [1, 3, 5, 6, 8, 10, 12]
  },
  {
    id: 6,
    name: 'Natural Minor',
    slug: 'natural-minor',
    formula: [1, 3, 4, 6, 8, 9, 11]
  },
];

/* Flat Map of all the notes */
const scalesFlatMap = scales.flatMap((i) => i.name);

export {
  scalesFlatMap,
  scales,
}