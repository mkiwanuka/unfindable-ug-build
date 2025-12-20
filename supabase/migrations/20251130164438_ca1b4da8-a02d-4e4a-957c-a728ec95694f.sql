-- Performance indexes for scalability (10K+ daily users)

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id, read_at) 
  WHERE read_at IS NULL;

-- Notifications table indexes  
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) 
  WHERE read = false;

-- Requests table indexes
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_posted_by ON public.requests(posted_by_id);
CREATE INDEX IF NOT EXISTS idx_requests_category ON public.requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON public.requests(status, created_at DESC);

-- Offers table indexes
CREATE INDEX IF NOT EXISTS idx_offers_request ON public.offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_finder ON public.offers(finder_id);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_requester ON public.conversations(requester_id);
CREATE INDEX IF NOT EXISTS idx_conversations_finder ON public.conversations(finder_id);