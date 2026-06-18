import { useRef } from "react";
import PropTypes from "prop-types";

/**
 * @typedef {Object} TabItem
 * @property {string} id - Unique identifier for the tab.
 * @property {string} label - Display label text for the tab.
 * @property {React.ComponentType<{ size: number, "aria-hidden"?: string }>} [icon] - Optional icon component.
 */

/**
 * @typedef {Object} TabsProps
 * @property {TabItem[]} tabs - List of tab objects.
 * @property {string} activeId - The currently active tab ID.
 * @property {(id: string) => void} onChange - Callback triggered when tab active state changes.
 * @property {string} [idPrefix="tab"] - Prefix for accessibility HTML id attributes.
 */

/**
 * Implements the WAI-ARIA "tabs" pattern (role=tablist/tab/tabpanel, arrow
 * key navigation, roving tabindex). The original Education Hub tabs were
 * plain buttons with no tab semantics or keyboard support beyond Tab/Enter.
 *
 * @param {TabsProps} props
 */
export function Tabs({ tabs, activeId, onChange, idPrefix = "tab" }) {
  const refs = useRef({});

  const handleKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      onChange(nextTab.id);
      refs.current[nextTab.id]?.focus();
    }
  };

  return (
    <div className="tabs__list" role="tablist" aria-label="Categories">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            role="tab"
            id={`${idPrefix}-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`tab ${selected ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {Icon ? <Icon size={16} aria-hidden="true" /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    }),
  ).isRequired,
  activeId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  idPrefix: PropTypes.string,
};
