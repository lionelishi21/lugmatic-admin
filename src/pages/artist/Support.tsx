import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  Send,
  Loader2,
  FileText,
  ChevronRight,
  Search,
  BookOpen,
  Mail,
  Zap,
  Headphones,
  GraduationCap,
  History,
  LifeBuoy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';

export default function Support() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'technical',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userService.createSupportTicket(ticketData);
      toast.success('Support ticket created successfully! We will contact you soon.');
      setTicketData({ subject: '', category: 'technical', message: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "Revenue Discrepancy", a: "Earnings are processed monthly. Once you reach the $50 threshold, you can request a payout via your chosen method in Settings." },
    { q: "Mastering Standards", a: "We support MP3 and WAV files up to 50MB per track for the best quality playback." },
    { q: "Transmission Latency", a: "Go to the Live section, set your title, and click Go Live. Make sure your browser has camera permissions." }
  ];

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-white text-sm px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-1";

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <LifeBuoy className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Operations Support</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Command Assistance
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               We're here to help you navigate and succeed on Lugmatic.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: FAQ & Resources ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* FAQ Card */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                   <BookOpen className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Knowledge Base</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="group relative pl-6">
                   <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight italic">
                    {faq.q}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1.5 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
              <button className="w-full h-11 border border-dashed border-zinc-200 dark:border-white/[0.1] text-zinc-500 dark:text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2 group">
                Deep Documentation
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Artist Academy Card */}
          <div className={`${card} p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 group hover:border-zinc-300 dark:hover:border-white/10 transition-all`}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-5 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic mb-2">Artist Academy</h3>
            <p className="text-xs text-zinc-500 mb-5 font-medium leading-relaxed">Master the platform mechanics. Learn to scale your fanbase and optimize your transmission revenue.</p>
            <button className="h-9 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-black/10">
              Initiate Training
            </button>
          </div>
        </div>

        {/* ── Right Column: Ticket Form + Links ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Submit a Request Card */}
          <div className={card}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-white/5">
                   <MessageCircle className="h-4 w-4 text-zinc-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Relay Transmission</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Sector / Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                    className={inputClass}
                  >
                    <option value="technical">Technical Operations</option>
                    <option value="billing">Revenue & Payouts</option>
                    <option value="copyright">Intellectual Property</option>
                    <option value="feature">System Upgrade Request</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Signal Subject</label>
                  <input
                    type="text"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    className={inputClass}
                    placeholder="Short summary..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Signal Content</label>
                <textarea
                  value={ticketData.message}
                  onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                  rows={8}
                  className={inputClass + " resize-none"}
                  placeholder="Describe your operational bottleneck..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-white/5">
                     <Mail className="h-3 w-3" />
                  </div>
                  Latency: ~24hr Response Cycle
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full sm:w-auto flex items-center justify-center gap-3 px-8 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/artist/support/history"
              className={`${card} p-5 flex items-center gap-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all group`}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 border border-transparent group-hover:border-emerald-500/20 transition-all">
                <History className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Mission Log</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Support History</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-all" />
            </Link>

            <div className={`${card} p-5 flex items-center gap-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all group cursor-pointer`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500 border border-transparent group-hover:border-blue-500/20 transition-all">
                <Search className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Search Grid</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Instant Solutions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
