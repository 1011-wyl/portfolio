<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAppStore } from "@/stores/app.store";

const app = useAppStore();
</script>

<template>
  <div class="demo-banner">作品集演示 · 示例数据，不连接后端或 AI；草稿仅在本次页面会话中保留 <a href="../#projects">返回作品集</a></div>
  <RouterView />
  <div
    v-if="app.flashMessage"
    class="flash"
    :class="{ error: app.flashError }"
    role="status"
  >
    {{ app.flashMessage }}
  </div>
  <div v-if="app.busy" class="busy" role="status" aria-live="polite">
    <div class="spinner" aria-hidden="true" />
    <strong>{{ app.busyLabel }}</strong>
    <span>规划、写作和审核可能需要一点时间</span>
  </div>
</template>

<style scoped>
.demo-banner { position: relative; z-index: 1400; padding: 8px 12px; text-align: center; background: #ecf4ed; color: #315a3c; font-size: 13px; } .demo-banner a { margin-left: 12px; text-decoration: underline; color: inherit; }
.flash {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1200;
  max-width: min(420px, calc(100vw - 32px));
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  color: var(--color-text);
}

.flash.error {
  border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, white);
}

.busy {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: grid;
  place-content: center;
  gap: var(--space-2);
  text-align: center;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(2px);
}

.spinner {
  width: 28px;
  height: 28px;
  margin: 0 auto var(--space-2);
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
