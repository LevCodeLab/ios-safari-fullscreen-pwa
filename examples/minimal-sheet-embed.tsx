import React, { useState } from "react";
import { ActionBottomSheet, useSafariViewport } from "../src";

export function MinimalSheetEmbed() {
  const viewport = useSafariViewport();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24, background: "#0A0A0D", color: "#FFFFFF" }}>
      <p>Visible height: {viewport.innerHeight}px</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: "#FFFFFF", color: "#000000", padding: "10px 16px", borderRadius: 10 }}
      >
        Open Safe Area Sheet
      </button>
      <ActionBottomSheet isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
