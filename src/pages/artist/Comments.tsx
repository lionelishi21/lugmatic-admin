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
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
import toast from 'react-hot-toast';

// Sub-component for individual comment cards
const CommentItem = ({ comment, onModerate, onReplyOpen, expanded, onToggleExpand }: any) => {
  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'rejected': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400';
      case 'pending': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
      default: return 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
    }
  };

  const isPending = comment.moderationStatus === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg transition-colors ${
        isPending ? 'ring-1 ring-amber-400/30' : ''
      }`}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-semibold text-sm flex-shrink-0">
          {(typeof comment.user === 'string' ? 'U' : comment.user.firstName?.[0]) || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {typeof comment.user === 'string' ? 'User' : `${comment.user.firstName} ${comment.user.lastName}`}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusBadgeClass(comment.moderationStatus)}`}>
                {comment.moderationStatus}
              </span>
              {comment.isEdited && (
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Edited</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <button className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            {comment.content}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onReplyOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <ReplyIcon className="h-3 w-3" />
                Reply
              </button>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04] rounded text-xs text-zinc-400">
                <TrendingUp className="h-3 w-3 text-rose-400" />
                {comment.likes} likes
              </span>
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isPending && (
                <>
                  <button
                    onClick={() => onModerate(comment._id, 'approve')}
                    className="p-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded transition-colors"
                    title="Approve"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onModerate(comment._id, 'reject')}
                    className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded transition-colors"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => onModerate(comment._id, 'delete')}
                className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div className="px-5 pb-4 pl-[3.75rem] border-t border-zinc-100 dark:border-white/[0.04] pt-3 space-y-2">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-2"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Hide replies' : `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
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
                  <div key={reply._id} className="flex gap-3 p-3 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-xs font-semibold flex-shrink-0">
                      {(typeof reply.user === 'string' ? 'U' : reply.user.firstName?.[0]) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                          {typeof reply.user === 'string' ? 'User' : `${reply.user.firstName} ${reply.user.lastName}`}
                        </span>
                        <span className="text-[10px] text-zinc-400">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{reply.content}</p>
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
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Comment Feed</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Connect with your listeners and moderate conversations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo', icon: <MessageCircle className="h-5 w-5" /> },
          { label: 'Pending', value: stats.pending, color: 'amber', icon: <AlertCircle className="h-5 w-5" /> },
          { label: 'Approved', value: stats.approved, color: 'emerald', icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: 'Likes', value: stats.likes, color: 'rose', icon: <TrendingUp className="h-5 w-5" /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-5">
            <div className={`w-10 h-10 rounded flex items-center justify-center mb-3 bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-3">Moderation View</p>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-1 flex flex-col gap-0.5">
            {[
              { label: 'All Conversations', icon: <MessageCircle className="h-4 w-4" />, count: stats.total },
              { label: 'Requires Attention', icon: <AlertCircle className="h-4 w-4" />, count: stats.pending },
              { label: 'Approved Feed', icon: <CheckCircle2 className="h-4 w-4" />, count: stats.approved },
              { label: 'Filtered Out', icon: <XCircle className="h-4 w-4" />, count: stats.total - stats.approved - stats.pending }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded text-sm font-semibold transition-colors ${
                  activeTab === idx
                    ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && idx === 1 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Stream */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg py-20 text-center">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">No conversations yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  When listeners comment on your music or podcasts, they'll appear here.
                </p>
              </div>
            ) : (
              filteredComments.map((comment) => (
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
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-lg border border-zinc-200 dark:border-white/[0.06] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <ReplyIcon className="h-4 w-4" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Draft Reply</span>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Quoted comment */}
                <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-white/[0.04] rounded p-3 text-sm text-zinc-500 dark:text-zinc-400 italic">
                  "{selectedComment?.content}"
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full h-32 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] rounded text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    Post Reply
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
