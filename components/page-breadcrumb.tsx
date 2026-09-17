import type { ComponentProps } from "react";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/components/utils";

type AppHref = ComponentProps<typeof Link>["href"];

export type PageBreadcrumbItem = {
    label: string;
    href?: AppHref;
};

type Props = {
    items: PageBreadcrumbItem[];
    className?: string;
};

export async function PageBreadcrumb({ items, className }: Props) {
    if (items.length === 0) return null;

    const t = await getTranslations("common");

    return (
        <Breadcrumb aria-label={t("breadcrumb")} className={cn("mb-8", className)}>
            <BreadcrumbList className="text-cc-text-muted">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            {index > 0 ? <BreadcrumbSeparator /> : null}
                            <BreadcrumbItem className="min-w-0">
                                {isLast || !item.href ? (
                                    <BreadcrumbPage className="truncate text-cc-text-secondary">
                                        {item.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="truncate hover:text-cc-brand-primary">
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

