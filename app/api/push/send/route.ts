import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { isAuthorizedPushBroadcast } from '@/lib/security/push'

export async function POST(request: Request) {
  const broadcastSecret = process.env.PUSH_BROADCAST_SECRET;

  if (!broadcastSecret) {
    return NextResponse.json({ error: 'Push broadcast secret not configured' }, { status: 500 });
  }

  if (!isAuthorizedPushBroadcast(request, broadcastSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  try {
    const { title, body, url, targetEndpoint } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/'
    });

    let subscriptions = [];

    if (targetEndpoint) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', targetEndpoint);
      if (data) subscriptions = data;
    } else {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');
      if (data) subscriptions = data;
    }

    const notifications = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(pushSubscription, payload)
        .catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription has expired or is no longer valid
            return supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
          console.error('Error sending notification:', err);
        });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
