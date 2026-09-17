import { NextResponse } from "next/server";
import { buildLlmsTxt } from "@/biz/seo/llms-txt";

export const revalidate = 3600;

export function GET() {
    return new NextResponse(buildLlmsTxt(), {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
