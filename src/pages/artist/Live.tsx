import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  LocalTrackPublication,
  LocalParticipant,
  createLocalTracks,
  VideoPresets,
} from 'livekit-client';
import {
  Radio,
  Users,
  MessageSquare,
  Gift,
  Settings,
  X,
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function Live() {
  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState<LiveStream | null>(null);
  const [summary, setSummary] = useState<StreamEndSummary | null>(null);

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
        video: {
          resolution: VideoPresets.h720.resolution,
        },
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
      if (streamData?._id) {
        socketService.leaveStream(streamData._id);
      }
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Socket event listeners ────────────────────────────────────────────

  const setupSocketListeners = useCallback((streamId: string) => {
    socketService.onStreamState((state: StreamState) => {
      setViewerCount(state.currentViewers);
      if (state.recentMessages) {
        setMessages(state.recentMessages);
      }
    });

    socketService.onChatMessage((msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketService.onGiftReceived((msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setGiftCount((prev) => prev + 1);
      toast.success(`Gift received: ${msg.giftName}!`, { icon: '🎁' });
    });

    socketService.onViewerJoined((data) => {
      setViewerCount(data.currentViewers);
    });

    socketService.onViewerLeft((data) => {
      setViewerCount(data.currentViewers);
    });

    socketService.onStreamEnded(() => {
      toast('Stream has ended', { icon: '📺' });
    });

    socketService.onError((data) => {
      console.error('[Socket] Error:', data.message);
      toast.error(data.message);
    });

    // Join the stream room
    socketService.joinStream(streamId);
  }, []);

  // ─── Start stream ─────────────────────────────────────────────────────

  const handleStartStream = async () => {
    if (!streamSettings.title.trim()) {
      toast.error('Please set a stream title');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the stream via API (goes live immediately)
      const stream = await createStream({
        title: streamSettings.title,
        description: streamSettings.description,
        category: streamSettings.category || 'music',
        chatEnabled: true,
        giftsEnabled: true,
      });
      setStreamData(stream);

      // 2. Get LiveKit token
      const tokenData = await getStreamToken(stream._id);

      // 3. Stop preview tracks before connecting to room
      stopPreview();

      // 4. Connect to LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => {
        console.log('[LiveKit] Disconnected from room');
      });

      room.on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication, participant: LocalParticipant) => {
        if (pub.track?.kind === 'video' && videoRef.current) {
          pub.track.attach(videoRef.current);
        }
        console.log('[LiveKit] Published track:', pub.track?.kind, 'by', participant.identity);
      });

      await room.connect(tokenData.url, tokenData.token);

      // 5. Publish camera & mic
      await room.localParticipant.enableCameraAndMicrophone();

      // Attach local video to the preview element
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camPub?.track && videoRef.current) {
        camPub.track.attach(videoRef.current);
      }

      // 6. Setup Socket.io for chat/gifts
      setupSocketListeners(stream._id);

      setIsLive(true);
      setIsSettingsOpen(false);
      setSummary(null);
      toast.success('You are now live!');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to start stream';
      console.error('Start stream error:', error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── End stream ────────────────────────────────────────────────────────

  const handleEndStream = async () => {
    if (!streamData?._id) return;

    setIsLoading(true);
    try {
      // 1. End stream via API
      const result = await endStreamApi(streamData._id);
      setSummary(result);

      // 2. Disconnect LiveKit
      roomRef.current?.disconnect();
      roomRef.current = null;

      // 3. Leave Socket.io room
      socketService.removeAllStreamListeners();
      socketService.leaveStream(streamData._id);
      socketService.disconnect();

      setIsLive(false);
      setMessages([]);
      setViewerCount(0);
      setGiftCount(0);
      toast.success('Stream ended');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to end stream';
      console.error('End stream error:', error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
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
    if (!isPreviewActive && !isLive) {
      startPreview();
    }
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
      {/* Stream ended summary */}
      {summary && !isLive && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stream Summary</h2>
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
          <button
            onClick={() => setSummary(null)}
            className="mt-4 text-sm text-purple-600 hover:text-purple-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stream Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview / Live Feed */}
          <div className="relative bg-gray-900 aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${
                isLive || isPreviewActive ? 'block' : 'hidden'
              }`}
            />

            {!isLive && !isPreviewActive && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
                <div>
                  <Radio className="h-16 w-16 mb-4 mx-auto" />
                  <p className="text-xl">Stream Preview</p>
                  <p className="text-sm mt-2">Click "Go Live" to start your camera</p>
                </div>
              </div>
            )}

            {/* Live badge */}
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
                  className={`p-3 rounded-full ${
                    isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'
                  } text-white transition-colors`}
                  title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full ${
                    isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'
                  } text-white transition-colors`}
                  title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleEndStream}
                  disabled={isLoading}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors flex items-center"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'End Stream'}
                </button>
              </div>
            )}
          </div>

          {/* Stream Controls Card */}
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
                {!isLive && (
                  <>
                    <button
                      onClick={openSettings}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Stream settings"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button
                      onClick={openSettings}
                      disabled={isLoading}
                      className="flex items-center px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Radio className="h-4 w-4 mr-2" />
                          Go Live
                        </>
                      )}
                    </button>
                  </>
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

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Chat</h3>
            {isLive && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                Connected
              </span>
            )}
          </div>

          {/* Messages */}
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
                    {msg.message && (
                      <p className="text-xs text-yellow-600 mt-1">"{msg.message}"</p>
                    )}
                  </div>
                ) : msg.type === 'system' || msg.type === 'join' || msg.type === 'leave' ? (
                  <p className="text-xs text-gray-400 italic w-full text-center py-1">
                    {msg.message}
                  </p>
                ) : (
                  <>
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                      {msg.profilePicture ? (
                        <img
                          src={msg.profilePicture}
                          alt={msg.username}
                          className="w-full h-full object-cover"
                        />
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

          {/* Chat Input */}
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

      {/* Stream Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stream Settings</h3>
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
                  placeholder="e.g. Friday Night Vibes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
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
                  disabled={isLoading || !streamSettings.title.trim()}
                  className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Radio className="h-4 w-4 mr-2" />
                  )}
                  Go Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
