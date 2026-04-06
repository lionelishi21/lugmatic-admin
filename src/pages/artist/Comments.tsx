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
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
import toast from 'react-hot-toast';

// Sub-component for individual comment cards
const CommentItem = ({ comment, onModerate, onReplyOpen, expanded, onToggleExpand }: any) => {
  const statusStyles = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-50 text-emerald-600';
      case 'rejected': return 'bg-rose-50 text-rose-600';
      case 'pending': return 'bg-amber-50 text-amber-600';
      default: return 'bg-zinc-50 text-zinc-500';
    }
  };

  const isPending = comment.moderationStatus === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white rounded-[2.5rem] p-8 transition-all duration-300 border border-zinc-100 hover:scale-[1.01] hover:shadow-2xl hover:shadow-zinc-200/50 ${
        isPending && 'ring-2 ring-amber-500/10 bg-amber-50/5'
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Avatar SoftUI */}
        <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
          {(typeof comment.user === 'string' ? "U" : comment.user.firstName?.[0]) || "U"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-black text-zinc-900 group-hover:text-emerald-600 transition-colors">
                {typeof comment.user === 'string' ? "User" : `${comment.user.firstName} ${comment.user.lastName}`}
              </h4>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles(comment.moderationStatus)}`}>
                {comment.moderationStatus}
              </span>
              {comment.isEdited && (
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">Edited</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <button className="text-zinc-200 hover:text-zinc-400 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-base leading-relaxed text-zinc-600 font-medium mb-6">
            {comment.content}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={onReplyOpen}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <ReplyIcon className="h-3.5 w-3.5" />
                Reply
              </button>
              <div className="flex items-center px-4 py-2.5 bg-zinc-50 rounded-xl text-[10px] font-bold text-zinc-400 gap-2 border border-zinc-100">
                <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                {comment.likes} Massive Big Ups
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isPending && (
                <>
                  <button 
                    onClick={() => onModerate(comment._id, 'approve')}
                    className="p-3 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => onModerate(comment._id, 'reject')}
                    className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </>
              )}
              <button 
                onClick={() => onModerate(comment._id, 'delete')}
                className="p-3 text-zinc-300 bg-zinc-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Replies Rendering */}
      {comment.replies?.length > 0 && (
        <div className="mt-8 border-t border-zinc-50 pt-8 pl-12 space-y-6">
          <button 
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-500 transition-colors mb-4"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Hide Conversations" : `Show ${comment.replies.length} Massive Replies`}
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                {comment.replies.map((reply: any) => (
                  <div key={reply._id} className="flex gap-4 p-5 rounded-[1.5rem] bg-zinc-50/50 border border-zinc-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 font-bold text-xs shrink-0">
                      {(typeof reply.user === 'string' ? "U" : reply.user.firstName?.[0]) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-zinc-900">
                          {typeof reply.user === 'string' ? "User" : `${reply.user.firstName} ${reply.user.lastName}`}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-zinc-600 font-medium">{reply.content}</p>
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
      toast.error(`Action failed`);
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
    <div className="max-w-6xl mx-auto px-6 py-10 bg-zinc-50/40 min-h-screen font-['Geist'] text-zinc-900">
      {/* Header - Soft Elevation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-zinc-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-zinc-100"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-['Bebas_Neue'] uppercase leading-none">
              Comment Feed
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Connect with your listeners and moderate conversations.
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Likes', value: stats.likes, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`px-4 py-3 rounded-2xl ${stat.bg} border border-zinc-100/50 flex flex-col items-center min-w-[100px]`}>
              <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar - SoftUI Style */}
        <div className="space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 px-6 mb-4">Moderation View</p>
            <div className="bg-white/80 rounded-[2rem] p-3 border border-zinc-100 shadow-xl shadow-zinc-100/50 flex flex-col gap-1">
              {[
                { label: 'All Conversations', icon: <MessageCircle className="h-4 w-4" />, count: stats.total },
                { label: 'Requires Attention', icon: <AlertCircle className="h-4 w-4" />, count: stats.pending },
                { label: 'Approved Feed', icon: <CheckCircle2 className="h-4 w-4" />, count: stats.approved },
                { label: 'Filtered Out', icon: <XCircle className="h-4 w-4" />, count: stats.total - stats.approved - stats.pending }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-[1.2rem] text-sm font-bold transition-all ${
                    activeTab === idx 
                    ? 'bg-zinc-900 text-white shadow-lg' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  {item.count > 0 && idx === 1 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-[10px] rounded-full shadow-sm">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Stream */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 grayscale opacity-30">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="bg-white rounded-[3rem] border border-dashed border-zinc-200/60 p-24 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-zinc-100">
                  <MessageSquare className="h-10 w-10 text-zinc-200" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 italic">No Conversations Yet</h3>
                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto font-medium">
                  When listeners comment on your music or podcasts, they'll appear here for moderation.
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

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100"
            >
              <div className="bg-gradient-to-br from-zinc-50 to-white p-8 border-b border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-emerald-500">
                    <ReplyIcon className="h-6 w-6" />
                    <h3 className="text-2xl font-extrabold font-['Bebas_Neue'] uppercase tracking-tight text-zinc-900">
                      Draft Reply
                    </h3>
                  </div>
                  <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <X className="h-5 w-5 text-zinc-400" />
                  </button>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 italic text-sm text-zinc-500">
                  "{selectedComment?.content}"
                </div>
              </div>
              
              <div className="p-8">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the massive..."
                  className="w-full h-40 p-6 bg-white rounded-[1.5rem] border border-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium resize-none shadow-inner"
                />
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 h-14 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-[1.2rem] transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="flex-[2] h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-[1.2rem] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Post Response
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