import { CarbonData as Data } from "../../lib/data.js";
import { getTodayKey } from "../../lib/format.js";
import { useAppState } from "../../state/AppStateContext.jsx";
import { Check } from "../icons/index.jsx";
import { Link } from "react-router-dom";

export function DailyChecklistCard({ compact = false }) {
  const { state, actions } = useAppState();
  const todayKey = getTodayKey();
  const completedMap =
    state.checklist.date === todayKey ? state.checklist.completed : {};
  const completedCount = Data.CHECKLIST_ITEMS.filter(
    (item) => completedMap[item.id],
  ).length;
  const total = Data.CHECKLIST_ITEMS.length;
  const items = compact
    ? Data.CHECKLIST_ITEMS.slice(0, 3)
    : Data.CHECKLIST_ITEMS;

  return (
    <div className="panel checklist-card">
      <div className="checklist-card__header">
        <h3>Today&rsquo;s checklist</h3>
        <span className="checklist-card__count">
          {completedCount}/{total}
        </span>
      </div>
      {!compact ? (
        <p className="panel__intro">
          Small actions, tracked daily. Each completed item earns points once
          per day.
        </p>
      ) : null}
      <ul className="checklist">
        {items.map((item) => {
          const checked = !!completedMap[item.id];
          return (
            <li key={item.id} className="checklist__item">
              <label className="checklist__label">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => actions.toggleChecklistItem(item.id)}
                />
                <span className="checklist__check" aria-hidden="true">
                  {checked ? <Check size={13} /> : null}
                </span>
                {item.label}
              </label>
              <span className="checklist__points">+{item.points}</span>
            </li>
          );
        })}
      </ul>
      {compact && total > items.length ? (
        <Link to="/progress" className="checklist-card__more">
          View all {total} items →
        </Link>
      ) : null}
    </div>
  );
}
