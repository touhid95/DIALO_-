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
  theme?: "dark" | "light";
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
  theme = "dark",
  className = "",
}: RadarChartProps) {
  const isLight = theme === "light";

  // Center coordinates & Radius
  const cx = 160;
  const cy = 135;
  const radius = 80;

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
  }, [axes]);

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
  }, [benchmark]);

  // Concentric pentagon rings: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
        isLight
          ? "bg-white/80 border border-slate-200/80 shadow-sm"
          : "bg-black/40 border border-white/[0.08] backdrop-blur-md"
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="w-full flex items-center justify-between mb-1 px-2">
          {title && (
            <span
              className={`text-xs font-semibold tracking-wider uppercase font-mono ${
                isLight ? "text-slate-700" : "text-neutral-300"
              }`}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isLight
                  ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                  : "bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      <svg
        viewBox="0 0 320 270"
        className="w-full max-w-[280px] h-auto overflow-visible select-none"
      >
        <defs>
          {/* Radial/Linear glow gradients */}
          <linearGradient id="radarFillDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00A8A8" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="radarFillLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Background Concentric Web Levels */}
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
                    ? "rgba(13, 148, 136, 0.35)"
                    : "rgba(203, 213, 225, 0.6)"
                  : lvl === 1.0
                  ? "rgba(0, 255, 255, 0.35)"
                  : "rgba(255, 255, 255, 0.08)"
              }
              strokeWidth={lvl === 1.0 ? "1.5" : "1"}
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
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Benchmark Polygon (Optional Ghost Benchmark) */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke={isLight ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.25)"}
          strokeWidth="1.2"
          strokeDasharray="3,3"
        />

        {/* 4. Active Metrics Polygon */}
        <polygon
          points={metricPoints}
          fill={isLight ? "url(#radarFillLight)" : "url(#radarFillDark)"}
          stroke={isLight ? "#0D9488" : "#00FFFF"}
          strokeWidth="2.2"
          strokeLinejoin="round"
          filter={isLight ? undefined : "url(#radarGlow)"}
          className="transition-all duration-500 ease-out"
        />

        {/* 5. Vertex Dots */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.value);
          return (
            <g key={`dot-${i}`} className="transition-all duration-500 ease-out">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill={isLight ? "#0D9488" : "#00FFFF"}
                stroke={isLight ? "#FFFFFF" : "#0A0A0A"}
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* 6. Vertex Text Labels */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, 118);
          // Alignment adjustments based on quadrant
          let textAnchor: "middle" | "start" | "end" = "middle";
          let dy = "0.35em";

          if (i === 0) {
            dy = "-0.6em";
          } else if (i === 1) {
            textAnchor = "start";
            dy = "-0.2em";
          } else if (i === 2) {
            textAnchor = "start";
            dy = "0.9em";
          } else if (i === 3) {
            textAnchor = "end";
            dy = "0.9em";
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
              className={`text-[11px] font-medium font-mono select-none ${
                isLight ? "fill-slate-600" : "fill-neutral-300"
              }`}
            >
              {axis.label}{" "}
              <tspan
                className={`font-semibold ${
                  isLight ? "fill-teal-700" : "fill-[#00FFFF]"
                }`}
              >
                ({Math.round(axis.value)}%)
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
