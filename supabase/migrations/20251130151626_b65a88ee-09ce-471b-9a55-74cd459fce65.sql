-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('offer', 'message', 'system', 'payment')),
  title text NOT NULL,
  content text NOT NULL,
  reference_id uuid,
  reference_type text CHECK (reference_type IN ('request', 'offer', 'conversation')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable real-time for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Function to create notification when a new offer is made
CREATE OR REPLACE FUNCTION public.notify_new_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, reference_id, reference_type)
  SELECT 
    r.posted_by_id,
    'offer',
    'New Offer Received',
    'Someone made an offer of $' || NEW.price || ' on your request "' || r.title || '"',
    NEW.request_id,
    'request'
  FROM public.requests r WHERE r.id = NEW.request_id;
  RETURN NEW;
END;
$$;

-- Trigger for new offers
CREATE TRIGGER on_new_offer
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_offer();

-- Function to create notification when a new message is received
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Get the recipient (the other person in the conversation)
  SELECT 
    CASE 
      WHEN c.requester_id = NEW.sender_id THEN c.finder_id
      ELSE c.requester_id
    END INTO recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  -- Get sender name
  SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, type, title, content, reference_id, reference_type)
  VALUES (
    recipient_id,
    'message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    NEW.conversation_id,
    'conversation'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new messages
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Function to create notification when offer status changes
CREATE OR REPLACE FUNCTION public.notify_offer_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_title text;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title INTO request_title FROM public.requests WHERE id = NEW.request_id;
    
    IF NEW.status = 'Accepted' THEN
      INSERT INTO public.notifications (user_id, type, title, content, reference_id, reference_type)
      VALUES (
        NEW.finder_id,
        'system',
        'Offer Accepted!',
        'Your offer on "' || request_title || '" has been accepted!',
        NEW.request_id,
        'request'
      );
    ELSIF NEW.status = 'Rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, content, reference_id, reference_type)
      VALUES (
        NEW.finder_id,
        'system',
        'Offer Declined',
        'Your offer on "' || request_title || '" was not accepted.',
        NEW.request_id,
        'request'
      );
    ELSIF NEW.status = 'Completed' THEN
      INSERT INTO public.notifications (user_id, type, title, content, reference_id, reference_type)
      VALUES (
        NEW.finder_id,
        'payment',
        'Task Completed!',
        'The task "' || request_title || '" has been marked as completed.',
        NEW.request_id,
        'request'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for offer status changes
CREATE TRIGGER on_offer_status_change
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_offer_status_change();