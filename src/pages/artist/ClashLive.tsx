import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  AudioTrack,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, SkipForward } from 'lucide-react';

import toast from 'react-hot-toast';
import clashService, { ClashResponse, ClashTokenResponse } from '../../services/clashService';
import socketService from '../../services/socketService';
import { getFullImageUrl } from '../../services/api';
import { RootState } from '../../store';

const REALM_STYLES: Record<string, { bg: string; accent: string; label: string }> = {
  fire:      { bg: 'from-red-950 via-black to-orange-950',    accent: 'text-orange-400 border-orange-500',  label: '🔥 Fire' },
  ice:       { bg: 'from-blue-950 via-black to-cyan-950',     accent: 'text-cyan-400 border-cyan-500',      label: '❄️ Ice' },
  reggae:    { bg: 'from-green-950 via-black to-yellow-950',  accent: 'text-yellow-400 border-yellow-500',  label: '🌴 Reggae' },
  dancehall: { bg: 'from-purple-950 via-black to-pink-950',   accent: 'text-pink-400 border-pink-500',      label: '🎵 Dancehall' },
  hiphop:    { bg: 'from-zinc-950 via-black to-zinc-800',     accent: 'text-white border-white/30',         label: '🎤 Hip Hop' },
  rnb:       { bg: 'from-purple-950 via-black to-violet-950', accent: 'text-purple-400 border-purple-500',  label: '💜 R&B' },
  afrobeats: { bg: 'from-yellow-950 via-black to-red-950',    accent: 'text-yellow-400 border-yellow-500',  label: '🥁 Afrobeats' },
};

interface TurnState {
  currentTurn: string;
  turnExpiresAt: string;
  turnsTaken: number;
  maxTurns: number;
}

interface SplitViewProps {
  clash: ClashResponse;
  token: ClashTokenResponse;
  scores: { challenger: number; opponent: number };
  clashTurn: TurnState | null;
  realm: string;
  clashId: string;
  myArtistId: string;
}

