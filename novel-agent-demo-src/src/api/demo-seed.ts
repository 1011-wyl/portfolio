import sampleChapters from './demo-chapters.json';
import type { BriefVersion, ProjectDetail, ProjectRecord, NovelCreatePayload, SettingsPayload } from './contracts';
import type { AssistantSession, AssistantMessage, AssistantChangeSet, ChapterEditDraft, ChapterVersionSnapshot } from '@/features/reader/api/reader.api';
import type { LlmSettingsView } from '@/features/settings/llm/model/contracts';
import type { LlmRecordItem } from '@/features/analytics/types/analytics.types';

export const DEMO_STORAGE_KEY = 'novel-agent-portfolio-demo-v2';
export type DemoSession = AssistantSession & { chapterNumber: number };
export type DemoSnapshot = { id: string; status: string; created_at: string; rollback_allowed: boolean; detail: ProjectDetail };
export type DemoDatabase = {
  schema: 2;
  sequence: number;
  projects: Record<string, ProjectDetail>;
  drafts: Record<string, ChapterEditDraft>;
  versions: Record<string, ChapterVersionSnapshot[]>;
  briefVersions: Record<string, BriefVersion[]>;
  sessions: Record<string, DemoSession>;
  messages: Record<string, AssistantMessage[]>;
  changes: Record<string, AssistantChangeSet[]>;
  snapshots: Record<string, DemoSnapshot>;
  preferences: SettingsPayload['preferences'];
  llm: LlmSettingsView;
  records: LlmRecordItem[];
};

