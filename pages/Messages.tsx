import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, ArrowLeft, MessageSquare, Search, X, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../src/integrations/supabase/client';
import { getOrCreateConversation } from '../lib/conversationUtils';
import { useConversations, useInvalidateConversations, ConversationWithDetails } from '../hooks/useConversations';
import { VirtualizedMessages } from '../components/VirtualizedMessages';
import { realtimeManager } from '../lib/realtimeManager';
import { messageSchema } from '../lib/schemas';
import { TypingIndicator } from '../components/TypingIndicator';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useFileUpload } from '../hooks/useFileUpload';
import { useMessages } from '../hooks/useMessages';
import { MessageStatus } from '../stores/useMessageStore';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  seq?: number;
  status?: MessageStatus;
  read_at?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface LocationState {
  conversationId?: string;
  startChatWithUserId?: string;
  requestId?: string;
}

// Helper to format relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const Messages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use paginated messages hook
  const {
    messages,
    hasMore,
    loadingMore,
    fetchMessages,
    loadMore,
    addMessage,
    updateMessage,
    replaceMessage,
    removeMessage,
  } = useMessages(selectedChatId);

  // File upload hook
  const { uploadFile, isUploading, uploadError, clearError } = useFileUpload(currentUserId);

  // Get current user - optimized: single RPC call instead of 2 queries
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Use existing RPC that fetches profile + role in single query
        const { data, error } = await supabase.rpc('get_user_with_role', { p_user_id: user.id });
        if (!error && data && data.length > 0) {
          setCurrentUserName(data[0].name);
        }
      }
    };
    getCurrentUser();
  }, []);

  // Typing indicator state (integrated with conversation channel)
  const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Send typing indicator
  const handleTypingStart = useCallback(() => {
    if (!selectedChatId || !currentUserId || !currentUserName) return;
    
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      realtimeManager.sendTyping(selectedChatId, currentUserId, currentUserName, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      realtimeManager.sendTyping(selectedChatId, currentUserId, currentUserName, false);
    }, 2000);
  }, [selectedChatId, currentUserId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && selectedChatId && currentUserId && currentUserName) {
      isTypingRef.current = false;
      realtimeManager.sendTyping(selectedChatId, currentUserId, currentUserName, false);
    }
  }, [selectedChatId, currentUserId, currentUserName]);

  // Message reactions
  const { reactions, refetchReactions } = useMessageReactions(selectedChatId, currentUserId);

  // Use React Query for conversations
  const { data: conversations = [], isLoading } = useConversations(currentUserId);
  const invalidateConversations = useInvalidateConversations();

  // Filter conversations by search query
  const filteredConversations = conversations.filter((chat: ConversationWithDetails) =>
    chat.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.requestTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle navigation state (starting a conversation from another page)
  useEffect(() => {
    const handleNavigationState = async () => {
      const state = location.state as LocationState | null;
      
      if (!state || !currentUserId) return;
      
      // Case 1: Direct conversation ID passed
      if (state.conversationId) {
        setSelectedChatId(state.conversationId);
        setShowChatOnMobile(true); // Auto-show chat on mobile
        navigate(location.pathname, { replace: true, state: null });
        return;
      }
      
      // Case 2: Start chat with a specific user
      if (state.startChatWithUserId) {
        const convId = await getOrCreateConversation(
          currentUserId,
          state.startChatWithUserId,
          state.requestId
        );
        
        if (convId) {
          invalidateConversations();
          setSelectedChatId(convId);
          setShowChatOnMobile(true); // Auto-show chat on mobile
        }
        
        navigate(location.pathname, { replace: true, state: null });
      }
    };
    
    handleNavigationState();
  }, [location.state, currentUserId, navigate, invalidateConversations]);

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    if (!currentUserId) return;
    
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Fetch messages and set up conversation-specific realtime subscription
  useEffect(() => {
    if (!selectedChatId || !currentUserId) return;

    // Reset typing users when conversation changes
    setTypingUsers([]);

    fetchMessages();
    markMessagesAsRead(selectedChatId);

    // Subscribe to conversation-specific channel (server-filtered, includes typing)
    realtimeManager.subscribeConversation(selectedChatId, {
      // New messages - direct state update, NO refetch
      onMessage: (newMsg) => {
        addMessage(newMsg);
        
        // Mark as read if not from current user
        if (newMsg.sender_id !== currentUserId) {
          markMessagesAsRead(selectedChatId);
        }
      },
      
      // Read receipts / status updates
      onReceipt: (updatedMsg) => {
        updateMessage(updatedMsg.id, { 
          read_at: updatedMsg.read_at,
          status: updatedMsg.status 
        });
      },
      
      // Typing indicators (broadcast, no DB)
      onTyping: (payload) => {
        if (payload.userId !== currentUserId) {
          setTypingUsers(prev => {
            if (payload.typing) {
              // Add user if not already typing
              if (!prev.some(u => u.userId === payload.userId)) {
                return [...prev, { userId: payload.userId, name: payload.name }];
              }
            } else {
              // Remove user
              return prev.filter(u => u.userId !== payload.userId);
            }
            return prev;
          });
        }
      },
    });

    return () => {
      realtimeManager.unsubscribeConversation(selectedChatId);
    };
  }, [selectedChatId, currentUserId, fetchMessages, addMessage, updateMessage]);

  // Window focus handler - only refetch if tab was inactive for > 60 seconds
  const lastActivityRef = useRef<number>(Date.now());
  
  useEffect(() => {
    // Track activity
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);
  
  useEffect(() => {
    if (!selectedChatId) return;

    const handleFocus = () => {
      const inactiveMs = Date.now() - lastActivityRef.current;
      // Only refetch if inactive for more than 60 seconds
      if (inactiveMs > 60000) {
        fetchMessages();
      }
      markMessagesAsRead(selectedChatId);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedChatId, fetchMessages]);

  // Handle selecting a conversation
  const handleSelectConversation = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatOnMobile(true);
  };

  // Handle back button
  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  // Send message with optimistic update
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedChatId || !currentUserId) return;

    // Validate message if there's text
    if (newMessage.trim()) {
      const validation = messageSchema.safeParse({
        conversationId: selectedChatId,
        content: newMessage.trim(),
      });

      if (!validation.success) {
        alert(validation.error.issues[0]?.message || 'Invalid message');
        return;
      }
    }

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Upload file if selected
    let attachment: { url: string; type: string; name: string } | null = null;
    if (selectedFile) {
      attachment = await uploadFile(selectedFile);
      if (!attachment && !messageContent) {
        return; // Failed to upload and no text content
      }
    }
    
    // Optimistic update - add message immediately with 'sending' status
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content: messageContent,
      created_at: new Date().toISOString(),
      status: 'sending',
      attachment_url: attachment?.url || null,
      attachment_type: attachment?.type || null,
      attachment_name: attachment?.name || null,
    };
    
    addMessage(optimisticMessage);
    setNewMessage('');
    setSelectedFile(null);
    stopTyping();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedChatId,
          sender_id: currentUserId,
          content: messageContent || null,
          status: 'sent',
          attachment_url: attachment?.url || null,
          attachment_type: attachment?.type || null,
          attachment_name: attachment?.name || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one (has real ID and 'sent' status)
      if (data) {
        replaceMessage(tempId, data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark as failed instead of removing (allows retry)
      updateMessage(tempId, { status: 'failed' });
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      clearError();
    }
  };

  const activeChat = conversations.find((c: ConversationWithDetails) => c.id === selectedChatId);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-offWhite">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-offWhite">
      {/* Panel A - Conversation List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 ${
        showChatOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-softTeal" />
          <h2 className="text-lg sm:text-xl font-bold text-deepBlue">Messages</h2>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-softTeal/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              {searchQuery ? (
                <>
                  <Search className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-1">No conversations found</p>
                  <p className="text-sm text-gray-400">Try a different search term</p>
                </>
              ) : (
                <>
                  <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-1">No conversations yet</p>
                  <p className="text-sm text-gray-400">Start messaging by making or accepting offers</p>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((chat: ConversationWithDetails) => (
              <div 
                key={chat.id} 
                onClick={() => handleSelectConversation(chat.id)}
                className={`flex items-center px-4 py-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 ${
                  selectedChatId === chat.id ? 'bg-softTeal/5 border-l-4 border-l-softTeal' : ''
                }`}
              >
                <img 
                  src={chat.partner.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + chat.partner.id} 
                  alt={chat.partner.name} 
                  className="h-12 w-12 rounded-full mr-3 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-semibold text-gray-800 truncate text-[15px]">{chat.partner.name}</h3>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{getRelativeTime(chat.updated_at)}</span>
                  </div>
                  <p className="text-xs text-softTeal font-medium truncate mb-0.5">{chat.requestTitle}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel B - Chat Window */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
        showChatOnMobile ? 'flex' : 'hidden md:flex'
      }`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
              {/* Back button - mobile only */}
              <button 
                onClick={handleBackToList}
                className="md:hidden p-2 -ml-1 mr-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <img 
                src={activeChat.partner.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + activeChat.partner.id} 
                className="h-10 w-10 rounded-full mr-3 flex-shrink-0" 
                alt={activeChat.partner.name} 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{activeChat.partner.name}</h3>
                <p className="text-xs text-gray-500 truncate">
                  <span className="text-softTeal font-medium">{activeChat.requestTitle}</span>
                </p>
              </div>
            </div>

            {/* Virtualized Messages */}
            <div className="flex-1 bg-gray-50 min-h-0 relative">
              <div className="absolute inset-0">
                <VirtualizedMessages 
                  messages={messages} 
                  currentUserId={currentUserId}
                  reactions={reactions}
                  onReactionChange={refetchReactions}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={loadMore}
                />
              </div>
            </div>

            {/* Typing Indicator */}
            <TypingIndicator typingUsers={typingUsers} />

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200 w-full">
              {/* Selected file preview */}
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600 truncate flex-1">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="text-red-500 text-xs mb-2">{uploadError}</p>
              )}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 w-full overflow-hidden">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUploading}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent focus:outline-none text-sm min-w-0"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingStart();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && !isUploading && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-softTeal text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all"
                  disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                  aria-label="Send message"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
            <MessageSquare className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-center">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};