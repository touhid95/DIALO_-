"use client";

import React from "react";
import { Phone, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface ScheduledLeadSlot {
  id: string;
  time: string;
  leadId: string;
  businessName: string;
  category: string;
  phone: string;
  timezone: string;
  status: "SCHEDULED" | "CALLING" | "COMPLETED" | "VERIFIED";
  avatars: string[];
  tintColor?: "sage" | "mint" | "lavender" | "peach";
}

interface TcpaTimelineProps {
  slots?: ScheduledLeadSlot[];
  selectedLeadId?: string | null;
  onSelectLead?: (leadId: string) => void;
  onTriggerCall?: (leadId: string) => void;
  theme?: "dark" | "light";
  className?: string;
}

const DEFAULT_SLOTS: ScheduledLeadSlot[] = [
  {
    id: "slot-1",
    time: "09:30 AM",
    leadId: "lead-1",
    businessName: "Austin Smile Center",
    category: "Cosmetic & General Dentistry",
    phone: "+1 (512) 555-1001",
    timezone: "CST (UTC-6)",
    status: "VERIFIED",
    avatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "sage",
  },
  {
    id: "slot-2",
    time: "10:30 AM",
    leadId: "lead-2",
    businessName: "Lone Star Emergency Dental",
    category: "Emergency Dental Clinic",
    phone: "+1 (512) 555-1007",
    timezone: "CST (UTC-6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "mint",
  },
  {
    id: "slot-3",
    time: "11:30 AM",
    leadId: "lead-3",
    businessName: "Capital Metro Pediatric Care",
    category: "Pediatric Specialized Health",
    phone: "+1 (512) 555-1014",
    timezone: "CST (UTC-6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "lavender",
  },
  {
    id: "slot-4",
    time: "01:00 PM",
    leadId: "lead-4",
    businessName: "Texas Hill Country Implant Clinic",
    category: "Oral Surgery & Implants",
    phone: "+1 (512) 555-1022",
    timezone: "CST (UTC-6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "peach",
  },
];

export function TcpaTimeline({
  slots = DEFAULT_SLOTS,
  selectedLeadId,
  onSelectLead,
  onTriggerCall,
  theme = "dark",
  className = "",
}: TcpaTimelineProps) {
  const isLight = theme === "light";

  // Light mode soft pastel card tints (matching the reference image)
  const getCardStyle = (tint?: string, isSelected?: boolean) => {
    if (isLight) {
      const baseBorder = isSelected ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md" : "border-slate-200/70";
      switch (tint) {
        case "sage":
          return `bg-[#F1F5EB] ${baseBorder} text-slate-800`;
        case "mint":
          return `bg-[#EAF5EE] ${baseBorder} text-slate-800`;
        case "lavender":
          return `bg-[#F3EEFA] ${baseBorder} text-slate-800`;
        case "peach":
          return `bg-[#F8EFEA] ${baseBorder} text-slate-800`;
        default:
          return `bg-[#F4F6F8] ${baseBorder} text-slate-800`;
      }
    } else {
      const baseBorder = isSelected ? "border-[#00FFFF] ring-1 ring-[#00FFFF]/40 shadow-lg shadow-[#00FFFF]/5" : "border-white/[0.08]";
      switch (tint) {
        case "sage":
          return `bg-gradient-to-br from-emerald-950/30 to-black/60 ${baseBorder} text-neutral-200`;
        case "mint":
          return `bg-gradient-to-br from-teal-950/30 to-black/60 ${baseBorder} text-neutral-200`;
        case "lavender":
          return `bg-gradient-to-br from-purple-950/30 to-black/60 ${baseBorder} text-neutral-200`;
        case "peach":
          return `bg-gradient-to-br from-amber-950/30 to-black/60 ${baseBorder} text-neutral-200`;
        default:
          return `bg-black/50 ${baseBorder} text-neutral-200`;
      }
    }
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-3xl transition-all duration-300 ${
        isLight
          ? "bg-white/90 border border-slate-200 shadow-sm"
          : "bg-[#0d0d0d]/80 border border-white/[0.08] backdrop-blur-xl"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h3
            className={`text-sm font-semibold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Call Queue
          </h3>
          <p
            className={`text-[11px] font-mono flex items-center gap-1 mt-0.5 ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            TCPA 08:00-20:00 Window
          </p>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
            isLight
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30"
          }`}
        >
          {slots.length} Ready
        </span>
      </div>

      {/* Schedule Items Feed */}
      <div className="space-y-4 overflow-y-auto max-h-[620px] pr-1 scrollbar-thin">
        {slots.map((slot) => {
          const isSelected = selectedLeadId === slot.leadId;

          return (
            <div key={slot.id} className="flex items-start gap-3 group">
              {/* Left Timestamp */}
              <div className="w-16 shrink-0 pt-2 text-right">
                <span
                  className={`text-[11px] font-mono font-medium block leading-none ${
                    isLight ? "text-slate-500" : "text-neutral-400"
                  }`}
                >
                  {slot.time}
                </span>
                <span className="text-[9px] font-mono text-emerald-500 font-semibold block mt-1">
                  Open
                </span>
              </div>

              {/* iOS Squircle Schedule Card */}
              <div
                onClick={() => onSelectLead && onSelectLead(slot.leadId)}
                className={`flex-1 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${getCardStyle(
                  slot.tintColor,
                  isSelected
                )} hover:scale-[1.01] active:scale-[0.99]`}
              >
                <div className="flex items-center justify-between mb-2">
                  {/* Overlapping Avatar Stack */}
                  <div className="flex -space-x-2 overflow-hidden">
                    {slot.avatars.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt="Contact avatar"
                        className={`inline-block h-6 w-6 rounded-full ring-2 object-cover ${
                          isLight ? "ring-white" : "ring-neutral-900"
                        }`}
                      />
                    ))}
                  </div>

                  {/* One-Tap Phone Call Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTriggerCall) onTriggerCall(slot.leadId);
                    }}
                    title="Dispatch CALL-E Autonomous Call"
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                      isLight
                        ? "bg-white text-slate-700 hover:bg-teal-600 hover:text-white shadow-sm border border-slate-200"
                        : "bg-white/10 text-neutral-200 hover:bg-[#00FFFF] hover:text-black hover:shadow-lg hover:shadow-[#00FFFF]/20 border border-white/10"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Business Title & Details */}
                <h4
                  className={`text-xs font-semibold tracking-tight line-clamp-1 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {slot.businessName}
                </h4>

                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 text-[10px]">
                  <span
                    className={`font-mono truncate max-w-[130px] ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}
                  >
                    {slot.category}
                  </span>
                  {slot.status === "VERIFIED" ? (
                    <span className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span
                      className={`font-mono ${
                        isLight ? "text-slate-500" : "text-neutral-400"
                      }`}
                    >
                      {slot.timezone.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between px-1">
        <span
          className={`text-[10px] font-mono ${
            isLight ? "text-slate-500" : "text-neutral-400"
          }`}
        >
          Auto-pacing: 1 call / 3m
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-[10px] font-mono font-medium ${
              isLight ? "text-slate-700" : "text-neutral-300"
            }`}
          >
            CALL-E Agent Live
          </span>
        </div>
      </div>
    </div>
  );
}
