import { authService } from "@/lib/services/auth/auth-service";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/";

    console.log("token_hash", token_hash);
    console.log("type", type);
    console.log("next", next);

    if (token_hash && type) {
        const { error } = await authService.verifyOtp(token_hash, type);
        if (!error) {
            // redirect user to specified redirect URL or root of app
            redirect(next);
        } else {
            console.error("verifyOtp error", error);
            // redirect the user to an error page with some instructions
            redirect(`/auth/error?error=${error?.message}`);
        }
    }

    // redirect the user to an error page with some instructions
    redirect(`/auth/error?error=No token hash or type`);
}
