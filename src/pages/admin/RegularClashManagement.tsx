import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, ChevronRight, Trophy, Clock, ChevronLeft, CheckCircle2, Video } from 'lucide-react';
import { getAdminPools, createPool, updatePoolStatus, getPool, ClashPool, RegularClashItem, REALMS } from '../../services/regularClashService';
import { format } from 'date-fns';

const STATUS_COLOR: Record<string, string> = {
  open:       'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  submission: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  voting:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  ended:      'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
};

const CLASH_STATUS_COLOR: Record<string, string> = {
  pending:  'text-yellow-400 bg-yellow-400/10',
  active:   'text-emerald-400 bg-emerald-400/10',
  voting:   'text-purple-400 bg-purple-400/10',
  ended:    'text-zinc-400 bg-zinc-400/10',
  rejected: 'text-red-400 bg-red-400/10',
};

const NEXT_STATUS: Record<string, string> = {
  open: 'submission',
  submission: 'voting',
  voting: 'ended',
};

const STATUS_ACTION: Record<string, string> = {
  open:       'Close Challenges → Start Submissions',
  submission: 'Close Submissions → Open Voting',
  voting:     'Close Voting → End Season',
};

export default function RegularClashManagement() {
  const [pools, setPools] = useState<ClashPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<ClashPool | null>(null);
  const [poolClashes, setPoolClashes] = useState<RegularClashItem[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [loadingClashes, setLoadingClashes] = useState(false);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminPools()
      .then(data => { setPools(data); })
      .catch(() => {})
      .finally(() => setLoadingPools(false));
  }, []);

  async function handleSelectPool(pool: ClashPool) {
    setSelectedPool(pool);
    setLoadingClashes(true);
    try {
      const data = await getPool(pool._id);
      setPoolClashes(data.clashes ?? []);
    } catch (_) {}
    setLoadingClashes(false);
  }

  async function handleAdvance(pool: ClashPool) {
    if (!NEXT_STATUS[pool.status]) return;
    if (!window.confirm(`Advance "${pool.title}" from ${pool.status} to ${NEXT_STATUS[pool.status]}?`)) return;
    setAdvancing(pool._id);
    setAdvanceError(null);
    try {
      const updated = await updatePoolStatus(pool._id, NEXT_STATUS[pool.status]);
      setPools(prev => prev.map(p => p._id === pool._id ? { ...p, status: updated.status } : p));
      if (selectedPool?._id === pool._id) setSelectedPool(updated);
    } catch (err: any) {
      setAdvanceError(err?.response?.data?.message || err?.message || 'Failed to advance pool status');
    }
    setAdvancing(null);
  }



  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Regular Clash</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage challenge pools and brackets</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/regular-clash-management/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm"
        >
          <Plus className="h-4 w-4" />
          Create Pool
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pool list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">Pools</h2>
          {loadingPools ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />)
          ) : pools.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No pools yet</p>
          ) : (
            pools.map(pool => (
              <div
                key={pool._id}
                onClick={() => handleSelectPool(pool)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedPool?._id === pool._id
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{pool.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[pool.status] ?? STATUS_COLOR.ended}`}>
                    {pool.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">Season {pool.season} · {pool.totalClashes} clashes</p>
                <div className="flex items-center justify-between mt-3">
                  {STATUS_ACTION[pool.status] ? (
                    <button
                      onClick={e => { e.stopPropagation(); handleAdvance(pool); }}
                      disabled={advancing === pool._id}
                      className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                    >
                      {advancing === pool._id ? 'Advancing...' : 'Advance Status →'}
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-600">Season ended</span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pool detail / clash list */}
        <div className="lg:col-span-2">
          {!selectedPool ? (
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 h-full flex items-center justify-center py-24">
              <p className="text-zinc-500 text-sm">Select a pool to view its bracket</p>
            </div>
          ) : (
            <div>
              {/* Pool phase pipeline */}
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">{selectedPool.title}</h2>
                  <button onClick={() => setSelectedPool(null)} className="text-zinc-500 hover:text-zinc-900 dark:text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {['open', 'submission', 'voting', 'ended'].map((s, i, arr) => (
                    <React.Fragment key={s}>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap ${
                        selectedPool.status === s
                          ? 'bg-yellow-500 text-black'
                          : arr.indexOf(selectedPool.status) > i
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-zinc-500'
                      }`}>
                        {s}
                      </span>
                      {i < arr.length - 1 && <span className="text-zinc-700">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                  {[
                    { label: 'Challenge deadline', date: selectedPool.challengeDeadline },
                    { label: 'Submission deadline', date: selectedPool.submissionDeadline },
                    { label: 'Voting deadline', date: selectedPool.votingDeadline },
                  ].map(item => (
                    <div key={item.label} className="bg-black/5 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-zinc-500 mb-1">{item.label}</p>
                      <p className="text-zinc-900 dark:text-white font-semibold">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {format(new Date(item.date), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
                {advanceError && (
                  <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{advanceError}</p>
                )}
                {STATUS_ACTION[selectedPool.status] && (
                  <button
                    onClick={() => { setAdvanceError(null); handleAdvance(selectedPool); }}
                    disabled={advancing === selectedPool._id}
                    className="mt-4 w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-sm"
                  >
                    {advancing === selectedPool._id ? 'Advancing...' : STATUS_ACTION[selectedPool.status]}
                  </button>
                )}
              </div>

              {/* Clash table */}
              <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Matchups ({poolClashes.length})
              </h3>
              {loadingClashes ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />)}
                </div>
              ) : poolClashes.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">No clashes in this pool</p>
              ) : (
                <div className="space-y-2">
                  {poolClashes.map(clash => (
                    <div key={clash._id} className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {clash.challenger.name} <span className="text-yellow-400">⚡</span> {clash.opponent.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CLASH_STATUS_COLOR[clash.status] ?? 'text-zinc-400'}`}>
                              {clash.status}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {clash.challengerVotes + clash.opponentVotes} votes
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {clash.giftPoints.challenger + clash.giftPoints.opponent} gift pts
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Video className={`h-3.5 w-3.5 ${clash.challengerVideo?.submittedAt ? 'text-emerald-400' : 'text-zinc-700'}`} />
                          <Video className={`h-3.5 w-3.5 ${clash.opponentVideo?.submittedAt ? 'text-emerald-400' : 'text-zinc-700'}`} />
                        </div>
                        {clash.winner && (
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>{clash.winner.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
