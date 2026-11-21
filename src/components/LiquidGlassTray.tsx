import React, { useState } from "react";
import { ArrowRight, Check, Maximize2, Minimize2, Plus } from "lucide-react";

export type TrayHeightMode = "collapsed" | "half" | "expanded";

export interface TrayWorkspaceSession {
  id: string;
  label: string;
}

export interface TrayQueueItem {
  id: string;
  title: string;
  detail: string;
  metric: string;
  subMetric: string;
  completed: boolean;
}

export interface LiquidGlassTrayProps {
  heightMode: TrayHeightMode;
  onHeightModeChange: (mode: TrayHeightMode) => void;
  sessions: TrayWorkspaceSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  title: string;
  subtitle: string;
  isProcessing?: boolean;
  items: TrayQueueItem[];
  onExportJson?: () => void;
  onPrimaryAction?: () => void;
}

export function getNextTrayHeightMode(current: TrayHeightMode): TrayHeightMode {
  if (current === "collapsed") return "half";
  if (current === "half") return "expanded";
  return "collapsed";
}

export const LiquidGlassTray: React.FC<LiquidGlassTrayProps> = ({
  heightMode,
  onHeightModeChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  title,
  subtitle,
  isProcessing = false,
  items,
  onExportJson,
  onPrimaryAction
}) => {
  const [activeTab, setActiveTab] = useState<"queue" | "notes">("queue");

  const cycleHeight = () => {
    onHeightModeChange(getNextTrayHeightMode(heightMode));
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      <div
        className="trayBackdropDimmer"
        style={{
          opacity: heightMode === "expanded" ? 0.76 : heightMode === "half" ? 0.38 : 0,
          pointerEvents: heightMode === "collapsed" ? "none" : "auto"
        }}
        onClick={() => onHeightModeChange("collapsed")}
      />

      <section
        className={`liquidGlassTray tray-${heightMode}`}
        aria-label="Resizable Bottom Glass Tray"
      >
        {/* Drag / Tap Handle */}
        <div
          className="trayHandleZone"
          onClick={cycleHeight}
          title="Cycle tray height (collapsed / half / expanded)"
        >
          <div className="trayHandleBar" />
        </div>

        {/* Tray Header */}
        <header className="trayHeader">
          <div className="trayIdentity">
            <div className="trayBadgeAvatar">{completedCount}</div>
            <div className="trayTextCol">
              <span className="trayTitle">{title}</span>
              <span className="traySubtitle">{subtitle}</span>
            </div>
          </div>

          <div className="trayHeaderControls">
            <span className="pillObsidian">
              {isProcessing ? "Running" : `${completedCount}/${totalCount} Ready`}
            </span>

            <div className="trayTabGroup">
              <button
                type="button"
                className={activeTab === "queue" ? "pillWhiteActive" : "pillObsidianGhost"}
                onClick={() => setActiveTab("queue")}
              >
                Queue
              </button>
              <button
                type="button"
                className={activeTab === "notes" ? "pillWhiteActive" : "pillObsidianGhost"}
                onClick={() => setActiveTab("notes")}
              >
                Specs
              </button>
            </div>

            <button
              type="button"
              className="btnIconObsidian"
              onClick={cycleHeight}
              aria-label="Resize tray"
            >
              {heightMode === "expanded" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </header>

        {/* Session Strip */}
        <div className="traySessionStrip">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === activeSessionId ? "pillWhiteActive" : "pillObsidian"}
              onClick={() => onSelectSession(s.id)}
            >
              {s.label}
            </button>
          ))}
          <button type="button" className="pillObsidian" onClick={onNewSession}>
            <Plus size={11} />
            <span>New Tab</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="trayContentArea">
          {activeTab === "queue" ? (
            <div className="trayStack">
              <div className="trayProgressCard">
                <div className="trayProgressTopRow">
                  <span className="trayProgressTitle">
                    {completedCount === totalCount && totalCount > 0
                      ? `All ${completedCount} checkpoints verified`
                      : `${completedCount} of ${totalCount} checkpoints verified`}
                  </span>
                  <span className="trayProgressMeta">{progressPct}%</span>
                </div>
                <div className="trayProgressBarTrack">
                  <div
                    className="trayProgressBarFill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="trayListHeader">SAFE-AREA &amp; VIEWPORT CHECKPOINTS</div>

              {items.map((item, idx) => (
                <div key={item.id} className="trayItemRow">
                  <div className="trayItemLeft">
                    <div className="trayStepCircle">
                      {item.completed ? <Check size={12} strokeWidth={2.5} /> : idx + 1}
                    </div>
                    <div className="trayItemTextCol">
                      <span className="trayItemTitle">{item.title}</span>
                      <span className="trayItemDetail">{item.detail}</span>
                    </div>
                  </div>
                  <div className="trayItemRight">
                    <span className="trayItemMetric">{item.metric}</span>
                    <span className="trayItemSubMetric">{item.subMetric}</span>
                  </div>
                </div>
              ))}

              <div className="trayFooterActions">
                {onExportJson && (
                  <button
                    type="button"
                    className="btnObsidian"
                    onClick={onExportJson}
                  >
                    Copy CSS Tokens
                  </button>
                )}
                {onPrimaryAction && (
                  <button
                    type="button"
                    className="btnPrimaryWhite"
                    onClick={onPrimaryAction}
                  >
                    <span>Open Action Sheet</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="trayNotesBox">
              <p>
                Docked using <code>bottom: 0</code> with internal{" "}
                <code>padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 18px)</code> so
                the action buttons never collide with the iPhone home indicator bar.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
