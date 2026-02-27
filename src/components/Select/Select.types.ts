import { DefaultComponentSize } from "../types";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
  size?: DefaultComponentSize;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  allowClear?: boolean;
}
