import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { CALCULATOR_STEPS } from './calculatorSteps.js';
import { Stepper } from '../../components/common/Stepper.jsx';
import { LiveEstimatePanel } from '../dashboard/LiveEstimatePanel.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Calculator, ChevronLeft, ChevronRight, Check } from '../../components/icons/index.jsx';
import { CarbonData as Data } from '../../lib/data.js';
import { FieldRow } from '../../components/common/FieldRow.jsx';
import { Button } from '../../components/common/Button.jsx';

export function CalculatorPage() {
  const { state, actions } = useAppState();
  useDocumentTitle('Calculator');
  const navigate = useNavigate();

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

  const [form, setForm] = useState(state.inputs || defaultInputs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [furthestAllowedIndex, setFurthestAllowedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const steps = CALCULATOR_STEPS;
  const currentStep = steps[currentIndex];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    
    // Update form
    const updatedForm = { ...form, [name]: val };
    setForm(updatedForm);

    // Validate the field on change
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
    if (!step.fields) return true; // Review step is always valid

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
    // Validate everything before submit
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
      navigate('/dashboard');
    }
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
            <Stepper
              steps={steps}
              currentIndex={currentIndex}
              furthestAllowedIndex={furthestAllowedIndex}
              onStepClick={handleStepClick}
            />

            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {currentStep.icon && <currentStep.icon size={22} className="contour-ring--3" style={{ color: 'var(--color-canopy)' }} />}
                <h3 style={{ margin: 0 }}>{currentStep.label}</h3>
              </div>
              <p className="hero__lede" style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>{currentStep.intro}</p>

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
        </div>

        <div className="calculator-layout__side">
          <LiveEstimatePanel form={form} />
        </div>
      </div>
    </div>
  );
}
