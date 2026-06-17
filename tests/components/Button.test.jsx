import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../../src/components/common/Button.jsx";

// Create a dummy Icon component for testing
const DummyIcon = () => <svg data-testid="dummy-icon" />;

describe("Button component", () => {
  it("renders standard text children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click Me");
  });

  it("applies correct classes based on variant and size", () => {
    const { rerender } = render(
      <Button variant="secondary" size="sm">
        Button
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveClass("button");
    expect(screen.getByRole("button")).toHaveClass("button--secondary");
    expect(screen.getByRole("button")).toHaveClass("button--small");

    rerender(
      <Button variant="danger" size="md">
        Button
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveClass("button--danger");
    expect(screen.getByRole("button")).not.toHaveClass("button--small");
  });

  it("triggers onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders icon on left and right positions", () => {
    const { rerender } = render(
      <Button icon={DummyIcon} iconPosition="left">
        Click
      </Button>,
    );
    expect(screen.getByTestId("dummy-icon")).toBeInTheDocument();

    rerender(
      <Button icon={DummyIcon} iconPosition="right">
        Click
      </Button>,
    );
    expect(screen.getByTestId("dummy-icon")).toBeInTheDocument();
  });
});
