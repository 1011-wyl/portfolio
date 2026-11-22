'use client';

import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import type { GameView, HistorySummary } from '@/lib/demo-client';
import { BottomSheet } from './BottomSheet';
import { PortraitAvatar } from './PortraitAvatar';

interface HistoryTabProps {
  history: HistorySummary[];
  onGetReplay: (id: string) => GameView | null;
  onClearHistory: () => void;
}

export function HistoryTab({
  history,
  onGetReplay,
  onClearHistory,
}: HistoryTabProps) {
  const [replay, setReplay] = useState<GameView | null>(null);
  const [filter, setFilter] = useState<'all' | 'votes' | 'reason'>('all');

  const filteredEvents = (replay?.events || []).filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'votes') return e.kind === 'vote';
    return e.kind === 'rationale';
  });

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#efe6d2]">
            往日对局
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            本地演示存档 · 点击任意一局查看全员底牌与复盘记录
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="清空历史记录"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-[#111927] text-slate-400 hover:text-[#d9848b] active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#111927] px-5 py-12 text-center">
          <p className="font-display text-base text-[#efe6d2]">
            村庄还没有留下故事
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            完成第一局「镜隐迷踪」或主动结束对局后，可以在这里回顾每一轮票型与底牌。
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#111927]">
          {history.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                const r = onGetReplay(h.id);
                if (r) {
                  setFilter('all');
                  setReplay(r);
                }
              }}
              className="flex min-h-[64px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#172235] active:bg-[#1b273c]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <span
                    className={
                      h.winner === '好人'
                        ? 'text-[#7dc1ad]'
                        : h.winner === '狼人'
                          ? 'text-[#d97d85]'
                          : 'text-[#c9b37e]'
                    }
                  >
                    {h.winner}
                    {h.winner === '中途结束' ? '' : '阵营获胜'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
                  <span>第 {h.day} 天</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(h.created).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      )}

      <BottomSheet
        open={replay !== null}
        onClose={() => setReplay(null)}
        title={
          replay
            ? `${replay.winner}${replay.winner === '中途结束' ? '' : '阵营获胜'}`
            : '对局复盘'
        }
        subtitle={replay ? `共进行 ${replay.day} 天 · 十二人底牌已揭晓` : undefined}
      >
        {replay && (
          <div className="space-y-4">
            {/* 12人底牌网格 */}
            <div className="grid grid-cols-4 gap-2">
              {replay.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex flex-col items-center rounded-xl border border-slate-800/80 bg-[#0b111c] p-2 text-center ${
                    !p.alive ? 'opacity-55' : ''
                  }`}
                >
                  <PortraitAvatar
                    avatarIndex={p.avatarIndex}
                    fallbackGlyph={p.avatar}
                    size="xs"
                    dimmed={!p.alive}
                  />
                  <span className="mt-1.5 w-full truncate text-[11px] font-medium text-slate-200">
                    {p.id}·{p.name}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] font-medium ${
                      ['狼人', '觉醒隐狼'].includes(p.role || '')
                        ? 'text-[#d97d85]'
                        : 'text-[#c9b37e]'
                    }`}
                  >
                    {p.role || '未知'}
                  </span>
                </div>
              ))}
            </div>

            {/* 复盘记录筛选 */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#090e17] p-1 border border-slate-800/80">
              {[
                ['all', '全部记录'],
                ['votes', '投票票型'],
                ['reason', '策略摘要'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id as 'all' | 'votes' | 'reason')}
                  className={`min-h-[36px] rounded-lg px-2 text-xs font-medium whitespace-nowrap ${
                    filter === id
                      ? 'bg-[#1d2a3f] text-[#efe6d2]'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-800/70">
              {filteredEvents.map((e) => (
                <div key={e.id} className="py-2.5">
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    #{e.id} · 第{e.day}
                    {e.phase === 'night' ? '夜' : '天'}
                    {e.actor ? ` · ${e.actor}号` : ''}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    {e.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
