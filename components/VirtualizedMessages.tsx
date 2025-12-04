import React, { useEffect, useRef, useCallback } from 'react';
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
  const prevMessageCountRef = useRef(messages.length);
  const dynamicRowHeight = useDynamicRowHeight({ 
    defaultRowHeight: 80,
    key: messages.length // Reset when message count changes significantly
  });

  // Auto-scroll to bottom when new messages arrive (not when loading older ones)
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const newCount = messages.length;
    
    // Only scroll to bottom if messages were added to the end (not prepended)
    if (newCount > prevCount && listRef.current) {
      // Small delay to let the list render
      setTimeout(() => {
        try {
          listRef.current?.scrollToRow({ 
            index: newCount - 1, 
            align: 'end',
            behavior: 'smooth' 
          });
        } catch (e) {
          // Ignore scroll errors
        }
      }, 50);
    }
    
    prevMessageCountRef.current = newCount;
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        try {
          listRef.current?.scrollToRow({ 
            index: messages.length - 1, 
            align: 'end',
            behavior: 'instant' 
          });
        } catch (e) {
          // Ignore scroll errors
        }
      }, 100);
    }
  }, []); // Only on mount

  const handleHeightChange = useCallback((index: number, height: number) => {
    dynamicRowHeight.setRowHeight(index, height + 8); // +8 for padding
  }, [dynamicRowHeight]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-gray-400 text-center text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-2 bg-gray-50 flex-shrink-0">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm text-softTeal hover:text-softTeal/80 disabled:opacity-50 flex items-center gap-2"
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
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
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
          />
        </div>
      </div>
    </div>
  );
};
