"use client";

import { cn } from "@/components/utils";
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
import { API_SUCCESS_CODE } from "@/types/api/response";
import { SignInOAuthResponse, SignInResponse } from "@/types/api/auth";

const linkClass =
    "font-medium text-[#0053dd] hover:text-[#0046b8] hover:underline underline-offset-2";

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(formData: FormData) {
        const email = formData.get("login-email") as string;
        const password = formData.get("login-password") as string;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = (await response.json()) as SignInResponse;
            if (data.code !== API_SUCCESS_CODE) {
                throw new Error(data.message || "登录失败");
            }
            router.push("/");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "发生错误，请重试");
        } finally {
            setIsLoading(false);
        }
    };

    async function handleLoginWithGoogle() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/signin-oauth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ provider: "google" }),
            });
            const data = (await response.json()) as SignInOAuthResponse;
            if (data.code !== API_SUCCESS_CODE) {
                throw new Error(data.message || "登录失败");
            }
            window.location.href = data.data?.url!;
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "发生错误，请重试");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("w-full", className)} {...props}>
            <Card className="rounded-xl border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-6">
                    <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-900">
                        登录
                    </CardTitle>
                    <CardDescription className="text-center text-sm text-gray-500">
                        使用邮箱和密码登录你的账号
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form action={handleLogin} className="flex flex-col gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="login-email" className="text-gray-700">
                                邮箱
                            </Label>
                            <Input
                                id="login-email"
                                name="login-email"
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
                            <div className="flex items-center gap-3">
                                <Label htmlFor="login-password" className="text-gray-700">
                                    密码
                                </Label>
                                <Link href="/auth/forgot-password" className={cn("ml-auto text-sm", linkClass)}>
                                    忘记密码？
                                </Link>
                            </div>
                            <Input
                                id="login-password"
                                name="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="密码"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            {isLoading ? "请稍候…" : "登录"}
                        </Button>

                        <div className="pt-1 text-center text-sm text-gray-600">
                            还没有账号？{" "}
                            <Link href="/auth/sign-up" className={linkClass}>
                                去注册
                            </Link>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs text-gray-500">或使用</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4 h-11 w-full gap-3 rounded-lg border-gray-200 bg-white text-base font-semibold text-gray-900 hover:bg-gray-50"
                                aria-label="使用 Google 登录"
                                disabled={isLoading}
                                onClick={handleLoginWithGoogle}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                    focusable="false"
                                    className="shrink-0"
                                >
                                    <path
                                        fill="#FFC107"
                                        d="M43.611 20.083H42V20H24v8h11.303C33.653 32.657 29.239 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                                    />
                                    <path
                                        fill="#FF3D00"
                                        d="M6.306 14.691l6.571 4.819C14.656 16.108 19.007 12 24 12c3.059 0 5.842 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.354 4.326-17.694 10.691z"
                                    />
                                    <path
                                        fill="#4CAF50"
                                        d="M24 44c5.166 0 9.86-1.977 13.404-5.197l-6.19-5.238C29.162 35.091 26.715 36 24 36c-5.217 0-9.623-3.318-11.284-7.946l-6.52 5.02C9.505 39.556 16.227 44 24 44z"
                                    />
                                    <path
                                        fill="#1976D2"
                                        d="M43.611 20.083H42V20H24v8h11.303c-.79 2.217-2.177 4.063-3.989 5.565l.003-.002 6.19 5.238C36.969 39.29 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                                    />
                                </svg>
                                使用 Google 登录
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
