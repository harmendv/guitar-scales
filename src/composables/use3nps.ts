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
    frets: [number, number, number];
    startDegree: number;
    center: number;
    span: number;
}

function modulo(value: number, base: number): number {
    return ((value % base) + base) % base;
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
    scaleDegreeByNote: Map<string, number>,
    fretCount: number,
    scaleLength: number
): Candidate[][] {
    return strings.map((stringData) => {
        const positions: StringNotePosition[] = [];
        for (let fret = 0; fret < fretCount; fret++) {
            const noteAtFret = getNoteByOffset(stringData.note, fret);
            const degreeIndex = scaleDegreeByNote.get(noteAtFret);
            if (degreeIndex != null) {
                positions.push({ fret, degreeIndex });
            }
        }

        const candidates: Candidate[] = [];
        for (let i = 0; i < positions.length - 2; i++) {
            const first = positions[i];
            const second = positions[i + 1];
            const third = positions[i + 2];
            if (
                !isConsecutiveDegree(first.degreeIndex, second.degreeIndex, scaleLength) ||
                !isConsecutiveDegree(second.degreeIndex, third.degreeIndex, scaleLength)
            ) {
                continue;
            }

            const span = third.fret - first.fret;
            if (span > 4) continue;

            candidates.push({
                frets: [first.fret, second.fret, third.fret],
                startDegree: first.degreeIndex,
                center: (first.fret + third.fret) / 2,
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
    specialTransitionIndex: number
): number[][] | null {
    const perString = candidatesByString.map((candidates, stringIndex) => {
        const expectedStartDegree = modulo(startDegree + stringIndex * 3, scaleLength);
        return candidates.filter(
            (candidate) => candidate.startDegree === expectedStartDegree
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
    fretCount: number
) {
    const shapes = computed<number[][][]>(() => {
        const orderedScaleNotes = scaleNotes.value;
        const tuningStrings = strings.value;
        const scaleLength = orderedScaleNotes.length;

        if (!scaleLength || scaleLength < 3 || !tuningStrings.length) return [];

        const scaleDegreeByNote = new Map<string, number>();
        orderedScaleNotes.forEach((scaleNote, index) =>
            scaleDegreeByNote.set(scaleNote.note, index)
        );

        const candidatesByString = buildCandidatesByString(
            tuningStrings,
            scaleDegreeByNote,
            fretCount,
            scaleLength
        );
        const specialTransitionIndex = findSpecialTransition(tuningStrings);

        const rawShapes: number[][][] = [];
        for (let degree = 0; degree < scaleLength; degree++) {
            const shape = solveShapeForStartDegree(
                candidatesByString,
                scaleLength,
                degree,
                specialTransitionIndex
            );
            if (shape) rawShapes.push(shape);
        }

        const unique: number[][][] = [];
        const seen = new Set<string>();
        rawShapes.forEach((shape) => {
            const key = shape.map((frets) => frets.join("-")).join("|");
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(shape);
            }
        });

        return unique;
    });

    return { shapes };
}
