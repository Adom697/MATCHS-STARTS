'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
    >
      Exporter en PDF
    </button>
  );
}