export const chapterKey = (projectId: string, number: number) => `${projectId}:${number}`;
export const isoNow = () => new Date().toISOString();
export function dateAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function defaultLlm(): LlmSettingsView {
  return {
    provider: 'deepseek', provider_label: 'DeepSeek（演示）', base_url: 'https://api.deepseek.com', model: 'deepseek-chat',
    enabled: false, has_api_key: true, api_key_mask: 'DEMO · 非真实密钥', verification_status: 'unverified',
    last_tested_at: null, last_error_code: null, source: 'offline', version: 1,
    timeout_seconds: 120, max_retries: 2, card_status: 'disabled',
    presets: [
      { provider: 'deepseek', provider_label: 'DeepSeek', base_url: 'https://api.deepseek.com', model: 'deepseek-chat' },
      { provider: 'dashscope', provider_label: '通义千问', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
      { provider: 'openai', provider_label: 'OpenAI', base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
      { provider: 'openai_compatible', provider_label: '兼容 OpenAI 的服务', base_url: 'https://example.com/v1', model: 'demo-model' },
    ],
  };
}

export function createProject(id: string, input: Partial<NovelCreatePayload> = {}): ProjectDetail {
  const request: NovelCreatePayload = {
    preferred_title: null, audience_channel: '女频', genre: '悬疑', experiences: ['悬疑探秘'], elements: ['旧日谜团'],
    protagonist_tags: [], romance: null, idea: '一封迟到七年的信，揭开一座岛的秘密。', must_have: [], nice_to_have: [], exclude: [],
    chapter_target_chars: 2200, daily_chapters: 2, reserve_target: 5, require_plan_confirmation: true, ...input,
  };
  const title = request.preferred_title?.trim() || '未命名的故事';
  const project: ProjectRecord = {
    id, title, status: 'DRAFT', confirmed: !request.require_plan_confirmation, current_chapter: 0,
    created_at: isoNow(), updated_at: isoNow(), request,
    brief: {
      selected_title: title, title_candidates: [title, `${title}：未寄出的信`, `${title}：归途`],
      synopsis: request.idea, target_readers: `喜欢${request.genre}与人物成长的${request.audience_channel}读者`,
      selling_points: request.elements.length ? request.elements : ['人物选择推动情节', '线索逐步揭晓'],
      protagonist: '林见微', protagonist_name: '林见微', protagonist_profile: '旧书店店主，谨慎而敏锐，擅长从细节发现矛盾。',
      main_conflict: '追寻失踪的父亲与雾岛的真相', reader_contract: '每章解决一个小疑问，同时留下可以回查的线索。',
      core_expectation: '悬疑与人物成长并行', world_rules: ['雾岛从公开地图上消失', '人物只知道已在正文中获得的信息'],
      total_chapters: 100, volume_count: 4,
      opening_three_chapters: ['雨夜收到来信', '地下室的灯亮起', '一张地图出现'],
      opening_chapter_anchors: [{ number: 1, title: '雨夜来信', core_event: '林见微收到父亲七年前寄出的信', must_establish: ['旧书店', '父亲失踪'], forbidden_assumptions: ['提前知道观测站的真相'], ending_direction: '地下室传出异响' }],
      update_plan: `每日 ${request.daily_chapters} 章，储备 ${request.reserve_target} 章`, style_guide: ['细节中埋设悬念', '用动作和对话呈现人物判断'],
    },
  };
  if (project.confirmed) project.status = 'ACTIVE';
  return { project, chapters: [], latest_events: [], characters: [], world_facts: [], timeline: [], research_sources: [], semantic_document_count: 0, reserve_count: 0, chapter_failures: [] };
}

export function createDemoDatabase(): DemoDatabase {
  const main = createProject('demo', { preferred_title: '雾岛来信' });
  main.project.confirmed = true;
  main.project.status = 'ACTIVE';
  main.project.current_chapter = 3;
  const summaries = ['林见微收到失踪父亲寄来的信，旧书店地下室传出不明声音。', '断电后的地下室亮起灯光，林见微发现暗道与父亲留下的暗号。', '雾岛地图指向十七号观测站，林见微决定前往东堤。'];
  main.chapters = sampleChapters.map(([title, content], i) => ({ id: `demo-chapter-${i + 1}`, number: i + 1, title: title!, content: content!, summary: summaries[i]!, status: 'READY', version: i === 0 ? 2 : 1, created_at: `${dateAgo(2 - i)}T08:30:00+08:00` }));
  main.reserve_count = 3;
  main.latest_events = [
    { node: 'plan', message: '第 3 章规划完成：将地图线索交给主角', progress: 20 },
    { node: 'write', message: '示例正文已生成', progress: 55 },
    { node: 'review', message: '叙事一致性、人物与字数审核通过', progress: 85 },
    { node: 'commit', message: '正式章节、人物档案与时间线已同步', progress: 100 },
  ];
  main.characters = [
    { id: 'demo-linjianwei', name: '林见微', role: 'protagonist', version: 3,
      immutable_facts: ['人物背景：经营临海旧书店，父亲七年前失踪。', '性格特征：谨慎敏锐，不轻信未经核实的线索。', '能力边界：没有全知能力，只能依据已获得的证据推理。'],
      current_state: { last_seen_chapter: 3, importance: 'core', current_goal: '沿东堤寻找十七号观测站', location: '旧书店地下室', knowledge: ['信封中的日期有矛盾', '雾岛地图标有一处观测站'], inventory: ['父亲的信', '黄铜钥匙', '雾岛地图'], relationships: { 林远山: '父女，寻找其失踪线索', 陈默: '暂时合作，尚未完全信任' } } },
    { id: 'demo-linyuanshan', name: '林远山', role: 'family', version: 2,
      immutable_facts: ['人物背景：林见微的父亲，曾参与雾岛测绘。', '七年前失踪，目前仅通过信件和回忆出现。'],
      current_state: { last_seen_chapter: 2, importance: 'important', current_goal: '通过旧信向女儿传递线索', condition: '下落不明', knowledge: ['观测站与旧地图有关'], relationships: { 林见微: '女儿' } } },
    { id: 'demo-chenmo', name: '陈默', role: 'ally', version: 1,
      immutable_facts: ['人物背景：熟悉沿海航路的年轻修船匠。', '性格特征：寡言，习惯先观察再行动。'],
      current_state: { last_seen_chapter: 3, importance: 'important', current_goal: '确认地图上的航标', location: '东堤附近', emotion: '警惕', relationships: { 林见微: '愿意提供航路帮助' } } },
  ];
  main.world_facts = [
    { category: '地点', statement: '雾岛在现代公开地图上没有标记，但旧海图仍保留轮廓。', locked: true },
    { category: '地点', statement: '旧书店地下室有一条通往东堤方向的暗道。', locked: true },
    { category: '时间', statement: '林远山失踪七年，信件的投递时间与落款不一致。', locked: true },
    { category: '信息边界', statement: '十七号观测站的用途尚未揭晓，人物不能提前得知。', locked: true },
  ];
  main.timeline = summaries.map((event, i) => ({ chapter_number: i + 1, event }));
  main.research_sources = [
    { title: '雾岛地方志摘录（虚构示例资料）', domain: '故事设定资料库', excerpt: '旧海图记录了东堤至观测站的潮汐通路，涨潮时不可通行。此条为演示中的虚构参考资料。', verified: false, reliability: 0.65 },
    { title: '观测站值班簿（虚构示例资料）', domain: '故事设定资料库', excerpt: '值班簿末页留下了与信件相同的日期，用于演示资料与章节证据的关联。', verified: false, reliability: 0.6 },
  ];
  main.semantic_document_count = 12;

  const repair = structuredClone(main);
  repair.project = { ...repair.project, id: 'demo-revision', title: '雾岛来信 · 修订练习', status: 'HUMAN_REQUIRED' };
  repair.project.brief.selected_title = repair.project.title;
  repair.chapters.forEach(c => { c.id = `demo-revision-chapter-${c.number}`; c.version = 1; });
  repair.chapters[0]!.status = 'FAILED';
  repair.chapters[0]!.summary = '示例待修改章节：开篇人物提前知道未来线索，需要检查信息边界。';
  repair.chapter_failures = [{ chapter_number: 1, error_code: 'QUALITY_REVIEW', node: 'review', decision: 'revise', score: 58, pass_score_exclusive: 60,
    issues: [{ category: '人物一致性', severity: 'high', message: '主角在收到来信前已知观测站位置，请回到开篇锚点核对。' }, { category: '节奏', severity: 'medium', message: '开篇信息过密，建议以信件与书店异响建立悬念。' }],
    recommended_rework_mode: 'reuse_plan', opening_repair_eligible: true, can_accept_with_warnings: true, quality_status: 'REVIEW_FAILED', score_trace: [54, 58], review_attempt: 2, max_review_attempts: 3 }];
  repair.reserve_count = 2;
  const draft = createProject('demo-brief', { preferred_title: '沿海慢信', genre: '现实题材', idea: '一位离职编辑回到海边故乡，替街坊整理未寄出的信，在日常关系里重新寻找生活方向。', experiences: ['人物成长'], elements: ['海边小镇', '旧信件'] });
  draft.project.brief.protagonist = '许知夏';
  draft.project.brief.protagonist_name = '许知夏';
  draft.project.brief.protagonist_profile = '回乡的年轻编辑，习惯替别人整理故事，却不擅长表达自己的需要。';
  draft.project.brief.main_conflict = '在重建旧邮局的过程中，面对家庭与职业选择';
  draft.project.brief.world_rules = ['当代海边小镇，遵循现实生活逻辑'];
  draft.project.brief.opening_three_chapters = ['回乡与旧邮局', '第一封未寄出的信', '街坊的委托'];
  draft.project.brief.opening_chapter_anchors = draft.project.brief.opening_three_chapters.map((title, index) => ({ number: (index + 1) as 1 | 2 | 3, title, core_event: title }));

  const db: DemoDatabase = { schema: 2, sequence: 100, projects: { demo: main, 'demo-revision': repair, 'demo-brief': draft }, drafts: {}, versions: {}, briefVersions: {}, sessions: {}, messages: {}, changes: {}, snapshots: {},
    preferences: { daily_chapters: 2, reserve_target: 5, budget_limit: 100, debug_mode: false }, llm: defaultLlm(), records: [] };
  for (const detail of Object.values(db.projects)) {
    db.briefVersions[detail.project.id] = [{ version: 1, source: 'initial', brief: structuredClone(detail.project.brief), created_at: detail.project.created_at }];
    for (const chapter of detail.chapters) {
      const key = chapterKey(detail.project.id, chapter.number);
      db.versions[key] = [{ version: chapter.version, kind: 'OFFICIAL', title: chapter.title, content: chapter.content, source: 'demo', is_official: true, created_at: chapter.created_at }];
      if (chapter.version > 1) db.versions[key]!.unshift({ version: 1, kind: 'OFFICIAL', title: chapter.title, content: chapter.content?.split('\n\n').slice(0, -1).join('\n\n'), source: 'demo', is_official: false, created_at: `${dateAgo(3)}T09:00:00+08:00` });
    }
  }
  const session: DemoSession = { id: 'demo-session-1', project_id: 'demo', chapter_id: main.chapters[0]!.id, chapterNumber: 1, title: '开篇线索与节奏', created_at: isoNow(), updated_at: isoNow() };
  db.sessions[session.id] = session;
  db.messages[session.id] = [
    { id: 'demo-message-1', session_id: session.id, sequence: 1, role: 'user', mode: 'advisor', content: '第一章的悬念是否足够清晰？', created_at: isoNow() },
    { id: 'demo-message-2', session_id: session.id, sequence: 2, role: 'assistant', mode: 'advisor', content: '【示例分析】来信的日期矛盾与地下室异响构成两条可追踪线索。建议先保留父亲的失踪之谜，暂不解释观测站，让主角用下一章的行动验证猜测。', created_at: isoNow() },
  ];
  db.changes[session.id] = [];
  db.records = Array.from({ length: 48 }, (_, i) => ({
    id: `demo-record-${i}`, created_at: `${dateAgo(Math.floor(i / 2))}T${i % 2 ? '14' : '09'}:30:00+08:00`,
    project_id: i % 4 === 0 ? 'demo-revision' : 'demo', project_title: i % 4 === 0 ? repair.project.title : main.project.title,
    chapter_id: `demo-chapter-${i % 3 + 1}`, category: ['writing', 'planning', 'review'][i % 3]!, operation: ['write', 'plan', 'review'][i % 3]!,
    model_id: i % 5 ? 'deepseek-chat' : 'qwen-plus', model_provider: i % 5 ? 'DeepSeek' : '通义千问',
    tokens_input: 1200 + i * 30, tokens_output: i % 11 === 0 ? 0 : 600 + i * 15, tokens_total: 1200 + i * 30 + (i % 11 === 0 ? 0 : 600 + i * 15),
    token_cache: i % 3 ? 0 : 320, latency_ms: 2200 + i * 130, first_token_ms: 300 + i * 12,
    status: i % 11 === 0 ? 'error' : 'success', error_type: i % 11 === 0 ? 'DEMO_TIMEOUT' : null,
    error_message: i % 11 === 0 ? '示例超时记录，用于演示筛选；未调用真实模型。' : null, error_status_code: i % 11 === 0 ? 504 : null, retry_count: i % 11 === 0 ? 1 : 0,
  }));
  return db;
}
