import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as ApproveIcon,
  XCircle as RejectIcon,
  Trash2 as DeleteIcon,
  Play as PlayIcon,
  AlertTriangle as FlagIcon,
  Edit as EditIcon,
  ChevronRight,
  MoreVertical,
  Clock,
  User,
  Music,
  Check,
  X,
  Search,
  Filter
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const tabConfigs = [
    { label: 'Songs', type: 'songs', icon: Music },
    { label: 'Albums', type: 'albums', icon: PlayIcon },
    { label: 'Podcasts', type: 'podcasts', icon: PlayIcon },
    { label: 'Comments', type: 'comments', icon: FlagIcon },
  ];

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const contentType = tabConfigs[activeTab].type;
      const response = await adminService.getContentForModeration(contentType, page, 12);

      if (response.data.success && response.data.data) {
        setItems(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch content');
      }
    } catch (err: any) {
      console.error('Error fetching moderation content:', err);
      setError(err.message || 'An error occurred while fetching content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab, page]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setPage(1);
  };

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    try {
      const contentType = tabConfigs[activeTab].type;
      const response = await adminService.moderateContent(contentType, itemId, action, reason);

      if (response.data.success) {
        toast.success(`Content successfully ${action}ed`);
        setItems((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        throw new Error(response.data.message || `Failed to ${action} content`);
      }
    } catch (err: any) {
      console.error(`Error moderating content:`, err);
      toast.error(err.message || 'An error occurred');
    }
  };

  const openRejectDialog = (item: ModerationItem) => {
    setSelectedItem(item);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedItem) {
      handleAction(selectedItem._id, 'reject', rejectReason);
    }
    setRejectDialogOpen(false);
  };

  const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg overflow-hidden flex flex-col group hover:border-emerald-500/20 transition-all shadow-2xl relative";
  
  const renderItemCard = (item: ModerationItem) => {
    const isComment = tabConfigs[activeTab].type === 'comments';
    const title = item.title || item.name || (isComment ? 'Comment Entry' : 'Unknown Unit');
    const image = item.coverArt || item.coverImage;
    const subtitle = isComment
      ? `${item.author?.firstName || 'Unknown'} ${item.author?.lastName || ''}`
      : (typeof item.artist === 'object' ? item.artist?.name : item.artist) || 'Unknown Artist';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cardClass}
        key={item._id}
      >
        <div className="p-5 border-b border-white/5 bg-zinc-800/30">
          <div className="flex items-center gap-4">
            <div className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden bg-zinc-950 border border-white/10 ${isComment ? 'rounded-full' : ''}`}>
              {(image || item.author?.profilePicture) ? (
                <img
                  src={isComment ? item.author?.profilePicture : image}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <PlayIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="min-w-0">
               <h3 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{title}</h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex-grow space-y-4">
          {isComment && (
            <div className="bg-zinc-950 border border-white/5 p-3 rounded italic">
               <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed">
                 "{item.content}"
               </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">{new Date(item.createdAt).toLocaleDateString()}</span>
             </div>
             {item.isFlagged && (
               <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20 italic rounded">
                 FLAGGED
               </span>
             )}
          </div>
        </div>

        <div className="p-5 pt-0 mt-auto grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAction(item._id, 'approve')}
            className="py-3 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all italic flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Check className="w-3 h-3" />
            Approve
          </button>
          <button
            onClick={() => openRejectDialog(item)}
            className="py-3 bg-zinc-800 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded border border-white/5 hover:bg-zinc-700 transition-all italic flex items-center justify-center gap-1.5"
          >
            <RejectIcon className="w-3 h-3" />
            Reject
          </button>
          <button
            onClick={() => handleAction(item._id, 'delete')}
            className="py-3 bg-zinc-800 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded border border-white/5 hover:bg-zinc-700 transition-all italic flex items-center justify-center gap-1.5"
          >
            <DeleteIcon className="w-3 h-3" />
            Purge
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading && items.length === 0) {
    return <Preloader isVisible={true} text="Verifying integrity..." />;
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 px-6 space-y-8">
      {/* Header */}
      <div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Operational Moderation</p>
         <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
           Content Integrity
         </h1>
         <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
           Review and sanitize pending transmissions across the grid.
         </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900 border border-white/5 p-1.5 rounded-lg w-full max-w-2xl">
        {tabConfigs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded transition-all italic flex items-center justify-center gap-2 ${
              activeTab === index 
                ? 'bg-emerald-500 text-black shadow-lg' 
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded text-xs font-black uppercase tracking-widest italic mb-6">
          SCAN ERROR: {error}
        </div>
      )}

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${cardClass} py-24 text-center border-dashed`}
        >
          <div className="w-16 h-16 rounded bg-zinc-950 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">INTEGRITY CHECK COMPLETE. NO PENDING UNITS IN THIS FREQUENCY.</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map(renderItemCard)}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-8">
               {Array.from({ length: totalPages }).map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setPage(i + 1)}
                   className={`w-10 h-10 rounded text-[10px] font-black uppercase italic border transition-all ${
                     page === i + 1 
                       ? 'bg-emerald-500 text-black border-emerald-500' 
                       : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'
                   }`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Dialog */}
      <AnimatePresence>
        {rejectDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1 italic">Rejection Protocol</p>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Enter Reason</h2>
                </div>
                
                <textarea
                  autoFocus
                  placeholder="SPECIFY VIOLATION OR ERROR..."
                  className="w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-bold italic uppercase tracking-tight h-32 resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />

                <div className="flex justify-end gap-4 pt-2">
                  <button
                    onClick={() => setRejectDialogOpen(false)}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="px-8 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-amber-400 transition-all shadow-xl italic"
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