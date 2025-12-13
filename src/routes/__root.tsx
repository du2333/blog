import Toaster from "@/components/ui/toaster";
import {
  getSessionFn,
  isEmailVerficationRequiredFn,
} from "@/features/auth/auth.api";
import { useAsyncFonts } from "@/hooks/use-async-fonts";
import { FONT_URLS, PRELOAD_LINKS } from "@/lib/config/assets";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "MY BLOG",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      ...PRELOAD_LINKS,
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  beforeLoad: async () => {
    const session = await getSessionFn();
    const isEmailVerficationRequired = await isEmailVerficationRequiredFn();
    return {
      session,
      isEmailVerficationRequired,
    };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // 异步加载字体 - 不阻塞渲染
  useAsyncFonts(FONT_URLS);

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}
