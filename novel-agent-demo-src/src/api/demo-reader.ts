import type { ProjectDetail, ChapterRecord } from './contracts';
import type { AssistantChangeSet } from '@/features/reader/api/reader.api';
import { chapterKey, isoNow, type DemoDatabase, type DemoSession } from './demo-seed';
import { chapterFor, detailFor, fail, nextId, saveDraft, checkRevision, recordVersion, markReady } from './demo-state';

export function demoChapter(db: DemoDatabase, detail: ProjectDetail, number: number, action: string, method: string, body: Record<string, any>) {
  const id = detail.project.id, chapter = chapterFor(detail, number), key = chapterKey(id, number);
  if (action === 'workspace' && method === 'GET') {
    const failed = chapter.status === 'FAILED', downstream = detail.chapters.filter(c => c.number > number);
    return { project: { id, title: detail.project.title, status: detail.project.status }, chapter, draft: db.drafts[key] || null, editable: true, read_only_reason: null,
      capabilities: { edit_draft: true, use_assistant: true, commit_revision: !failed, submit_for_review: failed, replan: failed, accept_with_warnings: failed },
      downstream: { count: downstream.length, first_number: downstream[0]?.number ?? null, last_number: downstream.at(-1)?.number ?? null },
      versions: (db.versions[key] || []).slice().reverse(), sessions: Object.values(db.sessions).filter(s => s.project_id === id && s.chapterNumber === number).reverse() };
  }
  if (action === 'edit-draft' && method === 'PUT') { checkRevision(db, detail, chapter, body); return saveDraft(db, detail, chapter, String(body.title ?? chapter.title), String(body.content ?? ''), 'manual'); }
  if (action === 'edit-draft' && method === 'DELETE') { delete db.drafts[key]; return null; }
  if (action === 'revisions' && method === 'POST') {
    checkRevision(db, detail, chapter, body); const draft = db.drafts[key] || fail('没有待应用的草稿。');
    chapter.title = draft.title; chapter.content = draft.content; chapter.version++; delete db.drafts[key]; recordVersion(db, detail, chapter);
    const downstream = detail.chapters.filter(c => c.number > number); downstream.forEach(c => { c.status = 'PLANNED'; });
    markReady(detail, chapter); detail.timeline = detail.timeline.filter(t => t.chapter_number <= number);
    return { chapter, reset_chapters: downstream.map(c => c.number), warnings: downstream.length ? ['后续示例章节已重置，可回工作台重新生成。'] : [], semantic_index_status: 'demo' };
  }
  if (['review-submit', 'accept-with-warnings'].includes(action) && method === 'POST') {
    checkRevision(db, detail, chapter, body);
    if (action === 'accept-with-warnings' && !body.confirm) fail('请确认接受当前版本。');
    const draft = db.drafts[key];
    if (draft) { chapter.title = draft.title; chapter.content = draft.content; chapter.version++; delete db.drafts[key]; recordVersion(db, detail, chapter); }
    markReady(detail, chapter); return { passed: true, accepted_with_warnings: action === 'accept-with-warnings', message: '示例审核完成。', chapter };
  }
  const restore = action.match(/^versions\/(\d+)\/restore$/);
  if (restore && method === 'POST') { const version = db.versions[key]?.find(v => v.version === Number(restore[1])) || fail('正文版本不存在。', 404); return saveDraft(db, detail, chapter, version.title || chapter.title, version.content || '', 'restore'); }
  if (action === 'assistant/sessions' && method === 'POST') {
    const session: DemoSession = { id: nextId(db, 'session'), project_id: id, chapter_id: chapter.id, chapterNumber: number, title: `第 ${number} 章讨论`, created_at: isoNow(), updated_at: isoNow() };
    db.sessions[session.id] = session; db.messages[session.id] = []; db.changes[session.id] = []; return session;
  }
  return fail(`没有对应的章节演示操作：${method} ${action}`, 404);
}

