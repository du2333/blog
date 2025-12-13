import { createServerFn, createMiddleware, json } from "@tanstack/react-start";

const authMiddleware = createMiddleware().server(
  async ({ next, context, request }) => {
    const session = await context.auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw json({ message: "UNAUTHENTICATED" }, { status: 401 });
    }

    return next({
      context: {
        session,
      },
    });
  }
);

const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const session = context.session;

    if (session.user?.role !== "admin") {
      throw json({ message: "PERMISSION_DENIED" }, { status: 403 });
    }

    return next({
      context: {
        session,
      },
    });
  });

export const createAuthedFn = createServerFn().middleware([authMiddleware]);
export const createAdminFn = createServerFn().middleware([adminMiddleware]);
