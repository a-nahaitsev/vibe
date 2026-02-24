import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UrlInput } from "./UrlInput";

describe("UrlInput", () => {
  it("renders label and url input", () => {
    render(
      <UrlInput
        id="website"
        name="website"
        label="Website"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Website")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Website" });
    expect(input).toHaveAttribute("type", "url");
  });

  it("displays value and calls onChange", async () => {
    const handleChange = vi.fn();
    render(
      <UrlInput
        id="website"
        name="website"
        label="Website"
        value="https://example.com"
        onChange={handleChange}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("https://example.com");
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "https://new.com");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error when error prop is passed", () => {
    render(
      <UrlInput
        id="website"
        name="website"
        label="Website"
        value=""
        onChange={() => {}}
        error="Invalid URL"
      />
    );
    expect(screen.getByText("Invalid URL")).toBeInTheDocument();
  });
});
