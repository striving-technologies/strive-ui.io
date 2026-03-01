const numberOnlyRegex = new RegExp(`[^0-9]*`, "g");

// Format the currency value
export const formatCurrency = (
  value: string,
  decimalSeparator: string,
  thousandSeparator: string,
  decimalPlaces: number
) => {
  const isNegative = value[0] === "-";
  const decimalLast = value[value.length - 1] === decimalSeparator;

  const [integer, decimal] = value.split(decimalSeparator);

  // Add thousand separator
  const formattedInteger = integer
    .replaceAll(numberOnlyRegex, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  const formattedDecimal = decimal
    ? decimal.replaceAll(numberOnlyRegex, "")
    : "";

  // Add decimal separator
  const formattedCurrency = `${isNegative ? "-" : ""}${formattedInteger}${
    isNaN(parseInt(formattedDecimal))
      ? `${decimalLast ? decimalSeparator : ""}`
      : `${decimalSeparator}${formattedDecimal.slice(0, decimalPlaces)}`
  }`;

  return formattedCurrency;
};

// Convert the formatted currency to a number
export const convertToNumber = (
  value: string,
  decimalSeparator: string,
  thousandSeparator: string,
  decimalPlaces: number
) => {
  const isNegative = value[0] === "-";
  // Clean up the currency value
  const [integer, decimal] = value
    .replaceAll(thousandSeparator, "")
    .replaceAll(decimalSeparator, ".")
    .split(".");

  const numberValue = parseFloat(
    `${isNegative ? "-" : ""}${integer.replaceAll(numberOnlyRegex, "")}${
      decimal
        ? `.${decimal.replaceAll(numberOnlyRegex, "").slice(0, decimalPlaces)}`
        : ""
    }`
  );

  return isNaN(numberValue) ? undefined : numberValue;
};
