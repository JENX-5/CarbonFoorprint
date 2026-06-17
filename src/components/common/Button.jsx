import { forwardRef } from "react";

/**
 * Shared button primitive. `as="link"` is not needed here — for navigation
 * use react-router's <Link> directly and pass `className="button ..."`.
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    children,
    className = "",
    ...rest
  },
  ref,
) {
  const classes = [
    "button",
    `button--${variant}`,
    size === "sm" ? "button--small" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} {...rest}>
      {Icon && iconPosition === "left" ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {children}
      {Icon && iconPosition === "right" ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
    </button>
  );
});
