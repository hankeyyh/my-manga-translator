"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Form from 'next/form'

const linkClass =
  "font-medium text-[#0053dd] hover:text-[#0046b8] hover:underline underline-offset-2";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginRegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleEmailContinue(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!agreedToTerms) {
      setError("请先阅读并同意服务条款、隐私政策与退款政策");
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogle() {
    if (!agreedToTerms) {
      setError("请先阅读并同意服务条款、隐私政策与退款政策");
      return;
    }
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google 登录失败");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-gray-900">
          登录或注册
        </h1>

        <Form action={handleEmailContinue} className="flex flex-col gap-5">
          <Input
            id="login-register-email"
            type="email"
            autoComplete="email"
            placeholder="邮箱"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-gray-200 bg-white text-base placeholder:text-gray-400 md:text-sm"
          />

          <div className="relative">
            <Input
              id="login-register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="密码"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-white pr-10 text-base placeholder:text-gray-400 md:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-600">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(v === true)}
                className="rounded border-gray-300 data-[state=checked]:border-[#0053dd] data-[state=checked]:bg-[#0053dd]"
              />
              记住我
            </label>
            <Link href="/auth/forgot-password" className={linkClass}>
              忘记密码？
            </Link>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <label className="flex cursor-pointer gap-3 text-sm leading-snug text-gray-600">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(v) => setAgreedToTerms(v === true)}
                className="mt-0.5 shrink-0 rounded border-gray-300 data-[state=checked]:border-[#0053dd] data-[state=checked]:bg-[#0053dd]"
              />
              <span>
                我已阅读并同意
                <Link href="#" className={linkClass}>
                  《服务条款》
                </Link>
                、
                <Link href="#" className={linkClass}>
                  《隐私政策》
                </Link>
                和
                <Link href="#" className={linkClass}>
                  《退款政策》
                </Link>
                。
              </span>
            </label>
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-[#0053dd] text-base font-semibold text-white hover:bg-[#0046b8]"
          >
            {isLoading ? "请稍候…" : "使用邮箱继续"}
          </Button>
        </Form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-500">或使用以下方式继续</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isGoogleLoading}
          onClick={() => void handleGoogle()}
          className="h-11 w-full rounded-lg border-gray-200 bg-white text-base font-medium text-gray-900 hover:bg-gray-50"
        >
          <GoogleIcon className="h-5 w-5" />
          使用 Google 继续
        </Button>
      </div>
    </div>
  );
}
