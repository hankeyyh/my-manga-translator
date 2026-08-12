import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
    content: string;
    className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <article className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mb-6 text-3xl font-bold tracking-tight">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mb-2 mt-6 text-lg font-semibold">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-muted-foreground">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-4 list-disc space-y-2 pl-5 text-muted-foreground">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-4 list-decimal space-y-2 pl-5 text-muted-foreground">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-rose-500 underline-offset-4 hover:underline"
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),
                    hr: () => <hr className="my-8 border-border" />,
                    pre: ({ children }) => (
                        <pre className="mb-4 overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
                            {children}
                        </pre>
                    ),
                    code: ({ children, className }) => {
                        const isBlock = Boolean(className);
                        if (isBlock) {
                            return (
                                <code className={className}>{children}</code>
                            );
                        }
                        return (
                            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
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
                        <thead className="border-b">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-t px-3 py-2 text-muted-foreground">
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
