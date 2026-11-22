'use client';

interface PortraitAvatarProps {
  avatarIndex?: number;
  fallbackGlyph?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  dimmed?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<PortraitAvatarProps['size']>, string> = {
  xs: 'w-9 h-10 rounded-t-[16px] rounded-b-md',
  sm: 'w-11 h-[52px] rounded-t-[20px] rounded-b-md',
  md: 'w-16 h-[76px] rounded-t-[28px] rounded-b-lg',
  lg: 'w-20 h-24 rounded-t-[36px] rounded-b-xl',
};

export function PortraitAvatar({
  avatarIndex = 0,
  fallbackGlyph = '☾',
  size = 'md',
  className = '',
  dimmed = false,
}: PortraitAvatarProps) {
  const safeIndex = Math.max(0, Math.min(8, Number(avatarIndex) || 0));
  const xPos = (safeIndex % 3) * 50;
  const yPos = Math.floor(safeIndex / 3) * 50;

  return (
    <div
      aria-hidden="true"
      className={`portrait-sprite relative shrink-0 overflow-hidden border border-[#c9b37e]/30 shadow-sm ${SIZE_CLASSES[size]} ${dimmed ? 'grayscale opacity-45' : ''} ${className}`}
      style={{
        backgroundPosition: `${xPos}% ${yPos}%`,
      }}
    >
      <span className="sr-only">{fallbackGlyph}</span>
    </div>
  );
}
