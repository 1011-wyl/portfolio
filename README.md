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
- `src/data/repos.ts`：教育背景、项目演示与联系方式。填写 `prdUrl` 后会显示「查看 PRD」，也可填写 `researchUrl` 在同一弹窗中加入竞品调研报告。站内 PDF 放在 `public/prds/` 并填写相对地址，公开在线文档可填写完整网址。
- `src/data/productChat.ts`：基于简历的预设问答，无外部模型调用。
- `public/resume.pdf`：最新 AI 产品经理简历；两页预览分别为 `resume-preview.png` 和 `resume-preview-2.png`，更新简历时同步更新预览。

NovelAI、TravelAI 和月下疑局的公开演示保留原入口。TravelAI 的产品设计从 0 独立完成，相关案例说明了工作范围。演示中的固定样本不用于证明真实用户规模或业务增益。

## NovelAI 完整界面演示

`novel-agent-demo-src/` 沿用 [NovelAI](https://github.com/1011-wyl/NovelAI) 提交 `93de5d9` 的全部页面。60 个 Vue 组件和 CSS 文件保持原样，校验记录在 `docs/novel-demo-upstream.json`。演示入口仍为 `/novel-agent-demo/`，首次访问自动选中示例小说。

```sh
cd novel-agent-demo-src
npm ci
npm run check:ui
npm test
npm run build
```

构建会重新生成 `public/novel-agent-demo/` 的全部页面资源，随后在根目录运行 `npm run build`。Pages 工作流自动执行同样的界面校验、测试和构建，避免源代码已更新但公开演示仍使用旧文件。完整功能与示例数据说明见 [小说演示指南](docs/novel-demo.md)。

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
