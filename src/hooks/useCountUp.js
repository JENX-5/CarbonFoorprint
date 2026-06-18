import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from its previous value to `value` over
 * `duration` ms using an eased timing curve. Falls back to an instant jump
 * when the user has requested reduced motion or the value is invalid.
 *
 * @param {number} value - The target number to count up to.
 * @param {number} [duration=900] - Duration of the count-up animation in milliseconds.
 * @returns {number} The current display value during count-up.
 */
export function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isStatic =
    prefersReduced || typeof value !== "number" || !isFinite(value);

  // Synchronize fromRef on commit phase when static to ensure subsequent transitions are correct
  useEffect(() => {
    if (isStatic) {
      fromRef.current = value;
    }
  }, [value, isStatic]);

  useEffect(() => {
    if (isStatic) return undefined;

    const from = fromRef.current;
    const to = value;
    if (from === to) return undefined;

    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, isStatic]);

  return isStatic ? value : display;
}
