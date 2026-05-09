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
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

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
    { q: "How do I get paid?", a: "Earnings are processed monthly. Once you reach the $50 threshold, you can request a payout via your chosen method in Settings." },
    { q: "What audio formats are supported?", a: "We support MP3 and WAV files up to 50MB per track for the best quality playback." },
    { q: "How do I start a Live Stream?", a: "Go to the Live section, set your title, and click Go Live. Make sure your browser has camera permissions." }
  ];

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20";
  const labelClass = "block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5";

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Artist Support</h1>
        <p className="text-sm text-zinc-500 mt-0.5">We're here to help you succeed on Lugmatic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: FAQ & Resources */}
        <div className="lg:col-span-1 space-y-6">

          {/* FAQ Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Quick FAQ</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="group">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                    {faq.q}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed pl-5">{faq.a}</p>
                </div>
              ))}
              <button className="w-full mt-2 py-2 border border-dashed border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400 rounded text-xs font-semibold hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                View All Documentation
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Artist Academy Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-5">
            <div className="w-10 h-10 rounded flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Artist Academy</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">Learn how to grow your fanbase and maximize your earnings with our exclusive guides.</p>
            <button className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Start Learning
            </button>
          </div>
        </div>

        {/* Right Column: Ticket Form + Links */}
        <div className="lg:col-span-2 space-y-6">

          {/* Submit a Request Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Submit a Request</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                    className={inputClass}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Earnings &amp; Payouts</option>
                    <option value="copyright">Copyright &amp; Content</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <input
                    type="text"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    className={inputClass}
                    placeholder="Brief summary of your issue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={ticketData.message}
                  onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                  rows={8}
                  className={inputClass + " resize-none"}
                  placeholder="Tell us more about what's happening..."
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                  <Mail className="h-3 w-3" />
                  Response time: Usually within 24 hours
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/artist/support/history"
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-5 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <div className="w-10 h-10 rounded flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Support History</p>
                <p className="text-xs text-zinc-500">View your active tickets</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />
            </Link>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Search className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Help Center</p>
                <p className="text-xs text-zinc-500">Search for solutions</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
