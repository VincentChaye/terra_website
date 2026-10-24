import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./assets/main.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).use(createHead()).mount("#app");
