export const HOW_STEPS = [
    {
        key: "upload",
        step: "01",
        videoSrc: "/how-to-use/01-upload.min.mp4",
        coverSrc: "/how-to-use/01-upload-cover-750.webp",
        coverSrcSet:
            "/how-to-use/01-upload-cover-750.webp 750w, /how-to-use/01-upload-cover-1280.webp 1280w",
    },
    {
        key: "language",
        step: "02",
        videoSrc: "/how-to-use/02-language.min.mp4",
        coverSrc: "/how-to-use/02-language-cover-750.webp",
        coverSrcSet:
            "/how-to-use/02-language-cover-750.webp 750w, /how-to-use/02-language-cover-1280.webp 1280w",
    },
    {
        key: "download",
        step: "03",
        videoSrc: "/how-to-use/03-result.min.mp4",
        coverSrc: "/how-to-use/03-result-cover-750.webp",
        coverSrcSet:
            "/how-to-use/03-result-cover-750.webp 750w, /how-to-use/03-result-cover-1280.webp 1280w",
    },
] as const;

/** How 区块封面：移动端满宽减 padding，md+ 为容器的 58%。 */
export const HOW_COVER_SIZES = "(min-width: 768px) 58vw, calc(100vw - 2rem)";
