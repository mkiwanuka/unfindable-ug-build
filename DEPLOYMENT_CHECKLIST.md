# Push Notifications Deployment Checklist

## Pre-Deployment (Verify Setup)

- [ ] Confirm VAPID keys exist in Supabase Secrets
  - [ ] `VAPID_PUBLIC_KEY` (in Secrets)
  - [ ] `VAPID_PRIVATE_KEY` (in Secrets)
- [ ] Confirm `VITE_VAPID_PUBLIC_KEY` in `.env.local`
- [ ] Edge Function deployed: `supabase functions list`
  - [ ] `send-push-notification` visible in list
  - [ ] No errors in deployment
- [ ] Verify local build succeeds: `npm run build`

## Database Setup

- [ ] Run migration: Copy SQL from `supabase/migrations/20250101000000_create_push_subscriptions.sql`
  - [ ] Table `push_subscriptions` created
  - [ ] Indexes created
  - [ ] RLS policies enabled
  - [ ] Verify in Supabase Dashboard → Tables

## Code Integration

- [ ] `/pages/Messages.tsx` has push notification trigger
  - [ ] Import statement present
  - [ ] Trigger called after message sent
  - [ ] Correct function signature
- [ ] `/components/NotificationSettings.tsx` created and available
- [ ] `/lib/pushNotifications.ts` available with all functions
- [ ] `/public/sw.js` exists and is accessible

## UI Implementation

- [ ] NotificationSettings component added to Settings page
  - [ ] Component imports correctly
  - [ ] Component displays toggle
  - [ ] Toggle works without errors
- [ ] Visual feedback working
  - [ ] Enable shows "Notifications Enabled"
  - [ ] Disable shows "Notifications Disabled"
  - [ ] Loading state shows spinner

## Local Testing

Test in development before deploying:

### Test 1: Service Worker Registration
- [ ] Open DevTools (F12)
- [ ] Go to Application → Service Workers
- [ ] Verify `/sw.js` shows "activated and running"
- [ ] No errors in console

### Test 2: Notification Permission
- [ ] Login to app
- [ ] Go to Settings → Notifications
- [ ] Click toggle
- [ ] Browser shows permission prompt
- [ ] Grant permission
- [ ] Notification enabled message appears

### Test 3: Database Subscription
- [ ] After enabling, check Supabase Dashboard
- [ ] Go to `push_subscriptions` table
- [ ] Verify new row exists with:
  - [ ] Your user_id
  - [ ] Non-empty endpoint
  - [ ] Non-empty p256dh
  - [ ] Non-empty auth

### Test 4: Send Notification
- [ ] Open two browser windows/tabs
- [ ] Login as User A in first tab
- [ ] Login as User B in second tab
- [ ] Enable notifications for User B
- [ ] Send message from User A to User B
- [ ] Check if User B receives notification
  - [ ] Notification appears
  - [ ] Contains message content
  - [ ] Contains sender name
- [ ] Click notification
  - [ ] Chat opens
  - [ ] Message visible
  - [ ] Window focused

### Test 5: Disable Notifications
- [ ] In User B's settings
- [ ] Click toggle to disable
- [ ] Confirm in database that row is deleted
- [ ] Send another message from User A
- [ ] Verify User B does NOT receive notification

## Console Checks

### Browser Console (F12)
- [ ] No red errors
- [ ] Should see logs like:
  - `Service Worker registered: /sw.js`
  - `Push notifications enabled`
  - `[SW] Push received:`
- [ ] No CORS errors
- [ ] No auth errors

### Supabase Logs
- [ ] Go to Supabase Dashboard → Edge Functions → send-push-notification
- [ ] Run a test: send a message
- [ ] Check logs for:
  - [ ] No errors
  - [ ] `Sent X/X push notifications`
  - [ ] Status 200 responses

## Production Deployment

### Before Going Live
- [ ] All local tests pass
- [ ] No console errors in staging
- [ ] VAPID keys confirmed in production Supabase
- [ ] Edge Function deployed to production

