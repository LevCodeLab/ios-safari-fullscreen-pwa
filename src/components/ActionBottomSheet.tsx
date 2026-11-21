import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  RefreshCw,
  X
} from "lucide-react";
import { clampPercentage } from "../hooks/useSafariViewport";

export type ActionExecutionStep = "idle" | "processing" | "confirmed" | "failed";

export interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  itemCode?: string;
  availableUnits?: number;
  unitSymbol?: string;
  unitPriceUsd?: number;
  initialPercentage?: number;
  onActionConfirmed?: (payload: {
    percentage: number;
    unitsProcessed: number;
    usdEstimate: number;
    destination: string;
  }) => void;
}

const PRESET_TIERS = [10, 25, 50, 80, 100] as const;

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  itemTitle = "Vault Allocation #04",
  itemCode = "0x8F...42B1",
  availableUnits = 12_500,
  unitSymbol = "UNITS",
  unitPriceUsd = 0.24,
  initialPercentage = 50,
  onActionConfirmed
}) => {
  const [percentage, setPercentage] = useState<number>(() => clampPercentage(initialPercentage));
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typedValue, setTypedValue] = useState<string>(String(clampPercentage(initialPercentage)));
  const [destinationMode, setDestinationMode] = useState<"primary" | "ColdStorage" | "Custom">(
    "primary"
  );
  const [customNote, setCustomNote] = useState<string>("");
  const [step, setStep] = useState<ActionExecutionStep>("idle");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const clean = clampPercentage(initialPercentage);
      setPercentage(clean);
      setTypedValue(String(clean));
      setIsTyping(false);
      setStep("idle");
      setErrorMessage(null);
      setIsCopied(false);
    }
  }, [isOpen, initialPercentage]);

  useEffect(() => {
    if (isTyping && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isTyping]);

  const quote = useMemo(() => {
    const unitsSelected = Math.round((availableUnits * percentage) / 100);
    const grossUsd = unitsSelected * unitPriceUsd;
    const feeUsd = grossUsd * 0.005;
    const netUsd = Math.max(0, grossUsd - feeUsd);
    const remainingUnits = Math.max(0, availableUnits - unitsSelected);
    return {
      unitsSelected,
      grossUsd,
      feeUsd,
      netUsd,
      remainingUnits,
      remainingPct: Math.max(0, 100 - percentage)
    };
  }, [availableUnits, percentage, unitPriceUsd]);

  const handlePercentageChange = useCallback((val: number) => {
    const clamped = clampPercentage(val);
    setPercentage(clamped);
    setTypedValue(String(clamped));
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = (x / Math.max(1, rect.width)) * 100;
      handlePercentageChange(pct);
    },
    [handlePercentageChange]
  );

  const onPointerDownTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer events in tests
    }
    updateFromPointer(e.clientX);
  };

  const onPointerMoveTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const onPointerUpTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const commitTypedPercentage = () => {
    setIsTyping(false);
    const parsed = Number.parseFloat(typedValue);
    if (!Number.isNaN(parsed) && parsed > 0) {
      handlePercentageChange(parsed);
    } else {
      setTypedValue(String(percentage));
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(itemCode).catch(() => {});
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const handleRunAction = () => {
    if (destinationMode === "Custom" && !customNote.trim()) {
      setErrorMessage("Enter a destination tag or switch back to Primary.");
      setStep("failed");
      return;
    }

    setStep("processing");
    setTimeout(() => {
      setStep("confirmed");
      onActionConfirmed?.({
        percentage,
        unitsProcessed: quote.unitsSelected,
        usdEstimate: quote.netUsd,
        destination: destinationMode === "Custom" ? customNote.trim() : destinationMode
      });
    }, 450);
  };

  if (!isOpen) return null;

  const trackOpacity = (0.35 + (percentage / 100) * 0.65).toFixed(2);

  return (
    <div className="absBackdrop" onClick={onClose}>
      <div
        className="absSheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Action Bottom Sheet"
      >
        <div className="absGrabberWrap">
          <div className="absGrabber" />
        </div>

        {/* Sheet Header Card */}
        <div className="absTopCard">
          <div className="absTopLeft">
            <div className="absAvatarBox">{percentage}%</div>
            <div className="absMetaCol">
              <div className="absTitleRow">
                <span className="absTitle">{itemTitle}</span>
                <button
                  type="button"
                  className="btnIconObsidian"
                  onClick={handleCopyCode}
                  title="Copy identifier"
                >
                  {isCopied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
              <span className="absSubMeta">
                {itemCode} · {availableUnits.toLocaleString()} {unitSymbol}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btnIconObsidian"
            onClick={onClose}
            aria-label="Close bottom sheet"
          >
            <X size={14} />
          </button>
        </div>

        {/* Processing View */}
        {step === "processing" && (
          <div className="absStateBox">
            <div className="absSpinner" />
            <div className="absStateTitle">Applying {percentage}% Allocation</div>
            <div className="absStateSub">
              {quote.unitsSelected.toLocaleString()} {unitSymbol} (${quote.netUsd.toFixed(2)})
            </div>
          </div>
        )}

        {/* Confirmed View */}
        {step === "confirmed" && (
          <div className="absStateBox">
            <CheckCircle2 size={28} />
            <div className="absStateTitle">Confirmed {percentage}% Action</div>
            <div className="absStateSub">
              Processed {quote.unitsSelected.toLocaleString()} {unitSymbol} (${quote.netUsd.toFixed(2)})
            </div>
            <button type="button" className="btnPrimaryWhite" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {/* Error View */}
        {step === "failed" && (
          <div className="absStateBox">
            <AlertCircle size={28} />
            <div className="absStateTitle">Validation Stopped</div>
            <div className="absStateSub">{errorMessage}</div>
            <div className="absBtnRow">
              <button type="button" className="btnObsidian" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btnPrimaryWhite"
                onClick={() => setStep("idle")}
              >
                <RefreshCw size={13} />
                <span>Edit Input</span>
              </button>
            </div>
          </div>
        )}

        {/* Default Interactive Slider View */}
        {step === "idle" && (
          <>
            <div className="absSliderCard">
              <div className="absSliderHeader">
                <div className="absSliderLabels">
                  <span className="absMutedLabel">Selected amount</span>
                  <span className="absBoldVal">
                    {quote.unitsSelected.toLocaleString()} {unitSymbol}
                  </span>
                </div>

                {isTyping ? (
                  <div className="absInlineInputWrap">
                    <input
                      ref={inputRef}
                      type="number"
                      min={1}
                      max={100}
                      value={typedValue}
                      onChange={(e) => setTypedValue(e.target.value)}
                      onBlur={commitTypedPercentage}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitTypedPercentage();
                      }}
                      className="absInlineInput"
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="pillObsidian"
                    onClick={() => setIsTyping(true)}
                  >
                    {percentage < 10 ? `0${percentage}` : percentage}%
                  </button>
                )}
              </div>

              {/* Monochrome Ruler Track */}
              <div
                ref={trackRef}
                className="absTrack"
                onPointerDown={onPointerDownTrack}
                onPointerMove={onPointerMoveTrack}
                onPointerUp={onPointerUpTrack}
                onPointerCancel={onPointerUpTrack}
              >
                <div className="absTrackTicks" />
                <div
                  className="absTrackFill"
                  style={{
                    width: `${percentage}%`,
                    opacity: Number(trackOpacity)
                  }}
                />
                <div className="absThumb" style={{ left: `${percentage}%` }}>
                  <span>&lt;&gt;</span>
                </div>
              </div>

              {/* Preset Percentage Pills */}
              <div className="absPresetRow">
                <span className="absMutedLabel">Preset</span>
                <div className="absPresetGroup">
                  {PRESET_TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={percentage === tier ? "pillWhiteActive" : "pillObsidian"}
                      onClick={() => handlePercentageChange(tier)}
                    >
                      {tier}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Readout */}
            <div className="absQuoteCard">
              <div className="absQuoteMainRow">
                <span className="absMutedLabel">Estimated output</span>
                <span className="absQuoteBig">${quote.netUsd.toFixed(2)}</span>
              </div>
              <div className="absQuoteMetaLine">
                <span>Gross: ${quote.grossUsd.toFixed(2)}</span>
                <span>·</span>
                <span>Fee: ${quote.feeUsd.toFixed(2)}</span>
                <span>·</span>
                <span>Retaining: {quote.remainingPct}%</span>
              </div>
            </div>

            {/* Destination Selector */}
            <div className="absDestCard">
              <div className="absDestTopRow">
                <span className="absMutedLabel">TARGET ROUTE</span>
                <div className="absPresetGroup">
                  {(["primary", "ColdStorage", "Custom"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={destinationMode === mode ? "pillWhiteActive" : "pillObsidian"}
                      onClick={() => setDestinationMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              {destinationMode === "Custom" && (
                <input
                  type="text"
                  placeholder="Enter custom destination label..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="absCustomInput"
                />
              )}
            </div>

            <button
              type="button"
              className="btnPrimaryWhite absSubmitBtn"
              onClick={handleRunAction}
            >
              <span>Confirm {percentage}% Action</span>
              <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
