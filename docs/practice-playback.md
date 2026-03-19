# Practice Playback

## Goal
Extend the existing click-to-play note samples into structured practice playback for scales and arpeggios with timing support.

## Functional Scope
- Add guided playback for:
  - Scale ascending
  - Scale descending
  - Scale up and down
  - Arpeggio ascending
  - Arpeggio descending
  - Random-note drill later
- Add tempo control.
- Add metronome toggle.
- Add start/stop controls.
- Highlight the currently played note on the fretboard during playback.

## User Experience
1. User selects scale or arpeggio context.
2. User chooses a playback pattern.
3. User sets tempo.
4. User presses `Play`.
5. Notes sound in order and the active note is visually emphasized.
6. User can stop playback or change settings.

## Functional Decisions
- Reuse existing mp3 samples in `public/sounds`.
- First version should be single-note sequential playback only.
- The first target is correctness and practice value, not realistic guitar articulation.
- Metronome should be optional and can use a simple click sample or Web Audio oscillator.

## Technical Approach

### 1. Create a playback engine composable
Add `src/composables/usePracticePlayback.ts`.

Responsibilities:
- Accept a note sequence
- Schedule playback based on BPM
- Track current playback state
- Expose:
  - `isPlaying`
  - `currentStep`
  - `play`
  - `stop`

Suggested API:

```ts
interface PlaybackNote {
  note: string;
  octave: number;
  label?: string;
}

export function usePracticePlayback() {
  const isPlaying = ref(false);
  const currentStep = ref<number | null>(null);

  function play(sequence: PlaybackNote[], bpm: number): void {}
  function stop(): void {}

  return { isPlaying, currentStep, play, stop };
}
```

### 2. Separate note sequence generation from playback
Create helper functions that build ordered note sequences from app state:
- `buildScaleSequence(scaleNotes, tuning, options)`
- `buildArpeggioSequence(chordNotes, tuning, options)`

These should not live inside the UI component.

Potential file:
- `src/composables/usePracticeSequences.ts`

### 3. Improve audio playback abstraction
Current audio playback lives in `playTone()` inside `src/composables/useNotes.ts`.

Refactor into:
- low-level sample player
- higher-level scheduled playback

For example:

```ts
export function playSample(note: string, octave: number, volume = 1): HTMLAudioElement
```

Then `usePracticePlayback.ts` can orchestrate repeated playback without mixing sequencing logic into note utilities.

### 4. Fretboard highlighting during playback
Add a prop to `Fretboard` and `FretboardString`:
- `activePlaybackNote`

During playback:
- current note gets an additional visual state
- this should be visually distinct from root/chord/scale highlighting

Recommended styling:
- temporary ring or glow
- avoid replacing root color semantics

### 5. Metronome
First version options:
- Simple oscillator click via Web Audio API
- Or dedicated sample file

Oscillator approach is lighter and avoids more asset management.

### 6. UI controls
Add a playback panel with:
- pattern selector
- BPM input
- play/stop button
- metronome toggle

This panel should adapt to the current content context:
- scale mode: scale patterns
- arpeggio mode: arpeggio patterns

### 7. Timing model
Start simple:
- one note per beat
- interval in ms = `60000 / bpm`

Later:
- eighth notes
- swing
- subdivisions

## Implementation Phases
1. Extract low-level audio sample playback.
2. Add a sequence builder for scales and arpeggios.
3. Implement basic scheduler with play/stop.
4. Add fretboard playback highlight.
5. Add BPM and metronome controls.

## Risks
- `HTMLAudioElement` can drift if many notes are scheduled with naive timers.
- Browser autoplay and overlapping playback limits may cause inconsistent behavior.
- Building a musically useful sequence from “all matching frets on the neck” is non-trivial; the first version should use a defined position or string order.

## Recommended First-Version Constraint
Playback should run against a deterministic ordered note list, for example:
- active position only
- low string to high string
- lowest fret to highest fret within each string

Without this constraint, playback will feel arbitrary.

## Acceptance Criteria
- User can play a scale or arpeggio sequence at a chosen BPM.
- Playback can be stopped cleanly.
- Current playback note is highlighted on the fretboard.
- Metronome can be toggled on and off.
