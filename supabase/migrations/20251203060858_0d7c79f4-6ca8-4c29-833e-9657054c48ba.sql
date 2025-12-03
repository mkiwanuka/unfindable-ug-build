-- Function to get conversations with only the latest message (optimized)
CREATE OR REPLACE FUNCTION get_conversations_with_last_message(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  request_id uuid,
  requester_id uuid,
  finder_id uuid,
  updated_at timestamptz,
  request_title text,
  requester_name text,
  requester_avatar text,
  finder_name text,
  finder_avatar text,
  last_message_content text,
  last_message_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    c.id,
    c.request_id,
    c.requester_id,
    c.finder_id,
    c.updated_at,
    r.title as request_title,
    pr.name as requester_name,
    pr.avatar as requester_avatar,
    pf.name as finder_name,
    pf.avatar as finder_avatar,
    lm.content as last_message_content,
    lm.created_at as last_message_at
  FROM conversations c
  LEFT JOIN requests r ON r.id = c.request_id
  LEFT JOIN profiles pr ON pr.id = c.requester_id
  LEFT JOIN profiles pf ON pf.id = c.finder_id
  LEFT JOIN LATERAL (
    SELECT content, created_at 
    FROM messages m 
    WHERE m.conversation_id = c.id 
    ORDER BY m.created_at DESC 
    LIMIT 1
  ) lm ON true
  WHERE c.requester_id = p_user_id OR c.finder_id = p_user_id
  ORDER BY c.updated_at DESC;
$$;