import { describe, expect, it } from 'vitest';
import { demoRequest } from './demo';
import { countChapterChars } from '@/features/reader/utils/chapter-count';

describe('作品集演示数据', () => {
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
    expect(records.options.model_options[0].value).toBe('deepseek-chat');
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
});
