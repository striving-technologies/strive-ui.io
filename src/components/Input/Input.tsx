import classNames from "classnames";
import { MouseEvent, useContext } from "react";
import { CaretDownIcon, CaretUpIcon } from "../icons";
import { InputContext } from "./_shared";
import { InputProps } from "./Input.types";

const Input = ({
  size,
  className,
  borderless,
  inputRef,
  htmlSize,
  prefix,
  suffix,
  ...rest
}: InputProps) => {
  const inputContext = useContext(InputContext);

  const showStepButtons =
    (rest.step && rest.type === "number") ||
    (inputContext?.isCurrency && rest.step);

  const generatedClasses = classNames({
    "stc-input": true,
    [`stc-input-size--${size}`]: size !== "medium" && size,
    "stc-input--borderless": borderless,
    "stc-input__wrapper": prefix || suffix || showStepButtons,
    ...(className && { [className]: true }),
  });

  let InputGenerated: JSX.Element = (
    <input
      className={generatedClasses}
      {...(htmlSize ? { size: htmlSize } : {})}
      {...rest}
      {...(inputRef ? { ref: inputRef } : {})}
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
      <div
        className={generatedClasses}
        onClick={moveFocus}
      >
        {prefix && <p className="stc-input__prefix">{prefix}</p>}
        <input
          {...rest}
          {...(inputRef ? { ref: inputRef } : {})}
        />
        {showStepButtons && <StepButtons />}
        {suffix && <p className="stc-input__suffix">{suffix}</p>}
      </div>
    );
  }

  return InputGenerated;
};

const StepButtons = () => {
  const inputContext = useContext(InputContext);

  // Handle the increment and decrement buttons
  const onIncrementClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const incrementButton = e.currentTarget as HTMLButtonElement;

    const input = incrementButton
      .closest(".stc-input__wrapper")
      ?.querySelector("input") as HTMLInputElement;

    // Return if the input is not found
    if (!input) return;

    if (!inputContext?.isCurrency) {
      // Increment the value if the input is not a currency input
      input.stepUp();
    } else {
      // Call the step function for currency input
      inputContext.emitStep("up");
    }
  };

  const onDecrementClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const incrementButton = e.currentTarget as HTMLButtonElement;

    const input = incrementButton
      .closest(".stc-input__wrapper")
      ?.querySelector("input") as HTMLInputElement;

    // Return if the input is not found
    if (!input) return;

    if (!inputContext?.isCurrency) {
      // Decrement the value if the input is not a currency input
      input.stepDown();
    } else {
      // Call the step function for currency input
      inputContext.emitStep("down");
    }
  };

  return (
    <div className="stc-input__step-buttons">
      <button
        className="stc-input__step-button"
        onClick={onIncrementClick}
      >
        <CaretUpIcon />
        <span className="stc-off-screen">
          Increment button for number input
        </span>
      </button>
      <button
        className="stc-input__step-button"
        onClick={onDecrementClick}
      >
        <CaretDownIcon />
        <span className="stc-off-screen">
          Decrement button for number input
        </span>
      </button>
    </div>
  );
};

export default Input;
