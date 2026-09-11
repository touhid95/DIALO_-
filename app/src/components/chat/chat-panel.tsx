"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent, ClipboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  PhoneCall,
  Sliders,
  HelpCircle,
  Building,
  Target,
  MapPin,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

interface ActionItem {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
}

interface BusinessProfile {
  name?: string;
  industry?: string;
  serviceOffering?: string;
  targetAudience?: string;
  geography?: string;
  estimatedSize?: string;
}

interface ExtractedCriteria {
  industry?: string[];
  location?: {
    city?: string;
    state?: string;
    radiusMiles?: number;
  };
  minEmployees?: number;
  maxEmployees?: number;
  requiredSignals?: string[];
  excluded?: string[];
}

interface MessageAttachment {
  type: "image" | "pdf" | "document";
  name: string;
  previewUrl?: string; // object URL or data URL
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: MessageAttachment[];
  businessProfile?: BusinessProfile;
  clarifications?: string[];
  suggestedReplies?: string[];
  extractedCriteria?: ExtractedCriteria;
  actions?: ActionItem[];
  timestamp: string;
}

interface PendingAttachment {
  id: string;
  file: File;
  type: "image" | "pdf" | "document";
  previewUrl?: string;
}

interface ChatPanelProps {
  taskId: string | null;
  selectedLeadId: string | null;
  onTaskCreated: (taskId: string) => void;
}

