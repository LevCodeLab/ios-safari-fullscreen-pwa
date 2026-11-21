import React from "react";
import { Compass, Layers, LucideIcon, Sliders, Terminal } from "lucide-react";

export type NavTabId = "overview" | "tray" | "sheet" | "guide";

export interface FloatingNavCapsuleProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

const NAV_ITEMS: ReadonlyArray<{
  id: NavTabId;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "overview", label: "Viewport", icon: Compass },
  { id: "tray", label: "Tray", icon: Layers },
  { id: "sheet", label: "Sheet", icon: Sliders },
  { id: "guide", label: "CSS Spec", icon: Terminal }
];

export const FloatingNavCapsule: React.FC<FloatingNavCapsuleProps> = ({
  activeTab,
  onSelectTab
}) => {
  return (
    <nav className="floatingNavCapsule" aria-label="Primary Mobile Navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? "navCapsuleBtn active" : "navCapsuleBtn"}
            onClick={() => onSelectTab(item.id)}
          >
            <Icon size={14} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
