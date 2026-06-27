export function getAlgoBaseUrl() {
    return process.env.MANGA_IMAGE_TRANSLATOR_BASE_URL || 'http://127.0.0.1:8000';
}

export function getWorkflowBaseUrl() {
    return process.env.TRANSLATION_WORKFLOW_BASE_URL || 'http://127.0.0.1:8787';
}

