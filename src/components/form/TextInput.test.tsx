import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders label and input with correct attributes", () => {
    render(
      <TextInput
        id="username"
        name="username"
        label="Username"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveAttribute(
      "name",
      "username"
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("displays value and allows change", async () => {
    const handleChange = vi.fn();
    render(
      <TextInput
        id="username"
        name="username"
        label="Username"
        value="joe"
        onChange={handleChange}
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("joe");
    await userEvent.type(input, "x");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error message when error prop is passed", () => {
    render(
      <TextInput
        id="username"
        name="username"
        label="Username"
        value=""
        onChange={() => {}}
        error="Username is required"
      />
    );
    expect(screen.getByText("Username is required")).toBeInTheDocument();
  });

  it("shows placeholder when provided", () => {
    render(
      <TextInput
        id="username"
        name="username"
        label="Username"
        value=""
        onChange={() => {}}
        placeholder="johndoe"
      />
    );
    expect(screen.getByPlaceholderText("johndoe")).toBeInTheDocument();
  });
});
