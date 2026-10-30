<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Pause, Play, Square } from "lucide-vue-next";
import { SectionHeading } from "@/components/ui/section-heading";
import { Segmented } from "@/components/ui/segmented";
import type { ProgressionStep } from "@/composables/useAppState";
import { useCollapsedSection } from "@/composables/useCollapsedSection";
import { useEdgeFade } from "@/composables/useEdgeFade";
import { playLoop } from "@/lib/audio";
import type { ChordKind, DisplayChord } from "@/lib/harmony";
import { formatNoteLabel } from "@/lib/notes";
import type { KeyProgression } from "@/lib/progressions";

type ShownProgression = KeyProgression & { colors: string[] };

const props = defineProps<{
    progressions: ShownProgression[];
    // The chord of the progression that's playing, if one is
    step: ProgressionStep | null;
    // The selected chords; only progressions with every one of them are shown
    filter: { id: string; name: string; color: string }[];
}>();

const emit = defineEmits<{
    show: [step: ProgressionStep | null];
    // Selects or deselects one of its chords, like its button in the chord panel
    toggle: [id: string];
}>();

// Folding it away keeps a loop playing
const collapsed = useCollapsedSection("progressions");

const bpm = ref(180);
const bpmOptions = [60, 120, 180].map((value) => ({
    label: String(value),
    value,
}));

// Grouped like the chord panel: in key, with a secondary dominant, or with a borrowed chord
const GROUP_LABELS = [
    { label: "In key", value: "diatonic" },
    { label: "Secondary", value: "secondary" },
    { label: "Borrowed", value: "borrowed" },
] as const;
const descriptions: Record<ChordKind, string> = {
    diatonic: "Loop one to play along, or tap a chord to select it",
    secondary: "With a dominant that leads into a chord of the key",
    borrowed:
        "With a chord from another mode on the same root, for a darker or brighter turn",
};
const group = ref<ChordKind>("diatonic");
// Selecting chords narrows the list to progressions that use them all
const filterNames = computed(() => listNames(props.filter.map((chord) => chord.name)));
const matchingProgressions = computed(() =>
    props.progressions.filter((entry) =>
        props.filter.every((selected) =>
            entry.chords.some((chord) => chord.id === selected.id)
        )
    )
);
// Marks the selected chords inside each card in their own colour
function filterColor(chord: DisplayChord) {
    return props.filter.find((selected) => selected.id === chord.id)?.color;
}

const groupOptions = computed(() =>
    GROUP_LABELS.filter((option) =>
        matchingProgressions.value.some((entry) => entry.kind === option.value)
    )
);
// The playing or paused progression leads every other tab, so its controls never go out of sight
// when another tab is picked; in its own tab it keeps its place
const visibleProgressions = computed(() => {
    const activeId = playingId.value ?? pausedId.value;
    const active = props.progressions.find((entry) => entry.progression.id === activeId);
    const inTab = matchingProgressions.value.filter((entry) => entry.kind === group.value);
    return active && active.kind !== group.value ? [active, ...inTab] : inTab;
});
// A key without progressions of this kind falls back to the first tab it has
watch(
    groupOptions,
    (options) => {
        if (!options.some((option) => option.value === group.value))
            group.value = options[0]?.value ?? "diatonic";
    },
    { immediate: true }
);

const chordName = (chord: DisplayChord) =>
    `${formatNoteLabel(chord.note)}${chord.chord}`;

function listNames(names: string[]) {
    return names.length > 1
        ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
        : (names[0] ?? "");
}

// Where its chords from outside the key come from: "E, A and D are each the V of the next
// chord", "D from Lydian"
function sourceLine(entry: ShownProgression) {
    const outside = [
        ...new Map(
            entry.chords
                .filter((chord) => chord.kind !== "diatonic")
                .map((chord) => [chord.id, chord])
        ).values(),
    ];
    const dominants = outside
        .filter((chord) => chord.kind === "secondary")
        .map(chordName);
    const sources = new Map<string, string[]>();
    for (const chord of outside) {
        if (chord.kind !== "borrowed") continue;
        const source = chord.source ?? "another mode";
        sources.set(source, [...(sources.get(source) ?? []), chordName(chord)]);
    }
    return [
        dominants.length === 1
            ? `${dominants[0]} is the V of the next chord`
            : dominants.length
              ? `${listNames(dominants)} are each the V of the next chord`
              : "",
        ...[...sources].map(([source, names]) => `${listNames(names)} from ${source}`),
    ]
        .filter(Boolean)
        .join(" · ");
}

function isLit(entry: ShownProgression, index: number) {
    return (
        props.step?.id === entry.progression.id &&
        props.step.index % entry.chords.length === index
    );
}

