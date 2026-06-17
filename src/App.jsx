import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { BrandMark } from "./components/common/BrandMark.jsx";
import { ToastProvider } from "./components/common/Toast.jsx";
import { AppStateProvider, useAppState } from "./state/AppStateContext.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { AppShell } from "./components/layout/AppShell.jsx";
import { DashboardPage } from "./pages/dashboard/DashboardPage.jsx";
import { CalculatorPage } from "./pages/calculator/CalculatorPage.jsx";
import { InsightsPage } from "./pages/insights/InsightsPage.jsx";
import { SimulatorPage } from "./pages/simulator/SimulatorPage.jsx";
import { ProgressPage } from "./pages/progress/ProgressPage.jsx";
import { LearnPage } from "./pages/learn/LearnPage.jsx";
import { WelcomePage } from "./pages/dashboard/WelcomePage.jsx";

function AppContent() {
  const { state } = useAppState();

  // Set theme globally based on the current theme state
  useTheme(state.theme);

  if (!state.results) {
    return <WelcomePage />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastProvider>
      <AppStateProvider>
        {showSplash && (
          <div className="splash-screen">
            <div className="splash-screen__logo">
              <BrandMark size={80} />
            </div>
            <h1 className="splash-screen__title">Contour</h1>
            <p className="splash-screen__subtitle">
              Measuring the shape of your impact
            </p>
          </div>
        )}
        <AppContent />
      </AppStateProvider>
    </ToastProvider>
  );
}

export default App;
