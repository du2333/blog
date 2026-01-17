import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Check,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Layout,
  Link2,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/features/media/components/media-library/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLinkedPostsFn } from "@/features/media/media.api";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { cn, formatBytes } from "@/lib/utils";
import { MEDIA_KEYS } from "@/features/media/queries";

interface MediaPreviewModalProps {
  asset: MediaAsset | null;
  onClose: () => void;
  onUpdateName: (key: string, name: string) => Promise<void>;
}

export function MediaPreviewModal({
  asset,
  onClose,
  onUpdateName,
}: MediaPreviewModalProps) {
  const isMounted = !!asset;
  const shouldRender = useDelayUnmount(isMounted, 200);

  // Persist asset during exit animation
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(asset);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setActiveAsset(asset);
      setEditName(asset.fileName);
      setIsEditing(false);
    }
  }, [asset]);

  const handleSaveName = async () => {
    if (!activeAsset || !editName.trim()) return;

    setIsSaving(true);
    try {
      await onUpdateName(activeAsset.key, editName);
      setActiveAsset((prev) => (prev ? { ...prev, fileName: editName } : null));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Query linked posts via server function
  const { data: linkedPosts = [] } = useQuery({
    queryKey: MEDIA_KEYS.linkedPosts(activeAsset?.key || ""),
    queryFn: async () => {
      if (!activeAsset?.key) return [];
      return getLinkedPostsFn({ data: { key: activeAsset.key } });
    },
    enabled: !!activeAsset?.key,
  });

  if (!shouldRender || !activeAsset) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 ${
        isMounted ? "pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-background/95 backdrop-blur-md transition-all duration-500 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={`absolute top-4 right-4 z-110 text-muted-foreground hover:text-foreground transition-all duration-500 rounded-none h-12 w-12 ${
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <X size={24} strokeWidth={1} />
      </Button>

      <div
        className={`
        w-full max-w-6xl h-full md:h-[85vh] flex flex-col md:flex-row bg-background border border-border/30 shadow-none relative overflow-hidden z-10 rounded-none
        ${
          isMounted
            ? "animate-in fade-in zoom-in-95"
            : "animate-out fade-out zoom-out-95"
        } duration-500
      `}
      >
        {/* --- Image Viewport (Left/Top) --- */}
        <div className="h-[40vh] md:h-auto md:w-2/3 bg-muted/5 relative flex items-center justify-center overflow-hidden p-8 md:p-12 border-b md:border-b-0 md:border-r border-border/30">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest z-20">
            预览模式
          </div>
          <img
            src={activeAsset.url}
            alt={activeAsset.fileName}
            className="max-w-full max-h-full object-contain relative z-10 shadow-sm"
          />
        </div>

        {/* --- Metadata Sidebar (Right/Bottom) --- */}
        <div className="flex-1 md:w-1/3 flex flex-col min-h-0 bg-background">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-border/30">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
              资产详情
            </div>

            {isEditing ? (
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 h-9 text-sm font-mono bg-muted/10 border-b border-border/50 rounded-none px-0 focus:border-foreground focus:ring-0"
                  autoFocus
                />
                <Button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  variant="default"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-none"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500 rounded-none"
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-4 group/edit">
                <h2 className="text-xl font-serif font-medium tracking-tight break-all leading-snug">
                  {activeAsset.fileName}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/edit:opacity-100 rounded-none"
                >
                  <Pencil size={12} />
                </Button>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <HardDrive size={10} /> 大小
                </div>
                <div className="text-xs font-mono font-medium">
                  {formatBytes(activeAsset.sizeInBytes)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <FileText size={10} /> 格式
                </div>
                <div className="text-xs font-mono font-medium uppercase">
                  {activeAsset.mimeType.split("/")[1]}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <Layout size={10} /> 尺寸
                </div>
                <div className="text-xs font-mono font-medium uppercase">
                  {activeAsset.width && activeAsset.height
                    ? `${activeAsset.width} × ${activeAsset.height}`
                    : "未知"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <Calendar size={10} /> 创建时间
                </div>
                <div className="text-xs font-mono font-medium uppercase">
                  {new Date(activeAsset.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Linked Posts Section */}
            <div className="pt-6 border-t border-border/30">
              <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                <Link2 size={10} /> 引用 ({linkedPosts.length})
              </div>
              {linkedPosts.length === 0 ? (
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider pl-4 border-l border-border/30">
                  未找到引用
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to="/admin/posts/edit/$id"
                      params={{ id: String(post.id) }}
                      className="block p-3 bg-muted/10 hover:bg-accent/10 border border-transparent hover:border-border/30 transition-all rounded-none group"
                    >
                      <div className="text-[10px] font-medium truncate mb-1 flex items-center justify-between">
                        {post.title}
                        <ExternalLink
                          size={10}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                        /{post.slug}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-6 border-t border-border/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                资产键
              </div>
              <div className="p-3 bg-muted/10 text-[9px] font-mono text-muted-foreground break-all rounded-none leading-relaxed select-all border border-border/30">
                {activeAsset.key}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 md:p-8 border-t border-border/30 bg-background">
            <a
              href={`${activeAsset.url}?original=true`}
              download={activeAsset.fileName}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-10 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all rounded-none gap-2 flex items-center justify-center whitespace-nowrap border-foreground/20",
              )}
            >
              <Download size={12} className="shrink-0" />
              <span>[ 下载原件 ]</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
