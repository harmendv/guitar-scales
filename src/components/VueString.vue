<template>
    <div class="vue-string" :style="`--divider: ${frets};`">
        <div
            class="vue-string__cell"
            :class="{
                'vue-string__cell--first': index === 0,
            }"
            v-for="(note, index) in notes"
            :key="index"
        >
            <div
                class="vue-string__note"
                :class="{
                    'vue-string__note--highlight': chordToneRoot ? !!note.chordTone : !!note.highlight,
                    'vue-string__note--root': chordToneRoot ? note.name === chordToneRoot : note.name === root,
                    'vue-string__note--scale': chordToneRoot && !note.chordTone && note.highlight,
                    'vue-string__note--hidden': !note.highlight && (showRest !== true),
                }"
            >
                <div class="vue-string__note-content">
                    <template v-if="showDegrees && note.degree">
                        {{ note.degree }}
                    </template>
                    <template v-else>
                        {{ note.name }}
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getNoteByOffset } from "../utils/notes";

export default {
    props: {
        start: {
            type: String,
            required: true,
        },
        frets: {
            type: Number,
            default: 19,
        },
        highlight: {
            type: Array,
            default: () => [],
        },
        degrees: {
            type: Object,
            default: () => ({}),
        },
        showDegrees: {
            type: [Boolean, String],
            default: false,
        },
        showRest: {
            type: [Boolean, String],
            default: false,
        },
        root: {
            type: String,
            required: true,
        },
        chordToneRoot: {
            type: [String, Number],
            default: null,
        }
    },
    computed: {
        highlightNotes() {
            return this.highlight.flatMap((i) => i.note);
        },
        notes() {
            const notes = [];
            for (let i = 0; i < this.frets; i++) {
                // Get the note by offset
                const note = getNoteByOffset(this.start, i);
                // Get the index of the note (to check if root)
                const highlightNoteIndex = this.highlightNotes.indexOf(note);
                // Check if the note exists in highlight
                const chordTone = this.highlight[highlightNoteIndex]?.chordTone;

                const obj = {
                    name: note,
                    highlight: !!this.highlightNotes.includes(note),
                    root: highlightNoteIndex === 0,
                    chordTone: !!chordTone,
                    degree: highlightNoteIndex >= 0 ? this.highlight[highlightNoteIndex].degree : false,
                };
                notes.push(obj);
            }
            return notes;
        },
    },
};
</script>

<style lang="scss">
.vue-string {
    $self: &;

    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;

    &__cell {
        position: relative;

        //width: calc(100% / var(--divider));
        flex-grow: 1;
        text-align: center;
        padding: clamp(10px, 1cqw, 14px);
        display: flex;
        justify-content: center;
        border-right: 2px solid var(--border-color);

        &:before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            height: 2px;
            width: 100%;
            background-color: var(--border-color);
            z-index: 1;
        }
        &:first-of-type {
            border-right: 4px solid var(--border-color);
            background-color: var(--border-color-light);
        }
        &:last-of-type {
            border-right: 0;
        }

        &--first {
            #{$self}__note {
                background: var(--border-color-light);
                &--highlight {
                    background: var(--color-primary);
                    color: #fff;
                }
                &--scale {
                    background: var(--color-primary-dimmed);
                }
                &--root {
                    background: var(--color-danger);
                    color: #fff;
                }
            }
        }
    }

    &__note {
        position: relative;
        background: var(--background-color);
        z-index: 1;
        width: clamp(24px, 3cqw, 32px);
        height: clamp(24px, 3cqw, 32px);
        flex-shrink: 0;
        display: flex;
        font-family: monospace;
        font-size: clamp(14px, 1.8cqw, 18px);
        font-weight: bold;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        color: var(--text-color);
        transition: .2s all;
        border: 2px solid transparent;

        &-content {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0;
        }
        &--highlight {
            background: var(--color-primary);
            color: #fff;
        }
        &--scale {
            background: var(--color-primary-dimmed);
            border: 2px solid var(--color-primary);
            color: var(--color-primary);
        }
        &--root {
            background: var(--color-danger);
            color: #fff;
        }
        &--hidden {
            opacity: 0;
        }
        &--chord-tone {
            outline: 5px dashed yellow
        }
    }

    &__degree {
        position: absolute;
        top: 2px;
        left: 3px;
        color: #fff;
        display: flex;
        border-radius: 100%;
        align-items: center;
        justify-content: center;
        font-size: clamp(4px, 1vw, 8px);
        text-align: center;
    }
}
</style>
