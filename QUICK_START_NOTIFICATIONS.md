# Quick Start: Add Push Notifications to Your App

## 1-Minute Setup

### Step 1: Create the Database Table

Go to Supabase SQL Editor and run:

```sql
-- Copy from: supabase/migrations/20250101000000_create_push_subscriptions.sql
```

Or run the migration file directly if using Supabase CLI.

### Step 2: Add NotificationSettings to Your Settings Page

In your Settings component:

```tsx
import { NotificationSettings } from '@/components/NotificationSettings';

export function SettingsPage() {
  const { user } = useAuth(); // or however you get the current user

  return (
    <div className="space-y-8">
      {/* Other settings... */}

      {/* Add this section */}
      <section className="border-t pt-8">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <NotificationSettings userId={user.id} />
      </section>
    </div>
  );
}
```

### Step 3: Initialize Service Worker After Login

In your auth/login handler:

```tsx
import { registerServiceWorker } from '@/lib/pushNotifications';

// After successful login:
await registerServiceWorker();
```

Done! 🎉

---

## Testing It Works

1. Open the app
2. Go to Settings → Notifications
3. Click the toggle to enable
4. Grant browser permission
5. Send a message from another account
6. You should see a notification!

---

## What Happens Next (Auto)

Once enabled:

✅ Every time you receive a message, you get a notification
✅ Works even if the app tab is closed
✅ Clicking the notification opens the chat
✅ No additional code needed

---

## Disabling (Optional)

Users can disable notifications anytime in Settings. The toggle switches it off.

---

## Files You Need

- ✅ `/public/sw.js` - Already created
- ✅ `/lib/pushNotifications.ts` - Already created
- ✅ `/components/NotificationSettings.tsx` - Already created
- ✅ Edge Function deployed - Already done
- ✅ Messages.tsx integration - Already done

---

## Common Questions

**Q: Will users be forced to enable notifications?**
A: No, it's optional. They can enable/disable anytime.

**Q: What if the browser doesn't support push?**
A: NotificationSettings gracefully handles it and shows nothing.

**Q: Do notifications work offline?**
A: Notifications come through the Push Service, so they work even when the app is closed.

**Q: Can users control notification frequency?**
A: Yes - they have a toggle in Settings. We don't have per-conversation muting yet.

**Q: Will this work on mobile?**
A: Yes! iOS 16.1+, Android Chrome, and all desktop browsers support it.

---

## That's It!

Your app now has production-grade push notifications.

For advanced configuration, see `PUSH_NOTIFICATIONS_SETUP.md`.
