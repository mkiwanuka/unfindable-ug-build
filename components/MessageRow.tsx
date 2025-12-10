import React, { CSSProperties, useRef, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { MessageReactions } from './MessageReactions';
import { FileAttachment } from './FileAttachment';

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
  onHeightChange?: (index: number, height: number) => void;
}

export const MessageRow: React.FC<MessageRowProps> = ({
  ariaAttributes,
  index,
  style,
  messages,
  currentUserId,
  reactions,
  onReactionChange,
  onHeightChange,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const msg = messages[index];

  // Report height changes for dynamic sizing
  useEffect(() => {
    if (rowRef.current && onHeightChange) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(index, entry.contentRect.height);
        }
      });
      resizeObserver.observe(rowRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [index, onHeightChange]);

  if (!msg) return null;

  const isOwnMessage = msg.sender_id === currentUserId;
  const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const isRead = !!msg.read_at;
  const isTempMessage = msg.id.startsWith('temp-');
  const messageReactions = reactions[msg.id] || [];

  return (
    <div
      ref={rowRef}
      style={style}
      {...ariaAttributes}
      className={`flex flex-col py-1 px-3 sm:px-4 w-full overflow-hidden ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <div className={`max-w-[80%] sm:max-w-[75%] px-4 py-2.5 shadow-sm ${
        isOwnMessage 
          ? 'bg-softTeal text-white rounded-2xl rounded-br-sm' 
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
          isOwnMessage ? 'text-white/70' : 'text-gray-400'
        }`}>
          <span className="text-[10px]">{timestamp}</span>
          {isOwnMessage && !isTempMessage && (
            isRead ? (
              <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      </div>
      {!isTempMessage && (
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
