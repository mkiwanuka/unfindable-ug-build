import React, { useEffect, useRef, useCallback, useState } from 'react';
import { List, useDynamicRowHeight, useListRef } from 'react-window';
import { MessageRow } from './MessageRow';
import { Loader2 } from 'lucide-react';
import { ResizeObserverProvider } from '../contexts/ResizeObserverContext';

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
  const prevCountRef = useRef<number>(0);
  const [hasRendered, setHasRendered] = useState(false);

  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: 80,
    key: messages.length
  });

  // Handle initial scroll when list first renders with messages
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
        } catch (e) {
          console.warn('Initial scrollToRow failed', e);
        }
      }, 50);
    }
  }, [hasRendered, messages.length]);

  // Only scroll when genuinely new messages arrive (count increased)
  // Skip all replacements, updates, and message re-renders
  useEffect(() => {
    const prevCount = prevCountRef.current;
    const currentCount = messages.length;

    // Only scroll if message count actually increased (new message added)
    if (currentCount > prevCount) {
      // Add a delay to let the virtual list render the new message
      const scrollTimer = setTimeout(() => {
        try {
          listRef.current?.scrollToRow({
            index: currentCount - 1,
            align: 'end',
            behavior: 'auto' // Use auto for smooth, natural scrolling
          });
        } catch (e) {
          console.warn('Scroll to new message failed', e);
        }
      }, 50);

      return () => clearTimeout(scrollTimer);
    }

    prevCountRef.current = currentCount;
  }, [messages.length]);

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
    <ResizeObserverProvider>
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
    </ResizeObserverProvider>
  );
};
