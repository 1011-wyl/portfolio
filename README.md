# 吴焰玲 · AI 应用开发作品集

面向 AI 应用开发实习岗位的个人作品集，展示 Agent 编排、RAG、多智能体系统与全栈项目。

在线地址：[https://1011-wyl.github.io/portfolio/](https://1011-wyl.github.io/portfolio/)

## 展示内容

- `NovelAI`：自主长篇小说创作 Agent
- `TravelAI`：多智能体个性化旅行规划
- `moomhit`：12 人多智能体文字狼人杀
- `psychology_system`：心理咨询与诊断全栈平台
- 集美大学教育背景、AI 应用开发实习经历与简历预览
- 无外部 API 依赖的本地简历问答交互

## 本地运行

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## GitHub Pages

推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并部署 `dist`。Vite 使用相对资源路径，因此既支持用户主页仓库，也支持项目仓库路径。

## 隐私

公开版简历隐藏了手机号与具体校区位置，只保留邮箱作为公开联系方式。

## 设计来源

页面布局、视觉节奏与交互以 [RyanFlow Portfolio](https://github.com/ryan-flow/portfolio) / [ryanflow.cloud](https://ryanflow.cloud/) 为参考，并替换为吴焰玲的项目与简历内容。

