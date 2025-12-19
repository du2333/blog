import type { PostEditorData } from "@/components/admin/posts/post-editor/types";
import {
  generateSlugFn,
  previewSummaryFn,
  startPostProcessWorkflowFn,
} from "@/features/posts/api/posts.admin.api";
import { useDebounce } from "@/hooks/use-debounce";
import { slugify } from "@/lib/editor/utils";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UsePostActionsOptions {
  postId: number;
  post: PostEditorData;
  setPost: React.Dispatch<React.SetStateAction<PostEditorData>>;
  setError: (error: string | null) => void;
}

export function usePostActions({
  postId,
  post,
  setPost,
  setError,
}: UsePostActionsOptions) {
  const [isCalculatingReadTime, setIsCalculatingReadTime] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [processState, setProcessState] = useState<
    "IDLE" | "PROCESSING" | "SUCCESS"
  >("IDLE");
  // Keep track of how slug was requested to control noisy toasts
  const slugGenerationMode = useRef<"manual" | "auto">("manual");
  // Track previous values to detect actual changes & skip first mount
  const prevTitleRef = useRef(post.title);
  const prevContentRef = useRef(post.contentJson);
  const isFirstTitleMount = useRef(true);
  const isFirstContentMount = useRef(true);

  // Debounced values
  const debouncedTitle = useDebounce(post.title, 500);
  const debouncedContentJson = useDebounce(post.contentJson, 800);

  const handleProcessData = () => {
    if (processState !== "IDLE") return;

    setProcessState("PROCESSING");

    setTimeout(() => {
      processDataMutation.mutate({
        data: { id: postId, status: post.status },
      });

      // Feedback: Notify user task is running
      toast("WORKFLOW STARTED", {
        description: "Deep analysis running in background thread.",
        icon: <Radio className="animate-pulse text-zzz-lime" />,
        className: "bg-zzz-black/95 border-zzz-lime text-white",
      });

      setProcessState("SUCCESS");

      // Reset after cooldown
      setTimeout(() => {
        setProcessState("IDLE");
      }, 3000);
    }, 800);
  };

  // Slug generation mutation
  const slugMutation = useMutation({
    mutationFn: (title: string) =>
      generateSlugFn({
        data: {
          title,
          excludeId: postId,
        },
      }),
    onSuccess: (result) => {
      setPost((prev) => ({ ...prev, slug: result.slug }));
      if (slugGenerationMode.current === "manual") {
        toast.success("URL slug 已设置", {
          description: `URL slug 已设置为 "${result.slug}"`,
        });
      }
    },
    onError: (error) => {
      console.error("Slug generation failed:", error);
      setError("SLUG_GENERATION_FAILED");
      const fallbackSlug = slugify(post.title) || "untitled-log";
      setPost((prev) => ({ ...prev, slug: fallbackSlug }));
    },
  });

  const processDataMutation = useMutation({
    mutationFn: startPostProcessWorkflowFn,
  });

  const previewSummaryMutation = useMutation({
    mutationFn: () =>
      previewSummaryFn({
        data: {
          contentJson: post.contentJson,
        },
      }),
    onSuccess: (result) => {
      setPost((prev) => ({ ...prev, summary: result.summary }));
    },
    onError: (error) => {
      toast.error("摘要生成失败", {
        description: error.message,
      });
    },
  });

  // Auto-generate slug on title change (debounced)
  useEffect(() => {
    // Skip first mount to avoid regenerating slug on edit page load
    if (isFirstTitleMount.current) {
      isFirstTitleMount.current = false;
      prevTitleRef.current = debouncedTitle;
      return;
    }

    // Only run if title actually changed
    if (debouncedTitle === prevTitleRef.current) {
      return;
    }
    prevTitleRef.current = debouncedTitle;

    if (!debouncedTitle.trim()) {
      return;
    }
    if (slugMutation.isPending) return;
    slugGenerationMode.current = "auto";
    slugMutation.mutate(debouncedTitle);
  }, [debouncedTitle]);

  // Auto-calculate read time on content changes (debounced)
  useEffect(() => {
    // Skip first mount
    if (isFirstContentMount.current) {
      isFirstContentMount.current = false;
      prevContentRef.current = debouncedContentJson;
      return;
    }

    // Only run if content actually changed
    if (debouncedContentJson === prevContentRef.current) {
      return;
    }
    prevContentRef.current = debouncedContentJson;

    if (!debouncedContentJson) {
      return;
    }
    runReadTimeCalculation({ silent: true });
  }, [debouncedContentJson]);

  const handleGenerateSlug = () => {
    if (!post.title.trim()) {
      setError("TITLE_REQUIRED_FOR_SLUG");
      return;
    }
    slugGenerationMode.current = "manual";
    slugMutation.mutate(post.title);
  };

  const runReadTimeCalculation = (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!post.contentJson) {
      if (!silent) {
        toast.error("没有内容", {
          description: "需要先写一些内容才能计算阅读时间。",
        });
      }
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

      if (!silent) {
        toast.success("阅读时间计算完成", {
          description: `预计阅读时间 ${mins} 分钟 (${
            cjkChars + englishWords
          } 字)`,
        });
      }
    }, 400);
  };

  const handleCalculateReadTime = () => {
    runReadTimeCalculation({ silent: false });
  };

  const handleGenerateSummary = () => {
    if (!post.contentJson) {
      toast.error("没有内容", {
        description: "需要先写一些内容才能生成摘要。",
      });
      return;
    }
    setIsGeneratingSummary(true);
    previewSummaryMutation.mutate(undefined, {
      onSettled: () => {
        setIsGeneratingSummary(false);
      },
    });
  };

  return {
    isGeneratingSlug: slugMutation.isPending,
    isCalculatingReadTime,
    isGeneratingSummary,
    handleGenerateSlug,
    handleCalculateReadTime,
    handleGenerateSummary,
    handleProcessData,
    processState,
  };
}
