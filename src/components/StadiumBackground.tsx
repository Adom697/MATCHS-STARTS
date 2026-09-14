export function StadiumBackground({
  overlay = 0.55,
  src = '/images/stadium-bg.jpg',
}: {
  overlay?: number;
  src?: string;
}) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${src}')` }}
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
    </div>
  );
}
