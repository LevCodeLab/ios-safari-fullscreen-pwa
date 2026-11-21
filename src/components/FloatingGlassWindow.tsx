import React from "react";
import { ArrowUpRight, HelpCircle, Layers, ShieldCheck, Smartphone } from "lucide-react";

export interface FloatingGlassWindowProps {
  appName?: string;
  badgeLabel?: string;
  headline?: string;
  subtitle?: string;
  viewportHeightPx: number;
  scrollY: number;
  layoutMode: "fixed-dvh" | "broken-100vh";
  onToggleLayoutMode: () => void;
  onOpenActionSheet: () => void;
  onOpenTray: () => void;
  onScrollToGuide: () => void;
}

export const FloatingGlassWindow: React.FC<FloatingGlassWindowProps> = ({
  appName = "OBSIDIAN PWA",
  badgeLabel = "100dvh LIVE",
  headline = "Edge-to-edge on iOS Safari.",
  subtitle = "Natural document scroll lets content glide behind Safari's floating URL bar with zero dead white gaps.",
  viewportHeightPx,
  scrollY,
  layoutMode,
  onToggleLayoutMode,
  onOpenActionSheet,
  onOpenTray,
  onScrollToGuide
}) => {
  return (
    <aside className="fgwRoot">
      <div className="fgwCard">
        {/* Top Brand + Monochrome Status Pill */}
        <div className="fgwHeaderRow">
          <div className="fgwBrandWrap">
            <div className="fgwLogoMark">O</div>
            <span className="fgwBrandTitle">{appName}</span>
          </div>

          <div className="fgwStatusBadge">
            <span className="fgwStatusDot" />
            <span>{badgeLabel}</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="fgwHeroCopy">
          <h1 className="fgwHeadline">{headline}</h1>
          <p className="fgwSubtitle">{subtitle}</p>
        </div>

        {/* Live Viewport Telemetry Readout */}
        <div className="fgwMetricsGrid">
          <div className="fgwMetricCell">
            <span className="fgwMetricLabel">VISIBLE HEIGHT</span>
            <span className="fgwMetricValue">{viewportHeightPx}px</span>
          </div>
          <div className="fgwMetricCell">
            <span className="fgwMetricLabel">DOCUMENT SCROLL</span>
            <span className="fgwMetricValue">{scrollY}px</span>
          </div>
        </div>

        {/* Monochrome Primary + Secondary Actions */}
        <div className="fgwActionsCol">
          <button
            type="button"
            className="btnPrimaryWhite"
            onClick={onOpenActionSheet}
          >
            <span>Open Action Bottom Sheet</span>
            <ArrowUpRight size={15} />
          </button>

          <button
            type="button"
            className="btnObsidian"
            onClick={onOpenTray}
          >
            <Layers size={14} />
            <span>Toggle 3-Snap Glass Tray</span>
          </button>

          <button
            type="button"
            className="btnSubtleObsidian"
            onClick={onScrollToGuide}
          >
            <HelpCircle size={13} />
            <span>Read Safe-Area Checklist Below</span>
          </button>
        </div>

        {/* Mode Switcher Bar */}
        <div className="fgwFooterRow">
          <div className="fgwModeMeta">
            <div className="fgwModeIconWrap">
              {layoutMode === "fixed-dvh" ? <ShieldCheck size={13} /> : <Smartphone size={13} />}
            </div>
            <div className="fgwModeTextCol">
              <span className="fgwModeTitle">
                {layoutMode === "fixed-dvh" ? "100dvh + Body Scroll" : "100vh + Body Lock Trap"}
              </span>
              <span className="fgwModeSub">
                {layoutMode === "fixed-dvh"
                  ? "viewport-fit=cover active"
                  : "Simulating trapped bottom bar"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={layoutMode === "fixed-dvh" ? "pillObsidian" : "pillWhiteActive"}
            onClick={onToggleLayoutMode}
          >
            {layoutMode === "fixed-dvh" ? "Simulate Bug" : "Fix Layout"}
          </button>
        </div>
      </div>
    </aside>
  );
};
