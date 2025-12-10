import TechButton from "@/components/ui/tech-button";
import { getLinkedPostsFn } from "@/features/media/images.api";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { formatBytes } from "@/lib/files";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Link2,
  Loader2,
  Check,
  Pencil,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MediaAsset } from "@/components/media/types";

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
    queryKey: ["linkedPosts", activeAsset?.key],
    queryFn: async () => {
      if (!activeAsset?.key) return [];
      return getLinkedPostsFn({ data: { key: activeAsset.key } });
    },
    enabled: !!activeAsset?.key,
  });

  if (!shouldRender || !activeAsset) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center ${
        isMounted ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-200 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Close Button (Absolute Top Right) */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 z-50 text-gray-500 hover:text-white transition-all p-2 bg-black/80 rounded-full border border-zzz-gray hover:border-white ${
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <X size={24} />
      </button>

      <div
        className={`
        w-full max-w-6xl h-full md:h-[85vh] flex flex-col md:flex-row bg-zzz-dark border border-zzz-gray shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden clip-corner-tr z-10
        ${
          isMounted
            ? "animate-in fade-in zoom-in-95"
            : "animate-out fade-out zoom-out-95"
        } duration-200
      `}
      >
        {/* --- Image Viewport (Left/Top) --- */}
        <div className="h-[40vh] md:h-auto md:flex-1 bg-black relative flex items-center justify-center overflow-hidden p-8 group border-b md:border-b-0 md:border-r border-zzz-gray">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none"></div>

          <img
            src={activeAsset.url}
            alt={activeAsset.fileName}
            className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zzz-gray/20 bg-black relative z-10"
          />

          {/* Deco Corners */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-zzz-lime/30"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-zzz-lime/30"></div>
        </div>

        {/* --- Metadata Sidebar (Right/Bottom) --- */}
        <div className="flex-1 md:w-80 md:flex-none bg-zzz-black flex flex-col min-h-0">
          {/* Header with Safe Area for Close Button */}
          <div className="p-6 border-b border-zzz-gray pr-16 relative">
            <div className="text-[10px] font-mono text-zzz-orange uppercase tracking-widest mb-2">
              Asset_Inspector // V.01
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black border border-zzz-lime text-white text-sm font-bold p-1 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="text-zzz-lime hover:bg-zzz-lime/10 p-1 rounded"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-2 group/edit">
                <h2 className="text-xl font-bold font-sans text-white uppercase break-all leading-tight">
                  {activeAsset.fileName}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-600 hover:text-zzz-cyan transition-colors opacity-0 group-hover/edit:opacity-100"
                  title="Rename Asset"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                <HardDrive size={14} /> File Size
              </div>
              <div className="text-white font-mono">
                {formatBytes(activeAsset.sizeInBytes)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                <FileText size={14} /> Type
              </div>
              <div className="text-white font-mono">{activeAsset.mimeType}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                <Calendar size={14} /> Upload Date
              </div>
              <div className="text-white font-mono">
                {activeAsset.createdAt
                  ? new Date(activeAsset.createdAt).toLocaleDateString()
                  : "Unknown"}
              </div>
            </div>

            {/* Dimensions (if available) */}
            {activeAsset.width && activeAsset.height && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                  Dimensions
                </div>
                <div className="text-white font-mono">
                  {activeAsset.width} × {activeAsset.height}
                </div>
              </div>
            )}

            {/* Linked Posts Section */}
            <div className="pt-4 border-t border-dashed border-zzz-gray/30">
              <div className="flex items-center gap-2 text-xs font-mono text-zzz-cyan uppercase mb-3">
                <Link2 size={14} /> Linked Entries ({linkedPosts.length})
              </div>
              {linkedPosts.length === 0 ? (
                <div className="text-[10px] text-gray-600 font-mono italic">
                  NO_LINKS_DETECTED
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={"/admin/posts/edit/$slug"}
                      params={{ slug: post.slug }}
                      className="block p-2 bg-zzz-dark/50 border border-zzz-gray/30 hover:border-zzz-cyan hover:text-zzz-cyan transition-colors group"
                    >
                      <div className="text-[10px] font-bold uppercase truncate flex items-center gap-1">
                        {post.title}
                        <ExternalLink
                          size={10}
                          className="opacity-50 group-hover:opacity-100"
                        />
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono">
                        SLUG: {post.slug}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 pt-4 border-t border-dashed border-zzz-gray/30">
              <div className="text-xs font-mono text-gray-500 uppercase mb-2">
                Asset Key
              </div>
              <div className="bg-zzz-dark p-2 text-[10px] font-mono text-zzz-cyan break-all border border-zzz-gray/50">
                {activeAsset.key}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-zzz-gray bg-zzz-dark/30 shrink-0">
            <a
              href={`${activeAsset.url}?original=true`}
              download={activeAsset.fileName}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <TechButton
                variant="secondary"
                className="w-full"
                icon={<Download size={16} />}
              >
                Download Original
              </TechButton>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
