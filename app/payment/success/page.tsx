import { Suspense } from "react";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createServerClient } from "@/lib/utils/supabase/server";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { PaymentService } from "@/lib/services/payment/payment-service";
import SuccessDisplay from "@/components/payment/payment-success";

export default function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PaymentSuccessDetail searchParams={searchParams} />
        </Suspense>
    );
}

async function PaymentSuccessDetail({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    const { session_id: sessionId } = await searchParams;

    const supabase = await createServerClient();
    const userRepo = new UserRepository(supabase);
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!), userRepo);
    const result = await paymentService.retriveCheckoutSession(sessionId);
    if (result.error) {
        return <div>Error: {result.error.message}</div>;
    }
    const { status, email } = result.data!;
    if (status === "open") {
        return redirect("/");
    }
    if (status === "complete") {
        return (
            <SuccessDisplay email={email ?? ""} />
        );
    }
}