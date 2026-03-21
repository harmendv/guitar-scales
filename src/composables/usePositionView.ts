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

    const minStartFret = computed(() => 1 - safeSpan.value);
    const maxStartFret = computed(() => Math.max(0, totalFrets.value - 1));

    const safeStartFret = computed(() => {
        const rawStart = Number.isFinite(startFret.value)
            ? Math.trunc(startFret.value)
            : 0;
        return clamp(rawStart, minStartFret.value, maxStartFret.value);
    });

    const renderedSpan = computed(() =>
        clamp(
            Math.min(
                totalFrets.value - 1,
                safeStartFret.value + safeSpan.value - 1
            ) - Math.max(0, safeStartFret.value) + 1,
            0,
            safeSpan.value
        )
    );

    const endFret = computed(() =>
        safeStartFret.value + safeSpan.value - 1
    );
    const isFretInPosition = (fret: number) =>
        fret >= safeStartFret.value && fret <= endFret.value;
    const filterShapeToPosition = (shapeFrets: number[]) =>
        shapeFrets.filter((fret) => isFretInPosition(fret));

    return {
        minStartFret,
        safeSpan,
        maxStartFret,
        renderedSpan,
        safeStartFret,
        endFret,
        isFretInPosition,
        filterShapeToPosition,
    };
}
