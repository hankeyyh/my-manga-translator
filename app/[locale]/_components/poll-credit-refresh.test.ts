import { describe, expect, test } from "@jest/globals";
import { shouldRefreshCreditsAfterPoll } from "./poll-credit-refresh";

describe("shouldRefreshCreditsAfterPoll", () => {
    test("refreshes the first time an image becomes failed", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "processing" }],
            [{ imageId: "a", status: "failed" }],
            false,
        )).toBe(true);
    });

    test("does not refresh on a later tick when the same image stays failed", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "failed" }, { imageId: "b", status: "processing" }],
            [{ imageId: "a", status: "failed" }, { imageId: "b", status: "processing" }],
            false,
        )).toBe(false);
    });

    test("refreshes again when another image fails later", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "failed" }, { imageId: "b", status: "pending" }],
            [{ imageId: "a", status: "failed" }, { imageId: "b", status: "failed" }],
            true,
        )).toBe(true);
    });

    test("refreshes once when polling stops on success", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "processing" }],
            [{ imageId: "a", status: "completed" }],
            true,
        )).toBe(true);
    });

    test("does not refresh while other images are still in flight", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "processing" }, { imageId: "b", status: "pending" }],
            [{ imageId: "a", status: "completed" }, { imageId: "b", status: "processing" }],
            false,
        )).toBe(false);
    });

    test("does not refresh when polling stops on stall without a completion", () => {
        expect(shouldRefreshCreditsAfterPoll(
            [{ imageId: "a", status: "processing" }],
            [{ imageId: "a", status: "stalled" }],
            true,
        )).toBe(false);
    });
});
