<script setup lang="ts">
import { HarmenDevLogo } from "@/components/ui/harmen-dev-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
</script>

<template>
    <footer class="flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-4">
        <a
            class="group inline-flex items-center gap-1.5 hover:text-foreground"
            target="_blank"
            href="https://harmen.dev"
        >
            made by
            <HarmenDevLogo class="h-3.5 w-auto text-primary" />
            <span class="font-medium text-foreground group-hover:underline underline-offset-2">harmen.dev</span>
        </a>

        <ThemeToggle />
    </footer>
</template>
