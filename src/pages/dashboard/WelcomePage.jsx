import React, { useState } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { ArrowRight, Calculator, Sparkles, SlidersHorizontal, Trophy, Upload, ChevronLeft, ChevronRight, Check } from '../../components/icons/index.jsx';
import { CALCULATOR_STEPS } from '../calculator/calculatorSteps.js';
import { Stepper } from '../../components/common/Stepper.jsx';
import { LiveEstimatePanel } from './LiveEstimatePanel.jsx';
import { FieldRow } from '../../components/common/FieldRow.jsx';
import { Button } from '../../components/common/Button.jsx';
import { CarbonData as Data } from '../../lib/data.js';

export function WelcomePage() {
  const { actions } = useAppState();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [furthestAllowedIndex, setFurthestAllowedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const defaultInputs = {
    commuteKmPerDay: 20,
    transitKmPerWeek: 0,
    flightsShortHaulPerYear: 0,
    flightsLongHaulPerYear: 0,
    electricityKwhPerMonth: 250,
    renewablePercent: 0,
    wasteKgPerWeek: 8,
    recycledPercent: 30,
    waterLitersPerDay: 150,
    vehicleType: 'petrolCar',
    dietType: 'mediumMeat',
    waterHeatedMostly: false
  };

  const [form, setForm] = useState(defaultInputs);

  const steps = CALCULATOR_STEPS;
  const currentStep = steps[currentIndex];

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
      vehicleType: 'hybridCar',
      dietType: 'lowMeat',
      waterHeatedMostly: true
    };
    actions.calculate(demoInputs);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        actions.importData(parsed);
      } catch (err) {
        alert("Failed to import data: invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    
    const updatedForm = { ...form, [name]: val };
    setForm(updatedForm);

    const fieldConf = currentStep.fields?.find(f => f.name === name);
    if (fieldConf && type === 'number') {
      if (val < fieldConf.min || val > fieldConf.max) {
        setErrors(prev => ({
          ...prev,
          [name]: `Must be between ${fieldConf.min} and ${fieldConf.max} ${fieldConf.unit || ''}`
        }));
      } else {
        setErrors(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  };

  const isStepValid = (index) => {
    const step = steps[index];
    if (!step.fields) return true;

    for (const field of step.fields) {
      if (field.type === 'number') {
        const val = form[field.name];
        if (typeof val !== 'number' || isNaN(val) || val < field.min || val > field.max) {
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid(currentIndex)) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setFurthestAllowedIndex(prev => Math.max(prev, nextIndex));
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleStepClick = (index) => {
    if (index <= furthestAllowedIndex) {
      setCurrentIndex(index);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let allValid = true;
    for (let i = 0; i < steps.length - 1; i++) {
      if (!isStepValid(i)) {
        allValid = false;
        setCurrentIndex(i);
        break;
      }
    }

    if (allValid) {
      actions.calculate(form);
    }
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
              
              <h1 className="welcome-page__heading">See the shape of your impact.</h1>
              <p className="welcome-page__lede">
                Contour turns your everyday transport, energy, diet, waste, and water habits into one clear number — then shows you, in plain terms, what actually moves it.
              </p>

              <div className="welcome-page__feature-grid">
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon"><Calculator size={20} /></div>
                  <h4>Carbon Calculator</h4>
                  <p>Answer a few questions about your travel, energy, diet, and waste.</p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon"><Sparkles size={20} /></div>
                  <h4>Smart Insights</h4>
                  <p>A transparent rules engine highlights your biggest sources of emissions.</p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon"><SlidersHorizontal size={20} /></div>
                  <h4>Simulator</h4>
                  <p>Drag simple sliders to see the impact of a change before you commit to it.</p>
                </div>
                <div className="welcome-page__feature-card">
                  <div className="welcome-page__feature-icon"><Trophy size={20} /></div>
                  <h4>Track Progress</h4>
                  <p>Earn eco points, keep a streak, and unlock badges as you improve.</p>
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
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          ) : (
            <div className="welcome-page__calculator animate-fade-in">
              <div className="welcome-page__calc-header">
                <button 
                  className="welcome-page__back-link" 
                  onClick={() => setIsCalculating(false)}
                >
                  <ChevronLeft size={16} /> Back to Intro
                </button>
                <div className="welcome-page__calc-brand">
                  <BrandMark size={32} />
                  <span>Contour Wizard</span>
                </div>
              </div>

              <Stepper
                steps={steps}
                currentIndex={currentIndex}
                furthestAllowedIndex={furthestAllowedIndex}
                onStepClick={handleStepClick}
              />

              <div className="welcome-page__calc-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {currentStep.icon && <currentStep.icon size={22} className="contour-ring--3" style={{ color: 'var(--color-canopy)' }} />}
                  <h3 style={{ margin: 0 }}>{currentStep.label}</h3>
                </div>
                <p className="hero__lede" style={{ marginBottom: '2rem', fontSize: '0.95rem', color: 'var(--color-slate-400)' }}>{currentStep.intro}</p>

                {currentStep.id !== 'review' ? (
                  <div className="calc-fields">
                    {currentStep.fields?.map((field) => (
                      <FieldRow
                        key={field.name}
                        field={field}
                        value={form[field.name]}
                        error={errors[field.name]}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="review-summary">
                    <style>{`
                      .review-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 2rem;
                      }
                      .review-table th, .review-table td {
                        padding: 0.75rem 1rem;
                        text-align: left;
                        border-bottom: 1px solid var(--color-line);
                      }
                      .review-table th {
                        background: var(--color-mist);
                        font-family: var(--font-display);
                        font-weight: 700;
                      }
                      .review-category {
                        font-weight: 700;
                        color: var(--color-canopy);
                      }
                    `}</style>
                    <table className="review-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Input Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="review-category">Transportation</td>
                          <td>
                            Vehicle: {Data.VEHICLE_LABELS[form.vehicleType]} <br />
                            Commute: {form.commuteKmPerDay} km / day <br />
                            Transit: {form.transitKmPerWeek} km / week <br />
                            Flights: {form.flightsShortHaulPerYear} short / yr, {form.flightsLongHaulPerYear} long / yr
                          </td>
                        </tr>
                        <tr>
                          <td className="review-category">Electricity</td>
                          <td>
                            Usage: {form.electricityKwhPerMonth} kWh / month <br />
                            Renewable: {form.renewablePercent}%
                          </td>
                        </tr>
                        <tr>
                          <td className="review-category">Diet</td>
                          <td>Diet: {Data.DIET_LABELS[form.dietType]}</td>
                        </tr>
                        <tr>
                          <td className="review-category">Waste & Water</td>
                          <td>
                            Waste: {form.wasteKgPerWeek} kg / week ({form.recycledPercent}% recycled) <br />
                            Water: {form.waterLitersPerDay} L / day ({form.waterHeatedMostly ? 'heated mostly' : 'cold mostly'})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="calc-form__actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                  {currentIndex > 0 && (
                    <Button
                      variant="ghost"
                      icon={ChevronLeft}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  
                  {currentIndex < steps.length - 1 ? (
                    <Button
                      variant="primary"
                      icon={ChevronRight}
                      iconPosition="right"
                      onClick={handleNext}
                      disabled={!isStepValid(currentIndex)}
                      style={{ marginLeft: 'auto' }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      icon={Check}
                      onClick={handleSubmit}
                      style={{ marginLeft: 'auto' }}
                    >
                      Calculate Footprint
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive contour wave background / LiveEstimatePanel */}
        <div className="welcome-page__right">
          {!isCalculating ? (
            <div className="welcome-page__visual">
              <div className="welcome-page__visual-contours">
                <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
                  <path className="contour-line animate-wave-1" d="M-50 420 C 100 360, 200 480, 320 410 C 440 340, 520 430, 650 380" />
                  <path className="contour-line animate-wave-2" d="M-50 470 C 120 400, 220 520, 340 450 C 460 380, 540 470, 650 420" />
                  <path className="contour-line animate-wave-3" d="M-50 520 C 140 450, 240 560, 360 500 C 480 440, 560 510, 650 470" />
                  <path className="contour-line animate-wave-4" d="M-50 320 C 90 270, 180 360, 300 310 C 420 260, 500 330, 650 290" />
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
                <LiveEstimatePanel form={form} />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
