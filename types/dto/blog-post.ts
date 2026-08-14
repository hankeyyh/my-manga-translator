/** 列表/卡片展示用 */
export interface BlogPostMetaView {
    slug: string;
    title: string;
    description: string;
    /** 可直接用于 <img src>；无封面时为空字符串 */
    coverUrl: string;
    publishedAt: string | null;
}

/** 详情页展示用 */
export interface BlogPostView extends BlogPostMetaView {
    content: string;
    author: string | null;
}
