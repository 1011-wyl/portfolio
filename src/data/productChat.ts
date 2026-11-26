export const QUICK_PROMPTS = [
  { label: '产品决策怎么做', prompt: 'NovelAI 中最关键的产品决策是什么？' },
  { label: '实习负责什么', prompt: '你在 OmniStream 实习中负责什么？' },
  { label: '如何评估 AI 效果', prompt: '你如何评估 AI 生成的质量与效果？' },
  { label: '如何控制成本', prompt: '你的 AI 产品如何控制调用成本？' },
  { label: '行程如何调整', prompt: 'TravelAI 如何支持用户调整旅行计划？' },
  { label: '为什么做产品', prompt: '你为什么选择 AI 产品经理方向？' },
];

export const ANSWERS = {
  challenge: 'NovelAI 中，我重点解决创作者如何控制 AI 修改的问题。我设计了目录、编辑器与 AI 助手三栏工作台，将修改拆为差异预览、批准或拒绝、写入草稿、提交正式版。自动保存和历史恢复帮助用户检查和撤回修改；正文与人物、时间线等记忆保持关联，避免只修改文本却留下旧设定。',
  internship: '我在厦门修蓁慧进科技有限公司担任 AI 产品实习生，简历时间为 2026.07—2026.12。围绕 OmniStream 直播电商 AI 复盘工作台，负责商品管理、知识库与智能对话迭代，梳理业务字段与任务状态；设计通用信息与 SKU 专属卖点管理、来源核对及人工采纳流程，并参与联调、缺陷走查和内部版本交付。',
  quality: '我会按具体任务定义检查标准。OmniStream 关注商品事实、SKU 与来源是否对应，以及建议能否被核对和采纳；NovelAI 设置 8 个可读性维度并检查人物、世界规则和时间线的一致性；TravelAI 检查规划、编辑、地图与导出的完整流程。现有材料以规则和流程验证为主，用户采纳率、节省时间等业务效果还需要真实试用记录。',
  ownership: 'NovelAI 和 TravelAI 是我的个人项目，我负责需求梳理、交互方案和体验验证。TravelAI 的产品设计由我从 0 独立完成，重点解决生成行程后如何继续调整、核对预算并导出。OmniStream 是团队实习项目，我负责商品管理、知识库和智能对话等模块的迭代与交付协作。',
  cost: '在 NovelAI 中，我按章组织上下文，复用细纲与审稿意见，并设置自动修订次数上限，避免失败后整条流程反复执行；用量仪表盘记录调用和 Token，便于定位消耗。设计方案时，我会同时考虑结果质量、等待时间与调用成本，具体节省比例需要同一任务的前后对照记录。',
  travel: 'TravelAI 让用户先用结构化表单说明城市、日期和偏好，再从概览、预算、地图、日程、图谱、天气 6 个分区检查方案。我重点完善预算与行程编辑，让地图和导出使用同一份计划；结合取消、撤销、历史恢复和上下文问答，支持生成后继续调整。外部地图失败时保留文字路线。',
  direction: '我的求职方向是 AI 产品经理。我希望把用户场景拆成明确的流程、交互和验收标准，再结合 Agent、RAG 与模型能力实现。研发实践让我能直接制作可交互原型、理解接口与技术边界；直播电商实习、NovelAI 和 TravelAI 则帮助我练习需求拆解、人机协作、质量控制和交付验证。',
  advantage: '我的特点是能把产品方案落实为可交互的页面，并继续跟进到接口联调与验证。我有 Python、LangGraph、SQL 及前端实践，能讨论 AI 工作流、流式反馈与异常处理，也能从用户的操作过程检查设计。案例中保留了需求、方案与交付依据，欢迎继续查看项目说明与演示。',
  default: '可以从预设问题了解我的产品决策、OmniStream 实习、NovelAI、TravelAI、质量验证与成本设计。这里是基于简历整理的预设问答演示，输入仅在当前页面处理。完整经历与联系方式可在页面下方的简历中查看。',
};

export function answerFor(question: string): string {
  const q = question.toLowerCase();
  if (/成本|token|费用|api|重试/.test(q)) return ANSWERS.cost;
  if (/评估|评测|质量|效果|准确|幻觉|验证/.test(q)) return ANSWERS.quality;
  if (/一个人|独立|主导|开源|负责范围|不会/.test(q)) return ANSWERS.ownership;
  if (/实习|omnistream|直播|公司/.test(q)) return ANSWERS.internship;
  if (/travel|旅行|行程/.test(q)) return ANSWERS.travel;
  if (/挑战|novel|小说|决策|协作/.test(q)) return ANSWERS.challenge;
  if (/优势|不同|同届|技术/.test(q)) return ANSWERS.advantage;
  if (/为什么|方向|产品经理|求职/.test(q)) return ANSWERS.direction;
  return ANSWERS.default;
}
