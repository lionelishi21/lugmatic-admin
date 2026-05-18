import { useState } from 'react';
import { X, Copy, Check, Twitter, MessageCircle, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ShareModalProps {
  type: 'song' | 'stream';
  id: string;
  title: string;
  artist?: string;
  onClose: () => void;
}

export default function ShareModal({ type, id, title, artist, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${type === 'song' ? 'song' : 'stream'}/${id}`;
  const shareText = type === 'song'
    ? `Listen to "${title}"${artist ? ` by ${artist}` : ''} on Lugmatic`
    : `Watch "${title}" live on Lugmatic`;

  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-HTTPS connections
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
      toast.error('Failed to copy link');
    }
  };

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg w-full max-w-md p-6 space-y-5"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Share</h2>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[280px]">
                {title}{artist ? ` · ${artist}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info banner */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-4 py-3">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Anyone with this link can {type === 'song' ? 'listen to this track' : 'watch this stream'} — no login or account needed.
            </p>
          </div>

          {/* URL field */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded px-3 py-2.5 min-w-0">
              <Link className="h-3.5 w-3.5 text-zinc-400 flex-none" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">{shareUrl}</span>
            </div>
            <button
              onClick={copy}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded text-xs font-semibold flex-none transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Social share */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Share via</p>
            <div className="flex gap-2">
              <button
                onClick={shareTwitter}
                className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20 rounded text-xs font-semibold hover:bg-[#1DA1F2]/20 transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" />
                Twitter / X
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
