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
  Volume2,
  Globe,
  Target,
  Cpu,
  Layers,
  Database,
  Save,
  Info,
  Waves,
  Wifi as WifiIcon,
  LayoutGrid,
  ChevronDown,
  Shield,
  Camera,
  VolumeX,
  Volume1,
  Activity,
  Plus,
  ArrowUpRight,
  Disc,
  MoreVertical
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
  idle: 'Ready to Stream',
  creating: 'Creating stream...',
  getting_token: 'Authenticating...',
  connecting: 'Connecting to server...',
  publishing: 'Starting broadcast...',
  live: 'Live Broadcast',
  ending: 'Ending stream...',
  error: 'Stream error',
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

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
        const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '';
        setArtistName(name);
        setStreamSettings((prev) => ({
          ...prev,
          title: prev.title || (name ? `${name} Live` : ''),
        }));
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStreamSettings((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!liveSince) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - liveSince) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsedTime(h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`);
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
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const startPreview = useCallback(async () => {
    try {
      const tracks = await createLocalTracks({ audio: true, video: { resolution: VideoPresets.h720.resolution } });
      localTracksRef.current = tracks;
      const videoTrack = tracks.find((t) => t.kind === 'video');
      if (videoTrack && videoRef.current) videoTrack.attach(videoRef.current);
      setIsPreviewActive(true);
    } catch {
      toast.error('Could not access camera or microphone.');
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
        toast.success(`Gift: ${msg.giftName}!`, { icon: '🎁' });
      });
      socketService.onViewerJoined((data) => setViewerCount(data.currentViewers));
      socketService.onViewerLeft((data) => setViewerCount(data.currentViewers));
      socketService.onStreamEnded(() => toast('Stream ended'));
      
      socketService.onClashInvitation((data) => {
        toast((t) => (
          <div className="premium-card p-6 flex items-center gap-6 bg-zinc-950 border-white/10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
               <Swords className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">New Challenge</p>
              <p className="text-sm font-bold text-white">{data.challenger.name} challenged you to a clash!</p>
              <p className="text-[10px] text-zinc-600 font-medium mt-1">{data.duration / 60} minutes</p>
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
                className="h-10 px-6 bg-emerald-500 text-black text-xs font-bold rounded-xl"
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
                className="h-10 px-6 bg-zinc-900 text-zinc-400 text-xs font-bold rounded-xl border border-white/5"
              >
                Reject
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
        toast.success('Clash started!');

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
                const localCam = new LocalVideoTrack(camPub.track.mediaStreamTrack.clone());
                await clashRoom.localParticipant.publishTrack(localCam, { source: Track.Source.Camera });
              }
              if (micPub?.track?.mediaStreamTrack) {
                const localMic = new LocalAudioTrack(micPub.track.mediaStreamTrack.clone());
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
            console.warn('[Clash] Room connection failed:', err);
          }
        }
      });

      socketService.onClashScoreUpdate((data) => {
        setClashScores({ challenger: data.challengerScore, opponent: data.opponentScore });
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
          toast.success('Victory!', { icon: <Trophy size={18} className="text-emerald-500" /> });
        } else if (data.winnerId) {
          toast.error('Clash ended.');
        } else {
          toast('It was a draw.');
        }
      });

      socketService.onClashRejected(() => {
        toast.error('The challenge was declined.');
      });

      socketService.joinStream(streamId);
    } catch (err) {
      console.warn('[Socket] Setup failed:', err);
      toast.error('Chat connection lost.');
    }
  }, [streamData]);

  const handleStartStream = async () => {
    if (!streamSettings.title.trim()) {
      toast.error('Please enter a stream title');
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

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setLiveKitConnected(state === ConnectionState.Connected);
      });
      room.on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication) => {
        if (pub.track?.kind === 'video' && videoRef.current) pub.track.attach(videoRef.current);
      });

      await room.connect(tokenData.url, tokenData.token);

      setPhase('publishing');
      await room.localParticipant.enableCameraAndMicrophone();

      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camPub?.track && videoRef.current) {
        camPub.track.attach(videoRef.current);
      }

      setupSocketListeners(stream._id);
      setPhase('live');
      setIsSettingsOpen(false);
      setLiveSince(Date.now());
      toast.success('Stream started.');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to start stream';
      setPhase('error');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const handleEndStream = async () => {
    if (!streamData?._id) return;
    setPhase('ending');
    try {
      try {
        const result = await endStreamApi(streamData._id);
        setSummary(result);
      } catch (err) { console.error('End stream error:', err); }

      roomRef.current?.disconnect();
      roomRef.current = null;
      socketService.removeAllStreamListeners();
      socketService.leaveStream(streamData._id);
      socketService.disconnect();

      if (!summary) setPhase('idle');
      
      setMessages([]);
      setViewerCount(0);
      setGiftCount(0);
      setLiveSince(null);
      setElapsedTime('0:00');
      setLiveKitConnected(false);
      toast.success('Stream ended.');
    } catch (error: unknown) {
      toast.error('Failed to end stream properly.');
      setPhase('idle');
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    } catch (err) { console.error('Mic toggle error:', err); }
  };

  const toggleCamera = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (err) { console.error('Camera toggle error:', err); }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamData?._id) return;
    socketService.sendChat(streamData._id, newMessage.trim());
    setNewMessage('');
  };

  const handleCopyLink = () => {
    if (!streamData?._id) return;
    const url = `${window.location.origin}/share/stream/${streamData._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    if (!streamData?._id) return;
    const url = `${window.location.origin}/share/stream/${streamData._id}`;
    const text = `I'm live on Lugmatic! Watch me now: ${streamSettings.title}`;
    let shareUrl = '';
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    else if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Live Studio</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Broadcast your music, engage with fans, and clash with other artists.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isLive && (
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="h-14 px-8 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Share2 size={18} />
                Share Stream
              </button>
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-full right-0 mt-4 w-60 bg-zinc-900 rounded-3xl border border-white/10 p-3 shadow-2xl z-40"
                  >
                    <div className="px-5 py-3 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Share</p>
                    </div>
                    <div className="p-1 space-y-1">
                      {['twitter', 'facebook', 'whatsapp'].map((p) => (
                        <button key={p} onClick={() => handleSocialShare(p as any)} className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-xs font-bold capitalize text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                           {p}
                        </button>
                      ))}
                      <button onClick={handleCopyLink} className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-xs font-bold text-emerald-500 hover:bg-emerald-500/5 transition-all">
                         {copied ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {!isLive && !isBusy && phase !== 'error' && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="h-14 px-10 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 border border-white/10"
            >
              <Plus size={20} />
              Start Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Active Stream Info */}
      {(isLive || phase === 'ending') && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="premium-card p-8 border-emerald-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-10 flex-wrap">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" />
                 <h2 className="text-xl font-bold text-white uppercase tracking-tight">Broadcasting Live</h2>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Duration</span>
                  <span className="text-lg font-bold text-white tabular-nums">{elapsedTime}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Viewers</span>
                  <span className="text-lg font-bold text-white tabular-nums">{viewerCount}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Status</span>
                  <span className={`text-lg font-bold ${liveKitConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {liveKitConnected ? 'Stable' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEndStream}
              disabled={phase === 'ending'}
              className="h-14 px-8 bg-rose-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-rose-500 transition-all flex items-center gap-3"
            >
              {phase === 'ending' ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
              End Stream
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Video Feed */}
          <div className="premium-card !p-0 aspect-video rounded-[2.5rem] bg-black border-white/5 overflow-hidden shadow-2xl relative">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Overlay Controls */}
            {isLive && (
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={toggleMic} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-rose-600 text-white'}`}>
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button onClick={toggleCamera} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${isCameraOn ? 'bg-white/10 text-white' : 'bg-rose-600 text-white'}`}>
                    {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsChallengeModalOpen(true)}
                    disabled={!!activeClash}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${activeClash ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'}`}
                    title="Challenge another artist"
                  >
                    <Swords size={20} />
                  </button>
                </div>
                <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 flex items-center gap-3">
                   <Users size={16} className="text-white/60" />
                   <span className="text-xs font-bold text-white">{viewerCount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {!isLive && phase === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-950/60 backdrop-blur-sm">
                 <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                    <Radio size={40} className="text-zinc-700" />
                 </div>
                 <p className="text-sm font-semibold text-zinc-500">Preview active. Ready to broadcast.</p>
              </div>
            )}
          </div>

          {/* Clash Banner if active */}
          {activeClash && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="premium-card p-10 bg-purple-600/10 border-purple-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                   <Swords className="text-black" size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">Live Clash: {activeClash.realmLabel}</h3>
                   <p className="text-sm text-zinc-400 font-medium">Earn points from fans to win the clash!</p>
                </div>
              </div>
              <div className="flex items-center gap-12">
                 <div className="text-center">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Score</p>
                    <p className="text-4xl font-bold text-white tabular-nums">{clashScores.challenger}</p>
                 </div>
                 <div className="text-2xl font-bold text-purple-500 italic">VS</div>
                 <div className="text-center">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Opponent</p>
                    <p className="text-4xl font-bold text-white tabular-nums">{clashScores.opponent}</p>
                 </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar: Chat & Gifts */}
        <div className="space-y-8 h-full flex flex-col">
          <div className="premium-card flex-1 !p-0 flex flex-col border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
             <div className="p-6 border-b border-white/5 bg-zinc-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <MessageSquare size={18} className="text-emerald-500" />
                   <h3 className="text-sm font-bold text-white">Live Chat</h3>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase">{messages.length}</span>
                </div>
             </div>
             
             <div ref={chatRef} className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar bg-black/10">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                     <MessageSquare size={40} className="mb-4" />
                     <p className="text-xs font-medium">Chat is silent. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-2xl border ${msg.type === 'gift_received' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5'}`}
                    >
                      <p className="text-xs font-bold text-emerald-500 mb-1">{msg.username}</p>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">{msg.message}</p>
                      {msg.type === 'gift_received' && (
                        <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-lg w-fit">
                           <Gift size={12} className="text-emerald-500" />
                           <span className="text-[10px] font-bold text-emerald-500">Sent {msg.giftName}</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
             </div>

             <form onSubmit={handleSendMessage} className="p-6 bg-zinc-950/40 border-t border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isLive}
                    placeholder={isLive ? "Send a message..." : "Chat inactive"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-700"
                  />
                  <button type="submit" disabled={!isLive} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors">
                    <Send size={18} />
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl premium-card p-12 border-white/5 shadow-[0_50px_150px_rgba(0,0,0,1)]"
            >
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <div className="mb-10">
                 <h2 className="text-3xl font-bold text-white mb-2">Stream Configuration</h2>
                 <p className="text-zinc-500">Set up your broadcast details before going live.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Stream Title</label>
                  <input
                    type="text"
                    name="title"
                    value={streamSettings.title}
                    onChange={handleSettingsChange}
                    placeholder="E.g. Sunday Night Session"
                    className="w-full h-14 px-6 bg-zinc-950 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    name="description"
                    value={streamSettings.description}
                    onChange={handleSettingsChange}
                    placeholder="Tell your fans what to expect..."
                    rows={4}
                    className="w-full p-6 bg-zinc-950 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                  />
                </div>
                
                <button
                  onClick={handleStartStream}
                  className="w-full h-16 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
                >
                  Confirm and Start
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <ChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        currentStreamId={streamData?._id || ''}
      />
    </div>
  );
}
