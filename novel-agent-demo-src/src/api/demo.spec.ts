import { beforeEach, describe, expect, it } from 'vitest';
import { demoRequest, resetDemo, demoProjectIds } from './demo';
import { loadDatabase } from './demo-state';
import { DEMO_STORAGE_KEY } from './demo-seed';
import { countChapterChars } from '@/features/reader/utils/chapter-count';

describe('作品集演示数据', () => {
  beforeEach(() => resetDemo());
  it('示例作品三章均有约两千字的完整正文', async () => {
    const detail = await demoRequest('/api/novels/demo');
    expect(detail.chapters).toHaveLength(3);
    for (const chapter of detail.chapters) {
      expect(countChapterChars(chapter.content)).toBeGreaterThanOrEqual(1800);
      expect(countChapterChars(chapter.content)).toBeLessThanOrEqual(2200);
    }
  });
  it('为仪表盘的三个页面提供可展示的数据和筛选', async () => {
    const writing = await demoRequest('/api/dashboard/writing?start_at=2000-01-01&end_at=2100-01-01');
    const stats = await demoRequest('/api/dashboard/llm-api/stats');
    const records = await demoRequest('/api/dashboard/llm-api/records?model_id=deepseek-chat&page=1&page_size=5');
    expect(writing.time_series.length).toBeGreaterThan(0);
    expect(stats.summary.calls_total).toBeGreaterThan(0);
    expect(records.options.model_options).toContainEqual({ value: 'deepseek-chat', label: 'deepseek-chat' });
    expect(records.records.items).toHaveLength(5);
  });
  it('支持新建、确认方案并生成示例章节', async () => {
    const created = await demoRequest('/api/novels', { method: 'POST', body: { idea: '一个故事', audience_channel: '男频', genre: '悬疑' } });
    await demoRequest(`/api/novels/${created.id}/confirm`, { method: 'POST' });
    await demoRequest(`/api/novels/${created.id}/runs`, { method: 'POST' });
    const detail = await demoRequest(`/api/novels/${created.id}`);
    expect(detail.project.confirmed).toBe(true);
    expect(detail.chapters).toHaveLength(1);
  });
  it('展示设置并为阅读助手提供可批准的模拟建议', async () => {
    expect((await demoRequest('/api/settings')).preferences.daily_chapters).toBeGreaterThan(0);
    const session = await demoRequest('/api/novels/demo/chapters/1/assistant/sessions', { method: 'POST' });
    const reply = await demoRequest(`/api/assistant/sessions/${session.id}/messages`, { method: 'POST', body: { mode: 'editor', content: '润色' } });
    const result = await demoRequest(`/api/assistant/changes/${reply.change_set.id}/approve`, { method: 'POST' });
    expect(result.draft.content).toContain('陌生人的影子');
    expect(result.change_set.status).toBe('approved');
  });

  it('提供正式作品、审核练习和待确认方案，所有项目各有独立上下文', async () => {
    const { items } = await demoRequest('/api/novels');
    expect(demoProjectIds()[0]).toBe('demo');
    expect(items.map((p: any) => p.status)).toEqual(['ACTIVE', 'HUMAN_REQUIRED', 'DRAFT']);
    const detail = await demoRequest('/api/novels/demo');
    expect(detail.characters[0].current_state.last_seen_chapter).toBeGreaterThan(0);
    expect(detail.research_sources.length).toBeGreaterThan(0);
    expect(detail.latest_events.at(-1).progress).toBe(100);
  });

  it('创建多本作品使用不同 ID，重命名与删除不影响其他作品', async () => {
    const one = await demoRequest('/api/novels', { method: 'POST', body: { idea: '故事一', preferred_title: '第一本' } });
    const two = await demoRequest('/api/novels', { method: 'POST', body: { idea: '故事二', preferred_title: '第二本' } });
    expect(one.id).not.toBe(two.id);
    await demoRequest(`/api/novels/${one.id}/metadata`, { method: 'PUT', body: { title: '已改名' } });
    expect((await demoRequest(`/api/novels/${one.id}`)).project.title).toBe('已改名');
    await demoRequest(`/api/novels/${one.id}`, { method: 'DELETE' });
    await expect(demoRequest(`/api/novels/${one.id}`)).rejects.toMatchObject({ status: 404 });
    expect((await demoRequest(`/api/novels/${two.id}`)).project.title).toBe('第二本');
  });

  it('不同作品的同一章草稿隔离，正式正文仅在应用修订后改变', async () => {
    const one = await demoRequest('/api/novels/demo/chapters/1/workspace');
    await demoRequest('/api/novels/demo/chapters/1/edit-draft', { method: 'PUT', body: { title: '草稿标题', content: '草稿甲', base_version: one.chapter.version, expected_draft_hash: null } });
    await demoRequest('/api/novels/demo-revision/chapters/1/edit-draft', { method: 'PUT', body: { title: '另一本', content: '草稿乙' } });
    const work = await demoRequest('/api/novels/demo/chapters/1/workspace');
    expect(work.draft.content).toBe('草稿甲');
    expect(work.chapter.content).toBe(one.chapter.content);
    const result = await demoRequest('/api/novels/demo/chapters/1/revisions', { method: 'POST', body: { base_version: work.chapter.version, expected_draft_hash: work.draft.content_hash } });
    expect(result.chapter.content).toBe('草稿甲');
    expect(result.chapter.version).toBe(one.chapter.version + 1);
    expect((await demoRequest('/api/novels/demo-revision/chapters/1/workspace')).draft.content).toBe('草稿乙');
    expect(result.reset_chapters).toEqual([2, 3]);
  });

  it('历史正文恢复为草稿且拒绝过期的保存请求', async () => {
    const work = await demoRequest('/api/novels/demo/chapters/1/workspace');
    const restored = await demoRequest('/api/novels/demo/chapters/1/versions/1/restore', { method: 'POST' });
    expect(restored.source).toBe('restore');
    expect((await demoRequest('/api/novels/demo/chapters/1/workspace')).chapter.content).toBe(work.chapter.content);
    await expect(demoRequest('/api/novels/demo/chapters/1/edit-draft', { method: 'PUT', body: { title: '冲突', content: '不能覆盖', expected_draft_hash: 'stale' } })).rejects.toMatchObject({ status: 409 });
    await demoRequest('/api/novels/demo/chapters/1/edit-draft', { method: 'DELETE' });
    expect((await demoRequest('/api/novels/demo/chapters/1/workspace')).draft).toBeNull();
  });

  it('顾问回复不改正文，拒绝建议不创建草稿，回退保留原正文', async () => {
    const s = await demoRequest('/api/novels/demo/chapters/1/assistant/sessions', { method: 'POST' });
    const advice = await demoRequest(`/api/assistant/sessions/${s.id}/messages`, { method: 'POST', body: { mode: 'advisor', content: '分析线索' } });
    expect(advice.change_set).toBeNull();
    const reply = await demoRequest(`/api/assistant/sessions/${s.id}/messages`, { method: 'POST', body: { mode: 'editor', content: '润色' } });
    await demoRequest(`/api/assistant/changes/${reply.change_set.id}/reject`, { method: 'POST' });
    expect((await demoRequest('/api/novels/demo/chapters/1/workspace')).draft).toBeNull();
    const next = await demoRequest(`/api/assistant/sessions/${s.id}/messages`, { method: 'POST', body: { mode: 'editor', content: '调整节奏' } });
    await demoRequest(`/api/assistant/changes/${next.change_set.id}/approve`, { method: 'POST' });
    await demoRequest(`/api/assistant/sessions/${s.id}/rollback`, { method: 'POST', body: { to_message_id: next.user_message.id } });
    const work = await demoRequest('/api/novels/demo/chapters/1/workspace');
    expect(work.draft.content).toBe(work.chapter.content);
    expect(work.sessions.some((item: any) => item.id === s.id)).toBe(true);
  });

  it('方案修改、重新生成和历史恢复均产生可比较的版本', async () => {
    const original = await demoRequest('/api/novels/demo-brief');
    await demoRequest('/api/novels/demo-brief/brief', { method: 'PUT', body: { ...original.project.brief, selected_title: '海风中的信' } });
    await demoRequest('/api/novels/demo-brief/brief-regenerate', { method: 'POST', body: { feedback: '增加小镇生活细节' } });
    expect((await demoRequest('/api/novels/demo-brief/brief-versions')).items).toHaveLength(3);
    await demoRequest('/api/novels/demo-brief/brief-restore', { method: 'POST', body: { version: 1 } });
    expect((await demoRequest('/api/novels/demo-brief')).project.brief.selected_title).toBe('沿海慢信');
  });

  it('失败章节支持审阅后送审及接受警告，修复快照可以回退', async () => {
    const work = await demoRequest('/api/novels/demo-revision/chapters/1/workspace');
    expect(work.capabilities.submit_for_review).toBe(true);
    const preview = await demoRequest('/api/novels/demo-revision/opening-repair-preview');
    const applied = await demoRequest('/api/novels/demo-revision/opening-repair', { method: 'POST', body: { confirm: true, expected_project_updated_at: preview.project_updated_at } });
    expect((await demoRequest('/api/novels/demo-revision/opening-repair-snapshots/latest')).snapshot.rollback_allowed).toBe(true);
    await demoRequest(`/api/novels/demo-revision/opening-repair/${applied.snapshot_id}/rollback`, { method: 'POST' });
    expect((await demoRequest('/api/novels/demo-revision')).chapters[1].status).toBe('READY');
    await demoRequest('/api/novels/demo-revision/chapters/1/review-submit', { method: 'POST', body: { base_version: 1, expected_draft_hash: '' } });
    expect((await demoRequest('/api/novels/demo-revision')).chapter_failures).toHaveLength(0);
  });

  it('调用统计与明细一致，支持空结果和跨项目筛选', async () => {
    const stats = await demoRequest('/api/dashboard/llm-api/stats');
    const { records } = await demoRequest('/api/dashboard/llm-api/records?page_size=100');
    expect(stats.summary.calls_total).toBe(records.total);
    expect(stats.summary.tokens_total).toBe(records.items.reduce((n: number, r: any) => n + r.tokens_total, 0));
    const filtered = await demoRequest('/api/dashboard/llm-api/records?project_id=demo-revision&status=error');
    expect(filtered.records.items.every((r: any) => r.project_id === 'demo-revision' && r.status === 'error')).toBe(true);
    expect((await demoRequest('/api/dashboard/llm-api/records?search=not-a-record')).records.items).toHaveLength(0);
  });

  it('偏好与创作数据可在刷新后恢复，模型密钥不保存也不联网', async () => {
    await demoRequest('/api/settings', { method: 'PUT', body: { daily_chapters: 4 } });
    await demoRequest('/api/settings/llm', { method: 'PUT', body: { model: 'demo-model', api_key: 'DEMO-NOT-A-REAL-KEY', enabled: true } });
    expect(loadDatabase().preferences.daily_chapters).toBe(4);
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).not.toContain('DEMO-NOT-A-REAL-KEY');
    expect((await demoRequest('/api/settings/llm/test', { method: 'POST' })).code).toBe('DEMO_SIMULATION');
    await demoRequest('/api/settings/llm', { method: 'DELETE' });
    expect((await demoRequest('/api/settings/llm')).has_api_key).toBe(false);
  });

  it('取消的请求不写入任何内容，调用方也不能直接修改数据库', async () => {
    const controller = new AbortController(); controller.abort();
    await expect(demoRequest('/api/novels', { method: 'POST', body: { idea: '不应创建' }, signal: controller.signal })).rejects.toMatchObject({ kind: 'aborted' });
    const detail = await demoRequest('/api/novels/demo'); detail.project.title = '不可旁路修改';
    expect((await demoRequest('/api/novels/demo')).project.title).toBe('雾岛来信');
    expect((await demoRequest('/api/novels')).items).toHaveLength(3);
  });
});
