import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Gift as GiftIcon, 
  MoreVertical, UserPlus, Music, Radio, Flame, 
  ChevronDown, ChevronUp, X, Send, Activity,
  Play, Pause, Volume2, VolumeX, Eye, Zap,
  TrendingUp, Users, Target, Shield, Globe,
  ArrowUpRight, Layers, Database, Activity as ActivityIcon,
  Plus
} from 'lucide-react';
import { Room, RoomEvent, VideoPresets, ConnectionState, RemoteParticipant, RemoteTrackPublication, RemoteTrack } from 'livekit-client';
import toast from 'react-hot-toast';
import liveStreamService, { LiveStream } from '../../services/liveStreamService';
import { giftService } from '../../services/giftService';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiService, { getFullImageUrl } from '../../services/api';

interface ReelItemProps {
  stream: LiveStream;
  isActive: boolean;
  onFollow?: (artistId: string) => void;
  onGiftOpen?: (stream: LiveStream) => void;
}

const ReelItem = ({ stream, isActive, onFollow, onGiftOpen }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 5000) + 1200);
  const [hasLiked, setHasLiked] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    if (stream.status === 'live' && isActive) {
      const setupLiveConnection = async () => {
        try {
          const { token, url } = await liveStreamService.getStreamToken(stream._id);
          const room = new Room({ adaptiveStream: true, dynacast: true });
          roomRef.current = room;

          room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            if (track.kind === 'video' && videoRef.current) {
              track.attach(videoRef.current);
            }
          });

          await room.connect(url, token);
          socketService.joinStream(stream._id);
          socketService.onChatMessage((msg) => {
            setMessages(prev => [...prev.slice(-30), msg]);
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
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={stream.status === 'ended' && stream.recordingUrl ? getFullImageUrl(stream.recordingUrl) : undefined}
          poster={stream.coverImage ? getFullImageUrl(stream.coverImage) : undefined}
          className={`h-full w-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-90' : 'opacity-0'}`}
          loop
          muted={isMuted}
          playsInline
          onClick={() => setIsPlaying(!isPlaying)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-6 bottom-28 z-30 flex flex-col items-center gap-6">
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
           className="relative mb-2"
        >
          <div className="w-14 h-14 rounded-2xl border-2 border-white/10 p-0.5 bg-zinc-950 shadow-2xl overflow-hidden group cursor-pointer">
            <img 
              src={stream.host?.image || '/default-avatar.png'} 
              alt={stream.host?.name}
              className="w-full h-full rounded-2xl object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <button 
            onClick={() => onFollow?.(stream.host._id)}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl hover:scale-110 transition-all"
          >
            <Plus size={14} />
          </button>
        </motion.div>

        {[
          { id: 'like', icon: Heart, count: likes, active: hasLiked, color: 'text-rose-500', action: toggleLike, label: 'Likes' },
          { id: 'chat', icon: MessageCircle, count: messages.length, active: showChat, color: 'text-emerald-500', action: () => setShowChat(!showChat), label: 'Chat' },
          { id: 'gift', icon: GiftIcon, active: false, color: 'text-amber-500', action: () => onGiftOpen?.(stream), label: 'Gift' },
          { id: 'share', icon: Share2, active: false, color: 'text-white', action: () => {}, label: 'Share' }
        ].map((btn, i) => (
          <motion.div 
            key={btn.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex flex-col items-center gap-1.5"
          >
            <button 
              onClick={btn.action}
              className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-xl"
            >
              <btn.icon 
                size={22} 
                className={`transition-all ${btn.active ? `fill-current ${btn.color}` : 'text-zinc-300'}`} 
              />
            </button>
            <span className="text-[10px] font-bold text-white/60 tabular-nums">{btn.count !== undefined ? btn.count.toLocaleString() : btn.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Info Overlay (Bottom Left) */}
      <div className="absolute left-6 bottom-10 right-24 z-30 pointer-events-none">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-white tracking-tight">@{stream.host?.name}</h2>
            {stream.status === 'live' && (
              <div className="px-3 py-1 bg-rose-500 text-white rounded-lg flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-zinc-200 font-medium leading-relaxed max-w-lg drop-shadow-xl">
            {stream.description || stream.title}
          </p>

          <div className="flex items-center gap-3">
            <div className="h-9 px-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2.5 w-fit">
              <Music size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                {stream.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Feed */}
      <AnimatePresence>
        {showChat && (
          <div className="absolute left-6 bottom-44 right-24 z-20 h-48 overflow-y-auto flex flex-col justify-end gap-2.5 no-scrollbar pointer-events-none pb-8">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl w-fit max-w-[85%] flex items-center gap-3 border border-white/5"
              >
                <span className="text-xs font-bold text-emerald-500">{msg.username}</span>
                <span className="text-xs text-zinc-100 font-medium">{msg.message}</span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <form 
        onSubmit={handleSendChat}
        className="absolute bottom-8 left-6 right-24 z-40"
      >
        <div className="relative group">
          <input 
            type="text"
            placeholder="Add a comment..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/30 transition-all shadow-2xl"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-emerald-500 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default function Reels() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const [active, recordedRes] = await Promise.all([
          liveStreamService.getActiveStreams(),
          apiService.get<LiveStream[]>('/live-stream/recorded')
        ]);
        const recordedStreams: LiveStream[] = recordedRes.data?.data || [];
        setStreams([...(active?.data || []), ...recordedStreams]);
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
    setActiveIndex(Math.round(scrollTop / clientHeight));
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-6">
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-2xl" />
        <p className="text-xs font-semibold text-zinc-500 animate-pulse tracking-widest uppercase">Loading discovery feed</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 lg:relative lg:h-[calc(100vh-80px)] lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto cursor-pointer p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl" onClick={() => window.history.back()}>
          <ChevronDown className="h-6 w-6 text-white rotate-90" />
        </div>
        
        <div className="flex items-center bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/5 pointer-events-auto shadow-2xl">
          <button className="px-6 py-2 bg-white/10 text-white text-xs font-bold rounded-xl transition-all">
            Discovery
          </button>
          <button className="px-6 py-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold rounded-xl transition-all">
            Following
          </button>
        </div>

        <div className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl pointer-events-auto">
          <Eye className="h-6 w-6 text-zinc-500" />
        </div>
      </div>

      {/* Reels List */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        {streams.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-8 px-10 text-center">
            <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
               <Radio className="h-10 w-10 text-zinc-800" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">No active streams</h3>
               <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                 Follow your favorite artists to stay updated when they go live.
               </p>
            </div>
          </div>
        ) : (
          streams.map((stream, idx) => (
            <div key={stream._id} className="h-full w-full snap-start flex-shrink-0">
              <ReelItem 
                stream={stream} 
                isActive={idx === activeIndex}
                onFollow={(id) => toast.success(`Followed @${stream.host?.name}`)}
                onGiftOpen={(s) => toast.success('Gifting enabled')}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
