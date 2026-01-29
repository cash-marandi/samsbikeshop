
'use client';
import React from 'react';
import Toast from './Toast';
import { useCart } from '../context/CartContext';

const ToastDisplay: React.FC = () => {
  const { toastMessage, showToast } = useCart();

  const handleCloseToast = () => {
    // Calling showToast with null effectively hides the current toast
    // and resets the message. The Toast component itself handles the timer.
    // However, for consistency, we might clear the message in the context here.
    // For now, the Toast component's onClose will be enough.
    // Or, we can modify the CartContext to expose a specific clearToastMessage function.
    // For this implementation, the Toast component will call its own onClose (which is an empty func or clears internal state)
    // and the context will manage nulling the message.
    showToast(''); // or a dedicated clearToastMessage in CartContext
  };

  return (
    <Toast
      message={toastMessage}
      onClose={() => showToast('')} // Pass an empty string or null to clear the message
    />
  );
};

export default ToastDisplay;
