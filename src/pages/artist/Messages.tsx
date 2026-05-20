import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, Search, Loader2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/services/api';
import { connectSocket } from '@/services/socketService';
import { RootState } from '../../store';

interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: { content: string; createdAt: string; sender: string };
  unreadCounts?: Record<string, number>;
  updatedAt: string;
}

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages');
      setConversations((res.data as any).data ?? []);
    } catch { /* silently handled */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchConversations();
    const socket = connectSocket();
    // Refresh conversation list when a new DM arrives
    const handler = () => fetchConversations();
    socket?.on('dm:message', handler);
    return () => { socket?.off('dm:message', handler); };
  }, [fetchConversations]);

  const getOtherParticipant = (conv: Conversation): Participant | null => {
    if (!user) return null;
    return conv.participants.find(p => p._id !== (user as any)?._id && p._id !== (user as any)?.id) ?? null;
  };

  const getUnread = (conv: Conversation): number => {
    const myId = (user as any)?._id ?? (user as any)?.id;
    return conv.unreadCounts?.[myId] ?? 0;
  };

  const getName = (p: Participant | null) => {
    if (!p) return 'Unknown';
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || 'Fan';
  };

  const filtered = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return getName(other).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Messages</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Fan conversations and direct messages</p>
      </div>

      {/* Search */}
      <div className={`${card} p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            Inbox {conversations.length > 0 && `(${conversations.length})`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No messages yet</p>
            <p className="text-sm text-zinc-400 mt-1">Fans who message you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {filtered.map(conv => {
              const other = getOtherParticipant(conv);
              const unread = getUnread(conv);
              return (
                <button
                  key={conv._id}
                  onClick={() => navigate(`/artist/messages/${conv._id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {other?.profileImage
                      ? <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
                      : <User className="h-5 w-5 text-zinc-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${unread > 0 ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}>
                        {getName(other)}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${unread > 0 ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400'}`}>
                        {conv.lastMessage?.content ?? 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
