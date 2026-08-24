import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/components/utils";

type MarkdownContentProps = {
    content: string;
    className?: string;
    variant?: "default" | "cc";
};

export function MarkdownContent({
    content,
    className,
    variant = "default",
}: MarkdownContentProps) {
    const isCc = variant === "cc";

    return (
        <article className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1
                            className={cn(
                                "mb-6 text-3xl font-bold tracking-tight",
                                isCc && "font-headline text-cc-text-primary",
                            )}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2
                            className={cn(
                                "mb-3 mt-8 text-xl font-semibold tracking-tight",
                                isCc && "font-headline text-cc-text-primary",
                            )}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3
                            className={cn(
                                "mb-2 mt-6 text-lg font-semibold",
                                isCc && "font-headline text-cc-text-primary",
                            )}
                        >
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p
                            className={cn(
                                "mb-4 leading-relaxed",
                                isCc ? "text-cc-text-secondary" : "text-muted-foreground",
                            )}
                        >
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul
                            className={cn(
                                "mb-4 list-disc space-y-2 ps-5",
                                isCc ? "text-cc-text-secondary" : "text-muted-foreground",
                            )}
                        >
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol
                            className={cn(
                                "mb-4 list-decimal space-y-2 ps-5",
                                isCc ? "text-cc-text-secondary" : "text-muted-foreground",
                            )}
                        >
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className={cn(
                                "underline-offset-4 hover:underline",
                                isCc
                                    ? "text-cc-brand-primary hover:text-cc-brand-primary-hover"
                                    : "text-rose-500",
                            )}
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => (
                        <strong
                            className={cn(
                                "font-semibold",
                                isCc ? "text-cc-text-primary" : "text-foreground",
                            )}
                        >
                            {children}
                        </strong>
                    ),
                    hr: () => (
                        <hr
                            className={cn(
                                "my-8",
                                isCc ? "border-cc-border/40" : "border-border",
                            )}
                        />
                    ),
                    pre: ({ children }) => (
                        <pre
                            className={cn(
                                "mb-4 overflow-x-auto rounded-lg border p-4 text-sm",
                                isCc
                                    ? "border-cc-border/40 bg-cc-surface-page text-cc-text-primary"
                                    : "border bg-muted",
                            )}
                        >
                            {children}
                        </pre>
                    ),
                    code: ({ children, className: codeClassName }) => {
                        const isBlock = Boolean(codeClassName);
                        if (isBlock) {
                            return (
                                <code className={codeClassName}>{children}</code>
                            );
                        }
                        return (
                            <code
                                className={cn(
                                    "rounded px-1.5 py-0.5 text-sm",
                                    isCc
                                        ? "bg-cc-surface-page text-cc-brand-primary"
                                        : "bg-muted",
                                )}
                            >
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }) => (
                        <div className="mb-4 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead
                            className={cn(isCc ? "border-b border-cc-border/40" : "border-b")}
                        >
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th
                            className={cn(
                                "px-3 py-2 text-start font-semibold",
                                isCc && "text-cc-text-primary",
                            )}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td
                            className={cn(
                                "border-t px-3 py-2",
                                isCc
                                    ? "border-cc-border/40 text-cc-text-secondary"
                                    : "text-muted-foreground",
                            )}
                        >
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
