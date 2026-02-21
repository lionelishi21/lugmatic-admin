import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  LocalTrackPublication,
  LocalParticipant,
  createLocalTracks,
  VideoPresets,
  ConnectionState,
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
} from 'lucide-react';
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
  creating: 'Creating stream...',
  getting_token: 'Getting streaming token...',
  connecting: 'Connecting to live server...',
  publishing: 'Publishing camera & microphone...',
  live: 'YOU ARE LIVE',
  ending: 'Ending stream...',
  error: 'Error',
};

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const localTracksRef = useRef<Awaited<ReturnType<typeof createLocalTracks>> | null>(null);

  // ─── Fetch artist profile ─────────────────────────────────────────────
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
      } catch {
        // silently ignore
      }
    };
    fetchProfile();
  }, []);

  // ─── Elapsed timer ────────────────────────────────────────────────────
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

  // ─── Auto-scroll chat ─────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Camera preview ───────────────────────────────────────────────────
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
      toast.error('Could not access camera/microphone. Check browser permissions.');
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

  // ─── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPreview();
      roomRef.current?.disconnect();
      socketService.removeAllStreamListeners();
      if (streamData?._id) socketService.leaveStream(streamData._id);
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Socket listeners ─────────────────────────────────────────────────
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
        toast.success(`Gift received: ${msg.giftName}!`, { icon: '🎁' });
      });
      socketService.onViewerJoined((data) => setViewerCount(data.currentViewers));
      socketService.onViewerLeft((data) => setViewerCount(data.currentViewers));
      socketService.onStreamEnded(() => toast('Stream has ended'));
      socketService.onError((data) => { console.error('[Socket] Error:', data.message); });
      socketService.joinStream(streamId);
    } catch (err) {
      console.warn('[Socket] Setup failed (chat may not work):', err);
    }
  }, []);

  // ─── Start stream ─────────────────────────────────────────────────────
  const handleStartStream = async () => {
    if (!streamSettings.title.trim()) {
      toast.error('Please set a stream title');
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
        console.log('[LiveKit] Published:', pub.track?.kind, 'by', participant.identity);
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
      setSummary(null);
      setLiveSince(Date.now());
      toast.success('You are now live!');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to start stream';
      console.error('Start stream error:', error);
      setPhase('error');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  // ─── End stream ───────────────────────────────────────────────────────
  const handleEndStream = async () => {
    if (!streamData?._id) return;
    setPhase('ending');
    try {
      const result = await endStreamApi(streamData._id);
      setSummary(result);

      roomRef.current?.disconnect();
      roomRef.current = null;

      socketService.removeAllStreamListeners();
      socketService.leaveStream(streamData._id);
      socketService.disconnect();

      setPhase('idle');
      setMessages([]);
      setViewerCount(0);
      setGiftCount(0);
      setLiveSince(null);
      setElapsedTime('0:00');
      setLiveKitConnected(false);
      toast.success('Stream ended');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to end stream';
      console.error('End stream error:', error);
      toast.error(errMsg);
      setPhase('live');
    }
  };

  // ─── Toggle mic / camera ──────────────────────────────────────────────
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

  // ─── Send chat message ────────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamData?._id) return;
    socketService.sendChat(streamData._id, newMessage.trim());
    setNewMessage('');
  };

  // ─── Settings form ────────────────────────────────────────────────────
  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setStreamSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openSettings = () => {
    if (!isPreviewActive && !isLive) startPreview();
    setIsSettingsOpen(true);
  };

  // ─── Format duration ──────────────────────────────────────────────────
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-4">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Go Live</h1>
          <p className="text-sm text-gray-500 mt-0.5">Broadcast to your fans in real time</p>
        </div>
        {!isLive && !isBusy && phase !== 'error' && (
          <button
            onClick={openSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-sm transition-all"
          >
            <Radio className="h-4 w-4" />
            Go Live
          </button>
        )}
      </div>

      {/* ── Live status banner ── */}
      {isLive && (
        <div className="flex items-center justify-between bg-red-600 text-white rounded-2xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2 font-bold text-base">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1 rounded-full font-mono">
              <Clock className="h-3.5 w-3.5" />
              {elapsedTime}
            </span>
            <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1 rounded-full">
              <Users className="h-3.5 w-3.5" />
              {viewerCount} watching
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              {liveKitConnected ? (
                <><Wifi className="h-3.5 w-3.5 text-green-300" /><span className="text-green-200 text-sm">Connected</span></>
              ) : (
                <><WifiOff className="h-3.5 w-3.5 text-yellow-300" /><span className="text-yellow-200 text-sm">Reconnecting...</span></>
              )}
            </span>
          </div>
          <button
            onClick={handleEndStream}
            disabled={phase === 'ending'}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
          >
            {phase === 'ending' && <Loader2 className="animate-spin h-4 w-4" />}
            End Stream
          </button>
        </div>
      )}

      {/* ── Progress banner ── */}
      {isBusy && phase !== 'ending' && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-3">
          <Loader2 className="animate-spin h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span className="font-medium text-sm">{PHASE_LABELS[phase]}</span>
        </div>
      )}

      {/* ── Error banner ── */}
      {phase === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Failed to start stream</p>
            <p className="text-sm mt-0.5 text-red-600">{errorMsg}</p>
            <button
              onClick={() => { setPhase('idle'); setErrorMsg(''); }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
            >
              Dismiss and try again
            </button>
          </div>
        </div>
      )}

      {/* ── Stream ended summary ── */}
      {summary && phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Stream Ended</h2>
                <p className="text-xs text-gray-500">Here's how your session went</p>
              </div>
            </div>
            <button
              onClick={() => setSummary(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Duration', value: formatDuration(summary.duration), color: 'bg-green-50 text-green-700' },
              { label: 'Total Viewers', value: summary.totalViewers, color: 'bg-blue-50 text-blue-700' },
              { label: 'Peak Viewers', value: summary.peakViewers, color: 'bg-purple-50 text-purple-700' },
              { label: 'Gifts Received', value: summary.totalGiftsReceived, color: 'bg-amber-50 text-amber-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-xl p-4 text-center`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs mt-0.5 opacity-75">{label}</p>
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
          <div className="relative bg-gray-950 aspect-video rounded-2xl overflow-hidden shadow-sm">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isLive || isPreviewActive ? 'block' : 'hidden'}`}
            />

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
            {isLive && (
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
            {isLive && (
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
                  onClick={handleEndStream}
                  disabled={phase === 'ending'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors text-sm disabled:opacity-60"
                >
                  {phase === 'ending' ? <Loader2 className="animate-spin h-4 w-4" /> : 'End Stream'}
                </button>
              </div>
            )}
          </div>

          {/* Stream info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {streamData?.title || streamSettings.title || 'Untitled Stream'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {streamData?.description || streamSettings.description || 'No description set'}
                </p>
              </div>
              {isLive && (
                <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <Wifi className="h-3 w-3" />
                  {liveKitConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'Viewers', value: viewerCount, color: 'text-blue-600 bg-blue-50' },
                { icon: MessageSquare, label: 'Messages', value: messages.length, color: 'text-green-600 bg-green-50' },
                { icon: Gift, label: 'Gifts', value: giftCount, color: 'text-amber-600 bg-amber-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 'calc(100vh - 16rem)', minHeight: '420px' }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Live Chat</h3>
            </div>
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {artistName ? `Go Live as ${artistName}` : 'Go Live'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Set up your stream details</p>
              </div>
              <button
                onClick={() => { setIsSettingsOpen(false); if (!isLive) stopPreview(); }}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stream Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={streamSettings.title}
                  onChange={handleSettingsChange}
                  placeholder={artistName ? `${artistName} Live` : 'e.g. Friday Night Vibes'}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={streamSettings.description}
                  onChange={handleSettingsChange}
                  rows={3}
                  placeholder="Tell viewers what your stream is about..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  name="category"
                  value={streamSettings.category}
                  onChange={handleSettingsChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="music">Music</option>
                  <option value="performance">Live Performance</option>
                  <option value="talk">Talk Show</option>
                  <option value="podcast">Podcast</option>
                  <option value="interview">Interview</option>
                  <option value="listening_party">Listening Party</option>
                  <option value="q_and_a">Q&A</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setIsSettingsOpen(false); if (!isLive) stopPreview(); }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartStream}
                disabled={isBusy || !streamSettings.title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 transition-all"
              >
                {isBusy ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Radio className="h-4 w-4" />
                )}
                {isBusy ? PHASE_LABELS[phase] : 'Go Live'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
