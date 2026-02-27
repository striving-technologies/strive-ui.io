import type { Meta, StoryObj } from "@storybook/react";

import { Search } from "../components/Search";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: "Components/Search",
  component: Search,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "text",
      description: "Input type. This can be:",
      options: ["text", "number", "password", "email", "tel", "url"],
      defaultValue: "text",
    },
    placeholder: {
      control: "text",
      description: "Input placeholder",
      defaultValue: "Placeholder",
    },
    size: {
      control: "radio",
      description: "Input size. This can be:",
      options: ["small", "medium", "large"],
      defaultValue: "medium",
    },
    onSearch: {
      control: "function",
      description: "Function to call when the search button is clicked",
      defaultValue: () => {
        console.log("Search clicked");
      },
    },
    searchButton: {
      control: "text",
      description: "Custom content for search button",
    },
    primary: {
      control: "boolean",
      description: "Primary search button",
    },
    hideDivider: {
      control: "boolean",
      description: "Hide the divider",
    },
  },
} satisfies Meta<typeof Search>;

export default meta;

type Story = StoryObj<typeof Search>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const SearchInput: Story = {
  args: {
    type: "text",
    placeholder: "Search something",
  },
} satisfies Story;
