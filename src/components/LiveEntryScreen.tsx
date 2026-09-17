'use client';

import { useState, useTransition, useRef } from 'react';
import { recordEvent, undoLastEvent } from '@/lib/actions/live';
import { EVENT_TO_COLUMN, TOUCH_EVENTS } from '@/lib/event-columns';
import type { ButtonGroup } from '@/lib/live-groups';

type Position = 'gardien' | 'defenseur' | 'autre';

export function LiveEntryScreen({
  matchId,
  groups,
  initialStats,
  position,
  undoLabel,
  locale = 'fr',
}: {
  matchId: string;
  groups: ButtonGroup[];
  initialStats: Record<string, number>;
  position: Position;
  undoLabel?: string;
  locale?: 'fr' | 'en';
}) {
  const [stats, setStats] = useState(initialStats);
  const [history, setHistory] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const busyRef = useRef(false);

  function applyDelta(eventType: string, direction: 1 | -1) {
    const column = EVENT_TO_COLUMN[eventType];
    if (!column) return;
    setStats((prev) => {
      const next = { ...prev };
      next[column] = Math.max(0, (next[column] || 0) + direction);
      if (TOUCH_EVENTS.has(eventType)) {
        next.touches = Math.max(0, (next.touches || 0) + direction);
      }
      return next;
    });
  }

  function handleTap(eventType: string) {
    // Feedback immédiat, sans attendre le serveur — c'est ce qui corrige la
    // lenteur perçue qui poussait à cliquer plusieurs fois par erreur.
    applyDelta(eventType, 1);
    setHistory((h) => [...h, eventType]);
    startTransition(() => {
      recordEvent(matchId, eventType);
    });
  }

  function handleUndo() {
    if (busyRef.current) return;
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      applyDelta(last, -1);
      return h.slice(0, -1);
    });
    startTransition(() => {
      undoLastEvent(matchId);
    });
  }

  const isGoalkeeper = position === 'gardien';
  const isDefender = position === 'defenseur';

  return (
    <>
      <div className="flex items-center justify-end mb-5 -mt-1">
        <button
          onClick={handleUndo}
          className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-foreground active:scale-95 transition-transform"
        >
          ↩ {undoLabel ? undoLabel.replace('↩ ', '') : 'Annuler'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {isGoalkeeper ? (
          <>
            <QuickStat value={stats.arrets} label={locale === 'en' ? 'Saves' : 'Arrêts'} />
            <QuickStat value={stats.buts_encaisses} label={locale === 'en' ? 'Conceded' : 'Buts encaissés'} />
            <QuickStat
              value={`${stats.degagements_reussis}/${stats.degagements_reussis + stats.degagements_rates}`}
              label={locale === 'en' ? 'Clearances' : 'Dégagements'}
            />
          </>
        ) : isDefender ? (
          <>
            <QuickStat value={stats.tacles_reussis} label={locale === 'en' ? 'Tackles won' : 'Tacles réussis'} />
            <QuickStat value={stats.interceptions} label={locale === 'en' ? 'Interceptions' : 'Interceptions'} />
            <QuickStat value={stats.duels_aeriens_gagnes} label={locale === 'en' ? 'Aerial duels' : 'Duels aériens'} />
          </>
        ) : (
          <>
            <QuickStat value={stats.touches} label={locale === 'en' ? 'Touches' : 'Touches'} />
            <QuickStat value={stats.buts} label={locale === 'en' ? 'Goals' : 'Buts'} />
            <QuickStat
              value={`${stats.passes_reussies}/${stats.passes_reussies + stats.passes_ratees}`}
              label={locale === 'en' ? 'Passes' : 'Passes'}
            />
          </>
        )}
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{group.title}</h2>
            <div className="grid grid-cols-2 gap-2">
              {group.buttons.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleTap(btn.type)}
                  className={`w-full rounded-xl py-4 font-medium text-sm transition-transform active:scale-90 ${
                    btn.tone === 'positive'
                      ? 'bg-accent-strong/15 text-accent border border-accent-strong/30 active:bg-accent-strong/25'
                      : btn.tone === 'negative'
                      ? 'bg-danger/15 text-danger border border-danger/30 active:bg-danger/25'
                      : 'bg-surface-2 text-foreground border border-border active:bg-surface'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function QuickStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
      <p className="text-lg font-bold text-accent">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
