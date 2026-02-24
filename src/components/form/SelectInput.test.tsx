import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SelectInput } from "./SelectInput";

const options = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Guest" },
];

describe("SelectInput", () => {
  it("renders label and select with options", () => {
    render(
      <SelectInput
        id="role"
        name="role"
        label="Role"
        value="user"
        onChange={() => {}}
        options={options}
      />
    );
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("user");
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Guest" })).toBeInTheDocument();
  });

  it("calls onChange when selection changes", async () => {
    const handleChange = vi.fn();
    render(
      <SelectInput
        id="role"
        name="role"
        label="Role"
        value="user"
        onChange={handleChange}
        options={options}
      />
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "admin");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error when error prop is passed", () => {
    render(
      <SelectInput
        id="role"
        name="role"
        label="Role"
        value=""
        onChange={() => {}}
        options={options}
        error="Please select a role"
      />
    );
    expect(screen.getByText("Please select a role")).toBeInTheDocument();
  });
});
