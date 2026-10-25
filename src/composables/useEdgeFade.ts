import { computed, type Ref } from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";

// Style for an `edge-fade` scroller: each edge fades only while there is more to scroll that way.
export function useEdgeFade(element: Ref<HTMLElement | null>) {
    const { arrivedState, measure } = useScroll(element);
    useResizeObserver(element, () => measure());
    return computed(() => ({
        "--fade-start": arrivedState.left ? "0px" : "24px",
        "--fade-end": arrivedState.right ? "0px" : "24px",
    }));
}
