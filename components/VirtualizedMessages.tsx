import React, { useEffect, useRef, useCallback, useState } from 'react';
import { List, useDynamicRowHeight, useListRef } from 'react-window';
import { MessageRow } from './MessageRow';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsMap {
  [messageId: string]: Reaction[];
}

interface VirtualizedMessagesProps {
  messages: Message[];
  currentUserId: string | null;
  reactions?: MessageReactionsMap;
  onReactionChange?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export const VirtualizedMessages: React.FC<VirtualizedMessagesProps> = ({ 
  messages, 
  currentUserId,
  reactions = {},
  onReactionChange,
  hasMore = false,
  loadingMore = false,
  onLoadMore
}) => {
  const listRef = useListRef();
  const prevMessagesRef = useRef<Message[]>([]);
  const hasScrolledInitialRef = useRef(false);
  const [hasRendered, setHasRendered] = useState(false);
  
  const dynamicRowHeight = useDynamicRowHeight({ 
    defaultRowHeight: 80,
    key: messages.length
  });

  // Reset scroll state when messages array is completely replaced (new conversation)
  useEffect(() => {
    const prevMessages = prevMessagesRef.current;
    // If first message ID changed, it's a new conversation
    if (prevMessages.length > 0 && messages.length > 0 && prevMessages[0]?.id !== messages[0]?.id) {
      // Check if it's pagination (old messages prepended) or new conversation
      const isOldMessageInNew = messages.some(m => m.id === prevMessages[0]?.id);
      if (!isOldMessageInNew) {
        // New conversation - reset scroll state
        hasScrolledInitialRef.current = false;
        setHasRendered(false);
      }
    }
  }, [messages]);

  // Handle initial scroll when list first renders
  const handleRowsRendered = useCallback(() => {
    if (!hasRendered && messages.length > 0) {
      setHasRendered(true);
      // Scroll to bottom on initial render
      setTimeout(() => {
        try {
          listRef.current?.scrollToRow({ 
            index: messages.length - 1, 
            align: 'end',
            behavior: 'instant' 
          });
          hasScrolledInitialRef.current = true;
        } catch (e) {
          console.warn('Initial scrollToRow failed', e);
        }
      }, 100);
    }
  }, [hasRendered, messages.length]);

  // Detect new messages added at the END (not pagination which prepends)
  useEffect(() => {
    const prevMessages = prevMessagesRef.current;
    const prevCount = prevMessages.length;
    const newCount = messages.length;
    
    // Only process if we have previous messages and new messages were added
    if (prevCount > 0 && newCount > prevCount && hasScrolledInitialRef.current) {
      // Get the last message from previous state
      const lastPrevMessage = prevMessages[prevMessages.length - 1];
      
      // Find where the last previous message is in the new array
      const lastPrevIndex = messages.findIndex(m => m.id === lastPrevMessage?.id);
      
      // If the last prev message is NOT at the end of new array, new messages were added at end
      if (lastPrevIndex !== -1 && lastPrevIndex < newCount - 1) {
        // New message added at end - scroll to bottom smoothly
        setTimeout(() => {
          try {
            listRef.current?.scrollToRow({ 
              index: newCount - 1, 
              align: 'end',
              behavior: 'smooth' 
            });
          } catch (e) {
            console.warn('New message scrollToRow failed', e);
          }
        }, 50);
      }
      // If messages were prepended (pagination), don't scroll - user is reading history
    }
    
    // Update ref for next comparison
    prevMessagesRef.current = [...messages];
  }, [messages]);

  const handleHeightChange = useCallback((index: number, height: number) => {
    dynamicRowHeight.setRowHeight(index, height + 8);
  }, [dynamicRowHeight]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-2 bg-muted/50 flex-shrink-0">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load earlier messages'
            )}
          </button>
        </div>
      )}
      
      {/* Virtualized Message List */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <List
            listRef={listRef}
            rowCount={messages.length}
            rowHeight={dynamicRowHeight}
            rowComponent={MessageRow}
            rowProps={{
              messages,
              currentUserId,
              reactions,
              onReactionChange: onReactionChange || (() => {}),
              onHeightChange: handleHeightChange,
            }}
            overscanCount={5}
            onRowsRendered={handleRowsRendered}
          />
        </div>
      </div>
    </div>
  );
};
