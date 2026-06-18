import { useState } from "react";
import { useAppState } from "@/state/AppStateContext.jsx";
import { BrandMark } from "@/components/common/BrandMark.jsx";
import {
  ArrowRight,
  Calculator,
  Sparkles,
  SlidersHorizontal,
  Trophy,
  Upload,
} from "@/components/icons/index.jsx";
import { useCalculatorForm } from "@/hooks/useCalculatorForm.js";
import { LiveEstimatePanel } from "@/pages/dashboard/LiveEstimatePanel.jsx";
import { DEFAULT_INPUTS } from "@/lib/constants.js";
import { CalculatorWizard } from "@/components/common/CalculatorWizard.jsx";

/**
 * WelcomePage Component.
 * The landing onboarding gate shown to users when no carbon footprint results
 * exist in storage. Offers quick-start demo loads, file state imports, or
 * launches the interactive multi-step onboarding wizard.
 */
export function WelcomePage() {
  const { actions } = useAppState();
  const [isCalculating, setIsCalculating] = useState(false);

  const wizard = useCalculatorForm(DEFAULT_INPUTS);

  const handleStartCalculator = () => {
    setIsCalculating(true);
  };

  const handleExploreDemo = () => {
    const demoInputs = {
      commuteKmPerDay: 35,
      transitKmPerWeek: 80,
      flightsShortHaulPerYear: 2,
      flightsLongHaulPerYear: 1,
      electricityKwhPerMonth: 320,
      renewablePercent: 25,
      wasteKgPerWeek: 12,
      recycledPercent: 40,
      waterLitersPerDay: 180,
      vehicleType: "hybridCar",
      dietType: "lowMeat",
      waterHeatedMostly: true,
    };
    actions.calculate(demoInputs);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Security: Check file size limit (2MB)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Failed to import data: file size exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        actions.importData(parsed);
      } catch {
        alert("Failed to import data: invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (form) => {
    actions.calculate(form);
  };

  return (
    <div className="welcome-page">
      <div className="welcome-page__container">
        {/* Left Side: Onboarding/Wizard */}
        <div className="welcome-page__left">
          {!isCalculating ? (
            <div className="welcome-page__intro animate-fade-in">
              <div className="welcome-page__brand">
                <BrandMark size={48} />
                <span className="welcome-page__brand-title">Contour</span>
              </div>

              <h1 className="welcome-page__heading">
                See the shape of your impact.
              </h1>
              <p className="welcome-page__lede">
                Contour turns your everyday transport, energy, diet, waste, and
                water habits into one clear number — then shows you, in plain
                terms, what actually moves it.
              </p>

              <div className="welcome-page__feature-grid">
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon">
                    <Calculator size={20} />
                  </div>
                  <h4>Carbon Calculator</h4>
                  <p>
                    Answer a few questions about your travel, energy, diet, and
                    waste.
                  </p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon">
                    <Sparkles size={20} />
                  </div>
                  <h4>Smart Insights</h4>
                  <p>
                    A transparent rules engine highlights your biggest sources
                    of emissions.
                  </p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon">
                    <SlidersHorizontal size={20} />
                  </div>
                  <h4>Simulator</h4>
                  <p>
                    Drag simple sliders to see the impact of a change before you
                    commit to it.
                  </p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon">
                    <Trophy size={20} />
                  </div>
                  <h4>Track Progress</h4>
                  <p>
                    Earn eco points, keep a streak, and unlock badges as you
                    improve.
                  </p>
                </div>
              </div>

              <div className="welcome-page__actions">
                <button
                  className="button button--primary button--large"
                  onClick={handleStartCalculator}
                >
                  Begin Calculator <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button
                  className="button button--secondary button--large"
                  onClick={handleExploreDemo}
                >
                  Explore with Demo Data
                </button>

                <label className="welcome-page__import-btn">
                  <Upload size={16} /> Import Saved Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="welcome-page__calculator animate-fade-in">
              <CalculatorWizard
                wizard={wizard}
                onSubmit={handleSubmit}
                onBackToIntro={() => setIsCalculating(false)}
                showBrandHeader={true}
              />
            </div>
          )}
        </div>

        {/* Right Side: Interactive contour wave background / LiveEstimatePanel */}
        <div className="welcome-page__right">
          {!isCalculating ? (
            <div className="welcome-page__visual">
              <div className="welcome-page__visual-contours">
                <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
                  <path
                    className="contour-line animate-wave-1"
                    d="M-50 420 C 100 360, 200 480, 320 410 C 440 340, 520 430, 650 380"
                  />
                  <path
                    className="contour-line animate-wave-2"
                    d="M-50 470 C 120 400, 220 520, 340 450 C 460 380, 540 470, 650 420"
                  />
                  <path
                    className="contour-line animate-wave-3"
                    d="M-50 520 C 140 450, 240 560, 360 500 C 480 440, 560 510, 650 470"
                  />
                  <path
                    className="contour-line animate-wave-4"
                    d="M-50 320 C 90 270, 180 360, 300 310 C 420 260, 500 330, 650 290"
                  />
                </svg>
              </div>
              <div className="welcome-page__glass-card">
                <h3>Contour</h3>
                <p>Measuring the shape of your impact</p>
                <div className="welcome-page__glass-indicator">
                  <span className="pulse-dot"></span> Local & Private
                </div>
              </div>
            </div>
          ) : (
            <div className="welcome-page__live-side animate-fade-in">
              <div className="welcome-page__live-wrapper">
                <LiveEstimatePanel form={wizard.form} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
