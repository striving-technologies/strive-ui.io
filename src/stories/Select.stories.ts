import type { Meta, StoryObj } from "@storybook/react";

import React from "react";
import { Select, SelectProps } from "../components/Select";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    placeholder: {
      control: "text",
      defaultValue: "Select an option",
    },
    value: {
      control: "text",
    },
    options: {
      control: "object",
    },
    className: {
      control: "text",
    },
    size: {
      control: "radio",
      options: ["small", "medium", "large"],
      defaultValue: "medium",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
    },
    loading: {
      control: "boolean",
      defaultValue: false,
    },
    multiSelect: {
      control: "boolean",
      defaultValue: false,
    },
    searchable: {
      control: "boolean",
      defaultValue: true,
    },
    allowClear: {
      control: "boolean",
      defaultValue: true,
    },
  },
} as Meta;

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    onChange: (value: string) => console.log(value),
    size: "medium",
    placeholder: "Select an option",
    options: [
      { value: "1", label: "James Psych Rodday" },
      { value: "2", label: "Jeremaine Cole" },
      { value: "3", label: "Leonardo Dicaprio" },
      { value: "4", label: "Kendrick Lamar" },
      { value: "5", label: "Meryl Streep" },
      { value: "6", label: "Tom Hanks" },
      { value: "7", label: "Denzel Washington" },
      { value: "8", label: "Viola Davis" },
      { value: "9", label: "Robert De Niro" },
      { value: "10", label: "Cate Blanchett" },
      { value: "11", label: "Daniel Day-Lewis" },
    ],
    value: "",
    className: "",
    disabled: false,
    allowClear: true,
  },
  render: function ControlledSelect(args: SelectProps) {
    return React.createElement(
      "div",
      { style: { height: "300px", width: "300px" } },
      Select({
        ...args,
        options: [
          { value: "1", label: "James Psych Rodday" },
          { value: "2", label: "Jeremaine Cole" },
          { value: "3", label: "Leonardo Dicaprio" },
          { value: "4", label: "Kendrick Lamar" },
          { value: "5", label: "Meryl Streep" },
          { value: "6", label: "Tom Hanks" },
          { value: "7", label: "Denzel Washington" },
          { value: "8", label: "Viola Davis" },
          { value: "9", label: "Robert De Niro" },
          { value: "10", label: "Cate Blanchett" },
          { value: "11", label: "Daniel Day-Lewis" },
        ],
      })
    );
  },
} as Story;
