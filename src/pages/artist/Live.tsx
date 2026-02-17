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
  | 'creating'       // Creating stream on server
  | 'getting_token'   // Getting LiveKit token
  | 'connecting'      // Connecting to LiveKit room
  | 'publishing'      // Publishing camera & mic
  | 'live'            // Fully live
  | 'ending'          // Ending stream
  | 'error';          // Something failed

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
  // Stream state
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

  // Stream settings
  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'music',
  });

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // Stats
  const [viewerCount, setViewerCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);

  // LiveKit
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const localTracksRef = useRef<Awaited<ReturnType<typeof createLocalTracks>> | null>(null);

  // ─── Fetch artist profile on mount ───────────────────────────────────
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

  // ─── Live elapsed timer ──────────────────────────────────────────────
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

  // ─── Auto-scroll chat ──────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Camera preview ────────────────────────────────────────────────────
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
    } catch (err) {
      console.error('Failed to start camera preview:', err);
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

  // ─── Cleanup on unmount ────────────────────────────────────────────────
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

  // ─── Socket event listeners (non-blocking) ─────────────────────────────
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
      socketService.onError((data) => {
        console.error('[Socket] Error:', data.message);
      });
      socketService.joinStream(streamId);
    } catch (err) {
      // Socket failures should NOT break the live stream
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
      // Step 1: Create stream
      setPhase('creating');
      const stream = await createStream({
        title: streamSettings.title,
        description: streamSettings.description,
        category: streamSettings.category || 'music',
        chatEnabled: true,
        giftsEnabled: true,
      });
      setStreamData(stream);

      // Step 2: Get LiveKit token
      setPhase('getting_token');
      const tokenData = await getStreamToken(stream._id);

      // Step 3: Stop preview tracks
      stopPreview();

      // Step 4: Connect to LiveKit room
      setPhase('connecting');
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
      });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => {
        console.log('[LiveKit] Disconnected');
        setLiveKitConnected(false);
      });
      room.on(RoomEvent.Connected, () => {
        console.log('[LiveKit] Connected');
        setLiveKitConnected(true);
      });
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('[LiveKit] Connection state:', state);
        setLiveKitConnected(state === ConnectionState.Connected);
      });
      room.on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication, participant: LocalParticipant) => {
        if (pub.track?.kind === 'video' && videoRef.current) {
          pub.track.attach(videoRef.current);
        }
        console.log('[LiveKit] Published:', pub.track?.kind, 'by', participant.identity);
      });

      await room.connect(tokenData.url, tokenData.token);

      // Step 5: Publish camera & mic
      setPhase('publishing');
      await room.localParticipant.enableCameraAndMicrophone();

      // Attach local video
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camPub?.track && videoRef.current) {
        camPub.track.attach(videoRef.current);
      }

      // Step 6: Setup Socket.io (non-blocking)
      setupSocketListeners(stream._id);

      // Done!
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

  // ─── End stream ────────────────────────────────────────────────────────
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
      // Keep live state so user can try ending again
      setPhase('live');
    }
  };

  // ─── Toggle mic / camera ───────────────────────────────────────────────
  const toggleMic = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    } catch (err) {
      console.error('Toggle mic error:', err);
    }
  };

  const toggleCamera = async () => {
    if (!roomRef.current) return;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (err) {
      console.error('Toggle camera error:', err);
    }
  };

  // ─── Send chat message ─────────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamData?._id) return;
    socketService.sendChat(streamData._id, newMessage.trim());
    setNewMessage('');
  };

  // ─── Settings form ─────────────────────────────────────────────────────
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

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* ═══ Live Status Banner ═══ */}
      {isLive && (
        <div className="mb-4 bg-red-600 text-white rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-lg font-bold">LIVE</span>
            </span>
            <span className="flex items-center space-x-1 text-sm bg-white/20 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{elapsedTime}</span>
            </span>
            <span className="flex items-center space-x-1 text-sm bg-white/20 px-3 py-1 rounded-full">
              <Users className="h-4 w-4" />
              <span>{viewerCount} watching</span>
            </span>
            <span className="flex items-center space-x-1 text-sm">
              {liveKitConnected ? (
                <><Wifi className="h-4 w-4 text-green-300" /><span className="text-green-200">Connected</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-yellow-300" /><span className="text-yellow-200">Reconnecting...</span></>
              )}
            </span>
          </div>
          <button
            onClick={handleEndStream}
            disabled={phase === 'ending'}
            className="px-4 py-2 bg-white text-red-600 rounded-md font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center"
          >
            {phase === 'ending' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            End Stream
          </button>
        </div>
      )}

      {/* ═══ Progress / Error Banner ═══ */}
      {isBusy && phase !== 'ending' && (
        <div className="mb-4 bg-purple-600 text-white rounded-lg p-4 flex items-center space-x-3">
          <Loader2 className="animate-spin h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{PHASE_LABELS[phase]}</span>
        </div>
      )}

      {phase === 'error' && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to start stream</p>
            <p className="text-sm mt-1">{errorMsg}</p>
            <button
              onClick={() => { setPhase('idle'); setErrorMsg(''); }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
            >
              Dismiss and try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ Stream ended summary ═══ */}
      {summary && phase === 'idle' && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Stream Ended</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{formatDuration(summary.duration)}</p>
              <p className="text-sm text-gray-500">Duration</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{summary.totalViewers}</p>
              <p className="text-sm text-gray-500">Total Viewers</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{summary.peakViewers}</p>
              <p className="text-sm text-gray-500">Peak Viewers</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{summary.totalGiftsReceived}</p>
              <p className="text-sm text-gray-500">Gifts Received</p>
            </div>
          </div>
          <button onClick={() => setSummary(null)} className="mt-4 text-sm text-purple-600 hover:text-purple-800">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Main Video Section ═══ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-900 aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isLive || isPreviewActive ? 'block' : 'hidden'}`}
            />

            {phase === 'idle' && !isPreviewActive && !summary && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
                <div>
                  <Radio className="h-16 w-16 mb-4 mx-auto" />
                  <p className="text-xl font-medium">Ready to Stream</p>
                  <p className="text-sm mt-2 text-gray-500">Click "Go Live" to start your camera and go live</p>
                </div>
              </div>
            )}

            {/* Live badge on video */}
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center space-x-3">
                <span className="flex items-center px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  LIVE
                </span>
                <span className="flex items-center px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  <Users className="h-4 w-4 mr-1" />
                  {viewerCount}
                </span>
                <span className="flex items-center px-3 py-1 bg-black/50 text-white text-sm font-mono rounded-full">
                  {elapsedTime}
                </span>
              </div>
            )}

            {/* Preview badge */}
            {isPreviewActive && !isLive && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-semibold rounded-full">
                  PREVIEW
                </span>
              </div>
            )}

            {/* Stream controls overlay */}
            {isLive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3">
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
                  title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full ${isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
                  title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleEndStream}
                  disabled={phase === 'ending'}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors flex items-center"
                >
                  {phase === 'ending' ? <Loader2 className="animate-spin h-5 w-5" /> : 'End Stream'}
                </button>
              </div>
            )}
          </div>

          {/* ═══ Stream Info Card ═══ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {streamData?.title || streamSettings.title || 'Untitled Stream'}
                </h2>
                <p className="text-sm text-gray-500">
                  {streamData?.description || streamSettings.description || 'No description'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {!isLive && !isBusy && phase !== 'error' && (
                  <button
                    onClick={openSettings}
                    className="flex items-center px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium"
                  >
                    <Radio className="h-4 w-4 mr-2" />
                    Go Live
                  </button>
                )}
              </div>
            </div>

            {/* Stream Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-semibold">{viewerCount}</p>
                <p className="text-sm text-gray-500">Viewers</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-semibold">{messages.length}</p>
                <p className="text-sm text-gray-500">Messages</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Gift className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-semibold">{giftCount}</p>
                <p className="text-sm text-gray-500">Gifts</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Chat Section ═══ */}
        <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Chat</h3>
            {isLive && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isLive && messages.length === 0 && (
              <div className="text-center text-gray-400 mt-12">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Chat messages will appear here when you go live</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={`${msg.timestamp}-${idx}`} className="flex items-start space-x-2">
                {msg.type === 'gift' ? (
                  <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                    <span className="text-lg">🎁</span>
                    <p className="text-sm font-medium text-yellow-800">
                      {msg.username} sent <strong>{msg.giftName}</strong>
                    </p>
                  </div>
                ) : msg.type === 'system' || msg.type === 'join' || msg.type === 'leave' ? (
                  <p className="text-xs text-gray-400 italic w-full text-center py-1">{msg.message}</p>
                ) : (
                  <>
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                      {msg.profilePicture ? (
                        <img src={msg.profilePicture} alt={msg.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-purple-600">
                          {msg.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{msg.username}</p>
                      <p className="text-sm text-gray-600 break-words">{msg.message}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isLive ? 'Type a message...' : 'Go live to chat'}
                disabled={!isLive}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!isLive || !newMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ═══ Stream Settings Modal ═══ */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Go Live{artistName ? ` as ${artistName}` : ''}
              </h3>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  if (!isLive) stopPreview();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stream Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={streamSettings.title}
                  onChange={handleSettingsChange}
                  placeholder={artistName ? `${artistName} Live` : 'e.g. Friday Night Vibes'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={streamSettings.description}
                  onChange={handleSettingsChange}
                  rows={3}
                  placeholder="Tell viewers what your stream is about..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={streamSettings.category}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    if (!isLive) stopPreview();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartStream}
                  disabled={isBusy || !streamSettings.title.trim()}
                  className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center font-medium disabled:opacity-50"
                >
                  {isBusy ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Radio className="h-4 w-4 mr-2" />
                  )}
                  {isBusy ? PHASE_LABELS[phase] : 'Go Live'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
