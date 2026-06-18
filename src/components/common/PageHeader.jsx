import PropTypes from "prop-types";

/**
 * @typedef {Object} PageHeaderProps
 * @property {React.ComponentType<{ size: number }>} [icon] - Header icon component.
 * @property {string} [eyebrow] - Small text shown above the main title.
 * @property {string} title - Main header title.
 * @property {string} [description] - Subtext or overview paragraph description.
 * @property {React.ReactNode} [actions] - Action buttons or elements displayed on the right.
 */

/**
 * PageHeader component. Renders standard page title sections with icons and layout action sections.
 *
 * @param {PageHeaderProps} props
 */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-header__title">
          {Icon ? (
            <span className="page-header__icon" aria-hidden="true">
              <Icon size={24} />
            </span>
          ) : null}
          {title}
        </h1>
        {description ? (
          <p className="page-header__desc">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}

PageHeader.propTypes = {
  icon: PropTypes.elementType,
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
};
