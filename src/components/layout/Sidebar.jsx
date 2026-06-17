import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../lib/navigation.js';
import { BrandMark } from '../common/BrandMark.jsx';
import { ChevronLeft, ChevronRight, Download, RotateCcw } from '../icons/index.jsx';
import { useAppState } from '../../state/AppStateContext.jsx';

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapsed }) {
  const { actions } = useAppState();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    actions.resetAll();
    setConfirmingReset(false);
  };

  return (
    <>
      {isOpen ? <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar__brand">
          <BrandMark size={30} />
          {!collapsed ? <span className="brand__text">Contour</span> : null}
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="icon" aria-hidden="true"><Icon size={18} /></span>
                    {!collapsed ? <span>{item.label}</span> : null}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          {collapsed ? (
            <div className="sidebar__utility-collapsed">
              <button
                type="button"
                className="sidebar__utility-collapsed-btn"
                onClick={actions.exportData}
                title="Export data"
                aria-label="Export data"
              >
                <Download size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`sidebar__utility-collapsed-btn ${confirmingReset ? 'sidebar__utility-collapsed-btn--danger' : ''}`}
                onClick={handleReset}
                onBlur={() => setConfirmingReset(false)}
                title={confirmingReset ? 'Confirm reset?' : 'Reset data'}
                aria-label={confirmingReset ? 'Confirm reset?' : 'Reset data'}
              >
                <RotateCcw size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="sidebar__utility">
              <button type="button" className="sidebar__utility-btn" onClick={actions.exportData}>
                <Download size={15} aria-hidden="true" /> Export data
              </button>
              <button
                type="button"
                className={`sidebar__utility-btn ${confirmingReset ? 'sidebar__utility-btn--danger' : ''}`}
                onClick={handleReset}
                onBlur={() => setConfirmingReset(false)}
              >
                <RotateCcw size={15} aria-hidden="true" /> {confirmingReset ? 'Confirm reset?' : 'Reset data'}
              </button>
            </div>
          )}
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
          </button>
        </div>
      </aside>
    </>
  );
}
