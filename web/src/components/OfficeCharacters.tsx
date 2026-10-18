import type { FC } from "react";

interface AgentFigureProps {
  id: string;
  status: "working" | "idle" | string;
  activity?: string;
  size?: number;
}

export const AgentFigure: FC<AgentFigureProps> = ({ id, status, size = 68 }) => {
  const isWorking = status === "working";

  switch (id) {
    case "orchestrator":
      // Antigravity — Captain Among Us Commander with Executive Command Desk
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-orchestrator ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auCyanBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="auCyanShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <linearGradient id="auVisorGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ergonomic Office Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Among Us Backpack (Oxygen Tank) */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auCyanShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Among Us Crewmate Body (Legs + Torso + Head Dome) */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auCyanBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Inner 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#0891b2"
            opacity="0.45"
          />

          {/* Among Us Glass Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorGrad)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          {/* Visor Glint / Specular Reflection */}
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Captain Hat (Chief Commander) */}
          <g className="crewmate-hat-captain">
            {/* Dark Cap crown */}
            <path d="M 27 21 C 27 12, 53 12, 53 21 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
            {/* White peak top */}
            <path d="M 28 20 C 30 14, 50 14, 52 20 Z" fill="#f8fafc" />
            {/* Gold trim band */}
            <path d="M 26 21 L 54 21" stroke="#eab308" strokeWidth="2.8" strokeLinecap="round" />
            {/* Gold visor peak */}
            <path d="M 28 22 C 32 26, 48 26, 52 22 Z" fill="#1e293b" stroke="#eab308" strokeWidth="1.2" />
            {/* Gold emblem badge */}
            <circle cx="40" cy="18" r="3.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <polygon points="40,16 41.5,19 38.5,19" fill="#78350f" />
          </g>

          {/* Working Command Desk with High-Tech Laptops & Hands */}
          {isWorking ? (
            <g className="hands-typing">
              {/* Executive Desk surface */}
              <rect x="8" y="67" width="64" height="7" rx="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <line x1="12" y1="69" x2="68" y2="69" stroke="#06b6d4" strokeWidth="1" opacity="0.8" />

              {/* Vertical Telemetry Screen on the right */}
              <g className="vertical-monitor">
                <rect x="61" y="41" width="13" height="26" rx="2.5" fill="#090d16" stroke="#334155" strokeWidth="1.2" />
                <rect x="62.5" y="42.5" width="10" height="23" rx="1.5" fill="#030712" />
                {/* Live code telemetry stream */}
                <line x1="64" y1="46" x2="71" y2="46" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="64" y1="49" x2="71.5" y2="49" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="64" y1="52" x2="69" y2="52" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="64" y1="55" x2="71" y2="55" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="64" y1="58" x2="70" y2="58" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="64" y1="61" x2="68" y2="61" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                <rect x="66" y="67" width="3" height="2.5" fill="#475569" />
              </g>

              {/* Main Laptop - open display */}
              <polygon points="21,45 59,45 56,63 24,63" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
              <polygon points="22.5,46.5 57.5,46.5 55,61.5 25,61.5" fill="#030712" />
              {/* Illuminated IDE code lines */}
              <line x1="26" y1="50" x2="45" y2="50" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="26" y1="53" x2="53" y2="53" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="29" y1="56" x2="50" y2="56" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="29" y1="59" x2="43" y2="59" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />

              {/* Laptop keyboard base */}
              <polygon points="19,69 61,69 56,63 24,63" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <line x1="26" y1="65.5" x2="54" y2="65.5" stroke="#64748b" strokeWidth="1" strokeDasharray="3 1.5" />
              <line x1="23" y1="67.5" x2="57" y2="67.5" stroke="#64748b" strokeWidth="1" strokeDasharray="3 1.5" />

              {/* Floating Cyan Crewmate Hands Typing */}
              <g className="among-us-hands">
                <circle cx="28" cy="64" r="4.2" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.8" className="hand-left" />
                <circle cx="52" cy="64" r="4.2" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.8" className="hand-right" />
              </g>
            </g>
          ) : (
            <g className="relaxing-pose">
              {/* Coffee mug */}
              <rect x="52" y="60" width="8" height="10" rx="2" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
              <path d="M 60 63 C 63 63, 63 67, 60 67" stroke="#64748b" strokeWidth="1" fill="none" />
              <path d="M 54 57 Q 56 55 58 57" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none" />
              {/* Relaxed floating hand */}
              <circle cx="51" cy="65" r="4" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );

    case "explorer":
      // Explorer QA — Lime Green Crewmate with Plant Sprout 🌱 & QA Scanner Tablet
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-explorer ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auLimeBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="auLimeShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="auVisorLime" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Backpack */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auLimeShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crewmate Body */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auLimeBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#047857"
            opacity="0.45"
          />

          {/* Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorLime)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Plant Sprout Hat 🌱 */}
          <g className="crewmate-hat-sprout">
            {/* Stem */}
            <path d="M 40 20 Q 40 10 44 8" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Left Leaf */}
            <path d="M 44 8 Q 36 6 38 12 C 40 13 43 11 44 8 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            {/* Right Leaf */}
            <path d="M 44 8 Q 52 7 50 13 C 48 14 45 11 44 8 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
          </g>

          {/* QA Scanner Tablet */}
          {isWorking ? (
            <g className="hands-typing">
              {/* High-tech tablet held in front */}
              <rect x="25" y="56" width="30" height="20" rx="3" fill="#090d16" stroke="#10b981" strokeWidth="1.5" />
              {/* Radar pulse grid */}
              <circle cx="40" cy="66" r="6" stroke="#10b981" strokeWidth="1" fill="none" strokeDasharray="2 2" className="radar-pulse" />
              <line x1="33" y1="66" x2="47" y2="66" stroke="#10b981" strokeWidth="0.8" opacity="0.6" />
              <line x1="40" y1="59" x2="40" y2="73" stroke="#10b981" strokeWidth="0.8" opacity="0.6" />
              <circle cx="42" cy="64" r="1.5" fill="#ef4444" />
              {/* Lime hands holding tablet */}
              <circle cx="24" cy="66" r="4.2" fill="#34d399" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx="56" cy="66" r="4.2" fill="#34d399" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          ) : (
            <g className="relaxing-pose">
              {/* Handheld magnifying glass */}
              <circle cx="52" cy="60" r="5" fill="rgba(125, 211, 252, 0.4)" stroke="#475569" strokeWidth="1.5" />
              <line x1="56" y1="64" x2="61" y2="69" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="65" r="4" fill="#34d399" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );

    case "telemetry":
      // Telemetry Auditor — Hazard Orange Crewmate with Satellite Antenna 📡 & Server Monitors
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-telemetry ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auOrangeBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="auOrangeShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="auVisorOrange" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Backpack */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auOrangeShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crewmate Body */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auOrangeBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#c2410c"
            opacity="0.45"
          />

          {/* Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorOrange)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Communication Antenna Hat 📡 */}
          <g className="crewmate-hat-antenna">
            <line x1="40" y1="20" x2="40" y2="7" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="40" cy="7" rx="5" ry="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
            {/* Blinking signal diode at tip */}
            <circle cx="40" cy="5" r="2.8" fill="#ef4444" className="antenna-beacon" />
            {/* Signal waves */}
            <path d="M 35 3 Q 40 0 45 3" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" fill="none" className="signal-wave" />
          </g>

          {/* Oscilloscope console */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="22" y="56" width="36" height="20" rx="3" fill="#090d16" stroke="#f97316" strokeWidth="1.5" />
              {/* Oscilloscope wave */}
              <path d="M 25 66 L 31 66 L 33 60 L 35 72 L 37 62 L 39 68 L 41 66 L 55 66" stroke="#22c55e" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Hazard orange typing hands */}
              <circle cx="22" cy="67" r="4.2" fill="#fb923c" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx="58" cy="67" r="4.2" fill="#fb923c" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="52" y="60" width="8" height="10" rx="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
              <path d="M 60 63 C 63 63, 63 67, 60 67" stroke="#ea580c" strokeWidth="1" fill="none" />
              <circle cx="51" cy="65" r="4" fill="#fb923c" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );

    case "writer":
      // Spec Writer — Electric Violet Crewmate with Wizard Hat 🧙‍♂️ & Holographic TypeScript Scroll
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-writer ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auPurpleBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="auPurpleShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
            <linearGradient id="auVisorPurple" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Backpack */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auPurpleShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crewmate Body */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auPurpleBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#581c87"
            opacity="0.45"
          />

          {/* Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorPurple)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Wizard Hat 🧙‍♂️ */}
          <g className="crewmate-hat-wizard">
            <ellipse cx="40" cy="21" rx="18" ry="4" fill="#3b0764" stroke="#0f172a" strokeWidth="1.8" />
            <polygon points="26,20 54,20 46,3 40,2" fill="#581c87" stroke="#0f172a" strokeWidth="1.8" />
            <path d="M 28 20 Q 40 23 52 20" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
            {/* Gold Star on Hat */}
            <polygon points="40,9 41.2,12 44,12 41.8,13.5 42.6,16 40,14.5 37.4,16 38.2,13.5 36,12 38.8,12" fill="#fde047" />
          </g>

          {/* Enchanted Code Scroll & Stylus */}
          {isWorking ? (
            <g className="hands-typing">
              {/* Floating illuminated glass parchment */}
              <rect x="23" y="55" width="34" height="22" rx="3" fill="#180d2b" stroke="#c084fc" strokeWidth="1.5" />
              <line x1="27" y1="60" x2="48" y2="60" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="27" y1="64" x2="52" y2="64" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="30" y1="68" x2="46" y2="68" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="30" y1="72" x2="42" y2="72" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
              {/* Hands with Stylus */}
              <circle cx="23" cy="66" r="4.2" fill="#c084fc" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx="55" cy="65" r="4.2" fill="#c084fc" stroke="#0f172a" strokeWidth="1.8" />
              <line x1="55" y1="65" x2="49" y2="69" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <path d="M 52 58 L 58 58 L 56 68 L 50 68 Z" fill="#4c1d95" stroke="#a855f7" strokeWidth="1" />
              <circle cx="50" cy="65" r="4" fill="#c084fc" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );

    case "opencode":
      // OpenCode (DeepSeek) — Cobalt Blue Crewmate with Cybernetic Headset & AST HUD
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-opencode ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auBlueBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="auBlueShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="auVisorBlue" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Backpack */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auBlueShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crewmate Body */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auBlueBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#1e3a8a"
            opacity="0.45"
          />

          {/* Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorBlue)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Cybernetic Headset & Antenna 🤖 */}
          <g className="crewmate-hat-cyber">
            <path d="M 23 32 C 23 15 57 15 57 32" stroke="#475569" strokeWidth="3" fill="none" />
            <circle cx="23" cy="32" r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="57" cy="32" r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Holographic HUD Visor projection */}
            <rect x="36" y="34" width="24" height="4" rx="2" fill="#38bdf8" opacity="0.75" />
          </g>

          {/* Matrix Binary Terminal */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="22" y="56" width="36" height="20" rx="3" fill="#030712" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="25" y="65" fill="#38bdf8" fontSize="6" fontFamily="monospace">0101 AST</text>
              <text x="25" y="72" fill="#34d399" fontSize="6" fontFamily="monospace">DeepSeek</text>
              {/* Hands */}
              <circle cx="22" cy="66" r="4.2" fill="#60a5fa" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx="58" cy="66" r="4.2" fill="#60a5fa" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="52" y="60" width="8" height="10" rx="2" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1" />
              <circle cx="51" cy="65" r="4" fill="#60a5fa" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );

    case "security":
    default:
      // Security Officer / Default — Amber Crewmate with Police Cap & Shield Console
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg among-us-security ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          <defs>
            <linearGradient id="auAmberBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="auAmberShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="auVisorAmber" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Chair */}
          <rect x="18" y="24" width="44" height="48" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="22" y="28" width="36" height="40" rx="6" fill="#0f172a" />
          <rect x="36" y="72" width="8" height="14" fill="#64748b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#334155" />

          {/* Backpack */}
          <rect x="13" y="36" width="13" height="32" rx="6" fill="url(#auAmberShadow)" stroke="#0f172a" strokeWidth="2.8" />
          <path d="M 15 42 L 23 42" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crewmate Body */}
          <path
            d="M 23 38 C 23 18, 57 18, 57 38 L 57 71 C 57 76, 51 77, 47 77 C 43 77, 43 71, 43 64 C 43 60, 37 60, 37 64 C 37 71, 37 77, 33 77 C 29 77, 23 76, 23 71 Z"
            fill="url(#auAmberBody)"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* 3D Body Shadow */}
          <path
            d="M 39 20 C 47 20, 56 26, 56 38 L 56 71 C 56 74, 53 76, 48 76 C 45 76, 44 72, 44 64 C 44 58, 38 58, 38 64 C 38 72, 38 76, 34 76 C 31 76, 30 74, 29 72 C 34 69, 44 65, 44 50 L 44 32 C 44 26, 42 22, 39 20 Z"
            fill="#b45309"
            opacity="0.45"
          />

          {/* Visor */}
          <rect
            x="34"
            y="29"
            width="28"
            height="18"
            rx="9"
            fill="url(#auVisorAmber)"
            stroke="#0f172a"
            strokeWidth="2.8"
            className="crewmate-visor"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="6.5"
            ry="3"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(-15 44 33)"
            className="crewmate-visor-shine"
          />
          <circle cx="55" cy="39" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Police / Security Cap */}
          <g className="crewmate-hat-police">
            <path d="M 28 21 C 28 13, 52 13, 52 21 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
            <path d="M 26 21 L 54 21" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 29 22 C 33 25, 47 25, 51 22 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            {/* Gold Star Badge */}
            <polygon points="40,16 41,18 43,18 41.5,19.5 42,21.5 40,20 38,21.5 38.5,19.5 37,18 39,18" fill="#fbbf24" />
          </g>

          {/* Shield Firewall Console */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="22" y="56" width="36" height="20" rx="3" fill="#090d16" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Shield Icon */}
              <path d="M 40 59 L 45 61 L 45 66 C 45 70, 40 73, 40 73 C 40 73, 35 70, 35 66 L 35 61 Z" fill="#10b981" opacity="0.85" />
              <path d="M 38 66 L 40 68 L 43 64" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* Hands */}
              <circle cx="22" cy="66" r="4.2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx="58" cy="66" r="4.2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="52" y="60" width="8" height="10" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              <circle cx="51" cy="65" r="4" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      );
  }
};
