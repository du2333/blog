// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from "@tanstack/react-start/server-entry";
import { initDb } from "@/db";
import { env } from "cloudflare:workers";
import { app as honoApp } from "@/hono/app";

console.log("[server-entry]: using custom server entry in 'src/server.ts'");

export default {
  async fetch(request: Request) {
    initDb(env.DB);

    const url = new URL(request.url);

    // 使用 Hono 处理图片路由
    if (url.pathname.startsWith("/images/")) {
      return honoApp.fetch(request, env);
    }

    // 其他请求交给 TanStack Start 处理（包括前端路由和 auth 保护的 API）
    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
