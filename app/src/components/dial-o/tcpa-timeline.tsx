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
  onHoverLead?: (leadId: string | null) => void;
  onTriggerCall?: (leadId: string) => void;
  theme?: "dark" | "light";
  className?: string;
}

const DEFAULT_SLOTS: ScheduledLeadSlot[] = [
  {
    id: "slot-1",
    time: "09:30 AM",
    leadId: "lead-austin-1",
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
    leadId: "lead-austin-2",
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
    leadId: "lead-mockup-1",
    businessName: "Scholar's IT Limited",
    category: "Educational Institution",
    phone: "01707-172825",
    timezone: "BST (UTC+6)",
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
    leadId: "lead-mockup-2",
    businessName: "Board of Education, Dhaka",
    category: "Public Education Entity",
    phone: "029660015",
    timezone: "BST (UTC+6)",
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
  onHoverLead,
  onTriggerCall,
  theme = "light",
  className = "",
}: TcpaTimelineProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`flex flex-col h-full min-h-0 p-3 sm:p-3.5 rounded-3xl transition-all duration-300 ${
        isLight
          ? "bg-[#FFFDF9] border border-black/10 shadow-sm"
          : "bg-[#111111]/85 border border-white/10 backdrop-blur-xl"
      } ${className}`}
    >
      {/* Panel Header */}
      <div className="shrink-0 flex items-center justify-between mb-3 px-1">
        <h3
          className={`text-sm font-sf-bold tracking-tight ${
            isLight ? "text-neutral-900" : "text-white"
          }`}
        >
          Call Queue
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-sf-bold ${
            isLight
              ? "bg-[#FF751F]/15 text-[#FF5722] border border-[#FF5722]/30"
              : "bg-[#FF751F]/20 text-[#FF751F] border border-[#FF751F]/40"
          }`}
        >
          {slots.length}
        </span>
      </div>

      {/* Schedule Items Feed (Scrollable within column) */}
      <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto overflow-x-hidden pr-0.5 scrollbar-thin">
        {slots.map((slot) => {
          const isSelected = selectedLeadId === slot.leadId;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectLead && onSelectLead(slot.leadId)}
              onMouseEnter={() => onHoverLead && onHoverLead(slot.leadId)}
              onMouseLeave={() => onHoverLead && onHoverLead(null)}
              className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? isLight
                    ? "bg-white border-[#FF5722] ring-2 ring-[#FF5722]/20 shadow-md"
                    : "bg-[#181818] border-[#FF751F] ring-1 ring-[#FF751F]/40 shadow-lg shadow-[#FF751F]/10"
                  : isLight
                  ? "bg-white border-black/10 hover:border-[#FF5722]/50 hover:shadow-md hover:translate-y-[-1px]"
                  : "bg-white/[0.03] border-white/10 hover:border-[#FF751F]/40 hover:bg-white/[0.05] hover:translate-y-[-1px]"
              }`}
            >
              {/* Top Row: Time Badge + Status Pill + Call Button */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] leading-none interactive-weight ${
                      isSelected
                        ? "font-sf-bold text-[#FF5722] dark:text-[#FF751F]"
                        : isLight
                        ? "font-sf-light text-neutral-800 group-hover:font-sf-bold group-hover:text-black"
                        : "font-sf-light text-neutral-300 group-hover:font-sf-bold group-hover:text-white"
                    }`}
                  >
                    <Clock className="w-3 h-3 text-[#FF5722] shrink-0" />
                    {slot.time}
                  </span>
                  {slot.status === "CALLING" && (
                    <span className="text-[9px] font-sf-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30 animate-pulse">
                      Calling
                    </span>
                  )}
                </div>

                {/* Direct Call Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerCall && onTriggerCall(slot.leadId);
                  }}
                  title="Initiate Live CALL-E Speech Verification"
                  className="w-6 h-6 rounded-lg bg-[#FF751F] hover:bg-[#FF5722] text-white flex items-center justify-center shadow-sm shadow-[#FF5722]/20 active:scale-90 transition-all shrink-0 cursor-pointer"
                >
                  <Phone className="w-3 h-3 fill-white text-white" />
                </button>
              </div>

              {/* Business Name */}
              <h4
                className={`text-xs tracking-tight truncate interactive-weight ${
                  isSelected
                    ? isLight ? "font-sf-bold text-neutral-900" : "font-sf-bold text-white"
                    : isLight
                    ? "font-sf-light text-neutral-900 group-hover:font-sf-bold group-hover:text-black"
                    : "font-sf-light text-neutral-200 group-hover:font-sf-bold group-hover:text-white"
                }`}
              >
                {slot.businessName}
              </h4>

              {/* Category (High-contrast clear reading font in light view) */}
              <p
                className={`text-[11px] truncate mt-0.5 interactive-weight ${
                  isSelected
                    ? isLight ? "font-sf-bold text-neutral-900" : "font-sf-bold text-white"
                    : isLight
                    ? "font-sf-light text-neutral-700 group-hover:font-sf-bold group-hover:text-black"
                    : "font-sf-light text-neutral-300 group-hover:font-sf-bold group-hover:text-white"
                }`}
              >
                {slot.category}
              </p>

              {/* Bottom Row: Contact Avatars + Verification / Timezone Badge */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                {/* Overlapping Avatar Stack */}
                <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                  {slot.avatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Contact"
                      className="inline-block h-4.5 w-4.5 rounded-full ring-1 ring-white dark:ring-black object-cover"
                    />
                  ))}
                </div>

                {/* Status / Timezone */}
                {slot.status === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1 font-sf-bold text-[10px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span
                    className={`text-[10px] interactive-weight ${
                      isSelected
                        ? isLight ? "font-sf-bold text-neutral-800" : "font-sf-bold text-neutral-200"
                        : isLight
                        ? "font-sf-light text-neutral-700 group-hover:font-sf-bold group-hover:text-black"
                        : "font-sf-thin text-neutral-400 group-hover:font-sf-light group-hover:text-neutral-200"
                    }`}
                  >
                    {slot.timezone}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="shrink-0 mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-end px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-[10px] font-sf-bold ${
              isLight ? "text-neutral-900" : "text-neutral-200"
            }`}
          >
            CALL-E Live
          </span>
        </div>
      </div>
    </div>
  );
}
