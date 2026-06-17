import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SkipLink } from './SkipLink.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

const COLLAPSE_KEY = 'contourSidebarCollapsed';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch (e) {
      return false;
    }
  });
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch (e) {
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
