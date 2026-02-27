import { InputHTMLAttributes } from "react";
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
  prefix?: string | JSX.Element;
  suffix?: string | JSX.Element;
  inputRef?: React.RefObject<HTMLInputElement>;
  min?: number;
  max?: number;
}

export interface CurrencyInputProps extends Omit<InputProps, "onChange" | "type"> {
  value?: number;
  onCurrencyChange: (value: number) => void;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalPlaces?: number;
}
