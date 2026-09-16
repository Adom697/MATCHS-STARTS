'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ||
        'w-full bg-accent-strong hover:bg-accent disabled:opacity-60 text-black font-semibold rounded-lg py-2.5 transition-colors active:scale-[0.98]'
      }
    >
      {pending ? (
        <span className="inline-flex items-center gap-2 justify-center w-full">
          <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
          {pendingText || 'Enregistrement...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
