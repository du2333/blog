import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";

export function AdminBreadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches });

  const breadcrumbs = matches.flatMap(({ pathname, loaderData }) => {
    const title = loaderData?.title;
    return title ? [{ title, path: pathname }] : [];
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      <span className="hidden sm:inline">Admin</span>
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <span className="opacity-30">/</span>
          <Link
            to={crumb.path}
            className={`transition-colors hover:text-foreground ${
              index === breadcrumbs.length - 1
                ? "text-foreground font-bold tracking-widest"
                : ""
            }`}
          >
            {crumb.title}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
