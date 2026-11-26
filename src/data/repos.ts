export interface Repo {
  name: string;
  displayName: string;
  description: string;
  rationale: string;
  language: string;
  stars: number;
  url: string;
  previewUrl?: string;
  prdUrl?: string;
  researchUrl?: string;
  techStack: string[];
  icon: string;
  gradient: string;
  image?: string;
  imageAlt?: string;
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
      '主修机器学习、数据可视化、数据结构、Python 程序设计、计算机网络等。连续 4 年获专业三等奖学金，获第十一届数学统计建模比赛省级二等奖，通过 CET-4。',
  },
];

export const repos: Repo[] = [
  {
    name: 'NovelAI',
    displayName: 'NovelAI · 长篇小说创作智能体',
    description:
      '面向长篇小说作者，针对 AI 续写容易偏离大纲、前后设定不一致的问题，提供从方案确认到逐章审阅的创作工作台。',
    rationale:
      '设计差异预览、人工确认和版本恢复，让作者决定哪些 AI 修改可以定稿，并把人物设定和时间线纳入跨章审核。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/NovelAI',
    previewUrl: './novel-agent-demo/',
    prdUrl: './prds/novel-agent-prd.pdf',
    techStack: ['创作流程', '人机协作', '版本管理', '质量审核'],
    icon: '✦',
    gradient: 'linear-gradient(135deg, #15122b, #3c276b)',
    image: '/projects/1011-wyl/novelai-mobile-workbench.png',
    imageAlt: 'NovelAI 创作工作台手机展示：创作方案、章节生成与章节储备',
  },
  {
    name: 'TravelAI',
    displayName: 'TravelAI · 旅行规划助手',
    description:
      '面向自由行用户，把分散的目的地信息、出行偏好和预算整理成可编辑的逐日行程，方便用户在旅途中继续调整。',
    rationale:
      '从 0 独立完成产品设计，梳理生成初稿、调整行程、核对预算和导出分享的流程，并为关键步骤制定验收标准。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/TravelAI',
    previewUrl: './travelai-demo/',
    prdUrl: './prds/travelai-prd.pdf',
    techStack: ['规划体验', '编辑联动', '异常兜底', '结果复用'],
    icon: '⌖',
    gradient: 'linear-gradient(135deg, #0d2430, #325b68)',
    image: '/projects/1011-wyl/travelai-mobile-itinerary.png',
    imageAlt: 'TravelAI 手机行程展示：厦门三日游、预算和每日行程',
  },
  {
    name: 'moomhit',
    displayName: '月下疑局 · AI 语音狼人杀',
    description:
      '面向想一个人也能开局的玩家，设计 12 人语音狼人杀。玩家可与 11 名 AI 同局，通过角色发言、讨论和投票推进推理。',
    rationale:
      '通过竞品调研梳理同局与观战两种场景，围绕角色发言是否容易区分、玩家能否跟上局势和看懂投票结果，设计完整对局体验。',
    language: 'TypeScript',
    stars: 0,
    url: 'https://github.com/1011-wyl/moomhit',
    previewUrl: './moonlit-demo/',
    prdUrl: './prds/moonlit-prd.pdf',
    researchUrl: './prds/moonlit-competitive-research.pdf',
    techStack: ['React 19', 'TypeScript', 'DeepSeek', 'State Machine', 'Vitest'],
    icon: '◐',
    gradient: 'linear-gradient(135deg, #10172c, #293e70)',
    image: '/projects/1011-wyl/moonlit-mobile-lobby.png',
    imageAlt: '月下疑局手机大厅：十二人镜隐迷踪、角色档案与对局配置',
  },
  {
    name: 'psychology_system',
    displayName: '心理咨询与诊断平台 · 心理服务管理',
    description:
      '为来访者提供心理评估、咨询预约和报告查看入口，让他们能查看预约进度，并了解接下来要做什么。',
    rationale:
      '梳理来访者、咨询师和管理员的分工，明确预约由谁确认和处理，以及谁可以查看敏感评估报告。',
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
  displayName: '吴焰玲',
  avatarUrl: 'https://avatars.githubusercontent.com/1011-wyl',
  bio: '集美大学数据科学与大数据技术专业 · AI 产品经理 · 需求、交互与交付',
  tagline: '需求拆解 · 人机协作 · AI 产品落地',
  githubUrl: 'https://github.com/1011-wyl',
  email: '2900818501@qq.com',
  phone: '15260485095',
  jobTarget: '求职方向：AI 产品经理',
  resumeUrl: '/resume.pdf',
};

