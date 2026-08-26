'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      timerRef.current = setTimeout(hideToast, duration);
    } else {
      hideToast();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, duration, hideToast]);

  if (!message) return null;

  const toastContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          className="fixed bottom-8 right-8 bg-ink-900 text-white px-6 py-4 rounded-xl border border-flame-500/30 shadow-large flex items-center gap-3"
          style={{ zIndex: 9999 }}
        >
          <div className="w-2 h-2 rounded-full bg-flame-500 flex-shrink-0" />
          <span className="text-sm font-medium">{message}</span>
          <button 
            onClick={hideToast}
            className="ml-2 text-ink-400 hover:text-white transition-colors"
            aria-label="Close toast"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {/* Progress bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-0.5 bg-flame-500 rounded-b-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(toastContent, document.body);
};

export default Toast;
