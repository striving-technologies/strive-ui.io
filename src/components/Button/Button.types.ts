import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { SpinnerProps } from "../Spinner";
import { DefaultComponentSize } from "../types";

export type ButtonIconPositionType = "left" | "right";
export type ButtonVariantType = "primary" | "dashed" | "link" | "text";
export type ButtonShapeType = "circle" | "pill";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariantType;
  shape?: ButtonShapeType;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPositionType;
  loading?: boolean;
  loadingIcon?: ReactNode;
  loadingIconPosition?: ButtonIconPositionType;
  loadingIconProps?: SpinnerProps;
  size?: DefaultComponentSize;
  href?: string;
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  borderless?: boolean;
}
