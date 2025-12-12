import TechButton from "@/components/ui/tech-button";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { useRef } from "react";
import { UploadItem } from "../types";

interface UploadModalProps {
  isOpen: boolean;
  queue: UploadItem[];
  isDragging: boolean;
  onClose: () => void;
  onFileSelect: (files: File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function UploadModal({
  isOpen,
  queue,
  isDragging,
  onClose,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(Array.from(event.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isAllComplete =
    queue.length > 0 &&
    queue.every((i) => i.status === "COMPLETE" || i.status === "ERROR");

  return (
    <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur flex items-center justify-center animate-in fade-in p-4">
      <div className="w-full max-w-2xl bg-zzz-black border-2 border-zzz-lime shadow-[0_0_50px_rgba(204,255,0,0.2)] relative clip-corner-tr p-8 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black font-sans uppercase text-white mb-2 flex items-center gap-2">
          <Upload className="text-zzz-lime" /> Data Ingestion
        </h2>
        <div className="h-px w-full bg-zzz-gray mb-8"></div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          className="hidden"
          multiple
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            border-2 border-dashed h-32 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 mb-6 shrink-0
            ${
              isDragging
                ? "border-zzz-lime bg-zzz-lime/10 scale-[1.02]"
                : "border-zzz-gray bg-zzz-dark/30 hover:border-zzz-lime hover:bg-zzz-lime/5"
            }
          `}
        >
          <div className="flex items-center gap-2 text-gray-400">
            <Upload
              size={20}
              className={isDragging ? "animate-bounce text-zzz-lime" : ""}
            />
            <span className="text-sm font-bold uppercase">
              {isDragging ? "RELEASE TO UPLOAD" : "CLICK OR DRAG FILES"}
            </span>
          </div>
          <div className="text-[10px] font-mono text-gray-600">
            {isDragging
              ? "DETECTING DATA STREAM..."
              : "SYSTEM READY FOR BATCH INPUT"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-[200px] mb-6 p-1">
          {queue.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-600 font-mono text-xs">
              WAITING_FOR_INPUT...
            </div>
          )}
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-black border border-zzz-gray p-3 flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3">
                  {item.status === "COMPLETE" ? (
                    <CheckCircle2 size={16} className="text-zzz-lime" />
                  ) : item.status === "ERROR" ? (
                    <AlertCircle size={16} className="text-red-500" />
                  ) : (
                    <Loader2
                      size={16}
                      className="text-zzz-orange animate-spin"
                    />
                  )}
                  <span className="text-xs font-bold text-white max-w-[200px] truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {item.size}
                </span>
              </div>
              <div className="h-1 bg-zzz-gray/30 w-full relative z-10">
                <div
                  className={`h-full transition-all duration-300 ${
                    item.status === "COMPLETE"
                      ? "bg-zzz-lime"
                      : item.status === "ERROR"
                      ? "bg-red-500"
                      : "bg-zzz-orange"
                  }`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <div
                className={`text-[10px] font-mono z-10 ${
                  item.status === "ERROR" ? "text-red-400" : "text-gray-500"
                }`}
              >
                {item.log}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 shrink-0">
          {isAllComplete ? (
            <TechButton
              onClick={onClose}
              className="w-full"
              icon={<CheckCircle2 size={16} />}
            >
              BATCH COMPLETE - RETURN
            </TechButton>
          ) : (
            <TechButton variant="secondary" onClick={onClose}>
              CANCEL
            </TechButton>
          )}
        </div>
      </div>
    </div>
  );
}
