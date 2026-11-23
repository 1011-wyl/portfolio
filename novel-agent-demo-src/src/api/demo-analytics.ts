import { dateAgo, type DemoDatabase } from './demo-seed';

function options(db: DemoDatabase) {
  const records = db.records;
  return { project_ids: Object.keys(db.projects), model_providers: [...new Set(records.map(r => r.model_provider))], model_ids: [...new Set(records.map(r => r.model_id))],
    categories: [...new Set(records.map(r => r.category))], operations: [...new Set(records.map(r => r.operation))], statuses: [...new Set(records.map(r => r.status))],
    project_options: Object.values(db.projects).map(d => ({ value: d.project.id, label: d.project.title })), model_options: [...new Set(records.map(r => r.model_id))].map(value => ({ value, label: value })) };
}
export function demoAnalytics(db: DemoDatabase, url: string, params: URLSearchParams) {
  if (url === '/api/dashboard/writing') {
    const id = params.get('project_id'), start = params.get('start_at')?.slice(0, 10) || '', end = params.get('end_at')?.slice(0, 10) || '9999';
    const time_series = Array.from({ length: 70 }, (_, i) => ({ date: dateAgo(69 - i), user_word_delta: i % 4 === 0 ? 280 + i * 3 : 0, agent_word_delta: i % 3 === 0 ? 1200 + i * 7 : 0, import_word_delta: i % 13 === 0 ? 800 : 0 }))
      .map(p => id === 'demo-brief' ? { ...p, user_word_delta: 0, agent_word_delta: 0, import_word_delta: 0 } : id === 'demo-revision' ? { ...p, user_word_delta: Math.round(p.user_word_delta / 3), agent_word_delta: Math.round(p.agent_word_delta / 3), import_word_delta: 0 } : p)
      .filter(p => p.date >= start && p.date <= end && (!id || Boolean(db.projects[id])));
    return { summary: { active_days: time_series.filter(p => p.user_word_delta + p.agent_word_delta > 0).length, creative_chapters: Object.values(db.projects).filter(d => !id || d.project.id === id).reduce((n, d) => n + d.chapters.filter(c => c.status === 'READY').length, 0) }, time_series };
  }
  if (url === '/api/dashboard/llm-api/records') {
    let items = db.records.filter(r => ['project_id', 'model_id', 'model_provider', 'category', 'status'].every(k => !params.get(k) || String(r[k as keyof typeof r]) === params.get(k)))
      .filter(r => !params.get('search') || JSON.stringify(r).toLowerCase().includes(params.get('search')!.toLowerCase()))
      .filter(r => (!params.get('start_at') || r.created_at >= params.get('start_at')!) && (!params.get('end_at') || r.created_at <= params.get('end_at')!));
    const sort = params.get('sort_by') || 'created_at', direction = params.get('sort_order') === 'asc' ? 1 : -1;
    items = items.slice().sort((a, b) => { const left = a[sort as keyof typeof a], right = b[sort as keyof typeof b]; return left === right ? 0 : left == null ? 1 : right == null ? -1 : left > right ? direction : -direction; });
    const total = items.length, page = Math.max(1, Number(params.get('page')) || 1), page_size = Math.min(100, Math.max(1, Number(params.get('page_size')) || 20));
    return { options: options(db), records: { items: items.slice((page - 1) * page_size, page * page_size), total, page, page_size } };
  }
  const records = db.records, total = (key: 'tokens_input' | 'tokens_output' | 'tokens_total') => records.reduce((sum, r) => sum + r[key], 0);
  function group(field: 'model_id' | 'project_id') {
    return [...new Set(records.map(r => r[field]))].map(key => { const selected = records.filter(r => r[field] === key); return { key: key || 'unknown', label: field === 'project_id' ? db.projects[key || '']?.project.title || '已删除的示例作品' : key || 'unknown', calls: selected.length, tokens_total: selected.reduce((n, r) => n + r.tokens_total, 0) }; });
  }
  const byDate = new Map<string, typeof records>();
  for (const r of records) { const key = `${r.created_at.slice(0, 10)}:${r.model_id}`; byDate.set(key, [...(byDate.get(key) || []), r]); }
  return { summary: { calls_total: records.length, success_total: records.filter(r => r.status === 'success').length, tokens_total: total('tokens_total'), tokens_input_total: total('tokens_input'), tokens_output_total: total('tokens_output'),
      avg_latency_ms: records.length ? records.reduce((n, r) => n + (r.latency_ms || 0), 0) / records.length : null, avg_first_token_ms: records.length ? records.reduce((n, r) => n + (r.first_token_ms || 0), 0) / records.length : null },
    model_time_series: [...byDate.values()].map(items => ({ date: items[0]!.created_at.slice(0, 10), key: items[0]!.model_id, label: items[0]!.model_id, calls: items.length, tokens_total: items.reduce((n, r) => n + r.tokens_total, 0), avg_latency_ms: items.reduce((n, r) => n + (r.latency_ms || 0), 0) / items.length })).sort((a, b) => a.date.localeCompare(b.date)),
    by_model: group('model_id'), by_project: group('project_id'), options: options(db) };
}
