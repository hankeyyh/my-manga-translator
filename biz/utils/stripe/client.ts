/**
 * @stripe/stripe-js/pure：import 时不会自动下载stripe的CDN脚本(240KB)，只有调用loadStripe时才懒下载
 * @stripe/stripe-js：默认import时就下载
 * 
 * 本项目只在更改订阅计划，且需要3DS验证时才使用
 */
import { loadStripe } from "@stripe/stripe-js/pure";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function loadStripeClient() {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
    }
    return stripePromise;
}
