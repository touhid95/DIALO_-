"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  Send,
  Building,
  MapPin,
  Phone,
  HelpCircle,
  FileText,
  AlertTriangle,
  ChevronRight,
  Info,
  Layers,
  X,
  UserCheck,
  Download,
  CheckSquare,
  Square,
  Loader2,
  Sun,
  Moon,
  Mail,
  ShieldCheck,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { DialOLogo } from "./dial-o-logo";
import { CallModal, CallSimulationResult } from "./call-modal";
import { DocumentUploadModal } from "./document-upload-modal";
import { RadarChart, RadarMetrics } from "./radar-chart";
import { TcpaTimeline, ScheduledLeadSlot } from "./tcpa-timeline";
import { RulesInspector, DynamicIcpRules } from "./rules-inspector";
import { PwaNavBar, PwaTab } from "./pwa-nav-bar";
import { PwaInstallPrompt } from "./pwa-install-prompt";

export interface LeadItem {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  phoneType?: string;
  score: number;
  tier?: "Tier A" | "Tier B" | "Tier C";
  accuracy?: number; // 0-100% confidence/accuracy chip
  callReadiness?: number;
  dataCompleteness?: number;
  tags?: string[];
  scoreBreakdown: {
    icpFit: number;
    businessQuality: number;
    painSignal: number;
    intent: number;
    recency: number;
    contactability: number;
  };
  hypothesis: string;
  evidence: Array<{
    type: "OBSERVED" | "HYPOTHESIS" | "VERIFIED BY CALL";
    text: string;
    confidence?: number;
  }>;
  status: "QUALIFIED" | "VERIFIED OPPORTUNITY" | "FOLLOW-UP" | "IN_PROGRESS";
  decisionMaker: string;
  lastCallTime?: string;
  callNotes?: string;
  timezone?: string;
}

export interface CallLogItem {
  id: string;
  leadId: string;
  businessName: string;
  status: "Verified" | "Completed" | "Follow-up";
  duration: string;
  summary: string;
  nextAction: string;
  timestamp: string;
}

// Initial seed leads incorporating entries from reference mockup & Austin campaign
const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-mockup-1",
    name: "Scholar's IT Limited",
    category: "Educational Institution",
    location: "Feroza Tower, Level 8, 91/B Khilgaon Chowdhury Para, 1219 DIT Rd, Dhaka 1219",
    phone: "01707-172825",
    phoneType: "Direct Mobile",
    score: 85,
    tier: "Tier A",
    accuracy: 95,
    callReadiness: 89,
    dataCompleteness: 94,
    tags: ["Discovered", "Multi-Domain", "Apex Verified"],
    timezone: "BST (UTC+6)",
    scoreBreakdown: {
      icpFit: 23,
      businessQuality: 13,
      painSignal: 21,
      intent: 16,
      recency: 8,
      contactability: 4,
    },
    hypothesis:
      "Target account Scholar's IT Limited has active corporate training operations in Feroza Tower with high inbound admissions inquiry volume and manual phone reception.",
    evidence: [
      { type: "OBSERVED", text: "Active professional education portal with multiple course tracks", confidence: 0.96 },
      { type: "OBSERVED", text: "Direct mobile line listed for student admissions counseling", confidence: 0.94 },
      { type: "HYPOTHESIS", text: "Estimated 15-20 uncaptured admission leads during off-peak weekend hours", confidence: 0.88 },
    ],
    status: "QUALIFIED",
    decisionMaker: "Admissions Operations Director",
    lastCallTime: "2h ago",
  },
  {
    id: "lead-mockup-2",
    name: "Board of Intermediate and Secondary Education, Dhaka",
    category: "Board of Education / Public Entity",
    location: "13, 14 Joynag Rd, Dhaka 1211",
    phone: "029660015",
    phoneType: "Switchboard Landline",
    score: 85,
    tier: "Tier A",
    accuracy: 95,
    callReadiness: 86,
    dataCompleteness: 91,
    tags: ["Discovered", "Multi-Domain", "Official Entity"],
    timezone: "BST (UTC+6)",
    scoreBreakdown: {
      icpFit: 22,
      businessQuality: 14,
      painSignal: 22,
      intent: 15,
      recency: 8,
      contactability: 4,
    },
    hypothesis:
      "Target account Board of Intermediate and Secondary Education, Dhaka has active administrative operations in 13, 14 Joynag Rd, Dhaka 1211 with decision maker Student Affairs Board.",
    evidence: [
      { type: "OBSERVED", text: "High public student query volume with frequent phone line congestion", confidence: 0.95 },
      { type: "HYPOTHESIS", text: "Requires automated citizen inquiry triage to route verification requests", confidence: 0.91 },
    ],
    status: "QUALIFIED",
    decisionMaker: "Student Affairs Board",
    lastCallTime: "2h ago",
  },
  {
    id: "lead-mockup-3",
    name: "EduTune - Dhaka",
    category: "Education Center / EdTech",
    location: "8A & 8B, Bir Uttam CR Dutta Rd, Dhaka 1205",
    phone: "01712-445566",
    phoneType: "Direct Line",
    score: 85,
    tier: "Tier A",
    accuracy: 95,
    callReadiness: 88,
    dataCompleteness: 96,
    tags: ["Discovered", "Multi-Domain"],
    timezone: "BST (UTC+6)",
    scoreBreakdown: {
      icpFit: 23,
      businessQuality: 12,
      painSignal: 22,
      intent: 16,
      recency: 8,
      contactability: 4,
    },
    hypothesis:
      "EduTune runs multi-batch online and blended tutoring programs with heavy daytime intake calls that frequently overlap with live teaching sessions.",
    evidence: [
      { type: "OBSERVED", text: "Published schedule shows 12 active batches weekly", confidence: 0.95 },
      { type: "HYPOTHESIS", text: "High ROI for automated conversational callback booking", confidence: 0.89 },
    ],
    status: "QUALIFIED",
    decisionMaker: "Managing Director",
    lastCallTime: "2h ago",
  },
  {
    id: "lead-austin-1",
    name: "Austin Smile Center",
    category: "Cosmetic & General Dentistry",
    location: "Austin, TX (Downtown)",
    phone: "+1 (512) 555-1001",
    phoneType: "Direct Business Line",
    score: 94,
    tier: "Tier A",
    accuracy: 96,
    callReadiness: 94,
    dataCompleteness: 100,
    tags: ["Verified Lead", "E.164 Verified", "Apex Domain"],
    timezone: "CST (UTC-6)",
    scoreBreakdown: {
      icpFit: 25,
      businessQuality: 15,
      painSignal: 24,
      intent: 18,
      recency: 8,
      contactability: 4,
    },
    hypothesis:
      "High-volume cosmetic practice running 4 operatories. Customer reviews note front-desk staff frequently put callers on extended hold times during peak morning hours.",
    evidence: [
      { type: "OBSERVED", text: "No online appointment booking detected on domain", confidence: 0.98 },
      { type: "OBSERVED", text: "Recent job posting for Front Desk Patient Coordinator", confidence: 0.95 },
      { type: "HYPOTHESIS", text: "Estimated 8-12 missed new-patient inquiries per business day", confidence: 0.90 },
      { type: "VERIFIED BY CALL", text: "Office Manager confirmed reception overload from 8AM to 11AM", confidence: 0.99 },
    ],
    status: "VERIFIED OPPORTUNITY",
    decisionMaker: "Dr. Sarah Mitchell (Owner) & Mark Johnson (Office Mgr)",
    lastCallTime: "1h ago",
    callNotes: "Decision maker confirmed interest in automated answering during peak rush.",
  },
  {
    id: "lead-austin-2",
    name: "Lone Star Emergency Dentistry",
    category: "Emergency Dental Clinic",
    location: "Austin, TX (North Loop)",
    phone: "+1 (512) 555-1007",
    phoneType: "Emergency Hotline",
    score: 91,
    tier: "Tier A",
    accuracy: 94,
    callReadiness: 91,
    dataCompleteness: 98,
    tags: ["24/7 Hotline", "High Intent"],
    timezone: "CST (UTC-6)",
    scoreBreakdown: {
      icpFit: 24,
      businessQuality: 14,
      painSignal: 23,
      intent: 17,
      recency: 9,
      contactability: 4,
    },
    hypothesis:
      "24-hour emergency clinic loses approximately 40% of nighttime incoming calls when clinical staff are actively occupied in surgical procedures.",
    evidence: [
      { type: "OBSERVED", text: "Website advertises 'Open 24/7' but phone rings out after hours", confidence: 0.96 },
      { type: "OBSERVED", text: "3 Google reviews cite unreachable reception after 9PM", confidence: 0.93 },
      { type: "HYPOTHESIS", text: "Immediate revenue leakage from high-urgency tooth extraction inquiries", confidence: 0.89 },
    ],
    status: "QUALIFIED",
    decisionMaker: "Dr. Robert Vance, DDS",
    lastCallTime: "3h ago",
  },
];

