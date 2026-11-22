'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Flame,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  TASK_LABELS,
  formatChoiceLabel,
  type GamePlayer,
  type GameView,
} from '@/lib/demo-client';
import { playSound, type SoundKind } from '@/lib/sound';
import { BottomSheet } from './BottomSheet';
import { PortraitAvatar } from './PortraitAvatar';
import { RulesContent } from './RulesContent';

const STRING_ACTIONS = ['potion', 'signup', 'withdraw', 'direction'];
const SPEECH_TASK_TYPES = ['speech', 'lastWords', 'wolfChat', 'sheriffSpeech'];
const QUICK_PHRASES = [
  '我是好人，先听后置位发言。',
  '注意票型逻辑，先过麦。',
  '建议警长归票高疑点座位。',
];

interface GameArenaProps {
  game: GameView;
  speed: number;
  soundOn: boolean;
  onExitToLobby: () => void;
  onTogglePause: (paused: boolean) => void;
  onStep: (action?: { text?: string; choice?: string | number }) => void;
  onAdvance: () => void;
  onSignupChoice: (selectionId: string, choice: 'join' | 'stay') => void;
  onWolfChoice: (selectionId: string, choice: number) => void;
  onBallotVote: (ballotId: string, choice: number) => void;
  onWithdraw: () => void;
  onExplode: () => void;
  onArchive: () => void;
  onRestartSameCast: () => void;
}

