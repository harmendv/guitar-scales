# Arpeggio Mode

## Goal
Turn the existing chord-tone logic into a dedicated arpeggio practice mode with triads, 7th chords, inversions, and neck-position aware highlighting.

## Functional Scope
- Add a dedicated `Arpeggio` mode.
- Let users choose:
  - Degree-based diatonic chord
  - Arpeggio type:
    - Triad
    - 7th chord
    - Extended chord later
  - Inversion:
    - Root position
    - 1st inversion
    - 2nd inversion
    - 3rd inversion when applicable
- Highlight only the selected arpeggio notes on the fretboard.
- Optionally combine with `Position` mode later.

## User Experience
1. User selects root, scale, and mode.
2. User enters `Arpeggio` mode.
3. User clicks a diatonic chord or selects one from a dropdown.
4. User chooses `Triad` or `7th`.
5. User optionally chooses an inversion.
6. The fretboard highlights only the relevant chord tones and labels them as intervals when degree mode is active.

## Functional Decisions
- Start from diatonic chords only because the app already derives them from the chosen scale.
- Use existing chord buttons as the primary entry point.
- First release should focus on note highlighting, not full chord fingering generation.
- Inversions should rotate chord tones conceptually, even if the fretboard still shows all note locations for that inversion target.

## Technical Approach

### 1. Separate chord-tone selection from chord display
Current logic in `src/composables/useChords.ts` computes chord notes for the selected scale degree, but it is tightly shaped around the current app flow.

Refactor toward:
- `getDiatonicChordForDegree(scale, degree)`
- `getChordIntervalsByQuality(quality, toneCount)`
- `getArpeggioNotes(scaleNotes, degree, options)`

Recommended options:

```ts
interface ArpeggioOptions {
  toneCount: 3 | 4;
  inversion: 0 | 1 | 2 | 3;
}
```

### 2. Expand chord note generation
Current `getChordNotes()` always derives a fixed stack of thirds and maps interval labels onto them.

Improve it so it can:
- Return only the first 3 tones for triads
- Return 4 tones for seventh chords
- Rotate interval order for inversion-focused labeling

The output can stay close to the current `ChordNotes` map, but should also return ordered note data:

```ts
interface OrderedChordTone {
  note: string;
  interval: string;
  degreeIndex: number;
}
```

### 3. Add arpeggio state to App
In `src/App.vue`, add refs for:
- `practiceMode` or `contentMode`
  - `scale`
  - `arpeggio`
- `arpeggioToneCount`
- `arpeggioInversion`

Current `chord` selection can remain, but should feed arpeggio mode rather than being just a visual toggle.

### 4. Update fretboard rendering rules
In `src/components/ui/fretboard/FretboardString.vue`:
- Reuse the current `chordNotes` prop path
- Extend note rendering so interval labels reflect inversion order where appropriate

Initial version:
- Highlight all matching arpeggio notes across the neck

Later version:
- Show “nearest playable inversion” per position

### 5. UI controls
Add a compact arpeggio control block:
- chord degree selector or reuse chord buttons
- tone count toggle: `Triad` / `7th`
- inversion toggle

The existing chord button grid already gives a strong base, so avoid duplicating that UI.

### 6. URL sync
Persist:
- `contentMode`
- `chord`
- `arpeggioToneCount`
- `arpeggioInversion`

## Implementation Phases
1. Refactor chord generation utilities.
2. Add arpeggio mode state and controls.
3. Render triads and 7th arpeggios distinctly.
4. Add inversion-aware interval labeling.
5. Optionally integrate with position mode.

## Risks
- “Inversion” can mean two different things: theoretical tone order vs playable neck voicing. The first version should clearly implement the theoretical version only.
- Extended chords will need more interval support than the current UI exposes cleanly.
- If scale mode and arpeggio mode share too much state implicitly, the app flow can become ambiguous.

## Acceptance Criteria
- User can select a diatonic chord and switch between triad and 7th arpeggio.
- User can choose inversions.
- Fretboard highlights only arpeggio notes for the selected degree.
- URL restores the same arpeggio state.
