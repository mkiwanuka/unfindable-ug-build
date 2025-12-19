import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastNotification } from './ToastNotification';
import type { NotificationPayload } from '../lib/notificationManager';

interface ToastItem extends NotificationPayload {
  timestamp: number;
}

const MAX_TOASTS = 3;
const TOAST_DURATION = 5000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const navigate = useNavigate();

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleToast = useCallback((event: CustomEvent<NotificationPayload>) => {
    const payload = event.detail;
    const newToast: ToastItem = {
      ...payload,
      timestamp: Date.now(),
    };

    setToasts(prev => {
      // Remove oldest if at max
      const updated = prev.length >= MAX_TOASTS 
        ? prev.slice(1) 
        : prev;
      return [...updated, newToast];
    });

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(payload.id);
    }, TOAST_DURATION);
  }, [removeToast]);

  useEffect(() => {
    window.addEventListener('app:toast', handleToast as EventListener);
    return () => {
      window.removeEventListener('app:toast', handleToast as EventListener);
    };
  }, [handleToast]);

  const handleToastClick = (conversationId: string) => {
    navigate(`/messages?chat=${conversationId}`);
  };

  return (
    <>
      {children}
      
      {/* Toast container - fixed position bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification
              notification={toast}
              onDismiss={() => removeToast(toast.id)}
              onClick={() => {
                removeToast(toast.id);
                handleToastClick(toast.conversationId);
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};
