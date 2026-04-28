import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { buildTaskRouteContext, loadRouteMethod } from "@/test/helpers/route-loader";
import type { TranslationImage } from "@/lib/services/translate/translation-types";

type CurrentUserResult = {
  data: { id: string; email?: string } | null;
  error: Error | null;
};

type TaskDetail = {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed" | "partial";
  totalImages: number;
  completedImages: number;
  failedImages: number;
  progress: number;
  createdAt: string;
  completedAt?: string;
  images: TranslationImage[];
};

type TaskDetailResult = {
  data: TaskDetail | null;
  error: Error | null;
};

type SignedUrlResult = {
  data: string[] | null;
  error: Error | null;
};

const getCurrentUserMock = jest.fn<() => Promise<CurrentUserResult>>();
const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const getTaskWithImagesMock = jest.fn<(taskId: string) => Promise<TaskDetailResult>>();
const createSignedUrlsMock = jest.fn<
  (paths: string[], expiresIn: number) => Promise<SignedUrlResult>
>();

async function loadGet() {
  return loadRouteMethod<
    (
      request: NextRequest,
      context: { params: Promise<{ taskId: string }> }
    ) => Promise<Response>
  >("@/app/api/translate/result/[taskId]/route", "GET", [
    {
      moduleName: "@/lib/services/auth/auth-service",
      factory: () => ({
        authService: {
          getCurrentUser: getCurrentUserMock,
        },
      }),
    },
    {
      moduleName: "@/lib/supabase/server",
      factory: () => ({
        createClient: createClientMock,
      }),
    },
    {
      moduleName: "@/lib/repositories/translation-task",
      factory: () => ({
        TranslationTaskRepository: jest.fn().mockImplementation(() => ({
          getTaskWithImages: getTaskWithImagesMock,
        })),
      }),
    },
    {
      moduleName: "@/lib/repositories/translation-storage",
      factory: () => ({
        TranslationStorageRepository: jest.fn().mockImplementation(() => ({
          createSignedUrls: createSignedUrlsMock,
        })),
      }),
    },
  ]);
}

function buildRequest() {
  return new NextRequest("http://localhost/api/translate/result/task-1");
}

function completedImage(id: string, path: string): TranslationImage {
  return {
    id,
    taskId: "task-1",
    imageIndex: 0,
    status: "completed",
    originalImagePath: "origin.jpg",
    resultImagePath: path,
    retryCount: 0,
    maxRetries: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("translate result route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createClientMock.mockResolvedValue({});
    getCurrentUserMock.mockResolvedValue({
      data: { id: "user-1", email: "user-1@example.com" },
      error: null,
    });
    getTaskWithImagesMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-1",
        status: "completed",
        totalImages: 2,
        completedImages: 2,
        failedImages: 0,
        progress: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:10:00.000Z",
        images: [
          completedImage("img-1", "user-1/task-1/0-result.png"),
          completedImage("img-2", "user-1/task-1/1-result.png"),
        ],
      },
      error: null,
    });
    createSignedUrlsMock.mockResolvedValue({
      data: ["https://signed/0", "https://signed/1"],
      error: null,
    });
  });

  test("should return 401 when auth service returns error", async () => {
    const GET = await loadGet();
    getCurrentUserMock.mockResolvedValue({
      data: null,
      error: new Error("auth failed"),
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "auth failed" });
  });

  test("should return 401 when user is null", async () => {
    const GET = await loadGet();
    getCurrentUserMock.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  test("should return 500 when fetching task detail fails", async () => {
    const GET = await loadGet();
    getTaskWithImagesMock.mockResolvedValue({
      data: null,
      error: new Error("query failed"),
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "query failed" });
  });

  test("should return 404 when task does not exist", async () => {
    const GET = await loadGet();
    getTaskWithImagesMock.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Task not found" });
  });

  test("should return 401 when task is not owned by current user", async () => {
    const GET = await loadGet();
    getTaskWithImagesMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-2",
        status: "completed",
        totalImages: 2,
        completedImages: 2,
        failedImages: 0,
        progress: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
        images: [completedImage("img-1", "user-2/task-1/0-result.png")],
      },
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Forbidden" });
  });

  test("should return 400 when task status is not completed", async () => {
    const GET = await loadGet();
    getTaskWithImagesMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-1",
        status: "processing",
        totalImages: 2,
        completedImages: 1,
        failedImages: 0,
        progress: 50,
        createdAt: "2026-01-01T00:00:00.000Z",
        images: [completedImage("img-1", "user-1/task-1/0-result.png")],
      },
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Task not completed" });
  });

  test("should return 500 when create signed urls fails", async () => {
    const GET = await loadGet();
    createSignedUrlsMock.mockResolvedValue({
      data: null,
      error: new Error("sign failed"),
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "sign failed" });
  });

  test("should return 500 when signed urls are null", async () => {
    const GET = await loadGet();
    createSignedUrlsMock.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to create signed URLs" });
  });

  test("should return task result with filtered images when request succeeds", async () => {
    const GET = await loadGet();
    getTaskWithImagesMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-1",
        status: "completed",
        totalImages: 3,
        completedImages: 2,
        failedImages: 1,
        progress: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:10:00.000Z",
        images: [
          completedImage("img-1", "user-1/task-1/0-result.png"),
          {
            ...completedImage("img-2", "user-1/task-1/1-result.png"),
            status: "failed",
            resultImagePath: undefined,
          },
          completedImage("img-3", "user-1/task-1/2-result.png"),
        ],
      },
      error: null,
    });
    createSignedUrlsMock.mockResolvedValue({
      data: ["https://signed/0", "https://signed/2"],
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(createSignedUrlsMock).toHaveBeenCalledWith(
      ["user-1/task-1/0-result.png", "user-1/task-1/2-result.png"],
      3600
    );
    expect(body).toEqual({
      id: "task-1",
      status: "completed",
      total_images: 3,
      completed_images: 2,
      failed_images: 1,
      progress: 100,
      created_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:10:00.000Z",
      resultImages: [
        { id: "img-1", url: "https://signed/0" },
        { id: "img-3", url: "https://signed/2" },
      ],
    });
  });
});
