import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { loadRouteMethod } from "../../helper.test";
import {
    CHECK_PARAM_ERROR_CODE,
    CREDIT_BALANCE_NOT_ENOUGH,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import type { TranslationIntent } from "@/types/do/translation-intent";
import type { SubmitTaskData } from "@/types/dto/translation-task";

type CurrentUserResult = {
    data: { id: string; email?: string; } | null;
    error: Error | null;
};

const defaultIntent: TranslationIntent = {
    targetLang: "ENG",
    mode: "quality",
    fontName: "Anime Ace 3.0",
};

const getCurrentUserMock = jest.fn<() => Promise<CurrentUserResult>>();
const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const createServiceRoleClientMock = jest.fn<() => Record<string, unknown>>();
const freezeTaskCreditsMock = jest.fn<
    (userId: string, taskId: string, credits: number) => Promise<{
        code: number;
        data: null;
        error: Error | null;
    }>
>();
const batchRefundImageCreditsMock = jest.fn();
const submitTranslationTaskMock = jest.fn<
    (taskId: string, images: File[], intent: TranslationIntent) => Promise<{
        code: number;
        data: SubmitTaskData | null;
        error: Error | null;
    }>
>();
const markImagesFailedMock = jest.fn();
const startTranslationWorkflowMock = jest.fn<
    (input: { userId: string; taskId: string; }) => Promise<Response>
>();

async function loadPost() {
    return loadRouteMethod<(request: NextRequest) => Promise<Response>>(
        "@/app/api/translate/submit/route",
        "POST",
        [
            {
                moduleName: "@/biz/utils/supabase/server",
                factory: () => ({
                    createServerClient: createClientMock,
                }),
            },
            {
                moduleName: "@/biz/utils/supabase/admin",
                factory: () => ({
                    createServiceRoleClient: createServiceRoleClientMock,
                }),
            },
            {
                moduleName: "@/biz/services/auth/auth-service",
                factory: () => ({
                    AuthService: jest.fn().mockImplementation(() => ({
                        getCurrentUser: getCurrentUserMock,
                    })),
                }),
            },
            {
                moduleName: "@/biz/services/credit/credit-service",
                factory: () => ({
                    CreditService: jest.fn().mockImplementation(() => ({
                        freezeTaskCredits: freezeTaskCreditsMock,
                        batchRefundImageCredits: batchRefundImageCreditsMock,
                    })),
                }),
            },
            {
                moduleName: "@/biz/services/translate/translation-service",
                factory: () => ({
                    TranslationService: jest.fn().mockImplementation(() => ({
                        submitTranslationTask: submitTranslationTaskMock,
                        markImagesFailed: markImagesFailedMock,
                    })),
                }),
            },
            {
                moduleName: "@/biz/utils/cloudflare",
                factory: () => ({
                    startTranslationWorkflow: startTranslationWorkflowMock,
                }),
            },
        ]
    );
}

function buildRequest({
    images = [],
    intent = defaultIntent,
    omitIntent = false,
}: {
    images?: File[];
    intent?: TranslationIntent | Record<string, unknown>;
    omitIntent?: boolean;
} = {}) {
    const formData = new FormData();
    for (const image of images) {
        formData.append("images", image);
    }
    if (!omitIntent) {
        formData.append("intent", JSON.stringify(intent));
    }
    return new NextRequest("http://localhost/api/translate/submit", {
        method: "POST",
        body: formData,
    });
}

describe("translate submit route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getCurrentUserMock.mockResolvedValue({
            data: { id: "user-1", email: "user-1@example.com" },
            error: null,
        });
        createClientMock.mockResolvedValue({});
        createServiceRoleClientMock.mockReturnValue({});
        freezeTaskCreditsMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: null,
            error: null,
        });
        submitTranslationTaskMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: { taskId: "task-1", imageIds: ["img-1"] },
            error: null,
        });
        startTranslationWorkflowMock.mockResolvedValue(
            new Response(JSON.stringify({ success: true }), { status: 200 }),
        );
    });

    test("should return 401 when auth service returns error", async () => {
        const POST = await loadPost();
        getCurrentUserMock.mockResolvedValue({
            data: null,
            error: new Error("auth failed"),
        });

        const response = await POST(buildRequest());
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "Unauthorized" });
    });

    test("should return 401 when user is null", async () => {
        const POST = await loadPost();
        getCurrentUserMock.mockResolvedValue({
            data: null,
            error: null,
        });

        const response = await POST(buildRequest());
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "Unauthorized" });
    });

    test("should return 400 when no images provided", async () => {
        const POST = await loadPost();
        const response = await POST(buildRequest({ images: [] }));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "no images" });
    });

    test("should return 400 when intent is missing or invalid", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        const response = await POST(buildRequest({
            images: [image],
            intent: { translator: "chatgpt" },
        }));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "intent invalid" });
    });

    test("should return 400 when image is too large", async () => {
        const POST = await loadPost();
        const oversizedImage = new File(
            [new Uint8Array(10 * 1024 * 1024 + 1)],
            "too-large.jpg",
            { type: "image/jpeg" }
        );
        submitTranslationTaskMock.mockResolvedValue({
            code: CHECK_PARAM_ERROR_CODE,
            data: null,
            error: new Error("Image size too large, max size is 10MB"),
        });

        const response = await POST(buildRequest({ images: [oversizedImage] }));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Image size too large, max size is 10MB" });
    });

    test("should return 402 when credits are not enough", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        freezeTaskCreditsMock.mockResolvedValue({
            code: CREDIT_BALANCE_NOT_ENOUGH,
            data: null,
            error: new Error("not enough credit"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(402);
        expect(body).toEqual({ error: "Not Enough Credits" });
    });

    test("should return 500 when submit translation task fails", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        submitTranslationTaskMock.mockResolvedValue({
            code: DB_ERROR_CODE,
            data: null,
            error: new Error("create task failed"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "create task failed" });
    });

    test("should return 401 when submit translation task is unauthorized", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        submitTranslationTaskMock.mockResolvedValue({
            code: UNAUTHORIZED_ERROR_CODE,
            data: null,
            error: new Error("User Not Login"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "UnAuthorized" });
    });

    test("should return task id and image ids when submit succeeds", async () => {
        const POST = await loadPost();
        const image1 = new File(["img1"], "1.jpg", { type: "image/jpeg" });
        const image2 = new File(["img2"], "2.jpg", { type: "image/jpeg" });
        submitTranslationTaskMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: { taskId: "task-1", imageIds: ["img-1", "img-2"] },
            error: null,
        });

        const response = await POST(buildRequest({ images: [image1, image2] }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ taskId: "task-1", imageIds: ["img-1", "img-2"] });
        expect(submitTranslationTaskMock).toHaveBeenCalledWith(
            expect.any(String),
            [image1, image2],
            defaultIntent,
        );
        expect(startTranslationWorkflowMock).toHaveBeenCalledWith({
            userId: "user-1",
            taskId: "task-1",
        });
    });
});
