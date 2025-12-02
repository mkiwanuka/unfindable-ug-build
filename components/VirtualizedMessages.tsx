import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface VirtualizedMessagesProps {
  messages: Message[];
  currentUserId: string | null;
}

export const VirtualizedMessages: React.FC<VirtualizedMessagesProps> = ({ 
  messages, 
  currentUserId 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <p className="text-gray-400 text-center text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-3 sm:px-4 py-2">
      {messages.map((msg) => {
        const isOwnMessage = msg.sender_id === currentUserId;
        const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        });

        return (
          <div 
            key={msg.id} 
            className={`flex py-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] sm:max-w-[75%] px-4 py-2.5 shadow-sm ${
              isOwnMessage 
                ? 'bg-softTeal text-white rounded-2xl rounded-br-sm' 
                : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
              <p className={`text-[10px] mt-1 text-right ${
                isOwnMessage ? 'text-white/70' : 'text-gray-400'
              }`}>{timestamp}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
