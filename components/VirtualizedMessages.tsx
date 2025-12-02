import React, { useEffect, useRef } from 'react';
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

interface VirtualizedMessagesProps {
  messages: Message[];
  currentUserId: string | null;
  reactions?: MessageReactionsMap;
  onReactionChange?: () => void;
}

export const VirtualizedMessages: React.FC<VirtualizedMessagesProps> = ({ 
  messages, 
  currentUserId,
  reactions = {},
  onReactionChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive - scroll only the container, not the whole page
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-gray-400 text-center text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto px-3 sm:px-4 py-2">
      {messages.map((msg) => {
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
            key={msg.id} 
            className={`flex flex-col py-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}
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
                onReactionChange={onReactionChange || (() => {})}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
