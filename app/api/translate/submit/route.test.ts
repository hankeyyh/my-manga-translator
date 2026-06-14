import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import type { CreateImageParams } from "@/biz/repositories/translate/translation-image";
import { loadRouteMethod } from "../../helper.test";

type CurrentUserResult = {
    data: { id: string; email?: string; } | null;
    error: Error | null;
};
type TaskResult = { data: { id: string; } | null; error: Error | null; };
type UploadResult = { data: string | null; error: Error | null; };
type CreateImagesResult = { data: { id: string; }[] | null; error: Error | null; };

const getCurrentUserFromRepoMock = jest.fn<() => Promise<CurrentUserResult>>();
const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const createTaskMock = jest.fn<
    (params: {
        userId: string;
        totalImages: number;
        config: Record<string, unknown>;
    }) => Promise<TaskResult>
>();
const uploadOriginalImageMock = jest.fn<
    (
        userId: string,
        taskId: string,
        imageIdx: number,
        image: File
    ) => Promise<UploadResult>
>();
const createImagesMock = jest.fn<
    (params: CreateImageParams[]) => Promise<CreateImagesResult>
>();

async function loadPost() {
    return loadRouteMethod<(request: NextRequest) => Promise<Response>>(
        "@/app/api/translate/submit/route",
        "POST",
        [
            {
                moduleName: "@/lib/utils/supabase/server",
                factory: () => ({
                    createServerClient: createClientMock,
                }),
            },
            {
                moduleName: "@/lib/repositories/auth/user-repository",
                factory: () => ({
                    UserRepository: jest.fn().mockImplementation(() => ({
                        getCurrentUser: getCurrentUserFromRepoMock,
                    })),
                }),
            },
            {
                moduleName: "@/lib/repositories/translation-task",
                factory: () => ({
                    TranslationTaskRepository: jest.fn().mockImplementation(() => ({
                        createTask: createTaskMock,
                    })),
                }),
            },
            {
                moduleName: "@/lib/repositories/translation-storage",
                factory: () => ({
                    TranslationStorageRepository: jest.fn().mockImplementation(() => ({
                        uploadOriginalImage: uploadOriginalImageMock,
                    })),
                }),
            },
            {
                moduleName: "@/lib/repositories/translation-image",
                factory: () => ({
                    TranslationImageRepository: jest.fn().mockImplementation(() => ({
                        createImages: createImagesMock,
                    })),
                }),
            },
        ]
    );
}

function buildRequest({
    images = [],
    config = { translator: "chatgpt" },
}: {
    images?: File[];
    config?: Record<string, unknown>;
} = {}) {
    const formData = new FormData();
    for (const image of images) {
        formData.append("images", image);
    }
    formData.append("config", JSON.stringify(config));
    return new NextRequest("http://localhost/api/translate/submit", {
        method: "POST",
        body: formData,
    });
}

describe("translate submit route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getCurrentUserFromRepoMock.mockResolvedValue({
            data: { id: "user-1", email: "user-1@example.com" },
            error: null,
        });
        createClientMock.mockResolvedValue({});
        createTaskMock.mockResolvedValue({
            data: { id: "task-1" },
            error: null,
        });
        uploadOriginalImageMock.mockResolvedValue({
            data: "user-1/task-1/0-original.jpg",
            error: null,
        });
        createImagesMock.mockResolvedValue({
            data: [{ id: "img-1" }],
            error: null,
        });
    });

    test("should return 401 when auth service returns error", async () => {
        const POST = await loadPost();
        getCurrentUserFromRepoMock.mockResolvedValue({
            data: null,
            error: new Error("auth failed"),
        });

        const response = await POST(buildRequest());
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "auth failed" });
    });

    test("should return 401 when user is null", async () => {
        const POST = await loadPost();
        getCurrentUserFromRepoMock.mockResolvedValue({
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
        expect(body).toEqual({ error: "No images provided" });
    });

    test("should return 400 when any image is too large", async () => {
        const POST = await loadPost();
        const oversizedImage = new File(
            [new Uint8Array(10 * 1024 * 1024 + 1)],
            "too-large.jpg",
            { type: "image/jpeg" }
        );

        const response = await POST(buildRequest({ images: [oversizedImage] }));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Image size too large, max size is 10MB" });
    });

    test("should return 500 when creating task fails", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        createTaskMock.mockResolvedValue({
            data: null,
            error: new Error("create task failed"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "create task failed" });
    });

    test("should return 500 when uploading original image fails", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        uploadOriginalImageMock.mockResolvedValue({
            data: null,
            error: new Error("upload failed"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "upload failed" });
    });

    test("should return 500 when creating image records fails", async () => {
        const POST = await loadPost();
        const image = new File(["image"], "a.jpg", { type: "image/jpeg" });
        createImagesMock.mockResolvedValue({
            data: null,
            error: new Error("create images failed"),
        });

        const response = await POST(buildRequest({ images: [image] }));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "create images failed" });
    });

    test("should return task id when submit succeeds", async () => {
        const POST = await loadPost();
        const image1 = new File(["img1"], "1.jpg", { type: "image/jpeg" });
        const image2 = new File(["img2"], "2.jpg", { type: "image/jpeg" });
        uploadOriginalImageMock
            .mockResolvedValueOnce({
                data: "user-1/task-1/0-original.jpg",
                error: null,
            })
            .mockResolvedValueOnce({
                data: "user-1/task-1/1-original.jpg",
                error: null,
            });

        const response = await POST(buildRequest({ images: [image1, image2] }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ taskId: "task-1" });
        expect(createTaskMock).toHaveBeenCalledWith({
            userId: "user-1",
            totalImages: 2,
            config: { translator: "chatgpt" },
        });
        expect(uploadOriginalImageMock).toHaveBeenNthCalledWith(
            1,
            "user-1",
            "task-1",
            0,
            image1
        );
        expect(uploadOriginalImageMock).toHaveBeenNthCalledWith(
            2,
            "user-1",
            "task-1",
            1,
            image2
        );
        expect(createImagesMock).toHaveBeenCalledWith([
            {
                taskId: "task-1",
                imageIndex: 0,
                originalImagePath: "user-1/task-1/0-original.jpg",
                originalImageSize: image1.size,
            },
            {
                taskId: "task-1",
                imageIndex: 1,
                originalImagePath: "user-1/task-1/1-original.jpg",
                originalImageSize: image2.size,
            },
        ]);
    });
});