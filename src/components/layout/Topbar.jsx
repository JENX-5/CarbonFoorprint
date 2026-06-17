import { useLocation } from "react-router-dom";
import { findNavItemByPath } from "../../lib/navigation.js";
import { BrandMark } from "../common/BrandMark.jsx";
import { Menu, Sun, Moon, Monitor, Trophy } from "../icons/index.jsx";
import { useAppState } from "../../state/AppStateContext.jsx";

const THEME_CYCLE = { system: "light", light: "dark", dark: "system" };
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon };
const THEME_LABEL = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function Topbar({ onOpenMobileNav }) {
  const location = useLocation();
  const current = findNavItemByPath(location.pathname);
  const { state, derived, actions } = useAppState();
  const ThemeIcon = THEME_ICON[state.theme] || Monitor;

  return (
    <header className="topbar">
      <button
        type="button"
        className="nav-toggle"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="topbar__brand-mobile">
        <BrandMark size={24} />
        <span className="brand__text">Contour</span>
      </div>

      <div className="topbar__crumb">
        {current ? (
          <>
            <span className="topbar__crumb-label">{current.label}</span>
            <span className="topbar__crumb-desc">{current.description}</span>
          </>
        ) : null}
      </div>

      <div className="topbar__actions">
        {derived.level && (
          <div
            className="topbar__eco-badge"
            title={`Your Eco Score is ${state.ecoScore} (Level: ${derived.level.name})`}
          >
            <Trophy size={14} className="topbar__eco-icon" aria-hidden="true" />
            <span className="topbar__eco-level">{derived.level.name}</span>
            <span className="topbar__eco-points">({state.ecoScore} pts)</span>
          </div>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={() => actions.setTheme(THEME_CYCLE[state.theme] || "system")}
          aria-label={`Theme: ${THEME_LABEL[state.theme]}. Click to change.`}
          title={THEME_LABEL[state.theme]}
        >
          <ThemeIcon size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
