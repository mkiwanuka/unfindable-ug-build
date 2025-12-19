// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push VAPID implementation
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; data?: Record<string, unknown> },
  vapidPrivateKey: string,
  vapidPublicKey: string
) {
  // Import crypto for web push
  const encoder = new TextEncoder();
  
  // Create JWT for VAPID
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 60 * 60; // 12 hours
  
  const origin = new URL(subscription.endpoint).origin;
  
  const header = { alg: 'ES256', typ: 'JWT' };
  const claims = {
    aud: origin,
    exp: exp,
    sub: 'mailto:support@unfindable.app',
  };
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  const unsignedToken = `${headerB64}.${claimsB64}`;
  
  // Import the private key
  const privateKeyData = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  // For ES256, we need to create a proper key
  const keyData = {
    kty: 'EC',
    crv: 'P-256',
    d: vapidPrivateKey,
    x: vapidPublicKey.slice(0, 43),
    y: vapidPublicKey.slice(43),
  };
  
  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      encoder.encode(unsignedToken)
    );
    
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const jwt = `${unsignedToken}.${signatureB64}`;
    
    // Send the push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Push failed:', response.status, text);
      return { success: false, status: response.status, error: text };
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error('Push error:', error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('VAPID keys not configured, skipping push notification');
      return new Response(
        JSON.stringify({ success: false, error: 'VAPID keys not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await req.json();
    const { userId, title, body: messageBody, data } = body;
    
    if (!userId || !title || !messageBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Failed to get subscriptions:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const payload = { title, body: messageBody, data };
    const results = [];
    
    for (const sub of subscriptions) {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPrivateKey,
        vapidPublicKey
      );
      
      results.push({ endpoint: sub.endpoint, ...result });
      
      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      if (result.status === 410 || result.status === 404) {
        console.log('Removing expired subscription:', sub.endpoint);
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`Sent ${successCount}/${results.length} push notifications`);
    
    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
