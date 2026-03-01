import { createContext, RefObject } from "react";

export const InputContext = createContext<{
  isCurrency: boolean;
  emitStep: (direction: "up" | "down") => void;
  inputRef: RefObject<HTMLInputElement> | null;
}>({
  isCurrency: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitStep: (direction: "up" | "down") => {},
  inputRef: null,
});
