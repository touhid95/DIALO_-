"use client";

import React, { useState, useEffect } from "react";
import { LovableHeroSection } from "@/components/dial-o/lovable-hero-section";
import { AboutArchitectureSection } from "@/components/dial-o/about-architecture-section";
import { InstagramLandingAuth, LovableAuthModal } from "@/components/dial-o/instagram-landing-auth";
import { ConsoleSection } from "@/components/dial-o/console-section";

export default function DialOMainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("founder@dial-o.ai");
  const [isClient, setIsClient] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>("");

  // Restore authenticated session from localStorage
  useEffect(() => {
    setIsClient(true);
    const storedAuth = localStorage.getItem("dialo_auth_user");
    const storedEmail = localStorage.getItem("dialo_auth_email");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  const handleAuthenticated = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setIsAuthModalOpen(false);
    localStorage.setItem("dialo_auth_user", "true");
    localStorage.setItem("dialo_auth_email", email);

    // Smoothly scroll down to the Console destination
    setTimeout(() => {
      const consoleElem = document.getElementById("console");
      if (consoleElem) {
        consoleElem.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dialo_auth_user");
    localStorage.removeItem("dialo_auth_email");

    // Smoothly scroll back to the hero section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToLogin = () => {
    const authElem = document.getElementById("auth-section");
    if (authElem) {
      authElem.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handlePromptSubmit = (promptText: string, file?: File | null) => {
    setActivePrompt(promptText);
    if (!isAuthenticated) {
      // Seamlessly authenticate and launch console with the prompt
      handleAuthenticated("founder@dial-o.ai");
    } else {
      const consoleElem = document.getElementById("console");
      if (consoleElem) {
        consoleElem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <main className="w-full bg-black text-white selection:bg-[#00FFFF] selection:text-black min-h-screen font-app">
      {/* ══════════════════════════════════════════════════════════
          PAGE 1 (Hero Screen): LOVABLE-STYLE PROMPT & CHAT HERO
          Connected Prompt Capsule, Suggestion Chips, Ambient Mesh
          ══════════════════════════════════════════════════════════ */}
      <LovableHeroSection
        onOpenAuth={handleOpenAuth}
        onPromptSubmit={handlePromptSubmit}
        isAuthenticated={isAuthenticated}
      />

      {/* ══════════════════════════════════════════════════════════
          PAGE 2 (System Architecture): ABOUT + ARCHITECTURE
          Split Tan (#F7EAD8) / Orange (#FF751F) System Architecture
          ══════════════════════════════════════════════════════════ */}
      <AboutArchitectureSection onScrollToLogin={handleScrollToLogin} />

      {/* ══════════════════════════════════════════════════════════
          PAGE 3 (Authentication Gateway): LOVABLE AUTH SUITE
          Social OAuth (Google, GitHub, Apple) + Work Email
          ══════════════════════════════════════════════════════════ */}
      <InstagramLandingAuth
        onAuthenticated={handleAuthenticated}
        isAuthenticated={isAuthenticated}
      />

      {/* ══════════════════════════════════════════════════════════
          PAGE 4 (Destination): DIAL-O MAIN CONSOLE
          Active upon authentication, with persistent Sign Out
          ══════════════════════════════════════════════════════════ */}
      <div id="console-wrapper" className="relative w-full">
        {isAuthenticated ? (
          <ConsoleSection onSignOut={handleSignOut} userEmail={userEmail} />
        ) : (
          <div className="w-full bg-neutral-950 py-16 px-6 text-center border-t border-neutral-900 flex flex-col items-center justify-center space-y-4 font-app">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400">
              <span className="text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-sf-bold text-white">DIAL-O Console Locked</h3>
            <p className="text-xs text-neutral-400 font-sf-light max-w-sm">
              Authenticate via the workspace portal above or click Instant Demo Access to launch the autonomous voice copilot workspace.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF751F] to-[#00FFFF] text-black font-sf-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Open Authentication Modal ↑
            </button>
          </div>
        )}
      </div>

      {/* Lovable Popup Auth Modal */}
      <LovableAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </main>
  );
}

