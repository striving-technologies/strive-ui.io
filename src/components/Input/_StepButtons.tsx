import { MouseEvent, useContext } from "react";
import { CaretDownIcon, CaretUpIcon } from "../icons";
import { InputContext } from "./_shared";

const StepButtons = () => {
  const inputContext = useContext(InputContext);

  // Handle the increment and decrement buttons
  const onIncrementClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const input = inputContext.inputRef?.current;

    // Return if the input is not found
    if (!input) return;

    if (!inputContext.isCurrency) {
      // Increment the value if the input is not a currency input
      input.stepUp();
    } else {
      // Call the step function for currency input
      inputContext.emitStep("up");
    }
  };

  const onDecrementClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const input = inputContext.inputRef?.current;

    // Return if the input is not found
    if (!input) return;

    if (!inputContext.isCurrency) {
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

export default StepButtons;
