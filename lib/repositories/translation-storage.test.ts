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

describe("downloadFile", () => {
    const testFile = new File([], "test.jpg", { type: "image/jpeg" });
    test("should download file successfully", async () => {
        const storageRepo = new TranslationStorageRepository(supabase);
        const result = await storageRepo.uploadOriginalImage("user1", "task1", 1, testFile);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const downloadResult = await storageRepo.downloadFile(result.data!);
        console.log(downloadResult);
        expect(downloadResult.error).toBeNull();
        expect(downloadResult.data).toBeDefined();

        const delResult = await storageRepo.deleteFiles(["user1/task1/1-original.jpg"]);
        expect(delResult.error).toBeNull();
        expect(delResult.data).toBeNull();
    })
})