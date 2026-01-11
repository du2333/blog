import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PostEditorData } from "@/features/posts/components/post-editor/types";
import type { JSONContent } from "@tiptap/react";
import type { Tag } from "@/features/tags/tags.schema";
import {
  generateSlugFn,
  previewSummaryFn,
  startPostProcessWorkflowFn,
} from "@/features/posts/api/posts.admin.api";
import { useDebounce } from "@/hooks/use-debounce";
import { slugify } from "@/features/posts/utils/content";
import { createTagFn, generateTagsFn } from "@/features/tags/api/tags.api";
import { tagsAdminQueryOptions } from "@/features/tags/tags.query";

interface UsePostActionsOptions {
  postId: number;
  post: PostEditorData;
  setPost: React.Dispatch<React.SetStateAction<PostEditorData>>;
  setError: (error: string | null) => void;
  allTags: Array<Tag>;
}

export function usePostActions({
  postId,
  post,
  setPost,
  setError,
  allTags,
}: UsePostActionsOptions) {
  const queryClient = useQueryClient();
  const [isCalculatingReadTime, setIsCalculatingReadTime] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
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

  const processDataMutation = useMutation({
    mutationFn: startPostProcessWorkflowFn,
  });

  const handleProcessData = () => {
    if (processState !== "IDLE") return;

    setProcessState("PROCESSING");

    setTimeout(() => {
      processDataMutation.mutate({
        data: { id: postId, status: post.status },
      });

      // Feedback: Notify user task is running
      toast("发布流启动", {
        description: "后台正在进行内容处理与部署分析。",
        icon: <Radio className="animate-pulse text-foreground" />,
        className:
          "bg-background/95 backdrop-blur-2xl border border-border rounded-sm",
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
      console.error("Slug生成失败:", error);
      setError("Slug生成失败");
      const fallbackSlug = slugify(post.title) || "untitled-log";
      setPost((prev) => ({ ...prev, slug: fallbackSlug }));
    },
  });

  const previewSummaryMutation = useMutation({
    mutationFn: () =>
      previewSummaryFn({
        data: {
          contentJson: post.contentJson,
        },
      }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error("摘要生成失败", {
          description: "请检查 AI 服务配置",
        });
        return;
      }
      setPost((prev) => ({ ...prev, summary: result.summary ?? "" }));
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
            text += `${extractText(child)} `;
          }
        }
        return text;
      };

      const text = extractText(post.contentJson!);

      // Count CJK characters (Chinese, Japanese, Korean)
      const cjkChars = (
        text.match(
          /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g,
        ) || []
      ).length;

      // Count English words (remove CJK chars first, then split by whitespace)
      const textWithoutCjk = text.replace(
        /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g,
        " ",
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
      setError("标题不能为空");
      return;
    }
    slugGenerationMode.current = "manual";
    slugMutation.mutate(post.title);
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

  const handleGenerateTags = async () => {
    try {
      setIsGeneratingTags(true);
      const generatedTagNames = await generateTagsFn({
        data: {
          title: post.title,
          summary: post.summary,
          content:
            typeof post.contentJson === "string"
              ? post.contentJson
              : JSON.stringify(post.contentJson),
          existingTags: allTags.map((t) => t.name),
        },
      });

      // Match or Create Tags
      const newTagIds: Array<number> = [];
      const currentTagIds = new Set(post.tagIds);

      for (const name of generatedTagNames) {
        const existingTag = allTags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase(),
        );

        if (existingTag) {
          if (!currentTagIds.has(existingTag.id)) {
            newTagIds.push(existingTag.id);
            currentTagIds.add(existingTag.id);
          }
        } else {
          // Create new tag
          const newTag = await createTagFn({ data: { name } });
          newTagIds.push(newTag.id);
          currentTagIds.add(newTag.id);
        }
      }

      if (newTagIds.length > 0) {
        setPost((prev) => ({
          ...prev,
          tagIds: [...prev.tagIds, ...newTagIds],
        }));

        await queryClient.invalidateQueries({
          queryKey: tagsAdminQueryOptions().queryKey,
        });

        toast.success("AI 标签生成完成", {
          description: `已添加 ${newTagIds.length} 个新标签`,
        });
      } else {
        toast.info("AI 标签生成完成", {
          description: "没有生成新的标签",
        });
      }
    } catch (error) {
      console.error("生成标签失败:", error);
      toast.error("生成标签失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsGeneratingTags(false);
    }
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
    isGeneratingTags,
    handleGenerateTags,
  };
}
