export type TranslationStreamEvent =
    { type: "queue", position: number; } |
    { type: "ready"; } |
    { type: "progress", message: string; } |            // 其他 status=1 的过程日志
    { type: 'image_completed'; imageId: string; outputPath: string; } |
    { type: 'image_failed'; imageId: string; error: string; } |
    { type: 'batch_error'; error: string; } |            // status=2
    { type: 'batch_completed'; };                       // status=5;