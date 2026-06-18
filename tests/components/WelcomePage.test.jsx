import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WelcomePage } from "@/pages/dashboard/WelcomePage.jsx";
import { useAppState } from "@/state/AppStateContext.jsx";

// Mock the useAppState hook
vi.mock("@/state/AppStateContext.jsx", () => ({
  useAppState: vi.fn(),
}));

describe("WelcomePage Integration Test", () => {
  let mockActions;

  beforeEach(() => {
    mockActions = {
      calculate: vi.fn(),
      importData: vi.fn(),
    };
    useAppState.mockReturnValue({
      actions: mockActions,
    });
  });

  it("renders the onboarding landing page by default", () => {
    render(<WelcomePage />);

    expect(screen.getAllByText("Contour").length).toBeGreaterThan(0);
    expect(
      screen.getByText("See the shape of your impact."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Begin Calculator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Explore with Demo Data/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Import Saved Data")).toBeInTheDocument();
  });

  it("triggers demo data actions when Explore with Demo Data is clicked", () => {
    render(<WelcomePage />);

    const demoButton = screen.getByRole("button", {
      name: /Explore with Demo Data/i,
    });
    fireEvent.click(demoButton);

    expect(mockActions.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        commuteKmPerDay: 35,
        vehicleType: "hybridCar",
        dietType: "lowMeat",
      }),
    );
  });

  it("launches the calculator wizard when Begin Calculator is clicked and allows backing out", () => {
    render(<WelcomePage />);

    const startButton = screen.getByRole("button", {
      name: /Begin Calculator/i,
    });
    fireEvent.click(startButton);

    // Should render the first step of the wizard
    expect(screen.getByText("Contour Wizard")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your daily commute and any flights you take add up over a year.",
      ),
    ).toBeInTheDocument();

    // Click Back to Intro
    const backButton = screen.getByRole("button", { name: /Back to Intro/i });
    fireEvent.click(backButton);

    // Should be back on the intro screen
    expect(
      screen.getByText("See the shape of your impact."),
    ).toBeInTheDocument();
  });

  it("allows navigating through wizard steps, fills inputs, and submits successfully", async () => {
    render(<WelcomePage />);

    // Start wizard
    fireEvent.click(screen.getByRole("button", { name: /Begin Calculator/i }));

    // Step 1: Transportation
    // By default, transport fields are pre-filled with DEFAULT_INPUTS (commuteKmPerDay: 15)
    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 2: Energy
    expect(
      screen.getByText(
        "Grid electricity use, and how much of it already comes from renewables.",
      ),
    ).toBeInTheDocument();

    // Change electricity usage
    const electricityInput = screen.getByLabelText(
      /Electricity used per month/i,
    );
    fireEvent.change(electricityInput, { target: { value: "300" } });

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 3: Diet
    expect(
      screen.getByText(
        "Overall dietary pattern has one of the largest effects on day-to-day emissions.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 4: Waste & Water
    expect(
      screen.getByText(
        "Household waste, how much of it is diverted from landfill, and water use.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 5: Review
    expect(
      screen.getByText("Check your answers, then calculate your footprint."),
    ).toBeInTheDocument();

    // Click Calculate Footprint
    const submitButton = screen.getByRole("button", {
      name: /Calculate Footprint/i,
    });
    fireEvent.click(submitButton);

    // Verify calculation was triggered with updated values
    expect(mockActions.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        electricityKwhPerMonth: 300,
      }),
    );
  });
});
