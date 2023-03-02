<template>
    <div class="vue-fretboard">
        <vue-string
            v-for="(start, index) in reversedStrings"
            :frets="frets"
            :start="start"
            :key="index"
            :highlight="highlight"
            :degrees="degrees"
            :show-degrees="showDegrees"
            :show-rest="showRest"
        />
        <div class="vue-fretboard__fret-numbers">
            <vue-fret-number
                    v-for="(fret, index) in frets"
                    :key="`fret${index}`"
                    :highlight="[3, 5, 7, 9 , 12].includes(index)"
            >
                {{ index }}
            </vue-fret-number>
        </div>
    </div>
</template>

<script>
import VueString from "./VueString.vue";
import VueFretNumber from "./VueFretNumber.vue";

export default {
    components: {
        VueString,
        VueFretNumber,
    },
    props: {
        strings: {
            type: Array,
            default: () => ['E', 'A', 'D', 'G', 'B', 'E']
        },
        frets: {
            type: Number,
            default: 19,
        },
        highlight: {
            type: Array,
            default: () => []
        },
        degrees: {
            type: Object,
            default: () => ({})
        },
        showDegrees: {
            type: [Boolean, String],
            default: false,
        },
        showRest: {
            type: [Boolean, String],
            default: false,
        },
    },
    computed: {
        reversedStrings() {
            return Array.from(this.strings).reverse();
        }
    }
};
</script>


<style lang="scss">
.vue-fretboard {
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    width: 100%;
    background: var(--background-color);
    background-size: 100%;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow-y: hidden;
    box-shadow: var(--shadow);

    &__fret-numbers {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
}
</style>
