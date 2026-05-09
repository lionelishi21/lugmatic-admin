import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Reply as ReplyIcon,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Clock,
  Send,
  MoreVertical,
  X,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
import toast from 'react-hot-toast';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

// Sub-component for individual comment cards
const CommentItem = ({ comment, onModerate, onReplyOpen, expanded, onToggleExpand }: any) => {
  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/5 text-rose-500 border-rose-500/20';
      case 'pending': return 'bg-amber-500/5 text-amber-500 border-amber-500/20';
      default: return 'bg-zinc-500/5 text-zinc-500 border-zinc-500/20';
    }
  };

  const isPending = comment.moderationStatus === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${card} group hover:border-emerald-500/20 transition-all relative overflow-hidden ${
        isPending ? 'ring-1 ring-amber-500/20' : ''
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
      
      <div className="flex items-start gap-6 px-8 py-6 relative z-10">
        {/* Avatar HUD */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-emerald-500 font-black text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-inner">
          {(typeof comment.user === 'string' ? 'U' : comment.user.firstName?.[0]) || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">
                {typeof comment.user === 'string' ? 'Station Listener' : `${comment.user.firstName} ${comment.user.lastName}`}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${statusBadgeClass(comment.moderationStatus)}`}>
                {comment.moderationStatus}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] flex items-center gap-2 italic">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-emerald-500 transition-colors">
                <MoreVertical className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 font-medium">
            {comment.content}
          </p>

          {/* Action Row HUD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onReplyOpen}
                className="h-10 px-5 bg-zinc-950 border border-white/[0.04] text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/20 transition-all flex items-center gap-2.5 group/btn"
              >
                <ReplyIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Dispatch Reply
              </button>
              <div className="flex items-center gap-2.5 px-5 h-10 bg-zinc-950/50 border border-white/[0.02] rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <Zap className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                {comment.likes} High-Fives
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isPending && (
                <>
                  <button
                    onClick={() => onModerate(comment._id, 'approve')}
                    className="w-10 h-10 flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl border border-emerald-500/10 transition-all shadow-lg"
                    title="Approve Signal"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => onModerate(comment._id, 'reject')}
                    className="w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-all shadow-lg"
                    title="Reject Signal"
                  >
                    <XCircle className="h-4.5 w-4.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => onModerate(comment._id, 'delete')}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 bg-zinc-950 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-white/[0.04] hover:border-rose-500/20 transition-all"
                title="Purge Entry"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Replies HUD */}
      {comment.replies?.length > 0 && (
        <div className="px-8 pb-6 pl-[5.5rem] border-t border-zinc-100 dark:border-white/[0.04] pt-5 space-y-4 bg-zinc-950/20">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2.5 text-[10px] font-black text-zinc-500 hover:text-emerald-500 uppercase tracking-widest transition-colors italic"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Signal Collapsed' : `Unfold ${comment.replies.length} ${comment.replies.length === 1 ? 'Response' : 'Responses'}`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {comment.replies.map((reply: any) => (
                  <div key={reply._id} className="flex gap-5 p-5 rounded-2xl bg-zinc-950 border border-white/[0.04] shadow-inner group/reply">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.02] flex items-center justify-center text-zinc-600 dark:text-emerald-500/70 text-[11px] font-black flex-shrink-0 shadow-inner group-hover/reply:scale-105 transition-transform">
                      {(typeof reply.user === 'string' ? 'U' : reply.user.firstName?.[0]) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">
                          {typeof reply.user === 'string' ? 'Station Listener' : `${reply.user.firstName} ${reply.user.lastName}`}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.1em] italic">
                           {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Pending, 2: Approved, 3: Rejected
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const { user } = useSelector((state: RootState) => state.auth);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentService.getDashboardArtistComments();
      const rawData = response.data.data as any;
      const commentList = Array.isArray(rawData) ? rawData : (rawData.data || []);
      setComments(commentList as Comment[]);
    } catch (error: any) {
      toast.error('Failed to sync comments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleModerateComment = async (commentId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      await commentService.artistModerateComment(commentId, action);
      toast.success(`Comment ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deleted'}`);
      loadComments();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleReply = async () => {
    if (!selectedComment || !replyText.trim()) return;
    try {
      await commentService.createComment({
        content: replyText,
        parentComment: selectedComment._id
      });
      toast.success('Reply sent');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedComment(null);
      loadComments();
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleToggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const filteredComments = comments.filter(comment => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return comment.moderationStatus === 'pending';
    if (activeTab === 2) return comment.moderationStatus === 'approved';
    if (activeTab === 3) return comment.moderationStatus === 'rejected';
    return true;
  });

  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.moderationStatus === 'pending').length,
    approved: comments.filter(c => c.moderationStatus === 'approved').length,
    likes: comments.reduce((sum, c) => sum + (c.likes || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">
      
      {/* ── Branded Engagement Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Signal Intelligence v1.0</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">
              Sonic Feedback
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Tactical moderation and listener engagement hub.
            </p>
          </div>
        </div>
      </div>

      {/* ── engagement Telemetry ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Signal Stream', value: stats.total, color: 'indigo', icon: <MessageCircle className="h-6 w-6" /> },
          { label: 'Priority Pulse', value: stats.pending, color: 'amber', icon: <AlertCircle className="h-6 w-6" /> },
          { label: 'Cleared Feed', value: stats.approved, color: 'emerald', icon: <CheckCircle2 className="h-6 w-6" /> },
          { label: 'Global Impact', value: stats.likes, color: 'rose', icon: <TrendingUp className="h-6 w-6" /> },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`${card} p-6 hover:border-emerald-500/20 transition-all shadow-sm group cursor-default`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-zinc-950 border border-white/[0.04] shadow-inner text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2 italic">{stat.label}</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums italic tracking-tighter group-hover:text-emerald-500 transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Operational Sidebar ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <Filter className="h-4 w-4 text-emerald-500" />
             <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 italic">Signal Filters</p>
          </div>
          <div className={`${card} p-2 flex flex-col gap-1.5 bg-zinc-950/20 shadow-inner`}>
            {[
              { label: 'Full Spectrum', count: stats.total, icon: <Activity className="h-3.5 w-3.5" /> },
              { label: 'Pending Review', count: stats.pending, icon: <AlertCircle className="h-3.5 w-3.5" /> },
              { label: 'Approved Feed', count: stats.approved, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
              { label: 'Archive Registry', count: stats.total - stats.approved - stats.pending, icon: <Target className="h-3.5 w-3.5" /> }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic group ${
                  activeTab === idx
                    ? 'bg-white text-zinc-950 shadow-2xl'
                    : 'text-zinc-500 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                   <span className={activeTab === idx ? 'text-emerald-600' : 'text-zinc-600 group-hover:text-emerald-500'}>
                     {item.icon}
                   </span>
                   <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                   <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-tighter ${activeTab === idx ? 'bg-zinc-900 text-white' : 'bg-zinc-900 text-emerald-500 shadow-inner'}`}>
                      {item.count}
                   </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Comment Stream HUD ── */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-zinc-950/20 rounded-2xl border border-white/[0.04]">
                <div className="relative">
                   <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-2xl shadow-emerald-500/20" />
                   <Activity className="absolute inset-0 m-auto h-5 w-5 text-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-6 italic animate-pulse">Syncing Signal Stream...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className={`${card} py-32 text-center bg-zinc-950/20 shadow-inner`}>
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/[0.04] shadow-2xl group cursor-default">
                  <MessageSquare className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Signal Loss</h3>
                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.15em] mt-3 max-w-xs mx-auto leading-relaxed opacity-60">
                  The frequency is quiet. listener interactions will materialize here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                 {filteredComments.map((comment) => (
                   <CommentItem
                     key={comment._id}
                     comment={comment}
                     onModerate={handleModerateComment}
                     onReplyOpen={() => {
                       setSelectedComment(comment);
                       setShowReplyModal(true);
                     }}
                     expanded={expandedComments.has(comment._id)}
                     onToggleExpand={() => handleToggleExpanded(comment._id)}
                   />
                 ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Dispatch Modal HUD ── */}
      <AnimatePresence>
        {showReplyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={`${card} w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-emerald-500/20`}
            >
              {/* Modal Header HUD */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                     <ReplyIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">Dispatch Controller</span>
                     <span className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Draft Transmission</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all group"
                >
                  <X className="h-5 w-5 text-zinc-500 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Quoted Signal HUD */}
                <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-6 text-sm text-zinc-500 dark:text-zinc-400 italic font-medium leading-relaxed relative shadow-inner">
                  <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="pl-4">
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-3 not-italic">Intercepted Signal:</p>
                     "{selectedComment?.content}"
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-3 italic">
                      <Send className="h-4 w-4 text-emerald-500" />
                      Transmission Payload
                   </p>
                   <textarea
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     placeholder="Compose high-fidelity response..."
                     className="w-full h-48 p-6 bg-zinc-950 border border-white/[0.08] rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all resize-none shadow-inner"
                   />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="h-14 flex-1 bg-zinc-900 border border-white/[0.04] text-zinc-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all italic"
                  >
                    Abort Sequence
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="h-14 flex-[2] flex items-center justify-center gap-3 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none italic"
                  >
                    Initialize Post
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comments;
