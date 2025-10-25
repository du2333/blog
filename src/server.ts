// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from "@tanstack/react-start/server-entry";
import { initDb } from "@/db";
import { env } from "cloudflare:workers";

console.log("[server-entry]: using custom server entry in 'src/server.ts'");

export default {
  fetch(request: Request) {
    initDb(env.DB);

    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
