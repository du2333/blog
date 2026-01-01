import { useEffect } from "react";

/**
 * 异步加载字体，不阻塞页面渲染
 * 使用 media="print" 技巧确保字体不会阻塞关键渲染路径
 */
export function useAsyncFonts(fontUrls: Array<string>) {
	useEffect(() => {
		fontUrls.forEach((url) => {
			// 检查是否已经加载过
			const existing = document.querySelector(`link[href="${url}"]`);
			if (existing)
				return;

			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = url;
			link.media = "print"; // 初始标记为 print，不阻塞渲染

			link.onload = () => {
				link.media = "all"; // 加载完成后应用到所有媒体
			};

			// 添加错误处理
			link.onerror = () => {
				console.warn(`Failed to load font: ${url}`);
			};

			document.head.appendChild(link);
		});
	}, [fontUrls]);
}
