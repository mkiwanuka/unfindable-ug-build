-- Drop the old restrictive policy that only allows senders to update
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create policy: Users can update messages they sent (for editing content if needed)
CREATE POLICY "Users can update their sent messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Create policy: Users can mark received messages as read
-- This allows recipients to set read_at on messages in their conversations
CREATE POLICY "Users can mark received messages as read"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.requester_id = auth.uid() OR conversations.finder_id = auth.uid())
    )
    AND auth.uid() != sender_id
  );

-- Enable REPLICA IDENTITY FULL for proper real-time UPDATE events
ALTER TABLE public.messages REPLICA IDENTITY FULL;