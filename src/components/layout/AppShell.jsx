import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SkipLink } from "@/components/layout/SkipLink.jsx";
import { Sidebar } from "@/components/layout/Sidebar.jsx";
import { Topbar } from "@/components/layout/Topbar.jsx";

const COLLAPSE_KEY = "contourSidebarCollapsed";

/**
 * AppShell component. The main dashboard layout wrapper containing the SkipLink, Sidebar, Topbar,
 * and the main content router Outlet.
 */
export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileNavOpen(false);
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="app-layout">
      <SkipLink />
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="main-wrapper">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="main-content" className="content-area" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
