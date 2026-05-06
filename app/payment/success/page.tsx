import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/lib/repositories/user-repository";
import Stripe from "stripe";
import { PaymentService } from "@/lib/services/payment/payment-service";
import { redirect } from "next/navigation";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await searchParams;

    const supabase = await createClient();
    const userRepo = new UserRepository(supabase);
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!), userRepo);
    const result = await paymentService.retriveCheckoutSession(sessionId);
    if (result.error) {
        return <div>Error: {result.error.message}</div>
    }
    const { status, email } = result.data!;
    if (status === "open") {
        return redirect("/");
    }
    if (status === "complete") {
        return (
            <section id="success">
                <p>
                    We appreciate your business! A confirmation email will be sent to{' '}
                    {email}. If you have any questions, please email{' '}
                    <a href="mailto:orders@example.com">orders@example.com</a>.
                </p>
            </section>
        )
    }
}