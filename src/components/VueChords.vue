<template>
    <div>
        <div class="flex w-full gap-4">
            <div class="border p-2 cursor-pointer grow rounded" v-for="(chord, index) in chords" :class="{'border-indigo-700 bg-indigo-100': active === index + 1}" @click="onClickChord(index)">
                <div class="bg-gray-100 mb-2 rounded" :class="{ 'bg-indigo-500 text-white': active === index + 1 }">{{ chord.degree }}</div>
                <div class="font-bold">{{ chord.note }}<sup>{{ chord.chord }}</sup></div>
            </div>
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