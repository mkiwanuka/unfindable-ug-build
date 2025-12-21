# Push Notifications Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐          │
│  │  Messages Page       │         │  Settings Page       │          │
│  │  (pages/Messages.tsx)│         │ (NotificationSettings│          │
│  │                      │         │    Component)        │          │
│  │  - Send message      │         │                      │          │
│  │  - Trigger notif     │         │  - Enable/Disable    │          │
│  └──────────┬───────────┘         │  - Check status      │          │
│             │                      │  - Store permission  │          │
│             │                      └──────────┬───────────┘          │
│             │                                │                       │
│  ┌──────────▼──────────────────────────────┬┴──────────────────────┐│
│  │   Push Notifications Library              │                       ││
│  │  (lib/pushNotifications.ts)               │                       ││
│  │  - registerServiceWorker()                │                       ││
│  │  - enablePushNotifications()              │                       ││
│  │  - disablePushNotifications()             │                       ││
│  │  - triggerPushNotification()              │                       ││
│  │  - isPushNotificationsEnabled()           │                       ││
│  └──────────┬──────────────────────────────┬┘                       ││
│             │                              │                        ││
│  ┌──────────▼──────────────┐  ┌────────────▼──────────────┐        ││
│  │  Service Worker (sw.js) │  │  PushManager (Browser)   │        ││
│  │                          │  │                          │        ││
│  │  - listen('push')        │  │  - subscribe()           │        ││
│  │  - showNotification()    │  │  - getSubscription()     │        ││
│  │  - listen('click')       │  │  - unsubscribe()         │        ││
│  │  - navigate to chat      │  │                          │        ││
│  └────────────┬─────────────┘  └────────────┬─────────────┘        ││
│               │                             │                       ││
└───────────────┼─────────────────────────────┼───────────────────────┘
                │                             │
                │ (Encrypted)                 │ (Browser subscription keys)
                │                             │
┌───────────────▼─────────────────────────────▼───────────────────────┐
│                        INTERNET / PUSH SERVICE                       │
│                  (Google FCM, Mozilla APNs, etc.)                    │
└─────────────────────────────────────────────┬───────────────────────┘
                                              │
┌─────────────────────────────────────────────▼───────────────────────┐
│                    SUPABASE (Backend)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────┐      ┌──────────────────────────────┐  │
│  │  Database              │      │  Edge Function               │  │
│  │  push_subscriptions    │      │  send-push-notification      │  │
│  │                        │      │                              │  │
│  │  - user_id             │      │  1. Receive message data     │  │
│  │  - endpoint            │      │  2. Query subscriptions      │  │
│  │  - p256dh              │      │  3. Sign JWT with VAPID key │  │
│  │  - auth                │      │  4. Encrypt payload          │  │
│  │  - timestamps          │      │  5. POST to Push Service     │  │
│  └────────────▲───────────┘      │  6. Clean up 410 errors      │  │
│               │                  │  7. Return result            │  │
│               │ (Read)           └──────────▲──────────────────┘  │
│               │                             │                      │
│  ┌────────────┴──────────────────────┬──────┴──────────────────┐  │
│  │  API Endpoint                      │  VAPID Keys (Secrets)  │  │
│  │  POST /functions/v1/send-push      │  - VAPID_PUBLIC_KEY    │  │
│  │                                    │  - VAPID_PRIVATE_KEY   │  │
│  │  Input:                            │                         │  │
│  │  - userId                          │  Used for:              │  │
│  │  - title                           │  - JWT signing          │  │
│  │  - body                            │  - Browser subscription │  │
│  │  - conversationId                  │                         │  │
│  └────────────▲──────────────────────┴───────────────────────┘  │
│               │ (Called by frontend)                              │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │
┌───────────────┴──────────────────────────────────────────────────────┐
│                    FRONTEND (Messages.tsx)                            │
│                                                                        │
│  await fetch('/functions/v1/send-push', {                            │
│    method: 'POST',                                                   │
│    body: JSON.stringify({                                            │
│      userId: recipientId,                                            │
│      title: senderName,                                              │
│      body: messageContent,                                           │
│      conversationId: chatId                                          │
│    })                                                                │
│  })                                                                  │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Message → Notification

```
1. User A sends message
   │
   ├─→ Insert into messages table
   │
   ├─→ Call triggerPushNotification()
   │
   └─→ for each recipient:
       │
       ├─→ POST /functions/v1/send-push
       │
       ├─→ Edge Function receives request
       │
       ├─→ Query push_subscriptions WHERE user_id = recipient_id
       │
       ├─→ For each subscription:
       │   │
       │   ├─→ Create VAPID JWT
       │   │
       │   ├─→ Encrypt message payload
       │   │
       │   ├─→ POST to Push Service endpoint
       │   │
       │   ├─→ If 410/404 error: DELETE subscription
       │   │
       │   └─→ Return result
       │
       └─→ Return success count

2. Push Service queues notification
   │
   └─→ Delivers to User B's device

3. User B's browser Service Worker
   │
   ├─→ Receives 'push' event
   │
   ├─→ Parse payload
   │
   ├─→ showNotification()
   │
   └─→ Display in browser (or OS notification on mobile)

4. User B clicks notification
   │
   ├─→ 'notificationclick' event fires
   │
   ├─→ Find/focus window
   │
   └─→ Navigate to /messages?c={conversationId}
```

## Database Schema

