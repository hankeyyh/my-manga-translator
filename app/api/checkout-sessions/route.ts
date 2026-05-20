import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { authService } from '@/lib/services/auth/auth-service';
import { BillingCycle, isBillingCycle, isSubscriptionTier, SubscriptionTier } from '@/lib/services/payment/subscription-prices';
import { PaymentService } from '@/lib/services/payment/payment-service';
import { UserRepository } from '@/lib/repositories/auth/user-repository';
import { createServerClient } from "@/lib/utils/supabase/server";
import z from 'zod';

const checkoutSessionSchema = z.object({
    tier: z.custom<SubscriptionTier>(isSubscriptionTier),
    billing: z.custom<BillingCycle>(isBillingCycle),
});

// 创建 Stripe 支付会话（body: { tier, billing }）
export async function POST(request: NextRequest) {
    // 1. 验证用户登录
    const userResult = await authService.getCurrentUser();
    if (userResult.error) {
        return NextResponse.json({ error: userResult.error.message }, { status: 401 });
    }
    const user = userResult.data;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 解析请求体
    const body = await request.json();
    const parseResult = checkoutSessionSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json(
            { error: 'Invalid tier or billing; expected basic|pro|ultra and monthly|yearly' },
            { status: 400 }
        );
    }
    const { tier, billing } = parseResult.data;

    // 3. 解析 header
    const headersList = await headers();
    const origin = headersList.get('origin');
    if (!origin) {
        return NextResponse.json({ error: 'Origin is required' }, { status: 400 });
    }

    // 4. 创建 Stripe 支付会话
    const supabase = await createServerClient();
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!), new UserRepository(supabase));
    const result = await paymentService.createCheckoutSession(tier, billing,
        `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`, // 成功回调 URL
        `${origin}/` // 取消后回到主页
    );
    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ url: result.data });
}