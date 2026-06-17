# Carbon Footprint Awareness Platform - Implementation Plan

## Goal Description
The goal is to audit and improve the existing Carbon Footprint Awareness Platform. While the current application is functional and secure (using `textContent` and no `innerHTML`), the codebase can be optimized for maintainability, visual impact (Hackathon readiness), and completeness. We will refactor the massive `script.js` into modular files, enhance the dashboard with visual charts, strengthen accessibility and security, and author a comprehensive `README.md`.

## User Review Required
> [!IMPORTANT]  
> Please review the proposed modularization. I plan to split `script.js` into multiple scripts loaded sequentially in `index.html` to maintain the ability to run directly from `file://` without CORS issues or a build step. If you prefer ES Modules (`<script type="module">`), let me know, though it will require a local server to run.

## Open Questions
- Do you have a preference for any specific color changes or layout updates, or should I proceed with polishing the existing "Contour" design system (adding animations, charts, etc.)?

## Proposed Changes

### 1. Code Quality & Modularization (Refactoring)
The monolithic `script.js` (1000+ lines) will be split into a `js/` directory to improve readability and maintainability.
- **[NEW]** `js/utils.js`: Shared utility functions (DOM selection, formatting, dates).
- **[NEW]** `js/storage.js`: LocalStorage wrapper.
- **[NEW]** `js/calculator.js`: Footprint computation logic.
- **[NEW]** `js/insights.js`: AI insights generation logic.
- **[NEW]** `js/simulator.js`: Scenario simulator logic.
- **[NEW]** `js/gamification.js`: Eco score, badges, and streak logic.
- **[NEW]** `js/ui.js`: DOM caching, rendering functions, and event wiring.
- **[NEW]** `js/main.js`: Initialization point.
- **[MODIFY]** `index.html`: Update `<script>` tags to load the new modules in order, replacing `script.js`.
- **[DELETE]** `script.js`.

### 2. UI/UX & Hackathon Scoring Weaknesses
To ensure the project stands out in a hackathon:
- **[MODIFY]** `styles.css`: Add CSS micro-animations (e.g., number counting up, smooth entry transitions for cards).
- **[MODIFY]** `js/ui.js` & `index.html`: Add a visual breakdown of emissions (e.g., a simple SVG or CSS-based bar/pie chart in the dashboard) instead of just raw numbers.

### 3. Security & Accessibility
- **[MODIFY]** `index.html`: Add a strict Content Security Policy (CSP) `<meta>` tag to formalize the no-XSS posture.
- **[MODIFY]** `index.html`: Ensure form inputs have appropriate `autocomplete` attributes. Verify `aria-live` regions cover all dynamic updates.
- **[MODIFY]** `js/*`: Ensure defensive programming (input validation and try/catch blocks) is robust across all modules.

### 4. Missing Features & Bugs
- **[MODIFY]** `js/simulator.js`: Ensure negative savings in the simulator (if a user simulates worse behavior) properly display as "adds X kg" without negative signs confusing the UI.
- **[MODIFY]** `js/gamification.js`: Add a visual toast for streak milestones.

### 5. Documentation
- **[NEW]** `README.md`: Create a comprehensive README covering Overview, Features, Architecture, Sustainability Logic, AI Engine, Security, Testing, Evaluation Alignment, Assumptions, Future Scope, and Deployment Instructions.

## Verification Plan

### Automated / Browser Tests
- Open `index.html` via `file://` and verify the app loads without console errors (proving the modularization works).
- Test the calculator with valid and invalid inputs to ensure defensive programming holds.
- Use the simulator to verify calculations and UI updates.
- Check the gamification features (complete checklist, unlock badges).

### Manual Verification
- Review the DOM for the new CSP meta tag and accessibility attributes.
- Ensure the newly added chart renders beautifully in the dashboard.
- Confirm `README.md` is complete and formatted correctly.