// The progression that's looping, if any; the loop reads its chords each bar, so switching
// between triads and sevenths or changing key carries on without a restart
const playingId = ref<string | null>(null);
// The progression that's paused: its chord stays on the neck until it resumes or stops
const pausedId = ref<string | null>(null);
let stopLoop: (() => void) | null = null;

// Pausing holds the chord it's on, highlighting and all
function pause() {
    stopLoop?.();
    stopLoop = null;
    pausedId.value = playingId.value;
    playingId.value = null;
}

// Stopping hands the neck back to the selected chords
function stop() {
    stopLoop?.();
    stopLoop = null;
    if (playingId.value || pausedId.value) emit("show", null);
    playingId.value = null;
    pausedId.value = null;
}

function start(id: string, from: number) {
    stopLoop?.();
    playingId.value = id;
    pausedId.value = null;
    emit("show", { id, index: from });
    stopLoop = playLoop({
        bars: () =>
            props.progressions
                .find((entry) => entry.progression.id === id)
                ?.chords.map((chord) => chord.tones.map((tone) => tone.note)) ??
            [],
        bpm: () => bpm.value,
        start: from,
        onBar: (index) => emit("show", { id, index }),
    });
}

// Play starts from the top; on a paused progression it resumes from the chord it's holding
function play(id: string) {
    start(id, pausedId.value === id && props.step?.id === id ? props.step.index : 0);
}

// In the playing or paused progression's card a chord is a place to go: playing, the loop jumps there;
// paused, it holds that chord instead. In any other card it selects the chord, while nothing's active.
function isActive(id: string) {
    return playingId.value === id || pausedId.value === id;
}
function tapChord(entry: ShownProgression, chord: DisplayChord, index: number) {
    const id = entry.progression.id;
    if (playingId.value === id) start(id, index);
    else if (pausedId.value === id) emit("show", { id, index });
    else emit("toggle", chord.id);
}

// Picking chords, another progression, or a key the progression can't be played in takes its chord
// off the neck and so ends it, playing or paused
watch(
    () => props.step?.id,
    (id) => {
        if (playingId.value && id !== playingId.value) {
            stopLoop?.();
            stopLoop = null;
            playingId.value = null;
        }
        if (pausedId.value && id !== pausedId.value) pausedId.value = null;
    }
);
onBeforeUnmount(stop);

const controlClass =
    "inline-flex size-7 items-center justify-center rounded-lg transition outline-none active:scale-90 focus-visible:ring-2 focus-visible:ring-ring";

const row = ref<HTMLElement | null>(null);
const edgeFade = useEdgeFade(row);
const controls = ref<HTMLElement | null>(null);
const controlsFade = useEdgeFade(controls);
</script>

