import { computed, type Ref } from "vue";

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function usePositionView(
    startFret: Ref<number>,
    span: Ref<number>,
    totalFrets: Ref<number>
) {
    const safeSpan = computed(() => {
        const rawSpan = Number.isFinite(span.value) ? Math.trunc(span.value) : 1;
        return clamp(rawSpan, 1, Math.max(1, totalFrets.value));
    });

    const safeStartFret = computed(() => {
        const rawStart = Number.isFinite(startFret.value)
            ? Math.trunc(startFret.value)
            : 0;
        const maxStart = Math.max(0, totalFrets.value - safeSpan.value);
        return clamp(rawStart, 0, maxStart);
    });

    const endFret = computed(() => safeStartFret.value + safeSpan.value - 1);
    const isFretInPosition = (fret: number) =>
        fret >= safeStartFret.value && fret <= endFret.value;
    const filterShapeToPosition = (shapeFrets: number[]) =>
        shapeFrets.filter((fret) => isFretInPosition(fret));

    return {
        safeSpan,
        safeStartFret,
        endFret,
        isFretInPosition,
        filterShapeToPosition,
    };
}