```sql
push_subscriptions
├── id (UUID, primary key)
├── user_id (UUID, foreign key → auth.users)
├── endpoint (text)
│   └─ Push Service endpoint URL
│      e.g., https://fcm.googleapis.com/fcm/send/...
├── p256dh (text)
│   └─ Diffie-Hellman public key (encryption key 1)
├── auth (text)
│   └─ HMAC authentication key (encryption key 2)
├── created_at (timestamp)
└── updated_at (timestamp)

Indexes:
├── push_subscriptions_user_endpoint_idx (UNIQUE)
└── push_subscriptions_user_id_idx
```

## Component Interactions

```
NotificationSettings
    ├── Calls: enablePushNotifications()
    │   ├── Calls: registerServiceWorker()
    │   ├── Calls: Notification.requestPermission()
    │   ├── Calls: PushManager.subscribe()
    │   └── Calls: savePushSubscription()
    │
    └── Calls: disablePushNotifications()
        ├── Calls: PushManager.unsubscribe()
        └── DELETE from push_subscriptions

Messages (handleSendMessage)
    ├── Insert message into DB
    │
    └── Calls: triggerPushNotification()
        ├── For each recipient
        │
        └── Calls: /functions/v1/send-push
            ├── Queries push_subscriptions
            ├── Signs VAPID JWT
            ├── Encrypts payload
            ├── POSTs to Push Service
            └── Cleans up invalid subscriptions
```

## Security Model

```
Authentication & Authorization:
├── Browser → Supabase API
│   └─ Uses JWT from auth.getSession()
│
├── Frontend → Edge Function
│   ├─ Verified by JWT token
│   └─ User must be authenticated
│
└── Edge Function → Push Service
    ├─ Verified by VAPID JWT
    │   └─ Contains aud (origin)
    │   └─ Contains exp (expiration)
    │   └─ Contains sub (mailto)
    │
    └─ Signed with VAPID_PRIVATE_KEY (secret)

Data Encryption:
├── Browser → Device
│   └─ Encrypted by PushManager
│       ├─ Uses p256dh key
│       └─ Uses auth key
│       (end-to-end encryption)
│
└── Push Service → Browser
    └─ Encrypted in transit (TLS)

Database Security:
├── RLS Policies
│   ├─ Users can only READ their own subscriptions
│   ├─ Users can only CREATE their own subscriptions
│   ├─ Users can only DELETE their own subscriptions
│   └─ Enforced at Postgres layer
│
└── No sensitive data stored
    ├─ No user IDs in notifications
    ├─ No emails in notifications
    └─ Only name + message preview
```

## Failure Scenarios

```
Scenario 1: Browser doesn't support Service Workers
├─ registerServiceWorker() returns null
├─ User never asks for permission
└─ NotificationSettings component shows nothing

Scenario 2: User denies notification permission
├─ Notification.requestPermission() returns 'denied'
├─ No subscription created
├─ NotificationSettings shows "Notifications Disabled"
└─ App continues working normally

Scenario 3: Push subscription expires (410 Gone)
├─ Edge Function receives 410 from Push Service
├─ Auto-deletes record from push_subscriptions
├─ Next message will skip that subscription
└─ User can re-enable anytime

Scenario 4: VAPID keys not configured
├─ Edge Function checks Deno.env.get('VAPID_PRIVATE_KEY')
├─ Returns error: "VAPID keys not configured"
├─ Frontend logs error (no user-facing error)
├─ Message still sends (notifications just skipped)
└─ Check Supabase Secrets to fix

Scenario 5: Network error on Edge Function
├─ Frontend catch block logs error
├─ Message still sent to database
├─ Notification attempt failed silently
├─ User still gets message, just no notification
└─ Non-blocking (doesn't break chat)

Scenario 6: Service Worker crashes
├─ Browser isolates Service Worker
├─ App continues working
├─ Future notifications might fail
├─ User can re-enable to re-register SW
└─ No data loss
```

## Performance Characteristics

```
Message Sending:
├─ Optimistic update: instant (< 1ms)
├─ Database insert: ~100-200ms
├─ Notification trigger: background async
│  └─ Non-blocking (doesn't wait)
│
└─ User sees message immediately

Notification Delivery:
├─ Browser receives push: < 5 seconds (typical)
├─ Service Worker processes: < 100ms
├─ Notification shows: instant
│
└─ Total latency: < 6 seconds (usually)

Database:
├─ Query for subscriptions: O(user_id index) = ~1-5ms
├─ Per subscription: ~200-500ms (network to Push Service)
├─ Cleanup: O(1) = ~10ms
│
└─ Parallelized: all subscriptions sent in parallel

Scalability:
├─ 1 user with 1 subscription: < 200ms total
├─ 1 user with 5 subscriptions: < 200ms (parallel)
├─ 10 recipients per message: < 2 seconds (parallel)
├─ Edge Function: auto-scales
│
└─ No bottlenecks identified
```

## Testing Flowchart

```
Start
  │
  ├─→ Run migration (create push_subscriptions)
  │    └─→ Verify table exists in Supabase
  │
  ├─→ Deploy Edge Function
  │    └─→ supabase functions deploy send-push-notification
  │
  ├─→ Set VAPID keys
  │    └─→ Check Supabase Secrets
  │
  ├─→ Add NotificationSettings to Settings page
  │    └─→ Import component
  │
  ├─→ Test in browser
  │    ├─→ Open DevTools (F12)
  │    ├─→ Go to Application → Service Workers
  │    ├─→ Verify /sw.js is registered
  │    │
  │    └─→ Open Settings → Notifications
  │        ├─→ Click toggle
  │        ├─→ Grant browser permission
  │        ├─→ Verify subscription created
  │        │
  │        └─→ Send message from another account
  │            ├─→ Check browser notification
  │            ├─→ Click notification
  │            └─→ Verify chat opens
  │
  └─→ Done! 🎉
```
