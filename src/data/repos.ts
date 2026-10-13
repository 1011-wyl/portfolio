export interface Repo {
  name: string;
  displayName: string;
  description: string;
  rationale: string;
  language: string;
  stars: number;
  url: string;
  previewUrl?: string;
  techStack: string[];
  icon: string;
  gradient: string;
  image?: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  period: string;
  description?: string;
}

export const education: Education[] = [
  {
    school: '集美大学',
    degree: '本科',
    major: '数据科学与大数据技术',
    period: '2023.09 - 2027.06',
    description:
      '主修机器学习、数据结构、Python 程序设计、Java 程序设计、Web 程序设计与数据可视化。连续三年获专业三等奖学金，获第十一届数学统计建模比赛省级二等奖，通过 CET-4。',
  },
];

export const repos: Repo[] = [
  {
    name: 'NovelAI',
    displayName: 'NovelAI · 长篇小说创作 Agent',
    description:
      '从故事规划、联网调研到正文生成、质量审核、自动修订与长期记忆的自主长篇小说创作系统。',
    rationale:
      '[Agent 系统] 通过 LangGraph 编排规划、写作、审核、修订等 4 类模型角色，将章节生产拆成 7 个可追踪阶段；SQLite 管理人物关系、世界规则、时间线与伏笔，BGE-M3 召回相关章节和研究资料，并提供失败重试、状态恢复与人工审批。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/NovelAI',
    techStack: ['Python', 'LangGraph', 'RAG', 'BGE-M3', 'SQLite', 'Vue 3'],
    icon: '✦',
    gradient: 'linear-gradient(135deg, #15122b, #3c276b)',
    image: '/projects/1011-wyl/novelai.png',
  },
  {
    name: 'TravelAI',
    displayName: 'TravelAI · 多智能体旅行规划',
    description:
      '把城市偏好、地图、天气、预算与行程组织成可编辑、可追问、可导出的逐日旅行计划。',
    rationale:
      '[多智能体应用] 以 FastAPI + HelloAgents 协调目的地、路线、预算等智能体，通过 MCP 接入外部能力，使用 WebSocket 流式展示规划过程。地图服务提供多级降级，结构化结果可继续追问和调整。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/TravelAI',
    techStack: ['FastAPI', 'HelloAgents', 'MCP', 'WebSocket', 'Vue 3', 'ECharts'],
    icon: '⌖',
    gradient: 'linear-gradient(135deg, #0d2430, #325b68)',
    image: '/projects/1011-wyl/travelai.png',
  },
  {
    name: 'moomhit',
    displayName: '月下疑局 · 多智能体狼人杀',
    description:
      '本地 12 人文字狼人杀：11 个 AI 在隐藏信息、角色技能、警长竞选与并发投票中完成推理博弈。',
    rationale:
      '[多智能体游戏] 以状态机管理完整狼人杀规则，为不同角色隔离私有信息；并发驱动 AI 决策，加入严格投票超时与失败恢复，并通过批量对局验证完整闭环。',
    language: 'TypeScript',
    stars: 0,
    url: 'https://github.com/1011-wyl/moomhit',
    techStack: ['React 19', 'TypeScript', 'DeepSeek', 'State Machine', 'Vitest'],
    icon: '◐',
    gradient: 'linear-gradient(135deg, #10172c, #293e70)',
    image: '/projects/1011-wyl/moomhit.png',
  },
  {
    name: 'psychology_system',
    displayName: '心理咨询与诊断平台',
    description:
      '面向用户、咨询师和管理员的心理服务平台，覆盖心理评估、预约管理、报告查看与角色权限隔离。',
    rationale:
      '[全栈系统] Spring Boot + Vue 前后端分离，围绕敏感业务实现服务端权限校验、预约并发约束与 BCrypt 密码迁移；三类角色拥有清晰的数据与操作边界。',
    language: 'Java',
    stars: 0,
    url: 'https://github.com/1011-wyl/psychology_system',
    techStack: ['Spring Boot', 'Vue 2', 'MyBatis', 'MySQL', 'JWT'],
    icon: '◎',
    gradient: 'linear-gradient(135deg, #0e2422, #275e57)',
  },
];

export const githubUser = {
  username: '1011-wyl',
  displayName: 'Yanling Wu',
  avatarUrl: 'https://avatars.githubusercontent.com/1011-wyl',
  bio: '集美大学数据科学与大数据技术专业 · AI 应用开发 · Agent 与 RAG 系统',
  tagline: 'AI 应用开发 · Agent 编排 · RAG',
  githubUrl: 'https://github.com/1011-wyl',
  email: '2900818501@qq.com',
  jobTarget: 'AI 应用开发实习生 · 2027 届',
  resumeUrl: '/resume.pdf',
};

