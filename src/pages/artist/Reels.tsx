import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Gift as GiftIcon, 
  MoreVertical, UserPlus, Music, Radio, Flame, 
  ChevronDown, ChevronUp, X, Send, Activity,
  Play, Pause, Volume2, VolumeX, Eye
} from 'lucide-react';
import { Room, RoomEvent, VideoPresets, ConnectionState, RemoteParticipant, RemoteTrackPublication, RemoteTrack } from 'livekit-client';
import toast from 'react-hot-toast';
import liveStreamService, { LiveStream } from '../../services/liveStreamService';
import { giftService } from '../../services/giftService';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiService from '../../services/api';

// ── Types ───────────────────────────────────────────────────────────────────

interface ReelItemProps {
  stream: LiveStream;
  isActive: boolean;
  onFollow?: (artistId: string) => void;
  onGiftOpen?: (stream: LiveStream) => void;
}

// ── ReelItem Component ──────────────────────────────────────────────────────

const ReelItem = ({ stream, isActive, onFollow, onGiftOpen }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 500);
  const [hasLiked, setHasLiked] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Handle video/audio tracks from LiveKit for live streams
  useEffect(() => {
    if (stream.status === 'live' && isActive) {
      const setupLiveConnection = async () => {
        try {
          const { token, url } = await liveStreamService.getStreamToken(stream._id);
          const room = new Room({
            adaptiveStream: true,
            dynacast: true,
          });
          roomRef.current = room;

          room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication) => {
            if (track.kind === 'video' && videoRef.current) {
              track.attach(videoRef.current);
            }
          });

          await room.connect(url, token);
          
          // Join socket room for chat
          socketService.joinStream(stream._id);
          socketService.onChatMessage((msg) => {
            setMessages(prev => [...prev.slice(-20), msg]);
          });
        } catch (err) {
          console.error('Failed to connect to live stream:', err);
        }
      };

      setupLiveConnection();

      return () => {
        roomRef.current?.disconnect();
        socketService.leaveStream(stream._id);
      };
    }
  }, [stream._id, stream.status, isActive]);

  // Handle recorded VODs
  useEffect(() => {
    if (stream.status === 'ended' && stream.recordingUrl && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, stream.status, stream.recordingUrl]);

  const toggleLike = () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socketService.sendChat(stream._id, newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={stream.status === 'ended' ? stream.recordingUrl : undefined}
          className="h-full w-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onClick={() => setIsPlaying(!isPlaying)}
        />
        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Action Bar (Right Side) */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 p-0.5 bg-zinc-900 shadow-xl">
              <img 
                src={stream.host?.image || 'https://via.placeholder.com/150'} 
                alt={stream.host?.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <button 
              onClick={() => onFollow?.(stream.host._id)}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-black"
            >
              <UserPlus size={12} />
            </button>
          </div>
        </div>

        <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all">
            <Heart size={26} className={hasLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-white group-hover:scale-110"} />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{likes}</span>
        </button>

        <button onClick={() => setShowChat(!showChat)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all">
            <MessageCircle size={26} className="text-white group-hover:scale-110" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{messages.length}</span>
        </button>

        <button onClick={() => onGiftOpen?.(stream)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all">
            <GiftIcon size={26} className="text-emerald-500 group-hover:scale-110" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Gift</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all">
            <Share2 size={26} className="text-white group-hover:scale-110" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Share</span>
        </button>
      </div>

      {/* Info Overlay (Bottom Left) */}
      <div className="absolute left-4 bottom-8 right-20 z-20 space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-white uppercase tracking-tight italic">@{stream.host?.name}</h2>
          {stream.status === 'live' && (
            <div className="px-2 py-0.5 bg-rose-600 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white" />
              Live
            </div>
          )}
        </div>
        
        <p className="text-sm text-zinc-100 font-medium line-clamp-2 max-w-md">
          {stream.description || `Syncing vibes on ${stream.title}. #Lugmatic #Live`}
        </p>

        <div className="flex items-center gap-3 py-1 px-3 bg-white/10 backdrop-blur-md rounded-full w-fit">
          <Music size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest truncate max-w-[150px]">
            {stream.title}
          </span>
        </div>
      </div>

      {/* Chat Bubble Feed (Left Side, above info) */}
      <AnimatePresence>
        {showChat && (
          <div className="absolute left-4 bottom-40 right-20 z-10 max-h-[30%] overflow-y-auto flex flex-col gap-2 no-scrollbar pointer-events-none">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-2xl w-fit max-w-full flex items-center gap-2 border border-white/5"
              >
                <span className="text-[10px] font-black text-emerald-500 uppercase italic whitespace-nowrap">{msg.username}:</span>
                <span className="text-xs text-white font-medium">{msg.message}</span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Chat Input Overlay (when keyboard/input focused, optional - usually at bottom) */}
      <form 
        onSubmit={handleSendChat}
        className="absolute bottom-4 left-4 right-20 z-30 opacity-0 focus-within:opacity-100 transition-opacity"
      >
        <div className="relative">
          <input 
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Reels Main Component ────────────────────────────────────────────────────

export default function Reels() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const [active, recorded] = await Promise.all([
          liveStreamService.getActiveStreams(),
          apiService.get('/live-stream/recorded').then(r => r.data)
        ]);
        
        const activeList = Array.isArray(active?.data) ? active.data : [];
        const recordedList = Array.isArray(recorded?.data) ? recorded.data : [];
        
        setStreams([...activeList, ...recordedList]);
      } catch (err) {
        console.error('Failed to load Reels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, clientHeight } = scrollContainerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic animate-pulse">Syncing Feed...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 lg:relative lg:h-[calc(100vh-100px)] lg:rounded-3xl overflow-hidden shadow-2xl">
      {/* Mobile Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => window.history.back()}>
          <ChevronDown className="h-6 w-6 text-white rotate-90" />
        </div>
        <div className="flex items-center gap-6 pointer-events-auto">
          <button className="text-white text-sm font-black uppercase tracking-widest border-b-2 border-emerald-500 pb-1 italic">Discover</button>
          <button className="text-zinc-500 text-sm font-black uppercase tracking-widest pb-1 italic">Following</button>
        </div>
        <div className="pointer-events-auto">
          <Eye className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Snap Scroll Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        {streams.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-6 px-10 text-center">
            <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
              <Radio className="h-10 w-10 text-zinc-700" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Zero Signal Frequency</h3>
            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.15em] max-w-xs opacity-60 leading-relaxed">
              The airwaves are currently quiet. Artists are prepping for deployment.
            </p>
          </div>
        ) : (
          streams.map((stream, idx) => (
            <div key={stream._id} className="h-full w-full snap-start flex-shrink-0">
              <ReelItem 
                stream={stream} 
                isActive={idx === activeIndex}
                onFollow={(id) => toast.success(`Synchronizing with @${stream.host?.name}`)}
                onGiftOpen={(s) => toast.success('Initializing Gifting Uplink...')}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
