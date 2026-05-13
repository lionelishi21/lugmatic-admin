import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

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
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = true,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onCancel}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden relative p-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border ${
                                isDestructive 
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                                {isDestructive ? <Trash2 size={32} /> : <AlertCircle size={32} />}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-3">{title}</h3>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-10 px-4">{message}</p>
                            
                            <div className="flex flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className={`w-full h-14 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
                                        isDestructive 
                                            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' 
                                            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                                    }`}
                                >
                                    {confirmLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full h-14 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
