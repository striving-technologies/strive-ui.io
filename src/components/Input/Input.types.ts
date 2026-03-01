import { InputHTMLAttributes, ReactNode } from "react";
import { DefaultComponentSize } from "../types";

export type InputType =
  | "text"
  | "number"
  | "password"
  | "email"
  | "tel"
  | "url"
  | "search";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  type: InputType;
  size?: DefaultComponentSize;
  htmlSize?: number;
  borderless?: boolean;
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  min?: number;
  max?: number;
}

export interface CurrencyInputProps extends Omit<InputProps, "onChange" | "type"> {
  value?: number;
  defaultValue?: number;
  onCurrencyChange: (value: number | undefined) => void;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalPlaces?: number;
}
