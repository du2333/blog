import { PostEditor, type PostEditorData } from "@/components/post-editor";
import { createPostFn } from "@/features/posts/api/posts.api";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/posts/new")({
  component: NewPost,
  ssr: false,
});

function NewPost() {
  const handleSave = async (data: PostEditorData) => {
    await createPostFn({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary || undefined,
        category: data.category,
        contentJson: data.contentJson,
        status: data.status,
        readTimeInMinutes: data.readTimeInMinutes,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });
  };

  return <PostEditor mode="new" onSave={handleSave} />;
}
