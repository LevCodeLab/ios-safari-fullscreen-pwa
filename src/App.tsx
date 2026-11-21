import React, { useRef, useState } from "react";
import { ActionBottomSheet } from "./components/ActionBottomSheet";
import { FloatingGlassWindow } from "./components/FloatingGlassWindow";
import { FloatingNavCapsule, NavTabId } from "./components/FloatingNavCapsule";
import {
  LiquidGlassTray,
  TrayHeightMode,
  TrayQueueItem,
  TrayWorkspaceSession
} from "./components/LiquidGlassTray";
import { calculateScrollClearancePx, useSafariViewport } from "./hooks/useSafariViewport";

const INITIAL_SESSIONS: TrayWorkspaceSession[] = [
  { id: "ios-17", label: "iOS 17/18 Safari" },
  { id: "pwa-home", label: "Home Screen PWA" },
  { id: "webview", label: "In-App WebView" }
];

const INITIAL_CHECKPOINTS: TrayQueueItem[] = [
  {
    id: "cp-1",
    title: "viewport-fit=cover",
    detail: "Eliminates notch and home-bar letterboxing",
    metric: "ACTIVE",
    subMetric: "index.html",
    completed: true
  },
  {
    id: "cp-2",
    title: "100dvh + -webkit-fill-available",
    detail: "Tracks real dynamic Safari height on URL bar expand",
    metric: "SYNCED",
    subMetric: "CSS + --vh",
    completed: true
  },
  {
    id: "cp-3",
    title: "Natural body scroll (no overflow:hidden)",
    detail: "Allows Safari floating URL bar to collapse on swipe",
    metric: "ENABLED",
    subMetric: "window scroll",
    completed: true
  },
  {
    id: "cp-4",
    title: "Safe-area bottom clearance",
    detail: `env(safe-area-inset-bottom) + ${calculateScrollClearancePx(0, 54, 42)}px`,
    metric: "116px",
    subMetric: "Zero trapped CTAs",
    completed: true
  }
];

