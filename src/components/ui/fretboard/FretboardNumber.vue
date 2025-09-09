<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        frets?: number;
        highlight?: boolean;
    }>(),
    {
        frets: 19,
        highlight: false,
    }
);
</script>

<template>
    <div
        class="relative text-center p-2 flex justify-center border-r-2 border-transparent bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-grow first:border-r-4 first:border-transparent last:border-r-0"
        :style="`--divider: ${props.frets};`"
    >
        <div
            :class="[
                'relative z-10 p-0 w-8 h-8  flex font-mono text-base md:text-md items-center justify-center rounded',
                props.highlight ? 'bg-slate-300 dark:bg-slate-900' : '',
            ]"
        >
            <slot />
        </div>
    </div>
</template>
