/**
 * ScoreRing.jsx
 * ---------------------------------------------------------------------------
 * The product's signature visual: a circular gauge styled after the
 * contour lines on a topographic map (the same motif as the brand mark).
 * A thick animated arc reports the score itself; two thin dashed arcs
 * around it, reusing the brand's three contour-line colors, are purely
 * decorative elevation lines that tie the gauge back to the logo.
 *
 * The original CSS already defined every class used here
 * (score-ring__track / __progress / __decor, contour-ring--1/2/3) — this
 * component is what was missing: the actual SVG markup that uses them.
 * ---------------------------------------------------------------------------
 */
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const SIZE = 180;
const CENTER = SIZE / 2;
const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RATING_COLOR_VAR = {
  "rating-excellent": "var(--color-canopy)",
  "rating-good": "var(--color-moss)",
  "rating-fair": "var(--color-sun)",
  "rating-high": "var(--color-clay)",
  "rating-critical": "var(--color-danger)",
};

export function ScoreRing({
  score = 0,
  ratingClassName = "rating-good",
  size = SIZE,
  animate = true,
}) {
  const target = Math.min(100, Math.max(0, score));
  const [drawnScore, setDrawnScore] = useState(animate ? 0 : target);

  useEffect(() => {
    if (!animate) return undefined;

    let drawId = null;
    const resetId = setTimeout(() => {
      setDrawnScore(0);
      drawId = setTimeout(() => {
        setDrawnScore(target);
      }, 50);
    }, 0);

    return () => {
      clearTimeout(resetId);
      if (drawId) clearTimeout(drawId);
    };
  }, [target, animate]);

  const currentDrawnScore = animate ? drawnScore : target;
  const dashOffset = CIRCUMFERENCE * (1 - currentDrawnScore / 100);
  const color = RATING_COLOR_VAR[ratingClassName] || "var(--color-canopy)";

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={size}
        height={size}
        role="img"
        aria-label={`Eco score: ${Math.round(score)} out of 100`}
      >
        {/* decorative outer elevation lines, echoing the brand mark */}
        <circle
          className="contour-ring contour-ring--1"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 16}
          strokeDasharray="2 7"
        />
        <circle
          className="contour-ring contour-ring--2"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 10}
          strokeDasharray="1 5"
        />
        {/* gauge track */}
        <circle
          className="score-ring__track"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
        />
        {/* gauge value */}
        <circle
          className="score-ring__progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={!animate ? { transition: "none" } : undefined}
        />
      </svg>
      <div className="score-ring__text">
        <span className="score-ring__value">{Math.round(score)}</span>
        <span className="score-ring__max">/ 100</span>
      </div>
    </div>
  );
}

ScoreRing.propTypes = {
  score: PropTypes.number,
  ratingClassName: PropTypes.string,
  size: PropTypes.number,
  animate: PropTypes.bool,
};
