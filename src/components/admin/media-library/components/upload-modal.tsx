import { ClientOnly } from "@tanstack/react-router";
import { AlertCircle, Check, Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import type { UploadItem } from "../types";

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

function UploadModalInternal({
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

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			onFileSelect(Array.from(event.target.files));
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const isAllComplete =
		queue.length > 0 &&
		queue.every((i) => i.status === "COMPLETE" || i.status === "ERROR");

	const hasErrors = queue.some((i) => i.status === "ERROR");

	return createPortal(
		<div
			className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 transition-all duration-500 ease-in-out ${
				isOpen
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-white/95 dark:bg-[#050505]/98 backdrop-blur-2xl"
				onClick={onClose}
			/>

			<div
				className={`
          relative w-full max-w-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-zinc-900 shadow-2xl 
          flex flex-col overflow-hidden rounded-sm max-h-[90vh] transition-all duration-500 ease-in-out transform
          ${
						isOpen
							? "translate-y-0 scale-100 opacity-100"
							: "translate-y-8 scale-[0.99] opacity-0"
					}
        `}
			>
				{/* Header */}
				<div className="h-20 flex items-center justify-between px-8 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
					<div className="flex items-center gap-3">
						<Upload size={18} strokeWidth={1.5} className="text-zinc-400" />
						<span className="text-sm font-medium tracking-tight">
							上传媒体资产
						</span>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
					>
						<X size={20} strokeWidth={1.5} />
					</button>
				</div>

				<input
					type="file"
					ref={fileInputRef}
					onChange={handleInputChange}
					className="hidden"
					multiple
				/>

				<div className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar flex-1 min-h-0">
					{/* Drop Zone */}
					<div
						onClick={() => fileInputRef.current?.click()}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
						className={`
              relative border-2 border-dashed aspect-21/9 min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 gap-4 rounded-sm
              ${
								isDragging
									? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-white/3 scale-[0.99]"
									: "border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 hover:border-zinc-200 dark:hover:border-zinc-800"
							}
            `}
					>
						<div
							className={`p-4 rounded-full border border-current transition-all duration-700 ${
								isDragging
									? "text-zinc-900 dark:text-zinc-100 animate-bounce"
									: "text-zinc-300 dark:text-zinc-700"
							}`}
						>
							<Upload size={24} strokeWidth={1.5} />
						</div>
						<div className="text-center space-y-1">
							<p className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-900 dark:text-zinc-100">
								{isDragging ? "松开即可上传" : "点击或拖拽文件至此"}
							</p>
							<p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
								Max 10MB per file
							</p>
						</div>
					</div>

					{/* Queue List */}
					<div className="space-y-4">
						{queue.length > 0 && (
							<div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-900 pb-4">
								上传队列 ({queue.length})
							</div>
						)}

						<div className="space-y-3">
							{queue.map((item) => (
								<div
									key={item.id}
									className="group bg-zinc-50 dark:bg-white/2 p-4 flex flex-col gap-3 rounded-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900 transition-all"
								>
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-3 min-w-0">
											<div className="shrink-0 text-zinc-400">
												{item.status === "COMPLETE" ? (
													<Check
														size={16}
														strokeWidth={3}
														className="text-green-500"
													/>
												) : item.status === "ERROR" ? (
													<AlertCircle
														size={16}
														strokeWidth={2}
														className="text-red-500"
													/>
												) : (
													<Loader2
														size={16}
														strokeWidth={2}
														className="animate-spin text-zinc-400"
													/>
												)}
											</div>
											<span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
												{item.name}
											</span>
										</div>
										<span className="text-[9px] font-mono text-zinc-400 shrink-0 uppercase tracking-wider">
											{item.size}
										</span>
									</div>

									{/* Progress Bar */}
									<div className="h-0.5 bg-zinc-100 dark:bg-zinc-900 w-full overflow-hidden rounded-full">
										<div
											className={`h-full transition-all duration-500 ease-out ${
												item.status === "COMPLETE"
													? "bg-green-500"
													: item.status === "ERROR"
														? "bg-red-500"
														: "bg-zinc-900 dark:bg-zinc-100"
											}`}
											style={{ width: `${item.progress}%` }}
										></div>
									</div>

									{item.log && (
										<div
											className={`text-[9px] font-mono leading-relaxed ${
												item.status === "ERROR"
													? "text-red-500"
													: "text-zinc-400 opacity-60"
											}`}
										>
											{item.log}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-4 shrink-0">
					{isAllComplete ? (
						<button
							onClick={onClose}
							className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${
								hasErrors
									? "bg-red-500 text-white hover:bg-red-600"
									: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98]"
							}`}
						>
							<Check size={16} strokeWidth={2.5} />
							{hasErrors ? "任务存在错误 - 确认" : "上传任务已完成"}
						</button>
					) : (
						<button
							onClick={onClose}
							className="px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
						>
							取消
						</button>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
}

export function UploadModal(props: UploadModalProps) {
	return (
		<ClientOnly>
			<UploadModalInternal {...props} />
		</ClientOnly>
	);
}
