import { useEffect } from "react";

/**
 * Applies `theme` ('light' | 'dark' | 'system') to <html data-theme="...">.
 * In 'system' mode it also subscribes to OS theme changes so the app keeps
 * following the system preference live, the same way the original CSS's
 * `prefers-reduced-motion` handling already respected the user's settings.
 */
export function useTheme(theme) {
  useEffect(() => {
    const root = document.documentElement;

    function applySystem() {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", isDark ? "dark" : "light");
    }

    if (theme === "system") {
      applySystem();
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", applySystem);
      return () => mq.removeEventListener("change", applySystem);
    }

    root.setAttribute("data-theme", theme);
    return undefined;
  }, [theme]);
}
