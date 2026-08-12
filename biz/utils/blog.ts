import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type BlogPostMeta = {
    slug: string;
    title: string;
    date: string;
    description: string;
    cover: string;
};

export type BlogPost = BlogPostMeta & {
    content: string;
};

function parseFrontmatter(raw: string) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) {
        return { data: {} as Record<string, string>, content: raw };
    }

    const data: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
        const index = line.indexOf(":");
        if (index === -1) continue;
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();
        if (key) data[key] = value;
    }

    return { data, content: match[2] };
}

export async function getBlogPosts(): Promise<BlogPostMeta[]> {
    const dir = path.join(process.cwd(), "content/blog");
    const files = await readdir(dir);
    const posts: BlogPostMeta[] = [];

    for (const file of files) {
        if (!file.endsWith(".md")) continue;

        const slug = file.replace(/\.md$/, "");
        const raw = await readFile(path.join(dir, file), "utf8");
        const { data } = parseFrontmatter(raw);

        posts.push({
            slug,
            title: data.title ?? slug,
            date: data.date ?? "",
            description: data.description ?? "",
            cover: data.cover ?? "",
        });
    }

    return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const filePath = path.join(process.cwd(), "content/blog", `${slug}.md`);

    try {
        const raw = await readFile(filePath, "utf8");
        const { data, content } = parseFrontmatter(raw);

        return {
            slug,
            title: data.title ?? slug,
            date: data.date ?? "",
            description: data.description ?? "",
            cover: data.cover ?? "",
            content,
        };
    } catch {
        return null;
    }
}
