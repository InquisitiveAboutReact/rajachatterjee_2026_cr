import React, { createContext, useContext, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500); // Disappears after 3.5 seconds
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a safe dummy function if context is not yet loaded
    return (msg) => console.log('Toast triggered:', msg);
  }
  return context;
};