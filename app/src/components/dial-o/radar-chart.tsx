"use client";

import React, { useMemo } from "react";

export interface RadarMetrics {
  match: number;   // ICP Fit (0-100)
  intent: number;  // Market Intent (0-100)
  verify: number;  // Verified by Call / Evidence (0-100)
  reach: number;   // Phone / Contactability (0-100)
  quality: number; // Business Quality (0-100)
}

interface RadarChartProps {
  metrics?: RadarMetrics;
  benchmark?: RadarMetrics;
  title?: string;
  subtitle?: string;
  isHovered?: boolean;
  size?: "sm" | "md";
  theme?: "dark" | "light";
  variant?: "card" | "ghost";
  className?: string;
}

const DEFAULT_METRICS: RadarMetrics = {
  match: 90,
  intent: 84,
  verify: 92,
  reach: 75,
  quality: 88,
};

const DEFAULT_BENCHMARK: RadarMetrics = {
  match: 78,
  intent: 70,
  verify: 65,
  reach: 68,
  quality: 74,
};

export function RadarChart({
  metrics = DEFAULT_METRICS,
  benchmark = DEFAULT_BENCHMARK,
  title,
  subtitle,
  isHovered = false,
  size = "sm",
  theme = "dark",
  variant = "card",
  className = "",
}: RadarChartProps) {
  const isLight = theme === "light";
  const isSm = size === "sm";

  // Coordinates based on size
  const cx = isSm ? 105 : 160;
  const cy = isSm ? 95 : 135;
  const radius = isSm ? 52 : 80;
  const viewBox = isSm ? "0 0 210 190" : "0 0 320 270";

  // 5 axes configuration (Pentagon: 72 deg spacing, starting from top at -90 deg)
  const axes = useMemo(() => [
    { key: "match", label: "Match", value: Math.min(100, Math.max(10, metrics.match)) },
    { key: "intent", label: "Intent", value: Math.min(100, Math.max(10, metrics.intent)) },
    { key: "verify", label: "Verify", value: Math.min(100, Math.max(10, metrics.verify)) },
    { key: "reach", label: "Reach", value: Math.min(100, Math.max(10, metrics.reach)) },
    { key: "quality", label: "Quality", value: Math.min(100, Math.max(10, metrics.quality)) },
  ], [metrics]);

  // Compute point on pentagon
  const getCoordinates = (index: number, valuePct: number, r = radius) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const currentR = (valuePct / 100) * r;
    const x = cx + currentR * Math.cos(angle);
    const y = cy + currentR * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon path for metrics
  const metricPoints = useMemo(() => {
    return axes
      .map((axis, i) => {
        const { x, y } = getCoordinates(i, axis.value);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [axes, cx, cy, radius]);

  // Benchmark points
  const benchmarkPoints = useMemo(() => {
    const keys: (keyof RadarMetrics)[] = ["match", "intent", "verify", "reach", "quality"];
    return keys
      .map((key, i) => {
        const val = benchmark[key] || 70;
        const { x, y } = getCoordinates(i, val);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [benchmark, cx, cy, radius]);

  // Concentric pentagon rings: 25%, 50%, 75%, 100%
  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
        variant === "ghost"
          ? ""
          : isLight
          ? "bg-white/85 border border-slate-200/80 shadow-sm"
          : "bg-black/40 border border-white/[0.08] backdrop-blur-md"
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="w-full flex items-center justify-between mb-1 px-1">
          {title && (
            <span
              className={`text-[11px] font-bold tracking-wider uppercase font-mono truncate max-w-[120px] ${
                isLight ? "text-slate-700" : "text-neutral-300"
              }`}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span
              className={`inline-flex items-center gap-1.5 text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold truncate max-w-[140px] transition-all duration-200 ${
                isHovered
                  ? isLight
                    ? "bg-teal-100 text-teal-800 border border-teal-400 font-bold shadow-sm"
                    : "bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF] font-bold shadow-[0_0_12px_rgba(0,255,255,0.3)]"
                  : isLight
                  ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                  : "bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30"
              }`}
              title={subtitle}
            >
              {isHovered && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 dark:bg-[#00FFFF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-600 dark:bg-[#00FFFF]" />
                </span>
              )}
              <span className="truncate">{subtitle}</span>
            </span>
          )}
        </div>
      )}

      <svg
        viewBox={viewBox}
        className={`w-full ${isSm ? "max-w-[200px]" : "max-w-[280px]"} h-auto overflow-visible select-none transition-all`}
      >
        <defs>
          <linearGradient id="radarFillDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00A8A8" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="radarFillLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Concentric Pentagon Rings */}
        {levels.map((lvl, lvlIdx) => {
          const points = [0, 1, 2, 3, 4]
            .map((i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <polygon
              key={`lvl-${lvlIdx}`}
              points={points}
              fill="none"
              stroke={
                isLight
                  ? lvl === 1.0
                    ? "rgba(13, 148, 136, 0.4)"
                    : "rgba(203, 213, 225, 0.6)"
                  : lvl === 1.0
                  ? "rgba(0, 255, 255, 0.4)"
                  : "rgba(255, 255, 255, 0.08)"
              }
              strokeWidth={lvl === 1.0 ? "1.2" : "0.8"}
              strokeDasharray={lvl < 1.0 ? "2,2" : undefined}
            />
          );
        })}

        {/* 2. Radial Axis Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={
                isLight ? "rgba(203, 213, 225, 0.7)" : "rgba(255, 255, 255, 0.12)"
              }
              strokeWidth="0.8"
            />
          );
        })}

        {/* 3. Ghost Benchmark Polygon */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke={isLight ? "rgba(100, 116, 139, 0.35)" : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* 4. Active Metrics Polygon (Smooth Morph on Hover) */}
        <polygon
          points={metricPoints}
          fill={isLight ? "url(#radarFillLight)" : "url(#radarFillDark)"}
          stroke={isLight ? "#0D9488" : "#00FFFF"}
          strokeWidth={isSm ? "1.8" : "2.2"}
          strokeLinejoin="round"
          filter={isLight ? undefined : "url(#radarGlow)"}
          className="transition-all duration-300 ease-out"
        />

        {/* 5. Vertex Dots */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.value);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={isSm ? "3" : "4.5"}
              fill={isLight ? "#0D9488" : "#00FFFF"}
              stroke={isLight ? "#FFFFFF" : "#0A0A0A"}
              strokeWidth="1.2"
              className="transition-all duration-300 ease-out"
            />
          );
        })}

        {/* 6. Vertex Text Labels */}
        {axes.map((axis, i) => {
          const labelDist = radius + (isSm ? 18 : 28);
          const { x, y } = getCoordinates(i, (labelDist / radius) * 100);

          let textAnchor: "middle" | "start" | "end" = "middle";
          let dy = "0.35em";

          if (i === 0) {
            dy = "-0.5em";
          } else if (i === 1) {
            textAnchor = "start";
            dy = "-0.2em";
          } else if (i === 2) {
            textAnchor = "start";
            dy = "0.8em";
          } else if (i === 3) {
            textAnchor = "end";
            dy = "0.8em";
          } else if (i === 4) {
            textAnchor = "end";
            dy = "-0.2em";
          }

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              className={`${
                isSm ? "text-[8.5px]" : "text-[11px]"
              } font-medium font-mono select-none ${
                isLight ? "fill-slate-600" : "fill-neutral-300"
              }`}
            >
              {axis.label}{" "}
              <tspan
                className={`font-bold ${
                  isLight ? "fill-teal-700" : "fill-[#00FFFF]"
                }`}
              >
                ({Math.round(axis.value)}%)
              </tspan>
            </text>
          );
        })}
      </svg>

      {/* Subtle Bottom Status Indicator */}
      <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] font-mono select-none">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
            isHovered
              ? "bg-teal-500 dark:bg-[#00FFFF]"
              : isLight
              ? "bg-slate-300"
              : "bg-white/20"
          }`}
        />
        <span
          className={
            isHovered
              ? isLight
                ? "text-teal-700 font-semibold"
                : "text-[#00FFFF] font-semibold"
              : isLight
              ? "text-slate-400"
              : "text-neutral-500"
          }
        >
          {isHovered ? "Live Fit Comparison" : "Hover lead to preview"}
        </span>
      </div>
    </div>
  );
}
