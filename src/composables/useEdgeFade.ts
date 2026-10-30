import { computed, type Ref } from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";

// Wide enough that a cut-off card clearly reads as "more this way", with no scrollbar to show it
const FADE = "64px";

// Style for an `edge-fade` scroller: each edge fades only while there is more to scroll that way.
export function useEdgeFade(element: Ref<HTMLElement | null>) {
    const { arrivedState, measure } = useScroll(element);
    useResizeObserver(element, () => measure());
    return computed(() => ({
        "--fade-start": arrivedState.left ? "0px" : FADE,
        "--fade-end": arrivedState.right ? "0px" : FADE,
    }));
}
