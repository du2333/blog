import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { PostEditorData } from "@/components/admin/posts/post-editor/types";
import { PostEditor } from "@/components/admin/posts/post-editor";
import { ErrorPage } from "@/components/common/error-page";
import { PostEditorSkeleton } from "@/components/skeletons/post-editor-skeleton";
import { updatePostFn } from "@/features/posts/api/posts.admin.api";
import { postByIdQuery } from "@/features/posts/posts.query";

export const Route = createFileRoute("/admin/posts/edit/$id")({
	component: EditPost,
	pendingComponent: PostEditorSkeleton,
	loader: async ({ context, params }) => {
		const post = await context.queryClient.fetchQuery(
			postByIdQuery(Number(params.id)),
		);
		return post;
	},
	head: ({ loaderData: post }) => ({
		meta: [
			{
				title: post?.title,
			},
		],
	}),
});

function EditPost() {
	const { id } = Route.useParams();
	const postId = Number(id);
	const queryClient = useQueryClient();
	const { data: post, error } = useSuspenseQuery(postByIdQuery(postId));

	if (error) {
		return <ErrorPage error={error} />;
	}

	if (!post) {
		return (
			<div className="flex items-center justify-center h-[50vh]">
				<div className="text-center space-y-4">
					<h2 className="text-4xl font-serif font-medium">未找到文章</h2>
					<p className="text-zinc-400 font-light text-sm">
						ID 为
						{" "}
						{id}
						{" "}
						的文章记录不存在或已被移除。
					</p>
				</div>
			</div>
		);
	}

	const handleSave = async (data: PostEditorData) => {
		await updatePostFn({
			data: {
				id: post.id,
				data: {
					...data,
					publishedAt:
						data.status === "published" && !post.publishedAt
							? new Date()
							: data.publishedAt,
				},
			},
		});

		// Invalidate cache to ensure fresh data on next visit
		queryClient.invalidateQueries({ queryKey: ["post", postId] });
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		queryClient.invalidateQueries({
			predicate: q => q.queryKey[0] === "linkedMediaKeys",
		});
	};

	return <PostEditor initialData={post} onSave={handleSave} />;
}
