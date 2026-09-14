"use client";

import React from "react";
import { PhoneCall, LayoutGrid, Bot, ShieldCheck } from "lucide-react";

export type PwaTab = "call_log" | "dashboard" | "chat";

interface PwaNavBarProps {
  activeTab: PwaTab;
  onTabChange: (tab: PwaTab) => void;
  callQueueCount?: number;
  unverifiedLeadsCount?: number;
  theme?: "dark" | "light";
  className?: string;
}

export function PwaNavBar({
  activeTab,
  onTabChange,
  callQueueCount = 4,
  unverifiedLeadsCount = 66,
  theme = "dark",
  className = "",
}: PwaNavBarProps) {
  const isLight = theme === "light";

  const tabs: Array<{ id: PwaTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    {
      id: "call_log",
      label: "Call Log",
      icon: <PhoneCall className="w-4 h-4" />,
      badge: callQueueCount > 0 ? callQueueCount : undefined,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: "chat",
      label: "Chat",
      icon: <Bot className="w-4 h-4" />,
      badge: "AI",
    },
  ];

  return (
    <nav
      aria-label="PWA Navigation"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md mx-auto rounded-full p-1.5 border transition-all duration-300 select-none shadow-2xl ${
        isLight
          ? "bg-white/85 border-slate-200/90 text-slate-700 shadow-slate-900/10 backdrop-blur-2xl"
          : "bg-black/75 border-white/15 text-neutral-300 shadow-black/80 backdrop-blur-2xl"
      } ${className}`}
      style={{
        paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? isLight
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-[#00FFFF] text-black shadow-lg shadow-[#00FFFF]/25 font-bold"
                  : isLight
                  ? "hover:bg-slate-100 text-slate-600"
                  : "hover:bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="tracking-tight">{tab.label}</span>

              {/* Badge Indicator */}
              {tab.badge !== undefined && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    isActive
                      ? isLight
                        ? "bg-white/20 text-white"
                        : "bg-black/25 text-black"
                      : isLight
                      ? "bg-teal-100 text-teal-800"
                      : "bg-[#00FFFF]/15 text-[#00FFFF] border border-[#00FFFF]/30"
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active Sub-Pill Dot */}
              {isActive && (
                <span
                  className={`absolute -bottom-1 w-1 h-1 rounded-full ${
                    isLight ? "bg-slate-900" : "bg-[#00FFFF]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
