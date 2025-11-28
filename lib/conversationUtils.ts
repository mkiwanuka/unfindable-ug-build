import { supabase } from '../src/integrations/supabase/client';

export async function getOrCreateConversation(
  currentUserId: string,
  partnerId: string,
  requestId?: string | null
): Promise<string | null> {
  if (!currentUserId || !partnerId) return null;

  // Check for existing conversation between these users
  const { data: existing, error: existingError } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(requester_id.eq.${currentUserId},finder_id.eq.${partnerId}),and(requester_id.eq.${partnerId},finder_id.eq.${currentUserId})`
    )
    .maybeSingle();

  if (existingError) {
    console.error('Error checking existing conversation:', existingError);
  }

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  // The person being messaged is treated as requester, current user as finder
  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      requester_id: partnerId,
      finder_id: currentUserId,
      request_id: requestId || null
    })
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating conversation:', createError);
    return null;
  }

  return created?.id || null;
}
