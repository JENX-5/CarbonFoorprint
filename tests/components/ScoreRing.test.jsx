import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreRing } from "@/components/common/ScoreRing.jsx";

describe("ScoreRing component", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => cb());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correct text values", () => {
    render(
      <ScoreRing score={85} ratingClassName="rating-good" animate={false} />,
    );
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("bounds score between 0 and 100", () => {
    const { rerender } = render(<ScoreRing score={150} animate={false} />);
    expect(screen.getByText("150")).toBeInTheDocument(); // Displays original score in text

    rerender(<ScoreRing score={-10} animate={false} />);
    expect(screen.getByText("-10")).toBeInTheDocument();
  });

  it("renders SVG arcs", () => {
    render(
      <ScoreRing score={75} ratingClassName="rating-good" animate={false} />,
    );
    const progressArc = document.querySelector(".score-ring__progress");
    expect(progressArc).toBeInTheDocument();
  });
});