export const App: React.FC = () => {
  const viewport = useSafariViewport();
  const guideSectionRef = useRef<HTMLDivElement>(null);

  const [layoutMode, setLayoutMode] = useState<"fixed-dvh" | "broken-100vh">("fixed-dvh");
  const [trayMode, setTrayMode] = useState<TrayHeightMode>("collapsed");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<NavTabId>("overview");
  const [sessions, setSessions] = useState<TrayWorkspaceSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("ios-17");
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  const handleNavSelect = (tab: NavTabId) => {
    setActiveNav(tab);
    if (tab === "tray") {
      setTrayMode((prev) => (prev === "collapsed" ? "half" : "collapsed"));
    } else if (tab === "sheet") {
      setIsSheetOpen(true);
    } else if (tab === "guide") {
      guideSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddSession = () => {
    const nextNum = sessions.length + 1;
    const id = `tab-${nextNum}`;
    setSessions((prev) => [...prev, { id, label: `Profile #${nextNum}` }]);
    setActiveSessionId(id);
  };

  const handleCopyCssSnippet = () => {
    const snippet = `padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 96px);`;
    navigator.clipboard?.writeText(snippet).catch(() => {});
    setLastActionToast("Copied safe-area CSS rule to clipboard");
    setTimeout(() => setLastActionToast(null), 2400);
  };

  return (
    <div className={layoutMode === "broken-100vh" ? "appShell brokenLock" : "appShell"}>
      {/* Sticky Top Curved Window */}
      <header className="stickyCurvedTopHero">
        <div className="stickyTopInner">
          <div>
            <div className="stickyTopTitle">iOS Safari Fullscreen Kit</div>
            <div className="stickyTopSub">
              --vh: {viewport.vhUnitPx}px · visualViewport: {viewport.visualHeight}px ·{" "}
              {viewport.isUrlBarCompressed ? "URL Bar Compact" : "URL Bar Expanded"}
            </div>
          </div>

          <button
            type="button"
            className="pillObsidian"
            onClick={() => setIsSheetOpen(true)}
          >
            Test Sheet
          </button>
        </div>
      </header>

      {/* Main Adaptive Workspace */}
      <main className="workspaceGrid">
        <FloatingGlassWindow
          viewportHeightPx={viewport.innerHeight}
          scrollY={viewport.scrollY}
          layoutMode={layoutMode}
          onToggleLayoutMode={() =>
            setLayoutMode((prev) => (prev === "fixed-dvh" ? "broken-100vh" : "fixed-dvh"))
          }
          onOpenActionSheet={() => setIsSheetOpen(true)}
          onOpenTray={() =>
            setTrayMode((prev) => (prev === "collapsed" ? "half" : "collapsed"))
          }
          onScrollToGuide={() => guideSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
        />

        <section className="feedColumn">
          {lastActionToast && (
            <div className="obsidianCard">
              <div className="obsidianCardHeader">
                <h2 className="obsidianCardTitle">Status Update</h2>
                <span className="pillWhiteActive">OK</span>
              </div>
              <p className="obsidianCardBody">{lastActionToast}</p>
            </div>
          )}

          <article className="obsidianCard">
            <div className="obsidianCardHeader">
              <h2 className="obsidianCardTitle">1. Why 100vh + overflow:hidden Fails</h2>
              <span className="pillObsidian">Pillar 01</span>
            </div>
            <p className="obsidianCardBody">
              Mobile Safari calculates <code>100vh</code> as if the bottom URL bar is already
              minimized. On initial load, any fixed footer using <code>100vh</code> gets clipped
              underneath the address bar. Even worse, locking <code>body</code> with{" "}
              <code>overflow: hidden</code> stops Safari from ever collapsing the URL bar on swipe.
            </p>
          </article>

          <article className="obsidianCard" ref={guideSectionRef}>
            <div className="obsidianCardHeader">
              <h2 className="obsidianCardTitle">2. Exact HTML Viewport Meta</h2>
              <span className="pillObsidian">Pillar 02</span>
            </div>
            <pre className="codeBlock">{`<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#0A0A0D" />`}</pre>
          </article>

          <article className="obsidianCard">
            <div className="obsidianCardHeader">
              <h2 className="obsidianCardTitle">3. Bottom Safe-Area Scroll Clearance</h2>
              <span className="pillObsidian">Pillar 03</span>
            </div>
            <p className="obsidianCardBody">
              Keep natural document scrolling on <code>body</code> and pad the bottom of your list
              using <code>env(safe-area-inset-bottom)</code> plus your floating capsule height so
              cards glide smoothly behind both the navbar and Safari&apos;s translucent glass bar.
            </p>
            <pre className="codeBlock">{`.workspaceGrid {
  padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 116px);
}
.floatingNavCapsule {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 10px) + 12px);
}`}</pre>
          </article>

          {[4, 5, 6].map((idx) => (
            <article key={idx} className="obsidianCard">
              <div className="obsidianCardHeader">
                <h2 className="obsidianCardTitle">
                  {idx}. Scroll Test Card #{idx - 3}
                </h2>
                <button
                  type="button"
                  className="pillObsidian"
                  onClick={() => setIsSheetOpen(true)}
                >
                  Inspect
                </button>
              </div>
              <p className="obsidianCardBody">
                Swipe vertically on iPhone Safari: notice how this card slides cleanly behind the
                sticky 32px curved header at the top and behind the floating capsule navbar at the
                bottom without getting stuck.
              </p>
            </article>
          ))}
        </section>
      </main>

      {/* Floating Bottom Capsule */}
      <FloatingNavCapsule activeTab={activeNav} onSelectTab={handleNavSelect} />

      {/* 3-Snap Resizable Liquid Glass Tray */}
      <LiquidGlassTray
        heightMode={trayMode}
        onHeightModeChange={setTrayMode}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleAddSession}
        title="Viewport Verification Desk"
        subtitle="Safe-area & 100dvh diagnostic tray"
        items={INITIAL_CHECKPOINTS}
        onExportJson={handleCopyCssSnippet}
        onPrimaryAction={() => {
          setTrayMode("collapsed");
          setIsSheetOpen(true);
        }}
      />

      {/* Safe-Area Aware Interactive Bottom Sheet */}
      <ActionBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onActionConfirmed={(res) => {
          setLastActionToast(
            `Confirmed ${res.percentage}% (${res.unitsProcessed.toLocaleString()} UNITS -> ${res.destination})`
          );
        }}
      />
    </div>
  );
};
