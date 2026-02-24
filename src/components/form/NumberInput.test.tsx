import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("renders label and number input", () => {
    render(
      <NumberInput
        id="age"
        name="age"
        label="Age"
        value={undefined}
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
    const input = screen.getByRole("spinbutton", { name: "Age" });
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveValue(null);
  });

  it("displays numeric value", () => {
    render(
      <NumberInput
        id="age"
        name="age"
        label="Age"
        value={25}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("spinbutton")).toHaveValue(25);
  });

  it("passes min and max attributes", () => {
    render(
      <NumberInput
        id="age"
        name="age"
        label="Age"
        value={20}
        onChange={() => {}}
        min={18}
        max={120}
      />
    );
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "18");
    expect(input).toHaveAttribute("max", "120");
  });

  it("shows error when error prop is passed", () => {
    render(
      <NumberInput
        id="age"
        name="age"
        label="Age"
        value={undefined}
        onChange={() => {}}
        error="Age is required"
      />
    );
    expect(screen.getByText("Age is required")).toBeInTheDocument();
  });
});
