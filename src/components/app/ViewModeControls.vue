<script setup lang="ts">
import { computed, ref } from "vue";
import { SlidersHorizontal } from "lucide-vue-next";
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import { Segmented } from "@/components/ui/segmented";
import { useEdgeFade } from "@/composables/useEdgeFade";
import type { PositionStyle } from "@/composables/useFretboardState";

const props = defineProps<{
    activePosition: number | null;
    noteNamesOptions: { label: string; value: string }[];
    noteVisibilityOptions: { label: string; value: string }[];
    positionCount: number;
    positionStyle: PositionStyle;
    shapeNotesPerString: number;
}>();

const noteNames = defineModel<string>("noteNames", { required: true });
const noteVisibility = defineModel<string>("noteVisibility", { required: true });

const emit = defineEmits<{
    selectPosition: [index: number | null];
    setPositionStyle: [style: PositionStyle];
}>();

const position = computed<number>({
    get: () => props.activePosition ?? -1,
    set: (value) => emit("selectPosition", value < 0 ? null : value),
});
const style = computed<PositionStyle>({
    get: () => props.positionStyle,
    set: (value) => emit("setPositionStyle", value),
});

const positionOptions = computed(() => [
    { label: "Full neck", value: -1 },
    ...Array.from({ length: props.positionCount }, (_, index) => ({
        label: String(index + 1),
        value: index,
    })),
]);
const positionRow = ref<HTMLElement | null>(null);
const edgeFade = useEdgeFade(positionRow);

const styleOptions = computed<{ label: string; value: PositionStyle }[]>(() => [
    { label: "Box", value: "box" },
    { label: `${props.shapeNotesPerString}NPS`, value: "3nps" },
]);
</script>

<template>
    <div class="flex items-center gap-2 sm:flex-wrap sm:justify-between sm:gap-3">
        <div class="hidden flex-wrap items-center gap-3 sm:flex">
            <Segmented v-model="noteNames" :options="noteNamesOptions" />
            <Segmented v-model="noteVisibility" :options="noteVisibilityOptions" />
        </div>

        <!-- Phones: the display toggles fold into a popover so the neck controls fit on one row -->
        <PopoverRoot>
            <PopoverTrigger
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-foreground sm:hidden"
                aria-label="Display options"
            >
                <SlidersHorizontal :size="16" />
            </PopoverTrigger>
            <PopoverPortal>
                <PopoverContent
                    side="bottom"
                    align="start"
                    :side-offset="6"
                    class="z-50 flex w-64 flex-col gap-3 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg"
                    @open-auto-focus.prevent
                >
                    <!-- Both switches stretch to the popover width, options sharing it equally -->
                    <div class="flex flex-col gap-1.5">
                        <span class="text-xs text-muted-foreground">Labels</span>
                        <Segmented v-model="noteNames" :options="noteNamesOptions" class="flex w-full [&_button]:flex-1" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <span class="text-xs text-muted-foreground">Show</span>
                        <Segmented v-model="noteVisibility" :options="noteVisibilityOptions" class="flex w-full [&_button]:flex-1" />
                    </div>
                </PopoverContent>
            </PopoverPortal>
        </PopoverRoot>

        <div
            ref="positionRow"
            :style="edgeFade"
            class="edge-fade no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:[mask-image:none] sm:max-w-full sm:flex-none sm:flex-wrap sm:gap-3 sm:overflow-visible">
            <Segmented
                v-model="style"
                :options="styleOptions"
                :class="activePosition == null ? 'shrink-0 opacity-60' : 'shrink-0'"
            />
            <Segmented v-model="position" :options="positionOptions" class="shrink-0" />
        </div>
    </div>
</template>
