import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/services/api';
import { connectSocket } from '@/services/socketService';
import { RootState } from '../../store';

interface Message {
  _id: string;
  sender: { _id: string; firstName?: string; lastName?: string };
  content: string;
  createdAt: string;
}

interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

function dayLabel(date: Date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export default function MessageThread() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const myId = (user as any)?._id ?? (user as any)?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const [msgRes, convRes] = await Promise.all([
        api.get(`/messages/${conversationId}`),
        api.get('/messages'),
      ]);
      setMessages((msgRes.data as any).data ?? []);
      // Find the other participant
      const convList: any[] = (convRes.data as any).data ?? [];
      const conv = convList.find((c: any) => c._id === conversationId);
      if (conv) {
        const otherP = conv.participants.find((p: any) => p._id !== myId);
        setOther(otherP ?? null);
      }
      // Mark as read
      api.put(`/messages/${conversationId}/read`).catch(() => {});
    } catch { /* silently handled */ }
    finally { setLoading(false); }
  }, [conversationId, myId]);

  useEffect(() => {
    fetchMessages();
    const socket = connectSocket();

    const onMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]);
        api.put(`/messages/${conversationId}/read`).catch(() => {});
      }
    };
    const onTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId !== myId) setTyping(true);
    };
    const onStopTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId !== myId) setTyping(false);
    };

    socket?.on('dm:message', onMessage);
    socket?.on('dm:typing', onTyping);
    socket?.on('dm:stop-typing', onStopTyping);
    return () => {
      socket?.off('dm:message', onMessage);
      socket?.off('dm:typing', onTyping);
      socket?.off('dm:stop-typing', onStopTyping);
    };
  }, [conversationId, fetchMessages, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleInput = (val: string) => {
    setText(val);
    const socket = connectSocket();
    socket?.emit('dm:typing', { conversationId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('dm:stop-typing', { conversationId });
    }, 1500);
  };

  const send = async () => {
    if (!text.trim() || sending || !conversationId) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      const res = await api.post(`/messages/${conversationId}`, { content });
      const newMsg = (res.data as any).data;
      if (newMsg) setMessages(prev => [...prev, newMsg]);
    } catch { setText(content); }
    finally { setSending(false); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const getName = (p: Participant | null) =>
    p ? [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Fan' : 'Fan';

  // Group messages by day
  const grouped: { label: string; msgs: Message[] }[] = [];
  messages.forEach(msg => {
    const day = dayLabel(new Date(msg.createdAt));
    const last = grouped[grouped.length - 1];
    if (last?.label === day) last.msgs.push(msg);
    else grouped.push({ label: day, msgs: [msg] });
  });

  return (
    <div className="max-w-2xl mx-auto pb-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className={`${card} flex items-center gap-3 px-4 py-3 mb-4 flex-shrink-0`}>
        <button
          onClick={() => navigate('/artist/messages')}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {other?.profileImage
            ? <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
            : <User className="h-4 w-4 text-zinc-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{getName(other)}</p>
          {typing && <p className="text-[11px] text-emerald-500">Typing…</p>}
        </div>
      </div>

      {/* Messages */}
      <div className={`${card} flex-1 overflow-y-auto p-4 space-y-1 min-h-0`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-zinc-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {grouped.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-white/[0.05]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{group.label}</span>
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-white/[0.05]" />
                </div>
                {group.msgs.map(msg => {
                  const mine = msg.sender._id === myId;
                  return (
                    <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-1.5`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-lg text-sm leading-relaxed ${
                        mine
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-emerald-200' : 'text-zinc-400'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start mb-1.5"
                >
                  <div className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className={`${card} flex items-end gap-2 p-3 mt-4 flex-shrink-0`}>
        <textarea
          rows={1}
          value={text}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message…"
          className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 resize-none max-h-32"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="p-2.5 bg-emerald-600 text-white rounded disabled:opacity-40 hover:bg-emerald-700 transition-colors flex-shrink-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
