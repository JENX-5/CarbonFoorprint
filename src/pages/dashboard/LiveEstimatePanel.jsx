import { useMemo } from "react";
import { computeFootprint } from "@/lib/calculations.js";
import { CarbonData as Data } from "@/lib/data.js";
import { CATEGORY_ICONS } from "@/components/icons/index.jsx";
import { formatNumber } from "@/lib/format.js";

export function LiveEstimatePanel({ form }) {
  const results = useMemo(() => computeFootprint(form), [form]);
  const total = results.annual;

  return (
    <aside className="live-estimate" aria-live="polite">
      <p className="live-estimate__label">Live estimate</p>
      <p className="live-estimate__value">
        {formatNumber(total, 0)}
        <span> kg CO2e / yr</span>
      </p>
      <p className="live-estimate__sub">
        {formatNumber(results.daily, 1)} kg/day &middot;{" "}
        {formatNumber(results.monthly, 0)} kg/month
      </p>

      <ul className="live-estimate__bars">
        {Data.CATEGORY_ORDER.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          const value = results.byCategoryAnnual[key];
          const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
          return (
            <li key={key} className="live-estimate__bar-row">
              <span className="live-estimate__bar-label">
                <Icon size={13} aria-hidden="true" />{" "}
                {Data.CATEGORY_LABELS[key]}
              </span>
              <span className="live-estimate__bar-track">
                <span
                  className="live-estimate__bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="live-estimate__hint">
        Updates instantly as you answer each question — nothing is saved until
        you finish.
      </p>
    </aside>
  );
}
