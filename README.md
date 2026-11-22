# 吴焰玲的 AI 产品经理作品集

展示 OmniStream 直播电商 AI 复盘工作台实习、NovelAI 长篇小说创作智能体、TravelAI 旅行规划助手等经历，重点介绍用户问题、产品方案与交付验证。

## 本地运行

```sh
npm ci
npm run dev
```

`npm run build` 执行 TypeScript 检查并生成 `dist/`。项目采用 React、TypeScript、MUI 和 Vite，沿用 GitHub Pages 工作流部署。

## 内容维护

- `src/data/profile.ts`：实习与核心产品案例、在校经历。
- `src/data/repos.ts`：教育背景、项目演示与联系方式。
- `src/data/productChat.ts`：基于简历的预设问答，无外部模型调用。
- `public/resume.pdf`：最新 AI 产品经理简历；两页预览分别为 `resume-preview.png` 和 `resume-preview-2.png`，更新简历时同步更新预览。

NovelAI、TravelAI 和月下疑局的公开演示保留原入口。TravelAI 为基于开源项目的二次开发，相关案例说明了工作范围。演示中的固定样本不用于证明真实用户规模或业务增益。