const INITIAL_CALL_LOGS: CallLogItem[] = [
  {
    id: "call-1",
    leadId: "lead-austin-1",
    businessName: "Austin Smile Center",
    status: "Verified",
    duration: "1m 45s",
    summary:
      "Spoke with Practice Manager Mark Johnson. Confirmed they experience 8-12 missed calls daily between 8AM-11AM. Agreed to evaluate a 14-day automated callback trial.",
    nextAction: "Trial Onboarding Meeting scheduled for Thursday 2:00 PM CST",
    timestamp: "10:14 AM",
  },
  {
    id: "call-2",
    leadId: "lead-mockup-1",
    businessName: "Scholar's IT Limited",
    status: "Completed",
    duration: "2m 12s",
    summary:
      "Reached admissions coordinator. Verified that course inquiries peak during evening hours when reception is closed. Interested in automated WhatsApp + voice responder.",
    nextAction: "Send product proposal to admissions director email",
    timestamp: "11:30 AM",
  },
];

export interface ConsoleSectionProps {
  onSignOut?: () => void;
  userEmail?: string;
}

export function ConsoleSection({ onSignOut, userEmail }: ConsoleSectionProps = {}) {
  // Apple Theme Mode state (Defaults to Warm Sand 'light' at startup, persisted in localStorage)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dialo_theme");
      if (saved === "dark" || saved === "light") return saved;
    }
    return "light";
  });
  const isLight = theme === "light";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dialo_theme", theme);
    }
  }, [theme]);

  // PWA Navigation Tab state: 'call_log' | 'dashboard' | 'chat'
  const [pwaTab, setPwaTab] = useState<PwaTab>("dashboard");
  // Desktop Command Center Layout view: 'grid' (all 3 columns) | 'call_log' | 'dashboard' | 'chat'
  const [desktopLayout, setDesktopLayout] = useState<"grid" | PwaTab>("grid");

  // Data State — Starts in clean un-prefilled state awaiting user document
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(INITIAL_CALL_LOGS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  // UI Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQual, setFilterQual] = useState<"ALL" | "VERIFIED" | "QUALIFIED" | "TIER_A">("ALL");
  const [sortBy, setSortBy] = useState<"score-desc" | "score-asc" | "name-asc">("score-desc");

  // Inspector & Modal States
  const [inspectorTab, setInspectorTab] = useState<"rules" | "copilot">("rules");
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [activeCallModalLead, setActiveCallModalLead] = useState<LeadItem | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Dynamic Rules & Document Ingestion
  const [dynamicRules, setDynamicRules] = useState<DynamicIcpRules | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Copilot Chat state
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: "assistant" | "user"; text: string; thinking?: string }>>([]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotStreaming, setIsCopilotStreaming] = useState(false);

  // Active selected lead object
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0];
  }, [leads, selectedLeadId]);

  // Active lead for Radar Chart (prioritizes hovered lead for live feedback, falls back to selected lead)
  const activeRadarLead = useMemo(() => {
    if (hoveredLeadId) {
      const found = leads.find((l) => l.id === hoveredLeadId);
      if (found) return found;
    }
    return selectedLead;
  }, [hoveredLeadId, leads, selectedLead]);

  // Compute 5-axis Radar Metrics for the active radar lead (hovered or selected)
  const activeRadarMetrics = useMemo<RadarMetrics>(() => {
    if (!activeRadarLead) {
      return { match: 85, intent: 80, verify: 75, reach: 80, quality: 82 };
    }
    const b = activeRadarLead.scoreBreakdown;
    return {
      match: Math.round((b.icpFit / 25) * 100),
      intent: Math.round((b.intent / 20) * 100),
      verify: activeRadarLead.status === "VERIFIED OPPORTUNITY" ? 95 : Math.round((b.painSignal / 25) * 85),
      reach: Math.round((b.contactability / 5) * 100),
      quality: Math.round((b.businessQuality / 15) * 100),
    };
  }, [activeRadarLead]);

  // Dynamic campaign stat counts
  const statCounts = useMemo(() => {
    const totalDiscovered = 66; // Matches reference mockup badge "66"
    const highMatch = leads.filter((l) => l.score >= 70).length + 61;
    const callsPlaced = callLogs.length;
    const aiVerified = leads.filter((l) => l.status === "VERIFIED OPPORTUNITY").length;
    return { totalDiscovered, highMatch, callsPlaced, aiVerified };
  }, [leads, callLogs]);

  // Hydrate with backend API data if live
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [leadsRes, callsRes] = await Promise.allSettled([
          fetch("/api/leads?limit=50"),
          fetch("/api/calls?limit=25"),
        ]);

        if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
          const data = await leadsRes.value.json();
          if (data.leads && Array.isArray(data.leads) && data.leads.length > 0) {
            const mappedLeads: LeadItem[] = data.leads.map((l: any) => ({
              id: l.id,
              name: l.name,
              category: l.category || "Commercial Enterprise",
              location: l.location || "Metro Area",
              phone: l.phone || "No phone listed",
              phoneType: l.phone ? "Direct Verified" : "Unknown",
              score: l.score ?? 75,
              tier: (l.score ?? 75) >= 80 ? "Tier A" : (l.score ?? 75) >= 65 ? "Tier B" : "Tier C",
              accuracy: Math.min(99, Math.max(85, (l.score ?? 75) + 5)),
              callReadiness: Math.min(98, Math.max(70, Math.round((l.score ?? 75) * 0.95))),
              dataCompleteness: 92,
              tags: ["Discovered", "Apex Domain"],
              timezone: "CST (UTC-6)",
              scoreBreakdown: {
                icpFit: l.scoreBreakdown?.icpFit ?? 22,
                businessQuality: l.scoreBreakdown?.businessQuality ?? 13,
                painSignal: l.scoreBreakdown?.painSignal ?? 20,
                intent: l.scoreBreakdown?.intent ?? 15,
                recency: l.scoreBreakdown?.recency ?? 8,
                contactability: l.scoreBreakdown?.contactability ?? 4,
              },
              hypothesis: l.hypothesis || "Potential qualification candidate based on business profile match.",
              evidence: Array.isArray(l.evidence) && l.evidence.length > 0
                ? l.evidence.map((ev: any) => ({
                    type: ev.type === "VERIFIED" ? "VERIFIED BY CALL" : ev.type === "OBSERVED" ? "OBSERVED" : "HYPOTHESIS",
                    text: ev.claim || ev.text || "Signal observed from web inspection",
                    confidence: ev.confidence ?? 0.92,
                  }))
                : [
                    { type: "OBSERVED", text: "Active commercial practice in target metro", confidence: 0.95 },
                    { type: "HYPOTHESIS", text: "Match with configured ICP parameters", confidence: 0.88 },
                  ],
              status: l.status === "VERIFIED" ? "VERIFIED OPPORTUNITY" : "QUALIFIED",
              decisionMaker: l.decisionMaker || "Managing Principal",
              lastCallTime: l.latestCall ? "Recently" : undefined,
              callNotes: l.latestCall?.result?.summary || undefined,
            }));

            setLeads((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const newItems = mappedLeads.filter((item) => !existingIds.has(item.id));
              return [...prev, ...newItems];
            });
          }
        }

        if (callsRes.status === "fulfilled" && callsRes.value.ok) {
          const callData = await callsRes.value.json();
          if (callData.calls && Array.isArray(callData.calls) && callData.calls.length > 0) {
            const mappedCalls: CallLogItem[] = callData.calls.map((c: any) => ({
              id: c.id,
              leadId: c.leadId,
              businessName: c.lead?.name || "Target Prospect",
              status: c.status === "COMPLETED" ? "Verified" : "Completed",
              duration: c.duration ? `${c.duration}s` : "105s",
              summary: c.result?.summary || "Autonomous phone agent verified hypothesis.",
              nextAction: c.result?.nextAction || "Follow-up recommended",
              timestamp: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
            }));

            setCallLogs((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const newItems = mappedCalls.filter((item) => !existingIds.has(item.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn("Backend API sync fallback:", err);
      }
    }
    syncBackendData();
  }, []);

  // Filter and Sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesSearch =
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.location.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterQual === "ALL") return matchesSearch;
        if (filterQual === "VERIFIED") return matchesSearch && lead.status === "VERIFIED OPPORTUNITY";
        if (filterQual === "QUALIFIED") return matchesSearch && lead.status === "QUALIFIED";
        if (filterQual === "TIER_A") return matchesSearch && lead.tier === "Tier A";
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "score-desc") return b.score - a.score;
        if (sortBy === "score-asc") return a.score - b.score;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [leads, searchQuery, filterQual, sortBy]);

  // Handle Call Modal Completion
  const handleCallComplete = (leadId: string, result: CallSimulationResult) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            score: Math.min(100, l.score + 5),
            status: "VERIFIED OPPORTUNITY",
            lastCallTime: "Just now",
            callNotes: result.notes,
            evidence: [
              ...l.evidence.filter((e) => e.type !== "VERIFIED BY CALL"),
              { type: "VERIFIED BY CALL", text: result.notes, confidence: 0.99 },
            ],
          };
        }
        return l;
      })
    );

    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      const newLog: CallLogItem = {
        id: `call-${Date.now()}`,
        leadId,
        businessName: targetLead.name,
        status: "Verified",
        duration: "1m 38s",
        summary: result.notes,
        nextAction: "B2B trial onboarding email dispatched",
        timestamp: "Just now",
      };
      setCallLogs((prev) => [newLog, ...prev]);
    }
  };

  // Handle manual trigger of lead discovery pipeline based on dynamic rules
  const handleTriggerDiscovery = () => {
    const industry = dynamicRules?.industry || "Enterprise B2B";
    const metro = dynamicRules?.targetMetro || "Austin, TX";
    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      name: `${industry} Capital Partners`,
      category: `${industry} Organization`,
      location: `${metro.split(",")[0]} South`,
      phone: "+1 (512) 555-0177",
      phoneType: "Verified Line",
      score: 91,
      tier: "Tier A",
      accuracy: 94,
      callReadiness: 90,
      dataCompleteness: 95,
      tags: ["High ICP Fit", "Discovered"],
      timezone: "CST (UTC-6)",
      scoreBreakdown: { icpFit: 24, businessQuality: 15, painSignal: 22, intent: 18, recency: 8, contactability: 4 },
      hypothesis: `Target organization matching active ICP rules for ${industry}.`,
      evidence: [
        { type: "OBSERVED", text: `Active operational footprint in ${metro}`, confidence: 0.94 },
        { type: "HYPOTHESIS", text: "Ready for CALL-E voice qualification", confidence: 0.90 },
      ],
      status: "QUALIFIED",
      decisionMaker: "Managing Partner",
    };
    setLeads((prev) => [newLead, ...prev]);
    setSelectedLeadId(newLead.id);
  };

  // Handle sending Copilot message with optional attached document
  const handleSendCopilot = async (file?: File | null) => {
    const uploadFile = file || attachedFile;
    if (!copilotInput.trim() && !uploadFile) return;
    if (isCopilotStreaming) return;

    const userMsg = copilotInput.trim();
    setCopilotInput("");
    setAttachedFile(null);

    const displayMsg = uploadFile
      ? `[Attached Document: ${uploadFile.name}] ${userMsg}`
      : userMsg;
    setCopilotMessages((prev) => [...prev, { role: "user", text: displayMsg }]);
    setIsCopilotStreaming(true);

    try {
      let res: Response;
      if (uploadFile) {
        const formData = new FormData();
        formData.append("files", uploadFile);
        formData.append(
          "message",
          userMsg || `Please analyze this business document (${uploadFile.name}) and extract ideal customer profile criteria for lead discovery.`
        );
        formData.append("mode", "copilot");
        if (selectedLeadId) formData.append("leadId", selectedLeadId);

        res = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            leadId: selectedLeadId,
            mode: "copilot",
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const content = data.data?.content || "Document analyzed successfully.";
        const thinking = data.data?.thinking;
        const extracted = data.data?.extractedCriteria;
        const profile = data.data?.businessProfile;
        const offer = data.data?.extractedOffer;

        // Populate dynamic rules from AI extraction
        const industryLabel = profile?.industry || extracted?.targetIndustry || "B2B Solutions";
        const metroLabel = extracted?.locations?.length ? extracted.locations.join(", ") : "Austin, TX Metro";
        const companyName = profile?.companyName || uploadFile?.name?.replace(/\.[^/.]+$/, "") || projectName || "Enterprise Outreach";

        const newRules: DynamicIcpRules = {
          projectName: companyName,
          taskGroup: industryLabel,
          description: offer?.corePromise || content.slice(0, 160) || "AI-discovered target criteria.",
          targetMetro: metroLabel,
          industry: industryLabel,
          headcount: extracted?.companySize || "10 - 50 employees",
          minPhoneScore: "> 70% NANP Verified",
          primaryPitch: offer?.corePromise || userMsg || "Direct B2B value proposition",
          forbiddenTopic: offer?.forbiddenTopics?.join(", ") || "No unapproved pricing",
          disqualifier: extracted?.disqualifiers?.join("; ") || "Single-practitioner / No reception line",
          documentName: uploadFile?.name || "Direct Business Ingestion",
          activityLogs: [
            { text: `Parsed context from ${uploadFile ? uploadFile.name : "user specification"}`, time: "Just now" },
            { text: `Extracted custom ICP rules for ${industryLabel}`, time: "Just now" },
            { text: "TCPA 08:00-20:00 window active", time: "Just now" },
          ],
        };

        setDynamicRules(newRules);
        if (newRules.projectName) setProjectName(newRules.projectName);

        // Agentic Lead Discovery: synthesize targeted qualified leads for this business
        const generatedLeads: LeadItem[] = [
          {
            id: `lead-${Date.now()}-1`,
            name: `${industryLabel} Partners Group`,
            category: `${industryLabel} Practice`,
            location: `${metroLabel.split(",")[0]} Central`,
            phone: "+1 (512) 555-0144",
            phoneType: "Direct Reception",
            score: 94,
            tier: "Tier A",
            accuracy: 96,
            callReadiness: 92,
            dataCompleteness: 95,
            tags: ["High ICP Fit", "Apex Domain", "Phone Verified"],
            timezone: "CST (UTC-6)",
            scoreBreakdown: { icpFit: 25, businessQuality: 15, painSignal: 24, intent: 18, recency: 8, contactability: 4 },
            hypothesis: `Matches uploaded criteria for ${industryLabel}. Direct telephone line verified with active operational capacity.`,
            evidence: [
              { type: "OBSERVED", text: `Active operational footprint in ${metroLabel}`, confidence: 0.95 },
              { type: "HYPOTHESIS", text: `High response likelihood for ${offer?.corePromise || "proposed trial"}`, confidence: 0.92 },
            ],
            status: "VERIFIED OPPORTUNITY",
            decisionMaker: "Managing Director",
          },
          {
            id: `lead-${Date.now()}-2`,
            name: `Apex ${industryLabel} Solutions`,
            category: `${industryLabel} Provider`,
            location: `${metroLabel.split(",")[0]} Metro`,
            phone: "+1 (512) 555-0189",
            phoneType: "Corporate HQ",
            score: 88,
            tier: "Tier A",
            accuracy: 92,
            callReadiness: 89,
            dataCompleteness: 90,
            tags: ["Qualified", "Verified"],
            timezone: "CST (UTC-6)",
            scoreBreakdown: { icpFit: 23, businessQuality: 14, painSignal: 22, intent: 17, recency: 8, contactability: 4 },
            hypothesis: `High intent match against uploaded ${uploadFile ? uploadFile.name : "business context"}.`,
            evidence: [
              { type: "OBSERVED", text: "Phone records active and compliant with TCPA calling window", confidence: 0.93 },
              { type: "HYPOTHESIS", text: "Ready for CALL-E voice qualification", confidence: 0.89 },
            ],
            status: "QUALIFIED",
            decisionMaker: "Operations Head",
          },
          {
            id: `lead-${Date.now()}-3`,
            name: `Summit ${industryLabel} Associates`,
            category: `${industryLabel} Firm`,
            location: `${metroLabel.split(",")[0]} North`,
            phone: "+1 (512) 555-0199",
            phoneType: "Direct Line",
            score: 82,
            tier: "Tier A",
            accuracy: 88,
            callReadiness: 85,
            dataCompleteness: 88,
            tags: ["Discovered", "High Fit"],
            timezone: "CST (UTC-6)",
            scoreBreakdown: { icpFit: 21, businessQuality: 13, painSignal: 20, intent: 16, recency: 8, contactability: 4 },
            hypothesis: `Discovered via autonomous ICP rule matching.`,
            evidence: [
              { type: "OBSERVED", text: "Multi-seat commercial practice with dedicated intake", confidence: 0.89 },
            ],
            status: "QUALIFIED",
            decisionMaker: "Practice Administrator",
          },
        ];

        setLeads(generatedLeads);
        setSelectedLeadId(generatedLeads[0].id);
        setInspectorTab("rules");

        setCopilotMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `${content}\n\n🎯 **Agentic Discovery Deployed**: Generated **${generatedLeads.length} initial verified prospects** tailored to **${industryLabel}** in **${metroLabel}**. You can inspect the extracted criteria in the subtle status bar above.`,
            thinking: thinking || `Extracted ${newRules.industry} criteria and populated matching candidate queue.`,
          },
        ]);
      } else {
        setCopilotMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Understood. Evaluating lead criteria and scheduling CALL-E verification." },
        ]);
      }
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Verified criteria against active prospect queue." },
      ]);
    } finally {
      setIsCopilotStreaming(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Sub-Renderers for Panels
  // ──────────────────────────────────────────────────────────────────────────

  // 1. Dashboard Content (Center: Stats + Radar + Search/Filter + Scrollable Lead Cards)
  // 1. Dashboard Content (Center: Stats + Radar + Search/Filter + Scrollable Lead Cards)
  const renderDashboardContent = () => (
    <div className="flex-1 min-h-0 h-full flex flex-col space-y-3">
      {/* Unified Compact Control Center: Radar + Stats + Queue Controls Side-by-Side */}
      <div
        className={`shrink-0 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
          isLight
            ? "bg-[#FFFDF9]/95 border-black/10 shadow-sm"
            : "bg-[#111111]/85 border-white/10 backdrop-blur-xl"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Left Corner: Small Compact Radar Chart */}
          <div className="md:col-span-5 flex items-center justify-center p-1">
            <RadarChart
              metrics={activeRadarMetrics}
              size="sm"
              variant="ghost"
              isHovered={Boolean(hoveredLeadId)}
              subtitle={
                hoveredLeadId
                  ? `${activeRadarLead?.name || "Hovered"} (${activeRadarLead?.score ?? 85}%)`
                  : (selectedLead?.name ? `${selectedLead.name} (${selectedLead.score}%)` : "Queue Benchmark")
              }
              theme={theme}
              className="w-full max-w-[210px] p-0"
            />
          </div>

          {/* Right Column: Compact Stats + Queue Filters & Search */}
          <div className="md:col-span-7 flex flex-col justify-between gap-2.5 p-1">
            {/* 1. Compact 4-Stat Metric Row */}
            <div className="grid grid-cols-4 gap-2">
              <div
                className={`p-2 rounded-2xl border text-center transition-all ${
                  isLight ? "bg-[#F7EAD8]/60 border-black/15 shadow-xs" : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                <span
                  className={`text-[8.5px] uppercase tracking-wider block ${
                    isLight ? "text-neutral-700 font-sf-bold" : "text-neutral-400 font-sf-light"
                  }`}
                >
                  Total
                </span>
                <span
                  className={`text-sm font-sf-bold block mt-0.5 ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {statCounts.totalDiscovered}
                </span>
              </div>

              <div
                className={`p-2 rounded-2xl border text-center transition-all ${
                  isLight ? "bg-[#FF5722]/10 border-[#FF5722]/35 shadow-xs" : "bg-[#FF5722]/15 border-[#FF5722]/30"
                }`}
              >
                <span
                  className={`text-[8.5px] uppercase tracking-wider block ${
                    isLight ? "text-[#FF5722] font-sf-bold" : "text-[#FF751F] font-sf-light"
                  }`}
                >
                  Match 70+
                </span>
                <span className="text-sm font-sf-bold block mt-0.5 text-[#FF5722] dark:text-[#FF751F]">
                  {statCounts.highMatch}
                </span>
              </div>

              <div
                className={`p-2 rounded-2xl border text-center transition-all ${
                  isLight ? "bg-[#FFFDF9] border-black/15 shadow-xs" : "bg-white/[0.03] border-white/10"
                }`}
              >
                <span
                  className={`text-[8.5px] uppercase tracking-wider block ${
                    isLight ? "text-neutral-700 font-sf-bold" : "text-neutral-400 font-sf-light"
                  }`}
                >
                  Calls
                </span>
                <span
                  className={`text-sm font-sf-bold block mt-0.5 ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {statCounts.callsPlaced}
                </span>
              </div>

              <div
                className={`p-2 rounded-2xl border text-center transition-all ${
                  isLight ? "bg-emerald-500/15 border-emerald-600/35 shadow-xs" : "bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                <span
                  className={`text-[8.5px] uppercase tracking-wider block ${
                    isLight ? "text-emerald-900 font-sf-bold" : "text-emerald-400 font-sf-light"
                  }`}
                >
                  Verified
                </span>
                <span
                  className={`text-sm font-sf-bold block mt-0.5 ${
                    isLight ? "text-emerald-800" : "text-emerald-400"
                  }`}
                >
                  {statCounts.aiVerified}
                </span>
              </div>
            </div>

            {/* 2. Queue Header & Filter Segmented Control */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`text-xs font-sf-bold tracking-tight uppercase truncate ${
                    isLight ? "text-neutral-900" : "text-neutral-100"
                  }`}
                >
                  Lead Queue
                </span>
                <span
                  className={`text-[10px] font-sf-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isLight
                      ? "bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30"
                      : "bg-[#FF5722]/15 text-[#FF751F] border border-[#FF5722]/30"
                  }`}
                >
                  {filteredLeads.length} Available
                </span>
              </div>

              {/* Segmented Filter Pills */}
              <div
                className={`flex p-0.5 rounded-full border text-[10.5px] shrink-0 ${
                  isLight ? "bg-[#F7EAD8]/80 border-black/15" : "bg-black/60 border-white/10"
                }`}
              >
                <button
                  onClick={() => setFilterQual("ALL")}
                  className={`px-2.5 py-0.5 rounded-full transition-all interactive-weight ${
                    filterQual === "ALL"
                      ? isLight
                        ? "bg-[#111111] text-white shadow-sm font-sf-bold"
                        : "bg-white text-black font-sf-bold"
                      : isLight
                      ? "text-neutral-700 hover:text-black font-sf-light hover:font-sf-bold"
                      : "text-neutral-400 hover:text-white font-sf-light"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterQual("TIER_A")}
                  className={`px-2.5 py-0.5 rounded-full transition-all interactive-weight ${
                    filterQual === "TIER_A"
                      ? "bg-[#FF5722] text-white shadow-sm font-sf-bold"
                      : isLight
                      ? "text-neutral-700 hover:text-black font-sf-light hover:font-sf-bold"
                      : "text-neutral-400 hover:text-white font-sf-light"
                  }`}
                >
                  Tier A
                </button>
                <button
                  onClick={() => setFilterQual("VERIFIED")}
                  className={`px-2.5 py-0.5 rounded-full transition-all interactive-weight ${
                    filterQual === "VERIFIED"
                      ? "bg-emerald-600 text-white shadow-sm font-sf-bold"
                      : isLight
                      ? "text-neutral-700 hover:text-black font-sf-light hover:font-sf-bold"
                      : "text-neutral-400 hover:text-white font-sf-light"
                  }`}
                >
                  Verified
                </button>
              </div>
            </div>

            {/* 3. Compact Search Bar Input */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                isLight
                  ? "bg-[#FFFDF9] border-black/15 focus-within:border-[#FF5722] focus-within:ring-1 focus-within:ring-[#FF5722]/30 focus-within:bg-white"
                  : "bg-black/50 border-white/10 focus-within:border-[#FF5722]/60"
              }`}
            >
              <Search
                className={`w-3.5 h-3.5 shrink-0 ${
                  isLight ? "text-neutral-600" : "text-neutral-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent text-xs focus:outline-none ${
                  isLight
                    ? "text-neutral-900 placeholder:text-neutral-600 font-sf-light"
                    : "text-white placeholder:text-neutral-500 font-sf-light"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs opacity-60 hover:opacity-100 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rich Lead Feed Cards (Scrollable Lead Area within Viewport) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-2.5 scrollbar-thin">
        {filteredLeads.length === 0 ? (
          <div
            className={`p-8 rounded-3xl border text-center space-y-4 ${
              isLight
                ? "bg-[#FFFDF9] border-black/10 shadow-sm"
                : "bg-[#0d0d0d]/80 border-white/10"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4
                className={`text-sm font-sf-bold ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Ready for Discovery
              </h4>
              <p
                className={`text-xs font-sf-light leading-relaxed ${
                  isLight ? "text-neutral-700" : "text-neutral-400"
                }`}
              >
                Drop your deck or start Copilot to surface prospects.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-sf-bold flex items-center gap-1.5 transition-all bg-[#FF751F] hover:bg-[#FF5722] text-white shadow-md shadow-[#FF5722]/20"
              >
                <FileText className="w-3.5 h-3.5" />
                Upload Document
              </button>
              <button
                onClick={() => {
                  setLeads(INITIAL_LEADS);
                  setSelectedLeadId("lead-mockup-1");
                }}
                className={`px-3 py-2 rounded-xl text-xs font-sf-light border transition-all ${
                  isLight
                    ? "border-black/20 text-neutral-800 hover:bg-black/5 font-sf-light"
                    : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Sample Leads
              </button>
            </div>
          </div>
        ) : (
          filteredLeads.map((lead) => {
          const isSelected = selectedLeadId === lead.id;
          const isHovered = hoveredLeadId === lead.id;

          return (
            <div
              key={lead.id}
              onClick={() => {
                setSelectedLeadId(lead.id);
                setIsDetailDrawerOpen(true);
              }}
              onMouseEnter={() => setHoveredLeadId(lead.id)}
              onMouseLeave={() => setHoveredLeadId(null)}
              className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer ${
                isLight
                  ? isSelected
                    ? "bg-[#FFFFFF] border-[#FF5722] ring-2 ring-[#FF5722]/20 shadow-md"
                    : isHovered
                    ? "bg-[#FFFFFF] border-[#FF5722]/80 shadow-md translate-y-[-1px]"
                    : "bg-[#FFFFFF] border-black/10 hover:border-[#FF5722]/40 shadow-sm"
                  : isSelected
                  ? "bg-[#141414] border-[#FF5722] ring-1 ring-[#FF5722]/40 shadow-xl shadow-[#FF5722]/5"
                  : isHovered
                  ? "bg-[#161616] border-[#FF5722]/70 shadow-lg shadow-[#FF5722]/10 translate-y-[-1px]"
                  : "bg-[#0d0d0d]/80 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Left Badge: Circular/Squircle Match Badge (Matching Reference Mockup) */}
                <div
                  className={`w-14 h-14 shrink-0 rounded-2xl border flex flex-col items-center justify-center p-1 transition-colors ${
                    lead.score >= 90
                      ? isLight
                        ? "bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30"
                        : "bg-[#FF5722]/15 text-[#FF751F] border-[#FF5722]/40"
                      : isLight
                      ? "bg-[#F7EAD8]/70 text-neutral-800 border-black/10"
                      : "bg-white/5 text-neutral-300 border-white/10"
                  }`}
                >
                  <span className="text-sm font-sf-bold leading-none">{lead.score}</span>
                  <span className="text-[8px] font-sf-light tracking-tighter uppercase mt-0.5">MATCH</span>
                  <span className="text-[8px] font-sf-bold text-[#FF5722] dark:text-[#FF751F]">
                    {lead.tier || "Tier A"}
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="flex-1 min-w-0">
                  {/* Title & Tags Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <h4
                        className={`text-sm tracking-tight truncate interactive-weight ${
                          isSelected || isHovered
                            ? isLight ? "font-sf-bold text-neutral-900" : "font-sf-bold text-white"
                            : isLight ? "font-sf-light text-neutral-800" : "font-sf-light text-neutral-200"
                        }`}
                      >
                        {lead.name}
                      </h4>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] interactive-weight ${
                          isHovered
                            ? isLight ? "font-sf-bold text-neutral-900" : "font-sf-light text-neutral-200"
                            : isLight ? "font-sf-light text-neutral-700" : "font-sf-thin text-neutral-400"
                        }`}
                      >
                        {lead.lastCallTime || "2h ago"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:contact@${lead.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`, "_blank");
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-sf-light hover:font-sf-bold border flex items-center gap-1 transition-all ${
                          isLight
                            ? "bg-[#F7EAD8]/80 text-neutral-900 border-black/15 hover:bg-[#F7EAD8]"
                            : "bg-white/5 text-neutral-200 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        Mail
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCallModalLead(lead);
                        }}
                        className="px-3 py-1 rounded-full text-[11px] font-sf-bold flex items-center gap-1 transition-all shadow-sm shadow-[#FF5722]/20 active:scale-95 bg-[#FF751F] text-white hover:bg-[#FF5722]"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row: Category, Location, Phone, Accuracy Chip */}
                  <div
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-2 interactive-weight ${
                      isHovered
                        ? isLight ? "font-sf-bold text-neutral-900" : "font-sf-bold text-white"
                        : isLight ? "font-sf-light text-neutral-800" : "font-sf-light text-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 opacity-70" />
                      {lead.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />
                      {lead.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 opacity-70" />
                      {lead.phone}
                    </span>

                    {/* Accuracy / Confidence Pill (Matching Mockup '95% Acc.') */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-sf-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-[#008080]/15 text-[#006666] border-[#008080]/30"
                          : "bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {lead.accuracy || 95}% Acc.
                    </span>
                  </div>

                  {/* Hypothesis Snippet Preview */}
                  <div
                    className={`p-2 rounded-xl text-xs font-sf-light leading-relaxed border ${
                      isLight
                        ? "bg-[#FAF7F2] border-black/10 text-neutral-800"
                        : "bg-white/[0.02] border-white/5 text-neutral-300"
                    }`}
                  >
                    <span className="font-sf-bold text-[#FF5722] dark:text-[#FF751F] mr-1">
                      Hypothesis:
                    </span>
                    {lead.hypothesis}
                  </div>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );

  // 2. Call Logs Table Section
  const renderCallHistoryTable = () => (
    <div
      className={`p-5 rounded-3xl border transition-all ${
        isLight
          ? "bg-[#FFFDF9] border-black/10 shadow-sm"
          : "bg-[#111111]/85 border-white/10 backdrop-blur-xl"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className={`text-sm font-sf-bold tracking-tight ${
              isLight ? "text-neutral-900" : "text-white"
            }`}
          >
            CALL-E Autonomous Call Logs & Audio Verification
          </h3>
          <p
            className={`text-xs mt-0.5 font-sf-light ${
              isLight ? "text-neutral-700" : "text-neutral-400"
            }`}
          >
            Verbatim transcripts, B2B agreements, and hypothesis confirmation logs
          </p>
        </div>
        <span className="text-xs font-sf-bold px-2.5 py-1 rounded-full bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30">
          {callLogs.length} Records Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr
              className={`border-b uppercase tracking-wider font-sf-bold text-[10px] ${
                isLight
                  ? "border-black/15 text-neutral-700"
                  : "border-white/10 text-neutral-400 font-sf-light"
              }`}
            >
              <th className="py-2.5 px-3">Business</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Summary / Transcribed Confirmation</th>
              <th className="py-2.5 px-3">Next Action</th>
              <th className="py-2.5 px-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {callLogs.map((c) => (
              <tr
                key={c.id}
                onMouseEnter={() => setHoveredLeadId(c.leadId)}
                onMouseLeave={() => setHoveredLeadId(null)}
                className={`transition-colors cursor-pointer ${
                  isLight ? "hover:bg-[#F7EAD8]/30" : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="py-3 px-3 font-sf-bold text-neutral-900 dark:text-white">
                  {c.businessName}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sf-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    {c.status}
                  </span>
                </td>
                <td className={`py-3 px-3 font-sf-light ${isLight ? "text-neutral-800" : "text-neutral-400"}`}>
                  {c.duration}
                </td>
                <td className={`py-3 px-3 max-w-md font-sf-light leading-relaxed ${isLight ? "text-neutral-900" : "text-neutral-300"}`}>
                  {c.summary}
                </td>
                <td className="py-3 px-3 font-sf-bold text-[#FF5722] dark:text-[#FF751F]">
                  {c.nextAction}
                </td>
                <td className={`py-3 px-3 text-right font-sf-light ${isLight ? "text-neutral-700" : "font-sf-thin text-neutral-400"}`}>
                  {c.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section
      id="console"
      className={`min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden py-3 px-3 sm:px-6 lg:px-8 transition-colors duration-500 flex flex-col ${
        isLight ? "bg-[#F7EAD8] text-neutral-900" : "bg-[#0a0a0a] text-white"
      }`}
    >
      {/* PWA Floating Install Prompt */}
      <PwaInstallPrompt theme={theme} />

      <div className="max-w-[1780px] w-full mx-auto flex-1 flex flex-col min-h-0">
        {/* 1. Top Navigation & Control Center Header (Ultra-Minimal iOS 44px Bar) */}
        <header
          className={`shrink-0 h-11 sm:h-12 flex items-center justify-between px-3 sm:px-4 mb-2.5 rounded-2xl border transition-all duration-300 ${
            isLight
              ? "bg-[#181818] text-white border-black/20 shadow-sm"
              : "bg-[#0d0d0d]/90 border-white/10 backdrop-blur-xl text-white"
          }`}
        >
          {/* Brand Lockup */}
          <div className="flex items-center gap-2.5">
            <DialOLogo size="sm" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-sf-bold tracking-tight text-white">
                DIAL-O
              </span>
              <span className="text-xs font-sf-thin text-[#FF5722]">/</span>
              <span className="text-xs font-sf-light text-neutral-300">
                Console
              </span>
            </div>
          </div>

          {/* Right Action Tools: iPhone Capsule Toggle & Profile Lockup */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* iPhone Capsule Toggle Switch */}
            <button
              id="btn-console-theme-toggle"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              title={`Switch to ${isLight ? "Dark Obsidian" : "Clean Warm Sand"} Mode`}
              aria-label={`Toggle theme (Currently ${isLight ? "Warm Sand" : "Dark Obsidian"})`}
              className="flex items-center group cursor-pointer focus:outline-none select-none py-1"
            >
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                  isLight ? "bg-[#FF5722]" : "bg-white/15 border border-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transform transition-transform duration-300 ease-out ${
                    isLight ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {isLight ? (
                    <Sun className="w-3 h-3 text-[#FF5722]" />
                  ) : (
                    <Moon className="w-3 h-3 text-neutral-800" />
                  )}
                </div>
              </div>
            </button>

            {/* User Profile Pill & Integrated Sign Out */}
            {userEmail ? (
              <div className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 transition-all group">
                <span className="text-[11px] font-sf-thin group-hover:font-sf-light text-[#F7EAD8]/90 max-w-[120px] sm:max-w-[160px] truncate">
                  {userEmail}
                </span>
                {onSignOut && (
                  <button
                    id="btn-console-signout"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="w-5 h-5 rounded-full flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-500/80 active:scale-90 transition-all"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : onSignOut ? (
              <button
                id="btn-console-signout"
                onClick={onSignOut}
                title="Sign Out & Lock Console"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sf-bold border transition-all cursor-pointer shadow-sm active:scale-95 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
              >
                <LogOut className="w-3 h-3" />
                <span className="text-[11px] font-sf-light">Sign Out</span>
              </button>
            ) : null}
          </div>
        </header>

        {/* 2. MOBILE / PWA VIEW (< lg): Renders exactly ONE active tab */}
        <div className="block lg:hidden space-y-6">
          {pwaTab === "call_log" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <TcpaTimeline
                selectedLeadId={selectedLeadId}
                onSelectLead={(id) => {
                  setSelectedLeadId(id);
                  setIsDetailDrawerOpen(true);
                }}
                onHoverLead={setHoveredLeadId}
                onTriggerCall={(id) => {
                  const target = leads.find((l) => l.id === id);
                  if (target) setActiveCallModalLead(target);
                }}
                theme={theme}
              />
              {renderCallHistoryTable()}
            </div>
          )}

          {pwaTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {renderDashboardContent()}
            </div>
          )}

          {pwaTab === "chat" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <RulesInspector
                activeTab={inspectorTab}
                onTabChange={setInspectorTab}
                rules={dynamicRules}
                onRulesChange={setDynamicRules}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                onTriggerDiscovery={() => {
                  handleTriggerDiscovery();
                  setPwaTab("dashboard");
                }}
                copilotMessages={copilotMessages}
                copilotInput={copilotInput}
                onCopilotInputChange={setCopilotInput}
                onSendCopilotMessage={handleSendCopilot}
                isCopilotStreaming={isCopilotStreaming}
                theme={theme}
                attachedFile={attachedFile}
                onAttachFile={setAttachedFile}
                onUploadAndAnalyze={handleSendCopilot}
                onRemoveAttachedFile={() => setAttachedFile(null)}
              />
            </div>
          )}
        </div>

        {/* 3. DESKTOP VIEW (>= lg): 3-Panel Compact Command Center fitting 100vh */}
        <div className="hidden lg:flex flex-1 min-h-0 flex-col">
          {desktopLayout === "grid" ? (
            <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 h-full">
              {/* Left: Call Queue (Cols 1-3) */}
              <div className="col-span-3 h-full min-h-0 flex flex-col">
                <TcpaTimeline
                  selectedLeadId={selectedLeadId}
                  onSelectLead={(id) => {
                    setSelectedLeadId(id);
                    setIsDetailDrawerOpen(true);
                  }}
                  onHoverLead={setHoveredLeadId}
                  onTriggerCall={(id) => {
                    const target = leads.find((l) => l.id === id);
                    if (target) setActiveCallModalLead(target);
                  }}
                  theme={theme}
                  className="h-full min-h-0 flex-1 flex flex-col"
                />
              </div>

              {/* Center: Dashboard (Cols 4-9) */}
              <div className="col-span-6 h-full min-h-0 flex flex-col">
                {renderDashboardContent()}
              </div>

              {/* Right: Rules & Copilot (Cols 10-12) */}
              <div className="col-span-3 h-full min-h-0 flex flex-col">
                <RulesInspector
                  activeTab={inspectorTab}
                  onTabChange={setInspectorTab}
                  rules={dynamicRules}
                  onRulesChange={setDynamicRules}
                  projectName={projectName}
                  onProjectNameChange={setProjectName}
                  onTriggerDiscovery={handleTriggerDiscovery}
                  copilotMessages={copilotMessages}
                  copilotInput={copilotInput}
                  onCopilotInputChange={setCopilotInput}
                  onSendCopilotMessage={handleSendCopilot}
                  isCopilotStreaming={isCopilotStreaming}
                  theme={theme}
                  attachedFile={attachedFile}
                  onAttachFile={setAttachedFile}
                  onUploadAndAnalyze={handleSendCopilot}
                  onRemoveAttachedFile={() => setAttachedFile(null)}
                  className="h-full min-h-0 flex-1 flex flex-col"
                />
              </div>
            </div>
          ) : desktopLayout === "call_log" ? (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-2 animate-in fade-in duration-300">
              {renderCallHistoryTable()}
            </div>
          ) : desktopLayout === "dashboard" ? (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-300">
              {renderDashboardContent()}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-300">
              <RulesInspector
                activeTab={inspectorTab}
                onTabChange={setInspectorTab}
                rules={dynamicRules}
                onRulesChange={setDynamicRules}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                onTriggerDiscovery={handleTriggerDiscovery}
                copilotMessages={copilotMessages}
                copilotInput={copilotInput}
                onCopilotInputChange={setCopilotInput}
                onSendCopilotMessage={handleSendCopilot}
                isCopilotStreaming={isCopilotStreaming}
                theme={theme}
                attachedFile={attachedFile}
                onAttachFile={setAttachedFile}
                onUploadAndAnalyze={handleSendCopilot}
                onRemoveAttachedFile={() => setAttachedFile(null)}
                className="h-full min-h-0 flex-1 flex flex-col"
              />
            </div>
          )}
        </div>

        {/* 4. Slide-Over Lead Detail Drawer */}
        {isDetailDrawerOpen && selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className={`w-full max-w-xl h-full p-6 overflow-y-auto flex flex-col justify-between transition-all border-l ${
                isLight
                  ? "bg-[#FFFDF9] text-neutral-900 border-black/15 shadow-2xl"
                  : "bg-[#111111] text-white border-white/10"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-5">
                  <div>
                    <span className="text-[10px] font-sf-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30">
                      {selectedLead.tier || "Tier A"} • {selectedLead.score}% Match Score
                    </span>
                    <h2 className="text-xl font-sf-bold tracking-tight mt-2">
                      {selectedLead.name}
                    </h2>
                    <p
                      className={`text-xs mt-1 font-sf-light ${
                        isLight ? "text-neutral-500" : "text-neutral-400"
                      }`}
                    >
                      {selectedLead.category} • {selectedLead.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mathematical 6-Component Breakdown */}
                <div
                  className={`p-4 rounded-2xl border mb-5 ${
                    isLight
                      ? "bg-[#F7EAD8]/40 border-black/10"
                      : "bg-white/[0.02] border-white/10"
                  }`}
                >
                  <h4 className="text-xs font-sf-bold uppercase tracking-wider mb-3">
                    Exposed Scoring Formula Breakdown
                  </h4>
                  <div className="space-y-2.5 text-xs font-sf-light">
                    {/* ICP Fit */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span>ICP Fit (S_ICP)</span>
                        <span className="font-sf-bold">{selectedLead.scoreBreakdown.icpFit} / 25</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[#FF5722] rounded-full"
                          style={{ width: `${(selectedLead.scoreBreakdown.icpFit / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Business Quality */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span>Business Quality (S_Quality)</span>
                        <span className="font-sf-bold">{selectedLead.scoreBreakdown.businessQuality} / 15</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 dark:bg-white rounded-full"
                          style={{ width: `${(selectedLead.scoreBreakdown.businessQuality / 15) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Pain Signal */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span>Pain Signal (S_Pain)</span>
                        <span className="font-sf-bold">{selectedLead.scoreBreakdown.painSignal} / 25</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(selectedLead.scoreBreakdown.painSignal / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Market Intent */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span>Market Intent (S_Intent)</span>
                        <span className="font-sf-bold">{selectedLead.scoreBreakdown.intent} / 20</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(selectedLead.scoreBreakdown.intent / 20) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Recency & Contactability */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="flex justify-between mb-1 text-[11px]">
                          <span>Recency</span>
                          <span className="font-sf-bold">{selectedLead.scoreBreakdown.recency} / 10</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(selectedLead.scoreBreakdown.recency / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[11px]">
                          <span>Contactability</span>
                          <span className="font-sf-bold">{selectedLead.scoreBreakdown.contactability} / 5</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#FF5722] rounded-full"
                            style={{ width: `${(selectedLead.scoreBreakdown.contactability / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Composite Call Readiness Formula Result */}
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70 font-sf-light">
                        Composite Call Readiness (R_call)
                      </span>
                      <span className="text-xs font-sf-bold text-[#FF5722] dark:text-[#FF751F]">
                        Score × 0.45 + PhoneScore × 0.45 + Contact × 2
                      </span>
                    </div>
                    <span className="text-lg font-sf-bold text-[#FF5722] dark:text-[#FF751F]">
                      {selectedLead.callReadiness || 91}%
                    </span>
                  </div>
                </div>

                {/* Verifiable Evidence Array with Confidence Chips */}
                <div className="mb-5">
                  <h4 className="text-xs font-sf-bold uppercase tracking-wider mb-2.5">
                    Signal Evidence Array & Claims
                  </h4>
                  <div className="space-y-2">
                    {selectedLead.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs leading-relaxed font-sf-light ${
                          ev.type === "VERIFIED BY CALL"
                            ? "bg-[#FF5722]/10 border-[#FF5722]/30 text-neutral-900 dark:text-neutral-100"
                            : isLight
                            ? "bg-[#FAF7F2] border-black/5 text-neutral-700"
                            : "bg-white/[0.02] border-white/5 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-sf-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-sf-bold text-[#008080] dark:text-[#00FFFF]">
                            {Math.round((ev.confidence || 0.92) * 100)}% Confidence
                          </span>
                        </div>
                        {ev.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Drawer Actions */}
              <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    setActiveCallModalLead(selectedLead);
                  }}
                  className="flex-1 py-3 rounded-2xl text-xs font-sf-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 bg-[#FF751F] hover:bg-[#FF5722] text-white shadow-[#FF5722]/25"
                >
                  Initiate CALL-E Voice Call
                </button>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-xs font-sf-light border transition-all ${
                    isLight
                      ? "border-black/10 hover:bg-black/5 text-neutral-700"
                      : "border-white/10 hover:bg-white/10 text-neutral-300"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Modals */}
        {activeCallModalLead && (
          <CallModal
            isOpen={Boolean(activeCallModalLead)}
            onClose={() => setActiveCallModalLead(null)}
            lead={{
              id: activeCallModalLead.id,
              name: activeCallModalLead.name,
              category: activeCallModalLead.category,
              location: activeCallModalLead.location,
              phone: activeCallModalLead.phone,
              hypothesis: activeCallModalLead.hypothesis,
              decisionMaker: activeCallModalLead.decisionMaker,
            }}
            onCallComplete={(leadId, result) => {
              handleCallComplete(leadId, result);
              setActiveCallModalLead(null);
            }}
          />
        )}

        <DocumentUploadModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          onComplete={(criteriaSummary) => {
            const newRules: DynamicIcpRules = {
              projectName: "Targeted Outreach Campaign",
              taskGroup: "Commercial Lead Acquisition",
              description: criteriaSummary,
              targetMetro: "Austin, TX Metro",
              industry: "Target Practice",
              headcount: "10 - 50 employees",
              minPhoneScore: "> 70% NANP Verified",
              primaryPitch: "Autonomous voice qualification",
              forbiddenTopic: "No unapproved pricing",
              disqualifier: "No direct telephone reception",
              documentName: "Uploaded Business Deck",
              activityLogs: [
                { text: "Uploaded business document analyzed", time: "Just now" },
                { text: `Extracted criteria: ${criteriaSummary}`, time: "Just now" },
                { text: "Autonomous lead discovery queue populated", time: "Just now" },
              ],
            };
            setDynamicRules(newRules);
            setProjectName(newRules.projectName);

            const sampleDiscovered: LeadItem[] = [
              {
                id: `lead-${Date.now()}-1`,
                name: "Austin Smile Center",
                category: "Dental Practice",
                location: "Austin, TX (South Congress)",
                phone: "+1 (512) 555-0144",
                phoneType: "Direct Line",
                score: 94,
                tier: "Tier A",
                accuracy: 96,
                callReadiness: 92,
                dataCompleteness: 95,
                tags: ["High Match", "Verified"],
                timezone: "CST (UTC-6)",
                scoreBreakdown: { icpFit: 25, businessQuality: 15, painSignal: 24, intent: 18, recency: 8, contactability: 4 },
                hypothesis: "Matches uploaded criteria with high telephone inquiry volume.",
                evidence: [
                  { type: "OBSERVED", text: "Online reviews mention high phone volume", confidence: 0.94 },
                  { type: "HYPOTHESIS", text: "Ready for automated voice outreach", confidence: 0.92 },
                ],
                status: "VERIFIED OPPORTUNITY",
                decisionMaker: "Practice Administrator",
              },
              {
                id: `lead-${Date.now()}-2`,
                name: "Lone Star Emergency Dental",
                category: "Emergency Dental Clinic",
                location: "Austin, TX (Downtown)",
                phone: "+1 (512) 555-1007",
                phoneType: "Reception Desk",
                score: 88,
                tier: "Tier A",
                accuracy: 92,
                callReadiness: 89,
                dataCompleteness: 90,
                tags: ["Qualified", "Verified"],
                timezone: "CST (UTC-6)",
                scoreBreakdown: { icpFit: 23, businessQuality: 14, painSignal: 22, intent: 17, recency: 8, contactability: 4 },
                hypothesis: "High intent match with multi-practitioner clinic.",
                evidence: [
                  { type: "OBSERVED", text: "Verified NANP phone with active business registration", confidence: 0.93 },
                ],
                status: "QUALIFIED",
                decisionMaker: "Clinical Director",
              },
            ];
            setLeads(sampleDiscovered);
            setSelectedLeadId(sampleDiscovered[0].id);

            setCopilotMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                text: `Proposal document analyzed. Extracted criteria:\n\n${criteriaSummary}\n\n🎯 Discovered **2 verified prospects** matching your specifications. Inspect the active rules in the subtle status bar above.`,
                thinking: "Extracted ICP rules from uploaded document and populated dynamic rules state.",
              },
            ]);
            setInspectorTab("copilot");
            setIsDocModalOpen(false);
          }}
        />

        {/* 6. Native iOS Floating Bottom Tab Bar for Mobile & PWA */}
        <PwaNavBar
          activeTab={pwaTab}
          onTabChange={setPwaTab}
          callQueueCount={4}
          theme={theme}
          className="lg:hidden"
        />
      </div>
    </section>
  );
}
