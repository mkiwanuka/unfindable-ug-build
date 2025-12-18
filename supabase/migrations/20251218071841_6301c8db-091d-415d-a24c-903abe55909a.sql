-- Add status column for delivery tracking (sending, sent, delivered, read, failed)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent';

-- Add seq column for reliable message ordering (auto-incrementing)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS seq BIGSERIAL;

-- Performance indexes for chat functionality
CREATE INDEX IF NOT EXISTS messages_conversation_seq_idx 
ON messages (conversation_id, seq);

CREATE INDEX IF NOT EXISTS messages_conversation_status_idx 
ON messages (conversation_id, status);

-- Index for fast unread counts (partial index for non-read messages)
CREATE INDEX IF NOT EXISTS messages_unread_status_idx 
ON messages (conversation_id, sender_id)
WHERE status != 'read';