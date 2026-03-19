# Position / Box View

## Goal
Add a fret-range based practice mode for players who think in neck positions or box shapes rather than only in 3-notes-per-string patterns.

## Functional Scope
- Add a `Position` mode separate from the current full-neck and 3NPS modes.
- Let users choose:
  - Start fret
  - Fret span, for example 4 or 5 frets
  - Optional anchor strategy:
    - Root-based
    - Lowest available position
    - Manual
- Highlight only notes inside that position window.
- Keep chord highlighting compatible with the selected position.

## User Experience
1. User selects a scale and root as usual.
2. User enables `Position` mode.
3. User picks a fret range like `5-8`.
4. The fretboard de-emphasizes notes outside that range.
5. If a chord is selected, only chord tones inside the active box remain highlighted.

## Functional Decisions
- Position view should coexist with:
  - full-neck view
  - 3NPS mode
- `Position` and `3NPS` should be mutually exclusive in the first version to keep the interaction model clear.
- Manual fret window selection should be available before any automatic “named boxes” such as CAGED.

## Technical Approach

### 1. Add a view-mode state
In `src/App.vue`, replace the current boolean `show3nps` with a more explicit mode:

```ts
type FretboardViewMode = "full" | "3nps" | "position";
```

Add refs:
- `viewMode`
- `positionStartFret`
- `positionSpan`

This is cleaner than combining multiple booleans like `show3nps`, `showPosition`, `showRest`.

### 2. Add position filtering logic
Create `src/composables/usePositionView.ts`.

Responsibilities:
- Calculate the active fret window
- Expose helpers like:
  - `isFretInPosition`
  - `filterShapeToPosition`

Suggested API:

```ts
export function usePositionView(
  startFret: Ref<number>,
  span: Ref<number>
) {
  const endFret = computed(() => startFret.value + span.value - 1);
  const isFretInPosition = (fret: number) =>
    fret >= startFret.value && fret <= endFret.value;

  return { endFret, isFretInPosition };
}
```

### 3. Extend fret rendering
`src/components/ui/fretboard/FretboardString.vue` already computes note metadata per fret. Extend that logic to include:
- `fret`
- `inActivePosition`

Then adjust highlight rules:
- In `position` mode, only show highlighted notes inside the fret window.
- Outside the window:
  - Either hide the note entirely
  - Or render it muted with low opacity

### 4. UI controls
Add controls in `src/App.vue`:
- View mode selector
- Previous/next position buttons
- Numeric or select inputs for:
  - start fret
  - span

Useful shortcuts:
- `Prev Position`
- `Next Position`
- `Reset to root position`

### 5. URL sync
Persist:
- `viewMode`
- `positionStart`
- `positionSpan`

This keeps the current shareable-URL model intact.

## Future Extension
This feature should be designed so it can later support:
- CAGED boxes
- Berklee positions
- “nearest playable box” for a selected chord

That means the first version should separate:
- box display behavior
- box generation strategy

## Implementation Phases
1. Replace `show3nps` with a proper `viewMode`.
2. Add position filtering composable and URL params.
3. Update fretboard string rendering to honor the active window.
4. Add position controls and step navigation.
5. Polish mobile layout and disabled states.

## Risks
- Current fretboard rendering shows all frets uniformly; position mode may need stronger visual framing for the active box.
- If note visibility and position visibility interact poorly, the UI can become confusing.
- Mobile layout may get crowded if too many control inputs are added directly in the main toolbar.

## Acceptance Criteria
- User can switch between full-neck, 3NPS, and position view.
- User can choose a fret window and only see relevant scale notes there.
- Chord highlighting still works inside the selected position.
- Position state is restored from the URL.
