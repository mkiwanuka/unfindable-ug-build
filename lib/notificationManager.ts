// Track if user has interacted with the page (for autoplay sound policy)
let hasUserInteracted = false;

// Track active conversation to prevent notifications for messages in visible chat
let activeConversationId: string | null = null;

// Track unread message count for title badge
let unreadCount = 0;
const originalTitle = typeof document !== 'undefined' ? document.title : 'Unfindable';

export function initNotificationManager() {
  if (typeof window === 'undefined') return;
  
  // Track user interaction for sound autoplay
  const markInteracted = () => {
    hasUserInteracted = true;
  };
  
  window.addEventListener('click', markInteracted, { once: true });
  window.addEventListener('keydown', markInteracted, { once: true });
  window.addEventListener('touchstart', markInteracted, { once: true });
  
  // Reset title when window gains focus
  window.addEventListener('focus', () => {
    resetTitleBadge();
  });
}

export function setActiveConversation(conversationId: string | null) {
  activeConversationId = conversationId;
  if (conversationId) {
    // When opening a chat, reset unread count
    resetTitleBadge();
  }
}

export function getActiveConversation(): string | null {
  return activeConversationId;
}

export function hasUserInteractedWithPage(): boolean {
  return hasUserInteracted;
}

export function updateTitleBadge(count: number) {
  unreadCount = count;
  if (typeof document === 'undefined') return;
  
  if (count > 0) {
    document.title = `(${count}) New message${count > 1 ? 's' : ''} - ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }
}

export function incrementTitleBadge() {
  updateTitleBadge(unreadCount + 1);
}

export function resetTitleBadge() {
  updateTitleBadge(0);
}

export function playNotificationSound() {
  if (!hasUserInteracted) return;
  
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
}

export interface NotificationPayload {
  id: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  conversationId: string;
}

export function notifyInApp(payload: NotificationPayload) {
  // Don't notify if user is viewing this conversation
  if (payload.conversationId === activeConversationId) return;
  
  // Don't notify if window is focused and user is on messages page
  const isOnMessagesPage = typeof window !== 'undefined' && 
    window.location.hash.includes('/messages');
  
  if (document.hasFocus() && isOnMessagesPage && payload.conversationId === activeConversationId) {
    return;
  }
  
  // Update title badge
  incrementTitleBadge();
  
  // Play sound
  playNotificationSound();
  
  // Dispatch toast event for UI to show
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: payload
    }));
  }
}
