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
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
import toast from 'react-hot-toast';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

// Sub-component for individual comment cards
const CommentItem = ({ comment, onModerate, onReplyOpen, expanded, onToggleExpand }: any) => {
  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const isPending = comment.moderationStatus === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${card} group hover:border-zinc-300 dark:hover:border-white/10 transition-all ${
        isPending ? 'ring-1 ring-amber-500/20' : ''
      }`}
    >
      <div className="flex items-start gap-4 px-6 py-5">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-500 dark:text-emerald-500 font-black text-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          {(typeof comment.user === 'string' ? 'U' : comment.user.firstName?.[0]) || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                {typeof comment.user === 'string' ? 'Station Listener' : `${comment.user.firstName} ${comment.user.lastName}`}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${statusBadgeClass(comment.moderationStatus)}`}>
                {comment.moderationStatus}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <button className="text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 font-medium">
            {comment.content}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onReplyOpen}
                className="h-8 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <ReplyIcon className="h-3 w-3" />
                Dispatch Reply
              </button>
              <div className="flex items-center gap-2 px-3 h-8 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 rounded text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <TrendingUp className="h-3 w-3 text-rose-500" />
                {comment.likes} High-Fives
              </div>
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isPending && (
                <>
                  <button
                    onClick={() => onModerate(comment._id, 'approve')}
                    className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/10 transition-all"
                    title="Approve"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onModerate(comment._id, 'reject')}
                    className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded border border-rose-500/10 transition-all"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => onModerate(comment._id, 'delete')}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:text-rose-500 hover:bg-rose-500/10 rounded border border-transparent hover:border-rose-500/10 transition-all"
                title="Purge"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div className="px-6 pb-5 pl-[4.5rem] border-t border-zinc-100 dark:border-white/[0.04] pt-4 space-y-3">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-emerald-500 uppercase tracking-widest transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Collapse Stream' : `Unfold ${comment.replies.length} ${comment.replies.length === 1 ? 'Response' : 'Responses'}`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {comment.replies.map((reply: any) => (
                  <div key={reply._id} className="flex gap-4 p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-[10px] font-black flex-shrink-0">
                      {(typeof reply.user === 'string' ? 'U' : reply.user.firstName?.[0]) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                          {typeof reply.user === 'string' ? 'Station Listener' : `${reply.user.firstName} ${reply.user.lastName}`}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      
      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <MessageSquare className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Listener Engagement</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Sonic Feedback
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Moderate conversations and connect with your audience.
             </p>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Stream', value: stats.total, color: 'indigo', icon: <MessageCircle className="h-4 w-4" /> },
          { label: 'Attention Required', value: stats.pending, color: 'amber', icon: <AlertCircle className="h-4 w-4" /> },
          { label: 'Cleared Feed', value: stats.approved, color: 'emerald', icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: 'Global Impact', value: stats.likes, color: 'rose', icon: <TrendingUp className="h-4 w-4" /> },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`${card} p-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums italic tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Navigation Sidebar ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Filter className="h-3.5 w-3.5 text-zinc-500" />
             <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Filter Engine</p>
          </div>
          <div className={`${card} p-1.5 flex flex-col gap-1 bg-zinc-50/50 dark:bg-zinc-800/20`}>
            {[
              { label: 'Full Spectrum', count: stats.total },
              { label: 'Pending Review', count: stats.pending },
              { label: 'Approved Feed', count: stats.approved },
              { label: 'Archive', count: stats.total - stats.approved - stats.pending }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx
                    ? 'bg-zinc-900 dark:bg-zinc-700 text-white shadow-lg'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.count > 0 && (
                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === idx ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      {item.count}
                   </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Comment Stream ── */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredComments.length === 0 ? (
              <div className={`${card} py-24 text-center bg-zinc-50/30 dark:bg-white/[0.01]`}>
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-zinc-200 dark:border-white/5">
                  <MessageSquare className="h-10 w-10 text-zinc-400 dark:text-zinc-700" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Signal Loss</h3>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
                  The frequency is quiet. listener interactions will materialize here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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

      {/* ── Reply Modal ── */}
      <AnimatePresence>
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`${card} w-full max-w-xl overflow-hidden shadow-2xl shadow-black/50`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                     <ReplyIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Draft Transmission</span>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
                >
                  <X className="h-4 w-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Quoted comment */}
                <div className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 rounded-xl p-4 text-[11px] text-zinc-500 dark:text-zinc-400 italic font-medium leading-relaxed relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/20 rounded-l-xl" />
                  "{selectedComment?.content}"
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Send className="h-3 w-3" />
                      Your Response
                   </p>
                   <textarea
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     placeholder="Compose your reply..."
                     className="w-full h-40 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all resize-none"
                   />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="h-11 flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="h-11 flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Post Reply
                    <ChevronRight className="h-4 w-4" />
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
