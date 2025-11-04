import { useArgs } from "@storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react";

import { Pagination } from "../components/Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    totalItems: {
      description: "Total number of items",
      control: "number",
      defaultValue: 100,
    },
    itemsPerPage: {
      description: "Number of items per page",
      control: "number",
      defaultValue: 10,
    },
    currentPage: {
      description: "Current page",
      control: "number",
      defaultValue: 1,
    },
    size: {
      control: "radio",
      options: ["small", "medium", "large"],
      defaultValue: "medium",
    },
    borderless: {
      control: "boolean",
      defaultValue: false,
    },
    previousButtonContent: {
      control: "text",
      defaultValue: "Previous",
    },
    nextButtonContent: {
      control: "text",
      defaultValue: "Next",
    },
    showTotalPosition: {
      control: "radio",
      options: ["left", "right"],
      defaultValue: "right",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
  },
} as Meta;

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    totalItems: 100,
    itemsPerPage: 10,
    currentPage: 1,
    onChange: (page: number) => console.log(page),
    size: "medium",
  },
  render: function RenderPagination(args) {
    const [, setArgs] = useArgs();

    const onValueChange = (value: number) => {
      // Update the arg in Storybook
      setArgs({ currentPage: value });
    };

    return Pagination({
      ...args,
      onChange: onValueChange,
      showTotalItems: (totalItems: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${totalItems} items`,
    });
  },
} as Story;
