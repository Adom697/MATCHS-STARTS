export function PlayerCardAvatar({
  src,
  initials,
  size = 96,
}: {
  src?: string | null;
  initials: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full border-2 border-accent-strong bg-surface-2 flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size }}
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
  );
}
