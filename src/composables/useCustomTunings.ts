import { computed, ref } from "vue";
import {
    builtInTunings,
    isValidTuning,
    type InstrumentString,
    type Tuning,
} from "@/composables/useTunings";

const STORAGE_KEY = "guitar-scales.custom-tunings.v1";

interface StoredCustomTuning {
    id: string;
    label: string;
    data: InstrumentString[];
}

function normalizeCustomTuning(stored: StoredCustomTuning): Tuning {
    return {
        id: stored.id,
        label: stored.label,
        value: `custom-${stored.id}`,
        source: "custom",
        data: stored.data,
    };
}

function safeReadStorage(): StoredCustomTuning[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((entry): entry is StoredCustomTuning => {
                if (!entry || typeof entry !== "object") return false;
                const maybe = entry as Partial<StoredCustomTuning>;
                if (typeof maybe.id !== "string" || !maybe.id.trim()) return false;
                if (!isValidTuning({ label: maybe.label, data: maybe.data })) return false;
                return true;
            })
            .map((entry) => ({
                id: entry.id,
                label: entry.label.trim(),
                data: entry.data.map((stringData) => ({
                    note: stringData.note,
                    octave: stringData.octave,
                })),
            }));
    } catch {
        return [];
    }
}

function safeWriteStorage(tunings: StoredCustomTuning[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tunings));
}

function makeId() {
    return `ct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCustomTunings() {
    const customTunings = ref<StoredCustomTuning[]>(safeReadStorage());

    const allTunings = computed<Tuning[]>(() => [
        ...builtInTunings,
        ...customTunings.value.map(normalizeCustomTuning),
    ]);

    function saveTuning(input: { id?: string; label: string; data: InstrumentString[] }): Tuning | null {
        const normalized = {
            label: input.label.trim(),
            data: input.data.map((stringData) => ({
                note: stringData.note,
                octave: stringData.octave,
            })),
        };
        if (!isValidTuning(normalized)) return null;

        const id = input.id?.trim() || makeId();
        const nextEntry: StoredCustomTuning = { id, ...normalized };
        const existingIndex = customTunings.value.findIndex((tuning) => tuning.id === id);

        if (existingIndex >= 0) {
            customTunings.value[existingIndex] = nextEntry;
        } else {
            customTunings.value.push(nextEntry);
        }

        safeWriteStorage(customTunings.value);
        return normalizeCustomTuning(nextEntry);
    }

    function deleteTuning(id: string): boolean {
        const before = customTunings.value.length;
        customTunings.value = customTunings.value.filter((tuning) => tuning.id !== id);
        const deleted = customTunings.value.length !== before;
        if (deleted) safeWriteStorage(customTunings.value);
        return deleted;
    }

    function getTuningById(id: string): Tuning | undefined {
        return allTunings.value.find((tuning) => tuning.id === id);
    }

    return {
        customTunings,
        allTunings,
        saveTuning,
        deleteTuning,
        getTuningById,
    };
}
