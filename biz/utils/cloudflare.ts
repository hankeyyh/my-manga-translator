import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWorkflowBaseUrl } from "./url";


export async function startTranslationWorkflow(payload: {
    userId: string;
    taskId: string;
}): Promise<Response> {
    const body = JSON.stringify(payload);
    try {
        const { env } = await getCloudflareContext({ async: true });
        const workflowFetcher = (env as Cloudflare.Env).TRANSLATION_WORKFLOW;
        if (workflowFetcher) {
            return workflowFetcher.fetch(
                // url 只是占位符作用，实际请求通过binding指定
                new Request("https://translation-workflow.internal/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                }),
            );
        }
    } catch {
        // next dev 无 Cloudflare context，走 HTTP fallback
    }
    return fetch(`${getWorkflowBaseUrl()}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
}
