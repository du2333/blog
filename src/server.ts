// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import { initDb } from "@/db";
import { initShikiHighlighter } from "@/lib/shiki";
import handler from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

console.log("[server-entry]: using custom server entry in 'src/server.ts'");

const shikiInitPromise = initShikiHighlighter().catch((error) => {
  console.error(
    "[server-entry]: Failed to initialize Shiki highlighter:",
    error
  );
});

export default {
  async fetch(request: Request) {
    initDb(env.DB);
    await shikiInitPromise;

    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
