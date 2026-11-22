'use client';

import { useState } from 'react';
import { ArrowUpRight, Eye, Shield, SlidersHorizontal, Volume2 } from 'lucide-react';
import { ROLE_LIST } from '@/lib/demo-client';
import { BottomSheet } from './BottomSheet';

interface SetupTabProps {
  mode: 'normal' | 'practice' | 'director';
  role: string;
  god: boolean;
  assigned: string[];
  speed: number;
  soundOn: boolean;
  onModeChange: (m: 'normal' | 'practice' | 'director') => void;
  onRoleChange: (r: string) => void;
  onGodChange: (g: boolean) => void;
  onAssignedChange: (next: string[]) => void;
  onSpeedChange: (s: number) => void;
  onToggleSound: () => void;
  onStartGame: () => void;
}

const MODE_INFO = {
  normal: {
    label: '普通对局',
    desc: '你入座 12 号，盲视角推理，体验完整昼夜流程。',
  },
  practice: {
    label: '身份练习',
    desc: '自由指定开局身份，针对性演练魔镜少女或觉醒隐狼。',
  },
  director: {
    label: '导演观战',
    desc: '12 位 AI 自主对局，支持定制全席身份与全知/盲视角切换。',
  },
};

export function SetupTab({
  mode,
  role,
  god,
  assigned,
  speed,
  soundOn,
  onModeChange,
  onRoleChange,
  onGodChange,
  onAssignedChange,
  onSpeedChange,
  onToggleSound,
  onStartGame,
}: SetupTabProps) {
  const [directorSheetOpen, setDirectorSheetOpen] = useState(false);

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#efe6d2]">
          开局配置
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          纯前端离线引擎驱动 · 随时开始十二人镜隐迷踪
        </p>
      </div>

      {/* 模式选择分段器 */}
      <section className="rounded-2xl border border-slate-800/80 bg-[#111927] p-4 space-y-3">
        <span className="block text-xs font-medium text-slate-400">
          对局模式
        </span>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#090e17] p-1 border border-slate-800/80">
          {(['normal', 'practice', 'director'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`min-h-[42px] rounded-lg px-2 text-xs font-medium whitespace-nowrap transition-colors ${
                mode === m
                  ? 'bg-[#c9b37e] text-[#101623] font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {MODE_INFO[m].label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-300">
          {MODE_INFO[mode].desc}
        </p>
      </section>

      {/* 我的身份或导演配置 */}
      {mode !== 'director' ? (
        <section className="rounded-2xl border border-slate-800/80 bg-[#111927] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Shield className="h-3.5 w-3.5 text-[#c9b37e]" />
              <span>12号（你的座位）开局身份</span>
            </span>
            <span className="text-xs text-[#c9b37e]">
              {role === 'random' ? '随机分配' : role}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onRoleChange('random')}
              className={`min-h-[44px] rounded-xl border px-2 text-xs font-medium whitespace-nowrap transition-colors ${
                role === 'random'
                  ? 'border-[#c9b37e] bg-[#c9b37e]/15 text-[#efe6d2]'
                  : 'border-slate-800 bg-[#0b111c] text-slate-400 hover:text-slate-200'
              }`}
            >
              随机
            </button>
            {ROLE_LIST.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRoleChange(r)}
                className={`min-h-[44px] rounded-xl border px-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  role === r
                    ? 'border-[#c9b37e] bg-[#c9b37e]/15 text-[#efe6d2]'
                    : 'border-slate-800 bg-[#0b111c] text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-800/80 bg-[#111927] p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Eye className="h-3.5 w-3.5 text-[#c9b37e]" />
              <span>观战视角</span>
            </span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#090e17] p-1 border border-slate-800/80">
              <button
                type="button"
                onClick={() => onGodChange(false)}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-medium whitespace-nowrap ${
                  !god ? 'bg-[#1d2a3f] text-[#efe6d2]' : 'text-slate-400'
                }`}
              >
                盲视角
              </button>
              <button
                type="button"
                onClick={() => onGodChange(true)}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-medium whitespace-nowrap ${
                  god ? 'bg-[#1d2a3f] text-[#efe6d2]' : 'text-slate-400'
                }`}
              >
                全知视角
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDirectorSheetOpen(true)}
            className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-[#0b111c] px-3.5 text-xs font-medium text-slate-200 active:scale-[0.98]"
          >
            <span>自定义 1-12 号位身份分配</span>
            <span className="text-[#c9b37e]">点击调整</span>
          </button>
        </section>
      )}

      {/* 演示节奏与音效设置 */}
      <section className="rounded-2xl border border-slate-800/80 bg-[#111927] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#c9b37e]" />
            <span>发言打字速度</span>
          </span>
          <span className="text-xs font-medium text-[#e6d5ad] tabular-nums">
            {speed} 字/秒
          </span>
        </div>
        <input
          type="range"
          min={15}
          max={120}
          step={5}
          aria-label="发言打字速度"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[#c9b37e]"
        />

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Volume2 className="h-4 w-4 text-[#c9b37e]" />
            <span>阶段提示音效</span>
          </span>
          <button
            type="button"
            onClick={onToggleSound}
            className={`min-h-[40px] min-w-[76px] rounded-xl border px-3 text-xs font-medium transition-colors ${
              soundOn
                ? 'border-[#c9b37e]/60 bg-[#c9b37e]/15 text-[#efe6d2]'
                : 'border-slate-700/70 bg-[#0b111c] text-slate-400'
            }`}
          >
            {soundOn ? '已开启' : '已静音'}
          </button>
        </div>
      </section>

      {/* 拇指热区主确认按钮 */}
      <button
        type="button"
        onClick={onStartGame}
        className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#c9b37e] px-5 text-sm font-semibold text-[#101623] shadow-lg shadow-black/30 transition-transform active:scale-[0.98]"
      >
        <span>开始 12 人对局</span>
        <ArrowUpRight className="h-4 w-4" />
      </button>

      <BottomSheet
        open={directorSheetOpen}
        onClose={() => setDirectorSheetOpen(false)}
        title="导演席位分配"
        subtitle="须包含 3普狼、1觉醒隐狼、4村民、魔镜/女巫/猎人/守卫各1"
        footer={
          <button
            type="button"
            onClick={() => setDirectorSheetOpen(false)}
            className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#c9b37e] text-sm font-semibold text-[#101623]"
          >
            完成分配
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {assigned.map((val, idx) => (
            <label key={idx} className="block">
              <span className="text-[11px] text-slate-400 tabular-nums">
                {String(idx + 1).padStart(2, '0')}号位
              </span>
              <select
                value={val}
                onChange={(e) => {
                  const next = [...assigned];
                  next[idx] = e.target.value;
                  onAssignedChange(next);
                }}
                className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-700/70 bg-[#0a101b] px-2.5 text-xs text-slate-100 focus:border-[#c9b37e] focus:outline-none"
              >
                {ROLE_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
