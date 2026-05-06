import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { authService } from '@/lib/services/auth/auth-service'
import { isBillingCycle, isSubscriptionTier } from '@/lib/utils/subscription-prices'
import { PaymentService } from '@/lib/services/payment/payment-service'
import { UserRepository } from '@/lib/repositories/user-repository'
import { createClient } from '@/lib/supabase/server'

// 创建 Stripe 支付会话（body: { tier, billing }）
export async function POST(request: NextRequest) {
    // 1. 验证用户登录
    const userResult = await authService.getCurrentUser()
    if (userResult.error) {
        return NextResponse.json({ error: userResult.error.message }, { status: 401 })
    }
    const user = userResult.data
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 解析请求体
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
    }

    const { tier, billing } = body as { tier?: unknown; billing?: unknown }
    if (!isSubscriptionTier(tier) || !isBillingCycle(billing)) {
        return NextResponse.json(
            { error: 'Invalid tier or billing; expected basic|pro|ultra and monthly|yearly' },
            { status: 400 }
        )
    }
    const headersList = await headers()
    const origin = headersList.get('origin')
    if (!origin) {
        return NextResponse.json({ error: 'Origin is required' }, { status: 400 })
    }
    
    // 3. 创建 Stripe 支付会话
    const supabase = await createClient()
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!), new UserRepository(supabase))
    const result = await paymentService.createCheckoutSession(tier, billing, 
        `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`, // 成功回调 URL
        `${origin}/payment/cancel` // 取消回调 URL
    )
    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    return NextResponse.json({ url: result.data })
}