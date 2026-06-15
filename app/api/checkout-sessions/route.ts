import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { AuthService } from '@/biz/services/auth/auth-service';
import { PaymentService } from '@/biz/services/payment/payment-service';
import { UserRepository } from '@/biz/repositories/auth/user-repository';
import { createServerClient } from "@/biz/utils/supabase/server";
import z from 'zod';
import { TopUpConfigRepository } from '@/biz/repositories/topup/topup-config';
import { CreditService } from '@/biz/services/credit/credit-service';
import { UserTransactionsRepository } from '@/biz/repositories/topup/user-transactions';
import { PricingConfigRepository } from '@/biz/repositories/pricing/pricing-config';
import { UserCreditsRepository } from '@/biz/repositories/credit/user-credits';

const checkoutSessionSchema = z.object({
    id: z.uuid()
});

// 创建 Stripe 支付会话（body: { topupConfigId }）
export async function POST(request: NextRequest) {
    // 1. 验证用户登录
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const userResult = await authService.getCurrentUser();
    if (userResult.error || !userResult.data) {
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

    // 3. 获取充值配置
    const { id } = parseResult.data;
    const creditService = new CreditService(new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
        new PricingConfigRepository(supabase),
        new UserCreditsRepository(supabase),
    );
    const topupConfigResult = await creditService.getTopUpConfig(id);
    if (topupConfigResult.error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    const topupConfig = topupConfigResult.data!;

    // 3. 解析 header
    const headersList = await headers();
    const origin = headersList.get('origin');
    if (!origin) {
        return NextResponse.json({ error: 'Origin is required' }, { status: 400 });
    }

    // 4. 创建交易记录
    const userTransResult = await creditService.startUserTransaction(userResult.data.id, topupConfig);
    if (userTransResult.error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    const userTransaction = userTransResult.data!;

    // 5. 创建 Stripe 支付会话
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!), new UserRepository(supabase));
    const result = await paymentService.createCheckoutSession(userTransaction.id, topupConfig.stripePriceId, userTransaction.transactionType,
        `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`, // 成功回调 URL
        `${origin}/payment/cancel?session_id={CHECKOUT_SESSION_ID}` // 取消页
    );
    if (result.error) {
        await creditService.failUserTransaction(userTransaction.id);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    const session = result.data!;

    // 6. stripe session.id 写回user_transaction
    const updateTransResult = await creditService.updateStripeSessionId(userTransaction.id, session.sessionId);
    if (updateTransResult.error) {
        await creditService.failUserTransaction(userTransaction.id);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
}

// 查询支付状态
export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get("session_id");
}