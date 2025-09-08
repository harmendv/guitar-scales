import { defineConfig } from "vite";
import path from 'node:path'
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    base: "/guitar-scales/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
