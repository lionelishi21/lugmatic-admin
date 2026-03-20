import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  LifeBuoy, 
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

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
            <LifeBuoy className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Support</h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">We're here to help you succeed on Lugmatic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: FAQ & Resources */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Quick FAQ
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="group">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 opacity-50" />
                    {faq.q}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 border border-dashed border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              View All Documentation
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
            <Zap className="h-6 w-6 text-blue-300 mb-4" />
            <h3 className="text-lg font-bold mb-2 font-display">Artist Academy</h3>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">Learn how to grow your fanbase and maximize your earnings with our exclusive guides.</p>
            <button className="px-5 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
              Start Learning
            </button>
          </div>
        </div>

        {/* Right Column: Ticket Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              Submit a Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                    className={inputClass}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Earnings & Payouts</option>
                    <option value="copyright">Copyright & Content</option>
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

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                  <Mail className="h-3 h-3" />
                  Response time: Usually within 24 hours
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Support History</p>
                <p className="text-xs text-gray-500">View your active tickets</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Help Center</p>
                <p className="text-xs text-gray-500">Search for solutions</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}