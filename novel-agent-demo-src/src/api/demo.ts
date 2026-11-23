import { ApiError } from './api-error';
import tags from './demo-tags.json';
import sampleChapters from './demo-chapters.json';
import type { ProjectDetail, ChapterRecord, CreativeBrief } from './contracts';
import { countChapterChars } from '@/features/reader/utils/chapter-count';
import { chapterKey, createDemoDatabase, createProject, defaultLlm, isoNow } from './demo-seed';
import { loadDatabase, persist, nextId, fail, detailFor, summaryFor, touch, recordVersion, markReady, clearProjectDependents } from './demo-state';
import { demoAnalytics } from './demo-analytics';
import { demoChapter, demoAssistant } from './demo-reader';

// This module replaces server requests only; the Vue pages and styles are the original product.
let db = loadDatabase();
export function resetDemo() { db = createDemoDatabase(); persist(db); }
export function demoProjectIds() { return Object.keys(db.projects); }
function recordBrief(detail: ProjectDetail, source: string, feedback?: string) {
  const versions = db.briefVersions[detail.project.id] ||= [];
  versions.push({ version: (versions.at(-1)?.version || 0) + 1, source, feedback, brief: structuredClone(detail.project.brief), created_at: isoNow() });
  detail.project.updated_at = isoNow();
}
function generateChapter(detail: ProjectDetail, number: number) {
  if (!detail.project.confirmed) fail('请先确认创作方案。');
  const old = detail.chapters.find(c => c.number === number);
  let content: string, title: string;
  if (['demo', 'demo-revision'].includes(detail.project.id) && number <= 3) {
    [title, content] = sampleChapters[number - 1] as [string, string];
  } else {
    title = number <= 3 ? (detail.project.brief.opening_three_chapters[number - 1] || '新的线索') : '东堤的回声';
    content = `【演示章节 · 本地预设文本，非模型实时生成】\n\n${detail.project.title} · 第 ${number} 章\n\n${detail.project.request.idea}\n\n傍晚，海风将窗边的信纸轻轻翻起。${detail.project.brief.protagonist_name || '主角'}重新读了一遍纸上的日期，没有急着解释它，而是先把能够确认的事情列在笔记本上。\n\n门外传来脚步声。来人把一只旧木盒放在桌上，说这是从仓库里找到的，锁扣已经生锈。盒底藏着半张褪色的路线图，边角有一道新留下的折痕。\n\n“先核对记录，再决定去哪里。”主角把木盒推回灯下。两人约好第二天去问保管档案的老人，今晚只整理线索，不把猜测当成已经发生的事实。\n\n窗外的灯一盏接一盏亮起。笔记本的最后一行写着：还有一个人，知道那封信为什么没有寄出。`;
  }
  const chapter: ChapterRecord = { id: old?.id || nextId(db, 'chapter'), number, title, content, summary: '示例章节：整理旧信与路线图的证据，为下一步调查建立线索。', status: 'READY', version: (old?.version || 0) + 1, created_at: old?.created_at || isoNow() };
  if (old) detail.chapters.splice(detail.chapters.indexOf(old), 1, chapter); else detail.chapters.push(chapter);
  delete db.drafts[chapterKey(detail.project.id, number)];
  recordVersion(db, detail, chapter); markReady(detail, chapter);
  const tokens_output = countChapterChars(chapter.content || '');
  db.records.unshift({ id: nextId(db, 'record'), created_at: isoNow(), project_id: detail.project.id, project_title: detail.project.title,
    chapter_id: chapter.id, category: 'writing', operation: 'write', model_id: 'deepseek-chat', model_provider: 'DeepSeek',
    tokens_input: 1200, tokens_output, tokens_total: 1200 + tokens_output, token_cache: 0, latency_ms: 0, first_token_ms: 0,
    status: 'success', error_type: null, error_message: null, error_status_code: null, retry_count: 0 });
  detail.latest_events = [{ node: 'plan', message: '示例：按创作方案完成章节规划', progress: 25 }, { node: 'write', message: '示例：已载入本地章节文本', progress: 55 }, { node: 'review', message: '示例：审核通过', progress: 85 }, { node: 'commit', message: '示例：章节、版本与时间线已保存', progress: 100 }];
  detail.timeline = detail.timeline.filter(t => t.chapter_number !== number);
  detail.timeline.push({ chapter_number: number, event: chapter.summary });
  return chapter;
}
function handle(path: string, method: string, body: Record<string, any>) {
  const [url = '', query = ''] = path.split('?'), params = new URLSearchParams(query);
  if (url === '/api/tags' && method === 'GET') return tags;
  if (url === '/api/health') return { mode: 'offline', apis: {}, demo: true };
  if (url.startsWith('/api/dashboard/')) return demoAnalytics(db, url, params);
  if (url.startsWith('/api/assistant/')) return demoAssistant(db, url, method, body);
  if (url === '/api/settings') {
    if (method === 'PUT') for (const key of ['daily_chapters', 'reserve_target', 'budget_limit', 'debug_mode']) if (key in body) db.preferences[key] = body[key];
    return { preferences: db.preferences, runtime: { llm: { enabled: db.llm.enabled, configured: db.llm.has_api_key, provider: '本地演示（不调用模型）', provider_label: db.llm.provider_label, model: db.llm.model, card_status: db.llm.card_status, source: 'offline' }, search: { configured: false }, embedding: { configured: false }, publisher: { configured: true, enabled: false }, story_skills: { enabled: true }, oh_story: { enabled: true } } };
  }
  if (url === '/api/settings/llm/test') return { ok: true, code: 'DEMO_SIMULATION', message: '演示连接成功：仅在本地模拟，没有发送 API 请求或密钥。', latency_ms: 0, tested_at: isoNow() };
  if (url === '/api/settings/llm') {
    if (method === 'PUT') {
      // Allowlist excludes API keys: original fields work, but credentials are never stored or sent.
      for (const key of ['provider', 'base_url', 'model', 'enabled', 'timeout_seconds', 'max_retries'] as const) if (key in body) (db.llm as unknown as Record<string, unknown>)[key] = body[key];
      db.llm.provider_label = `${db.llm.presets.find(p => p.provider === db.llm.provider)?.provider_label || '兼容服务'}（演示）`;
      db.llm.source = 'offline'; db.llm.version++; db.llm.card_status = db.llm.enabled ? 'enabled' : 'disabled';
    }
    if (method === 'DELETE') db.llm = { ...defaultLlm(), has_api_key: false, api_key_mask: null, card_status: 'unconfigured', version: db.llm.version + 1 };
    return db.llm;
  }
  if (url === '/api/novels') {
    if (method === 'GET') return { items: Object.values(db.projects).map(summaryFor) };
    if (method === 'POST') {
      if (!String(body.idea || '').trim()) fail('请填写核心想法。');
      const id = nextId(db, 'demo-new'), detail = createProject(id, body);
      if (detail.project.title === '未命名的故事') { detail.project.title = '潮汐之后'; detail.project.brief.selected_title = detail.project.title; }
      db.projects[id] = detail; recordBrief(detail, 'initial'); return detail.project;
    }
  }
  const projectMatch = url.match(/^\/api\/novels\/([^/]+)(?:\/(.*))?$/);
  if (projectMatch) {
    const id = decodeURIComponent(projectMatch[1]!), suffix = projectMatch[2] || '', detail = detailFor(db, id);
    if (!suffix && method === 'GET') return detail;
    if (!suffix && method === 'DELETE') { clearProjectDependents(db, id); delete db.projects[id]; return null; }
    if (suffix === 'metadata' && method === 'PUT') {
      const title = String(body.title || '').trim(); if (!title) fail('书名不能为空。'); detail.project.title = title;
      db.records.filter(r => r.project_id === id).forEach(r => { r.project_title = title; });
      touch(detail); return summaryFor(detail);
    }
    if (['confirm', 'pause', 'resume', 'recover'].includes(suffix) && method === 'POST') {
      if (suffix === 'confirm') { detail.project.confirmed = true; detail.project.brief.selected_title = detail.project.title; }
      detail.project.status = suffix === 'pause' ? 'PAUSED' : 'ACTIVE'; touch(detail); return detail.project;
    }
    if (suffix === 'brief-versions') return { items: (db.briefVersions[id] || []).slice().reverse() };
    if (suffix === 'brief' && method === 'PUT') { detail.project.brief = structuredClone(body) as CreativeBrief; detail.project.title = detail.project.brief.selected_title; recordBrief(detail, 'manual_edit'); return detail.project; }
    if (suffix === 'brief-regenerate' && method === 'POST') {
      const feedback = String(body.feedback || '').trim();
      if (feedback) detail.project.brief.synopsis += `\n\n示例调整方向：${feedback}`;
      else detail.project.brief.selling_points = [...detail.project.brief.selling_points.filter(p => p !== '以人物选择推动下一条线索'), '以人物选择推动下一条线索'];
      recordBrief(detail, feedback ? 'feedback_regenerate' : 'regenerate', feedback); return detail.project;
    }
    if (suffix === 'brief-restore' && method === 'POST') {
      const version = db.briefVersions[id]?.find(v => v.version === body.version) || fail('方案版本不存在。', 404);
      detail.project.brief = structuredClone(version.brief); detail.project.title = version.brief.selected_title; recordBrief(detail, 'restore'); return detail.project;
    }
    if (suffix === 'runs' && method === 'POST') {
      if (detail.project.status !== 'ACTIVE') fail('请先恢复创作。');
      const number = detail.chapters.find(c => c.status !== 'READY')?.number || Math.max(0, ...detail.chapters.map(c => c.number)) + 1;
      const chapter = generateChapter(detail, number);
      return { items: [{ chapter, events: detail.latest_events }] };
    }
    if (suffix === 'characters/rebuild' && method === 'POST') {
      if (!detail.characters.length) detail.characters = [{ id: nextId(db, 'character'), name: detail.project.brief.protagonist_name || '主角', role: 'protagonist', immutable_facts: [detail.project.brief.protagonist_profile], current_state: { last_seen_chapter: detail.project.current_chapter, current_goal: detail.project.brief.main_conflict } }];
      detail.characters.forEach(c => { c.version = (c.version || 0) + 1; });
      return { processed_chapters: detail.chapters.filter(c => c.status === 'READY').length, character_count: detail.characters.length, removed_nonimportant: 0, failures: [] };
    }
    if (suffix === 'opening-repair-preview') {
      const eligible = Boolean(detail.chapter_failures?.some(f => f.opening_repair_eligible));
      return { eligible, reasons: eligible ? [] : ['当前示例的开篇没有需要修复的数据。'], project_updated_at: detail.project.updated_at,
        detected_problems: ['主角在开篇提前知道后续观测站线索（示例）'], opening_anchor: detail.project.brief.opening_chapter_anchors?.[0] || {},
        character_changes: [{ name: detail.project.brief.protagonist_name || '主角', from_relationships: { 观测站: '已知' }, to_relationships: { 观测站: '尚未获知' }, moved_to_future: true }],
        chapter_changes: detail.chapters.map(c => ({ chapter_number: c.number, from_status: c.status, to_status: c.number === 1 ? 'FAILED' : 'PLANNED', from_title: c.title, to_title: c.title })), preserved_artifacts: ['当前正文与版本', '人物记忆', '创作方案', '可回退快照'] };
    }
    if (suffix === 'opening-repair-snapshots/latest') { const s = db.snapshots[id]; return { snapshot: s ? { id: s.id, status: s.status, created_at: s.created_at, rollback_allowed: s.rollback_allowed, blocked_reason: s.rollback_allowed ? null : '示例已回退' } : null }; }
    if (suffix === 'opening-repair' && method === 'POST') {
      if (!body.confirm || body.expected_project_updated_at !== detail.project.updated_at) fail('请确认最新的修复预览。', 409);
      const snapshot = { id: nextId(db, 'snapshot'), status: 'applied', created_at: isoNow(), rollback_allowed: true, detail: structuredClone(detail) };
      db.snapshots[id] = snapshot;
      detail.chapters.forEach(c => { c.status = c.number === 1 ? 'FAILED' : 'PLANNED'; });
      detail.project.status = 'HUMAN_REQUIRED'; touch(detail); return { snapshot_id: snapshot.id, next_action: 'regenerate_first_chapter' };
    }
    if (/^opening-repair\/[^/]+\/rollback$/.test(suffix) && method === 'POST') {
      const snapshot = db.snapshots[id];
      if (!snapshot || !snapshot.rollback_allowed || snapshot.id !== suffix.split('/')[1]) fail('快照不存在或已经回退。', 404);
      db.projects[id] = structuredClone(snapshot.detail); snapshot.rollback_allowed = false; snapshot.status = 'rolled_back'; return { restored: true };
    }
    const chapterMatch = suffix.match(/^chapters\/(\d+)\/(.+)$/);
    if (chapterMatch) {
      if (chapterMatch[2] === 'rework' && method === 'POST') return { chapter: generateChapter(detail, Number(chapterMatch[1])) };
      return demoChapter(db, detail, Number(chapterMatch[1]), chapterMatch[2]!, method, body);
    }
  }
  return fail(`没有对应的演示操作：${method} ${url}`, 404);
}
export async function demoRequest(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<any> {
  if (options.signal?.aborted) throw new ApiError('请求已取消', { kind: 'aborted' });
  // Match JSON request semantics, including Vue proxy values emitted by the original forms.
  const body = options.body === undefined ? {} : JSON.parse(JSON.stringify(options.body));
  const method = (options.method || 'GET').toUpperCase(), result = handle(path, method, body);
  if (method !== 'GET') persist(db);
  return structuredClone(result);
}
