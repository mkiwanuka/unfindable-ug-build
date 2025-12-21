import React, { useEffect, useRef, useCallback } from 'react';
import { MessageRow } from './MessageRow';

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

interface SimpleMessagesProps {
  messages: Message[];
  currentUserId: string | null;
  reactions?: MessageReactionsMap;
  onReactionChange?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export const SimpleMessages: React.FC<SimpleMessagesProps> = ({
  messages = [],
  currentUserId,
  reactions = {},
  onReactionChange,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const userIsAtBottomRef = useRef(true);
  const prevCountRef = useRef(0);

  // Handle undefined messages
  const messageList = Array.isArray(messages) ? messages : [];

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((instant = true) => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: instant ? 'auto' : 'smooth',
      block: 'end'
    });
  }, []);

  // Track if user is scrolled to bottom (with threshold)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const threshold = 50; // pixels from bottom
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userIsAtBottomRef.current = distanceFromBottom < threshold;
  }, []);

  // Only scroll when:
  // 1. Your own message appears, OR
  // 2. New message arrives and you're already at bottom
  useEffect(() => {
    const currentCount = messageList.length;
    const prevCount = prevCountRef.current;

    // Only process if message count increased (new message)
    if (currentCount > prevCount) {
      const newMessages = messageList.slice(-( currentCount - prevCount));
      const isOwnMessage = newMessages.some(m => m.sender_id === currentUserId);

      // Always scroll for own messages (instant)
      if (isOwnMessage) {
        setTimeout(() => scrollToBottom(true), 0);
      }
      // For incoming messages, only scroll if user is at bottom
      else if (userIsAtBottomRef.current) {
        setTimeout(() => scrollToBottom(false), 0);
      }
    }

    prevCountRef.current = currentCount;
  }, [messageList.length, currentUserId, scrollToBottom]);

  // Initial scroll to bottom when conversation loads
  useEffect(() => {
    if (messageList.length > 0 && containerRef.current) {
      // Longer delay to ensure DOM has rendered all messages
      setTimeout(() => {
        scrollToBottom(true);
      }, 200);
    }
  }, [messageList.length, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center text-sm">Loading messages...</p>
      </div>
    );
  }

  if (messageList.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  try {
    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto flex flex-col"
        style={{ scrollBehavior: 'smooth' }}
      >
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-4 bg-muted/50 flex-shrink-0 sticky top-0 z-10">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? 'Loading...' : 'Load earlier messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-1 p-4">
        {messageList.map((message, index) => {
          // Safety check - ensure message has required fields
          if (!message || !message.id) {
            console.warn('Invalid message at index', index, message);
            return null;
          }

          return (
            <MessageRow
              key={message.id}
              ariaAttributes={{
                "aria-posinset": index + 1,
                "aria-setsize": messageList.length,
                role: "listitem"
              }}
              index={index}
              style={{}} // No style needed for plain DOM
              messages={messageList}
              currentUserId={currentUserId}
              reactions={reactions}
              onReactionChange={onReactionChange || (() => {})}
            />
          );
        })}
      </div>

      {/* Bottom anchor - this is what we scroll to */}
      <div ref={bottomAnchorRef} className="h-0" />
      </div>
    );
  } catch (error) {
    console.error('Error rendering SimpleMessages:', error);
    return (
      <div className="h-full w-full flex items-center justify-center p-4 bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading messages</p>
          <p className="text-red-500 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
};
