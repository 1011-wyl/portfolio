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
      '让创作者确认方案、逐章生成并审核修改，以草稿、正式版本和长期记忆管理持续创作。',
    rationale:
      '将创作拆为 6 个步骤，设计差异预览、人工批准和正式提交路径；通过 8 维质量检查、跨章一致性审核与用量仪表盘管理质量和成本。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/NovelAI',
    previewUrl: './novel-agent-demo/',
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
      '把城市偏好、地图、天气、预算与行程组织成可编辑、可追问、可导出的逐日旅行计划。',
    rationale:
      '基于开源项目二次开发，重点进行规划体验重设计、预算与行程编辑联动、地图服务回退，并验证规划到导出的完整流程。',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/1011-wyl/TravelAI',
    previewUrl: './travelai-demo/',
    techStack: ['规划体验', '编辑联动', '异常兜底', '结果复用'],
    icon: '⌖',
    gradient: 'linear-gradient(135deg, #0d2430, #325b68)',
    image: '/projects/1011-wyl/travelai-mobile-itinerary.png',
    imageAlt: 'TravelAI 手机行程展示：厦门三日游、预算和每日行程',
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
    previewUrl: './moonlit-demo/',
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

