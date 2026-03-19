# Custom Tunings

## Goal
Let users create, edit, persist, and reuse their own instrument tunings instead of being limited to the hardcoded presets in `src/composables/useTunings.ts`.

## Functional Scope
- Add a `Custom tuning` flow alongside the current tuning selector.
- Let the user set:
  - String count
  - Per-string note
  - Per-string octave
  - Tuning name
- Allow saving multiple custom tunings locally.
- Allow editing and deleting saved custom tunings.
- Use the selected custom tuning everywhere the current preset tuning is used:
  - Fretboard rendering
  - 3NPS generation
  - Audio playback
  - URL state sharing

## User Experience
1. User opens the `Tuning` area.
2. User can choose either:
   - Built-in tuning
   - Saved custom tuning
   - `Create custom tuning`
3. In the custom tuning editor:
   - Add/remove strings
   - Change note and octave per string
   - Save as named preset
4. When a custom tuning is selected, the fretboard rerenders immediately.
5. Shared URLs should restore the selected tuning if the tuning data is encoded in the URL.

## Functional Decisions
- Built-in tunings remain read-only.
- Custom tunings are stored locally in `localStorage`.
- URL should support both:
  - Preset references for built-in tunings
  - Serialized tuning data for custom tunings
- If a shared URL contains custom tuning data, it should work even on a different device with empty local storage.

## Technical Approach

### 1. Extract tuning types and logic
Refactor `src/composables/useTunings.ts` into:
- A shared `Tuning` type
- `builtInTunings`
- Helper functions:
  - `serializeTuning`
  - `deserializeTuning`
  - `isValidTuning`

Recommended shape:

```ts
export interface InstrumentString {
  note: string;
  octave: number;
}

export interface Tuning {
  id: string;
  label: string;
  value: string;
  source: "builtin" | "custom";
  data: InstrumentString[];
}
```

### 2. Add a tuning storage composable
Create `src/composables/useCustomTunings.ts`.

Responsibilities:
- Read custom tunings from `localStorage`
- Save/update/delete tunings
- Merge built-in and custom tunings for UI consumption
- Generate stable IDs for saved custom tunings

Main API:

```ts
const {
  customTunings,
  allTunings,
  saveTuning,
  deleteTuning,
  getTuningById,
} = useCustomTunings();
```

### 3. Add tuning editor UI
Create a dedicated component, for example:
- `src/components/tuning-editor/TuningEditor.vue`

Responsibilities:
- Manage local draft state
- Validate note/octave input
- Emit save/cancel/delete events

Reuse current note list from `src/composables/useNotes.ts`.

### 4. Update App state model
In `src/App.vue`:
- Replace the current single preset lookup with a combined lookup across built-in and custom tunings.
- Add state for:
  - `selectedTuningId`
  - `isEditingCustomTuning`
  - `draftTuning`

The current `tuning` ref should remain the source passed into:
- `Fretboard`
- `use3nps`

### 5. URL handling
Current URL sync already stores `params.tuning = v.value`.

Extend this:
- Built-in tuning: keep current short value, e.g. `drop-d`
- Custom tuning: encode either
  - `tuningId=<saved-id>` when local preset exists
  - `tuningData=<serialized-json-or-compact-string>` for portable sharing

Preferred approach:
- Use `tuningData` for exact portability
- Optionally also store `tuningLabel`

### 6. Validation rules
- At least 1 string
- Reasonable max string count, for example 12
- Notes limited to supported note names from `useNotes.ts`
- Octave limited to a practical range, for example `0-7`

## Data Migration
- Keep existing built-in tuning values unchanged to avoid breaking old URLs.
- Default behavior remains `tunings[0]` when no tuning is present.

## Implementation Phases
1. Extract tuning model and storage composable.
2. Add custom tuning editor UI.
3. Update `App.vue` state and selector behavior.
4. Add URL serialization for custom tunings.
5. Add validation and empty/error states.

## Risks
- Shared URL behavior becomes inconsistent if custom tunings rely only on local IDs.
- 3NPS generation may produce invalid or poor shapes for unusual tunings or very low/high string counts.
- The current UI assumes guitar-like layouts, so spacing may need adjustment for 4-string and 7+ string instruments.

## Acceptance Criteria
- User can create and save a named tuning.
- Saved tuning appears in the tuning selector after reload.
- Fretboard and 3NPS update correctly for custom tunings.
- A shared URL with custom tuning data restores the same fretboard on another device.
