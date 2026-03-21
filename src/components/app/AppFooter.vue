<script setup lang="ts">
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
</script>

<template>
    <div class="flex items-center justify-center flex-col mt-10">
        <Logo />

        <span class="text-sm mb-4">
            made by
            <a
                class="text-indigo-500"
                target="_blank"
                href="https://github.com/harmendv"
            >
                harmendv
            </a>
        </span>

        <ThemeToggle />
    </div>
</template>
