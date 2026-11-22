'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Compass, Moon, ScrollText, Users } from 'lucide-react';
import {
  DEFAULT_ASSIGNED_ROLES,
  getDemoClient,
  type CharacterProfile,
  type GameView,
  type HistorySummary,
} from '@/lib/demo-client';
import { playSound } from '@/lib/sound';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { CastTab } from '@/components/mobile/CastTab';
import { GameArena } from '@/components/mobile/GameArena';
import { HistoryTab } from '@/components/mobile/HistoryTab';
import { LobbyTab } from '@/components/mobile/LobbyTab';
import { RulesContent } from '@/components/mobile/RulesContent';
import { SetupTab } from '@/components/mobile/SetupTab';

type TabKey = 'lobby' | 'cast' | 'setup' | 'history';

export default function Home() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabKey>('lobby');
  const [inGame, setInGame] = useState(false);

  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [game, setGame] = useState<GameView | null>(null);
  const [history, setHistory] = useState<HistorySummary[]>([]);

  const [mode, setMode] = useState<'normal' | 'practice' | 'director'>('normal');
  const [role, setRole] = useState('random');
  const [god, setGod] = useState(false);
  const [assigned, setAssigned] = useState<string[]>(DEFAULT_ASSIGNED_ROLES);
  const [speed, setSpeed] = useState(45);
  const [soundOn, setSoundOn] = useState(true);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const client = getDemoClient();
    const sync = () => {
      const snap = client.getSnapshot();
      setCharacters(snap.characters);
      setGame(snap.game);
      setHistory(snap.history);
    };

    const unsubscribe = client.subscribe(sync);
    const frame = requestAnimationFrame(() => {
      sync();
      try {
        const pref = JSON.parse(
          window.localStorage.getItem('moonlit-mobile-pref') || '{}',
        ) as { speed?: number; soundOn?: boolean };
        if (typeof pref.speed === 'number') setSpeed(pref.speed);
        if (typeof pref.soundOn === 'boolean') setSoundOn(pref.soundOn);
      } catch {
        // Ignore invalid preferences
      }
      setReady(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'moonlit-mobile-pref',
        JSON.stringify({ speed, soundOn }),
      );
    } catch {
      // Ignore storage errors
    }
  }, [ready, speed, soundOn]);

  const handleStartGame = () => {
    setError('');
    try {
      const client = getDemoClient();
      client.startGame({ mode, role, god, assigned });
      playSound('night', soundOn);
      setInGame(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '无法开始对局，请检查配置');
    }
  };

  const handleExitToLobby = () => {
    if (game && !game.winner && !game.paused) {
      try {
        getDemoClient().setPaused(true);
      } catch {
        // Ignore if voting countdown is open
      }
    }
    setInGame(false);
    setTab('lobby');
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#05080f] md:py-5">
      {/* 手机端主视口容器：移动端满屏，桌面端居中呈献标准手机端视图 */}
      <main className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#090e17] text-slate-100 md:h-[min(860px,calc(100dvh-2.5rem))] md:rounded-[30px] md:border md:border-slate-700/45 md:shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
        {!ready ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Moon className="h-8 w-8 text-[#c9b37e]" />
            <p className="font-display text-lg text-[#efe6d2]">月下疑局</p>
            <p className="text-xs text-slate-400">正在载入移动端演示视图…</p>
          </div>
        ) : inGame && game ? (
          <GameArena
            key={game.id}
            game={game}
            speed={speed}
            soundOn={soundOn}
            onExitToLobby={handleExitToLobby}
            onTogglePause={(paused) => {
              try {
                getDemoClient().setPaused(paused);
              } catch (e) {
                setError(e instanceof Error ? e.message : '当前无法暂停');
              }
            }}
            onStep={(action) => getDemoClient().step(action)}
            onAdvance={() => {
              playSound('tap', soundOn);
              getDemoClient().advanceSpeech();
            }}
            onSignupChoice={(id, c) => {
              playSound('tap', soundOn);
              getDemoClient().submitHumanSignup(id, c);
            }}
            onWolfChoice={(id, c) => {
              playSound('tap', soundOn);
              getDemoClient().submitHumanWolfChoice(id, c);
            }}
            onBallotVote={(id, c) => {
              playSound('vote', soundOn);
              getDemoClient().submitHumanBallot(id, c);
            }}
            onWithdraw={() => {
              playSound('tap', soundOn);
              getDemoClient().withdrawHuman();
            }}
            onExplode={() => {
              playSound('night', soundOn);
              getDemoClient().explodeHuman();
            }}
            onArchive={() => getDemoClient().archiveGame()}
            onRestartSameCast={() => {
              setInGame(false);
              setTab('setup');
            }}
          />
        ) : (
          <>
            {/* 顶部精简导航栏（52px） */}
            <header className="pt-safe sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#090e17]/95 px-4 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTab('lobby')}
                className="flex min-h-[44px] items-center gap-2 text-left"
              >
                <Moon className="h-4 w-4 text-[#c9b37e]" />
                <span className="font-display text-base font-semibold tracking-wider text-[#efe6d2] whitespace-nowrap">
                  月下疑局
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRulesOpen(true)}
                aria-label="查看规则说明"
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800/60 active:scale-95"
              >
                <ScrollText className="h-4 w-4 text-[#c9b37e]" />
                <span>规则</span>
              </button>
            </header>

            {error && (
              <div
                role="alert"
                className="mx-4 mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#b8545c]/60 bg-[#321820] px-3.5 py-2.5 text-xs text-[#f2c2c7]"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="min-h-[32px] px-2 font-medium text-white"
                >
                  关闭
                </button>
              </div>
            )}

            {/* 主滚动内容区 */}
            <div className="thin-scroll flex-1 overflow-y-auto">
              {tab === 'lobby' && (
                <LobbyTab
                  activeGame={game}
                  historyCount={history.length}
                  soundOn={soundOn}
                  onToggleSound={() => {
                    const next = !soundOn;
                    setSoundOn(next);
                    if (next) playSound('tap', true);
                  }}
                  onContinueGame={() => setInGame(true)}
                  onGoSetup={() => {
                    playSound('tap', soundOn);
                    setTab('setup');
                  }}
                  onGoCast={() => {
                    playSound('tap', soundOn);
                    setTab('cast');
                  }}
                  onOpenRules={() => {
                    playSound('tap', soundOn);
                    setRulesOpen(true);
                  }}
                />
              )}

              {tab === 'cast' && (
                <CastTab
                  characters={characters}
                  onSaveCharacters={(next) => {
                    getDemoClient().saveCharacters(next);
                    playSound('tap', soundOn);
                  }}
                  onResetCharacters={() => {
                    getDemoClient().resetCharacters();
                    playSound('tap', soundOn);
                  }}
                  onPreviewCharacter={(seat, prompt) =>
                    getDemoClient().previewCharacter(seat, prompt)
                  }
                />
              )}

              {tab === 'setup' && (
                <SetupTab
                  mode={mode}
                  role={role}
                  god={god}
                  assigned={assigned}
                  speed={speed}
                  soundOn={soundOn}
                  onModeChange={setMode}
                  onRoleChange={setRole}
                  onGodChange={setGod}
                  onAssignedChange={setAssigned}
                  onSpeedChange={setSpeed}
                  onToggleSound={() => setSoundOn((s) => !s)}
                  onStartGame={handleStartGame}
                />
              )}

              {tab === 'history' && (
                <HistoryTab
                  history={history}
                  onGetReplay={(id) => getDemoClient().getReplay(id)}
                  onClearHistory={() => getDemoClient().clearHistory()}
                />
              )}
            </div>

            {/* 底部固定 Tab 导航栏（拇指区） */}
            <nav
              aria-label="主导航"
              className="pb-safe grid h-[60px] shrink-0 grid-cols-4 border-t border-slate-800/90 bg-[#0b111c]/95 backdrop-blur-md"
            >
              {(
                [
                  { id: 'lobby', label: '大厅', Icon: Moon },
                  { id: 'cast', label: '角色', Icon: Users },
                  { id: 'setup', label: '开局', Icon: Compass },
                  { id: 'history', label: '往日', Icon: BookOpen },
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setError('');
                      setTab(id);
                    }}
                    className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
                      active
                        ? 'text-[#c9b37e]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium tracking-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </>
        )}

        <BottomSheet
          open={rulesOpen}
          onClose={() => setRulesOpen(false)}
          title="村庄规则手册"
          subtitle="12人镜隐迷踪 · 有警长 · 暗牌屠边"
        >
          <RulesContent />
        </BottomSheet>
      </main>
    </div>
  );
}
