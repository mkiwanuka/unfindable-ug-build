import React, { useEffect, useRef, CSSProperties } from 'react';
import { List, ListImperativeAPI } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

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

interface RowProps {
  messages: Message[];
  currentUserId: string | null;
}

const ITEM_HEIGHT = 80;

const MessageRow = ({ 
  index, 
  style, 
  messages, 
  currentUserId 
}: { 
  index: number; 
  style: CSSProperties;
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  messages: Message[];
  currentUserId: string | null;
}) => {
  const msg = messages[index];
  const isOwnMessage = msg.sender_id === currentUserId;
  const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <div style={style} className={`flex px-4 py-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
        isOwnMessage 
          ? 'bg-softTeal text-white rounded-tr-none' 
          : 'bg-white text-gray-800 rounded-tl-none'
      }`}>
        <p className="text-sm">{msg.content}</p>
        <p className={`text-[10px] mt-1 text-right ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-400'
        }`}>{timestamp}</p>
      </div>
    </div>
  );
};

export const VirtualizedMessages: React.FC<VirtualizedMessagesProps> = ({ 
  messages, 
  currentUserId 
}) => {
  const listRef = useRef<ListImperativeAPI>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToRow({ index: messages.length - 1, align: 'end' });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-gray-400">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List<RowProps>
          listRef={listRef}
          rowCount={messages.length}
          rowHeight={ITEM_HEIGHT}
          rowComponent={MessageRow}
          rowProps={{ messages, currentUserId }}
          style={{ height, width }}
        />
      )}
    </AutoSizer>
  );
};
