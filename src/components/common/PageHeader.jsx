export function PageHeader({ icon: Icon, eyebrow, title, description, actions }) {
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
        {description ? <p className="page-header__desc">{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}
