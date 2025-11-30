import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/posts/edit/$slug")({
  component: EditPost,
});

function EditPost() {
  const { slug } = Route.useParams();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zzz-gray pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/posts"
            className="p-2 border border-zzz-gray hover:border-zzz-orange hover:text-zzz-orange transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black font-sans uppercase text-white mb-1">
              {/* TODO: replace with post id */}
              Edit <span className="text-zzz-orange">Log #{slug}</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs">
              EDIT_MODE // MODIFICATIONS_TRACKED
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors">
            <Trash2 size={16} />
            Delete
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-zzz-gray text-gray-400 font-bold text-xs uppercase tracking-wider hover:border-white hover:text-white transition-colors">
            <Eye size={16} />
            Preview
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-zzz-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-zzz-orange/80 transition-colors">
            <Save size={16} />
            Update
          </button>
        </div>
      </div>

      {/* Editor Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title Input */}
          <div className="bg-zzz-black border border-zzz-gray p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="LOADING..."
              className="w-full bg-transparent border-b border-zzz-gray text-2xl font-bold text-white placeholder:text-gray-700 focus:border-zzz-orange focus:outline-none pb-2 transition-colors"
            />
          </div>

          {/* Content Editor Placeholder */}
          <div className="bg-zzz-black border border-zzz-gray p-4 min-h-[500px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Content
            </label>
            <div className="border border-dashed border-zzz-gray p-8 text-center">
              <p className="text-gray-600 font-mono text-sm mb-2">
                LOADING_CONTENT...
              </p>
              {/* TODO: replace with post id */}
              <p className="text-gray-700 text-xs">Post ID: {slug}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-zzz-black border border-zzz-gray p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Status
            </label>
            <select className="w-full bg-zzz-dark border border-zzz-gray px-3 py-2 text-sm font-mono text-white focus:border-zzz-orange focus:outline-none">
              <option>DRAFT</option>
              <option>PUBLISHED</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-zzz-black border border-zzz-gray p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Category
            </label>
            <select className="w-full bg-zzz-dark border border-zzz-gray px-3 py-2 text-sm font-mono text-white focus:border-zzz-orange focus:outline-none">
              <option>DEV</option>
              <option>LIFE</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-zzz-black border border-zzz-gray p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Summary
            </label>
            <textarea
              placeholder="LOADING..."
              rows={4}
              className="w-full bg-zzz-dark border border-zzz-gray px-3 py-2 text-sm font-mono text-white placeholder:text-gray-700 focus:border-zzz-orange focus:outline-none resize-none"
            />
          </div>

          {/* Metadata */}
          <div className="bg-zzz-black border border-zzz-gray p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Metadata
            </label>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-500">
                <span>CREATED:</span>
                <span className="text-gray-400">--</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>UPDATED:</span>
                <span className="text-gray-400">--</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>ID:</span>
                {/* TODO: replace with post id */}
                <span className="text-zzz-orange">{slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
