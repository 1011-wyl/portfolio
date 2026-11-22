'use client';

import { useState } from 'react';
import { RotateCcw, MessageSquare, Check } from 'lucide-react';
import type { CharacterProfile } from '@/lib/demo-client';
import { PortraitAvatar } from './PortraitAvatar';
import { BottomSheet } from './BottomSheet';

const MBTI_OPTIONS = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
  '自定义',
];

interface CastTabProps {
  characters: CharacterProfile[];
  onSaveCharacters: (next: CharacterProfile[]) => void;
  onResetCharacters: () => void;
  onPreviewCharacter: (seat: number, prompt: string) => string;
}

export function CastTab({
  characters,
  onSaveCharacters,
  onResetCharacters,
  onPreviewCharacter,
}: CastTabProps) {
  const [editingSeat, setEditingSeat] = useState<number | null>(null);
  const [draft, setDraft] = useState<CharacterProfile | null>(null);
  const [trialInput, setTrialInput] = useState('简单介绍自己，你会怎么找狼人？');
  const [previewReply, setPreviewReply] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const openEditor = (char: CharacterProfile) => {
    setEditingSeat(char.id);
    setDraft({ ...char });
    setPreviewReply('');
    setSavedFeedback(false);
  };

  const handleSave = () => {
    if (!draft) return;
    const updated = characters.map((c) => (c.id === draft.id ? draft : c));
    onSaveCharacters(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1600);
  };

  const handlePreview = () => {
    if (!draft) return;
    const updated = characters.map((c) => (c.id === draft.id ? draft : c));
    onSaveCharacters(updated);
    setPreviewReply(onPreviewCharacter(draft.id, trialInput));
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#efe6d2]">
            十二席角色档案
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            点击任意座位卡片即可编辑头像、性格与发言风格
          </p>
        </div>
        <button
          type="button"
          onClick={onResetCharacters}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700/60 bg-[#131c2b] px-3 text-xs font-medium text-slate-300 whitespace-nowrap active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>恢复默认</span>
        </button>
      </div>

      {/* 3列移动端头像网格 */}
      <div className="grid grid-cols-3 gap-2.5">
        {characters.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => openEditor(p)}
            className="flex min-h-[146px] flex-col items-center rounded-2xl border border-slate-800/80 bg-[#111927] px-2 pt-3 pb-3 text-center transition-colors hover:border-[#c9b37e]/50 active:scale-[0.97]"
          >
            <div className="flex w-full items-center justify-between px-1 text-[11px] text-slate-400 tabular-nums">
              <span>{String(p.id).padStart(2, '0')}</span>
              <span className="text-[#c9b37e]">
                {p.id === 12 ? '你' : p.mbti}
              </span>
            </div>
            <div className="mt-1.5">
              <PortraitAvatar
                avatarIndex={p.avatarIndex}
                fallbackGlyph={p.avatar}
                size="sm"
              />
            </div>
            <div className="font-display mt-2 w-full truncate text-sm font-medium text-[#efe6d2]">
              {p.name}
            </div>
            <div className="mt-0.5 w-full truncate text-[11px] text-slate-400">
              {p.traits}
            </div>
          </button>
        ))}
      </div>

      <BottomSheet
        open={editingSeat !== null && draft !== null}
        onClose={() => setEditingSeat(null)}
        title={
          draft
            ? `${String(draft.id).padStart(2, '0')}号 · ${draft.name}`
            : '编辑角色'
        }
        subtitle="人设仅影响扮演表达，不改变身份抽取与规则权限"
        footer={
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handlePreview}
              className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700/70 bg-[#162133] px-3 text-sm font-medium text-slate-200 active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4 text-[#c9b37e]" />
              <span>试聊</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex min-h-[46px] flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-[#c9b37e] px-4 text-sm font-semibold text-[#101623] active:scale-[0.98]"
            >
              {savedFeedback ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>已保存</span>
                </>
              ) : (
                <span>保存设定</span>
              )}
            </button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-slate-400">
                选择立绘头像
              </span>
              <div className="no-scrollbar mt-2 flex gap-2.5 overflow-x-auto pb-1">
                {Array.from({ length: 9 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraft({ ...draft, avatarIndex: i })}
                    className={`rounded-2xl p-1 transition-all shrink-0 ${
                      draft.avatarIndex === i
                        ? 'ring-2 ring-[#c9b37e] bg-[#1a263a]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <PortraitAvatar avatarIndex={i} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-400">
                  角色姓名
                </span>
                <input
                  type="text"
                  maxLength={24}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-700/70 bg-[#0a101b] px-3 text-sm text-slate-100 focus:border-[#c9b37e] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-400">
                  MBTI 风格
                </span>
                <select
                  value={draft.mbti}
                  onChange={(e) => setDraft({ ...draft, mbti: e.target.value })}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-700/70 bg-[#0a101b] px-3 text-sm text-slate-100 focus:border-[#c9b37e] focus:outline-none"
                >
                  {MBTI_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                性格关键词
              </span>
              <input
                type="text"
                maxLength={60}
                value={draft.traits}
                onChange={(e) => setDraft({ ...draft, traits: e.target.value })}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-700/70 bg-[#0a101b] px-3 text-sm text-slate-100 focus:border-[#c9b37e] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                自定义人设提示词
              </span>
              <textarea
                rows={3}
                maxLength={600}
                value={draft.prompt}
                onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-700/70 bg-[#0a101b] px-3 py-2.5 text-sm leading-relaxed text-slate-100 focus:border-[#c9b37e] focus:outline-none"
              />
            </label>

            <div className="rounded-2xl border border-slate-800/90 bg-[#0b111c] p-3.5">
              <label className="block">
                <span className="text-xs font-medium text-slate-400">
                  试聊提问内容
                </span>
                <input
                  type="text"
                  value={trialInput}
                  onChange={(e) => setTrialInput(e.target.value)}
                  className="mt-1.5 min-h-[42px] w-full rounded-xl border border-slate-700/70 bg-[#111a28] px-3 text-xs text-slate-200 focus:border-[#c9b37e] focus:outline-none"
                />
              </label>
              {previewReply && (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#142033] p-3 text-xs leading-relaxed text-[#e8dcc2]">
                  {previewReply}
                </p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
