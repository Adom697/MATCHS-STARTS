const SHIELD_CLIP = 'polygon(50% 0%, 100% 0%, 100% 62%, 50% 100%, 0% 62%, 0% 0%)';

export function PlayerCardAvatar({
  src,
  initials,
  size = 96,
}: {
  src?: string | null;
  initials: string;
  size?: number;
}) {
  const borderWidth = Math.max(3, Math.round(size * 0.045));

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size * 1.18,
        clipPath: SHIELD_CLIP,
        background: 'linear-gradient(160deg, #4ade80, #16a34a)',
      }}
    >
      <div
        className="absolute bg-surface-2 flex items-center justify-center overflow-hidden"
        style={{
          top: borderWidth,
          left: borderWidth,
          right: borderWidth,
          bottom: borderWidth,
          clipPath: SHIELD_CLIP,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted font-bold" style={{ fontSize: size * 0.32 }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
