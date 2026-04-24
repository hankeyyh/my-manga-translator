import { TranslationConfig } from "./translation-types";

export class TranslationService {
    private baseUrl: string;
    private modalStorage = "manga-results";

    constructor() {
        this.baseUrl = process.env.MANGA_IMAGE_TRANSLATOR_BASE_URL || 'http://127.0.0.1:8000';
    }

    /**
   * ===== 调用模型翻译服务 =====
   */
    async submitTranslation(imageBlob: Blob, config: TranslationConfig): Promise<{ folderName: string }> {
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('config', JSON.stringify({
            ...config,
            _web_frontend_optimized: true,
        }));

        const response = await fetch(
            `${this.baseUrl}/translate/with-form/image/stream/web`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        // 解析流式响应获取 folderName
        const folderName = await this.parseFolderNameFromStream(response);

        return { folderName };
    }

    /**
   * 从流式响应中解析 folderName
   * 注意: 这个实现需要根据实际的响应格式调整
   */
    private async parseFolderNameFromStream(response: Response): Promise<string> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let folderName = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 解析流式数据: [1 byte status][4 bytes size][n bytes data]
                const status = value[0];
                const size = new DataView(value.buffer).getUint32(1);
                const data = value.slice(5, 5 + size);

                if (status === 0) {
                    // 结果数据,可能包含 folderName
                    // 如果响应头包含 folderName,从这里提取
                    const text = new TextDecoder().decode(data);
                    const match = text.match(/folder[_-]?name["\s:]+([a-zA-Z0-9_-]+)/i);
                    if (match) {
                        folderName = match[1];
                    }
                } else if (status === 2) {
                    // 错误
                    throw new Error(new TextDecoder().decode(data));
                }
            }
        } finally {
            reader.releaseLock();
        }

        // 如果无法从流中解析,尝试从响应头获取
        if (!folderName) {
            folderName = response.headers.get('X-Result-Folder') ||
                response.headers.get('X-Folder-Name') ||
                `task_${Date.now()}`;
        }

        return folderName;
    }

    /**
   * 检查翻译结果是否就绪
   */
    async checkResultReady(folderName: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/result/${folderName}/final.png`,
                { method: 'HEAD' }
            );
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取翻译结果图片 URL
     */
    getResultUrl(folderName: string): string {
        return `${this.baseUrl}/result/${folderName}/final.png`;
    }

    /**
     * 下载翻译结果
     */
    async downloadResult(folderName: string): Promise<Blob> {  
        const response = await fetch(this.getResultUrl(folderName));

        if (!response.ok) {
            throw new Error(`Failed to download result: ${response.statusText}`);
        }

        return await response.blob();
    }
}