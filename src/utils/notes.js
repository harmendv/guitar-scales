/* eslint-disable */
/* Array of all the notes */
const notes = [
  { id: 1, name: 'A' },
  { id: 2, name: 'Bb' },
  { id: 3, name: 'B' },
  { id: 4, name: 'C' },
  { id: 5, name: 'C#' },
  { id: 6, name: 'D' },
  { id: 7, name: 'D#' },
  { id: 8, name: 'E' },
  { id: 9, name: 'F' },
  { id: 10, name: 'F#' },
  { id: 11, name: 'G' },
  { id: 12, name: 'G#' },
];

/* Flat Map of all the notes */
const notesFlatMap = notes.flatMap((i) => i.name);

/* Helper function to get the note by offset */
function getNoteByOffset(start = 'C', offset = 0) {
  // Check Start exists of 1 number, and one letter
  const inputIndex = notesFlatMap.indexOf(start);

  if(
    typeof start === 'string' // First is a string
    && notesFlatMap.includes(start) // And the string is allowed
  ) {
    // Iterate the amount the offset requires
    let outputIndex = inputIndex;
    for(let i = 0; i < offset; i++) {
      if(outputIndex + 1 < notes.length) {
        outputIndex += 1;
      } else {
        outputIndex = 0;
      }
    }
    return notesFlatMap[outputIndex];
  } else {
    console.log('Something went wrong');
  }
}

export {
  notes,
  notesFlatMap,
  getNoteByOffset,
}