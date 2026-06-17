import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Contour` : 'Contour — Carbon Footprint Awareness Platform';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
