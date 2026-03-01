import "@testing-library/jest-dom";
import { fireEvent, render, screen, act } from "@testing-library/react";
import CurrencyInput from "./Currency";
import Input from "./Input";

test("should render the input with the correctly", () => {
  const onChange = jest.fn();
  render(
    <>
      <Input
        type="text"
        placeholder="Enter something..."
        onChange={onChange}
      />
    </>
  );
  const input = screen.getByRole("textbox");

  expect(input).toBeInTheDocument();

  expect(input).toHaveAttribute("type", "text");

  expect(input).toHaveAttribute("placeholder", "Enter something...");
});

test("should call the onChange function when the input is changed", () => {
  const onChange = jest.fn();
  render(
    <Input
      type="text"
      placeholder="Enter something..."
      onChange={onChange}
    />
  );
  const input = screen.getByRole("textbox");

  expect(input).toBeInTheDocument();

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(input, { target: { value: "test" } });

  expect(onChange).toHaveBeenCalled();
});

test("should render prefix and suffix elements", () => {
  render(
    <Input
      type="text"
      placeholder="Enter something..."
      prefix="$"
      suffix="kg"
    />
  );

  const prefix = screen.getByText("$");
  const suffix = screen.getByText("kg");

  expect(prefix).toBeInTheDocument();
  expect(suffix).toBeInTheDocument();
});

test("should focus the input when the prefix or suffix is clicked", () => {
  render(
    <Input
      type="text"
      placeholder="Enter something..."
      prefix="$"
      suffix="kg"
    />
  );

  const input = screen.getByRole("textbox");
  const prefix = screen.getByText("$");
  const suffix = screen.getByText("kg");

  expect(input).not.toHaveFocus();

  fireEvent.click(prefix);

  expect(input).toHaveFocus();

  fireEvent.click(suffix);

  expect(input).toHaveFocus();
});

// test currency input
test("should render currency format correctly and return number value on change", () => {
  const onChange = jest.fn();

  render(
    <CurrencyInput
      placeholder="Enter something..."
      onCurrencyChange={onChange}
    />
  );

  const input = screen.getByRole("textbox");

  expect(input).toBeInTheDocument();

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(input, { target: { value: "1,000" } });

  expect(onChange).toHaveBeenCalledWith(1000);

  fireEvent.change(input, { target: { value: "1,000,000" } });

  expect(onChange).toHaveBeenCalledWith(1000000);

  fireEvent.change(input, { target: { value: "1,000.00" } });

  expect(onChange).toHaveBeenCalledWith(1000);

  fireEvent.change(input, { target: { value: "1,000.23" } });

  expect(onChange).toHaveBeenCalledWith(1000.23);

  fireEvent.change(input, { target: { value: "1,000,000.23" } });

  expect(onChange).toHaveBeenCalledWith(1000000.23);
});

// test step button on input
test("should render step buttons and update input value when clicked", () => {
  render(
    <Input
      type="number"
      placeholder="Enter something..."
      step={5}
    />
  );

  const input = screen.getByRole("spinbutton");
  const buttons = screen.getAllByRole("button");

  expect(buttons.length).toBe(2);

  const [stepUp, stepDown] = buttons;

  fireEvent.click(stepUp);

  expect(input).toHaveValue(5);

  fireEvent.click(stepUp);

  expect(input).toHaveValue(10);

  fireEvent.click(stepDown);

  expect(input).toHaveValue(5);

  fireEvent.click(stepDown);

  expect(input).toHaveValue(0);
});

// test step button on currency input
test("should update currency input value when step buttons are clicked", () => {
  const onCurrencyChange = jest.fn();

  render(
    <CurrencyInput
      placeholder="Enter something..."
      step={5}
      onCurrencyChange={onCurrencyChange}
    />
  );

  const input = screen.getByRole("textbox");
  const buttons = screen.getAllByRole("button");

  expect(buttons.length).toBe(2);

  const [stepUp, stepDown] = buttons;

  fireEvent.click(stepUp);

  expect(input).toHaveValue("5");
  expect(onCurrencyChange).toHaveBeenCalledWith(5);

  fireEvent.click(stepUp);

  expect(input).toHaveValue("10");
  expect(onCurrencyChange).toHaveBeenCalledWith(10);

  fireEvent.click(stepDown);

  expect(input).toHaveValue("5");
  expect(onCurrencyChange).toHaveBeenCalledWith(5);

  fireEvent.click(stepDown);

  expect(input).toHaveValue("0");
  expect(onCurrencyChange).toHaveBeenCalledWith(0);

  fireEvent.click(stepDown);

  expect(input).toHaveValue("-5");
  expect(onCurrencyChange).toHaveBeenCalledWith(-5);
});