function SplitView({ clash, token, scores, clashTurn, realm, clashId, myArtistId }: SplitViewProps) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone], { onlySubscribed: false });
  const style = REALM_STYLES[realm] ?? REALM_STYLES.fire;

  const challengerTracks = tracks.filter(
    t => t.participant.identity === token.challengerUserId && t.source === Track.Source.Camera
  );
  const opponentTracks = tracks.filter(
    t => t.participant.identity === token.opponentUserId && t.source === Track.Source.Camera
  );
  const audioTracks = tracks.filter(t => t.source === Track.Source.Microphone);

  const total = (scores.challenger + scores.opponent) || 1;
  const challengerPct = Math.round((scores.challenger / total) * 100);

  const isChallengerTurn = clashTurn?.currentTurn === token.challengerUserId;
  const isOpponentTurn = clashTurn?.currentTurn === token.opponentUserId;

  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  useEffect(() => {
    if (!clashTurn) return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(clashTurn.turnExpiresAt).getTime() - Date.now()) / 1000));
      setTurnTimeLeft(left);
    }, 1000);
    return () => clearInterval(tick);
  }, [clashTurn]);

  const isMyTurn =
    (clash.challenger._id === myArtistId && isChallengerTurn) ||
    (clash.opponent._id === myArtistId && isOpponentTurn);

  const handlePassTurn = async () => {
    try {
      await clashService.passTurn(clashId);
      toast.success('Turn passed');
    } catch {
      toast.error('Failed to pass turn');
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-gradient-to-br ${style.bg}`}>
      {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}

      {/* Top half — Challenger */}
      <div className={`relative flex-1 overflow-hidden transition-all duration-300 ${isChallengerTurn ? 'ring-4 ring-emerald-500 ring-inset' : 'opacity-75 grayscale-[40%]'}`}>
        {isChallengerTurn && clashTurn && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur border border-emerald-500/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold text-xs uppercase tracking-widest">Active · {turnTimeLeft}s</span>
          </div>
        )}
        {challengerTracks.length > 0 ? (
          <VideoTrack trackRef={challengerTracks[0]} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/60">
            <div className="text-center">
              <img
                src={clash.challenger.image ? getFullImageUrl(clash.challenger.image) : '/default-avatar.png'}
                alt={clash.challenger.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white/10"
              />
              <p className="text-white/60 text-sm">Connecting…</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
          <span className="text-white text-xs font-bold">{clash.challenger.name}</span>
          <span className={`text-xs font-black ${style.accent.split(' ')[0]}`}>{scores.challenger}</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="relative flex-none h-12 bg-black flex items-center px-4 gap-3">
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            animate={{ width: `${challengerPct}%` }}
            transition={{ type: 'spring', stiffness: 120 }}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950/80 rounded-full border border-white/10">
          <Swords className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`text-xs font-bold ${style.accent.split(' ')[0]}`}>{style.label}</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden rotate-180">
          <motion.div
            className="h-full bg-gradient-to-r from-white/40 to-white/20"
            animate={{ width: `${100 - challengerPct}%` }}
            transition={{ type: 'spring', stiffness: 120 }}
          />
        </div>
      </div>

      {/* Bottom half — Opponent */}
      <div className={`relative flex-1 overflow-hidden transition-all duration-300 ${isOpponentTurn ? 'ring-4 ring-emerald-500 ring-inset' : 'opacity-75 grayscale-[40%]'}`}>
        {isOpponentTurn && clashTurn && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur border border-emerald-500/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold text-xs uppercase tracking-widest">Active · {turnTimeLeft}s</span>
          </div>
        )}
        {opponentTracks.length > 0 ? (
          <VideoTrack trackRef={opponentTracks[0]} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/60">
            <div className="text-center">
              <img
                src={clash.opponent.image ? getFullImageUrl(clash.opponent.image) : '/default-avatar.png'}
                alt={clash.opponent.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white/10"
              />
              <p className="text-white/60 text-sm">Connecting…</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
          <span className="text-white text-xs font-bold">{clash.opponent.name}</span>
          <span className="text-xs font-black text-white/60">{scores.opponent}</span>
        </div>
      </div>

      {/* Pass turn button — only shown when it's the artist's turn */}
      <AnimatePresence>
        {isMyTurn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handlePassTurn}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-full shadow-2xl shadow-emerald-900/50 hover:bg-emerald-400 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Pass Turn
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClashLive() {
  const { clashId } = useParams<{ clashId: string }>();
  const navigate = useNavigate();

  const [clash, setClash] = useState<ClashResponse | null>(null);
  const [tokenData, setTokenData] = useState<ClashTokenResponse | null>(null);
  const [scores, setScores] = useState({ challenger: 0, opponent: 0 });
  const [clashTurn, setClashTurn] = useState<TurnState | null>(null);
  const [realm, setRealm] = useState('fire');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tokenRef = useRef<ClashTokenResponse | null>(null);
  const clashRef = useRef<ClashResponse | null>(null);
  const joinedStreams = useRef<string[]>([]);

  const myArtistId = useSelector((state: RootState) => state.auth.user?.artistId ?? '');

  useEffect(() => {
    if (!clashId) return;

    const load = async () => {
      try {
        const [clashData, token] = await Promise.all([
          clashService.getClashDetails(clashId),
          clashService.getClashToken(clashId),
        ]);

        if (clashData.status !== 'active') {
          setError(clashData.status === 'ended' ? 'This clash has ended' : 'Clash is not active yet');
          return;
        }

        clashRef.current = clashData;
        tokenRef.current = token;
        setClash(clashData);
        setTokenData(token);
        setScores({ challenger: clashData.challengerScore, opponent: clashData.opponentScore });
        setRealm(clashData.realm ?? 'fire');

        // Join socket rooms
        socketService.joinClash(clashId);
        const streamIds: string[] = [];
        if (clashData.challengerStream) streamIds.push(clashData.challengerStream);
        if (clashData.opponentStream && clashData.opponentStream !== clashData.challengerStream) {
          streamIds.push(clashData.opponentStream);
        }
        streamIds.forEach(id => socketService.joinStream(id));
        joinedStreams.current = streamIds;

        const handleScore = (data: any) => {
          setScores({ challenger: data.challengerScore, opponent: data.opponentScore });
        };
        const handleRealm = (data: any) => setRealm(data.realm);
        const handleTurn = (data: any) => {
          const t = tokenRef.current;
          const c = clashRef.current;
          if (!t || !c) return;
          const normalizedTurn =
            data.currentTurn?.toString() === c.challenger._id
              ? t.challengerUserId
              : t.opponentUserId;
          setClashTurn({
            currentTurn: normalizedTurn,
            turnExpiresAt: data.turnExpiresAt,
            turnsTaken: data.turnsTaken,
            maxTurns: data.maxTurns,
          });
        };
        const handleEnded = (data: any) => {
          toast.success(data.winnerId ? 'Clash ended — winner declared!' : 'Clash ended in a draw!');
          setTimeout(() => navigate('/artist/clashes'), 3000);
        };

        socketService.onClashScoreUpdate(handleScore);
        socketService.onClashTurnChanged(handleTurn);
        socketService.onClashEnded(handleEnded);
        socketService['on']('clash:realm-changed', handleRealm);

        return () => {
          socketService.off('clash:score-update', handleScore);
          socketService.off('clash:turn-changed', handleTurn);
          socketService.off('clash:ended', handleEnded);
          socketService.off('clash:realm-changed', handleRealm);
          joinedStreams.current.forEach(id => socketService.leaveStream(id));
          socketService.leaveClash(clashId);
        };
      } catch (err: any) {
        setError(err?.message || 'Failed to load clash');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clashId, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-6">
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 animate-pulse tracking-widest uppercase">Joining clash…</p>
      </div>
    );
  }

  if (error || !clash || !tokenData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-6 px-8 text-center">
        <Swords className="w-16 h-16 text-zinc-700" />
        <p className="text-red-400 font-bold text-lg">{error || 'Clash not found'}</p>
        <button
          onClick={() => navigate('/artist/clashes')}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full border border-white/10 hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clashes
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate('/artist/clashes')}
          className="p-2.5 bg-black/40 backdrop-blur border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
          <Swords className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-white text-sm font-bold">
            {clash.challenger.name} vs {clash.opponent.name}
          </span>
          {clashTurn && (
            <span className="text-white/50 text-xs font-mono">
              {clashTurn.turnsTaken}/{clashTurn.maxTurns}
            </span>
          )}
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* Split screen */}
      <div className="flex-1 relative">
        <LiveKitRoom
          serverUrl={tokenData.url}
          token={tokenData.token}
          connect={true}
          audio={true}
          video={true}
          className="w-full h-full"
        >
          <SplitView
            clash={clash}
            token={tokenData}
            scores={scores}
            clashTurn={clashTurn}
            realm={realm}
            clashId={clashId!}
            myArtistId={myArtistId}
          />
        </LiveKitRoom>
      </div>
    </div>
  );
}
