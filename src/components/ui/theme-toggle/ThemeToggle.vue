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
    document.body.setAttribute("data-theme", v);
    localStorage.setItem("theme", v);
});

onMounted(() => {
    document.body.setAttribute("data-theme", theme.value);
});
</script>

<template>
    <ToggleGroup
        type="single"
        class="border"
        v-model="theme"
    >
        <ToggleGroupItem value="light"> <SunIcon></SunIcon> </ToggleGroupItem>
        <ToggleGroupItem value="dark"> <MoonIcon></MoonIcon> </ToggleGroupItem>
    </ToggleGroup>
</template>