// test min and max values for number input
test("should not allow input value to pass min and max values when stepped", () => {
  const onCurrencyChange = jest.fn();

  render(
    <CurrencyInput
      placeholder="Enter something..."
      step={1}
      min={0}
      max={10}
      onCurrencyChange={onCurrencyChange}
    />
  );

  const input = screen.getByRole("textbox");
  const buttons = screen.getAllByRole("button");

  const [stepUp, stepDown] = buttons;

  // increment pass max value using loop
  for (let i = 0; i < 20; i++) {
    fireEvent.click(stepUp);
  }

  expect(input).toHaveValue("10");

  // decrement pass min value using loop
  for (let i = 0; i < 20; i++) {
    fireEvent.click(stepDown);
  }

  expect(input).toHaveValue("0");
});

// test step buttons don't show when step property is not provided
test("should not render step buttons when step property is not provided", () => {
  const { rerender } = render(
    <Input
      type="number"
      placeholder="Enter something..."
    />
  );

  const input = screen.getByRole("spinbutton");
  const buttons = screen.queryAllByRole("button");

  expect(input).toBeInTheDocument();
  expect(buttons.length).toBe(0);

  rerender(
    <Input
      type="number"
      step={5}
      placeholder="Enter something..."
    />
  );

  const updatedInput = screen.getByRole("spinbutton");
  const updatedButtons = screen.getAllByRole("button");

  expect(updatedInput).toBeInTheDocument();
  expect(updatedButtons.length).toBe(2);

  // test for currency input
  const onCurrencyChange = jest.fn();

  rerender(
    <CurrencyInput
      placeholder="Enter something..."
      onCurrencyChange={onCurrencyChange}
    />
  );

  const currencyInput = screen.getByRole("textbox");
  const currencyButtons = screen.queryAllByRole("button");

  expect(currencyInput).toBeInTheDocument();
  expect(currencyButtons.length).toBe(0);

  rerender(
    <CurrencyInput
      placeholder="Enter something..."
      step={5}
      onCurrencyChange={onCurrencyChange}
    />
  );

  const updatedCurrencyInput = screen.getByRole("textbox");
  const updatedCurrencyButtons = screen.getAllByRole("button");

  expect(updatedCurrencyInput).toBeInTheDocument();
  expect(updatedCurrencyButtons.length).toBe(2);
});

// CurrencyInput locale and controlled behavior tests
describe("CurrencyInput locale and controlled behavior", () => {
  test("should format correctly with European separators (thousandSeparator='.', decimalSeparator=',')", () => {
    const onChange = jest.fn();

    render(
      <CurrencyInput
        placeholder="Enter amount..."
        thousandSeparator="."
        decimalSeparator=","
        onCurrencyChange={onChange}
      />
    );

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "1.000" } });

    expect(input).toHaveValue("1.000");
    expect(onChange).toHaveBeenCalledWith(1000);

    fireEvent.change(input, { target: { value: "1.000,50" } });

    expect(input).toHaveValue("1.000,50");
    expect(onChange).toHaveBeenCalledWith(1000.5);
  });

  test("should sync controlled value when prop changes", () => {
    const onChange = jest.fn();

    const { rerender } = render(
      <CurrencyInput
        placeholder="Enter amount..."
        value={100}
        onCurrencyChange={onChange}
      />
    );

    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("100");

    rerender(
      <CurrencyInput
        placeholder="Enter amount..."
        value={200}
        onCurrencyChange={onChange}
      />
    );

    expect(input).toHaveValue("200");

    rerender(
      <CurrencyInput
        placeholder="Enter amount..."
        value={1500}
        onCurrencyChange={onChange}
      />
    );

    expect(input).toHaveValue("1,500");
  });

  test("should report undefined when input is cleared", () => {
    const onChange = jest.fn();

    render(
      <CurrencyInput
        placeholder="Enter amount..."
        onCurrencyChange={onChange}
      />
    );

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "1,000" } });

    expect(onChange).toHaveBeenCalledWith(1000);

    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("should format step buttons correctly with European separators", () => {
    const onChange = jest.fn();

    render(
      <CurrencyInput
        placeholder="Enter amount..."
        thousandSeparator="."
        decimalSeparator=","
        step={500}
        onCurrencyChange={onChange}
      />
    );

    const input = screen.getByRole("textbox");
    const buttons = screen.getAllByRole("button");
    const [stepUp] = buttons;

    fireEvent.click(stepUp);

    expect(input).toHaveValue("500");
    expect(onChange).toHaveBeenCalledWith(500);

    fireEvent.click(stepUp);

    expect(input).toHaveValue("1.000");
    expect(onChange).toHaveBeenCalledWith(1000);

    fireEvent.click(stepUp);

    expect(input).toHaveValue("1.500");
    expect(onChange).toHaveBeenCalledWith(1500);
  });
});
