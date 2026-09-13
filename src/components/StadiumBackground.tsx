export function StadiumBackground({ overlay = 0.55 }: { overlay?: number }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
    </div>
  );
}
