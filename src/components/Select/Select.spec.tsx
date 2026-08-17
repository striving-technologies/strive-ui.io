import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "./Select";

const mockOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

// Mock the Icon component to avoid SVG loading issues in tests
jest.mock("../Icon", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ({ name, ...props }: any) => (
    <span
      data-testid={`icon-${name}`}
      {...props}
    />
  ),
}));

describe("Select Component", () => {
  describe("Basic Rendering", () => {
    test("should render select component with placeholder", () => {
      render(
        <Select
          options={mockOptions}
          placeholder="Select an option"
          onChange={jest.fn()}
        />
      );

      expect(screen.getByText("Select an option")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("should render with correct size classes", () => {
      const { container } = render(
        <Select
          options={mockOptions}
          size="large"
          onChange={jest.fn()}
        />
      );

      expect(
        container.querySelector(".stc-select-size--large")
      ).toBeInTheDocument();
    });

    test("should render disabled select", () => {
      render(
        <Select
          options={mockOptions}
          disabled
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-disabled", "true");
    });

    test("should render with custom className", () => {
      const { container } = render(
        <Select
          options={mockOptions}
          className="custom-class"
          onChange={jest.fn()}
        />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Single Select Functionality", () => {
    test("should open dropdown when clicked", async () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeVisible();
      });
    });

    test("should display selected option", () => {
      render(
        <Select
          options={mockOptions}
          value="option1"
          onChange={jest.fn()}
        />
      );

      expect(
        screen.getByText("Option 1", {
          selector: '[class="stc-select__display-text"]',
        })
      ).toBeInTheDocument();
    });

    test("should call onChange when option is selected", async () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          onChange={onChange}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const option = screen.getByText("Option 2");
        fireEvent.click(option);
      });

      expect(onChange).toHaveBeenCalledWith("option2");
    });

    test("should close dropdown after option selection", async () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const option = screen.getByText("Option 1");
        fireEvent.click(option);
      });

      await waitFor(() => {
        const listbox = screen.queryByRole("listbox");
        expect(listbox).toBeNull();
      });
    });
  });

  describe("Multi-Select Functionality", () => {
    test("should render multi-select with multiple values", () => {
      render(
        <Select
          options={mockOptions}
          multiSelect
          value={["option1", "option2"]}
          onChange={jest.fn()}
        />
      );

      expect(
        screen.getByText("Option 1", {
          selector: '[class="stc-select__multi-item"]',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Option 2", {
          selector: '[class="stc-select__multi-item"]',
        })
      ).toBeInTheDocument();
    });

    test("should add option to selection in multi-select", async () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          multiSelect
          value={["option1"]}
          onChange={onChange}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const option = screen.getByText("Option 2");
        fireEvent.click(option);
      });

      expect(onChange).toHaveBeenCalledWith(["option1", "option2"]);
    });

    test("should remove option from selection in multi-select", async () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          multiSelect
          value={["option1", "option2"]}
          onChange={onChange}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const option = screen.getByText("Option 1", {
          selector: '[role="option"]',
        });
        fireEvent.click(option);
      });

      expect(onChange).toHaveBeenCalledWith(["option2"]);
    });

    test("should remove tag when close button is clicked", async () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          multiSelect
          value={["option1", "option2"]}
          onChange={onChange}
        />
      );

      const closeButtons = screen.getAllByTestId("icon-close");
      fireEvent.click(closeButtons[0]);

      expect(onChange).toHaveBeenCalledWith(["option2"]);
    });
  });

  describe("Search Functionality", () => {
    test("should render search input when searchable is true", () => {
      render(
        <Select
          options={mockOptions}
          searchable
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    test("should filter options based on search input", async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          searchable
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "app");

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
      });
    });

    test("should show selected option label in search input for single select", async () => {
      render(
        <Select
          options={mockOptions}
          searchable
          value="option1"
          onChange={jest.fn()}
        />
      );

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toHaveValue("Option 1");
    });

    test("should clear selection when searching in single select", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          searchable
          value="option1"
          onChange={onChange}
        />
      );

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test");

      expect(onChange).toHaveBeenCalledWith("");
    });

    test("should show 'No options available' when no matches found", async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          searchable
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText("No options available")).toBeInTheDocument();
      });
    });
  });

  describe("Clear Functionality", () => {
    test("should show clear button when allowClear is true and has value", () => {
      render(
        <Select
          options={mockOptions}
          allowClear
          value="option1"
          onChange={jest.fn()}
        />
      );

      expect(screen.getByTestId("icon-close")).toBeInTheDocument();
    });

    test("should clear single selection when clear button is clicked", () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          allowClear
          value="option1"
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: /clear selection/i,
      });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith("");
    });

    test("should clear multi-selection when clear button is clicked", () => {
      const onChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          multiSelect
          allowClear
          value={["option1", "option2"]}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: /clear selection/i,
      });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Keyboard Interaction", () => {
    describe("Non-searchable trigger", () => {
      test("should open the dropdown when Enter is pressed on the focused trigger", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{Enter}");

        expect(screen.getByRole("listbox")).toBeVisible();
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });

      test("should open the dropdown when Space is pressed on the focused trigger", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard(" ");

        expect(screen.getByRole("listbox")).toBeVisible();
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });

      test("should open with the first option active when ArrowDown is pressed while closed", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");

        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );
      });

      test("should move the active option with ArrowDown/ArrowUp and clamp at the boundaries", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );

        await user.keyboard("{ArrowDown}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option2")
        );

        await user.keyboard("{ArrowUp}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );

        // Clamp at first — no wrap
        await user.keyboard("{ArrowUp}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );
      });

      test("should jump to the first/last option with Home/End", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");

        await user.keyboard("{End}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("banana")
        );

        await user.keyboard("{Home}");
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );
      });

      test("should select the active option and close on Enter", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={onChange}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith("option2");
        expect(screen.queryByRole("listbox")).toBeNull();
      });

      test("should close on Escape and return focus to the trigger", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("listbox")).toBeVisible();

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(combobox);
      });

      test("should support typeahead to jump to a matching option", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("b");

        expect(screen.getByRole("listbox")).toBeVisible();
        expect(combobox).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("banana")
        );
      });

      test("should close the dropdown when focus leaves the component", async () => {
        const user = userEvent.setup();
        render(
          <div>
            <Select
              options={mockOptions}
              onChange={jest.fn()}
            />
            <button type="button">Outside</button>
          </div>
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{Enter}");
        expect(combobox).toHaveAttribute("aria-expanded", "true");

        await user.tab();

        await waitFor(() => {
          expect(combobox).toHaveAttribute("aria-expanded", "false");
        });
      });
    });

    describe("Multi-select", () => {
      test("should toggle the active option on Enter without closing the dropdown", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            multiSelect
            value={["option1"]}
            onChange={onChange}
          />
        );

        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(["option1", "option2"]);
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });

      test("should allow selecting a second option without closing", async () => {
        const onChange = jest.fn();
        const { rerender } = render(
          <Select
            options={mockOptions}
            multiSelect
            value={["option1"]}
            onChange={onChange}
          />
        );

        const user = userEvent.setup();
        const combobox = screen.getByRole("combobox");
        combobox.focus();
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(["option1", "option2"]);

        rerender(
          <Select
            options={mockOptions}
            multiSelect
            value={["option1", "option2"]}
            onChange={onChange}
          />
        );

        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(["option1", "option2", "option3"]);
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });
    });

    describe("Searchable", () => {
      test("should move the active option among filtered results with ArrowDown/ArrowUp", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            searchable
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        fireEvent.click(combobox);

        const searchInput = screen.getByRole("searchbox");
        await user.type(searchInput, "o");

        await waitFor(() => {
          expect(screen.getByText("Option 1")).toBeInTheDocument();
        });

        expect(searchInput).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );

        await user.keyboard("{ArrowDown}");
        expect(searchInput).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option2")
        );

        await user.keyboard("{ArrowUp}");
        expect(searchInput).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("option1")
        );
      });

      test("should select the active filtered option on Enter", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            searchable
            onChange={onChange}
          />
        );

        const combobox = screen.getByRole("combobox");
        fireEvent.click(combobox);

        const searchInput = screen.getByRole("searchbox");
        await user.type(searchInput, "Apple");
        await user.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith("apple");
      });

      test("should close on Escape and restore the selected option's label", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            searchable
            value="option1"
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        fireEvent.click(combobox);

        const searchInput = screen.getByRole("searchbox");
        await waitFor(() => expect(searchInput).toHaveFocus());

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("listbox")).toBeNull();
        expect(searchInput).toHaveValue("Option 1");
        expect(searchInput).toHaveFocus();
      });

      test("should remove the last tag on Backspace when the search is empty (multi-select)", async () => {
        const onChange = jest.fn();
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            searchable
            multiSelect
            value={["option1", "option2"]}
            onChange={onChange}
          />
        );

        const combobox = screen.getByRole("combobox");
        fireEvent.click(combobox);

        const searchInput = screen.getByRole("searchbox");
        await waitFor(() => expect(searchInput).toHaveFocus());
        await user.keyboard("{Backspace}");

        expect(onChange).toHaveBeenCalledWith(["option1"]);
      });

      test("should filter and reset the active option to the first match while typing", async () => {
        const user = userEvent.setup();
        render(
          <Select
            options={mockOptions}
            searchable
            onChange={jest.fn()}
          />
        );

        const combobox = screen.getByRole("combobox");
        fireEvent.click(combobox);

        const searchInput = screen.getByRole("searchbox");
        await user.type(searchInput, "an");

        await waitFor(() => {
          expect(screen.getByText("Banana")).toBeInTheDocument();
        });

        expect(searchInput).toHaveAttribute(
          "aria-activedescendant",
          expect.stringContaining("banana")
        );

        await user.type(searchInput, "z");

        await waitFor(() => {
          expect(screen.getByText("No options available")).toBeInTheDocument();
        });

        expect(searchInput).not.toHaveAttribute("aria-activedescendant");
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA attributes", () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
    });

    test("should update aria-expanded when dropdown is opened", async () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });
    });

    test("should have proper option roles and attributes", async () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(mockOptions.length);

        options.forEach((option) => {
          expect(option).toHaveAttribute("aria-selected", "false");
        });
      });
    });

    test("should mark selected option as aria-selected", async () => {
      render(
        <Select
          options={mockOptions}
          value="option1"
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const selectedOption = screen.getByText("Option 1", {
          selector: '[role="option"]',
        });
        expect(selectedOption).toHaveAttribute("aria-selected", "true");
      });
    });

    test("should not set aria-activedescendant when closed with nothing selected", () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).not.toHaveAttribute("aria-activedescendant");
    });

    test("should reflect the active (navigated) option, not just the selected one, once opened", async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value="option1"
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      combobox.focus();
      await user.keyboard("{ArrowDown}");
      expect(combobox).toHaveAttribute(
        "aria-activedescendant",
        expect.stringContaining("option1")
      );

      await user.keyboard("{ArrowDown}");
      expect(combobox).toHaveAttribute(
        "aria-activedescendant",
        expect.stringContaining("option2")
      );
    });

    test("should apply the active class to the navigated option independently of selection", async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value="option1"
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      combobox.focus();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      const activeOption = screen.getByText("Option 2", {
        selector: '[role="option"]',
      });
      expect(activeOption).toHaveClass("stc-select__option--active");
      expect(activeOption).not.toHaveClass("stc-select__option--selected");

      const selectedOption = screen.getByText("Option 1", {
        selector: '[role="option"]',
      });
      expect(selectedOption).toHaveClass("stc-select__option--selected");
      expect(selectedOption).not.toHaveClass("stc-select__option--active");
    });

    test("should use a generated id when no id prop is supplied", () => {
      render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox.id).toMatch(/^stc-select-/);
      expect(combobox).toHaveAttribute(
        "aria-controls",
        `listbox-${combobox.id}`
      );
    });

    test("should use the supplied id prop instead of generating one", () => {
      render(
        <Select
          id="custom-select-id"
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("id", "custom-select-id");
      expect(combobox).toHaveAttribute(
        "aria-controls",
        "listbox-custom-select-id"
      );
    });

    test("should keep the generated id stable across re-renders", () => {
      const { rerender } = render(
        <Select
          options={mockOptions}
          onChange={jest.fn()}
        />
      );

      const initialId = screen.getByRole("combobox").id;

      rerender(
        <Select
          options={mockOptions}
          placeholder="changed"
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole("combobox").id).toBe(initialId);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty options array", () => {
      render(
        <Select
          options={[]}
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      expect(screen.getByText("No options available")).toBeInTheDocument();
    });

    test("should handle undefined value gracefully", () => {
      render(
        <Select
          options={mockOptions}
          value={undefined}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("should not open dropdown when disabled", () => {
      render(
        <Select
          options={mockOptions}
          disabled
          onChange={jest.fn()}
        />
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      const listbox = screen.queryByRole("listbox");
      expect(listbox).toBeNull();
    });

    test("should close dropdown when clicking outside", async () => {
      render(
        <div>
          <Select
            options={mockOptions}
            onChange={jest.fn()}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeVisible();
      });

      const outsideElement = screen.getByTestId("outside");
      fireEvent.click(outsideElement);

      await waitFor(() => {
        const listbox = screen.queryByRole("listbox");
        expect(listbox).toBeNull();
      });
    });

    test("should handle options without onChange prop", () => {
      render(<Select options={mockOptions} />);

      const combobox = screen.getByRole("combobox");
      fireEvent.click(combobox);

      expect(screen.getByRole("listbox")).toBeVisible();
    });
  });
});
