import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useProjectsStore } from "./stores/projects.store";
import { demoProjectIds } from "./api/demo";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/utilities.css";
import "./styles/transitions.css";

const app = createApp(App);
app.use(createPinia());
// Start with a valid seeded novel, so every project navigation link works on first visit.
const projects = useProjectsStore();
const ids = demoProjectIds();
if (!ids.includes(projects.selectedProjectId || "")) projects.selectProject(ids[0] || null);
app.use(router);
app.mount("#app");
