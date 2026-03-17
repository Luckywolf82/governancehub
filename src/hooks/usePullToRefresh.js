import { useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh, threshold = 80) {
  const startY = useRef(null);
  const pulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        // Prevent default overscroll only when pulling down at top
        if (window.scrollY === 0 && delta > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (!pulling.current || startY.current === null) return;
      const delta = (e.changedTouches[0]?.clientY ?? 0) - startY.current;
      if (delta > threshold && window.scrollY === 0) {
        onRefresh();
      }
      startY.current = null;
      pulling.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, threshold]);
}