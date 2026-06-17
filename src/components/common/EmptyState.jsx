import { Link } from 'react-router-dom';
import { Calculator } from '../icons/index.jsx';

/**
 * Consistent "you need to calculate your footprint first" state. Treats the
 * empty screen as an invitation to act (a clear CTA), rather than a dead
 * end — the original app just printed a sentence with nowhere to go.
 */
export function EmptyState({
  icon: Icon = Calculator,
  title = 'Calculate your footprint to unlock this view',
  description = 'Answer a few questions about your transport, energy, diet, waste, and water use — it takes about two minutes.',
  actionLabel = 'Start the calculator',
  actionTo = '/calculator'
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={28} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {actionTo ? (
        <Link to={actionTo} className="button button--primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
