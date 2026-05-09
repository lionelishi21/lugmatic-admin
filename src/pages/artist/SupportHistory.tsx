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
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';
const inputClass = 'w-full px-5 py-3 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 italic">
            <ShieldCheck className="h-2.5 w-2.5" />
            {status}
          </span>
        );
      case 'in-progress':
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 italic">
            <Activity className="h-2.5 w-2.5 animate-pulse" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/20 italic">
            <Clock className="h-2.5 w-2.5" />
            {status}
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 animate-in fade-in duration-700">
      
      {/* ── Branded Header HUD ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <button 
            onClick={() => navigate('/artist/support')}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 hover:bg-emerald-500 hover:text-white text-zinc-500 rounded-xl transition-all border border-white/[0.06] shadow-xl group/back"
          >
            <ChevronLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Uplink Log</p>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">Support History</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Track the status of your reported issues and protocol inquiries.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Link 
            to="/artist/support"
            className="h-11 flex items-center justify-center gap-3 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          >
            New Request
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Ticket Feed HUD ── */}
      <div className={`${card} overflow-hidden shadow-2xl`}>
        <div className="p-6 border-b border-white/[0.06] flex flex-col sm:flex-row gap-6 justify-between items-center bg-zinc-50/30 dark:bg-zinc-950/20">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH LOGS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass + " pl-12 h-11"}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 rounded-xl border border-white/[0.02] text-emerald-500 shadow-inner">
               <History className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{tickets.length} RECORDS</span>
            </div>
            <button className="w-11 h-11 flex items-center justify-center bg-zinc-950 border border-white/[0.06] rounded-xl text-zinc-500 hover:text-white transition-all shadow-inner">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
          {loading ? (
            <div className="p-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/10 border-t-emerald-500"></div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-6 italic">Synchronizing Log Data...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-24 text-center">
              <div className="p-6 bg-zinc-950 rounded-3xl inline-block mb-6 border border-zinc-900 shadow-inner">
                <MessageSquare className="h-10 w-10 text-zinc-700" />
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Zero Log Entries</h3>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-black opacity-60">Any support requests you submit will emerge in this registry.</p>
              <Link 
                to="/artist/support"
                className="inline-flex items-center gap-3 mt-8 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Submit New Request
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket._id} className="p-8 hover:bg-emerald-500/[0.02] transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                <div className="flex items-start justify-between gap-8 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      {getStatusBadge(ticket.status)}
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">{ticket.category}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white truncate mb-2 group-hover:text-emerald-500 transition-colors uppercase italic tracking-tight">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                      {ticket.message}
                    </p>
                  </div>
                  <Link 
                    to={`/artist/support/ticket/${ticket._id}`}
                    className="w-12 h-12 flex items-center justify-center bg-zinc-950 text-zinc-500 rounded-xl border border-white/[0.04] group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all shadow-inner"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

