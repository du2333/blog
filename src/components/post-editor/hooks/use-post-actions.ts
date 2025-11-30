import { generateSlugFn } from "@/functions/posts";
import { slugify } from "@/lib/editor-utils";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PostEditorData } from "../types";

interface UsePostActionsOptions {
  mode: "new" | "edit";
  postId?: number;
  post: PostEditorData;
  setPost: React.Dispatch<React.SetStateAction<PostEditorData>>;
  setError: (error: string | null) => void;
}

export function usePostActions({
  mode,
  postId,
  post,
  setPost,
  setError,
}: UsePostActionsOptions) {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [isCalculatingReadTime, setIsCalculatingReadTime] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Slug generation mutation
  const slugMutation = useMutation({
    mutationFn: (title: string) =>
      generateSlugFn({
        data: {
          title,
          excludeId: mode === "edit" ? postId : undefined,
        },
      }),
    onSuccess: (result) => {
      setPost((prev) => ({ ...prev, slug: result.slug }));
      toast.success("SLUG GENERATED", {
        description: `URL slug set to "${result.slug}"`,
      });
    },
    onError: (error) => {
      console.error("Slug generation failed:", error);
      setError("SLUG_GENERATION_FAILED");
      const fallbackSlug = slugify(post.title) || "untitled-log";
      setPost((prev) => ({ ...prev, slug: fallbackSlug }));
    },
  });

  // Sync loading state
  useEffect(() => {
    setIsGeneratingSlug(slugMutation.isPending);
  }, [slugMutation.isPending]);

  const handleGenerateSlug = () => {
    if (!post.title.trim()) {
      setError("TITLE_REQUIRED_FOR_SLUG");
      return;
    }
    slugMutation.mutate(post.title);
  };

  const handleCalculateReadTime = () => {
    if (!post.contentJson) {
      toast.error("NO CONTENT", {
        description: "Write some content first to calculate read time.",
      });
      return;
    }
    setIsCalculatingReadTime(true);

    setTimeout(() => {
      const extractText = (node: JSONContent): string => {
        let text = "";
        if (node.text) text += node.text;
        if (node.content) {
          for (const child of node.content) {
            text += extractText(child) + " ";
          }
        }
        return text;
      };

      const text = extractText(post.contentJson!);

      // Count CJK characters (Chinese, Japanese, Korean)
      const cjkChars = (
        text.match(
          /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g
        ) || []
      ).length;

      // Count English words (remove CJK chars first, then split by whitespace)
      const textWithoutCjk = text.replace(
        /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g,
        " "
      );
      const englishWords = textWithoutCjk.split(/\s+/).filter(Boolean).length;

      // Reading speed: ~400 CJK chars/min, ~200 English words/min
      const cjkMinutes = cjkChars / 400;
      const englishMinutes = englishWords / 200;
      const mins = Math.max(1, Math.ceil(cjkMinutes + englishMinutes));

      setPost((prev) => ({ ...prev, readTimeInMinutes: mins }));
      setIsCalculatingReadTime(false);
      toast.success("READ TIME CALCULATED", {
        description: `Estimated ${mins} min read (${
          cjkChars + englishWords
        } words)`,
      });
    }, 400);
  };

  const handleGenerateSummary = () => {
    if (!post.contentJson) {
      toast.error("NO CONTENT", {
        description: "Write some content first to generate a summary.",
      });
      return;
    }
    setIsGeneratingSummary(true);
    // TODO: Replace with actual AI summary generation
    setTimeout(() => {
      const mockSummary =
        "AI_ANALYSIS_COMPLETE: Content analysis pending implementation. Summary will be auto-generated from post content.";
      setPost((prev) => ({ ...prev, summary: mockSummary }));
      setIsGeneratingSummary(false);
      toast.info("SUMMARY GENERATED", {
        description: "AI summary generation is pending implementation.",
      });
    }, 1500);
  };

  return {
    isGeneratingSlug,
    isCalculatingReadTime,
    isGeneratingSummary,
    handleGenerateSlug,
    handleCalculateReadTime,
    handleGenerateSummary,
  };
}
