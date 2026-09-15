"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, X, PlusSquare, Sparkles } from "lucide-react";
import { DialOLogo } from "./dial-o-logo";

interface PwaInstallPromptProps {
  theme?: "dark" | "light";
  className?: string;
}

export function PwaInstallPrompt({ theme = "dark", className = "" }: PwaInstallPromptProps) {
  const isLight = theme === "light";
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check dismissal in localStorage
    if (localStorage.getItem("dial_o_pwa_prompt_dismissed") === "true") {
      setIsDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt on Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("dial_o_pwa_prompt_dismissed", "true");
  };

  // Do not show if already installed or dismissed
  if (isStandalone || isDismissed) return null;
  // If not iOS and no deferred prompt, don't show unless on mobile viewport
  if (!deferredPrompt && !isIos) return null;

  return (
    <aside
      aria-label="PWA Installation Notice"
      className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-8 z-50 w-[92%] max-w-sm rounded-2xl p-3 border shadow-xl transition-all duration-300 backdrop-blur-xl animate-in slide-in-from-bottom-5 ${
        isLight
          ? "bg-white/95 border-slate-200/90 text-slate-800 shadow-slate-900/10"
          : "bg-black/85 border-white/15 text-neutral-200 shadow-black/80"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00FFFF] to-teal-500 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
            <DialOLogo size="sm" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold tracking-tight truncate">
              Install DIAL-O PWA
            </h4>
            <p
              className={`text-[10px] font-sf-light truncate ${
                isLight ? "text-neutral-700" : "text-neutral-400"
              }`}
            >
              Offline Voice & Lead Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ${
              isLight
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90 font-bold"
            }`}
          >
            {isIos ? <Share className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Safari 'Add to Home Screen' Helper Modal */}
      {showIosGuide && (
        <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-xs space-y-1.5">
          <p className="font-semibold text-teal-600 dark:text-[#00FFFF] flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3" />
            Install on your iPhone / iPad:
          </p>
          <div className="flex items-center gap-2 text-[11px] opacity-90">
            <span>1. Tap Safari's</span>
            <span className="p-1 rounded bg-black/5 dark:bg-white/10 inline-flex">
              <Share className="w-3 h-3" />
            </span>
            <span>Share button</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] opacity-90">
            <span>2. Select</span>
            <span className="font-semibold underline flex items-center gap-1">
              <PlusSquare className="w-3 h-3" /> Add to Home Screen
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
