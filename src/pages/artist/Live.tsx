import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Room,
  RoomEvent,
  Track,
  LocalTrackPublication,
  LocalParticipant,
  createLocalTracks,
  VideoPresets,
  ConnectionState,
  LocalVideoTrack,
  LocalAudioTrack,
} from 'livekit-client';
import {
  Radio,
  Users,
  MessageSquare,
  Gift,
  X,
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  ChevronRight,
  Swords,
  Trophy,
  Zap,
  Share2,
  Copy,
  Check,
  Play,
  Heart,
  TrendingUp,
  Settings,
  Monitor,
  Volume2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import {
  createStream,
  getStreamToken,
  endStream as endStreamApi,
  type LiveStream,
  type StreamEndSummary,
} from '../../services/liveStreamService';
import socketService, { type ChatMessage, type StreamState } from '../../services/socketService';
import apiService from '../../services/api';
import clashService from '../../services/clashService';
import ChallengeModal from '../../components/clash/ChallengeModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const inputClass = 'w-full px-5 py-4 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';
const labelClass = 'text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block italic';

// ─── Types ───────────────────────────────────────────────────────────────────

type StreamPhase =
  | 'idle'
  | 'creating'
  | 'getting_token'
  | 'connecting'
  | 'publishing'
  | 'live'
  | 'ending'
  | 'error';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

const PHASE_LABELS: Record<StreamPhase, string> = {
  idle: 'Ready',
  creating: 'Starting...',
  getting_token: 'Connecting...',
  connecting: 'Connecting...',
  publishing: 'Starting Media...',
  live: 'LIVE',
  ending: 'Ending Live...',
  error: 'Error',
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Live() {
  const [phase, setPhase] = useState<StreamPhase>('idle');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [streamData, setStreamData] = useState<LiveStream | null>(null);
  const [summary, setSummary] = useState<StreamEndSummary | null>(null);
  const [artistName, setArtistName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [liveSince, setLiveSince] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const [liveKitConnected, setLiveKitConnected] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [activeClash, setActiveClash] = useState<any>(null);
  const [clashTurn, setClashTurn] = useState<{
    currentTurn: string;
    turnExpiresAt: string;
    turnsTaken: number;
    maxTurns: number;
  } | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [clashScores, setClashScores] = useState({ challenger: 0, opponent: 0 });
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastGift, setLastGift] = useState<ChatMessage | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLive = phase === 'live';
  const isBusy = ['creating', 'getting_token', 'connecting', 'publishing', 'ending'].includes(phase);

  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'music',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const [viewerCount, setViewerCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const clashRoomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<any>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<any>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const localTracksRef = useRef<Awaited<ReturnType<typeof createLocalTracks>> | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiService.get<UserProfile>('/auth/me');
        const user = (res.data as any)?.data ?? res.data;
        const name = user?.fullName
          || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
          || '';
        setArtistName(name);
        setStreamSettings((prev) => ({
          ...prev,
          title: prev.title || (name ? `${name} Live` : ''),
        }));
      } catch {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!liveSince) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - liveSince) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsedTime(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${m}:${String(s).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [liveSince]);

  useEffect(() => {
    if (!activeClash || !clashTurn) return;
    const interval = setInterval(() => {
      const expiresAt = new Date(clashTurn.turnExpiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTurnTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeClash, clashTurn]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const startPreview = useCallback(async () => {
    try {
      const tracks = await createLocalTracks({
        audio: true,
        video: { resolution: VideoPresets.h720.resolution },
      });
      localTracksRef.current = tracks;
      const videoTrack = tracks.find((t) => t.kind === 'video');
      if (videoTrack && videoRef.current) {
        videoTrack.attach(videoRef.current);
      }
      setIsPreviewActive(true);
    } catch {
      toast.error('Could not access hardware. Check permissions.');
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (localTracksRef.current) {
      localTracksRef.current.forEach((track) => {
        track.stop();
        if (videoRef.current) track.detach(videoRef.current);
      });
      localTracksRef.current = null;
    }
    setIsPreviewActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopPreview();
      roomRef.current?.disconnect();
      socketService.removeAllStreamListeners();
      if (streamData?._id) socketService.leaveStream(streamData._id);
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = useCallback((streamId: string) => {
    try {
      socketService.onStreamState((state: StreamState) => {
        setViewerCount(state.currentViewers);
        if (state.recentMessages) setMessages(state.recentMessages);
      });
      socketService.onChatMessage((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });
      socketService.onGiftReceived((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
        setGiftCount((prev) => prev + 1);
        setTotalCoins((prev) => prev + (msg.giftValue || 0));
        setLastGift(msg);
        setTimeout(() => setLastGift(null), 4000);
        toast.success(`Gift received: ${msg.giftName}!`, { icon: '🎁' });
      });
      socketService.onViewerJoined((data) => setViewerCount(data.currentViewers));
      socketService.onViewerLeft((data) => setViewerCount(data.currentViewers));
      socketService.onStreamEnded(() => toast('Broadcast terminated'));
      socketService.onError((data) => { console.error('[Socket] Error:', data.message); });
      
      socketService.onClashInvitation((data) => {
        toast((t) => (
          <div className={`${card} p-4 flex items-center gap-4 bg-zinc-900 border-emerald-500/20`}>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic mb-1">Incoming Challenge</p>
              <p className="text-sm font-bold text-white">{data.challenger.name} challenged you to a War!</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{data.duration / 60} minutes duration</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  try {
                    await clashService.acceptClash(data.clashId);
                    toast.dismiss(t.id);
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to accept');
                  }
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/20"
              >
                Accept
              </button>
              <button
                onClick={async () => {
                  try {
                    await clashService.rejectClash(data.clashId);
                    toast.dismiss(t.id);
                  } catch (err) {}
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-lg"
              >
                Ignore
              </button>
            </div>
          </div>
        ), { duration: 15000, icon: null });
      });

      socketService.onClashStarted(async (data) => {
        setActiveClash(data);
        if (data.currentTurn) {
          setClashTurn({
            currentTurn: data.currentTurn,
            turnExpiresAt: data.turnExpiresAt,
            turnsTaken: data.turnsTaken,
            maxTurns: data.maxTurns
          });
        }
        setClashScores({ challenger: 0, opponent: 0 });
        toast.success('Clash started! Deployment active!', { icon: '🔥' });

        if (data.clashRoom?.token && data.clashRoom?.url) {
          try {
            const clashRoom = new Room();
            clashRoomRef.current = clashRoom;

            clashRoom.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
              if (participant.isLocal) return;
              if (track.kind === 'video') setRemoteVideoTrack(track);
              else if (track.kind === 'audio') setRemoteAudioTrack(track);
            });
            clashRoom.on(RoomEvent.TrackUnsubscribed, (track: any, publication: any, participant: any) => {
              if (participant.isLocal) return;
              if (track.kind === 'video') setRemoteVideoTrack(null);
              else if (track.kind === 'audio') setRemoteAudioTrack(null);
            });

            await clashRoom.connect(data.clashRoom.url, data.clashRoom.token);

            const mainRoom = roomRef.current;
            if (mainRoom) {
              const camPub = mainRoom.localParticipant.getTrackPublication(Track.Source.Camera);
              const micPub = mainRoom.localParticipant.getTrackPublication(Track.Source.Microphone);
              
              if (camPub?.track?.mediaStreamTrack) {
                const nativeCam = camPub.track.mediaStreamTrack.clone();
                const localCam = new LocalVideoTrack(nativeCam);
                await clashRoom.localParticipant.publishTrack(localCam, { source: Track.Source.Camera });
              }
              if (micPub?.track?.mediaStreamTrack) {
                const nativeMic = micPub.track.mediaStreamTrack.clone();
                const localMic = new LocalAudioTrack(nativeMic);
                await clashRoom.localParticipant.publishTrack(localMic, { source: Track.Source.Microphone });
              }
            }

            clashRoom.remoteParticipants.forEach(p => {
              p.trackPublications.forEach(pub => {
                if (pub.isSubscribed && pub.track) {
                  if (pub.track.kind === 'video') setRemoteVideoTrack(pub.track);
                  else if (pub.track.kind === 'audio') setRemoteAudioTrack(pub.track);
                }
              });
            });

          } catch (err) {
            console.warn('[Clash Room] Could not connect to shared clash room:', err);
          }
        }
      });

      socketService.onClashScoreUpdate((data) => {
        setClashScores({
          challenger: data.challengerScore,
          opponent: data.opponentScore
        });
      });

      socketService.onClashTurnChanged((data) => {
        setClashTurn({
          currentTurn: data.currentTurn,
          turnExpiresAt: data.turnExpiresAt,
          turnsTaken: data.turnsTaken,
          maxTurns: data.maxTurns
        });
      });

      socketService.onClashEnded((data) => {
        setActiveClash(null);
        setRemoteVideoTrack(null);
        clashRoomRef.current?.disconnect();
        clashRoomRef.current = null;
        const isWinner = data.winnerId === streamData?.host?._id;
        if (isWinner) {
          toast.success('Victory! Deployment Successful!', { icon: <Trophy className="h-5 w-5 text-emerald-500" />, duration: 5000 });
        } else if (data.winnerId) {
          toast.error('Mission Failed. Hostile artist secured victory.', { icon: '💀', duration: 5000 });
        } else {
          toast('Stalemate Protocol Active.', { icon: '🤝' });
        }
      });

      socketService.onClashRejected(() => {
        toast.error('Tactical challenge was declined.');
      });

      socketService.connect().on('clash:realm-changed', (data: any) => {
        setActiveClash((prev: any) => prev ? { ...prev, realm: data.realm, realmLabel: data.realmLabel } : prev);
      });

      socketService.joinStream(streamId);
    } catch (err) {
      console.warn('[Socket] Setup failed:', err);
      toast.error('Live chat offline — check uplink status.', { duration: 8000 });
    }
  }, []);

  const handleStartStream = async () => {
    if (!streamSettings.title.trim()) {
      toast.error('Provide broadcast identifier (title)');
      return;
    }
    setErrorMsg('');
    try {
      setPhase('creating');
      const stream = await createStream({
        title: streamSettings.title,
        description: streamSettings.description,
        category: streamSettings.category || 'music',
        chatEnabled: true,
        giftsEnabled: true,
      });
      setStreamData(stream);

      setPhase('getting_token');
      const tokenData = await getStreamToken(stream._id);

      stopPreview();

      setPhase('connecting');
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
      });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => { setLiveKitConnected(false); });
      room.on(RoomEvent.Connected, () => { setLiveKitConnected(true); });
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setLiveKitConnected(state === ConnectionState.Connected);
      });
      room.on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication, participant: LocalParticipant) => {
        if (pub.track?.kind === 'video' && videoRef.current) {
          pub.track.attach(videoRef.current);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (participant.isLocal) return;
        if (track.kind === Track.Kind.Video) {
          setRemoteVideoTrack(track);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (participant.isLocal) return;
        if (track.kind === Track.Kind.Video) {
          setRemoteVideoTrack(null);
        }
      });

      await room.connect(tokenData.url, tokenData.token);

      setPhase('publishing');
      await room.localParticipant.enableCameraAndMicrophone();

      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camPub?.track && videoRef.current) {
        camPub.track.attach(videoRef.current);
      } else if (room.localParticipant.videoTrackPublications.size > 0 && videoRef.current) {
        const track = Array.from(room.localParticipant.videoTrackPublications.values())[0]?.track;
        if (track) track.attach(videoRef.current);
      }

      setupSocketListeners(stream._id);

      setPhase('live');
      setIsSettingsOpen(false);
      setSummary(null);
      setLiveSince(Date.now());
      toast.success('System Live. Broadast active.');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Uplink synchronization failed';
      setPhase('error');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const handleEndStream = async () => {
    if (!streamData?._id) return;
    setPhase('ending');
    try {
      let result;
      try {
        result = await endStreamApi(streamData._id);
        setSummary(result);
      } catch (apiErr) {
        console.error('End stream API error:', apiErr);
        // Even if API fails (e.g. 401), we should still clean up local state
        toast.error('Failed to sync final stream data. Closing connection.');
      }

      roomRef.current?.disconnect();
      roomRef.current = null;

      socketService.removeAllStreamListeners();
      socketService.leaveStream(streamData._id);
      socketService.disconnect();

      if (!summary && !result) {
        setPhase('idle');
      }
      
      setMessages([]);
      setViewerCount(0);
      setGiftCount(0);
      setLiveSince(null);
      setElapsedTime('0:00');
      setLiveKitConnected(false);
      toast.success('Broadcast ended.');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Deactivation failed';
      toast.error(errMsg);
      setPhase('idle');
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    } catch (err) { console.error('Toggle mic error:', err); }
  };

  const toggleCamera = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (err) { console.error('Toggle camera error:', err); }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamData?._id) return;
    socketService.sendChat(streamData._id, newMessage.trim());
    setNewMessage('');
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setStreamSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openSettings = () => {
    if (!isPreviewActive && !isLive) startPreview();
    setIsSettingsOpen(true);
  };

  const handleCopyLink = () => {
    if (!streamData?._id) return;
    const url = `https://lugmaticmusic.com/stream/${streamData._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Signal link extracted');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    if (!streamData?._id) return;
    const url = `https://lugmaticmusic.com/stream/${streamData._id}`;
    const text = `System live on Lugmatic. Syncing now: ${streamSettings.title}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">

      {/* ── Branded HUD Header ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Radio className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Live Dashboard</p>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Go Live <span className="text-zinc-600">/</span> Session</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium italic">Start your live broadcast and connect with fans.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          {isLive && (
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-white/10"
              >
                <Share2 className="h-4 w-4" />
                Signal Sync
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 12 }}
                      className={`${card} absolute top-full right-0 mt-3 w-56 shadow-2xl z-40 overflow-hidden border-emerald-500/20`}
                    >
                      <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Global Protocol</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {[
                          { id: 'twitter', label: 'X Array', icon: 'X', color: 'bg-zinc-950' },
                          { id: 'facebook', label: 'Meta Net', icon: 'M', color: 'bg-blue-600' },
                          { id: 'whatsapp', label: 'Secure P2P', icon: 'S', color: 'bg-emerald-600' }
                        ].map((plat) => (
                          <button
                            key={plat.id}
                            onClick={() => handleSocialShare(plat.id as any)}
                            className="w-full px-4 py-2.5 text-left text-[11px] font-black text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl flex items-center gap-4 uppercase tracking-widest transition-all"
                          >
                            <div className={`w-6 h-6 ${plat.color} rounded-lg flex items-center justify-center`}>
                              <span className="text-white text-[10px] font-black italic">{plat.icon}</span>
                            </div>
                            {plat.label}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 border-t border-zinc-100 dark:border-white/5">
                        <button
                          onClick={handleCopyLink}
                          className="w-full px-4 py-3 text-left text-[11px] font-black text-emerald-500 hover:bg-emerald-500/5 rounded-xl flex items-center gap-4 uppercase tracking-widest transition-all"
                        >
                          <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </div>
                          {copied ? 'Copied' : 'Extract URL'}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {!isLive && !isBusy && phase !== 'error' && (
            <button
              onClick={openSettings}
              className="flex items-center gap-3 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="h-4.5 w-4.5 fill-current" />
              Go Live
            </button>
          )}
        </div>
      </div>

      {/* ── Active Live HUD Banner ── */}
      {(isLive || phase === 'ending') && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between bg-zinc-950 text-white rounded-2xl px-8 py-5 shadow-2xl border border-rose-500/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-8 flex-wrap relative z-10">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
               <span className="font-black text-base italic tracking-tighter uppercase">Signal Active</span>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Duration</span>
                <span className="flex items-center gap-2 text-xs font-bold tracking-widest tabular-nums text-white">
                  <Clock className="h-3.5 w-3.5 text-rose-500" />
                  {elapsedTime}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Viewers</span>
                <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-white">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  {viewerCount} SYNCED
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Uplink</span>
                <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                  {liveKitConnected ? (
                    <><Wifi className="h-3.5 w-3.5 text-emerald-500" /> Secure</>
                  ) : (
                    <><WifiOff className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Lossy</>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleEndStream}
            disabled={phase === 'ending'}
            className="mt-4 sm:mt-0 flex items-center gap-3 px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95"
          >
            {phase === 'ending' ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
            End Live
          </button>
        </motion.div>
      )}

      {/* ── Combat Interface HUD ── */}
      {activeClash && isLive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950 text-white rounded-2xl px-8 py-6 shadow-2xl border border-purple-500/30 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 opacity-50" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            {/* Challenger Score */}
            <div className="flex items-center gap-6 flex-1 justify-end">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest font-black text-purple-400 italic mb-1">Friendly Unit</p>
                <p className="text-4xl font-black italic tabular-nums tracking-tighter text-white">{clashScores.challenger}</p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 overflow-hidden shadow-2xl bg-zinc-900">
                 <img src={streamData?.host?.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover opacity-80" alt="Host" />
              </div>
            </div>

            {/* Combat Center HUD */}
            <div className="flex flex-col items-center gap-4 px-8 border-x border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Swords className="h-5 w-5 text-white" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest italic animate-pulse">Engaging Target</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{activeClash.realmLabel || 'Standard Sector'}</span>
                 </div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="h-1.5 w-48 bg-zinc-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                      initial={{ width: "50%" }}
                      animate={{ width: `${(clashScores.challenger / (clashScores.challenger + clashScores.opponent || 1)) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                 </div>
                 <div className="mt-3 flex items-center gap-4 text-xs font-black tracking-widest text-white/70 tabular-nums uppercase">
                    <span className="text-zinc-500">Timer:</span>
                    <span className="text-white bg-zinc-900 px-3 py-1 rounded-lg border border-white/5 shadow-lg">
                       {activeClash.endTime ? formatDistanceToNow(new Date(activeClash.endTime)).replace('about ', '') : '0:00'}
                    </span>
                 </div>
              </div>
            </div>

            {/* Opponent Score */}
            <div className="flex items-center gap-6 flex-1">
              <div className="w-16 h-16 rounded-full border-2 border-rose-500/30 overflow-hidden shadow-2xl bg-zinc-900">
                 <img src={activeClash.opponent?.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover opacity-80" alt="Opponent" />
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest font-black text-rose-400 italic mb-1">Hostile Signal</p>
                <p className="text-4xl font-black italic tabular-nums tracking-tighter text-white">{clashScores.opponent}</p>
              </div>
            </div>
          </div>
          
          {/* Turn HUD Overlay */}
          {clashTurn && (
            <div className="mt-6 flex items-center justify-center gap-4 py-3 bg-white/5 rounded-xl border border-white/5">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${clashTurn.currentTurn === streamData?.host?._id ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Phase:</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${clashTurn.currentTurn === streamData?.host?._id ? 'text-emerald-500' : 'text-zinc-300'}`}>
                    {clashTurn.currentTurn === streamData?.host?._id ? 'Your Initiative' : 'Opponent Deployment'}
                  </span>
               </div>
               <div className="h-4 w-px bg-white/10" />
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Phase Ends:</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white tabular-nums">{turnTimeLeft}s</span>
               </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Phase HUD Progress ── */}
      {isBusy && phase !== 'ending' && (
        <div className="flex items-center gap-4 bg-zinc-900 border border-emerald-500/30 text-emerald-500 rounded-2xl px-6 py-4 shadow-2xl">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
             <Loader2 className="animate-spin h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 italic">Sequence Status</span>
             <span className="font-black text-xs uppercase tracking-widest">{PHASE_LABELS[phase]}</span>
          </div>
        </div>
      )}

      {/* ── Critical Error HUD ── */}
      {phase === 'error' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-2xl px-6 py-5 shadow-2xl"
        >
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
             <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1 italic">Synchronization Failed</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">{errorMsg}</p>
            <button
              onClick={() => { setPhase('idle'); setErrorMsg(''); }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
            >
              Dismiss and try again
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Stream ended summary ── */}
      {summary && phase === 'idle' && (
        <div className={`${card} p-8`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Stream Ended</h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">Session metrics archived</p>
              </div>
            </div>
            <button
              onClick={() => setSummary(null)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Duration', value: formatDuration(summary.duration), color: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' },
              { label: 'Total Syncs', value: summary.totalViewers, color: 'bg-indigo-500/5 text-indigo-500 border-indigo-500/10' },
              { label: 'Peak Signal', value: summary.peakViewers, color: 'bg-purple-500/5 text-purple-500 border-purple-500/10' },
              { label: 'Fiscal Yield', value: summary.totalGiftsReceived, color: 'bg-amber-500/5 text-amber-500 border-amber-500/10' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-2xl p-6 text-center border shadow-inner`}>
                <p className="text-3xl font-black italic tracking-tighter tabular-nums mb-1">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Video + info ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Video */}
          <div className={`relative bg-gray-950 aspect-video rounded-2xl overflow-hidden shadow-sm flex flex-col`}>
            
            {/* Turn Timer Bar */}
            {activeClash && clashTurn && (
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${clashTurn.currentTurn === streamData?.host?._id ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-white font-bold text-sm tracking-wider uppercase">
                    {clashTurn.currentTurn === streamData?.host?._id ? 'Your Turn' : "Opponent's Turn"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold text-lg">{turnTimeLeft}s</span>
                  <span className="text-white/60 text-xs uppercase tracking-widest font-bold">Round {clashTurn.turnsTaken}/{clashTurn.maxTurns}</span>
                </div>
              </div>
            )}

            <div className={`flex-1 grid ${activeClash && remoteVideoTrack ? 'grid-cols-2 gap-1' : 'grid-cols-1'}`}>
              <div className={`relative w-full h-full transition-all duration-300 ${activeClash && clashTurn?.currentTurn === streamData?.host?._id ? 'ring-4 ring-green-500 ring-inset' : ''}`}>
                <video
                  ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${(isLive || isPreviewActive) ? 'block' : 'hidden'}`}
              />
              {activeClash && remoteVideoTrack && (
                <div className="absolute bottom-4 left-4 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">You</p>
                </div>
              )}
            </div>

            {activeClash && remoteVideoTrack && (
              <div className={`relative w-full h-full bg-gray-900 transition-all duration-300 ${clashTurn && clashTurn.currentTurn !== streamData?.host?._id ? 'ring-4 ring-red-500 ring-inset' : ''}`}>
                <video
                  ref={(el) => {
                    if (el && remoteVideoTrack) {
                      remoteVideoTrack.attach(el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Opponent</p>
                </div>
              </div>
            )}

            {/* Remote Audio Track */}
            {activeClash && remoteAudioTrack && (
              <audio
                ref={(el) => {
                  if (el && remoteAudioTrack) {
                    remoteAudioTrack.attach(el);
                  }
                }}
                autoPlay
              />
            )}
            </div>

            {/* Idle placeholder */}
            {phase === 'idle' && !isPreviewActive && !summary && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                  <Radio className="h-9 w-9 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-300">Ready to Stream</p>
                <p className="text-sm mt-1 text-gray-500">Click "Go Live" to set up your stream</p>
                <button
                  onClick={openSettings}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow transition-all text-sm"
                >
                  <Radio className="h-4 w-4" />
                  Go Live
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Live overlays */}
            {(isLive || phase === 'ending') && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs rounded-full">
                  <Users className="h-3 w-3" />
                  {viewerCount}
                </span>
                <span className="px-2.5 py-1 bg-black/60 text-white text-xs font-mono rounded-full">
                  {elapsedTime}
                </span>
              </div>
            )}

            {/* Preview badge */}
            {isPreviewActive && !isLive && (
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-amber-400 text-black text-xs font-bold rounded-full">
                  PREVIEW
                </span>
              </div>
            )}

            {/* Stream controls */}
            {(isLive || phase === 'ending') && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={toggleMic}
                  title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                  className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleCamera}
                  title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                  className={`p-3 rounded-full transition-colors ${isCameraOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIsChallengeModalOpen(true)}
                  disabled={!!activeClash}
                  title="Challenge another artist"
                  className={`p-3 rounded-full transition-colors ${activeClash ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'}`}
                >
                  <Swords className="h-5 w-5" />
                </button>
                <button
                  onClick={handleEndStream}
                  disabled={phase === 'ending'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors text-sm disabled:opacity-60"
                >
                  {phase === 'ending' && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  End Stream
                </button>
              </div>
            )}

            {/* TikTok-style Gift Alert Overlay */}
            <AnimatePresence>
              {lastGift && (
                <motion.div
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 20, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.8, filter: 'blur(10px)' }}
                  className="absolute bottom-24 left-0 z-50 pointer-events-none"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600/90 to-pink-500/70 backdrop-blur-md border border-white/30 p-1 pr-6 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-purple-500 overflow-hidden">
                      {lastGift.profilePicture ? (
                        <img src={lastGift.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-purple-600">{lastGift.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/90 uppercase tracking-tighter leading-none mb-1">New Gift Received!</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate max-w-[120px] drop-shadow-md">{lastGift.username}</span>
                        <span className="text-xs font-bold text-white/80">sent {lastGift.giftName}</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 20, -20, 0],
                        scale: [1, 1.4, 1.4, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="ml-3 text-3xl drop-shadow-lg"
                    >
                      🎁
                    </motion.div>
                    <div className="ml-2 px-2 py-0.5 bg-yellow-400 rounded-full text-[10px] font-black text-purple-900 shadow-sm">
                      +{lastGift.giftValue || 0}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Total Gift Counter Overlay */}
            {isLive && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 right-3 z-40"
              >
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">Total Earnings</p>
                    <motion.p 
                      key={totalCoins}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-black text-amber-400 leading-none mt-1"
                    >
                      {totalCoins.toLocaleString()} <span className="text-[10px] text-white/40 ml-0.5">COINS</span>
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Stream info card */}
          <div className={`${card} p-8`}>
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Broadcast Meta</p>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight truncate">
                  {streamData?.title || streamSettings.title || 'Untitled Stream'}
                </h2>
                <p className="text-sm text-zinc-500 mt-2 font-medium truncate">
                  {streamData?.description || streamSettings.description || 'No description set'}
                </p>
              </div>
              {(isLive || phase === 'ending') && (
                <span className="flex-shrink-0 flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl uppercase tracking-widest italic shadow-lg shadow-emerald-500/5">
                  <Wifi className="h-3.5 w-3.5" />
                  {liveKitConnected ? 'SECURE_UPLINK' : 'SYNC_LOSS_RETRY'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'Viewers', value: viewerCount, color: 'text-blue-600 bg-blue-50' },
                { icon: MessageSquare, label: 'Messages', value: messages.length, color: 'text-green-600 bg-green-50' },
                { 
                  icon: Gift, 
                  label: 'Coins', 
                  value: (
                    <motion.span
                      key={totalCoins}
                      initial={{ scale: 1.5, color: '#f59e0b' }}
                      animate={{ scale: 1, color: '#b45309' }}
                      className="inline-block"
                    >
                      {totalCoins.toLocaleString()}
                    </motion.span>
                  ), 
                  color: 'text-amber-600 bg-amber-50' 
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center overflow-hidden">
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat ── */}
        <div className={`${card} flex flex-col`} style={{ height: 'calc(100vh - 16rem)', minHeight: '420px' }}>
          <div className="px-6 py-4 border-b border-white/[0.06] bg-zinc-950/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Telemetry Stream</h3>
            </div>
            {isLive && (
              <span className="flex items-center gap-2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md uppercase tracking-widest">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {!isLive && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Chat will appear here when you're live</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={`${msg.timestamp}-${idx}`}>
                {msg.type === 'gift' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                    <span className="text-base">🎁</span>
                    <p className="text-xs font-medium text-amber-800 mt-0.5">
                      <span className="font-bold">{msg.username}</span> sent <span className="font-bold">{msg.giftName}</span>
                    </p>
                  </div>
                ) : msg.type === 'system' || msg.type === 'join' || msg.type === 'leave' ? (
                  <p className="text-xs text-gray-400 italic text-center py-0.5">{msg.message}</p>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center overflow-hidden">
                      {msg.profilePicture ? (
                        <img src={msg.profilePicture} alt={msg.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {msg.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800">{msg.username}</p>
                      <p className="text-xs text-gray-600 break-words leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isLive ? 'Type a message...' : 'Go live to chat'}
                disabled={!isLive}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!isLive || !newMessage.trim()}
                className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/[0.06] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                  {artistName ? `Initialize: ${artistName}` : 'Uplink Setup'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Configure broadcast parameters</p>
              </div>
              <button
                onClick={() => { setIsSettingsOpen(false); if (!isLive) stopPreview(); }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-8 py-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">
                  Signal Designation <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={streamSettings.title}
                  onChange={handleSettingsChange}
                  placeholder={artistName ? `${artistName} Live` : 'e.g. Protocol Alpha'}
                  className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Data Manifest</label>
                <textarea
                  name="description"
                  value={streamSettings.description}
                  onChange={handleSettingsChange}
                  rows={3}
                  placeholder="Operational notes for viewers..."
                  className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Deployment Sector</label>
                <select
                  name="category"
                  value={streamSettings.category}
                  onChange={handleSettingsChange}
                  className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="music">CORE_AUDIO</option>
                  <option value="performance">LIVE_EXECUTION</option>
                  <option value="talk">LOG_STREAM</option>
                  <option value="podcast">VOICE_ARCHIVE</option>
                  <option value="interview">INTEL_GATHERING</option>
                  <option value="listening_party">SYNC_EVENT</option>
                  <option value="q_and_a">QUERY_SESSION</option>
                  <option value="other">UNCLASSIFIED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-white/[0.06] bg-zinc-950/40">
              <button
                onClick={() => { setIsSettingsOpen(false); if (!isLive) stopPreview(); }}
                className="px-6 py-3 rounded-xl bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
              >
                Abort
              </button>
              <button
                onClick={handleStartStream}
                disabled={isBusy || !streamSettings.title.trim()}
                className="flex items-center gap-3 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/20"
              >
                {isBusy ? <Loader2 className="animate-spin h-4 w-4" /> : <Radio className="h-4 w-4" />}
                {isBusy ? PHASE_LABELS[phase] : 'Engage Signal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Challenge Modal ── */}
      <ChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        currentStreamId={streamData?._id || ''}
      />
    </div>
  );
}
