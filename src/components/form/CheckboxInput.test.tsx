import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CheckboxInput } from "./CheckboxInput";

describe("CheckboxInput", () => {
  it("renders checkbox and label", () => {
    render(
      <CheckboxInput
        id="terms"
        name="terms"
        label="I accept the terms"
        checked={false}
        onChange={() => {}}
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "I accept the terms" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("shows checked state", () => {
    render(
      <CheckboxInput
        id="terms"
        name="terms"
        label="Terms"
        checked={true}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked", async () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="terms"
        name="terms"
        label="Terms"
        checked={false}
        onChange={handleChange}
      />
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error when error prop is passed", () => {
    render(
      <CheckboxInput
        id="terms"
        name="terms"
        label="Terms"
        checked={false}
        onChange={() => {}}
        error="You must accept the terms"
      />
    );
    expect(screen.getByText("You must accept the terms")).toBeInTheDocument();
  });

  it("applies showErrorBelow layout when true", () => {
    const { container } = render(
      <CheckboxInput
        id="terms"
        name="terms"
        label="Terms"
        checked={false}
        onChange={() => {}}
        showErrorBelow
      />
    );
    const wrapper = container.querySelector("div");
    expect(wrapper?.firstElementChild?.className).toContain("items-start");
  });
});
