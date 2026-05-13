import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, HelpCircle, MessageSquare, LifeBuoy, 
  ChevronRight, Search, FileText, Globe,
  Shield, CheckCircle2, Clock, AlertCircle,
  Mail, MessageCircle, Zap, Activity,
  ArrowUpRight, Layers, Target, Database,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';

export default function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await userService.createSupportTicket({ subject, message });
      toast.success('Your message has been sent. We will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How do I withdraw my earnings?",
      a: "You can withdraw your earnings once you reach the minimum threshold of $50. Visit the Financial Overview page to initiate a withdrawal.",
      category: "Finance"
    },
    {
      q: "How do I go live on the platform?",
      a: "To go live, click the 'Go Live' button on your dashboard. Ensure your camera and microphone permissions are enabled.",
      category: "Streaming"
    },
    {
      q: "How are gift values calculated?",
      a: "Gifts are converted to their cash equivalent minus a small platform processing fee. You can see the breakdown in your Gift History.",
      category: "Monetization"
    },
    {
      q: "Can I collaborate with other artists?",
      a: "Yes! You can set up revenue splits for collaborated tracks during the upload process or by editing an existing song.",
      category: "Collaboration"
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Support Center</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Help</span>
          </div>
        </div>
        <p className="text-zinc-500 font-medium max-w-xl">We're here to help you succeed. Browse our resources or contact our dedicated support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-8">
           <div className="premium-card p-10 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-6 mb-10">
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                   <MessageSquare className="text-emerald-500" size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Send a Message</h2>
                   <p className="text-sm text-zinc-500 mt-1">Our team typically responds within 24 hours.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Briefly describe your inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Message</label>
                  <textarea
                    placeholder="Tell us how we can help you today..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-white text-black rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
           </div>

           {/* FAQ Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <HelpCircle size={20} className="text-emerald-500" />
                  Common Inquiries
                </h3>
                <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">See All Resources</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {faqs.map((faq, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="premium-card p-8 group hover:border-emerald-500/20 transition-all cursor-pointer border-white/5 shadow-xl"
                   >
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">{faq.category}</span>
                        <ArrowUpRight size={16} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                     </div>
                     <h4 className="text-base font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{faq.q}</h4>
                     <p className="text-sm text-zinc-500 leading-relaxed font-medium line-clamp-2">{faq.a}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="premium-card p-8 border-white/5 shadow-xl bg-zinc-950/20">
              <h3 className="text-lg font-bold text-white mb-6">Support Channels</h3>
              <div className="space-y-4">
                 {[
                   { icon: Mail, label: 'Email Support', desc: 'support@lugmatic.com', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                   { icon: MessageCircle, label: 'Live Chat', desc: 'Available 9AM - 6PM EST', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
                   { icon: Globe, label: 'Help Center', desc: 'Detailed documentation', color: 'text-blue-500', bg: 'bg-blue-500/5' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-white/5 group hover:border-white/10 transition-all cursor-pointer shadow-inner">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} border border-white/5`}>
                         <item.icon size={18} className={item.color} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white">{item.label}</p>
                         <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="premium-card p-8 border-white/5 shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                 <Zap className="text-black" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Priority Support</h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">
                 Premium artists get access to our dedicated success managers and prioritized response times.
              </p>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all uppercase tracking-widest">Learn More</button>
           </div>
        </div>
      </div>
    </div>
  );
}
