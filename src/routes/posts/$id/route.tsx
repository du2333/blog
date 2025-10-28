import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/posts/$id")({
  params: {
    parse: (params) => ({
      id: z.coerce.number().int().positive().parse(params.id),
    }),
  },
  component: Outlet,
});
