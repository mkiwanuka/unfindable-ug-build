# Push Notifications Setup Guide

## Overview

This guide walks through the complete setup for web push notifications in the Unfindable app.

## Prerequisites

- VAPID public and private keys (already stored in Supabase)
- Supabase project with access
- Service Worker support in your browser

## 1. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create push_subscriptions table
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create unique index on user_id and endpoint
create unique index if not exists push_subscriptions_user_endpoint_idx
  on push_subscriptions (user_id, endpoint);

-- Create index on user_id for fast lookups
create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions (user_id);

-- Enable RLS
alter table push_subscriptions enable row level security;

-- Create RLS policies
create policy "Users can see their own subscriptions"
  on push_subscriptions for select
  using (user_id = auth.uid());

create policy "Users can manage their own subscriptions"
  on push_subscriptions for insert, update, delete
  using (user_id = auth.uid());
```

## 2. Set Environment Variables

Add these to your `.env.local`:

```env
VITE_VAPID_PUBLIC_KEY=<your-vapid-public-key>
```

Your VAPID_PRIVATE_KEY is already stored in Supabase as a secret.

## 3. Verify Edge Function Deployment

The Edge Function `send-push-notification` should already be deployed. Verify:

```bash
supabase functions list
```

Should show: `send-push-notification`

If not deployed, deploy it:

```bash
supabase functions deploy send-push-notification
```

## 4. Initialize Push Notifications After Login

In your login/auth flow, call:

```typescript
import { registerServiceWorker, initPushNotifications } from '@/lib/pushNotifications';
import { VITE_VAPID_PUBLIC_KEY } from '@/config';

// After user successfully logs in
const user = await getUser();
await registerServiceWorker();
await initPushNotifications(user.id, VITE_VAPID_PUBLIC_KEY);
```

Or use the `NotificationSettings` component in your Settings page for users to toggle notifications.

## 5. How It Works

### User Flow

1. **User logs in** → Service Worker registers → User is asked for notification permission
2. **User grants permission** → Browser subscribes to push notifications
3. **Subscription stored** → Details saved to `push_subscriptions` table
4. **Message sent** → Recipient gets push notification via Edge Function
5. **Notification clicked** → Browser opens chat and focuses the window

### Technical Flow

```
Browser (User A)
  ↓
  Sends message via Supabase
  ↓
Messages.tsx
  ↓
  Calls triggerPushNotification()
  ↓
Edge Function: send-push-notification
  ↓
  Queries push_subscriptions for recipient (User B)
  ↓
  Sends encrypted push to Push Service (Google, Mozilla, etc.)
  ↓
Browser (User B)
  ↓
  Service Worker receives push
  ↓
  Shows notification
  ↓
  User clicks → Opens chat
```

## 6. Testing Notifications

### Local Testing

1. Open the app and go to Settings → Notifications
2. Click "Enable Notifications"
3. Grant browser permission when prompted
4. Send yourself a message from another account
5. You should see a notification

### Browser DevTools

1. Open DevTools (F12)
2. Go to **Application → Service Workers**
3. Check that `/sw.js` is registered and active
4. Check **Application → Storage → Cookies** for VAPID keys

## 7. Smart Rules Implemented

The notification system avoids spam:

- **No self-notifications**: Users don't get notified of their own messages
- **No duplicate notifications**: Each subscription gets only one notification
- **Graceful degradation**: If notifications fail, the message still sends
- **Cleanup on error**: Invalid subscriptions (410 Gone) are auto-removed

## 8. Troubleshooting

### "Service Worker registration failed"

**Solution**: Ensure:
- App is served over HTTPS (required for Service Workers)
- `/public/sw.js` exists and is accessible
- Browser supports Service Workers

### "Notification permission denied"

**Solution**: User needs to grant browser permission. They can reset this in browser settings:
- Chrome: Settings → Privacy and security → Site settings → Notifications
- Firefox: Preferences → Privacy → Permissions → Notifications

### "VAPID keys not configured"

**Solution**: Verify in Supabase Dashboard:
1. Go to Settings → Secrets
2. Check that `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are set
3. Restart the Edge Function

### Notifications not received

**Solution**: Check:
1. Is the user subscribed? (`push_subscriptions` table has a record)
2. Are VAPID keys correct?
3. Is the Edge Function deployed?
4. Check browser console for errors
5. Check Supabase Edge Function logs

## 9. Files Involved

- `/public/sw.js` - Service Worker
- `/lib/pushNotifications.ts` - Notification utilities
- `/components/NotificationSettings.tsx` - Settings UI
- `/supabase/functions/send-push-notification/index.ts` - Backend function
- `/pages/Messages.tsx` - Triggers notifications on message send
- SQL schema - `push_subscriptions` table

## 10. Browser Support

| Browser | Support |
| --- | --- |
| Chrome | ✅ Yes |
| Firefox | ✅ Yes |
| Safari (iOS 16.1+) | ✅ Yes |
| Edge | ✅ Yes |
| Safari (Mac) | ⚠️ Limited |
| Opera | ✅ Yes |

## 11. Production Checklist

- [ ] VAPID keys generated and stored in Supabase
- [ ] `push_subscriptions` table created
- [ ] Edge Function deployed
- [ ] Environment variables set
- [ ] Service Worker registered on login
- [ ] NotificationSettings component added to Settings page
- [ ] Tested with multiple users
- [ ] Verified cleanup of invalid subscriptions
- [ ] HTTPS enabled in production
- [ ] Error monitoring configured

## References

- [Web Push Protocol (RFC 8030)](https://datatracker.ietf.org/doc/html/rfc8030)
- [Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Keys (Google Developers)](https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol)
