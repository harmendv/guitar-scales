import { computed, ref, watch } from "vue";

const STORAGE_KEY = "collapsed-sections";

function readCollapsed(): string[] {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

// Shared by every section, so each one's state survives it being unmounted and shown again
const collapsed = ref<string[]>(readCollapsed());
watch(collapsed, (ids) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Private windows and blocked storage just forget it on reload.
    }
});

// Whether a section is folded down to its title, remembered in this browser rather than the URL,
// since it's how someone likes the page and not part of what they're showing.
export function useCollapsedSection(id: string) {
    return computed({
        get: () => collapsed.value.includes(id),
        set: (value: boolean) => {
            const others = collapsed.value.filter((other) => other !== id);
            collapsed.value = value ? [...others, id] : others;
        },
    });
}
