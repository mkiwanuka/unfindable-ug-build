import React, { useState, useEffect } from 'react';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../src/integrations/supabase/client';
import { getOrCreateConversation } from '../lib/conversationUtils';
import { useConversations, useInvalidateConversations, ConversationWithDetails } from '../hooks/useConversations';
import { VirtualizedMessages } from '../components/VirtualizedMessages';
import { realtimeManager } from '../lib/realtimeManager';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface LocationState {
  conversationId?: string;
  startChatWithUserId?: string;
  requestId?: string;
}

export const Messages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Use React Query for conversations
  const { data: conversations = [], isLoading } = useConversations(currentUserId);
  const invalidateConversations = useInvalidateConversations();

  // Handle navigation state (starting a conversation from another page)
  useEffect(() => {
    const handleNavigationState = async () => {
      const state = location.state as LocationState | null;
      
      if (!state || !currentUserId) return;
      
      // Case 1: Direct conversation ID passed
      if (state.conversationId) {
        setSelectedChatId(state.conversationId);
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

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedChatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        
        markMessagesAsRead(selectedChatId);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Use consolidated realtime manager for new messages
    const unsub = realtimeManager.subscribe('messages', 'INSERT', (payload) => {
      const newMsg = payload.new as Message & { conversation_id: string };
      
      // Only add if it's for the current conversation
      if (newMsg.conversation_id === selectedChatId) {
        setMessages(prev => [...prev, newMsg]);
        
        if (newMsg.sender_id !== currentUserId) {
          markMessagesAsRead(selectedChatId);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [selectedChatId, currentUserId]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedChatId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-offWhite">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-deepBlue">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-gray-500 mb-2">No conversations yet</p>
              <p className="text-sm text-gray-400">Start messaging by making or accepting offers</p>
            </div>
          ) : (
            conversations.map((chat: ConversationWithDetails) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-softTeal' : ''}`}
              >
                <img src={chat.partner.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + chat.partner.id} alt={chat.partner.name} className="h-12 w-12 rounded-full mr-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-gray-800 truncate">{chat.partner.name}</h3>
                  </div>
                  <p className="text-xs text-softTeal font-medium mb-1">{chat.requestTitle}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center">
                <img src={activeChat.partner.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + activeChat.partner.id} className="h-10 w-10 rounded-full mr-3" alt={activeChat.partner.name} />
                <div>
                  <h3 className="font-bold text-gray-800">{activeChat.partner.name}</h3>
                  <p className="text-xs text-gray-500">Regarding: <span className="text-softTeal font-medium">{activeChat.requestTitle}</span></p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-deepBlue"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Virtualized Messages */}
            <div className="flex-1 bg-gray-50">
              <VirtualizedMessages messages={messages} currentUserId={currentUserId} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <button className="text-gray-400 hover:text-gray-600"><Paperclip className="h-5 w-5" /></button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent focus:outline-none text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-deepBlue text-white rounded-full hover:bg-opacity-90 disabled:opacity-50"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
