import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { buildTaskRouteContext, loadRouteMethod } from "@/app/api/helper.test";
import { DB_ERROR_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import type { TranslationTaskDetailView } from "@/types/dto/translation-task";

const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const getTranslationTaskDetailMock = jest.fn<
    (taskId: string) => Promise<{
        code: number;
        data: TranslationTaskDetailView | null;
        error: Error | null;
    }>
>();

async function loadGet() {
    return loadRouteMethod<
        (
            request: NextRequest,
            context: { params: Promise<{ taskId: string; }>; }
        ) => Promise<Response>
    >("@/app/api/translate/task/[taskId]/route", "GET", [
        {
            moduleName: "@/lib/utils/supabase/server",
            factory: () => ({
                createServerClient: createClientMock,
            }),
        },
        {
            moduleName: "@/lib/repositories/user-repository",
            factory: () => ({
                UserRepository: jest.fn(),
            }),
        },
        {
            moduleName: "@/lib/repositories/translation-task",
            factory: () => ({
                TranslationTaskRepository: jest.fn(),
            }),
        },
        {
            moduleName: "@/lib/repositories/translation-image",
            factory: () => ({
                TranslationImageRepository: jest.fn(),
            }),
        },
        {
            moduleName: "@/lib/repositories/translation-storage",
            factory: () => ({
                TranslationStorageRepository: jest.fn(),
            }),
        },
        {
            moduleName: "@/lib/services/translate/translation-service",
            factory: () => ({
                TranslationService: jest.fn().mockImplementation(() => ({
                    getTranslationTaskDetail: getTranslationTaskDetailMock,
                })),
            }),
        },
    ]);
}

function buildRequest() {
    return new NextRequest("http://localhost/api/translate/task/task-1");
}

function buildTaskDetailView(overrides: Partial<TranslationTaskDetailView> = {}): TranslationTaskDetailView {
    return {
        id: "task-1",
        userId: "user-1",
        status: "completed",
        totalImages: 1,
        completedImages: 1,
        failedImages: 0,
        progress: 100,
        config: {},
        createdAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:10:00.000Z",
        updatedAt: "2026-01-01T00:10:00.000Z",
        images: [
            {
                id: "img-1",
                taskId: "task-1",
                imageIndex: 0,
                status: "completed",
                originalImagePath: "orig/path.png",
                originalImageUrl: "https://signed/orig.png",
                resultImagePath: "result/path.png",
                resultImageUrl: "https://signed/result.png",
                retryCount: 0,
                maxRetries: 3,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:10:00.000Z",
            },
        ],
        ...overrides,
    };
}

describe("translate task route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        createClientMock.mockResolvedValue({});
        getTranslationTaskDetailMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: buildTaskDetailView(),
            error: null,
        });
    });

    test("should return 401 when service returns unauthorized", async () => {
        const GET = await loadGet();
        getTranslationTaskDetailMock.mockResolvedValue({
            code: UNAUTHORIZED_ERROR_CODE,
            data: null,
            error: new Error("获取当前用户失败"),
        });

        const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "获取当前用户失败" });
    });

    test("should return 401 Forbidden when task is not owned by current user", async () => {
        const GET = await loadGet();
        getTranslationTaskDetailMock.mockResolvedValue({
            code: UNAUTHORIZED_ERROR_CODE,
            data: null,
            error: new Error("Task not belonged"),
        });

        const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "Forbidden" });
    });

    test("should return 500 when service returns db error", async () => {
        const GET = await loadGet();
        getTranslationTaskDetailMock.mockResolvedValue({
            code: DB_ERROR_CODE,
            data: null,
            error: new Error("query failed"),
        });

        const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "query failed" });
    });

    test("should return task detail when request succeeds", async () => {
        const GET = await loadGet();

        const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({
            id: "task-1",
            status: "completed",
            total_images: 1,
            completed_images: 1,
            failed_images: 0,
            progress: 100,
            created_at: "2026-01-01T00:00:00.000Z",
            completed_at: "2026-01-01T00:10:00.000Z",
            images: [
                {
                    id: "img-1",
                    status: "completed",
                    taskId: "task-1",
                    imageIndex: 0,
                    originalImageUrl: "https://signed/orig.png",
                    resultImageUrl: "https://signed/result.png",
                },
            ],
        });
        expect(getTranslationTaskDetailMock).toHaveBeenCalledWith("task-1");
    });
});
