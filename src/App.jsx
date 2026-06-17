import React, { useState, useEffect } from 'react';
import { loadState, defaultState, Storage, computeFootprint, Scoring, Insights, Simulator, Gamification, Utils } from './utils';
import { CarbonData as Data } from './data';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [state, setState] = useState(loadState());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Storage.save(state);
  }, [state]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'insights', label: 'AI Insights', icon: '💡' },
    { id: 'simulator', label: 'Simulator', icon: '🔮' },
    { id: 'gamification', label: 'Gamification', icon: '🏆' },
    { id: 'learn', label: 'Education Hub', icon: '📚' }
  ];

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand">
          <span className="brand__text">Contour</span>
        </div>
        <nav className="sidebar__nav">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                >
                  <span className="icon">{item.icon}</span> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="mobile-header">
          <button className="nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="brand__text">Contour</span>
        </header>

        <main className="content-area">
          {currentView === 'dashboard' && <DashboardView state={state} />}
          {currentView === 'calculator' && <CalculatorView state={state} setState={setState} />}
          {currentView === 'insights' && <InsightsView state={state} />}
          {currentView === 'simulator' && <SimulatorView state={state} />}
          {currentView === 'gamification' && <GamificationView state={state} />}
          {currentView === 'learn' && <LearnView />}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ state }) {
  if (!state.results) {
    return (
      <div className="view-section active">
        <h2>Dashboard</h2>
        <div className="empty-state"><p>Calculate your footprint first.</p></div>
      </div>
    );
  }

  const cat = state.results.byCategoryAnnual;
  const chartData = {
    labels: ['Transport', 'Electricity', 'Diet', 'Waste', 'Water'],
    datasets: [{
      data: [cat.transportation, cat.electricity, cat.diet, cat.waste, cat.water],
      backgroundColor: ['#1b4332', '#e9c46a', '#52796f', '#bc6c25', '#4a534d'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const score = Scoring.computeScore(state.results.annual);
  const rating = Scoring.getRating(score);
  const comparison = Scoring.compareToGlobalAverage(state.results.annual);

  return (
    <div className="view-section active">
      <h2>Sustainability Dashboard</h2>
      <div className="kpi-grid">
        <article className="kpi-card">
          <h3>Daily Footprint</h3>
          <p className="kpi-card__value">{Utils.formatNumber(state.results.daily, 1)}</p>
          <p className="kpi-card__unit">kg CO2e</p>
        </article>
        <article className="kpi-card">
          <h3>Monthly Footprint</h3>
          <p className="kpi-card__value">{Utils.formatNumber(state.results.monthly, 0)}</p>
          <p className="kpi-card__unit">kg CO2e</p>
        </article>
        <article className="kpi-card">
          <h3>Annual Footprint</h3>
          <p className="kpi-card__value">{Utils.formatNumber(state.results.annual, 0)}</p>
          <p className="kpi-card__unit">kg CO2e</p>
        </article>
        <article className="kpi-card">
          <h3>Vs. global average</h3>
          <p className="kpi-card__value kpi-card__value--small">{comparison.text}</p>
        </article>
      </div>
      
      <div className="dashboard-detail">
        <div className="chart-panel" style={{ height: '300px', flex: 1 }}>
          <h3>Emissions Breakdown</h3>
          <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
        </div>
        <div className="score-panel" style={{ flex: 1 }}>
          <div className="score-ring-wrap">
             <div className="score-ring__text">
                <span className="score-ring__value">{score}</span>
                <span className="score-ring__max">/ 100</span>
             </div>
          </div>
          <p className={`score-panel__rating ${rating.className}`}>{rating.label}</p>
        </div>
      </div>
    </div>
  );
}

function CalculatorView({ state, setState }) {
  const [form, setForm] = useState(state.inputs || {
    commuteKmPerDay: 20, transitKmPerWeek: 0, flightsShortHaulPerYear: 0, flightsLongHaulPerYear: 0,
    electricityKwhPerMonth: 250, renewablePercent: 0, wasteKgPerWeek: 8, recycledPercent: 30,
    waterLitersPerDay: 150, vehicleType: 'petrolCar', dietType: 'mediumMeat', waterHeatedMostly: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = computeFootprint(form);
    setState({ ...state, inputs: form, results: result, calculatorCompleted: true });
  };

  return (
    <div className="view-section active">
      <h2>Carbon Calculator</h2>
      <p className="section__intro">Enter your typical week.</p>
      <form onSubmit={handleSubmit} className="calc-form">
        <fieldset className="calc-fieldset">
          <legend>🚗 Transportation</legend>
          <div className="form-row">
            <label>Main commute vehicle</label>
            <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
              {Object.entries(Data.VEHICLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Distance driven per day (km)</label>
            <input type="number" name="commuteKmPerDay" value={form.commuteKmPerDay} onChange={handleChange} min="0" />
          </div>
          <div className="form-row">
            <label>Public transit per week (km)</label>
            <input type="number" name="transitKmPerWeek" value={form.transitKmPerWeek} onChange={handleChange} min="0" />
          </div>
          <div className="form-row form-row--split">
            <div>
              <label>Short-haul flights/yr</label>
              <input type="number" name="flightsShortHaulPerYear" value={form.flightsShortHaulPerYear} onChange={handleChange} min="0" />
            </div>
            <div>
              <label>Long-haul flights/yr</label>
              <input type="number" name="flightsLongHaulPerYear" value={form.flightsLongHaulPerYear} onChange={handleChange} min="0" />
            </div>
          </div>
        </fieldset>

        <fieldset className="calc-fieldset">
          <legend>⚡ Electricity</legend>
          <div className="form-row">
            <label>Electricity used per month (kWh)</label>
            <input type="number" name="electricityKwhPerMonth" value={form.electricityKwhPerMonth} onChange={handleChange} min="0" />
          </div>
          <div className="form-row">
            <label>Share from renewables (%)</label>
            <input type="number" name="renewablePercent" value={form.renewablePercent} onChange={handleChange} min="0" max="100" />
          </div>
        </fieldset>

        <fieldset className="calc-fieldset">
          <legend>🍽️ Diet</legend>
          <div className="form-row">
            <label>Overall dietary pattern</label>
            <select name="dietType" value={form.dietType} onChange={handleChange}>
               {Object.entries(Data.DIET_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset className="calc-fieldset">
          <legend>🗑️ Waste & 💧 Water</legend>
          <div className="form-row form-row--split">
            <div>
              <label>Waste per week (kg)</label>
              <input type="number" name="wasteKgPerWeek" value={form.wasteKgPerWeek} onChange={handleChange} min="0" />
            </div>
            <div>
              <label>Recycled/composted (%)</label>
              <input type="number" name="recycledPercent" value={form.recycledPercent} onChange={handleChange} min="0" max="100" />
            </div>
          </div>
          <div className="form-row">
            <label>Water used per day (litres)</label>
            <input type="number" name="waterLitersPerDay" value={form.waterLitersPerDay} onChange={handleChange} min="0" />
          </div>
          <div className="form-row form-row--checkbox">
            <input type="checkbox" name="waterHeatedMostly" checked={form.waterHeatedMostly} onChange={handleChange} />
            <label>Most of this water is heated</label>
          </div>
        </fieldset>

        <div className="calc-form__actions">
          <button type="submit" className="button button--primary">Calculate footprint</button>
        </div>
      </form>
    </div>
  );
}

function InsightsView({ state }) {
  if (!state.results) return <div className="view-section active"><div className="empty-state"><p>Calculate your footprint first.</p></div></div>;
  
  const insight = Insights.generate(state.inputs, state.results.byCategoryAnnual);
  
  return (
    <div className="view-section active insights">
      <h2>AI Insights Engine</h2>
      <div className="insight-card insight-card--primary">
        <h3>Highest emission source</h3>
        <p className="insight-card__headline">{Data.CATEGORY_ICONS[insight.topCategory]} {Data.CATEGORY_LABELS[insight.topCategory]}</p>
        <p>{Data.CATEGORY_LABELS[insight.topCategory]} makes up about {Math.round(insight.topShare)}% of your annual footprint.</p>
      </div>

      <div className="insight-card">
        <h3>Recommendations</h3>
        <ol className="recommendation-list">
          {insight.recommendations.map((rec, i) => (
            <li key={i}><strong>{Data.CATEGORY_LABELS[rec.category]}:</strong> {rec.text} <em>(Saves ~{Utils.formatNumber(rec.savingsKg, 0)} kg CO2e/year)</em></li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SimulatorView({ state }) {
  if (!state.results) return <div className="view-section active"><div className="empty-state"><p>Calculate your footprint first.</p></div></div>;
  
  const [sliders, setSliders] = useState({ driveLessPercent: 0, renewableTarget: 0, dietTarget: state.inputs.dietType, wasteReducePercent: 0 });
  const result = Simulator.run(state.inputs, state.results.byCategoryAnnual, sliders);

  return (
    <div className="view-section active">
      <h2>Scenario Simulator</h2>
      <div className="simulator">
        <div className="simulator__controls">
          <div className="slider-row">
            <div className="slider-row__label"><label>Drive less ({sliders.driveLessPercent}%)</label></div>
            <input type="range" min="0" max="100" step="5" value={sliders.driveLessPercent} onChange={e => setSliders({...sliders, driveLessPercent: Number(e.target.value)})} />
          </div>
          <div className="slider-row">
            <div className="slider-row__label"><label>Renewable Electricity ({sliders.renewableTarget}%)</label></div>
            <input type="range" min="0" max="100" step="5" value={sliders.renewableTarget} onChange={e => setSliders({...sliders, renewableTarget: Number(e.target.value)})} />
          </div>
          <div className="slider-row">
             <div className="slider-row__label"><label>Switch diet to</label></div>
             <select value={sliders.dietTarget} onChange={e => setSliders({...sliders, dietTarget: e.target.value})}>
               {Object.entries(Data.DIET_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
             </select>
          </div>
        </div>
        <div className="simulator__results">
          <h3>Projected annual footprint</h3>
          <p className="simulator__big-number">{Utils.formatNumber(result.newTotal, 0)} kg CO2e</p>
          <p>{result.savedKg > 0 ? `Saves ${Utils.formatNumber(result.savedKg,0)} kg CO2e/year` : 'No major change.'}</p>
        </div>
      </div>
    </div>
  );
}

function GamificationView({ state }) {
  const level = Gamification.getLevel(state.ecoScore);
  const current = Gamification.getCurrentChallenge();
  
  return (
    <div className="view-section active">
      <h2>Eco Score & Gamification</h2>
      <div className="eco-status">
        <div className="eco-status__score">
          <p className="eco-status__label">Eco score</p>
          <p className="eco-status__value">{state.ecoScore}</p>
          <p className="eco-status__level">{level.name}</p>
        </div>
      </div>
      <div className="panel" style={{marginTop: '20px'}}>
         <h3>This week's challenge: {current.challenge.title}</h3>
         <p>{current.challenge.description}</p>
         <p>Worth {current.challenge.points} points</p>
      </div>
    </div>
  );
}

function LearnView() {
  const [activeTab, setActiveTab] = useState(Data.CATEGORY_ORDER[0]);
  
  return (
    <div className="view-section active">
      <h2>Education Hub</h2>
      <div className="tabs">
        <div className="tabs__list">
           {Data.CATEGORY_ORDER.map(cat => (
             <button key={cat} className={`tab ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
                {Data.CATEGORY_ICONS[cat]} {Data.CATEGORY_LABELS[cat]}
             </button>
           ))}
        </div>
        <div className="tabs__panel">
           {Data.SUSTAINABILITY_TIPS[activeTab].map((tip, i) => (
             <article key={i} className="tip-card">
               <p className="tip-card__title">{tip.title}</p>
               <p className="tip-card__desc">{tip.description}</p>
             </article>
           ))}
        </div>
      </div>
    </div>
  );
}

export default App;