function propose(db: DemoDatabase, session: DemoSession, chapter: ChapterRecord, body: Record<string, any>, messageId: string): AssistantChangeSet {
  const draft = db.drafts[chapterKey(session.project_id, session.chapterNumber)], before = draft?.content ?? chapter.content ?? '', title = draft?.title || chapter.title;
  const selected = body.selection?.text as string | undefined;
  const replacement = body.quick_action === 'shorten' && selected ? selected.slice(0, Math.max(1, Math.ceil(selected.length * 0.7))) : (selected ? `${selected}\n` : '') + '窗外的雨突然停了。她抬起头，看见玻璃上映出一个陌生人的影子。';
  const after = selected && before.includes(selected) ? before.replace(selected, replacement) : before + '\n\n' + replacement;
  return { id: nextId(db, 'change'), session_id: session.id, message_id: messageId, chapter_id: chapter.id, operation: 'replace', base_version: chapter.version, base_draft_hash: draft?.content_hash || '', before_title: title, before_content: before, after_title: title, after_content: after,
    diff_json: { sections: [{ lines: [{ type: 'removed', text: selected || '原段落保持不变' }, { type: 'added', text: replacement }] }] }, explanation: '示例建议：增加画面细节并保留人物的信息边界。此文本为预设演示。', status: 'proposed', created_at: isoNow() };
}
export function demoAssistant(db: DemoDatabase, url: string, method: string, body: Record<string, any>) {
  const chat = url.match(/^\/api\/assistant\/sessions\/([^/]+)\/(messages|changes|rollback)$/);
  if (chat) {
    const session = db.sessions[decodeURIComponent(chat[1]!)] || fail('示例会话不存在。', 404), detail = detailFor(db, session.project_id), chapter = chapterFor(detail, session.chapterNumber);
    if (method === 'GET') return { items: chat[2] === 'messages' ? db.messages[session.id] || [] : db.changes[session.id] || [] };
    if (chat[2] === 'rollback') {
      const messages = db.messages[session.id] || [], target = messages.find(m => m.id === body.to_message_id) || fail('回退位置不存在。', 404);
      const changes = db.changes[session.id] || [];
      const targetChange = changes.find(c => (messages.find(m => m.id === c.message_id)?.sequence || 0) >= target.sequence);
      changes.filter(c => (messages.find(m => m.id === c.message_id)?.sequence || 0) >= target.sequence).forEach(c => { c.status = 'reverted'; c.reverted_at = isoNow(); });
      return saveDraft(db, detail, chapter, targetChange?.before_title || chapter.title, targetChange?.before_content || chapter.content || '', 'rollback');
    }
    const user = { id: nextId(db, 'message'), session_id: session.id, sequence: db.sequence, role: 'user' as const, mode: body.mode || 'advisor', content: String(body.content || ''), created_at: isoNow() };
    const assistant = { id: nextId(db, 'message'), session_id: session.id, sequence: db.sequence, role: 'assistant' as const, mode: body.mode || 'advisor', content: '【演示回复 · 本地预设】可以通过环境细节和人物动作增强悬念，让读者跟随主角逐步发现线索。修改建议需批准后才会进入草稿，不会直接覆盖正式正文。', created_at: isoNow() };
    db.messages[session.id] = [...(db.messages[session.id] || []), user, assistant]; session.updated_at = isoNow();
    const change = body.mode && body.mode !== 'advisor' || body.quick_action ? propose(db, session, chapter, body, assistant.id) : null;
    if (change) db.changes[session.id] = [...(db.changes[session.id] || []), change];
    return { user_message: user, assistant_message: assistant, change_set: change };
  }
  const decision = url.match(/^\/api\/assistant\/changes\/([^/]+)\/(approve|reject)$/);
  if (decision && method === 'POST') {
    const change = Object.values(db.changes).flat().find(c => c.id === decodeURIComponent(decision[1]!)) || fail('示例建议不存在。', 404);
    if (change.status !== 'proposed') fail('该建议已经处理。', 409);
    if (decision[2] === 'reject') { change.status = 'rejected'; change.decided_at = isoNow(); return change; }
    const session = db.sessions[change.session_id]!, detail = detailFor(db, session.project_id), chapter = chapterFor(detail, session.chapterNumber);
    checkRevision(db, detail, chapter, { base_version: change.base_version, expected_draft_hash: change.base_draft_hash || null });
    change.status = 'approved'; change.decided_at = isoNow();
    return { change_set: change, draft: saveDraft(db, detail, chapter, change.after_title, change.after_content, 'assistant', [change.id]) };
  }
  return fail(`没有对应的助手演示操作：${method} ${url}`, 404);
}
