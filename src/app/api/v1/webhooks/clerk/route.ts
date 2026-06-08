import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!CLERK_WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: { code: 'CONFIGURATION_ERROR', message: 'Webhook secret not configured' } },
        { status: 500 },
      );
    }

    const payload = await request.text();
    const svix_id = request.headers.get('svix-id') ?? '';
    const svix_timestamp = request.headers.get('svix-timestamp') ?? '';
    const svix_signature = request.headers.get('svix-signature') ?? '';

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as { type: string; data: Record<string, unknown> };

    switch (evt.type) {
      case 'organization.created': {
        const org = evt.data;
        await db.insert(tenants).values({
          clerkOrgId: org.id as string,
          name: org.name as string,
          slug: (org.slug as string) ?? (org.id as string),
          contactEmail: (org.email as string) ?? '',
          status: 'active',
        }).onConflictDoNothing();
        break;
      }
      case 'organization.updated': {
        const org = evt.data;
        await db
          .update(tenants)
          .set({ name: org.name as string, updatedAt: new Date() })
          .where(eq(tenants.clerkOrgId, org.id as string));
        break;
      }
      case 'organization.deleted': {
        const org = evt.data;
        await db
          .update(tenants)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(tenants.clerkOrgId, org.id as string));
        break;
      }
      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_ERROR', message: 'Webhook processing failed' } },
      { status: 500 },
    );
  }
}
