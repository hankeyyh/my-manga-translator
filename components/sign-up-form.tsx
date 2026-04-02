"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Form from "next/form";

const linkClass =
  "font-medium text-[#0053dd] hover:text-[#0046b8] hover:underline underline-offset-2";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignUp(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const repeatPassword = formData.get("repeatPassword") as string;
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("密码不匹配");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="rounded-xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-900">
            注册
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            创建新账号并开始使用
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form action={handleSignUp} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="sign-up-email" className="text-gray-700">
                邮箱
              </Label>
              <Input
                id="sign-up-email"
                type="email"
                autoComplete="email"
                placeholder="邮箱"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-white text-base placeholder:text-gray-400 md:text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sign-up-password" className="text-gray-700">
                密码
              </Label>
              <Input
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                placeholder="密码"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-white text-base placeholder:text-gray-400 md:text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sign-up-repeat-password" className="text-gray-700">
                确认密码
              </Label>
              <Input
                id="sign-up-repeat-password"
                type="password"
                autoComplete="new-password"
                placeholder="再次输入密码"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-white text-base placeholder:text-gray-400 md:text-sm"
              />
            </div>

            {error && (
              <p className="text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#0053dd] text-base font-semibold text-white hover:bg-[#0046b8]"
              disabled={isLoading}
            >
              {isLoading ? "请稍候…" : "注册"}
            </Button>

            <div className="pt-1 text-center text-sm text-gray-600">
              已有账号？{" "}
              <Link href="/auth/login" className={linkClass}>
                去登录
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
