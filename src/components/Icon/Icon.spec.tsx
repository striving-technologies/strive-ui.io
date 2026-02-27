import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { Icon } from "./Icon";

const mockSvgContent = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';

beforeEach(() => {
  jest.restoreAllMocks();
});

const mockIconLoad = (svgText = mockSvgContent) => {
  jest.mock("./files/close.svg", () => ({ default: "close.svg" }), {
    virtual: true,
  });
  jest.mock("./files/check.svg", () => ({ default: "check.svg" }), {
    virtual: true,
  });

  global.fetch = jest.fn().mockResolvedValue({
    text: () => Promise.resolve(svgText),
  });
};

const mockIconLoadFailure = () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Failed to fetch"));
};

test("should render with medium size class by default", async () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("stc-icon--medium");
  });
});

test("should render with small size class", async () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" size="small" />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveClass("stc-icon--small");
  });
});

test("should render with large size class", async () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" size="large" />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveClass("stc-icon--large");
  });
});

test("should render with custom size class for numeric size", async () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" size={24} />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveClass("stc-icon--custom");
  });
});

test("should apply custom className", async () => {
  mockIconLoad();
  const { container } = render(
    <Icon name="close" className="my-custom-class" />
  );

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveClass("my-custom-class");
  });
});

test("should apply custom color style", async () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" color="red" />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveStyle({ color: "red" });
  });
});

test("should show loading state initially", () => {
  mockIconLoad();
  const { container } = render(<Icon name="close" />);
  const icon = container.querySelector(".stc-icon");
  expect(icon).toBeInTheDocument();
  expect(icon?.innerHTML).toBe("");
});

test("should show error state when icon fails to load", async () => {
  mockIconLoadFailure();
  const { container } = render(<Icon name="close" />);

  await waitFor(() => {
    const icon = container.querySelector(".stc-icon");
    expect(icon).toHaveTextContent("?");
  });
});
