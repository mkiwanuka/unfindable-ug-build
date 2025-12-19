import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import type { NotificationPayload } from '../lib/notificationManager';

interface ToastNotificationProps {
  notification: NotificationPayload;
  onDismiss: () => void;
  onClick: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  // Truncate message to reasonable length
  const truncatedMessage = notification.message.length > 60 
    ? notification.message.substring(0, 60) + '...' 
    : notification.message;

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm w-full cursor-pointer hover:bg-muted/50 transition-colors animate-in slide-in-from-right-5 duration-300"
      onClick={onClick}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Avatar or icon */}
        <div className="flex-shrink-0">
          {notification.senderAvatar ? (
            <img 
              src={notification.senderAvatar} 
              alt={notification.senderName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">
            {notification.senderName}
          </p>
          <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">
            {truncatedMessage}
          </p>
        </div>
        
        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
