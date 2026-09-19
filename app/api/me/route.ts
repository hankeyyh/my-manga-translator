import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { SUCCESS_CODE } from "@/types/dto/response";
import { NextResponse } from "next/server";

export async function GET() {
    const result = await getCurrentUserInfo();
    if (result.code !== SUCCESS_CODE || !result.data) {
        return NextResponse.json({ data: null }, { status: 200 });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
}
