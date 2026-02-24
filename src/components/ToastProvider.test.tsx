import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ToastProvider } from "./ToastProvider";

describe("ToastProvider", () => {
  it("renders without crashing", () => {
    const { container } = render(<ToastProvider />);
    expect(container).toBeInTheDocument();
  });

  it("renders a toast container (react-toastify mounts a div with role or class)", () => {
    const { container } = render(<ToastProvider />);
    // ToastContainer renders a div; we just ensure the component mounts
    expect(container.firstChild).toBeInTheDocument();
  });
});
