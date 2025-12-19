import { useEffect, useRef } from 'react';
import { realtimeManager } from '../lib/realtimeManager';
import { 
  notifyInApp, 
  getActiveConversation,
  type NotificationPayload 
} from '../lib/notificationManager';
import { showBrowserNotificationIfBackgrounded } from '../lib/browserNotifications';

interface MessagePayload {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

export function useMessageNotifications(currentUserId: string | null) {
  const notifiedMessagesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!currentUserId) return;
    
    // Subscribe to global messages for notifications
    const unsubscribe = realtimeManager.subscribe('messages', 'INSERT', async (payload) => {
      const message = payload.new as MessagePayload;
      
      // Don't notify for own messages
      if (message.sender_id === currentUserId) return;
      
      // Don't notify for messages we've already notified about
      if (notifiedMessagesRef.current.has(message.id)) return;
      notifiedMessagesRef.current.add(message.id);
      
      // Keep the set from growing unboundedly
      if (notifiedMessagesRef.current.size > 100) {
        const arr = Array.from(notifiedMessagesRef.current);
        notifiedMessagesRef.current = new Set(arr.slice(-50));
      }
      
      // Don't notify if user is viewing this conversation
      if (getActiveConversation() === message.conversation_id) return;
      
      // Try to get sender info - this may not be available in the realtime payload
      // In a real app, you'd cache sender info or include it in the message table
      let senderName = 'Someone';
      let senderAvatar: string | undefined;
      
      // If sender info is included in payload (via join or view)
      if (message.sender) {
        senderName = message.sender.name || 'Someone';
        senderAvatar = message.sender.avatar;
      }
      
      const notificationPayload: NotificationPayload = {
        id: message.id,
        senderName,
        senderAvatar,
        message: message.content,
        conversationId: message.conversation_id,
      };
      
      // Show in-app notification (toast + sound + title badge)
      notifyInApp(notificationPayload);
      
      // Show browser notification if tab is backgrounded
      showBrowserNotificationIfBackgrounded({
        title: senderName,
        body: message.content.length > 100 
          ? message.content.substring(0, 100) + '...' 
          : message.content,
        data: {
          conversationId: message.conversation_id,
        },
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentUserId]);
}
