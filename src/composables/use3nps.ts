import { computed, type ComputedRef } from "vue";
import { getNoteByOffset, getPitchClass, type ScaleNote } from "@/composables/useNotes";

interface InstrumentString {
    note: string;
    octave: number;
}

interface StringNotePosition {
    fret: number;
    degreeIndex: number;
}

interface Candidate {
    frets: number[];
    startDegree: number;
    center: number;
    span: number;
}

function modulo(value: number, base: number): number {
    return ((value % base) + base) % base;
}

// A playable shape stays within one hand position plus the shifts between strings.
const MAX_SHAPE_RANGE = 9;

function fretRange(shape: number[][]): number {
    const frets = shape.flat();
    return Math.max(...frets) - Math.min(...frets);
}

function isConsecutiveDegree(
    current: number,
    next: number,
    scaleLength: number
): boolean {
    return modulo(current + 1, scaleLength) === next;
}

function noteToAbsoluteSemitone(note: string, octave: number): number {
    const semitone = getPitchClass(note);
    if (semitone == null) return octave * 12;
    return octave * 12 + semitone;
}

function findSpecialTransition(strings: InstrumentString[]): number {
    if (strings.length < 2) return -1;
    for (let i = 0; i < strings.length - 1; i++) {
        const current = noteToAbsoluteSemitone(strings[i].note, strings[i].octave);
        const next = noteToAbsoluteSemitone(strings[i + 1].note, strings[i + 1].octave);
        if (next - current === 4) return i;
    }
    return -1;
}

function buildCandidatesByString(
    strings: InstrumentString[],
    scaleDegreeByPitchClass: Map<number, number>,
    fretCount: number,
    scaleLength: number,
    maxSpan: number,
    notesPerString: number
): Candidate[][] {
    return strings.map((stringData) => {
        const positions: StringNotePosition[] = [];
        for (let fret = 0; fret < fretCount; fret++) {
            const pitchClass = getPitchClass(getNoteByOffset(stringData.note, fret));
            const degreeIndex = pitchClass == null ? undefined : scaleDegreeByPitchClass.get(pitchClass);
            if (degreeIndex != null) {
                positions.push({ fret, degreeIndex });
            }
        }

        const candidates: Candidate[] = [];
        for (let i = 0; i + notesPerString <= positions.length; i++) {
            const group = positions.slice(i, i + notesPerString);
            const consecutive = group.every(
                (position, index) =>
                    index === 0 ||
                    isConsecutiveDegree(group[index - 1].degreeIndex, position.degreeIndex, scaleLength)
            );
            if (!consecutive) continue;

            const first = group[0];
            const last = group[group.length - 1];
            const span = last.fret - first.fret;
            if (span > maxSpan) continue;

            candidates.push({
                frets: group.map((position) => position.fret),
                startDegree: first.degreeIndex,
                center: (first.fret + last.fret) / 2,
                span,
            });
        }
        return candidates;
    });
}

function transitionCost(
    previous: Candidate,
    current: Candidate,
    isSpecialTransition: boolean
): number {
    const maxComfortShift = isSpecialTransition ? 2 : 1;
    const drift = current.center - previous.center;
    const absDrift = Math.abs(drift);

    let cost = 0;
    if (absDrift > maxComfortShift) {
        cost += (absDrift - maxComfortShift) * 6;
    } else {
        cost += absDrift * 0.5;
    }

    // Prefer moving slightly up or staying steady, avoid dropping hand position.
    if (drift < -1) cost += Math.abs(drift + 1) * 5;

    return cost;
}

