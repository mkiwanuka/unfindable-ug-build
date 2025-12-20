import { create } from 'zustand';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  seq?: number;
  status?: MessageStatus;
  read_at?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface MessageStore {
  messages: Message[];
  conversationId: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  
  // Actions
  setConversationId: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  addMessage: (msg: Message) => void;
  prependMessages: (msgs: Message[]) => void;
  replaceMessage: (tempId: string, msg: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  conversationId: null,
  hasMore: false,
  loadingMore: false,

  setConversationId: (id) => {
    // Reset messages when conversation changes
    if (id !== get().conversationId) {
      set({ conversationId: id, messages: [], hasMore: false });
    }
  },
  
  setMessages: (msgs) => set({ messages: msgs }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setLoadingMore: (loading) => set({ loadingMore: loading }),
  
  addMessage: (msg) => set((state) => {
    // Prevent duplicates by checking both id and temp patterns
    if (state.messages.some(m => m.id === msg.id)) {
      return state;
    }
    // Sort by seq if available, otherwise by created_at
    const newMessages = [...state.messages, msg].sort((a, b) => {
      if (a.seq !== undefined && b.seq !== undefined) {
        return a.seq - b.seq;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return { messages: newMessages };
  }),
  
  prependMessages: (msgs) => set((state) => {
    // Filter out any duplicates
    const existingIds = new Set(state.messages.map(m => m.id));
    const newMsgs = msgs.filter(m => !existingIds.has(m.id));
    return { messages: [...newMsgs, ...state.messages] };
  }),
  
  replaceMessage: (tempId, msg) => set((state) => ({
    messages: state.messages.map(m => m.id === tempId ? msg : m)
  })),
  
  updateMessage: (id, patch) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...patch } : m)
  })),
  
  removeMessage: (id) => set((state) => ({
    messages: state.messages.filter(m => m.id !== id)
  })),
  
  reset: () => set({ messages: [], conversationId: null, hasMore: false, loadingMore: false }),
}));
