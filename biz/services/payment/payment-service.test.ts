import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { beforeAll, describe, expect, test } from "@jest/globals";
import { PaymentService } from "./payment-service";
import { createStripeClient } from "@/biz/utils/stripe/server";

describe("PaymentService", () => {
    const stripe = createStripeClient();
    let paymentService: PaymentService;
    beforeAll(async () => {
        const supabase = createServiceRoleClient();
        paymentService = new PaymentService(stripe, new UserRepository(supabase));
    });
    test("retriveCheckoutSession success", async () => {
        const sessionId = "cs_test_a1N6s54oxLPMAm9RKKOeVvH9L2QxuBFZ6bMkBGT0D8jZM7QGgkufSpxYXu";
        const result = await paymentService.retriveCheckoutSession(sessionId);
        console.log(result.data);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
    });
});