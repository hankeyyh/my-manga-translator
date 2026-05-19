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
import { SUCCESS_CODE } from "@/types/api";

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

        setIsLoading(true);
        setError(null);

        if (password !== repeatPassword) {
            setError("密码不匹配");
            setIsLoading(false);
            return;
        }

        try {
            // 调用服务端注册 API
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (data.code !== SUCCESS_CODE) {
                throw new Error(data.message || "注册失败");
            }

            // 注册成功，跳转到成功页面
            router.push("/auth/sign-up-success");
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
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="your@email.com"
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
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="至少8个字符"
                                required
                                minLength={8}
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
                                name="repeatPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="再次输入密码"
                                required
                                minLength={8}
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
