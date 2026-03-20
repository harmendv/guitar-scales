import { computed, ref, watch } from "vue";
import { useUrlSearchParams } from "@vueuse/core";
import { useCustomTunings } from "@/composables/useCustomTunings";
import {
    builtInTunings,
    deserializeTuning,
    serializeTuning,
    type InstrumentString,
} from "@/composables/useTunings";

export type FretboardViewMode = "full" | "3nps" | "position";

export function useAppState() {
    const params = useUrlSearchParams("history");
    const {
        allTunings,
        saveTuning,
        deleteTuning,
        getTuningById,
    } = useCustomTunings();
    const defaultTuning = builtInTunings[0];

    const note = ref<string>((params.note as string) || "C");
    const scale = ref<string>((params.scale as string) || "major");
    const mode = ref<number>(Number.parseInt(params.mode as string, 10) || 1);
    const chord = ref<number | null>(
        params.chord ? Number.parseInt(params.chord as string, 10) : null
    );
    const noteNames = ref<string>((params.noteNames as string) || "notes");
    const noteVisibility = ref<string>((params.noteVisibility as string) || "all");

    const legacyShow3nps = (params.show3nps as string) === "1";
    const viewModeParam = params.viewMode as string | undefined;
    const viewMode = ref<FretboardViewMode>(
        viewModeParam === "full" || viewModeParam === "3nps" || viewModeParam === "position"
            ? viewModeParam
            : legacyShow3nps
              ? "3nps"
              : "full"
    );

    const initialPositionStart = Number.parseInt(params.positionStart as string, 10);
    const positionStartFret = ref<number>(
        Number.isFinite(initialPositionStart) ? initialPositionStart : 0
    );
    const positionSpan = ref<number>(
        Math.max(1, Number.parseInt(params.positionSpan as string, 10) || 5)
    );
    const threeNpsShapeIndex = ref<number>(
        Math.max(0, (Number.parseInt(params.shape as string, 10) || 1) - 1)
    );

    function resolveInitialTuningId(): string {
        const builtinFromLegacyParam = builtInTunings.find(
            (tuning) => tuning.value === params.tuning
        );
        if (builtinFromLegacyParam) return builtinFromLegacyParam.id;

        if (typeof params.tuning === "string") {
            const byId = getTuningById(params.tuning);
            if (byId) return byId.id;
        }

        const fromUrl = typeof params.tuningData === "string"
            ? deserializeTuning(params.tuningData)
            : null;
        if (!fromUrl) return defaultTuning.id;

        const saved = saveTuning({
            label: (params.tuningLabel as string) || fromUrl.label || "Shared custom tuning",
            data: fromUrl.data,
        });
        return saved?.id || defaultTuning.id;
    }

    const selectedTuningId = ref<string>(resolveInitialTuningId());
    const tuning = computed(
        () => getTuningById(selectedTuningId.value) || defaultTuning
    );
    const tuningOptions = computed(() => allTunings.value);
    const canEditSelectedTuning = computed(() => tuning.value.source === "custom");

    const isEditingCustomTuning = ref(false);
    const tuningEditorMode = ref<"create" | "edit">("create");
    const draftTuning = ref<{
        id?: string;
        label: string;
        data: InstrumentString[];
    }>({
        label: "Custom tuning",
        data: tuning.value.data.map((stringData) => ({
            note: stringData.note,
            octave: stringData.octave,
        })),
    });
    const isEditingExistingCustomTuning = computed(
        () => Boolean(draftTuning.value.id) && tuning.value.source === "custom"
    );

    watch(note, (value) => {
        params.note = value;
    });
    watch(scale, (value) => {
        mode.value = 1;
        params.scale = value;
    });
    watch(mode, (value) => {
        chord.value = null;
        params.mode = value as never;
    });
    watch(noteNames, (value) => {
        params.noteNames = value;
    });
    watch(noteVisibility, (value) => {
        params.noteVisibility = value;
    });
    watch(viewMode, (value) => {
        params.viewMode = value;
        params.show3nps = value === "3nps" ? "1" : "0";
    });
    watch(chord, (value) => {
        params.chord = value as never;
    });
    watch(
        tuning,
        (activeTuning) => {
            if (activeTuning.source === "builtin") {
                params.tuning = activeTuning.value;
                delete params.tuningData;
                delete params.tuningLabel;
                return;
            }

            params.tuning = "custom";
            params.tuningData = serializeTuning({
                label: activeTuning.label,
                data: activeTuning.data,
            });
            params.tuningLabel = activeTuning.label;
        },
        { immediate: true, deep: true }
    );

    delete params.contentMode;
    delete params.arpeggioToneCount;

    function syncPositionStart(value: number) {
        if (positionStartFret.value !== value) {
            positionStartFret.value = value;
        }
        params.positionStart = String(value);
    }

    function syncPositionSpan(value: number) {
        if (positionSpan.value !== value) {
            positionSpan.value = value;
        }
        params.positionSpan = String(value);
    }

    function syncShapeIndex(value: number) {
        threeNpsShapeIndex.value = value;
        params.shape = String(value + 1);
    }

    function openCreateCustomTuning() {
        tuningEditorMode.value = "create";
        draftTuning.value = {
            label: `${tuning.value.label} custom`,
            data: tuning.value.data.map((stringData) => ({
                note: stringData.note,
                octave: stringData.octave,
            })),
        };
        isEditingCustomTuning.value = true;
    }

    function openEditCustomTuning() {
        if (tuning.value.source !== "custom") return;
        tuningEditorMode.value = "edit";
        draftTuning.value = {
            id: tuning.value.id,
            label: tuning.value.label,
            data: tuning.value.data.map((stringData) => ({
                note: stringData.note,
                octave: stringData.octave,
            })),
        };
        isEditingCustomTuning.value = true;
    }

    function closeCustomTuningEditor() {
        isEditingCustomTuning.value = false;
    }

    function onSaveCustomTuning(next: {
        id?: string;
        label: string;
        data: InstrumentString[];
    }) {
        const saved = saveTuning(next);
        if (!saved) return;
        selectedTuningId.value = saved.id;
        isEditingCustomTuning.value = false;
    }

    function onDeleteCustomTuning(id?: string) {
        if (!id) return;
        const deleted = deleteTuning(id);
        if (!deleted) return;
        if (selectedTuningId.value === id) {
            selectedTuningId.value = defaultTuning.id;
        }
        isEditingCustomTuning.value = false;
    }

    return {
        chord,
        canEditSelectedTuning,
        closeCustomTuningEditor,
        draftTuning,
        isEditingCustomTuning,
        isEditingExistingCustomTuning,
        mode,
        note,
        noteNames,
        noteVisibility,
        onDeleteCustomTuning,
        onSaveCustomTuning,
        openCreateCustomTuning,
        openEditCustomTuning,
        positionSpan,
        positionStartFret,
        scale,
        selectedTuningId,
        syncPositionSpan,
        syncPositionStart,
        syncShapeIndex,
        threeNpsShapeIndex,
        tuning,
        tuningEditorMode,
        tuningOptions,
        viewMode,
    };
}
