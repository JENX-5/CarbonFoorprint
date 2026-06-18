import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/state/AppStateContext.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { SlidersHorizontal } from "@/components/icons/index.jsx";
import { EmptyState } from "@/components/common/EmptyState.jsx";
import { runSimulation } from "@/lib/simulatorEngine.js";
import { SimulatorSliders } from "@/pages/simulator/SimulatorSliders.jsx";
import { SimulatorResults } from "@/pages/simulator/SimulatorResults.jsx";

/**
 * SimulatorPage Component.
 * Allows users to play with "what-if" options (e.g. driving less, increasing renewables)
 * to immediately project their carbon savings visually and compare offsets to trees or km.
 */
export function SimulatorPage() {
  const { state, actions } = useAppState();
  useDocumentTitle("Scenario Simulator");
  const navigate = useNavigate();

  // Initialize sliders based on existing state inputs if they exist
  const [sliders, setSliders] = useState(() => ({
    driveLessPercent: 0,
    renewableTarget: state.inputs?.renewablePercent || 0,
    dietTarget: state.inputs?.dietType || "mediumMeat",
    wasteReducePercent: 0,
  }));

  if (!state.results || !state.inputs) {
    return (
      <div className="simulator-page-empty">
        <PageHeader
          icon={SlidersHorizontal}
          eyebrow="What-if Analysis"
          title="Scenario simulator"
          description="Model changes to your daily lifestyle to project your potential carbon savings."
        />
        <EmptyState />
      </div>
    );
  }

  const handleSliderChange = (field, value) => {
    const nextSliders = { ...sliders, [field]: value };
    setSliders(nextSliders);

    // Dispatch run simulator action to award points if first time
    if (!state.simulatorRun) {
      actions.runSimulator();
    }
  };

  const simResult = runSimulation(
    state.inputs,
    state.results.byCategoryAnnual,
    sliders,
  );

  const handleApplyScenario = () => {
    const newInputs = {
      ...state.inputs,
      commuteKmPerDay: Number(
        (
          state.inputs.commuteKmPerDay *
          (1 - sliders.driveLessPercent / 100)
        ).toFixed(1),
      ),
      renewablePercent: Number(sliders.renewableTarget),
      dietType: sliders.dietTarget,
      wasteKgPerWeek: Number(
        (
          state.inputs.wasteKgPerWeek *
          (1 - sliders.wasteReducePercent / 100)
        ).toFixed(1),
      ),
    };
    const newResults = {
      annual: simResult.newTotal,
      monthly: simResult.newTotal / 12,
      daily: simResult.newTotal / 365,
      byCategoryAnnual: simResult.byCategory,
    };
    actions.applyScenario(newInputs, newResults);
    navigate("/dashboard");
  };

  return (
    <div className="simulator-page">
      <PageHeader
        icon={SlidersHorizontal}
        eyebrow="What-if Analysis"
        title="Scenario simulator"
        description="Model changes to your daily lifestyle to project your potential carbon savings."
      />

      <div className="simulator-layout">
        <SimulatorSliders
          sliders={sliders}
          onSliderChange={handleSliderChange}
        />
        <SimulatorResults
          simResult={simResult}
          onApplyScenario={handleApplyScenario}
        />
      </div>
    </div>
  );
}
