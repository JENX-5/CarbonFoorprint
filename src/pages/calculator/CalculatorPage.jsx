import { useNavigate } from "react-router-dom";
import { useAppState } from "@/state/AppStateContext.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { useCalculatorForm } from "@/hooks/useCalculatorForm.js";
import { LiveEstimatePanel } from "@/pages/dashboard/LiveEstimatePanel.jsx";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Calculator } from "@/components/icons/index.jsx";
import { DEFAULT_INPUTS } from "@/lib/constants.js";
import { CalculatorWizard } from "@/components/common/CalculatorWizard.jsx";

/**
 * CalculatorPage Page Component.
 * Renders the multi-step carbon calculator wizard inside the dashboard shell.
 * Leverages the shared CalculatorWizard component to maintain DRY principles.
 */
export function CalculatorPage() {
  const { state, actions } = useAppState();
  useDocumentTitle("Calculator");
  const navigate = useNavigate();

  const wizard = useCalculatorForm(state.inputs || DEFAULT_INPUTS);

  const handleSubmit = (form) => {
    actions.calculate(form);
    navigate("/dashboard");
  };

  return (
    <div className="calculator-page">
      <PageHeader
        icon={Calculator}
        eyebrow="Wizard"
        title="Carbon calculator"
        description="Calculate your annual footprint across transport, household energy, diet, and waste."
      />

      <div className="calculator-layout">
        <div className="calculator-layout__main">
          <div className="chart-panel">
            <CalculatorWizard wizard={wizard} onSubmit={handleSubmit} />
          </div>
        </div>

        <div className="calculator-layout__side">
          <LiveEstimatePanel form={wizard.form} />
        </div>
      </div>
    </div>
  );
}
