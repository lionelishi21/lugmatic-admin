import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Filter, Trash2, ShieldAlert, 
  CheckCircle2, XCircle, MoreVertical, User, Clock,
  BarChart3, TrendingUp, AlertTriangle, RefreshCw,
  ChevronDown, ChevronRight, MessageCircle, ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Preloader from '../../components/ui/Preloader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  targetType: 'song' | 'album' | 'podcast';
  targetId: {
    _id: string;
    name?: string;
    title?: string;
  };
  isApproved: boolean;
  isFlagged: boolean;
  createdAt: string;
}

const CommentManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Using the moderation endpoint as a base, filtering for comments
      const response = await adminService.getContentForModeration('comments', page, 15);
      if (response.data.success && response.data.data) {
        setComments(response.data.data);
        if (response.data.pagination) setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      toast.error('Failed to synchronize community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    const loadingId = toast.loading(`Processing ${action}...`);
    try {
      await adminService.moderateContent('comments', id, action);
      toast.success(`Comment ${action}ed`, { id: loadingId });
      setComments(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Operation failed', { id: loadingId });
    }
  };

  const filteredComments = comments.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = c.content.toLowerCase().includes(q) || 
                         `${c.author?.firstName} ${c.author?.lastName}`.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || (filter === 'flagged' && c.isFlagged) || (filter === 'pending' && !c.isApproved);
    return matchesSearch && matchesFilter;
  });

  if (loading && comments.length === 0) return <Preloader isVisible={true} text="Auditing community sentiment..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 flex items-center gap-3 uppercase">
            <MessageCircle className="text-blue-500" size={32} />
            Comment Moderation
          </h1>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Moderate community discussions and comments.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="premium-card !py-2 !px-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">System: Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Interactions', value: comments.length, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Flagged Content', value: comments.filter(c => c.isFlagged).length, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { label: 'Safe Sentiment', value: '94.2%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1.5 italic">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight italic uppercase">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by content or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
            >
              <option value="all">All Content</option>
              <option value="flagged">Flagged Only</option>
              <option value="pending">Pending Review</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Comment Content</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <MessageCircle className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium italic">No comments found.</p>
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center">
                          {comment.author?.profilePicture ? (
                            <img src={comment.author.profilePicture} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <User size={18} className="text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-400 transition-colors">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase flex items-center gap-2">
                            <Clock size={10} /> {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic line-clamp-2">"{comment.content}"</p>
                        {comment.isFlagged && (
                          <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[9px] font-bold uppercase tracking-widest">
                            <AlertTriangle size={10} /> Highly Suspicious
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{comment.targetType}</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                          {comment.targetId?.name || comment.targetId?.title || 'Unknown Asset'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!comment.isApproved && (
                          <button 
                            onClick={() => handleAction(comment._id, 'approve')} 
                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                            title="Approve"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(comment._id, 'reject')} 
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-all"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => setCommentToDelete(comment._id)} 
                          className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!commentToDelete}
        title="Delete Comment?"
        message="Are you sure you want to permanently delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => commentToDelete && handleAction(commentToDelete, 'delete')}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default CommentManagement;