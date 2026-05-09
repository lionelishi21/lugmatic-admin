import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'CONFIRM_ACTION',
    cancelLabel = 'ABORT_PROTOCOL',
    onConfirm,
    onCancel,
    isDestructive = true,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onCancel}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px] rounded-full pointer-events-none" />
                        
                        <div className="px-8 py-8 text-center relative">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${
                                isDestructive 
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                                {isDestructive ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                            </div>
                            
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 italic">Security Authorization Required</p>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">{title}</h3>
                            <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed italic mb-8 px-4">{message}</p>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded transition-all italic shadow-xl ${
                                        isDestructive 
                                            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' 
                                            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-900/20'
                                    }`}
                                >
                                    {confirmLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>

                        {/* HUD Decoration */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
