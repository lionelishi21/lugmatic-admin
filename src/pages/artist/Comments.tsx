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
  Target,
  User,
  Heart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, onModerate, onReplyOpen, expanded, onToggleExpand }: any) => {
  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-zinc-900 text-zinc-500 border-white/5';
    }
  };

  const isPending = comment.moderationStatus === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-0 overflow-hidden border-white/5 shadow-xl hover:border-emerald-500/20 transition-all bg-zinc-950/20 rounded-[2.5rem]"
    >
      <div className="flex items-start gap-8 p-8">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-700 flex-shrink-0 shadow-xl">
          <User size={28} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-lg font-bold text-white tracking-tight">
                {typeof comment.user === 'string' ? 'Anonymous Listener' : `${comment.user.firstName} ${comment.user.lastName}`}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusBadgeClass(comment.moderationStatus)}`}>
                {comment.moderationStatus}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <button className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          <p className="text-base text-zinc-400 font-medium leading-relaxed mb-6">
            {comment.content}
          </p>

          <div className="flex items-center justify-between border-t border-white/5 pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onReplyOpen}
                className="h-11 px-6 bg-zinc-950 border border-white/5 text-zinc-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all flex items-center gap-3"
              >
                <ReplyIcon size={14} />
                Reply
              </button>
              <div className="flex items-center gap-2.5 px-6 h-11 bg-zinc-950/50 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <Heart size={14} className="text-emerald-500" />
                {comment.likes} Likes
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPending && (
                <>
                  <button onClick={() => onModerate(comment._id, 'approve')} className="w-11 h-11 flex items-center justify-center text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black rounded-xl border border-emerald-500/20 transition-all shadow-xl" title="Approve">
                    <CheckCircle2 size={20} />
                  </button>
                  <button onClick={() => onModerate(comment._id, 'reject')} className="w-11 h-11 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-black rounded-xl border border-rose-500/20 transition-all shadow-xl" title="Reject">
                    <XCircle size={20} />
                  </button>
                </>
              )}
              <button onClick={() => onModerate(comment._id, 'delete')} className="w-11 h-11 flex items-center justify-center text-zinc-600 bg-zinc-950 hover:text-rose-500 border border-white/5 rounded-xl transition-all" title="Delete">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="px-10 pb-8 pl-[6rem] border-t border-white/5 pt-6 space-y-6 bg-zinc-950/40">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Collapse' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                {comment.replies.map((reply: any) => (
                  <div key={reply._id} className="flex gap-6 p-6 rounded-[2rem] bg-zinc-950 border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 flex-shrink-0 shadow-inner">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">
                          {typeof reply.user === 'string' ? 'Listener' : `${reply.user.firstName} ${reply.user.lastName}`}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                           {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 font-medium leading-relaxed">{reply.content}</p>
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
  const [activeTab, setActiveTab] = useState(0); 
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
      toast.error('Failed to load comments');
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
      await commentService.createComment({ content: replyText, parentComment: selectedComment._id });
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
    if (newExpanded.has(commentId)) newExpanded.delete(commentId);
    else newExpanded.add(commentId);
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
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Comments</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Community</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage listener feedback, moderate discussions, and engage with your fans.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Comments', value: stats.total, icon: MessageCircle },
          { label: 'Pending Review', value: stats.pending, icon: AlertCircle },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2 },
          { label: 'Total Engagement', value: stats.likes, icon: TrendingUp },
        ].map((stat, idx) => (
          <div key={idx} className="premium-card p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors mb-5">
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white tracking-tighter tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-4">Filter By Status</p>
          <div className="premium-card !p-2 bg-zinc-950/20 border-white/5 space-y-1 rounded-[2rem]">
            {[
              { label: 'All Activity', count: stats.total, icon: Activity },
              { label: 'Pending Review', count: stats.pending, icon: AlertCircle },
              { label: 'Approved', count: stats.approved, icon: CheckCircle2 },
              { label: 'Rejected', count: stats.total - stats.approved - stats.pending, icon: XCircle }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === idx ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                   <item.icon size={16} className={activeTab === idx ? 'text-black' : 'text-zinc-700'} />
                   <span>{item.label}</span>
                </div>
                {item.count > 0 && <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${activeTab === idx ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-700'}`}>{item.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stream */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                 <Loader2 size={40} className="text-emerald-500 animate-spin" />
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Activity Stream</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="premium-card py-32 text-center border-dashed border-white/5 bg-zinc-950/20 rounded-[3rem]">
                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <MessageSquare size={40} className="text-zinc-800" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">No comments found</h3>
                <p className="text-sm text-zinc-500 mt-3 font-medium">Community feedback will appear here as listeners engage with your tracks.</p>
              </div>
            ) : (
              <div className="space-y-6">
                 {filteredComments.map((comment) => (
                   <CommentItem key={comment._id} comment={comment} onModerate={handleModerateComment} onReplyOpen={() => { setSelectedComment(comment); setShowReplyModal(true); }} expanded={expandedComments.has(comment._id)} onToggleExpand={() => handleToggleExpanded(comment._id)} />
                 ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card !p-0 w-full max-w-2xl relative z-10 border-white/10 shadow-2xl overflow-hidden rounded-[3rem]">
              <div className="px-10 py-8 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><ReplyIcon size={24} /></div>
                   <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">Send Reply</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Direct message to listener</p>
                   </div>
                </div>
                <button onClick={() => setShowReplyModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="p-10 space-y-8">
                <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-6">
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Listener Comment:</p>
                   <p className="text-zinc-400 font-medium italic">"{selectedComment?.content}"</p>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                      <Send size={14} className="text-emerald-500" /> Your Response
                   </label>
                   <textarea
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     placeholder="Type your reply here..."
                     className="w-full h-48 p-8 bg-zinc-950 border border-white/5 rounded-[2rem] text-white font-medium placeholder:text-zinc-700 focus:border-emerald-500/30 outline-none transition-all resize-none shadow-inner"
                   />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowReplyModal(false)} className="h-14 flex-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Cancel</button>
                  <button onClick={handleReply} disabled={!replyText.trim()} className="h-14 flex-[2] bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                    Send Reply
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
