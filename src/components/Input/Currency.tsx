import { ChangeEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { convertToNumber, formatCurrency } from "./_currency";
import { InputContext } from "./_shared";
import Input from "./Input";
import { CurrencyInputProps, InputType } from "./Input.types";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function CurrencyInput({
  thousandSeparator = ",",
  decimalSeparator = ".",
  decimalPlaces = 2,
  onCurrencyChange,
  value,
  defaultValue,
  ...rest
}: CurrencyInputProps) {
  const [valFormatted, setValFormatted] = useState<string | undefined>(() => {
    const initial = value ?? defaultValue;
    return initial !== undefined
      ? formatCurrency(
          `${initial}`,
          decimalSeparator,
          thousandSeparator,
          decimalPlaces
        )
      : undefined;
  });

  // Sync controlled value prop into internal state
  useEffect(() => {
    if (value === undefined) return;
    const formatted = formatCurrency(
      `${value}`,
      decimalSeparator,
      thousandSeparator,
      decimalPlaces
    );
    setValFormatted((prev) => (prev !== formatted ? formatted : prev));
  }, [value, decimalSeparator, thousandSeparator, decimalPlaces]);

  const currencyRegex = useMemo(
    () =>
      new RegExp(
        `[^0-9\\-${escapeRegex(thousandSeparator)}${escapeRegex(decimalSeparator)}]*`,
        "g"
      ),
    [thousandSeparator, decimalSeparator]
  );

  // Record the position of the cursor before and after the change
  const position = useRef({
    beforeStart: 0,
    beforeEnd: 0,
  });

  // Record the number of separators in the formatted currency
  // to determine the cursor position
  const numberOfSeparators = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Restore cursor position after valFormatted updates
  useLayoutEffect(() => {
    inputRef.current?.setSelectionRange(
      position.current.beforeStart,
      position.current.beforeEnd
    );
  }, [valFormatted]);

  // Handle the currency input
  const handleCurrency = (event: ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const value = event.target.value.replace(currencyRegex, "");

    // Record the cursor position before and after the change
    const beforeStart = event.target.selectionStart;
    const beforeEnd = event.target.selectionEnd;

    // Convert the formatted currency to a number
    const numberValue = convertToNumber(
      value,
      decimalSeparator,
      thousandSeparator,
      decimalPlaces
    );

    // Format the currency value
    const formattedCurrency = value
      ? formatCurrency(
          value,
          decimalSeparator,
          thousandSeparator,
          decimalPlaces
        )
      : "";

    // Determine if the number of separators has increased or decreased
    const newNumOfSeparators = formattedCurrency.split(thousandSeparator).length - 1;

    // Update the cursor position based on the change in separators
    if (newNumOfSeparators > numberOfSeparators.current) {
      position.current = {
        beforeStart: (beforeStart || 0) + 1,
        beforeEnd: (beforeEnd || 0) + 1,
      };
    } else if (newNumOfSeparators < numberOfSeparators.current) {
      position.current = {
        beforeStart: (beforeStart || 0) - 1,
        beforeEnd: (beforeEnd || 0) - 1,
      };
    } else {
      position.current = {
        beforeStart: beforeStart || 0,
        beforeEnd: beforeEnd || 0,
      };
    }

    // Update the number of separators
    numberOfSeparators.current = newNumOfSeparators;

    // Update the formatted currency value
    setValFormatted(formattedCurrency !== "" ? `${formattedCurrency}` : "");

    // Call the onCurrencyChange callback
    onCurrencyChange(numberValue);
  };

  const currencyProps = {
    type: "text" as InputType,
    value: valFormatted,
    onChange: handleCurrency,
    ref: inputRef,
  };

  // Handle the step buttons for currency input
  const handleStep = (direction: "up" | "down") => {
    const input = inputRef.current as HTMLInputElement;

    if (!input) return;

    const step = rest.step || 1;

    // Convert the formatted currency to a number
    let valueAsNumber =
      valFormatted && valFormatted != ""
        ? convertToNumber(
            valFormatted,
            decimalSeparator,
            thousandSeparator,
            decimalPlaces
          ) || 0
        : 0;

    // Increment or decrement the value based on the step
    if (direction === "up") {
      valueAsNumber += +step;
    } else if (direction === "down") {
      valueAsNumber -= +step;
    }

    // Check if the value is within the min and max range
    const minimum =
      rest.min !== undefined ? rest.min : Number.NEGATIVE_INFINITY;
    const maximum =
      rest.max !== undefined ? rest.max : Number.POSITIVE_INFINITY;

    // Return if the value is out of range
    if (valueAsNumber < minimum || valueAsNumber > maximum) return;

    // Update the formatted currency value
    setValFormatted(
      `${formatCurrency(
        `${valueAsNumber}`,
        decimalSeparator,
        thousandSeparator,
        decimalPlaces
      )}`
    );

    // Call the onCurrencyChange callback
    onCurrencyChange(valueAsNumber);
  };

  return (
    <InputContext.Provider value={{ isCurrency: true, emitStep: handleStep, inputRef }}>
      <Input
        {...rest}
        {...currencyProps}
      />
    </InputContext.Provider>
  );
}
