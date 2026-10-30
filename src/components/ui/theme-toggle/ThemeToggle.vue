<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SunIcon, MoonIcon } from "lucide-vue-next";
import { onMounted, ref, watch } from "vue";

function preferredColorScheme() {
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    }
    return "light";
}

const theme = ref<string>(
    (localStorage.getItem("theme") as string) || preferredColorScheme()
);

watch(theme, (v) => {
    document.documentElement.setAttribute("data-theme", v);
    localStorage.setItem("theme", v);
});

onMounted(() => {
    document.documentElement.setAttribute("data-theme", theme.value);
});
</script>

<template>
    <ToggleGroup
        type="single"
        class="rounded-lg bg-surface p-0.5 [&_[data-slot=toggle-group-item]]:h-7 [&_[data-slot=toggle-group-item]]:rounded-md [&_[data-slot=toggle-group-item]]:px-2 [&_[data-state=on]]:bg-card [&_[data-state=on]]:shadow-sm [&_svg]:size-3.5"
        v-model="theme"
    >
        <ToggleGroupItem value="light"> <SunIcon></SunIcon> </ToggleGroupItem>
        <ToggleGroupItem value="dark"> <MoonIcon></MoonIcon> </ToggleGroupItem>
    </ToggleGroup>
</template>
