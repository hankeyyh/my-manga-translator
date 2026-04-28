import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { buildTaskRouteContext, loadRouteMethod } from "@/test/helpers/route-loader";

type CurrentUserResult = {
  data: { id: string; email?: string } | null;
  error: Error | null;
};

type TaskDetail = {
  id: string;
  userId: string;
  status: string;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  progress: number;
  createdAt: string;
  completedAt?: string;
};

type TaskResult = {
  data: TaskDetail | null;
  error: Error | null;
};

const getCurrentUserMock = jest.fn<() => Promise<CurrentUserResult>>();
const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const getTaskMock = jest.fn<(taskId: string) => Promise<TaskResult>>();

async function loadGet() {
  return loadRouteMethod<
    (
      request: NextRequest,
      context: { params: Promise<{ taskId: string }> }
    ) => Promise<Response>
  >("@/app/api/translate/task/[taskId]/route", "GET", [
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
          getTask: getTaskMock,
        })),
      }),
    },
  ]);
}

function buildRequest() {
  return new NextRequest("http://localhost/api/translate/task/task-1");
}

describe("translate task route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createClientMock.mockResolvedValue({});
    getCurrentUserMock.mockResolvedValue({
      data: { id: "user-1", email: "user-1@example.com" },
      error: null,
    });
    getTaskMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-1",
        status: "completed",
        totalImages: 5,
        completedImages: 5,
        failedImages: 0,
        progress: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:10:00.000Z",
      },
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

  test("should return 500 when fetching task fails", async () => {
    const GET = await loadGet();
    getTaskMock.mockResolvedValue({
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
    getTaskMock.mockResolvedValue({
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
    getTaskMock.mockResolvedValue({
      data: {
        id: "task-1",
        userId: "user-2",
        status: "completed",
        totalImages: 5,
        completedImages: 5,
        failedImages: 0,
        progress: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Forbidden" });
  });

  test("should return task detail when request succeeds", async () => {
    const GET = await loadGet();

    const response = await GET(buildRequest(), buildTaskRouteContext("task-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: "task-1",
      status: "completed",
      total_images: 5,
      completed_images: 5,
      failed_images: 0,
      progress: 100,
      created_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:10:00.000Z",
    });
    expect(getTaskMock).toHaveBeenCalledWith("task-1");
  });
});
