import { Toaster } from "@/components/ui/sonner";
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
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ASSET_LINKS, FONT_URLS } from "@/config/assets";
import { useAsyncFonts } from "@/hooks/use-async-fonts";

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
      ...ASSET_LINKS,
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
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
        <div className="min-h-screen bg-zzz-black text-zzz-white selection:bg-zzz-lime selection:text-black font-body overflow-x-hidden relative flex flex-col">
          {/* --- Background Effects --- */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
            <div className="w-full h-1 bg-white/5 absolute top-0 animate-[scan_8s_linear_infinite]"></div>
          </div>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 md:py-12 relative z-10">
            {children}
          </main>
          <Footer />
        </div>
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
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  );
}
