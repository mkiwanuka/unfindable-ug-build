import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string | null;
  isOwnMessage: boolean;
  onReactionChange: () => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  isOwnMessage,
  onReactionChange
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) return;
    
    const existingReaction = reactions.find(r => r.emoji === emoji && r.userReacted);
    
    try {
      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji
          });
      }
      onReactionChange();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
    
    setShowPicker(false);
  };

  return (
    <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Existing reactions */}
      {reactions.filter(r => r.count > 0).map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all ${
            reaction.userReacted
              ? 'bg-softTeal/20 border border-softTeal/40'
              : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-gray-600">{reaction.count}</span>
        </button>
      ))}
      
      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Add reaction"
        >
          <Smile className="h-4 w-4" />
        </button>
        
        {/* Emoji picker */}
        {showPicker && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowPicker(false)}
            />
            <div className={`absolute z-20 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 flex gap-1 ${
              isOwnMessage ? 'right-0' : 'left-0'
            }`}>
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

