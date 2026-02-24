import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { EmailInput } from "./EmailInput";

describe("EmailInput", () => {
  it("renders label and email input", () => {
    render(
      <EmailInput
        id="email"
        name="email"
        label="Email"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
  });

  it("displays value and calls onChange when typed", async () => {
    const handleChange = vi.fn();
    render(
      <EmailInput
        id="email"
        name="email"
        label="Email"
        value="a@b.co"
        onChange={handleChange}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("a@b.co");
    await userEvent.type(screen.getByRole("textbox"), "m");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error when error prop is passed", () => {
    render(
      <EmailInput
        id="email"
        name="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    );
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });
});