<template>
    <section>
        <!-- Laid out like the chord panel: from sm up both toggles sit small in the title row -->
        <div :class="['flex flex-col gap-1', !collapsed && 'mb-3']">
            <div class="flex h-7 items-center justify-between gap-3">
                <SectionHeading
                    v-model:collapsed="collapsed"
                    title="Progressions"
                />
                <div
                    v-if="!collapsed"
                    class="hidden items-center gap-2 sm:flex"
                >
                    <Segmented
                        v-if="groupOptions.length > 1 && matchingProgressions.length"
                        v-model="group"
                        :options="groupOptions"
                        class="gap-2 p-0.5 [&_button]:h-6 [&_button]:px-2.5 [&_button]:text-[13px]"
                    />
                    <Segmented
                        v-model="bpm"
                        :options="bpmOptions"
                        class="p-0.5 [&_button]:h-6 [&_button]:px-2 [&_button]:text-[13px] [&_button]:tabular-nums"
                    />
                </div>
            </div>
            <p
                v-if="!collapsed"
                class="text-xs text-muted-foreground"
            >
                {{ descriptions[group] }}
            </p>
        </div>
        <template v-if="!collapsed">
            <!-- Phones: both toggles side by side under the description, sized and ordered like the
                 chord panel's (tempo first, as its size toggle is); when they don't fit, the row scrolls -->
            <div
                ref="controls"
                :style="controlsFade"
                class="edge-fade no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:hidden"
            >
                <Segmented
                    v-model="bpm"
                    :options="bpmOptions"
                    class="shrink-0 [&_button]:px-2 [&_button]:text-[13px] [&_button]:tabular-nums"
                />
                <Segmented
                    v-if="groupOptions.length > 1 && matchingProgressions.length"
                    v-model="group"
                    :options="groupOptions"
                    class="flex flex-1 shrink-0 [&_button]:flex-1 [&_button]:px-1.5 [&_button]:text-[13px]"
                />
            </div>
            <p
                v-if="!matchingProgressions.length"
                class="text-sm text-muted-foreground"
            >
                No progression here uses all of {{ filterNames }}.
            </p>
            <!-- One row of cards that scrolls sideways, like the shapes; each card is as wide as its
                 chords, so every card is one line of chords high -->
            <div
                v-if="matchingProgressions.length"
                ref="row"
                :style="edgeFade"
                class="edge-fade no-scrollbar -mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
            >
                <div
                    v-for="entry in visibleProgressions"
                    :key="entry.progression.id"
                    class="relative flex w-max min-w-[13rem] shrink-0 flex-col items-start rounded-xl border border-border bg-card px-4 py-3"
                >
                    <!-- Clear of the controls, two of them while paused -->
                    <span
                        :class="[
                            'text-[11px] text-muted-foreground',
                            pausedId === entry.progression.id ? 'mr-16' : 'mr-8',
                        ]"
                        >{{ entry.progression.style }}</span
                    >
                    <span
                        :class="[
                            'font-display text-base leading-tight font-bold',
                            pausedId === entry.progression.id ? 'mr-16' : 'mr-8',
                        ]"
                        >{{ entry.progression.name }}</span
                    >
                    <span class="mt-2 flex w-full gap-1">
                        <!-- Picks the chord, as its button above does, while nothing plays; in the
                             playing or paused card it's lit as the loop goes and goes to that chord -->
                        <button
                            v-for="(chord, index) in entry.chords"
                            :key="index"
                            type="button"
                            :disabled="(playingId != null || pausedId != null) && !isActive(entry.progression.id)"
                            :aria-label="isActive(entry.progression.id) ? `Go to ${chordName(chord)}` : chordName(chord)"
                            :aria-pressed="isActive(entry.progression.id) ? undefined : filterColor(chord) != null"
                            :aria-current="isLit(entry, index) || undefined"
                            :class="[
                                'flex min-w-9 flex-1 flex-col items-center rounded-md border px-1.5 py-1 leading-none transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                chord.kind === 'diatonic'
                                    ? 'border-transparent'
                                    : 'border-dashed border-foreground/35',
                                isLit(entry, index)
                                    ? 'text-[#1a1918]'
                                    : 'bg-surface/60 enabled:hover:bg-surface',
                            ]"
                            :style="
                                isLit(entry, index)
                                    ? {
                                          background: entry.colors[index],
                                          borderColor: entry.colors[index],
                                      }
                                    : undefined
                            "
                            @click="tapChord(entry, chord, index)"
                        >
                            <span class="text-[10px] tabular-nums opacity-70">{{
                                entry.numerals[index]
                            }}</span>
                            <span
                                class="mt-1 text-[13px] font-semibold whitespace-nowrap"
                                >{{ chordName(chord) }}</span
                            >
                            <!-- Always there, so selecting the first chord doesn't make the cards grow -->
                            <span
                                class="mt-1 size-1.5 rounded-full"
                                :style="{
                                    background:
                                        filterColor(chord) ?? 'transparent',
                                }"
                            ></span>
                        </button>
                    </span>
                    <!-- As wide as the chords above it, not wider, wrapping if it needs to -->
                    <span
                        v-if="entry.outside"
                        class="mt-2 w-0 min-w-full text-[11px] leading-snug text-muted-foreground"
                        >{{ sourceLine(entry) }}</span
                    >
                    <!-- Play, which pauses while playing, stays in the corner; while paused, Stop
                         appears to its left, so the two never swap places -->
                    <div class="absolute top-2 right-2 flex gap-1">
                        <!-- Grows in when it pauses, shrinks away when it plays on or stops -->
                        <Transition
                            enter-active-class="transition duration-150 ease-out"
                            enter-from-class="scale-75 opacity-0"
                            leave-active-class="transition duration-100 ease-in"
                            leave-to-class="scale-75 opacity-0"
                        >
                            <button
                                v-if="pausedId === entry.progression.id"
                                type="button"
                                :aria-label="`Stop ${entry.progression.name}`"
                                :class="[controlClass, 'bg-surface text-muted-foreground hover:text-foreground']"
                                @click="stop"
                            >
                                <Square class="size-2.5 fill-current" />
                            </button>
                        </Transition>
                        <button
                            type="button"
                            :aria-label="
                                playingId === entry.progression.id
                                    ? `Pause ${entry.progression.name}`
                                    : pausedId === entry.progression.id
                                      ? `Resume ${entry.progression.name}`
                                      : `Loop ${entry.progression.name}`
                            "
                            :class="[
                                controlClass,
                                playingId === entry.progression.id || pausedId === entry.progression.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-surface text-muted-foreground hover:text-foreground',
                            ]"
                            @click="playingId === entry.progression.id ? pause() : play(entry.progression.id)"
                        >
                            <Pause
                                v-if="playingId === entry.progression.id"
                                class="size-3 fill-current"
                            />
                            <Play
                                v-else
                                class="ml-px size-3 fill-current"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </section>
</template>
