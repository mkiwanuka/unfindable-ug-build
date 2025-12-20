-- =====================================================
-- SCALABILITY OPTIMIZATIONS FOR 100K DAILY USERS
-- =====================================================

-- Phase 1: Additional composite indexes for common query patterns
-- These dramatically improve query performance at scale

-- Messages: conversation + created_at for paginated message fetching
CREATE INDEX IF NOT EXISTS idx_messages_conv_created 
ON messages(conversation_id, created_at DESC);

-- Messages: unread messages query optimization  
CREATE INDEX IF NOT EXISTS idx_messages_unread_recipient
ON messages(conversation_id, sender_id, read_at) 
WHERE read_at IS NULL;

-- Requests: user's requests by status (for dashboard)
CREATE INDEX IF NOT EXISTS idx_requests_user_status 
ON requests(posted_by_id, status);

-- Requests: category + status for filtered browsing
CREATE INDEX IF NOT EXISTS idx_requests_category_status
ON requests(category, status) WHERE status = 'Open';

-- Offers: finder's offers with status
CREATE INDEX IF NOT EXISTS idx_offers_finder_status
ON offers(finder_id, status);

-- Conversations: optimized lookup for both participants
CREATE INDEX IF NOT EXISTS idx_conversations_participants
ON conversations(requester_id, finder_id);

-- Notifications: unread notifications by user (for badge count)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, read) WHERE read = false;

-- Reviews: for profile rating calculation
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed
ON reviews(reviewed_id);

-- Phase 2: Create optimized function for fetching user with role in single query
CREATE OR REPLACE FUNCTION get_user_with_role(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  avatar text,
  bio text,
  location text,
  skills text[],
  rating numeric,
  completed_tasks integer,
  response_time text,
  joined_date timestamptz,
  verified boolean,
  balance numeric,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatar,
    p.bio,
    p.location,
    p.skills,
    p.rating,
    p.completed_tasks,
    p.response_time,
    p.joined_date,
    p.verified,
    p.balance,
    COALESCE(ur.role::text, 'guest') as role
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = p_user_id;
$$;

-- Phase 3: Create optimized function for public profile (no balance)
CREATE OR REPLACE FUNCTION get_public_user_with_role(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  avatar text,
  bio text,
  location text,
  skills text[],
  rating numeric,
  completed_tasks integer,
  response_time text,
  joined_date timestamptz,
  verified boolean,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatar,
    p.bio,
    p.location,
    p.skills,
    p.rating,
    p.completed_tasks,
    p.response_time,
    p.joined_date,
    p.verified,
    COALESCE(ur.role::text, 'guest') as role
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = p_user_id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_with_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_user_with_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_user_with_role(uuid) TO anon;