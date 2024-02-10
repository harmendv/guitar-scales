import { createApp } from "vue";
import { spaceAfter } from "@libvue/core";
import "./style.scss";
import App from "./App.vue";

const app = createApp(App);

app.directive("space-after", spaceAfter);

app.mount("#app");
