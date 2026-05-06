import { UserRepository } from "@/lib/repositories/user-repository";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { beforeAll, describe, expect, test } from "@jest/globals"
import Stripe from "stripe";
import { PaymentService } from "./payment-service";

describe("PaymentService", () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let paymentService: PaymentService;
    beforeAll(async () => {
        const supabase = await createServiceRoleClient();
        const userRepo = new UserRepository(supabase);
        paymentService = new PaymentService(stripe, userRepo);
    })
    test("retriveCheckoutSession success", async() => {
        const sessionId = "cs_test_a1N6s54oxLPMAm9RKKOeVvH9L2QxuBFZ6bMkBGT0D8jZM7QGgkufSpxYXu";
        const result = await paymentService.retriveCheckoutSession(sessionId);
        console.log(result.data);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
    })
})