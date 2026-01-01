import { ClientOnly } from "@tanstack/react-router";
import { AlertCircle, Check, Loader2, Upload, X } from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import type { UploadItem } from "../types";
import type React from "react";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
	isOpen: boolean;
	queue: Array<UploadItem>;
	isDragging: boolean;
	onClose: () => void;
	onFileSelect: (files: Array<File>) => void;
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
		if (fileInputRef.current)
			fileInputRef.current.value = "";
	};

	const isAllComplete
		= queue.length > 0
			&& queue.every(i => i.status === "COMPLETE" || i.status === "ERROR");

	const hasErrors = queue.some(i => i.status === "ERROR");

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
				className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
				onClick={onClose}
			/>

			<div
				className={`
          relative w-full max-w-3xl bg-popover border border-border shadow-2xl 
          flex flex-col overflow-hidden rounded-sm max-h-[90vh] transition-all duration-500 ease-in-out transform
          ${
				isOpen
					? "translate-y-0 scale-100 opacity-100"
					: "translate-y-8 scale-[0.99] opacity-0"
			}
        `}
			>
				{/* Header */}
				<div className="h-20 flex items-center justify-between px-8 border-b border-border shrink-0">
					<div className="flex items-center gap-3">
						<Upload
							size={18}
							strokeWidth={1.5}
							className="text-muted-foreground"
						/>
						<span className="text-sm font-medium tracking-tight">
							上传媒体资产
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-sm"
					>
						<X size={20} strokeWidth={1.5} />
					</Button>
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
						? "border-foreground bg-muted scale-[0.99]"
						: "border-border bg-muted/50 hover:bg-muted hover:border-border"
				}
            `}
					>
						<div
							className={`p-4 rounded-sm border border-current transition-all duration-700 ${
								isDragging ? "animate-bounce" : "text-muted-foreground"
							}`}
						>
							<Upload size={24} strokeWidth={1.5} />
						</div>
						<div className="text-center space-y-1">
							<p className="text-[11px] uppercase tracking-[0.3em] font-bold">
								{isDragging ? "松开即可上传" : "点击或拖拽文件至此"}
							</p>
							<p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
								Max 10MB per file
							</p>
						</div>
					</div>

					{/* Queue List */}
					<div className="space-y-4">
						{queue.length > 0 && (
							<div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold border-b border-border pb-4">
								上传队列 (
								{queue.length}
								)
							</div>
						)}

						<div className="space-y-3">
							{queue.map(item => (
								<div
									key={item.id}
									className="group bg-muted p-4 flex flex-col gap-3 rounded-sm border border-transparent hover:border-border transition-all"
								>
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-3 min-w-0">
											<div className="shrink-0 text-muted-foreground">
												{item.status === "COMPLETE"
													? (
															<Check
																size={16}
																strokeWidth={3}
																className="text-green-500"
															/>
														)
													: item.status === "ERROR"
														? (
																<AlertCircle
																	size={16}
																	strokeWidth={2}
																	className="text-red-500"
																/>
															)
														: (
																<Loader2
																	size={16}
																	strokeWidth={2}
																	className="animate-spin text-muted-foreground"
																/>
															)}
											</div>
											<span className="text-xs font-medium truncate">
												{item.name}
											</span>
										</div>
										<span className="text-[9px] font-mono text-muted-foreground shrink-0 uppercase tracking-wider">
											{item.size}
										</span>
									</div>

									{/* Progress Bar */}
									<div className="h-0.5 bg-muted w-full overflow-hidden rounded-sm">
										<div
											className={`h-full transition-all duration-500 ease-out ${
												item.status === "COMPLETE"
													? "bg-green-500"
													: item.status === "ERROR"
														? "bg-red-500"
														: "bg-primary"
											}`}
											style={{ width: `${item.progress}%` }}
										>
										</div>
									</div>

									{item.log && (
										<div
											className={`text-[9px] font-mono leading-relaxed ${
												item.status === "ERROR"
													? "text-red-500"
													: "text-muted-foreground opacity-60"
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
				<div className="p-8 border-t border-border flex justify-end gap-4 shrink-0">
					{isAllComplete
						? (
								<Button
									onClick={onClose}
									variant={hasErrors ? "destructive" : "default"}
									className="flex-1 h-14 text-[11px] uppercase tracking-[0.2em] font-bold rounded-sm gap-2"
								>
									<Check size={16} strokeWidth={2.5} />
									{hasErrors ? "任务存在错误 - 确认" : "上传任务已完成"}
								</Button>
							)
						: (
								<Button
									onClick={onClose}
									variant="ghost"
									className="px-8 h-14 text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-foreground transition-colors"
								>
									取消
								</Button>
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
