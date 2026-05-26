import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { liveGuard } from '../../store/liveGuard';
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

  const navigate = useNavigate();
  const [showNavWarning, setShowNavWarning] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  const isLive = phase === 'live';
  const isBusy = ['creating', 'getting_token', 'connecting', 'publishing', 'ending'].includes(phase);

  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'music',
    shouldRecord: false,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const [viewerCount, setViewerCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);

  const [isEndingToLeave, setIsEndingToLeave] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const clashRoomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Refs used by timers / cleanup to avoid stale closures
  const isMicOnRef = useRef(isMicOn);
  const isCameraOnRef = useRef(isCameraOn);
  const streamDataRef = useRef(streamData);
  const phaseRef = useRef(phase);
  const inactivityCountRef = useRef(0);
  const inactivityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // Keep refs in sync with state so interval callbacks aren't stale
  useEffect(() => { isMicOnRef.current = isMicOn; inactivityCountRef.current = 0; }, [isMicOn]);
  useEffect(() => { isCameraOnRef.current = isCameraOn; inactivityCountRef.current = 0; }, [isCameraOn]);
  useEffect(() => { streamDataRef.current = streamData; }, [streamData]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // 5-minute inactivity auto-end (both mic AND camera must be off to count)
  useEffect(() => {
    if (!isLive) {
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
      inactivityCountRef.current = 0;
      return;
    }
    inactivityCountRef.current = 0;
    inactivityTimerRef.current = setInterval(async () => {
      if (!isMicOnRef.current && !isCameraOnRef.current) {
        inactivityCountRef.current++;
        if (inactivityCountRef.current === 9) {
          toast('Your stream will auto-end in 30 seconds — mic and camera have been off for 4.5 minutes.', {
            icon: '⚠️', duration: 28000,
          });
        } else if (inactivityCountRef.current >= 10) {
          clearInterval(inactivityTimerRef.current!);
          inactivityTimerRef.current = null;
          toast.error('Stream ended automatically after 5 minutes of inactivity.');
          const sd = streamDataRef.current;
          if (sd?._id) {
            try { await endStreamApi(sd._id); } catch {}
            roomRef.current?.disconnect();
            roomRef.current = null;
            socketService.removeAllStreamListeners();
            socketService.leaveStream(sd._id);
            socketService.disconnect();
          }
          setPhase('idle');
          setStreamData(null);
          setLiveSince(null);
          setElapsedTime('0:00');
          setLiveKitConnected(false);
          setMessages([]);
          setViewerCount(0);
        }
      } else {
        inactivityCountRef.current = 0;
      }
    }, 30_000);
    return () => {
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    };
  }, [isLive]);

  // Warn on browser tab close / refresh while live
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLive) { e.preventDefault(); (e as any).returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isLive]);

  // Intercept browser back/forward while live — show the warning modal instead
  useEffect(() => {
    if (!isLive) return;
    // Push a dummy state so popstate fires on back press
    window.history.pushState({ liveGuard: true }, '');
    const onPopState = () => {
      if (isLive) {
        // Push the guard state again so the URL doesn't change
        window.history.pushState({ liveGuard: true }, '');
        setShowNavWarning(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isLive]);

  // Attach / detach opponent video track to the split-screen video element
  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el || !remoteVideoTrack) return;
    remoteVideoTrack.attach(el);
    return () => { remoteVideoTrack.detach(el); };
  }, [remoteVideoTrack]);

  // Attach / detach opponent audio track
  useEffect(() => {
    if (!remoteAudioTrack) return;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    remoteAudioTrack.attach(el);
    return () => { remoteAudioTrack.detach(el); el.remove(); };
  }, [remoteAudioTrack]);

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
      // Fallback to VGA for tablets / front cameras that can't do 720p
      try {
        const tracks = await createLocalTracks({ audio: true, video: { width: 640, height: 480 } });
        localTracksRef.current = tracks;
        const videoTrack = tracks.find((t) => t.kind === 'video');
        if (videoTrack && videoRef.current) videoTrack.attach(videoRef.current);
        setIsPreviewActive(true);
      } catch {
        toast.error('Could not access camera or microphone.');
      }
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

  // Start camera preview immediately so artist can see themselves before going live
  useEffect(() => {
    startPreview();
    return () => {
      stopPreview();
      liveGuard.clear();
      const sd = streamDataRef.current;
      const livePhases: StreamPhase[] = ['live', 'publishing', 'connecting'];
      if (sd?._id && livePhases.includes(phaseRef.current)) {
        // Artist navigated away while live — end the stream on the backend so it
        // doesn't stay visible as "active" indefinitely.
        endStreamApi(sd._id).catch(() => {});
      }
      roomRef.current?.disconnect();
      roomRef.current = null;
      socketService.removeAllStreamListeners();
      if (sd?._id) socketService.leaveStream(sd._id);
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = useCallback((streamId: string) => {
    try {
      // Clear any stale listeners first (handles retry/reconnect scenarios)
      socketService.removeAllStreamListeners();

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

            clashRoom.on(RoomEvent.TrackSubscribed, (track: any, _pub: any, participant: any) => {
              if (participant.isLocal) return;
              if (track.kind === 'video') {
                setRemoteVideoTrack(track);
                // Attach immediately if the ref is already in the DOM
                // (it is, because the <video> is always rendered during a clash)
                const el = remoteVideoRef.current;
                if (el) track.attach(el);
              } else if (track.kind === 'audio') {
                setRemoteAudioTrack(track);
              }
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

            // Catch tracks that were already subscribed before we connected
            clashRoom.remoteParticipants.forEach(p => {
              p.trackPublications.forEach(pub => {
                const track = pub.track;
                if (!pub.isSubscribed || !track) return;
                if (track.kind === 'video') {
                  setRemoteVideoTrack(track);
                  const el = remoteVideoRef.current;
                  if (el) track.attach(el);
                } else if (track.kind === 'audio') {
                  setRemoteAudioTrack(track);
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

      socketService.socket?.on('clash:reload', (data: { bonusSeconds: number; giftName: string; senderUsername: string; newExpiresAt: string }) => {
        toast(`🔄 RELOAD! ${data.senderUsername} gave you +${data.bonusSeconds}s!`, { duration: 3000 });
        setClashTurn(prev => prev ? { ...prev, turnExpiresAt: data.newExpiresAt } : prev);
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
        shouldRecord: streamSettings.shouldRecord,
      });
      setStreamData(stream);

      setPhase('getting_token');
      const tokenData = await getStreamToken(stream._id);

      setPhase('connecting');
      // No videoCaptureDefaults — let LiveKit negotiate what the device supports
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
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

      if (localTracksRef.current && localTracksRef.current.length > 0) {
        // Reuse existing preview tracks — avoids the release/reacquire race condition
        // that causes failures on tablets when the camera is released then immediately
        // re-requested with different constraints
        for (const track of localTracksRef.current) {
          await room.localParticipant.publishTrack(track);
        }
        const videoTrack = localTracksRef.current.find(t => t.kind === 'video');
        if (videoTrack && videoRef.current) videoTrack.attach(videoRef.current);
        localTracksRef.current = null; // room owns the tracks now
      } else {
        // No preview running — acquire fresh tracks with tablet-friendly fallback
        try {
          await room.localParticipant.enableCameraAndMicrophone();
        } catch {
          // Front cameras on tablets often reject high-res constraints; retry at VGA
          try {
            await room.localParticipant.setCameraEnabled(true, {
              resolution: { width: 640, height: 480, frameRate: 24 },
            });
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch {
            // Last resort: audio only
            await room.localParticipant.setMicrophoneEnabled(true);
            toast('Camera unavailable — broadcasting audio only', { icon: '🎤' });
          }
        }
        const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPub?.track && videoRef.current) camPub.track.attach(videoRef.current);
      }

      setupSocketListeners(stream._id);
      setPhase('live');
      setIsSettingsOpen(false);
      setLiveSince(Date.now());
      // Register nav guard so sidebar link clicks show the warning modal
      liveGuard.register((targetPath) => {
        pendingNavRef.current = targetPath;
        setShowNavWarning(true);
      });
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
    liveGuard.clear();
    try {
      // Remove listeners BEFORE the API call so the backend's stream:ended
      // socket broadcast doesn't trigger a duplicate toast alongside our own.
      socketService.removeAllStreamListeners();

      try {
        const result = await endStreamApi(streamData._id);
        setSummary(result);
      } catch (err) { console.error('End stream error:', err); }

      roomRef.current?.disconnect();
      roomRef.current = null;
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

  // Called when artist confirms "End Stream & Leave" in the nav-blocker modal
  const handleEndAndLeave = async () => {
    setIsEndingToLeave(true);
    try {
      await handleEndStream();
    } finally {
      setIsEndingToLeave(false);
      setShowNavWarning(false);
      if (pendingNavRef.current) {
        navigate(pendingNavRef.current);
        pendingNavRef.current = null;
      }
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
          {/* Video Feed — single view normally, split-screen during a clash */}
          <div className="premium-card !p-0 rounded-[2.5rem] bg-black border-white/5 overflow-hidden shadow-2xl relative"
            style={{ aspectRatio: activeClash ? '16/9' : '16/9' }}
          >
            {activeClash ? (
              /* ── Clash split-screen ── */
              <div className="w-full h-full flex">
                {/* Left — my feed */}
                <div className="relative flex-1 overflow-hidden border-r border-purple-500/40">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-1 rounded-lg">You</span>
                  </div>
                  <div className="absolute top-4 left-4 text-center bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl">
                    <p className="text-2xl font-black text-white tabular-nums">{clashScores.challenger}</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">pts</p>
                  </div>
                </div>

                {/* VS divider */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-8 bg-purple-500/50" />
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-2 border-purple-400/30">
                      <Swords size={16} className="text-white" />
                    </div>
                    <div className="w-px h-8 bg-purple-500/50" />
                  </div>
                </div>

                {/* Right — opponent feed.
                    The <video> is ALWAYS in the DOM so remoteVideoRef.current is set
                    by the time the TrackSubscribed useEffect runs. We toggle visibility
                    via CSS instead of conditional rendering to avoid the ref timing race. */}
                <div className="relative flex-1 overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    style={{ display: remoteVideoTrack ? 'block' : 'none' }}
                    autoPlay
                    playsInline
                  />
                  {!remoteVideoTrack && (
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={28} className="text-purple-500 animate-spin" />
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Connecting opponent...</p>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-1 rounded-lg">
                      {activeClash.opponent?.name || 'Opponent'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 text-center bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl">
                    <p className="text-2xl font-black text-white tabular-nums">{clashScores.opponent}</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">pts</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Normal single feed ── */
              <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            )}

            {/* Overlay Controls (shown in both modes) */}
            {isLive && (
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between z-20">
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

            {!isLive && phase === 'idle' && !isPreviewActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-950/80 backdrop-blur-sm">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                  <Camera size={40} className="text-zinc-700" />
                </div>
                <p className="text-sm font-semibold text-zinc-500">Starting camera preview...</p>
              </div>
            )}
          </div>

          {/* Clash info bar (shown below video when clash is active) */}
          {activeClash && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="premium-card px-8 py-5 bg-purple-600/5 border-purple-500/20 flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Swords size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-purple-400 uppercase tracking-widest">{activeClash.realmLabel || 'Live Clash'}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Earn points from fan gifts to win</p>
                </div>
              </div>
              {clashTurn && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {turnTimeLeft}s remaining
                  </span>
                </div>
              )}
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
                
                <label className="flex items-center gap-4 cursor-pointer p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-all">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={streamSettings.shouldRecord}
                      onChange={e => setStreamSettings(p => ({ ...p, shouldRecord: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 rounded-full bg-zinc-800 peer-checked:bg-emerald-500 transition-colors border border-white/10" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Record this stream</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Saves as a VOD replay for fans after you go offline</p>
                  </div>
                </label>

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

      {/* Navigation blocker — shown when artist tries to leave the page while live */}
      <AnimatePresence>
        {showNavWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <Radio className="text-rose-500" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You're still live!</h2>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                Leaving this page won't end your stream, but you'll lose the control panel.
                End the stream now or go back and keep broadcasting.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEndAndLeave}
                  disabled={isEndingToLeave}
                  className="w-full h-14 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  {isEndingToLeave ? (
                    <><Loader2 size={18} className="animate-spin" /> Ending…</>
                  ) : (
                    'End Stream & Leave'
                  )}
                </button>
                <button
                  onClick={() => setShowNavWarning(false)}
                  disabled={isEndingToLeave}
                  className="w-full h-14 bg-zinc-950 hover:bg-zinc-800 text-white border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-60"
                >
                  Stay Live
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
