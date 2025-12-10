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
        ...data,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });
  };

  return <PostEditor mode="new" onSave={handleSave} />;
}
