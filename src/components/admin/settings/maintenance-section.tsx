import ConfirmationModal from "@/components/ui/confirmation-modal";
import TechButton from "@/components/ui/tech-button";
import {
  AlertTriangle,
  Database,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildSearchIndexFn } from "@/features/search/search.api";

export function MaintenanceSection() {
  const [isIndexing, setIsIndexing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRebuild = () => {
    setIsModalOpen(false);
    setIsIndexing(true);
    toast.promise(buildSearchIndexFn, {
      loading: "正在扫描扇区数据...",
      success: ({ duration, indexed }) => {
        setIsIndexing(false);
        return `搜索索引重建完成, 耗时 ${duration}ms, 索引 ${indexed} 条数据`;
      },
      error: "索引构建失败",
    });
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold font-sans uppercase text-white mb-6 flex items-center gap-2">
        <Server size={20} className="text-zzz-orange" />
        数据维护 (Maintenance)
      </h2>

      <div className="bg-black border border-zzz-gray p-1">
        {/* Index Module */}
        <div className="bg-zzz-dark/30 p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-zzz-gray border-dashed relative overflow-hidden group">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-zzz-gray/20 p-2 rounded text-white group-hover:bg-zzz-lime group-hover:text-black transition-colors">
                <Search size={20} />
              </div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                搜索索引重建
              </h3>
            </div>
            <p className="text-xs font-mono text-gray-500 leading-relaxed max-w-lg">
              重新扫描所有数据库条目以重建搜索映射。
              <span className="text-zzz-orange block mt-1">
                <AlertTriangle size={10} className="inline mr-1" />{" "}
                仅在批量导入后使用。
              </span>
            </p>
          </div>
          <TechButton
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            disabled={isIndexing}
            className="border-zzz-orange text-zzz-orange hover:bg-zzz-orange hover:text-black w-48"
            icon={
              isIndexing ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )
            }
          >
            {isIndexing ? "构建中..." : "重建索引"}
          </TechButton>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-stripe-pattern opacity-5 pointer-events-none"></div>
        </div>

        {/* Cache Module */}
        <div className="bg-zzz-dark/30 p-6 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-zzz-gray/20 p-2 rounded text-white group-hover:bg-red-500 group-hover:text-black transition-colors">
                <RefreshCw size={20} />
              </div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                系统缓存清理
              </h3>
            </div>
            <p className="text-xs font-mono text-gray-500">
              清除本地存储和会话数据。强制断开代理人连接。
            </p>
          </div>
          <button
            disabled
            className="px-6 py-2 border border-zzz-gray text-gray-600 font-mono text-xs font-bold uppercase cursor-not-allowed"
          >
            清理缓存
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRebuild}
        title="确认重建索引"
        message="正在请求全扇区扫描。此操作将重新映射所有 HDD 数据日志，可能会导致短时间的检索延迟。是否继续执行?"
        confirmLabel="启动构建协议"
      />
    </div>
  );
}
