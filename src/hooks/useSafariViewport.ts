import { useEffect, useState } from "react";

export interface SafariViewportMetrics {
  innerHeight: number;
  visualHeight: number;
  scrollY: number;
  vhUnitPx: number;
  isStandalonePwa: boolean;
  isUrlBarCompressed: boolean;
}

export function calculateScrollClearancePx(
  safeAreaBottomPx: number = 20,
  navHeightPx: number = 56,
  extraClearancePx: number = 24
): number {
  return Math.max(0, safeAreaBottomPx) + Math.max(0, navHeightPx) + Math.max(0, extraClearancePx);
}

export function clampPercentage(val: number): number {
  if (Number.isNaN(val)) return 1;
  return Math.max(1, Math.min(100, Math.round(val)));
}

export function useSafariViewport(): SafariViewportMetrics {
  const [metrics, setMetrics] = useState<SafariViewportMetrics>(() => ({
    innerHeight: typeof window !== "undefined" ? window.innerHeight : 844,
    visualHeight:
      typeof window !== "undefined" && window.visualViewport
        ? Math.round(window.visualViewport.height)
        : typeof window !== "undefined"
        ? window.innerHeight
        : 844,
    scrollY: typeof window !== "undefined" ? Math.round(window.scrollY) : 0,
    vhUnitPx: typeof window !== "undefined" ? Number((window.innerHeight * 0.01).toFixed(2)) : 8.44,
    isStandalonePwa: false,
    isUrlBarCompressed: false
  }));

  useEffect(() => {
    let baselineHeight = window.innerHeight;

    const syncViewport = () => {
      const innerH = window.innerHeight;
      const visualH = window.visualViewport
        ? Math.round(window.visualViewport.height)
        : innerH;
      const vh = Number((innerH * 0.01).toFixed(2));

      document.documentElement.style.setProperty("--vh", `${vh}px`);

      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

      if (innerH < baselineHeight && window.scrollY < 10) {
        baselineHeight = innerH;
      }

      setMetrics({
        innerHeight: innerH,
        visualHeight: visualH,
        scrollY: Math.round(window.scrollY),
        vhUnitPx: vh,
        isStandalonePwa: standalone,
        isUrlBarCompressed: innerH > baselineHeight + 24 || window.scrollY > 48
      });
    };

    syncViewport();

    window.addEventListener("resize", syncViewport, { passive: true });
    window.addEventListener("orientationchange", syncViewport, { passive: true });
    window.addEventListener("scroll", syncViewport, { passive: true });
    window.visualViewport?.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.removeEventListener("scroll", syncViewport);
      window.visualViewport?.removeEventListener("resize", syncViewport);
    };
  }, []);

  return metrics;
}
