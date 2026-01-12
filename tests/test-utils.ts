import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { vi } from "vitest";
import * as schema from "@/lib/db/schema";

export function createTestDb() {
  return drizzle(env.DB, { schema });
}

export function createMockAuth() {
  return {
    api: {
      getSession: vi.fn(async () => null),
    },
  } as unknown as Context["auth"];
}

export function createMockSession(
  overrides: {
    user?: Partial<AuthContext["session"]["user"]>;
    session?: Partial<AuthContext["session"]["session"]>;
  } = {},
): AuthContext["session"] {
  const defaultUser: AuthContext["session"]["user"] = {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    role: null,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultSession: AuthContext["session"]["session"] = {
    id: "test-session-id",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    token: "test-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "Vitest",
    userId: "test-user-id",
    impersonatedBy: null,
  };

  return {
    user: { ...defaultUser, ...overrides.user },
    session: { ...defaultSession, ...overrides.session },
  };
}

export function createMockAdminSession(): AuthContext["session"] {
  return createMockSession({
    user: {
      id: "admin-user-id",
      name: "Admin User",
      email: "admin@example.com",
      emailVerified: true,
      image: null,
      role: "admin",
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export function createMockExecutionCtx(): ExecutionContext {
  return createExecutionContext();
}

/**
 * 等待所有的 waitUntil 任务完成
 */
export async function waitForBackgroundTasks(ctx: ExecutionContext) {
  await waitOnExecutionContext(ctx);
}

export function createTestContext(overrides: Partial<Context> = {}): Context {
  const context = {
    db: createTestDb(),
    env: env,
    executionCtx: createMockExecutionCtx(),
    auth: createMockAuth(),
    ...overrides,
  };

  // Mock Workflow create methods
  const mockWorkflowInstance = { id: "mock-id" };

  vi.spyOn(context.env.COMMENT_MODERATION_WORKFLOW, "create").mockResolvedValue(
    mockWorkflowInstance as unknown as Awaited<
      ReturnType<Env["COMMENT_MODERATION_WORKFLOW"]["create"]>
    >,
  );

  vi.spyOn(context.env.POST_PROCESS_WORKFLOW, "create").mockResolvedValue(
    mockWorkflowInstance as unknown as Awaited<
      ReturnType<Env["POST_PROCESS_WORKFLOW"]["create"]>
    >,
  );

  vi.spyOn(context.env.SEND_EMAIL_WORKFLOW, "create").mockResolvedValue(
    mockWorkflowInstance as unknown as Awaited<
      ReturnType<Env["SEND_EMAIL_WORKFLOW"]["create"]>
    >,
  );

  return context;
}

export function createAuthTestContext(
  overrides: Partial<AuthContext> = {},
): AuthContext {
  return {
    ...createTestContext(),
    session: createMockSession(),
    ...overrides,
  };
}

export function createAdminTestContext(
  overrides: Partial<AuthContext> = {},
): AuthContext {
  return {
    ...createTestContext(),
    session: createMockAdminSession(),
    ...overrides,
  };
}

/**
 * 确保用户存在于数据库中（用于满足外键约束）
 */
export async function seedUser(
  db: ReturnType<typeof createTestDb>,
  userRecord: typeof schema.user.$inferInsert,
) {
  await db
    .insert(schema.user)
    .values(userRecord)
    .onConflictDoUpdate({
      target: schema.user.id,
      set: {
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
      },
    });
}
