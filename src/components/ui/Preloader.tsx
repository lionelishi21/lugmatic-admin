import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  isVisible: boolean;
  text?: string;
  fullScreen?: boolean;
  backgroundColor?: string;
  spinnerColor?: string;
}

const Preloader: React.FC<PreloaderProps> = ({
  isVisible,
  text = 'SYNCHRONIZING...',
  fullScreen = true,
  backgroundColor = 'rgba(0, 0, 0, 0.8)',
  spinnerColor = '#10b981' // emerald-500
}) => {
  if (!isVisible) return null;
  
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-md" 
    : "absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm";

  return (
    <AnimatePresence>
      <motion.div 
        className={containerClasses}
        style={{ backgroundColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1
          }}
        >
          {/* HUD Tactical Loader */}
          <div className="relative h-20 w-20 mb-6 flex items-center justify-center">
            {/* Outer Hexagon/Ring Decoration */}
            <motion.div 
              className="absolute inset-0 border border-emerald-500/20 rounded-xl rotate-45"
              animate={{ rotate: 405 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            />
            
            {/* Spinning Main Ring */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ 
                borderTopColor: spinnerColor,
                borderRightColor: `${spinnerColor}40`
              }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                ease: "linear", 
                repeat: Infinity 
              }}
            />
            
            {/* Inner HUD Bit */}
            <div className="w-10 h-10 border border-white/5 bg-zinc-950 rounded flex items-center justify-center">
               <motion.div
                 className="w-4 h-4 rounded-sm"
                 style={{ backgroundColor: spinnerColor }}
                 animate={{ 
                   scale: [0.8, 1.2, 0.8],
                   opacity: [0.4, 1, 0.4]
                 }}
                 transition={{
                   duration: 1.5,
                   ease: "easeInOut",
                   repeat: Infinity,
                 }}
               />
            </div>

            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-emerald-500" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-500" />
          </div>
          
          <div className="flex flex-col items-center text-center">
             <motion.p 
               className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic mb-2"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               {text}
             </motion.p>
             <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">
               System Health: Nominal // Latency: Low
             </p>
          </div>
          
          {/* Data Pulse Indicators */}
          <div className="flex space-x-1.5 mt-6">
            {[0, 1, 2, 3, 4].map((dot) => (
              <motion.div
                key={dot}
                className="w-1 h-1 rounded-full bg-emerald-500/20"
                animate={{ 
                  backgroundColor: [
                    "rgba(16, 185, 129, 0.2)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(16, 185, 129, 0.2)"
                  ]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: dot * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;