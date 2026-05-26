import React from 'react';

const RANKS: Record<string, { label: string; color: string; icon: string }> = {
  corner_cypher:     { label: 'Corner Cypher',     color: 'text-zinc-400 bg-zinc-800',           icon: '🎤' },
  rising_talent:     { label: 'Rising Talent',      color: 'text-blue-400 bg-blue-900/40',        icon: '⭐' },
  sheller:           { label: 'Sheller',            color: 'text-green-400 bg-green-900/40',      icon: '🔥' },
  top_striker:       { label: 'Top Striker',        color: 'text-purple-400 bg-purple-900/40',    icon: '⚡' },
  dancehall_general: { label: 'Dancehall General',  color: 'text-orange-400 bg-orange-900/40',    icon: '🏆' },
  legend:            { label: 'Legend',             color: 'text-yellow-400 bg-yellow-900/40',    icon: '👑' },
};

export function RankBadge({ rank = 'corner_cypher' }: { rank?: string }) {
  const r = RANKS[rank] ?? RANKS.corner_cypher;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${r.color}`}>
      {r.icon} {r.label}
    </span>
  );
}
