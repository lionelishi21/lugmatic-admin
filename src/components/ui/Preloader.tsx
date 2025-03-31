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
  text = 'Loading...',
  fullScreen = true,
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  spinnerColor = '#22c55e' // green-500
}) => {
  if (!isVisible) return null;
  
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center z-50" 
    : "absolute inset-0 flex items-center justify-center z-10";

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
          className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1
          }}
        >
          <div className="relative h-14 w-14 mb-3">
            {/* Rotating outer ring */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              style={{ 
                border: `4px solid ${spinnerColor}`,
                borderTopColor: 'transparent' 
              }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.2, 
                ease: "linear", 
                repeat: Infinity 
              }}
            />
            
            {/* Pulsing inner circle */}
            <motion.div
              className="absolute inset-3 rounded-full"
              style={{ backgroundColor: spinnerColor }}
              animate={{ scale: [0.8, 1.1, 0.8] }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
          
          <motion.p 
            className="text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
          </motion.p>
          
          {/* Animated dots */}
          <motion.div className="flex space-x-1 mt-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: spinnerColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader; 