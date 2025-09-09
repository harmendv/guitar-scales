<template>
    <div class="flex flex-wrap w-full gap-6">
        <div class="border p-2 cursor-pointer grow rounded-md" v-for="(chord, index) in chords" :class="{'border-indigo-700 bg-indigo-100 dark:bg-indigo-900': active === index + 1}" @click="onClickChord(index)">
            <div class="font-bold">{{ chord.note }}<sup>{{ chord.chord }}</sup></div>
        </div>
    </div>
</template>

<script>
export default {

    props: {
        chords: {
            type: Array,
            default: () => [],
        },
        active: {
            type: [String, Number],
            default: null,
        }
    },
    emits: ['click-chord'],
    methods: {
        onClickChord(index) {
            this.$emit('click-chord', index + 1);
        }
    }
};
</script>