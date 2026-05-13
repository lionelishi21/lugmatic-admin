import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PreloaderProps {
  isVisible: boolean;
  text?: string;
  fullScreen?: boolean;
  backgroundColor?: string;
  spinnerColor?: string;
}

const Preloader: React.FC<PreloaderProps> = ({
  isVisible,
  text = 'Loading',
  fullScreen = true,
  backgroundColor = 'rgba(0, 0, 0, 0.85)',
  spinnerColor = '#10b981'
}) => {
  if (!isVisible) return null;
  
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-xl" 
    : "absolute inset-0 flex items-center justify-center z-10 backdrop-blur-md";

  return (
    <AnimatePresence>
      <motion.div 
        className={containerClasses}
        style={{ backgroundColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-24 w-24 mb-8 flex items-center justify-center">
            <motion.div 
              className="absolute inset-0 rounded-full border-[3px] border-white/5"
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-[3px] border-transparent"
              style={{ borderTopColor: spinnerColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            />
            <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
               <Loader2 className="animate-spin text-emerald-500" size={24} />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
             <motion.p 
               className="text-sm font-bold text-white uppercase tracking-[0.2em]"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
             >
               {text}
             </motion.p>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest opacity-60">
               Please wait a moment
             </p>
          </div>

          <div className="flex gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;