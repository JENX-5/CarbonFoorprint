import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * @typedef {Object} ButtonProps
 * @property {"primary"|"secondary"|"ghost"} [variant="primary"] - Button visual style hierarchy.
 * @property {"sm"|"md"} [size="md"] - Button size dimension.
 * @property {React.ComponentType<{ size: number, "aria-hidden"?: string }>} [icon] - SVG/Lucide icon component.
 * @property {"left"|"right"} [iconPosition="left"] - Icon placement relative to text.
 * @property {React.ReactNode} children - Button text or inner elements.
 * @property {string} [className=""] - Additional CSS classes.
 */

/**
 * Shared button primitive. `as="link"` is not needed here — for navigation
 * use react-router's <Link> directly and pass `className="button ..."`.
 *
 * @type {React.ForwardRefExoticComponent<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>}
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

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "ghost"]),
  size: PropTypes.oneOf(["sm", "md"]),
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  children: PropTypes.node,
  className: PropTypes.string,
};