### Deployment Steps
1. [ ] Merge all code to main/master
2. [ ] Deploy frontend (Vercel, Netlify, etc.)
3. [ ] Verify build succeeds
4. [ ] HTTPS enabled (required for Service Workers)

### Post-Deployment Tests
- [ ] Test in production URL
- [ ] Service Worker registers
- [ ] Enable notifications in Settings
- [ ] Send test message
- [ ] Receive notification
- [ ] Click notification → chat opens

## Monitoring

### Daily Checks
- [ ] No errors in Supabase Edge Function logs
- [ ] No errors in frontend error tracking (Sentry, etc.)
- [ ] User reports no issues with notifications

### Weekly Checks
- [ ] Database growth reasonable
  - [ ] `push_subscriptions` table size
  - [ ] Check for orphaned subscriptions
- [ ] No stale subscriptions (410 errors)

### Monthly Checks
- [ ] Review analytics
  - [ ] Notification delivery rate
  - [ ] Click-through rate
  - [ ] User adoption rate
- [ ] Check for any error patterns

## Rollback Plan

If issues occur post-deployment:

### Option 1: Disable Notifications (Quick)
- [ ] Keep code as-is
- [ ] Hide NotificationSettings component
- [ ] Users stay unaffected
- [ ] Messages still send normally

### Option 2: Disable Edge Function
- [ ] In Edge Function, add early return:
  ```ts
  return new Response('ok'); // Don't send anything
  ```
- [ ] Messages continue working
- [ ] No notifications sent
- [ ] No errors to users

### Option 3: Remove Integration
- [ ] Remove notification trigger from Messages.tsx
- [ ] Remove NotificationSettings from Settings
- [ ] Redeploy frontend
- [ ] Everything works normally

## Troubleshooting During Testing

### Issue: Service Worker not registering
**Solution:**
- [ ] Check if app is served over HTTPS
- [ ] Verify `/public/sw.js` exists and is accessible
- [ ] Clear browser cache: Cmd+Shift+Delete
- [ ] Check browser console for registration errors

### Issue: Permission prompt doesn't show
**Solution:**
- [ ] Check browser settings → Permissions
- [ ] Reset notification permission for domain
- [ ] Try incognito window
- [ ] Verify `Notification.requestPermission()` being called

### Issue: Notification doesn't arrive
**Solution:**
- [ ] Check Supabase Edge Function logs
- [ ] Verify VAPID keys in Supabase Secrets
- [ ] Check if subscription exists in database
- [ ] Verify sender is different user (no self-notifications)
- [ ] Check if recipient is online

### Issue: Clicking notification doesn't open chat
**Solution:**
- [ ] Check Service Worker in DevTools
- [ ] Verify `/sw.js` has `notificationclick` handler
- [ ] Check browser console for navigation errors
- [ ] Try refreshing the page and clicking again

## Success Criteria

✅ Feature is working when:
- [ ] Users can enable notifications in Settings
- [ ] Notifications appear when they receive messages
- [ ] Clicking notification opens chat with message
- [ ] Users can disable notifications
- [ ] Disabled users don't receive notifications
- [ ] No errors in console or logs
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile (iOS 16.1+, Android)
- [ ] Message sending still fast (< 500ms)
- [ ] No performance degradation

## Performance Baseline

Record these before deploying:

- [ ] Message send time: _____ ms
- [ ] UI responsiveness: _____ (good/fair/poor)
- [ ] App bundle size: _____ KB
- [ ] Memory usage: _____ MB

After deploying, verify they haven't degraded significantly.

## Sign-Off

- [ ] Developer: Tested and verified working
- [ ] Code reviewed: All functions reviewed
- [ ] QA: Tested on multiple browsers
- [ ] Ready for production: Yes / No

**Date Deployed:** _______________

**Deployed By:** _______________

**Notes:** _______________________________________________

## Support & Questions

For issues post-deployment:
1. Check browser console (F12)
2. Review Supabase Edge Function logs
3. Re-read PUSH_NOTIFICATIONS_SETUP.md
4. Check troubleshooting section in this file
