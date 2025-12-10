import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImageFn } from "@/features/media/images.api";
import { UploadItem } from "../types";
import { formatBytes } from "@/lib/files";
import { toast } from "sonner";

export const useMediaUpload = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processingRef = useRef(false);
  const isMountedRef = useRef(true);

  // 监听组件挂载和卸载
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const result = await uploadImageFn({ data: formData });
      return result;
    },
  });

  // Process upload queue
  useEffect(() => {
    const processQueue = async () => {
      const waitingIndex = queue.findIndex((item) => item.status === "WAITING");
      const item = queue[waitingIndex];

      if (waitingIndex === -1 || processingRef.current) {
        return;
      }

      // LOCK
      processingRef.current = true;

      if (!item.file) {
        setQueue((prev) =>
          prev.map((q, i) =>
            i === waitingIndex
              ? { ...q, status: "ERROR", log: "> ERROR: NO FILE" }
              : q
          )
        );
        processingRef.current = false;
        return;
      }

      // Update to UPLOADING
      setQueue((prev) =>
        prev.map((q, i) =>
          i === waitingIndex
            ? {
                ...q,
                status: "UPLOADING",
                progress: 50,
                log: "> UPLOAD_STREAM: PACKETS SENDING...",
              }
            : q
        )
      );

      try {
        await uploadMutation.mutateAsync(item.file);

        if (isMountedRef.current) {
          setQueue((prev) =>
            prev.map((q, i) =>
              i === waitingIndex
                ? {
                    ...q,
                    status: "COMPLETE",
                    progress: 100,
                    log: "> UPLOAD COMPLETE. ASSET INDEXED.",
                  }
                : q
            )
          );

          toast.success(`UPLOAD COMPLETE: ${item.name}`);
          queryClient.invalidateQueries({ queryKey: ["media"] });
        } else {
        }
      } catch (error) {
        if (isMountedRef.current) {
          setQueue((prev) =>
            prev.map((q, i) =>
              i === waitingIndex
                ? {
                    ...q,
                    status: "ERROR",
                    progress: 0,
                    log: `> ERROR: ${
                      error instanceof Error ? error.message : "UPLOAD FAILED"
                    }`,
                  }
                : q
            )
          );
          toast.error(`UPLOAD FAILED: ${item.name}`);
        }
      } finally {
        // 关键修复：使用 finally 确保锁一定会被释放
        processingRef.current = false;
      }
    };

    processQueue();
  }, [queue, uploadMutation, queryClient]);

  const processFiles = (files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatBytes(file.size),
      progress: 0,
      status: "WAITING" as const,
      log: "> INITIALIZING UPLOAD HANDSHAKE...",
      file: file,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const reset = () => {
    setQueue([]);
    processingRef.current = false;
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    queue,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processFiles,
    reset,
  };
};
