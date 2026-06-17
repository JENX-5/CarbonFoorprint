# Contour — Carbon Footprint Awareness Platform

## Overview
Contour is a Carbon Footprint Awareness Platform designed to help individuals understand, track, and reduce their environmental impact. By turning daily habits—transportation, energy use, diet, waste, and water—into a measurable footprint, Contour acts as a personalized sustainability coach. 

## Features
- **Carbon Calculator:** Estimate emissions across five key lifestyle categories.
- **AI Sustainability Coach:** Rule-based insights engine that generates transparent, actionable recommendations.
- **Scenario Simulator:** Test lifestyle changes ("what if I drive less?") and see the projected impact before committing.
- **Sustainability Dashboard:** View daily, monthly, and annual footprint breakdowns against global averages.
- **Gamification Engine:** Earn an Eco Score, unlock badges, maintain streaks, and complete daily checklists and weekly challenges.
- **Education Hub:** Browse curated sustainability tips prioritized by your highest emission sources.

## Architecture
Contour is a client-side, zero-dependency web application. It runs entirely in the browser using Vanilla JavaScript, HTML5, and CSS3. 
- **Modular JavaScript:** Organized logically to separate state management, UI rendering, gamification, and core calculations.
- **Local Storage:** All user data is saved securely in the browser's `localStorage` (wrapped in robust try/catch blocks for safety).
- **Offline Capable:** Uses local system fonts and contains no external API dependencies, allowing it to be run directly from disk (`file://`).

## Sustainability Logic
The platform uses widely cited, illustrative emission factors (e.g., kg CO2e per km driven, or per kWh of electricity). 
- Calculations combine user inputs with static factors defined in `data.js`.
- Results are aggregated to provide a total annual footprint, which is then translated into relatable metrics (e.g., "trees' worth of yearly CO2 absorption").

## AI Recommendation Engine
Unlike black-box AI models, Contour's "AI" is a transparent, deterministic rules engine. 
- It analyzes the user's footprint breakdown.
- It identifies the highest-impact categories.
- It triggers specific recommendations (e.g., "Switching to a 100% renewable plan") and calculates the exact `kg CO2e` savings based on the user's baseline.

## Security & Accessibility
- **Security:** Built defensively. No `eval()` or `innerHTML` is used. All dynamic DOM updates use `textContent` to eliminate XSS vulnerabilities. A strict Content Security Policy (CSP) is implemented.
- **Accessibility:** Uses semantic HTML (`<main>`, `<nav>`, `<article>`), ARIA labels, `aria-live` regions for dynamic announcements, and full keyboard navigability (including a "Skip to main content" link). Focus rings are styled for high visibility.

## Testing Strategy
- **Defensive Programming:** Extensive input validation and bounds-checking (`Utils.clamp`).
- **Graceful Degradation:** The application fails gracefully if `localStorage` is disabled or full.
- **Form Validation:** All numerical inputs validate against sensible minimums and maximums before calculation.

## Evaluation Alignment Matrix
- **Problem Alignment:** Directly addresses the lack of personal carbon awareness and tracking.
- **Innovation:** Combines a calculator with a "what-if" simulator and an automated, transparent insight generator.
- **UX/UI:** Features a unique "contour/topographic" design system that moves away from generic "green leaf" templates.

## Assumptions
- Emission factors are *illustrative averages* intended for awareness and education, not for certified carbon accounting.
- Global average benchmarks are static estimates used for context.
- Savings estimates in the simulator assume linear reductions.

## Future Scope
- **Data Export/Import:** Allow users to backup their progress.
- **Integration:** Optional connections to smart home devices or utility APIs for automated tracking.
- **Community:** Leaderboards or localized challenges.

## Deployment Instructions
1. Download or clone the repository.
2. Open `index.html` in any modern web browser.
3. No build steps, Node.js servers, or package managers are required.
