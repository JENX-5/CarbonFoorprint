import { useEffect } from "react";

/**
 * Custom hook to update the browser document title.
 * Appends standard branding text (" · Contour") or defaults to platform title.
 *
 * @param {string} title - The sub-page title to display.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title
      ? `${title} · Contour`
      : "Contour — Carbon Footprint Awareness Platform";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