export function ChatPanel({
  taskId,
  selectedLeadId,
  onTaskCreated,
}: ChatPanelProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "👋 Welcome! I am your **Autonomous Lead Copilot** powered by **OpenRouter** (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`).\n\nI can analyze your business materials, flyers, website screenshots, and ICP decks across **Text, Images, and PDFs**. I'll identify your target market, ask clarifying questions to dial in your criteria, and coordinate **CALL-E voice qualification calls**.\n\nUpload an ICP deck, drop a screenshot, or describe your target business below to begin!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeModel] = useState("nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingAttachments]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      pendingAttachments.forEach((att) => {
        if (att.previewUrl && att.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, [pendingAttachments]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: PendingAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const attType: "image" | "pdf" | "document" = isImg
        ? "image"
        : isPdf
        ? "pdf"
        : "document";

      const previewUrl = isImg ? URL.createObjectURL(file) : undefined;

      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        file,
        type: attType,
        previewUrl,
      });
    }

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFileSelect(e.clipboardData.files);
    }
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && pendingAttachments.length === 0) || isLoading) return;

    // Build user message attachments for UI
    const sentAttachments: MessageAttachment[] = pendingAttachments.map((att) => ({
      type: att.type,
      name: att.file.name,
      previewUrl: att.previewUrl,
    }));

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      attachments: sentAttachments.length > 0 ? sentAttachments : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const attachmentsToSend = [...pendingAttachments];
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", text);
      if (taskId) formData.append("taskId", taskId);
      if (selectedLeadId) formData.append("leadId", selectedLeadId);

      // Pass past message history for context
      const historySummary = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      formData.append("history", JSON.stringify(historySummary));

      // Append attached files
      for (const att of attachmentsToSend) {
        formData.append("files", att.file);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data) {
        const assistantMessage: Message = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: data.data.content,
          businessProfile: data.data.businessProfile,
          clarifications: data.data.clarifications,
          suggestedReplies: data.data.suggestedReplies,
          extractedCriteria: data.data.extractedCriteria,
          actions: data.data.actions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Error: ${errorMsg}. Please check your OpenRouter connection and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: ActionItem) => {
    if (action.type === "start_research") {
      const goal = (action.payload?.goal as string) || "Find qualified business leads in Austin, TX";
      try {
        setIsLoading(true);
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal }),
        });
        const data = await res.json();
        if (data.success) {
          onTaskCreated(data.data.taskId);
          setMessages((prev) => [
            ...prev,
            {
              id: `action-${Date.now()}`,
              role: "assistant",
              content: `🚀 **Autonomous Lead Search Initiated!** (Task ID: \`${data.data.taskId.slice(0, 8)}...\`)\n\nThe orchestrator is now scraping candidate companies, gathering evidence, scoring fit against your criteria, and queuing CALL-E phone calls.\n\nWatch the Live Pipeline and Leads table update!`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      } catch (err) {
        console.error("Task start error:", err);
      } finally {
        setIsLoading(false);
      }
    } else if (action.type === "call_lead") {
      const leadId = (action.payload?.leadId as string) || selectedLeadId;
      if (!leadId) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/leads/${leadId}/call`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: `action-${Date.now()}`,
              role: "assistant",
              content: `📞 **CALL-E Voice Qualification Call Dispatched!**\n\nCall ID: \`${data.data.callId.slice(0, 8)}...\`\nStatus: \`${data.data.status}\`.\n\nThe AI voice agent will conduct a phone qualification dialog and log structured findings in your Call Log panel.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          queryClient.invalidateQueries({ queryKey: ["calls"] });
        }
      } catch (err) {
        console.error("Call dispatch error:", err);
      } finally {
        setIsLoading(false);
      }
    } else if (action.type === "update_criteria") {
      sendMessage("Show current lead criteria and let me edit them");
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split("\n\n").map((block, i) => {
      if (block.includes("• ") || block.startsWith("- ")) {
        const lines = block.split("\n");
        return (
          <ul key={i} className="list-disc list-inside space-y-1 my-2">
            {lines.map((line, liIdx) => {
              const cleanLine = line.replace(/^[•\-]\s*/, "");
              return (
                <li key={liIdx} className="leading-relaxed">
                  {renderInlineFormatting(cleanLine)}
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed">
          {renderInlineFormatting(block)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1 py-0.5 rounded bg-slate-200/60 font-mono text-[11px] text-blue-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`panel flex flex-col h-full bg-slate-50/40 relative ${
        isDragging ? "ring-2 ring-blue-500 ring-inset bg-blue-50/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleFileSelect(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        multiple
        accept="image/*,application/pdf,.pdf,.docx,.txt,.md"
        className="hidden"
      />

      {/* Header */}
      <div className="panel-header flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Autonomous Lead Copilot
              </h2>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-emerald-100 text-emerald-700">
                Reasoning Model
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[200px]" title={activeModel}>
                {activeModel}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary btn-sm text-[11px] gap-1 px-2.5 py-1"
          title="Upload Text, Image, or PDF"
        >
          <Paperclip className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Attach File</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="panel-content p-4 space-y-3 flex-1 overflow-y-auto">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 animate-fade-in ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                }`}
              >
                <div className="text-[11px] opacity-70 mb-1 flex items-center justify-between gap-4">
                  <span className="font-medium">{isUser ? "You" : "Lead Copilot"}</span>
                  <span>{m.timestamp}</span>
                </div>

                {/* User Attachments Preview inside message */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-2.5 space-y-1.5">
                    {m.attachments.map((att, idx) => (
                      <div key={idx}>
                        {att.type === "image" && att.previewUrl ? (
                          <div className="rounded-lg overflow-hidden border border-white/20 max-w-[220px] bg-black/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="w-full max-h-44 object-cover"
                            />
                            <div className="px-2 py-1 text-[10px] bg-black/40 truncate text-white">
                              {att.name}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-1.5 rounded-md bg-white/15 border border-white/20 text-[11px]">
                            {att.type === "pdf" ? (
                              <FileText className="w-4 h-4 text-rose-300" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                            )}
                            <span className="truncate font-medium">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="text-xs">{renderFormattedText(m.content)}</div>

                {/* Structured Business Profile Card */}
                {m.businessProfile && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>Identified Business Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {m.businessProfile.industry && (
                        <div>
                          <span className="text-slate-400">Vertical:</span>{" "}
                          <span className="font-medium text-slate-800">
                            {m.businessProfile.industry}
                          </span>
                        </div>
                      )}
                      {m.businessProfile.geography && (
                        <div>
                          <span className="text-slate-400">Market:</span>{" "}
                          <span className="font-medium text-slate-800">
                            {m.businessProfile.geography}
                          </span>
                        </div>
                      )}
                      {m.businessProfile.targetAudience && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Target Buyer:</span>{" "}
                          <span className="font-medium text-slate-800">
                            {m.businessProfile.targetAudience}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clarifications Block */}
                {m.clarifications && m.clarifications.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clarification Needed for Precision:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] list-disc list-inside text-amber-900/90">
                      {m.clarifications.map((q, qIdx) => {
                        const text = typeof q === "string" ? q : (q as { text?: string })?.text || String(q);
                        return <li key={qIdx}>{text}</li>;
                      })}
                    </ul>
                  </div>
                )}

                {/* Suggested Clickable Replies */}
                {m.suggestedReplies && m.suggestedReplies.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.suggestedReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => sendMessage(reply)}
                        className="px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] transition text-left font-medium"
                      >
                        💬 {reply}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions Attached to Message */}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleAction(act)}
                        className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 shadow-xs gap-1.5"
                      >
                        {act.type === "call_lead" && <PhoneCall className="w-3 h-3" />}
                        {act.type === "start_research" && <Sparkles className="w-3 h-3" />}
                        {act.type === "update_criteria" && <Sliders className="w-3 h-3" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
                <span className="text-xs text-slate-400 ml-1.5 font-medium">
                  Reasoning with OpenRouter...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-200 bg-white/70 overflow-x-auto flex items-center gap-1.5 text-xs flex-shrink-0">
        <button
          onClick={() =>
            sendMessage(
              selectedLeadId
                ? "Why did this selected lead score high? Break down the evidence."
                : "Why did the top ranked lead score highest?"
            )
          }
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 whitespace-nowrap transition text-[11px]"
        >
          🔍 Explain Top Score
        </button>
        <button
          onClick={() => sendMessage("Show current lead criteria & target ICP rules")}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 whitespace-nowrap transition text-[11px]"
        >
          🎯 Show Criteria
        </button>
        <button
          onClick={() =>
            sendMessage("Find 5 new dental practices in Austin needing phone automation")
          }
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 whitespace-nowrap transition text-[11px]"
        >
          ⚡ Discover New Leads
        </button>
      </div>

      {/* Pending Attachments Tray */}
      {pendingAttachments.length > 0 && (
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex flex-wrap gap-2 items-center">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs shadow-xs"
            >
              {att.type === "image" ? (
                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.previewUrl}
                    alt={att.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : att.type === "pdf" ? (
                <FileText className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              )}
              <span className="truncate max-w-[130px] font-medium text-slate-700">
                {att.file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-slate-600 ml-1 p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition"
            title="Attach images, PDFs, or business documents"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={
              selectedLeadId
                ? "Ask about selected lead (e.g., 'Why call them?')..."
                : "Ask copilot, paste screenshot, or drop ICP doc/pdf..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-slate-50 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && pendingAttachments.length === 0)}
            className="btn btn-primary btn-sm px-3 py-2"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
