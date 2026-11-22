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

## 月下疑局移动端演示

`moonlit-demo-src/` 保存新版移动端界面和浏览器规则引擎，替换原 `/moonlit-demo/` 入口。角色、存档和偏好仅保存在当前浏览器，不调用模型或后端服务。新版使用独立的存储键，不读取旧版固定剧情演示的存档。

```sh
cd moonlit-demo-src
npm ci
npm test
npm run build
```

构建会重新生成 `public/moonlit-demo/`，再回到仓库根目录运行 `npm run build` 即可打包整个作品集。GitHub Pages 工作流按同一顺序自动构建；静态资源使用相对路径，支持 `/portfolio/moonlit-demo/` 项目子目录。

界面沿用 2026-11-22 提供的 demo：大厅、角色编辑与试聊、普通/练习/导演模式、昼夜行动、警长与放逐投票、私人笔记和历史复盘。演示发言和决策由本地策略生成，不代表真实模型输出。
