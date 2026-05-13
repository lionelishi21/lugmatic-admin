import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  LifeBuoy,
  History,
  Activity,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Inbox
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  message: string;
  status: 'pending' | 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
}

export default function SupportHistory() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserSupportTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            <ShieldCheck size={12} />
            Resolved
          </span>
        );
      case 'in-progress':
      case 'open':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
            <Activity size={12} className="animate-pulse" />
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/artist/support')} className="w-14 h-14 flex items-center justify-center bg-zinc-950 text-zinc-500 rounded-2xl border border-white/5 hover:text-white transition-all shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Support History</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Connected</span>
              </div>
            </div>
            <p className="text-zinc-500 font-medium">Track the status of your reported issues and community requests.</p>
          </div>
        </div>
        
        <Link to="/artist/support" className="h-14 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3">
          New Ticket
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Ticket List Container */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl rounded-[3rem]">
        <div className="px-10 py-8 border-b border-white/5 flex flex-col sm:flex-row gap-8 justify-between items-center bg-zinc-950/20">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-16 h-14"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl border border-white/5 text-zinc-500">
               <History size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">{tickets.length} Records</span>
            </div>
            <button className="w-14 h-14 flex items-center justify-center bg-zinc-950 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all shadow-inner">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-40 text-center flex flex-col items-center gap-6">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Support Records</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-40 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                  <Inbox size={40} className="text-zinc-800" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">No support history</h3>
                <p className="text-sm text-zinc-500 mt-3 font-medium max-w-sm mx-auto">Any support requests you submit will appear here in your personal history.</p>
                <Link to="/artist/support" className="inline-flex items-center gap-3 mt-10 px-10 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl border border-white/5">
                  Submit New Request
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              filteredTickets.map((ticket, i) => (
                <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-10 hover:bg-white/[0.01] transition-all group relative">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-5">
                        {getStatusBadge(ticket.status)}
                        <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">{ticket.category}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} />
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white truncate mb-3 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {ticket.subject}
                      </h3>
                      <p className="text-base text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                        {ticket.message}
                      </p>
                    </div>
                    <Link to={`/artist/support/ticket/${ticket._id}`} className="w-14 h-14 flex items-center justify-center bg-zinc-950 text-zinc-700 rounded-2xl border border-white/5 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500 transition-all shadow-xl self-end md:self-center">
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
