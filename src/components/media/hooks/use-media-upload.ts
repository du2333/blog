import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImageFn } from "@/functions/images";
import { UploadItem } from "../types";
import { formatBytes } from "@/lib/files";
import { toast } from "sonner";

export const useMediaUpload = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const processingRef = useRef(false);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await uploadImageFn({ data: formData });
    },
  });

  // Process upload queue
  useEffect(() => {
    let isCancelled = false;

    const processQueue = async () => {
      // Find next waiting item
      const waitingIndex = queue.findIndex((item) => item.status === "WAITING");
      if (waitingIndex === -1 || processingRef.current) return;

      processingRef.current = true;
      const item = queue[waitingIndex];

      if (!item.file) {
        // No file, mark as error
        if (!isCancelled) {
          setQueue((prev) =>
            prev.map((q, i) =>
              i === waitingIndex
                ? { ...q, status: "ERROR" as const, log: "> ERROR: NO FILE" }
                : q
            )
          );
        }
        processingRef.current = false;
        return;
      }

      // Update to uploading
      if (!isCancelled) {
        setQueue((prev) =>
          prev.map((q, i) =>
            i === waitingIndex
              ? {
                  ...q,
                  status: "UPLOADING" as const,
                  progress: 50,
                  log: "> UPLOAD_STREAM: PACKETS SENDING...",
                }
              : q
          )
        );
      }

      try {
        await uploadMutation.mutateAsync(item.file);

        // Mark as complete (check if effect was cancelled)
        if (!isCancelled) {
          setQueue((prev) =>
            prev.map((q, i) =>
              i === waitingIndex
                ? {
                    ...q,
                    status: "COMPLETE" as const,
                    progress: 100,
                    log: "> UPLOAD COMPLETE. ASSET INDEXED.",
                  }
                : q
            )
          );

          toast.success(`UPLOAD COMPLETE: ${item.name}`);

          // Invalidate queries to refresh media list
          queryClient.invalidateQueries({ queryKey: ["media"] });
        }
      } catch (error) {
        // Mark as error (check if effect was cancelled)
        if (!isCancelled) {
          setQueue((prev) =>
            prev.map((q, i) =>
              i === waitingIndex
                ? {
                    ...q,
                    status: "ERROR" as const,
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
      }

      processingRef.current = false;
    };

    processQueue();

    return () => {
      isCancelled = true;
    };
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
