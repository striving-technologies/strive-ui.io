import classNames from "classnames";
import { Spinner } from "../Spinner";
import { ButtonProps } from "./Button.types";

const Button = ({
  variant = undefined,
  size = "medium",
  shape = undefined,
  disabled = false,
  children,
  className,
  danger = false,
  icon = undefined,
  iconPosition = "left",
  loading = false,
  loadingIconPosition = "left",
  loadingIcon = undefined,
  loadingIconProps,
  onClick,
  href,
  anchorProps,
  borderless,
  ...rest
}: ButtonProps) => {
  const generatedClasses = classNames({
    "stc-button": true,
    "stc-keyboard-focusable": true,
    [`stc-button-var--${variant}`]: variant,
    [`stc-button-size--${size}`]: size !== "medium" && size,
    [`stc-button-shape--${shape}`]: shape,
    [`stc-button--danger`]: danger,
    [`stc-button--loading`]: loading,
    [`stc-button__loader--${loadingIconPosition}`]: loadingIconPosition,
    [`stc-button__icon--${iconPosition}`]: iconPosition,
    "stc-button--borderless": borderless,
    ...(className && { [className]: true }),
  });

  const renderLoadingIcon = () => {
    if (loadingIcon) {
      return (
        <span
          className="stc-button__loader"
          aria-hidden={!loading}
        >
          {loadingIcon}
        </span>
      );
    }

    return (
      <span
        className="stc-button__loader"
        hidden={!loading}
      >
        <Spinner
          size={size}
          {...loadingIconProps}
        />
      </span>
    );
  };

  const showLeftLoader = loadingIconPosition === "left";
  const showRightLoader = loadingIconPosition === "right";
  const showRightIcon = iconPosition === "right" && icon;
  const showLeftIcon = iconPosition === "left" && icon;

  const Icon = icon ? <span className="stc-button__icon">{icon}</span> : null;

  const ButtonGenerated = (
    <button
      className={generatedClasses}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="stc-off-screen">Loading:</span>}
      {showLeftLoader && renderLoadingIcon()}
      {showLeftIcon && Icon}
      {children}
      {showRightIcon && Icon}
      {showRightLoader && renderLoadingIcon()}
    </button>
  );

  if (href && variant === "link") {
    return (
      <a
        href={href}
        {...anchorProps}
      >
        {ButtonGenerated}
      </a>
    );
  }

  return ButtonGenerated;
};

export default Button;
