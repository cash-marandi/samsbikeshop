
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string | null;
  duration?: number; // Duration in milliseconds, defaults to 3000 (3 seconds)
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
    // Give time for animation before calling onClose
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
    <div
      className={`fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 border-2 border-orange-500
        ${isVisible ? 'block' : 'hidden'}`}
      style={{ zIndex: 1000 }} // Ensure it's above other content
    >
      {message}
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default Toast;
