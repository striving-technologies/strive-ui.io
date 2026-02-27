import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Spinner from "./Spinner";

test("should render the spinner with default props", () => {
  const { container } = render(<Spinner />);
  const spinner = container.querySelector(".stc-spinner");
  expect(spinner).toBeInTheDocument();
  expect(spinner).toHaveAttribute("data-size", "medium");
  expect(spinner).toHaveAttribute("data-spin-speed", "5");
});

test("should render with small size", () => {
  const { container } = render(<Spinner size="small" />);
  const spinner = container.querySelector(".stc-spinner");
  expect(spinner).toHaveAttribute("data-size", "small");
  const svg = container.querySelector("svg");
  expect(svg).toHaveClass("stc-icon--small");
});

test("should render with large size", () => {
  const { container } = render(<Spinner size="large" />);
  const spinner = container.querySelector(".stc-spinner");
  expect(spinner).toHaveAttribute("data-size", "large");
  const svg = container.querySelector("svg");
  expect(svg).toHaveClass("stc-icon--large");
});

test("should render with custom spin speed", () => {
  const { container } = render(<Spinner spinSpeed={10} />);
  const spinner = container.querySelector(".stc-spinner");
  expect(spinner).toHaveAttribute("data-spin-speed", "10");
});

test("should render SVG with circle element", () => {
  const { container } = render(<Spinner />);
  const svg = container.querySelector("svg");
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute("viewBox", "0 0 100 100");
  const circle = container.querySelector("circle");
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveAttribute("cx", "50");
  expect(circle).toHaveAttribute("cy", "50");
  expect(circle).toHaveAttribute("r", "40");
});
