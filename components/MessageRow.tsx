<<<<<<< HEAD
import React, { CSSProperties, useRef, useEffect } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { MessageReactions } from './MessageReactions';
import { FileAttachment } from './FileAttachment';
import { useSharedResizeObserver } from '../contexts/ResizeObserverContext';
=======
import React, { CSSProperties } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { MessageReactions } from './MessageReactions';
import { FileAttachment } from './FileAttachment';
>>>>>>> master-local/master
import type { MessageStatus } from '../stores/useMessageStore';

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

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsMap {
  [messageId: string]: Reaction[];
}

interface MessageRowProps {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: CSSProperties;
  messages: Message[];
  currentUserId: string | null;
  reactions: MessageReactionsMap;
  onReactionChange: () => void;
<<<<<<< HEAD
  onHeightChange?: (index: number, height: number) => void;
=======
>>>>>>> master-local/master
}

// Message status indicator component (WhatsApp-style)
const MessageStatusIndicator: React.FC<{ status?: MessageStatus; isRead?: boolean }> = ({ 
  status, 
  isRead 
}) => {
  // Legacy support: if no status but has read_at, show as read
  if (!status && isRead) {
    return <CheckCheck className="h-3.5 w-3.5 text-blue-300" />;
  }
  
  switch (status) {
    case 'sending':
      return <Clock className="h-3 w-3 opacity-70" />;
    case 'sent':
      return <Check className="h-3.5 w-3.5" />;
    case 'delivered':
      return <CheckCheck className="h-3.5 w-3.5" />;
    case 'read':
      return <CheckCheck className="h-3.5 w-3.5 text-blue-300" />;
    case 'failed':
      return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
    default:
      // Fallback for messages without status (legacy)
      return isRead ? (
        <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      );
  }
};

export const MessageRow: React.FC<MessageRowProps> = ({
  ariaAttributes,
  index,
  style,
  messages,
  currentUserId,
  reactions,
  onReactionChange,
<<<<<<< HEAD
  onHeightChange,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const msg = messages[index];
  
  // Use shared ResizeObserver instead of creating one per message
  const { observe, unobserve } = useSharedResizeObserver();

  // Report height changes using shared observer
  useEffect(() => {
    if (rowRef.current && onHeightChange) {
      observe(rowRef.current, index, onHeightChange);
      return () => {
        if (rowRef.current) {
          unobserve(rowRef.current);
        }
      };
    }
  }, [index, onHeightChange, observe, unobserve]);
=======
}) => {
  const msg = messages[index];
>>>>>>> master-local/master

  if (!msg) return null;

  const isOwnMessage = msg.sender_id === currentUserId;
  const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const isRead = !!msg.read_at;
  const isTempMessage = msg.id.startsWith('temp-');
  const messageReactions = reactions[msg.id] || [];
  const isFailed = msg.status === 'failed';

  return (
    <div
<<<<<<< HEAD
      ref={rowRef}
=======
>>>>>>> master-local/master
      style={style}
      {...ariaAttributes}
      className={`flex flex-col py-1 px-3 sm:px-4 w-full overflow-hidden ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <div className={`max-w-[80%] sm:max-w-[75%] px-4 py-2.5 shadow-sm ${
        isOwnMessage 
          ? isFailed 
            ? 'bg-red-100 text-red-900 rounded-2xl rounded-br-sm border border-red-200' 
            : 'bg-softTeal text-white rounded-2xl rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm'
      }`}>
        {msg.attachment_url && msg.attachment_type && msg.attachment_name && (
          <FileAttachment
            url={msg.attachment_url}
            type={msg.attachment_type}
            name={msg.attachment_name}
            isOwnMessage={isOwnMessage}
          />
        )}
        {msg.content && (
          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
        )}
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isOwnMessage 
            ? isFailed ? 'text-red-500' : 'text-white/70' 
            : 'text-gray-400'
        }`}>
          <span className="text-[10px]">{timestamp}</span>
          {isOwnMessage && (
            <MessageStatusIndicator status={msg.status} isRead={isRead} />
          )}
        </div>
        {isFailed && (
          <p className="text-[10px] text-red-500 mt-1">Failed to send. Tap to retry.</p>
        )}
      </div>
      {!isTempMessage && !isFailed && (
        <MessageReactions
          messageId={msg.id}
          reactions={messageReactions}
          currentUserId={currentUserId}
          isOwnMessage={isOwnMessage}
          onReactionChange={onReactionChange}
        />
      )}
    </div>
  );
};
