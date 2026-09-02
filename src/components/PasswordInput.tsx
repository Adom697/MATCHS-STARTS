'use client';

import { useState } from 'react';

export function PasswordInput({
  name,
  placeholder,
  required,
  minLength,
  defaultValue,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 pr-16 text-foreground focus:outline-none focus:border-accent"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium"
        tabIndex={-1}
      >
        {visible ? 'Cacher' : 'Afficher'}
      </button>
    </div>
  );
}
