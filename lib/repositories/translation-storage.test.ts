import {describe, expect, test} from '@jest/globals';
import { createServiceRoleClient } from '../supabase/server';
import { TranslationStorageRepository } from './translation-storage';

const supabase = createServiceRoleClient();

describe("uploadOriginalImage", () => {
    const testFile = new File([], "test.jpg", { type: "image/jpeg" });
    test("should upload original image successfully", async () => {
        const storageRepo = new TranslationStorageRepository(supabase);
        const result = await storageRepo.uploadOriginalImage("user1", "task1", 1, testFile);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const delResult = await storageRepo.deleteFiles(["user1/task1/1-original.jpg"]);
        expect(delResult.error).toBeNull();
        expect(delResult.data).toBeNull();
    })
})

describe("uploadResultImage", () => {
    const testFile = new File([], "test.jpg", { type: "image/jpeg" });
    test("should upload result image successfully", async () => {
        const storageRepo = new TranslationStorageRepository(supabase);
        const result = await storageRepo.uploadResultImage("user1", "task1", 1, testFile);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const delResult = await storageRepo.deleteFiles(["user1/task1/1-result.png"]);
        expect(delResult.error).toBeNull();
        expect(delResult.data).toBeNull();
    })
})

describe("downloadFile", () => {
    const testFile = new File([], "test.jpg", { type: "image/jpeg" });
    test("should download file successfully", async () => {
        const storageRepo = new TranslationStorageRepository(supabase);
        const result = await storageRepo.uploadOriginalImage("user1", "task1", 1, testFile);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const downloadResult = await storageRepo.downloadFile(result.data!);
        expect(downloadResult.error).toBeNull();
        expect(downloadResult.data).toBeDefined();

        const delResult = await storageRepo.deleteFiles(["user1/task1/1-original.jpg"]);
        expect(delResult.error).toBeNull();
        expect(delResult.data).toBeNull();
    })
})

describe("createSignedUrls", () => {
    const testFile = new File([], "test.jpg", { type: "image/jpeg" });
    test("should create signed urls successfully", async () => {
        const storageRepo = new TranslationStorageRepository(supabase);
        const uploadResult = await storageRepo.uploadOriginalImage("user1", "task1", 1, testFile);
        expect(uploadResult.error).toBeNull();
        expect(uploadResult.data).toBeDefined();

        const result = await storageRepo.createSignedUrls(["user1/task1/1-original.jpg"], 3600);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const delResult = await storageRepo.deleteFiles(["user1/task1/1-original.jpg"]);
        expect(delResult.error).toBeNull();
        expect(delResult.data).toBeNull();
    })
})