<script setup lang="ts">
import { computed, ref } from "vue";
import { ChordDiagram } from "@/components/ui/chord-diagram";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCollapsedSection } from "@/composables/useCollapsedSection";
import type { ActiveShape } from "@/composables/useAppState";
import { useEdgeFade } from "@/composables/useEdgeFade";
import { playSequence } from "@/lib/audio";
import type { DisplayChord } from "@/lib/harmony";
import { formatNoteLabel, formatPitchClass, getPitchClass } from "@/lib/notes";
import type { InstrumentString } from "@/lib/tunings";
import type { Voicing } from "@/lib/voicings";

interface ChordShape {
    chord: DisplayChord;
    color: string;
    voicing: Voicing;
    // Its place in the chord's own list of shapes
    index: number;
}

const props = defineProps<{
    // Every selected chord's shapes, or every chord's in the key, up the neck
    shapes: ChordShape[];
    active: ActiveShape | null;
    strings: InstrumentString[];
    // The selected chords, named ("C", "Am"), even when none of their shapes fit the position
    chordNames: string[];
    // The box or 3NPS position the shapes are limited to, if any ("box 3")
    position: string | null;
    // Whether these are every chord in the key, as nothing is selected
    everyChord: boolean;
}>();

const collapsed = useCollapsedSection("shapes");

const emit = defineEmits<{
    select: [shape: ActiveShape | null];
}>();

// With one chord the heading names it too; every card always does
const severalChords = computed(() => props.chordNames.length > 1);
const description = computed(() => {
    if (props.position) return `Only the shapes inside ${props.position}, playable without moving your hand`;
    if (props.everyChord) return "Every chord in the key up the neck; select chords to narrow it down";
    return severalChords.value
        ? "Every selected chord's shapes up the neck, so the ones close together sit side by side"
        : "Tap a shape to play it and see it on the neck";
});

function isActive(shape: ChordShape) {
    return props.active?.chord === shape.chord.id && props.active.index === shape.index;
}

// Strums the shape low to high, each string sounding the note it's fretted at
function strum(voicing: Voicing) {
    const steps = voicing.frets.flatMap((fret, string) => {
        const pitchClass = getPitchClass(props.strings[string]?.note ?? "");
        if (fret == null || pitchClass == null) return [];
        const semitones = pitchClass + fret;
        return [{ note: formatPitchClass(semitones % 12), octave: props.strings[string].octave + Math.floor(semitones / 12) }];
    });
    playSequence(steps, 0.035);
}

// Tapping the shape on the neck again takes it off
function pick(shape: ChordShape) {
    if (isActive(shape)) {
        emit("select", null);
        return;
    }
    emit("select", { chord: shape.chord.id, index: shape.index });
    strum(shape.voicing);
}

const row = ref<HTMLElement | null>(null);
const edgeFade = useEdgeFade(row);
</script>

<template>
    <section>
        <div :class="['flex flex-col gap-1', !collapsed && 'mb-3']">
            <div class="flex h-7 items-center justify-between gap-3">
                <SectionHeading
                    v-model:collapsed="collapsed"
                    :title="severalChords ? 'Shapes' : `Shapes for ${chordNames[0] ?? ''}`"
                />
                <!-- Back to every selected chord's tones on the neck -->
                <button
                    v-if="active && !collapsed"
                    type="button"
                    class="h-6 rounded-md bg-surface px-2.5 text-[13px] font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    @click="emit('select', null)"
                >
                    Clear shape
                </button>
            </div>
            <p v-if="!collapsed" class="text-xs text-muted-foreground">
                {{ description }}
            </p>
        </div>
        <template v-if="!collapsed">
            <p v-if="!shapes.length" class="text-sm text-muted-foreground">
                {{
                    position
                        ? `No shapes fit inside ${position}. Try another position or the full neck.`
                        : `No playable shapes for ${severalChords ? "these chords" : "this chord"} in this tuning.`
                }}
            </p>
            <!-- One swipeable row, edge to edge on phones; padded so focus rings aren't clipped by the
                 scroller -->
            <div
                v-else
                ref="row"
                :style="edgeFade"
                class="edge-fade no-scrollbar -mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
            >
                <button
                    v-for="shape in shapes"
                    :key="`${shape.chord.id}-${shape.voicing.frets.join(',')}`"
                    type="button"
                    :aria-pressed="isActive(shape)"
                    :aria-label="`${formatNoteLabel(shape.chord.note)}${shape.chord.chord} ${shape.voicing.label}, frets ${shape.voicing.frets.map((fret) => fret ?? 'x').join(' ')}`"
                    :class="[
                        'flex shrink-0 flex-col items-center rounded-xl border px-2.5 pt-2 pb-2 transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive(shape) ? 'bg-surface' : 'border-border bg-card hover:border-foreground/30',
                    ]"
                    :style="isActive(shape) ? { borderColor: shape.color } : undefined"
                    @click="pick(shape)"
                >
                    <span
                        class="mb-1 rounded-md px-1.5 text-[11px] font-bold text-[#1a1918]"
                        :style="{ background: shape.color }"
                    >
                        {{ formatNoteLabel(shape.chord.note) }}{{ shape.chord.chord }}
                    </span>
                    <ChordDiagram
                        :frets="shape.voicing.frets"
                        :intervals="shape.voicing.intervals"
                        :base-fret="shape.voicing.baseFret"
                        :color="shape.color"
                    />
                    <span class="mt-1 text-[11px] font-semibold whitespace-nowrap">{{ shape.voicing.label }}</span>
                    <span class="text-[10px] text-muted-foreground tabular-nums">
                        {{ shape.voicing.baseFret === 0 ? "Open" : `Fret ${shape.voicing.baseFret}` }}
                    </span>
                </button>
            </div>
        </template>
    </section>
</template>
