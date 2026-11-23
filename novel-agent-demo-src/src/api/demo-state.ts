import { ApiError } from './api-error';
import { countChapterChars } from '@/features/reader/utils/chapter-count';
import type { ProjectDetail, ChapterRecord, ProjectSummary } from './contracts';
import { chapterKey, createDemoDatabase, DEMO_STORAGE_KEY, isoNow, type DemoDatabase } from './demo-seed';

export function loadDatabase(): DemoDatabase {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null');
    if (value?.schema === 2 && value.projects && value.drafts && value.sessions && value.versions && Array.isArray(value.records)) return value;
  } catch { /* Malformed or unavailable storage falls back to the seeded demo. */ }
  return createDemoDatabase();
}
export function persist(db: DemoDatabase) {
  try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db)); } catch { /* In-memory editing remains available. */ }
}
export const nextId = (db: DemoDatabase, prefix: string) => `${prefix}-${++db.sequence}`;
export function fail(message: string, status = 422): never {
  throw new ApiError(message, { status, kind: status === 404 ? 'not_found' : status === 409 ? 'conflict' : 'validation' });
}
export const detailFor = (db: DemoDatabase, id: string) => db.projects[id] || fail('示例作品不存在，请从书架重新选择。', 404);
export const chapterFor = (detail: ProjectDetail, number: number) => detail.chapters.find(c => c.number === number) || fail('章节不存在。', 404);
export function summaryFor(detail: ProjectDetail): ProjectSummary {
  return { ...detail.project, audience_channel: detail.project.request.audience_channel, genre: detail.project.request.genre,
    chapter_count: detail.chapters.filter(c => c.status === 'READY').length,
    content_chars: detail.chapters.filter(c => c.status === 'READY').reduce((n, c) => n + countChapterChars(c.content || ''), 0) };
}
export function touch(detail: ProjectDetail) {
  detail.project.updated_at = isoNow();
  detail.reserve_count = detail.chapters.filter(c => c.status === 'READY').length;
  detail.project.current_chapter = Math.max(0, ...detail.chapters.filter(c => c.status === 'READY').map(c => c.number));
}
function hash(content: string) {
  let result = 2166136261;
  for (const char of content) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return `demo-${(result >>> 0).toString(16)}`;
}
export function saveDraft(db: DemoDatabase, detail: ProjectDetail, chapter: ChapterRecord, title: string, content: string, source: string, applied: string[] = []) {
  const key = chapterKey(detail.project.id, chapter.number), old = db.drafts[key];
  const draft = { chapter_id: chapter.id, project_id: detail.project.id, base_version: chapter.version, title, content,
    source, applied_change_ids: applied, content_hash: hash(title + '\n' + content), created_at: old?.created_at || isoNow(), updated_at: isoNow() };
  db.drafts[key] = draft;
  return draft;
}
export function checkRevision(db: DemoDatabase, detail: ProjectDetail, chapter: ChapterRecord, body: Record<string, any>) {
  if (body.base_version !== undefined && body.base_version !== chapter.version) fail('正式版本已变化，请重新加载章节。', 409);
  const current = db.drafts[chapterKey(detail.project.id, chapter.number)];
  if ('expected_draft_hash' in body && (body.expected_draft_hash || null) !== (current?.content_hash || null)) fail('草稿已变化，请重新加载后再操作。', 409);
}
export function recordVersion(db: DemoDatabase, detail: ProjectDetail, chapter: ChapterRecord) {
  const versions = db.versions[chapterKey(detail.project.id, chapter.number)] ||= [];
  versions.forEach(v => { v.is_official = false; });
  versions.push({ version: chapter.version, kind: 'OFFICIAL', title: chapter.title, content: chapter.content, source: 'demo', is_official: true, created_at: isoNow() });
}
export function markReady(detail: ProjectDetail, chapter: ChapterRecord) {
  chapter.status = 'READY';
  detail.chapter_failures = detail.chapter_failures?.filter(f => f.chapter_number !== chapter.number);
  detail.project.status = detail.chapter_failures?.length ? 'HUMAN_REQUIRED' : 'ACTIVE';
  touch(detail);
}
export function clearProjectDependents(db: DemoDatabase, id: string) {
  for (const collection of [db.drafts, db.versions]) {
    for (const key of Object.keys(collection)) if (key.startsWith(id + ':')) delete collection[key];
  }
  for (const session of Object.values(db.sessions)) {
    if (session.project_id !== id) continue;
    delete db.messages[session.id]; delete db.changes[session.id]; delete db.sessions[session.id];
  }
  delete db.briefVersions[id]; delete db.snapshots[id];
}
