import classNames from "classnames";
import { forwardRef, MouseEvent, ReactNode, useContext, useRef } from "react";
import { InputContext } from "./_shared";
import StepButtons from "./_StepButtons";
import { InputProps } from "./Input.types";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size, className, borderless, htmlSize, prefix, suffix, ...rest }, ref) => {
    const inputContext = useContext(InputContext);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const showStepButtons =
      (rest.step && rest.type === "number") ||
      (inputContext?.isCurrency && rest.step);

    const generatedClasses = classNames({
      "stc-input": true,
      "stc-keyboard-focusable": true,
      [`stc-input-size--${size}`]: size !== "medium" && size,
      "stc-input--borderless": borderless,
      "stc-input--wrapped": prefix || suffix || showStepButtons,
      ...(className && { [className]: true }),
    });

    let InputGenerated: ReactNode = (
      <input
        className={generatedClasses}
        {...(htmlSize ? { size: htmlSize } : {})}
        {...rest}
        ref={inputRef}
      />
    );

    if (prefix || suffix || showStepButtons) {
      const moveFocus = (e: MouseEvent<HTMLDivElement>) => {
        if (window.getSelection()?.toString() !== "") {
          return;
        }

        const target = e.currentTarget as HTMLInputElement;
        const input = target.querySelector("input") as HTMLElement;
        input.focus();
      };

      InputGenerated = (
        <InputContext.Provider
          value={{
            isCurrency: inputContext?.isCurrency ?? false,
            emitStep: inputContext?.emitStep ?? (() => {}),
            inputRef,
          }}
        >
          <div
            className={generatedClasses}
            onClick={moveFocus}
          >
            {prefix && <p className="stc-input__prefix">{prefix}</p>}
            <input
              {...rest}
              ref={inputRef}
            />
            {showStepButtons && <StepButtons />}
            {suffix && <p className="stc-input__suffix">{suffix}</p>}
          </div>
        </InputContext.Provider>
      );
    }

    return InputGenerated;
  }
);

Input.displayName = "Input";

export default Input;