export function GameArena({
  game,
  speed,
  soundOn,
  onExitToLobby,
  onTogglePause,
  onStep,
  onAdvance,
  onSignupChoice,
  onWolfChoice,
  onBallotVote,
  onWithdraw,
  onExplode,
  onArchive,
  onRestartSameCast,
}: GameArenaProps) {
  const [stageTab, setStageTab] = useState<'stage' | 'logs' | 'notes'>('stage');
  const [logFilter, setLogFilter] = useState<'all' | 'votes' | 'reason'>('all');
  const [draftState, setDraftState] = useState({ rev: game.revision, val: '' });
  const [choiceState, setChoiceState] = useState({
    rev: game.revision,
    val: '',
  });
  const [remainingState, setRemainingState] = useState({
    rev: game.revision,
    val: 90,
  });
  const [visibleState, setVisibleState] = useState({
    rev: game.revision,
    val: 0,
  });
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState(() =>
    typeof window !== 'undefined'
      ? window.localStorage.getItem(`moonlit-mobile-notes-${game.id}`) || ''
      : '',
  );
  const [sheet, setSheet] = useState<
    '' | 'identity' | 'menu' | 'rules' | 'end' | 'explode'
  >('');
  const [inspectSeat, setInspectSeat] = useState<GamePlayer | null>(null);

  const draft = draftState.rev === game.revision ? draftState.val : '';
  const setDraft = (val: string) =>
    setDraftState({ rev: game.revision, val });

  const choice = choiceState.rev === game.revision ? choiceState.val : '';
  const setChoice = (val: string) =>
    setChoiceState({ rev: game.revision, val });

  const remaining =
    remainingState.rev === game.revision ? remainingState.val : 90;
  const visibleChars =
    visibleState.rev === game.revision ? visibleState.val : 0;

  const prevPhaseRef = useRef(game.phase);
  const prevWinnerRef = useRef(game.winner);
  const prevHumanTurnRef = useRef(false);

  const triggerSound = (kind: SoundKind) => {
    playSound(kind, soundOn);
  };

  // 阶段与胜负音效反馈
  useEffect(() => {
    if (prevPhaseRef.current !== game.phase) {
      if (game.phase === 'night') triggerSound('night');
      else if (game.phase === 'day' || game.phase === 'speech') triggerSound('dawn');
      else if (game.phase === 'vote') triggerSound('vote');
      prevPhaseRef.current = game.phase;
    }
    if (!prevWinnerRef.current && game.winner) {
      triggerSound('win');
    }
    prevWinnerRef.current = game.winner;

    const isHumanNow =
      !!game.task?.human ||
      !!(game.signupSelection?.humanEligible && !game.signupSelection?.humanSubmitted) ||
      !!(game.wolfSelection?.humanEligible && !game.wolfSelection?.humanSubmitted) ||
      !!(game.ballot?.humanEligible && !game.ballot?.humanSubmitted);
    if (!prevHumanTurnRef.current && isHumanNow) {
      triggerSound('turn');
    }
    prevHumanTurnRef.current = isHumanNow;
  });

  const isVoting = !!game.ballot;
  const publicSpeech = game.awaitingAdvance ? game.displaySpeech : null;
  const voteSeconds = game.ballot?.deadline
    ? Math.max(0, (game.ballot.deadline - now) / 1000)
    : 5;

  const spokenText = isVoting
    ? game.ballot?.status === 'waiting'
      ? '投票即将开始，倒计时开启后全员同时选择目标。'
      : `全体同时投票，剩余 ${voteSeconds.toFixed(1)} 秒。截止后未提交视为弃票，票型统一公布。`
    : publicSpeech?.text || game.stage || '夜色渐深，等待下一阶段流程。';

  // 打字机效果、倒计时时钟与自动提交
  useEffect(() => {
    let last = Date.now();
    const timer = setInterval(() => {
      const current = Date.now();
      const delta = Math.min(250, current - last);
      last = current;
      setNow(current);

      if (game.paused || game.winner) return;
      if (game.ballot?.status === 'open') return;

      setVisibleState((prev) => {
        const base = prev.rev === game.revision ? prev.val : 0;
        return {
          rev: game.revision,
          val: Math.min(spokenText.length, base + speed / 10),
        };
      });

      if (
        !game.awaitingAdvance &&
        game.task?.human &&
        SPEECH_TASK_TYPES.includes(game.task.type)
      ) {
        setRemainingState((prev) => {
          const cur = prev.rev === game.revision ? prev.val : 90;
          const next = Math.max(0, cur - delta / 1000);
          if (cur > 0 && next === 0) {
            onStep({ text: draft });
          }
          return { rev: game.revision, val: next };
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [
    game.revision,
    game.paused,
    game.winner,
    game.ballot?.status,
    game.awaitingAdvance,
    game.task?.human,
    game.task?.type,
    spokenText.length,
    speed,
    draft,
    onStep,
  ]);

  // AI 行动自动推进（每步 ~420ms 舒适阅读节奏）
  useEffect(() => {
    if (
      game.paused ||
      game.winner ||
      game.awaitingAdvance ||
      game.task?.human ||
      game.wolfSelection ||
      game.signupSelection ||
      game.ballot?.status === 'open'
    ) {
      return;
    }
    const id = setTimeout(() => {
      onStep();
    }, 420);
    return () => clearTimeout(id);
  }, [
    game.id,
    game.revision,
    game.paused,
    game.winner,
    game.awaitingAdvance,
    game.task?.human,
    game.task?.type,
    game.wolfSelection,
    game.signupSelection,
    game.ballot?.status,
    onStep,
  ]);

  const humanPlayer = game.players.find((p) => p.human);
  const aliveCount = game.players.filter((p) => p.alive).length;
  const activeActorId = game.awaitingAdvance
    ? game.displaySpeech?.actor
    : game.task?.actor;

  const inspectionResults = useMemo(
    () =>
      (humanPlayer?.knowledge || []).filter(
        (k) => k.kind === 'inspect' && k.day === game.day,
      ),
    [humanPlayer?.knowledge, game.day],
  );

  const visibleLogs = useMemo(() => {
    return (game.events || []).filter((e) => {
      if (logFilter === 'all') return true;
      if (logFilter === 'votes') return e.kind === 'vote';
      return e.kind === 'rationale';
    });
  }, [game.events, logFilter]);

  const seatSpeeches = useMemo(() => {
    if (!inspectSeat) return [];
    return (game.events || []).filter(
      (e) =>
        e.actor === inspectSeat.id &&
        ['speech', 'sheriffSpeech', 'lastWords', 'wolfChat'].includes(
          e.kind || '',
        ),
    );
  }, [game.events, inspectSeat]);

  const headerTitle = game.winner
    ? game.winner === '中途结束'
      ? '对局已结束'
      : `${game.winner}阵营获胜`
    : `第 ${game.day} ${game.phase === 'night' ? '夜' : '天'} · ${
        game.stage || TASK_LABELS[game.task?.type || ''] || '进行中'
      }`;

  const saveNote = (val: string) => {
    setNote(val);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`moonlit-mobile-notes-${game.id}`, val);
    }
  };

  return (
    <div
      className={`flex h-full flex-col ${
        game.phase === 'night' ? 'bg-[#070b14]' : 'bg-[#0b111c]'
      }`}
    >
      {/* 紧凑顶部应用栏（52px） */}
      <header className="pt-safe sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-[#0a101b]/95 px-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onExitToLobby}
          aria-label="返回大厅"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/70 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-xs font-semibold text-[#efe6d2]">
            {headerTitle}
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 tabular-nums">
            <span>存活 {aliveCount}/12</span>
            {game.sheriff > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#c9b37e]">警长 {game.sheriff}号</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {!game.winner && (
            <button
              type="button"
              disabled={game.ballot?.status === 'open'}
              onClick={() => onTogglePause(!game.paused)}
              aria-label={game.paused ? '继续对局' : '暂停对局'}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-200 hover:bg-slate-800/70 disabled:opacity-40 active:scale-95"
            >
              {game.paused ? (
                <Play className="h-4 w-4 text-[#c9b37e] fill-current" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSheet('menu')}
            aria-label="对局菜单"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/70 active:scale-95"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 可滚动主内容区：12人圆桌网格 + 舞台/记录/笔记 */}
      <div className="thin-scroll flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-3">
        {/* 4×3 移动端十二人座位矩阵（无需横向滚动，一眼尽览全局） */}
        <section aria-label="十二人座位席">
          <div className="grid grid-cols-4 gap-1.5">
            {game.players.map((p) => {
              const isSpeaking = activeActorId === p.id;
              const isEligibleVote = game.ballot?.eligible.includes(p.id);
              const isVoted = game.ballot?.submitted.includes(p.id);
              const isWolfRole = ['狼人', '觉醒隐狼'].includes(p.role || '');

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    triggerSound('tap');
                    setInspectSeat(p);
                  }}
                  className={`relative flex min-h-[82px] flex-col items-center rounded-xl border px-1 pt-1.5 pb-1.5 text-center transition-colors active:scale-[0.97] ${
                    isSpeaking
                      ? 'border-[#c9b37e] bg-[#1a2538]'
                      : isEligibleVote
                        ? 'border-[#c9b37e]/45 bg-[#121c2c]'
                        : 'border-slate-800/80 bg-[#101826]'
                  } ${!p.alive ? 'opacity-50' : ''}`}
                >
                  <div className="flex w-full items-center justify-between px-0.5 text-[10px] leading-none tabular-nums">
                    <span className="font-medium text-slate-400">
                      {String(p.id).padStart(2, '0')}
                    </span>
                    <span
                      className={
                        p.sheriff
                          ? 'font-semibold text-[#c9b37e]'
                          : p.human
                            ? 'font-semibold text-[#7dc1ad]'
                            : isEligibleVote
                              ? isVoted
                                ? 'text-[#7dc1ad]'
                                : 'text-[#c9b37e]'
                              : 'text-slate-500'
                      }
                    >
                      {!p.alive
                        ? '出局'
                        : isEligibleVote
                          ? isVoted
                            ? '已投'
                            : '待投'
                          : p.sheriff
                            ? '警长'
                            : p.human
                              ? '你'
                              : ''}
                    </span>
                  </div>

                  <div className="mt-1">
                    <PortraitAvatar
                      avatarIndex={p.avatarIndex}
                      fallbackGlyph={p.avatar}
                      size="xs"
                      dimmed={!p.alive}
                    />
                  </div>

                  <div className="mt-1 w-full truncate text-[11px] font-medium text-slate-200">
                    {p.name}
                  </div>
                  <div
                    className={`w-full truncate text-[10px] leading-tight ${
                      p.role
                        ? isWolfRole
                          ? 'text-[#d97d85]'
                          : 'text-[#c9b37e]'
                        : 'text-slate-500'
                    }`}
                  >
                    {p.role || '未知'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 分段切换：对局台 / 记录 / 笔记 */}
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800/80 bg-[#080d16] p-1">
          {(
            [
              ['stage', '对局台'],
              ['logs', `记录 (${game.events.length})`],
              ['notes', '笔记'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStageTab(id)}
              className={`min-h-[38px] rounded-lg px-2 text-xs font-medium whitespace-nowrap transition-colors tabular-nums ${
                stageTab === id
                  ? 'bg-[#192436] text-[#efe6d2]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 子视图 1：对局台 */}
        {stageTab === 'stage' && (
          <div className="space-y-3">
            {/* 魔镜少女专属查验结果 */}
            {inspectionResults.length > 0 && (
              <section
                aria-live="polite"
                className="rounded-2xl border border-[#5e9686]/50 bg-[#122423] p-4"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-[#84c5b3]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>魔镜查验 · 仅你可见</span>
                </div>
                {inspectionResults.map((k) => (
                  <div
                    key={`${k.day}-${k.target}`}
                    className="mt-1.5 text-base font-semibold text-[#dff5ee] tabular-nums"
                  >
                    第 {k.day} 夜 · {k.target}号玩家身份为「{k.result}」
                  </div>
                ))}
              </section>
            )}

            {/* 主发言 / 主持播报舞台卡片 */}
            <article className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#111927] p-4">
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#c9b37e]">
                <span>
                  {game.winner
                    ? '真相揭晓'
                    : game.paused
                      ? '对局已暂停'
                      : isVoting
                        ? '同时投票倒计时'
                        : publicSpeech?.actor
                          ? `${publicSpeech.actor}号 · ${game.players[publicSpeech.actor - 1]?.name}`
                          : '法官播报'}
                </span>
                <span className="text-slate-400 tabular-nums">
                  {game.phase === 'night'
                    ? '夜幕阶段'
                    : game.phase === 'election'
                      ? '警长竞选'
                      : game.phase === 'vote'
                        ? '投票阶段'
                        : game.phase === 'over'
                          ? '已结算'
                          : '白天讨论'}
                </span>
              </div>

              <p className="mt-3 min-h-[84px] whitespace-pre-wrap text-[15px] leading-7 text-slate-100">
                {game.paused || isVoting || !game.awaitingAdvance
                  ? spokenText
                  : spokenText.slice(0, Math.floor(visibleChars))}
                {!isVoting && !game.winner && !game.paused && (
                  <span className="type-cursor ml-0.5 text-[#c9b37e]">▏</span>
                )}
              </p>

              {/* 快捷特殊动作条（退水 / 狼人自爆 / 查看身份） */}
              {(game.canWithdraw ||
                game.canExplode ||
                game.mode !== 'director') && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
                  {game.mode !== 'director' && (
                    <button
                      type="button"
                      onClick={() => setSheet('identity')}
                      className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700/60 bg-[#162133] px-3 text-xs font-medium text-slate-200 active:scale-95"
                    >
                      <Shield className="h-3.5 w-3.5 text-[#c9b37e]" />
                      <span>我的身份</span>
                    </button>
                  )}
                  {game.canWithdraw && (
                    <button
                      type="button"
                      onClick={onWithdraw}
                      className="flex min-h-[40px] items-center rounded-xl border border-slate-700/60 bg-[#162133] px-3 text-xs font-medium text-slate-200 active:scale-95"
                    >
                      退水
                    </button>
                  )}
                  {game.canExplode && (
                    <button
                      type="button"
                      onClick={() => setSheet('explode')}
                      className="flex min-h-[40px] items-center gap-1 rounded-xl border border-[#b8545c]/50 bg-[#3a1b22] px-3 text-xs font-medium text-[#f1b5ba] active:scale-95"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      <span>狼人自爆</span>
                    </button>
                  )}
                </div>
              )}
            </article>
          </div>
        )}

        {/* 子视图 2：记录 */}
        {stageTab === 'logs' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800/80 bg-[#0b111c] p-1">
              {(
                [
                  ['all', '全部可见'],
                  ['votes', '投票票型'],
                  ...(game.winner || game.god ? [['reason', 'AI 摘要']] : []),
                ] as Array<[string, string]>
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setLogFilter(id as 'all' | 'votes' | 'reason')
                  }
                  className={`min-h-[36px] rounded-lg px-2 text-xs font-medium whitespace-nowrap ${
                    logFilter === id
                      ? 'bg-[#192436] text-[#efe6d2]'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-800/70 rounded-2xl border border-slate-800/80 bg-[#111927] px-3.5">
              {[...visibleLogs].reverse().map((e) => (
                <div key={e.id} className="py-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 tabular-nums">
                    <span>#{e.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      第{e.day}
                      {e.phase === 'night' ? '夜' : '天'}
                    </span>
                    {e.actor && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">{e.actor}号</span>
                      </>
                    )}
                    {e.visibility !== 'public' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#c9b37e]">私密</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200 break-words">
                    {e.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 子视图 3：私人笔记 */}
        {stageTab === 'notes' && (
          <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-[#111927] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                侦探备忘录（仅保存在本机）
              </span>
              <button
                type="button"
                onClick={() => saveNote('')}
                className="min-h-[34px] px-2 text-xs text-slate-400 hover:text-slate-200"
              >
                清空
              </button>
            </div>

            {/* 单手快捷插入常用标签 */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              {['[金水]', '[查杀]', '[认好]', '[疑狼]', '[带队]'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    saveNote(note ? `${note} ${tag}` : `${tag} `)
                  }
                  className="min-h-[36px] shrink-0 rounded-lg border border-slate-700/60 bg-[#0b111c] px-2.5 text-xs text-slate-300 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={9}
              aria-label="私人笔记"
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              placeholder="点击上方标签或输入线索：记录警上站边、查验结果、票型矛盾…"
              className="w-full rounded-xl border border-slate-700/70 bg-[#0a101b] p-3 text-sm leading-relaxed text-slate-100 focus:border-[#c9b37e] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 底部拇指交互操作坞（自然触控区） */}
      <footer className="pb-safe shrink-0 border-t border-slate-800/90 bg-[#0d1421]/95 px-3.5 pt-3 pb-3 backdrop-blur-md">
        {game.winner ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>
                {game.winner === '中途结束'
                  ? '对局已存档，全员底牌可在桌席查看'
                  : `${game.winner}阵营取得最终胜利`}
              </span>
              <span className="text-[#c9b37e] tabular-nums">
                共 {game.day} 天
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExitToLobby}
                className="flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-slate-700/70 bg-[#152033] text-sm font-medium text-slate-200 active:scale-[0.98]"
              >
                返回大厅
              </button>
              <button
                type="button"
                onClick={onRestartSameCast}
                className="flex min-h-[46px] flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623] active:scale-[0.98]"
              >
                <span>原阵容再来一局</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : game.paused ? (
          <button
            type="button"
            onClick={() => onTogglePause(false)}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#c9b37e] text-sm font-semibold text-[#101623] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>恢复对局继续</span>
          </button>
        ) : game.signupSelection ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#efe6d2]">
                全体同时选择是否上警
              </span>
              <span className="text-slate-400 tabular-nums">
                已确认 {game.signupSelection.submittedCount} /{' '}
                {game.signupSelection.total}
              </span>
            </div>
            {game.signupSelection.humanEligible &&
            !game.signupSelection.humanSubmitted ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onSignupChoice(game.signupSelection!.id, 'join')
                  }
                  className="flex min-h-[48px] items-center justify-center rounded-2xl bg-[#c9b37e] text-sm font-semibold text-[#101623] active:scale-[0.98]"
                >
                  我要上警
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSignupChoice(game.signupSelection!.id, 'stay')
                  }
                  className="flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-700/70 bg-[#152033] text-sm font-medium text-slate-200 active:scale-[0.98]"
                >
                  不上警
                </button>
              </div>
            ) : (
              <p className="py-2 text-center text-xs text-slate-400">
                {game.signupSelection.humanSubmitted
                  ? '你已确认，正在等待其他玩家完成…'
                  : '其他玩家正在同步选择上警状态…'}
              </p>
            )}
          </div>
        ) : game.wolfSelection ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e8a3a8]">
                狼队同时选择袭击目标
              </span>
              <span className="text-slate-400">最高票决定</span>
            </div>
            {game.wolfSelection.humanEligible &&
            !game.wolfSelection.humanSubmitted ? (
              <>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                  {game.wolfSelection.choices.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setChoice(String(v))}
                      className={`min-h-[42px] rounded-xl border text-xs font-medium tabular-nums transition-colors ${
                        choice === String(v)
                          ? 'border-[#c9b37e] bg-[#c9b37e] text-[#101623] font-semibold'
                          : 'border-slate-700/60 bg-[#141f31] text-slate-200'
                      }`}
                    >
                      {v === 0 ? '空刀' : `${v}号`}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={choice === ''}
                  onClick={() =>
                    onWolfChoice(game.wolfSelection!.id, Number(choice))
                  }
                  className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623] disabled:opacity-40"
                >
                  确认狼刀目标
                </button>
              </>
            ) : (
              <p className="py-2 text-center text-xs text-slate-400">
                {game.wolfSelection.humanSubmitted
                  ? '你已选定目标，等待队友确认…'
                  : '狼人正在夜色中商定袭击目标…'}
              </p>
            )}
          </div>
        ) : game.ballot ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#efe6d2]">
                  {game.ballot.kind === 'sheriff' ? '警长竞选投票' : '放逐投票'}
                </div>
                <div className="text-[11px] text-slate-400 tabular-nums">
                  已提交 {game.ballot.submitted.length} /{' '}
                  {game.ballot.eligible.length} 人 · 未投弃票
                </div>
              </div>
              <div
                role="timer"
                className="text-2xl font-bold text-[#e6c477] tabular-nums"
              >
                {voteSeconds.toFixed(1)}s
              </div>
            </div>

            {/* 5秒进度条 */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-[#c9b37e] transition-[width] duration-100"
                style={{ width: `${Math.min(100, (voteSeconds / 5) * 100)}%` }}
              />
            </div>

            {game.ballot.humanEligible && !game.ballot.humanSubmitted ? (
              <>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                  {game.ballot.choices.map((v) => (
                    <button
                      key={v}
                      type="button"
                      disabled={voteSeconds <= 0 || game.ballot?.status !== 'open'}
                      onClick={() => setChoice(String(v))}
                      className={`min-h-[42px] rounded-xl border text-xs font-medium tabular-nums transition-colors ${
                        choice === String(v)
                          ? 'border-[#c9b37e] bg-[#c9b37e] text-[#101623] font-semibold'
                          : 'border-slate-700/60 bg-[#141f31] text-slate-200'
                      }`}
                    >
                      {v === 0 ? '弃票' : `${v}号`}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={
                    choice === '' ||
                    voteSeconds <= 0 ||
                    game.ballot.status !== 'open'
                  }
                  onClick={() =>
                    onBallotVote(game.ballot!.id, Number(choice))
                  }
                  className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623] disabled:opacity-40"
                >
                  确认投票
                </button>
              </>
            ) : (
              <p className="py-2 text-center text-xs text-slate-400">
                {game.ballot.humanSubmitted
                  ? '选票已密封提交，等待 5 秒截止统一开票…'
                  : '本轮你没有投票权，等待投票结果揭晓…'}
              </p>
            )}
          </div>
        ) : game.awaitingAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#c9b37e] text-sm font-semibold text-[#101623] active:scale-[0.98]"
          >
            <span>下一位 / 继续流程</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        ) : game.task?.human ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#efe6d2]">
                轮到你：{TASK_LABELS[game.task.type] || game.task.type}
              </span>
              {SPEECH_TASK_TYPES.includes(game.task.type) && (
                <span className="text-[#c9b37e] tabular-nums">
                  {Math.ceil(remaining)} 秒
                </span>
              )}
            </div>

            {SPEECH_TASK_TYPES.includes(game.task.type) ? (
              <>
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
                  {QUICK_PHRASES.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setDraft(phrase)}
                      className="min-h-[34px] shrink-0 rounded-lg border border-slate-700/60 bg-[#141f31] px-2.5 text-[11px] text-slate-300"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  aria-label="你的发言"
                  maxLength={1600}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="输入你的推理发言（也可直接点上方快捷话术）…"
                  className="w-full rounded-xl border border-slate-700/70 bg-[#090e17] px-3 py-2 text-sm text-slate-100 focus:border-[#c9b37e] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onStep({ text: draft })}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623] active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  <span>结束发言</span>
                </button>
              </>
            ) : (
              <>
                {game.attacked !== undefined && (
                  <p className="text-xs font-medium text-[#e8a3a8]">
                    今晚狼人袭击目标：
                    {game.attacked ? `${game.attacked}号` : '无人倒牌'}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                  {game.choices.map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setChoice(String(v))}
                      className={`min-h-[42px] rounded-xl border px-2 text-xs font-medium tabular-nums transition-colors ${
                        choice === String(v)
                          ? 'border-[#c9b37e] bg-[#c9b37e] text-[#101623] font-semibold'
                          : 'border-slate-700/60 bg-[#141f31] text-slate-200'
                      }`}
                    >
                      {formatChoiceLabel(v)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={choice === '' && game.choices.length > 0}
                  onClick={() =>
                    onStep({
                      choice: STRING_ACTIONS.includes(game.task!.type)
                        ? choice
                        : Number(choice),
                    })
                  }
                  className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623] disabled:opacity-40"
                >
                  确认行动
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-h-[44px] items-center justify-between text-xs text-slate-400">
            <span>
              {humanPlayer && !humanPlayer.alive
                ? '你已出局，正在盲视角旁观流程推进…'
                : '其他座位行动中，请稍候…'}
            </span>
            <span className="text-[#c9b37e]">自动推进</span>
          </div>
        )}
      </footer>

      {/* 底部弹窗：点击座位查看玩家详情与个人发言记录 */}
      <BottomSheet
        open={inspectSeat !== null}
        onClose={() => setInspectSeat(null)}
        title={
          inspectSeat
            ? `${String(inspectSeat.id).padStart(2, '0')}号 · ${inspectSeat.name}`
            : ''
        }
        subtitle={
          inspectSeat
            ? `${inspectSeat.mbti} · ${inspectSeat.traits} · ${
                inspectSeat.alive ? '存活中' : '已出局'
              }`
            : undefined
        }
      >
        {inspectSeat && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-[#0b111c] p-3.5">
              <PortraitAvatar
                avatarIndex={inspectSeat.avatarIndex}
                fallbackGlyph={inspectSeat.avatar}
                size="md"
                dimmed={!inspectSeat.alive}
              />
              <div className="space-y-1 text-xs">
                <div className="text-sm font-semibold text-[#efe6d2]">
                  {inspectSeat.name}
                  {inspectSeat.sheriff ? ' · 现任警长' : ''}
                  {inspectSeat.human ? '（你）' : ''}
                </div>
                <div className="text-slate-400">
                  性格：{inspectSeat.mbti} · {inspectSeat.traits}
                </div>
                <div className="text-[#c9b37e]">
                  已知身份：{inspectSeat.role || '暗牌隐藏'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-slate-400">
                本局已公开的发言记录（{seatSpeeches.length} 条）
              </h3>
              {seatSpeeches.length === 0 ? (
                <p className="mt-3 text-center text-xs text-slate-500 py-6">
                  该玩家暂未留下发言记录
                </p>
              ) : (
                <div className="mt-2 divide-y divide-slate-800/70">
                  {seatSpeeches.map((s) => (
                    <div key={s.id} className="py-2.5">
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        第{s.day}
                        {s.phase === 'night' ? '夜' : '天'} ·{' '}
                        {s.kind === 'sheriffSpeech'
                          ? '警上发言'
                          : s.kind === 'lastWords'
                            ? '遗言'
                            : s.kind === 'wolfChat'
                              ? '狼队密谈'
                              : '白天发言'}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-200">
                        {s.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 底部弹窗：菜单 / 身份 / 规则 / 自爆确认 / 结束对局 */}
      <BottomSheet
        open={sheet !== ''}
        onClose={() => setSheet('')}
        title={
          sheet === 'identity'
            ? '我的身份底牌'
            : sheet === 'rules'
              ? '镜隐迷踪规则手册'
              : sheet === 'explode'
                ? '确认狼人自爆？'
                : sheet === 'end'
                  ? '结束当前对局？'
                  : '对局菜单'
        }
      >
        {sheet === 'menu' && (
          <div className="space-y-2.5">
            {game.mode !== 'director' && (
              <button
                type="button"
                onClick={() => setSheet('identity')}
                className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-slate-800/80 bg-[#141e2e] px-4 text-sm font-medium text-slate-100"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-[#c9b37e]" />
                  查看我的身份底牌
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheet('rules')}
              className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-slate-800/80 bg-[#141e2e] px-4 text-sm font-medium text-slate-100"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-[#c9b37e]" />
                查看板子规则
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </button>
            {!game.winner && (
              <button
                type="button"
                onClick={() => setSheet('end')}
                className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-[#b8545c]/40 bg-[#2d171d] px-4 text-sm font-medium text-[#f2b8bd]"
              >
                <span>提前结束并揭晓身份</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {sheet === 'identity' && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9b37e]/40 bg-[#162133]">
              <Shield className="h-8 w-8 text-[#c9b37e]" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                12号位 · {humanPlayer?.name}
              </div>
              <h3 className="font-display mt-1 text-3xl font-semibold text-[#efe6d2]">
                {humanPlayer?.role || '未知'}
              </h3>
              {humanPlayer?.copied && (
                <p className="mt-1 text-xs text-[#c9b37e]">
                  当前模仿伪装身份：{humanPlayer.copied}
                </p>
              )}
            </div>
            {(humanPlayer?.knowledge || []).length > 0 && (
              <div className="space-y-1.5 rounded-2xl border border-slate-800/80 bg-[#0b111c] p-3.5 text-left">
                <div className="text-xs font-medium text-slate-400">
                  夜间情报记录
                </div>
                {humanPlayer!.knowledge!.map((k, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-200 tabular-nums"
                  >
                    第 {k.day} 夜 · {k.target}号：{k.result}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sheet === 'rules' && <RulesContent />}

        {sheet === 'explode' && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-300">
              自爆将立即亮明狼人身份并出局，强制终止本轮白天流程并进入下一夜（若为警上自爆将按规则处理警徽）。
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSheet('')}
                className="min-h-[46px] rounded-xl border border-slate-700/70 bg-[#152033] text-sm font-medium text-slate-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onExplode();
                  setSheet('');
                }}
                className="min-h-[46px] rounded-xl bg-[#b8545c] text-sm font-semibold text-white"
              >
                确认自爆
              </button>
            </div>
          </div>
        )}

        {sheet === 'end' && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-300">
              提前结束将把本局保存到「往日对局」，并揭晓十二个座位的真实底牌，无法再继续当前对局。
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSheet('')}
                className="min-h-[46px] rounded-xl border border-slate-700/70 bg-[#152033] text-sm font-medium text-slate-200"
              >
                继续对局
              </button>
              <button
                type="button"
                onClick={() => {
                  onArchive();
                  setSheet('');
                }}
                className="min-h-[46px] rounded-xl bg-[#b8545c] text-sm font-semibold text-white"
              >
                结束并揭晓
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
