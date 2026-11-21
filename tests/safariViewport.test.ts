import { describe, expect, it } from "vitest";
import { getNextTrayHeightMode } from "../src/components/LiquidGlassTray";
import {
  calculateScrollClearancePx,
  clampPercentage
} from "../src/hooks/useSafariViewport";

describe("Safari viewport math & sheet helpers", () => {
  it("computes bottom scroll clearance with safe-area, navbar height, and buffer", () => {
    expect(calculateScrollClearancePx(34, 56, 20)).toBe(110);
    expect(calculateScrollClearancePx(-10, 56, 20)).toBe(76);
    expect(calculateScrollClearancePx()).toBe(100);
  });

  it("clamps bottom-sheet slider percentages strictly to [1, 100]", () => {
    expect(clampPercentage(0)).toBe(1);
    expect(clampPercentage(-45)).toBe(1);
    expect(clampPercentage(49.6)).toBe(50);
    expect(clampPercentage(145)).toBe(100);
    expect(clampPercentage(Number.NaN)).toBe(1);
  });

  it("cycles tray snap modes through collapsed -> half -> expanded -> collapsed", () => {
    expect(getNextTrayHeightMode("collapsed")).toBe("half");
    expect(getNextTrayHeightMode("half")).toBe("expanded");
    expect(getNextTrayHeightMode("expanded")).toBe("collapsed");
  });
});
