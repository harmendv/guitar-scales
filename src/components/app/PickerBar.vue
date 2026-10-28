<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import {
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
} from "reka-ui";
import { Segmented } from "@/components/ui/segmented";
import { formatNoteLabel } from "@/lib/notes";
import KeyPicker from "./pickers/KeyPicker.vue";
import ModeButtons from "./pickers/ModeButtons.vue";
import ScaleButtons from "./pickers/ScaleButtons.vue";
import { splitModeLabel } from "./pickers/scaleGroups";

const props = defineProps<{
    accidentalPreferenceOptions: { label: string; value: string }[];
    modeOptions: { label: string; value: number }[];
    notesOptions: { label: string; value: string }[];
    scalesOptions: { label: string; value: string }[];
}>();

const note = defineModel<string>("note", { required: true });
const scale = defineModel<string>("scale", { required: true });
const mode = defineModel<number>("mode", { required: true });
const accidentalPreference = defineModel<string>("accidentalPreference", { required: true });

type Sheet = "key" | "scale" | "mode";
const sheet = ref<Sheet | null>(null);
const open = computed({
    get: () => sheet.value != null,
    set: (value) => {
        if (!value) sheet.value = null;
    },
});

const titles: Record<Sheet, string> = { key: "Key", scale: "Scale", mode: "Mode" };
const items = computed(() => [
    { sheet: "key" as const, label: "Key", value: formatNoteLabel(note.value) },
    {
        sheet: "scale" as const,
        label: "Scale",
        value: props.scalesOptions.find((option) => option.value === scale.value)?.label ?? "",
    },
    {
        sheet: "mode" as const,
        label: "Mode",
        value: splitModeLabel(props.modeOptions.find((option) => option.value === mode.value)?.label ?? "").name,
    },
]);

function close() {
    sheet.value = null;
}
</script>

<template>
    <!-- Phones only: Key, Scale and Mode come first, each opening a sheet -->
    <nav
        class="rounded-xl border bg-card p-1.5 sm:hidden"
        aria-label="Key, scale and mode"
    >
        <div class="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,1fr)] divide-x">
            <button
                v-for="item in items"
                :key="item.sheet"
                type="button"
                class="flex min-w-0 flex-col items-start px-3 py-1.5 text-left outline-none transition-colors active:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
                @click="sheet = item.sheet"
            >
                <span class="text-xs text-muted-foreground">{{ item.label }}</span>
                <span class="flex w-full items-center gap-1 text-[15px] font-semibold">
                    <span class="truncate">{{ item.value }}</span>
                    <ChevronDown class="ml-auto size-4 shrink-0 text-muted-foreground" />
                </span>
            </button>
        </div>
    </nav>

    <DialogRoot v-model:open="open">
        <DialogPortal>
            <DialogOverlay
                class="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in"
            />
            <DialogContent
                class="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t bg-popover px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-popover-foreground shadow-xl outline-none duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
                :aria-describedby="undefined"
            >
                <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-border"></div>
                <div class="mb-3 flex h-7 items-center justify-between gap-3">
                    <DialogTitle class="font-display text-lg font-semibold tracking-tight">{{ sheet ? titles[sheet] : "" }}</DialogTitle>
                    <Segmented
                        v-if="sheet === 'key'"
                        v-model="accidentalPreference"
                        :options="accidentalPreferenceOptions"
                        class="p-0.5 [&_button]:h-6 [&_button]:min-w-7 [&_button]:px-2 [&_button]:text-[13px]"
                    />
                </div>
                <KeyPicker v-if="sheet === 'key'" v-model="note" :notes-options="notesOptions" @select="close" />
                <ScaleButtons v-else-if="sheet === 'scale'" v-model="scale" :scales-options="scalesOptions" @select="close" />
                <ModeButtons v-else-if="sheet === 'mode'" v-model="mode" :mode-options="modeOptions" @select="close" />
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
