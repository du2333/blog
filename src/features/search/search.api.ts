import type { JSONContent } from "@tiptap/react";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { backfillSearchIndex } from "@/lib/search/backfill";
import {
	addOrUpdateSearchDoc,
	deleteSearchDoc,
	searchDocs,
} from "@/lib/search/ops";

export const buildSearchIndexFn = createServerFn().handler(
	async ({ context }) => {
		return await backfillSearchIndex(context.env, context.db);
	},
);

export const upsertSearchDocFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			slug: z.string().min(1),
			title: z.string().min(1),
			summary: z.string().nullable().optional(),
			contentJson: z.custom<JSONContent>().nullable().optional(),
		}),
	)
	.handler(async ({ data, context }) => {
		return await addOrUpdateSearchDoc(context.env, data);
	});

export const deleteSearchDocFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data, context }) => {
		return await deleteSearchDoc(context.env, data.id);
	});

export const searchDocsFn = createServerFn()
	.inputValidator(
		z.object({
			q: z.string().min(1),
			limit: z.number().optional(),
		}),
	)
	.handler(async ({ data, context }) => {
		return await searchDocs(context.env, data.q, data.limit);
	});
