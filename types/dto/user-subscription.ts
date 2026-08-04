export interface ChangeSubscriptionData {
    status: "success" | "requires_action";
    // 需要 3DS / 额外确认时返回，供前端 confirmCardPayment
    clientSecret: string | null;
}
