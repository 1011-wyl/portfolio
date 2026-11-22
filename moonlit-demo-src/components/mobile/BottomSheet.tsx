'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <dialog
      open
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-end justify-center border-0 bg-transparent p-0 text-slate-100 md:items-center md:p-4"
    >
      <button
        type="button"
        aria-label="关闭弹窗背景"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="animate-sheet-up relative z-10 flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-3xl border border-slate-700/40 bg-[#101826] text-slate-100 shadow-2xl md:rounded-3xl">
        <div className="flex flex-col items-center border-b border-slate-800/80 px-5 pt-2.5 pb-3">
          <div className="mb-2.5 h-1 w-10 rounded-full bg-slate-600/70" />
          <div className="flex w-full items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display truncate text-lg font-semibold text-[#efe6d2]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭弹窗"
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="pb-safe border-t border-slate-800/80 bg-[#0d1421] px-5 pt-3 pb-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
