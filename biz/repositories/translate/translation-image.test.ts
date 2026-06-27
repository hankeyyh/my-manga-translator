import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TranslationImageRepository } from "./translation-image";
import { TranslationTaskRepository } from "./translation-task";

const supabase = createServiceRoleClient();

describe("markImagesFailed", () => {
    const repo = new TranslationImageRepository(supabase);
    const taskRepo = new TranslationTaskRepository(supabase);

    let userId: string;
    let taskId = randomUUID();
    let processingImageId = randomUUID();
    let pendingImageId = randomUUID();
    console.debug("taskId:", taskId, "processingImageId:", processingImageId, "pendingImageId:", pendingImageId);
    const errMessage = "markImagesFailed test error";

    beforeAll(async () => {
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: `test-mark-images-failed-${Date.now()}@example.com`,
            password: "test-password-123",
            email_confirm: true,
        });
        expect(userError).toBeNull();
        if (!userData?.user) {
            throw new Error("failed to create test user");
        }
        userId = userData.user.id;

        const taskResult = await taskRepo.createTask({
            id: taskId,
            userId,
            totalImages: 2,
            creditPerImage: 1,
            config: { translator: { translator: "chatgpt" } },
        });
        expect(taskResult.error).toBeNull();

        const createResult = await repo.createImages([
            {
                id: processingImageId,
                taskId,
                filename: "test-1.jpg",
                imageIndex: 1,
                originalImagePath: "test/path/1-original.jpg",
                credits: 1,
            },
            {
                id: pendingImageId,
                taskId,
                filename: "test-2.jpg",
                imageIndex: 2,
                originalImagePath: "test/path/2-original.jpg",
                credits: 1,
            },
        ]);
        expect(createResult.error).toBeNull();
        expect(createResult.data!.map((image) => image.id)).toEqual([
            processingImageId,
            pendingImageId,
        ]);

        const updateResult = await repo.updateImage(processingImageId, {
            status: "processing",
            startedAt: new Date().toISOString(),
        });
        expect(updateResult.error).toBeNull();
    });

    afterAll(async () => {
        if (taskId) {
            await taskRepo.deleteTask(taskId);
        }
        if (userId) {
            await supabase.auth.admin.deleteUser(userId);
        }
    });

    test("success", async () => {
        const result = await repo.markImagesFailed(
            [processingImageId, pendingImageId],
            errMessage,
        );
        expect(result.error).toBeNull();
        expect(result.data).toEqual([processingImageId]);

        const processingImage = await repo.getImage(processingImageId);
        expect(processingImage.error).toBeNull();
        expect(processingImage.data!.status).toBe("failed");
        expect(processingImage.data!.errorMessage).toBe(errMessage);

        const pendingImage = await repo.getImage(pendingImageId);
        expect(pendingImage.error).toBeNull();
        expect(pendingImage.data!.status).toBe("pending");
        expect(pendingImage.data!.errorMessage).toBeUndefined();
    });
});

describe("markImageSuccess", () => {
    const repo = new TranslationImageRepository(supabase);
    const taskRepo = new TranslationTaskRepository(supabase);

    let userId: string;
    let taskId = randomUUID();
    let processingImageId = randomUUID();
    let pendingImageId = randomUUID();
    const outputPath = "test/path/1-result.jpg";

    beforeAll(async () => {
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: `test-mark-image-success-${Date.now()}@example.com`,
            password: "test-password-123",
            email_confirm: true,
        });
        expect(userError).toBeNull();
        if (!userData?.user) {
            throw new Error("failed to create test user");
        }
        userId = userData.user.id;

        const taskResult = await taskRepo.createTask({
            id: taskId,
            userId,
            totalImages: 2,
            creditPerImage: 1,
            config: { translator: { translator: "chatgpt" } },
        });
        expect(taskResult.error).toBeNull();

        const createResult = await repo.createImages([
            {
                id: processingImageId,
                taskId,
                filename: "test-1.jpg",
                imageIndex: 1,
                originalImagePath: "test/path/1-original.jpg",
                credits: 1,
            },
            {
                id: pendingImageId,
                taskId,
                filename: "test-2.jpg",
                imageIndex: 2,
                originalImagePath: "test/path/2-original.jpg",
                credits: 1,
            },
        ]);
        expect(createResult.error).toBeNull();
        expect(createResult.data!.map((image) => image.id)).toEqual([
            processingImageId,
            pendingImageId,
        ]);

        const updateResult = await repo.updateImage(processingImageId, {
            status: "processing",
            startedAt: new Date().toISOString(),
        });
        expect(updateResult.error).toBeNull();
    });

    afterAll(async () => {
        if (taskId) {
            await taskRepo.deleteTask(taskId);
        }
        if (userId) {
            await supabase.auth.admin.deleteUser(userId);
        }
    });

    test("success", async () => {
        const result = await repo.markImageSuccess(processingImageId, outputPath);
        expect(result.error).toBeNull();
        expect(result.data).toBe(processingImageId);

        const processingImage = await repo.getImage(processingImageId);
        expect(processingImage.error).toBeNull();
        expect(processingImage.data!.status).toBe("completed");
        expect(processingImage.data!.resultImagePath).toBe(outputPath);
        expect(processingImage.data!.completedAt).toBeDefined();

        const pendingImage = await repo.getImage(pendingImageId);
        expect(pendingImage.error).toBeNull();
        expect(pendingImage.data!.status).toBe("pending");
        expect(pendingImage.data!.resultImagePath).toBeUndefined();
        expect(pendingImage.data!.completedAt).toBeUndefined();
    });

    test("skips non-processing image", async () => {
        const result = await repo.markImageSuccess(pendingImageId, outputPath);
        expect(result.error).toBeNull();
        expect(result.data).toBeNull();

        const pendingImage = await repo.getImage(pendingImageId);
        expect(pendingImage.error).toBeNull();
        expect(pendingImage.data!.status).toBe("pending");
        expect(pendingImage.data!.resultImagePath).toBeUndefined();
    });
});
