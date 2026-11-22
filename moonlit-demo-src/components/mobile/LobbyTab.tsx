'use client';

import { ArrowUpRight, BookOpen, Play, Users, Volume2, VolumeX } from 'lucide-react';
import type { GameView } from '@/lib/demo-client';
import { PortraitAvatar } from './PortraitAvatar';

interface LobbyTabProps {
  activeGame: GameView | null;
  historyCount: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onContinueGame: () => void;
  onGoSetup: () => void;
  onGoCast: () => void;
  onOpenRules: () => void;
}

export function LobbyTab({
  activeGame,
  historyCount,
  soundOn,
  onToggleSound,
  onContinueGame,
  onGoSetup,
  onGoCast,
  onOpenRules,
}: LobbyTabProps) {
  const canContinue = activeGame && !activeGame.winner && !activeGame.legacy;

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      {/* 视觉主卡：月夜村庄插画 + 对比度渐变遮罩 */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-[#0d1421]">
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url('${import.meta.env.BASE_URL}village.png')` }}
          className="h-64 w-full bg-cover bg-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e17] via-[#090e17]/75 to-[#090e17]/20" />

        <div className="relative -mt-44 px-5 pb-5 pt-2">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#c9b37e]">
            十二人镜隐迷踪
          </p>
          <h1 className="font-display mt-2 text-3xl leading-[1.25] font-normal tracking-wide text-[#f2ead8] text-balance">
            月光之下，
            <br />
            谁的话可信？
          </h1>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
            为十二个座位赋予性格与记忆，在夜色与发言的缝隙里寻找阵营真相。
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 tabular-nums">
            <span>12人暗牌</span>
            <span aria-hidden="true">·</span>
            <span>有警长</span>
            <span aria-hidden="true">·</span>
            <span>纯前端演示</span>
            {historyCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>已留存 {historyCount} 局</span>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {canContinue ? (
              <>
                <button
                  type="button"
                  onClick={onContinueGame}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#c9b37e] px-5 text-sm font-semibold text-[#101623] transition-transform active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>继续第 {activeGame.day} 天对局</span>
                </button>
                <button
                  type="button"
                  onClick={onGoSetup}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/60 bg-[#131c2b]/90 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-[#1a263a] active:scale-[0.98]"
                >
                  <span>配置新对局</span>
                  <ArrowUpRight className="h-4 w-4 text-[#c9b37e]" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onGoSetup}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#c9b37e] px-5 text-sm font-semibold text-[#101623] transition-transform active:scale-[0.98]"
              >
                <span>进入对局配置</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 快捷触控列表区 */}
      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onGoCast}
          className="flex min-h-[76px] flex-col items-start justify-between rounded-2xl border border-slate-800/80 bg-[#111927] p-4 text-left transition-colors hover:border-[#c9b37e]/40 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between">
            <Users className="h-5 w-5 text-[#c9b37e]" />
            <span className="text-[11px] text-slate-400 tabular-nums">12 位</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-semibold text-slate-100">角色档案</div>
            <div className="text-[11px] text-slate-400">定制人设与试聊</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenRules}
          className="flex min-h-[76px] flex-col items-start justify-between rounded-2xl border border-slate-800/80 bg-[#111927] p-4 text-left transition-colors hover:border-[#c9b37e]/40 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between">
            <BookOpen className="h-5 w-5 text-[#c9b37e]" />
            <span className="text-[11px] text-slate-400">板子说明</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-semibold text-slate-100">村庄规则</div>
            <div className="text-[11px] text-slate-400">隐狼 · 魔镜 · 警长</div>
          </div>
        </button>
      </section>

      {/* 夜间群像预告条 & 音效控制 */}
      <section className="rounded-2xl border border-slate-800/80 bg-[#111927] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              入夜阵容预览
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              3普狼 · 1觉醒隐狼 · 4神职 · 4村民
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? '关闭提示音效' : '开启提示音效'}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700/60 bg-[#172235] px-3 text-xs font-medium text-slate-200 whitespace-nowrap active:scale-95"
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4 text-[#c9b37e]" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
            <span>{soundOn ? '音效开' : '静音'}</span>
          </button>
        </div>

        <div className="no-scrollbar mt-3.5 flex gap-2.5 overflow-x-auto pb-1">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <PortraitAvatar key={idx} avatarIndex={idx} size="sm" />
          ))}
        </div>
      </section>
    </div>
  );
}
