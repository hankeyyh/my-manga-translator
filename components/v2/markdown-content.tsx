import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
    content: string;
    className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <article className={className}>
            <ReactMarkdown
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
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
