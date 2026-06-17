/**
 * Three concentric, slightly irregular rings standing in for topographic
 * contour lines — the brand's one signature shape. Reused at every scale:
 * sidebar brand mark, mobile header, onboarding hero, and the favicon.
 */
export function BrandMark({ size = 34 }) {
  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path
        className="contour-ring contour-ring--1"
        d="M20 6 C 28 6, 34 12.5, 34 20 C 34 27.5, 28 34, 20 34 C 11.5 34, 6 28, 6 20 C 6 12, 12 6, 20 6 Z"
      />
      <path
        className="contour-ring contour-ring--2"
        d="M20 11 C 26 11, 29 15, 29 20 C 29 25.5, 25 29, 20 29 C 14.5 29, 11 25, 11 20 C 11 14.5, 14.5 11, 20 11 Z"
      />
      <path
        className="contour-ring contour-ring--3"
        d="M20 16 C 23.5 16, 25 18, 25 20.5 C 25 23.5, 23 25, 20 25 C 17 25, 15.5 23, 15.5 20.5 C 15.5 17.5, 17 16, 20 16 Z"
      />
    </svg>
  );
}
