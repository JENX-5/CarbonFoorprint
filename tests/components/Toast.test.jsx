import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../../src/components/common/Toast.jsx";

function ToastTestTrigger() {
  const { addToast } = useToast();
  return (
    <button
      onClick={() =>
        addToast({
          title: "Test Alert",
          description: "Testing details",
          variant: "error",
          duration: 100,
        })
      }
    >
      Trigger
    </button>
  );
}

describe("Toast notification system", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("throws error when hook used outside provider", () => {
    const Component = () => {
      useToast();
      return null;
    };
    // Silence React's console.error for expected context error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Component />)).toThrow(
      /must be used within a ToastProvider/,
    );
    spy.mockRestore();
  });

  it("renders and dismisses toast correctly", () => {
    render(
      <ToastProvider>
        <ToastTestTrigger />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: "Trigger" });
    fireEvent.click(button);

    // Assert toast shows up
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
    expect(screen.getByText("Testing details")).toBeInTheDocument();

    // Fast-forward timers to check auto-removal
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });

  it("can be manually closed", () => {
    render(
      <ToastProvider>
        <ToastTestTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.getByText("Test Alert")).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByRole("button", {
      name: "Dismiss notification",
    });
    fireEvent.click(closeBtn);

    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });
});
