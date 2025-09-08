<template>
    <div
        class="relative text-center p-2 flex justify-center border-r-2 border-transparent bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-grow first:border-r-4 first:border-transparent last:border-r-0"
        :style="`--divider: ${frets};`"
    >
        <div
            :class="[
                'relative z-10 p-0 w-8 md:w-10 h-8 md:h-10 flex font-mono text-base md:text-lg items-center justify-center rounded',
                highlight ? 'bg-slate-300 dark:bg-slate-900' : ''
            ]"
        >
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        frets: {
            type: Number,
            default: 19,
        },
        highlight: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
