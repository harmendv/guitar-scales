# Progression Mode

## Goal
Let users practice harmonic movement instead of isolated scales by stepping through scale-aware chord progressions such as `ii-V-I`.

## Functional Scope
- Add a progression builder and playback/stepper mode.
- Let users:
  - Pick progression degrees relative to the current scale
  - Choose number of bars per chord
  - Step through chords manually
  - Optionally autoplay later
- Each progression step should update:
  - active chord
  - chord tones on the fretboard
  - optional suggested scale/mode display

## User Experience
1. User chooses a root, scale, mode, and tuning.
2. User opens `Progression` mode.
3. User builds a progression such as `ii-V-I`.
4. The UI shows progression chips/cards in sequence.
5. User clicks a step or presses next/previous.
6. The fretboard updates to the currently active harmony.

## Functional Decisions
- First version should be diatonic only.
- Progressions are degree-based, not absolute chord-name based.
- Progression mode should reuse the already derived diatonic chord list.
- Start with manual stepping before adding timed playback or backing tracks.

## Technical Approach

### 1. Add a progression model
Create `src/composables/useProgressions.ts`.

Suggested types:

```ts
interface ProgressionStep {
  id: string;
  degree: number;
  bars: number;
}

interface ResolvedProgressionStep extends ProgressionStep {
  note: string;
  chord: string;
  degreeLabel: string;
}
```

Composable responsibilities:
- Resolve user-defined degree steps against current `useDiatonicChords()` output
- Expose active step and navigation helpers

### 2. App state additions
In `src/App.vue`, add:
- `progressionSteps`
- `activeProgressionIndex`
- `isProgressionMode`

When progression mode is active:
- the current `chord` should mirror `progressionSteps[activeIndex].degree`
- chord root and chord notes should derive from the active step

### 3. Progression builder UI
Create something like:
- `src/components/progression/ProgressionBuilder.vue`
- `src/components/progression/ProgressionStepper.vue`

Builder responsibilities:
- Add/remove/reorder steps
- Pick degree and bar count

Stepper responsibilities:
- Highlight active step
- Next/previous actions
- Optional loop toggle later

### 4. Reuse existing chord infrastructure
The app already has:
- `useDiatonicChords`
- chord buttons
- chord note highlighting

Progression mode should sit on top of that rather than duplicating theory logic.

Main idea:
- A progression step resolves to a scale degree.
- That degree becomes the active chord index.
- Existing chord rendering updates automatically.

### 5. URL sync
Persist:
- progression mode on/off
- serialized progression steps
- active step index

Example encoding:
- `progression=2-1,5-1,1-2`
  - degree 2 for 1 bar
  - degree 5 for 1 bar
  - degree 1 for 2 bars

### 6. Optional future layer
Later this can drive:
- metronome timing
- auto-advance
- backing track sync
- “recommended scale over current chord” hints

## Implementation Phases
1. Add progression data model and resolver composable.
2. Add builder UI for degree-based steps.
3. Bind active progression step to current chord highlighting.
4. Add manual next/previous navigation.
5. Add URL serialization.

## Risks
- If progression mode and manual chord selection both stay active at once, the source of truth becomes unclear.
- Reordering steps needs stable IDs to avoid Vue list-state bugs.
- Complex progression editing can overwhelm the current simple layout if not visually separated.

## Acceptance Criteria
- User can build a progression from diatonic degrees.
- User can step through the progression.
- Fretboard and chord highlighting follow the active step.
- Progression state can be shared via URL.
