// 立即执行的脚本，在页面渲染前设置主题
(function () {
  // 确保在 DOM 准备好之前执行
  if (typeof document === 'undefined') return;

  const storageKey = 'theme';

  // 读取 localStorage 中的主题
  const getTheme = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
    } catch (e) {
      // localStorage 可能不可用（如隐私模式）
    }
    return null;
  };

  // 获取系统主题
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // 应用主题
  const storedTheme = getTheme();
  let theme;

  if (storedTheme === 'system' || !storedTheme) {
    theme = getSystemTheme();
  } else {
    theme = storedTheme;
  }

  const root = document.documentElement;
  if (root) {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
})();