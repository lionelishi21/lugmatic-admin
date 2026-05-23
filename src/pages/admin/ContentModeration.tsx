import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Trash2, Play, AlertCircle, Edit,
  ChevronRight, MoreVertical, Clock, User, Music, Check,
  X, Search, Filter, ShieldAlert, MessageSquare, Mic,
  Disc, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';

interface ModerationItem {
  _id: string;
  name?: string;
  title?: string;
  content?: string;
  artist?: string | { name: string };
  author?: { firstName: string; lastName: string; profilePicture?: string };
  coverArt?: string;
  coverImage?: string;
  isApproved?: boolean;
  isFlagged?: boolean;
  createdAt: string;
}

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const tabConfigs = [
    { label: 'Songs', type: 'songs', icon: Music },
    { label: 'Albums', type: 'albums', icon: Disc },
    { label: 'Podcasts', type: 'podcasts', icon: Mic },
    { label: 'Comments', type: 'comments', icon: MessageSquare },
  ];

  const fetchContent = async () => {
    setLoading(true);
    try {
      const contentType = tabConfigs[activeTab].type;
      const response = await adminService.getContentForModeration(contentType, page, 12);
      if (response.data.success && response.data.data) {
        setItems(response.data.data);
        if (response.data.pagination) setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      toast.error('Failed to synchronize moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab, page]);

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    const loadingId = toast.loading(`Processing ${action}...`);
    try {
      const contentType = tabConfigs[activeTab].type;
      await adminService.moderateContent(contentType, itemId, action, reason);
      toast.success(`Content ${action}ed`, { id: loadingId });
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err: any) {
      toast.error('Operation failed', { id: loadingId });
    }
  };

  if (loading && items.length === 0) return <Preloader isVisible={true} text="Auditing quality queue..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-emerald-500" size={32} />
            Content Moderation
          </h1>
          <p className="text-zinc-500">Review and verify pending transmissions for platform integrity.</p>
        </div>
        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 gap-1 overflow-x-auto no-scrollbar">
          {tabConfigs.map((tab, index) => (
            <button
              key={index}
              onClick={() => { setActiveTab(index); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === index ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="premium-card py-24 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-zinc-500 font-medium italic">Queue clear. No pending units detected.</p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => {
                const isComment = tabConfigs[activeTab].type === 'comments';
                const title = item.title || item.name || (isComment ? 'User Comment' : 'Untitled');
                const image = item.coverArt || item.coverImage;
                const subtitle = isComment
                  ? `${item.author?.firstName || 'Unknown'} ${item.author?.lastName || ''}`
                  : (typeof item.artist === 'object' ? (item.artist as any).name : item.artist) || 'Unknown Artist';

                return (
                  <motion.div
                    key={item._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="premium-card group hover:border-emerald-500/20 transition-all flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 ${isComment ? 'rounded-full' : ''}`}>
                        {(image || item.author?.profilePicture) ? (
                          <img src={isComment ? item.author?.profilePicture : image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Play size={20} className="text-zinc-800" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{title}</h3>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">{subtitle}</p>
                      </div>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                      {isComment && (
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl italic">
                          <p className="text-xs text-zinc-400 leading-relaxed">"{item.content}"</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                          <Clock size={12} />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        {item.isFlagged && (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20 rounded">Flagged</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleAction(item._id, 'approve')}
                        className="btn-primary !py-2 !px-0 flex items-center justify-center gap-1.5 text-[10px]"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button 
                        onClick={() => { setSelectedItem(item); setRejectReason(''); setRejectDialogOpen(true); }}
                        className="btn-secondary !py-2 !px-0 flex items-center justify-center gap-1.5 text-[10px] text-amber-500 border-amber-500/10 hover:border-amber-500/20 hover:bg-amber-500/5"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                      <button 
                        onClick={() => handleAction(item._id, 'delete')}
                        className="btn-secondary !py-2 !px-0 flex items-center justify-center gap-1.5 text-[10px] text-rose-500 border-rose-500/10 hover:border-rose-500/20 hover:bg-rose-500/5"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      page === i + 1 ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Reject Dialog */}
      <AnimatePresence>
        {rejectDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setRejectDialogOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Reject Content</h3>
                <button onClick={() => setRejectDialogOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Rejection Reason</label>
                  <textarea
                    autoFocus placeholder="Specify violation or error..."
                    className="input-field h-32 resize-none"
                    value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button onClick={() => setRejectDialogOpen(false)} className="btn-secondary">Cancel</button>
                  <button 
                    onClick={() => { if (selectedItem) handleAction(selectedItem._id, 'reject', rejectReason); setRejectDialogOpen(false); }}
                    className="btn-primary !bg-amber-500 !text-black hover:!bg-amber-400"
                  >
                    Confirm Rejection
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

export default ContentModeration;