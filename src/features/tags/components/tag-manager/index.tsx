import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Check,
  Edit2,
  Hash,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTagFn,
  deleteTagFn,
  updateTagFn,
} from "@/features/tags/api/tags.api";
import { tagsWithCountAdminQueryOptions } from "@/features/tags/tags.query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TagManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "postCount">(
    "postCount",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tagToDelete, setTagToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [tagToEdit, setTagToEdit] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery(
    tagsWithCountAdminQueryOptions({ sortBy, sortDir }),
  );

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [tags, searchTerm]);

  const updateTagMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      updateTagFn({ data: { id: data.id, data: { name: data.name } } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", "admin"] });
      setTagToEdit(null);
      toast.success("标签已重命名");
    },
    onError: (err: Error) => {
      toast.error("更新失败: " + (err.message || "未知错误"));
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => deleteTagFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", "admin"] });
      setTagToDelete(null);
      toast.success("标签已删除");
    },
    onError: (err: Error) => {
      toast.error("删除失败: " + (err.message || "未知错误"));
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTagFn({ data: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", "admin"] });
      setNewTagName("");
      setIsCreating(false);
      toast.success("标签已创建");
    },
    onError: (err: Error) => {
      toast.error("创建失败: " + (err.message || "未知错误"));
    },
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName.trim());
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">
            标签管理
          </h1>
          <p className="text-muted-foreground font-light">
            管理您的内容分类及其关联文章。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
              size={16}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索标签..."
              className="pl-10 bg-accent/30 border-border/50 focus:bg-background transition-all"
            />
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="gap-2 shrink-0"
          >
            <Plus size={16} />
            <span>创建标签</span>
          </Button>
        </div>
      </div>

      {/* Stats/Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-accent/20 border border-border/50 rounded-sm space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            总标签数
          </span>
          <div className="text-3xl font-serif">{tags.length}</div>
        </div>
        <div className="p-6 bg-accent/20 border border-border/50 rounded-sm space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            使用中
          </span>
          <div className="text-3xl font-serif">
            {tags.filter((t) => t.postCount > 0).length}
          </div>
        </div>
        <div className="p-6 bg-accent/20 border border-border/50 rounded-sm space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            空置
          </span>
          <div className="text-3xl font-serif">
            {tags.filter((t) => t.postCount === 0).length}
          </div>
        </div>
      </div>

      {/* Creation Row (Inline) */}
      {isCreating && (
        <form
          onSubmit={handleCreateTag}
          className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-sm animate-in zoom-in-95 duration-300"
        >
          <div className="flex-1 relative">
            <Hash
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50"
              size={16}
            />
            <Input
              autoFocus
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="新标签名称..."
              className="pl-10 border-primary/20 bg-background"
            />
          </div>
          <Button type="submit" disabled={createTagMutation.isPending}>
            {createTagMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "确认创建"
            )}
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setIsCreating(false)}
          >
            取消
          </Button>
        </form>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-background border border-border/50 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/50 bg-accent/30">
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    标签名称
                    <ArrowUpDown
                      size={12}
                      className={cn(sortBy === "name" && "text-primary")}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  <button
                    onClick={() => toggleSort("postCount")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    文章数量
                    <ArrowUpDown
                      size={12}
                      className={cn(sortBy === "postCount" && "text-primary")}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    创建时间
                    <ArrowUpDown
                      size={12}
                      className={cn(sortBy === "createdAt" && "text-primary")}
                    />
                  </button>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-8">
                      <div className="h-4 w-32 bg-accent rounded" />
                    </td>
                    <td className="px-6 py-8">
                      <div className="h-4 w-12 bg-accent rounded" />
                    </td>
                    <td className="px-6 py-8 hidden lg:table-cell">
                      <div className="h-4 w-24 bg-accent rounded" />
                    </td>
                    <td className="px-6 py-8">
                      <div className="h-4 w-16 bg-accent rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="group hover:bg-accent/30 transition-colors duration-300"
                  >
                    <td className="px-6 py-4 font-medium">
                      {tagToEdit?.id === tag.id ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <Input
                            autoFocus
                            value={tagToEdit.name}
                            onChange={(e) =>
                              setTagToEdit({
                                ...tagToEdit,
                                name: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                updateTagMutation.mutate(tagToEdit);
                              if (e.key === "Escape") setTagToEdit(null);
                            }}
                            className="h-8 py-0 px-2 text-sm"
                          />
                          <button
                            onClick={() => updateTagMutation.mutate(tagToEdit)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setTagToEdit(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Hash
                            size={14}
                            className="text-muted-foreground/30"
                          />
                          <span className="text-foreground tracking-tight">
                            {tag.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className="bg-accent text-[10px] items-center gap-1.5 h-6 px-2.5 font-bold uppercase tracking-widest"
                      >
                        {tag.postCount}{" "}
                        <span className="opacity-40 font-normal">篇文章</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-light hidden lg:table-cell">
                      {new Date(tag.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setTagToEdit({ id: tag.id, name: tag.name })
                          }
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={() =>
                            setTagToDelete({ id: tag.id, name: tag.name })
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center space-y-3">
                    <div className="text-muted-foreground font-serif tracking-tight">
                      没有找到匹配的标签
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-[10px] uppercase tracking-widest"
                    >
                      清除搜索
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-background border border-border/50 rounded-sm animate-pulse space-y-3"
            >
              <div className="h-5 w-1/3 bg-accent rounded" />
              <div className="h-4 w-1/4 bg-accent rounded" />
            </div>
          ))
        ) : filteredTags.length > 0 ? (
          filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="p-4 bg-background border border-border/50 rounded-sm space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {tagToEdit?.id === tag.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={tagToEdit.name}
                        onChange={(e) =>
                          setTagToEdit({
                            ...tagToEdit,
                            name: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => updateTagMutation.mutate(tagToEdit)}
                      >
                        <Check size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-muted-foreground/30" />
                      <span className="font-medium truncate">{tag.name}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                    创建于 {new Date(tag.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-accent text-[10px] shrink-0 font-bold h-6"
                >
                  {tag.postCount} 篇
                </Badge>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-[10px] uppercase tracking-widest gap-2"
                  onClick={() => setTagToEdit({ id: tag.id, name: tag.name })}
                >
                  <Edit2 size={12} />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-[10px] uppercase tracking-widest gap-2 text-destructive hover:bg-destructive/5 border-destructive/20"
                  onClick={() => setTagToDelete({ id: tag.id, name: tag.name })}
                >
                  <Trash2 size={12} />
                  删除
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-background border border-border/50 rounded-sm">
            <p className="text-muted-foreground font-serif italic">
              没有匹配的标签
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() =>
          tagToDelete && deleteTagMutation.mutate(tagToDelete.id)
        }
        title="删除标签"
        message={`确定要删除标签 "${tagToDelete?.name}" 吗？此操作不可撤销。关联该标签的文章将不再显示该标签。`}
        confirmLabel="确认删除"
        isLoading={deleteTagMutation.isPending}
      />
    </div>
  );
}
