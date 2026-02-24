import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextareaInput } from "./TextareaInput";

describe("TextareaInput", () => {
  it("renders label and textarea", () => {
    render(
      <TextareaInput
        id="bio"
        name="bio"
        label="Bio"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("displays value and calls onChange", async () => {
    const handleChange = vi.fn();
    render(
      <TextareaInput
        id="bio"
        name="bio"
        label="Bio"
        value="Hello"
        onChange={handleChange}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("Hello");
    await userEvent.type(screen.getByRole("textbox"), " world");
    expect(handleChange).toHaveBeenCalled();
  });

  it("uses custom rows when provided", () => {
    render(
      <TextareaInput
        id="bio"
        name="bio"
        label="Bio"
        value=""
        onChange={() => {}}
        rows={6}
      />
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "6");
  });

  it("shows error when error prop is passed", () => {
    render(
      <TextareaInput
        id="bio"
        name="bio"
        label="Bio"
        value=""
        onChange={() => {}}
        error="Bio is required"
      />
    );
    expect(screen.getByText("Bio is required")).toBeInTheDocument();
  });
});