function solveShapeForStartDegree(
    candidatesByString: Candidate[][],
    scaleLength: number,
    startDegree: number,
    specialTransitionIndex: number,
    notesPerString: number,
    startFret?: number
): number[][] | null {
    const perString = candidatesByString.map((candidates, stringIndex) => {
        const expectedStartDegree = modulo(startDegree + stringIndex * notesPerString, scaleLength);
        return candidates.filter(
            (candidate) =>
                candidate.startDegree === expectedStartDegree &&
                (stringIndex !== 0 || startFret == null || candidate.frets[0] === startFret)
        );
    });

    if (perString.some((candidates) => candidates.length === 0)) return null;

    const dpCosts: number[][] = perString.map((candidates) =>
        candidates.map(() => Number.POSITIVE_INFINITY)
    );
    const dpPrev: number[][] = perString.map((candidates) =>
        candidates.map(() => -1)
    );

    perString[0].forEach((candidate, index) => {
        dpCosts[0][index] = Math.pow(candidate.span - 2.5, 2);
    });

    for (let s = 1; s < perString.length; s++) {
        const currentCandidates = perString[s];
        const previousCandidates = perString[s - 1];
        for (let c = 0; c < currentCandidates.length; c++) {
            const current = currentCandidates[c];
            for (let p = 0; p < previousCandidates.length; p++) {
                if (!Number.isFinite(dpCosts[s - 1][p])) continue;
                const previous = previousCandidates[p];
                const transition = transitionCost(
                    previous,
                    current,
                    s - 1 === specialTransitionIndex
                );
                const currentCost = dpCosts[s - 1][p] + transition + Math.pow(current.span - 2.5, 2);
                if (currentCost < dpCosts[s][c]) {
                    dpCosts[s][c] = currentCost;
                    dpPrev[s][c] = p;
                }
            }
        }
    }

    const lastRow = dpCosts[dpCosts.length - 1];
    let bestIndex = -1;
    let bestCost = Number.POSITIVE_INFINITY;
    lastRow.forEach((cost, index) => {
        if (cost < bestCost) {
            bestCost = cost;
            bestIndex = index;
        }
    });
    if (bestIndex < 0) return null;

    const selected: number[][] = Array.from({ length: perString.length }, () => []);
    let pointer = bestIndex;
    for (let s = perString.length - 1; s >= 0; s--) {
        selected[s] = [...perString[s][pointer].frets];
        pointer = dpPrev[s][pointer];
        if (s > 0 && pointer < 0) return null;
    }

    return selected;
}

export function use3nps(
    scaleNotes: ComputedRef<ScaleNote[]>,
    strings: ComputedRef<InstrumentString[]>,
    fretCount: number,
    startFrets?: ComputedRef<number[]>
) {
    // Three notes per string for seven-note scales; pentatonics only fit on the neck as two
    // per string, which is how the classic pentatonic boxes are built.
    const notesPerString = computed(() => (scaleNotes.value.length <= 5 ? 2 : 3));
    const shapes = computed<number[][][]>(() => {
        const orderedScaleNotes = scaleNotes.value;
        const tuningStrings = strings.value;
        const scaleLength = orderedScaleNotes.length;

        if (!scaleLength || scaleLength < 3 || !tuningStrings.length) return [];

        const scaleDegreeByPitchClass = new Map<number, number>();
        orderedScaleNotes.forEach((scaleNote, index) =>
            scaleDegreeByPitchClass.set(scaleNote.pitchClass, index)
        );

        // Prefer a 4-fret stretch per string; scales with wide steps (Enigmatic, whole tone) need more.
        const candidatesBySpan = [4, 5, 6].map((maxSpan) =>
            buildCandidatesByString(
                tuningStrings,
                scaleDegreeByPitchClass,
                fretCount,
                scaleLength,
                maxSpan,
                notesPerString.value
            )
        );
        const specialTransitionIndex = findSpecialTransition(tuningStrings);

        // One shape per scale degree, indexed by degree so it lines up with the numbered positions.
        return Array.from({ length: scaleLength }, (_, degree) => {
            // Try the requested start, then an octave lower or higher, so shapes near the top of the
            // neck don't jump an octave halfway across the strings.
            const startFret = startFrets?.value[degree];
            const starts = startFret == null ? [undefined] : [startFret, startFret - 12, startFret + 12, undefined];
            let fallback: number[][] | null = null;
            for (const candidatesByString of candidatesBySpan) {
                for (const start of starts) {
                    if (start != null && start < 0) continue;
                    const shape = solveShapeForStartDegree(
                        candidatesByString,
                        scaleLength,
                        degree,
                        specialTransitionIndex,
                        notesPerString.value,
                        start
                    );
                    if (!shape) continue;
                    if (fretRange(shape) <= MAX_SHAPE_RANGE) return shape;
                    fallback ??= shape;
                }
            }
            return fallback ?? [];
        });
    });

    return { shapes, notesPerString };
}
