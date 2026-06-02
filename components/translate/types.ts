export type PageThumbnailStatus = "active" | "processing" | "completed";

export type PageThumbnail = {
    id: string;
    status: PageThumbnailStatus;
    image: string;
};
