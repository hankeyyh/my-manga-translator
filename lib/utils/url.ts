export function getBaseUrl() {
    return process.env.MANGA_IMAGE_TRANSLATOR_BASE_URL || 'http://127.0.0.1:8000';
}