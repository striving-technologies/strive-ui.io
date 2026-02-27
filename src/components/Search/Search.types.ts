import { InputProps } from "../Input";

export interface SearchProps extends Omit<InputProps, "borderless"> {
  onSearch: (value: string) => void;
  searchButton?: React.ReactNode;
  primary?: boolean;
  hideDivider?: boolean;
}
