import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ErrorPage } from "./components/common/error-page";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { NotFound } from "@/components/common/not-found";

// Create a new router instance
export function getRouter() {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: "intent",
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext}>
          {props.children}
        </TanstackQuery.Provider>
      );
    },
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
}
