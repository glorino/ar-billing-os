import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('verif-hash') ?? '';

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'default';

    const event = await PaymentService.processWebhook('flutterwave', payload, signature, tenantId);

    if (!event) {
      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
        { status: 400 },
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_ERROR', message: 'Webhook processing failed' } },
      { status: 500 },
    );
  }
}
