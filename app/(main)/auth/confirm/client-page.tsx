"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type ConfirmState = "verifying" | "success" | "error";

type ConfirmJson = {
    ok?: boolean;
    error?: string;
    next?: string;
};

const COUNTDOWN_SECONDS = 5;

/** 同一 token 共用一次请求，避免 Strict Mode 双挂载重复核销 */
const inflightConfirms = new Map<string, Promise<ConfirmJson & { httpOk: boolean; }>>();

function resolveNext(raw: string | null): string {
    if (!raw) return "/";
    try {
        if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
        const url = new URL(raw);
        if (typeof window !== "undefined" && url.origin === window.location.origin) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        // ignore
    }
    return "/";
}

function confirmEmail(tokenHash: string, type: string, next: string) {
    const existing = inflightConfirms.get(tokenHash);
    if (existing) return existing;

    const params = new URLSearchParams({
        token_hash: tokenHash,
        type,
        next,
    });

    const promise = fetch(`/api/auth/confirm?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
    })
        .then(async (res) => {
            const body = (await res.json()) as ConfirmJson;
            return { ...body, httpOk: res.ok };
        })
        .finally(() => {
            // 成功结果用 sessionStorage 记住；失败允许重试，故清除 inflight
            inflightConfirms.delete(tokenHash);
        });

    inflightConfirms.set(tokenHash, promise);
    return promise;
}

export function ClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [state, setState] = useState<ConfirmState>("verifying");
    const [error, setError] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
    const [nextPath, setNextPath] = useState("/");

    const goHome = useCallback(() => {
        router.replace(nextPath);
    }, [router, nextPath]);

    useEffect(() => {
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = resolveNext(searchParams.get("next"));
        setNextPath(next);

        if (!tokenHash || !type) {
            setState("error");
            setError("缺少确认参数，请重新打开邮件中的链接。");
            return;
        }

        const dedupeKey = `email-confirm:${tokenHash}`;
        try {
            if (sessionStorage.getItem(dedupeKey) === "done") {
                setState("success");
                return;
            }
        } catch {
            // ignore
        }

        let cancelled = false;

        void (async () => {
            try {
                const body = await confirmEmail(tokenHash, type, next);
                if (cancelled) return;

                if (!body.httpOk || !body.ok) {
                    setState("error");
                    setError(body.error ?? "验证失败，链接可能已失效。");
                    return;
                }

                try {
                    sessionStorage.setItem(dedupeKey, "done");
                } catch {
                    // ignore
                }
                if (body.next) {
                    setNextPath(resolveNext(body.next));
                }
                setState("success");
            } catch {
                if (cancelled) return;
                setState("error");
                setError("网络错误，请稍后重试。");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    useEffect(() => {
        if (state !== "success") return;

        setSecondsLeft(COUNTDOWN_SECONDS);
        const timer = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [state]);

    useEffect(() => {
        if (state === "success" && secondsLeft === 0) {
            goHome();
        }
    }, [state, secondsLeft, goHome]);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {state === "verifying" && "正在验证邮箱…"}
                            {state === "success" && "邮箱已确认"}
                            {state === "error" && "验证失败"}
                        </CardTitle>
                        <CardDescription>
                            {state === "verifying" && "请稍候，正在完成注册确认。"}
                            {state === "success" &&
                                `${secondsLeft} 秒后自动进入首页，也可立即开始翻译。`}
                            {state === "error" && "无法完成邮箱确认。"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {state === "error" && error && (
                            <p className="text-sm text-muted-foreground">{error}</p>
                        )}
                        {state === "success" && (
                            <Button type="button" onClick={goHome}>
                                开始翻译
                            </Button>
                        )}
                        {state === "error" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.replace("/auth/login")}
                            >
                                返回登录
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
