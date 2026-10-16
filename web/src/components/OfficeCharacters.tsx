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
      // Antigravity Chief Architect
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Chair back */}
          <rect x="18" y="22" width="44" height="50" rx="8" fill="#2a2925" />
          <rect x="22" y="26" width="36" height="42" rx="6" fill="#1c1b18" />
          <rect x="36" y="72" width="8" height="14" fill="#86847b" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#6a6860" />

          {/* Body / Blazer */}
          <path d="M24 50 Q40 46 56 50 L60 74 Q40 76 20 74 Z" fill="#1d5c3d" />
          <path d="M34 50 L40 64 L46 50 Z" fill="#2f7d55" />
          {/* Tie or badge */}
          <rect x="38" y="58" width="4" height="12" rx="1" fill="#7fc4a0" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="14" ry="15" fill="#fbd38d" />
          {/* Hair (Sleek dark styled hair) */}
          <path
            d="M26 28 C26 16 34 14 42 14 C50 14 55 18 55 24 C53 23 48 22 42 24 C36 26 31 30 26 28 Z"
            fill="#1e293b"
          />
          {/* Glasses */}
          <rect x="30" y="28" width="8" height="6" rx="2" fill="none" stroke="#7fc4a0" strokeWidth="1.5" />
          <rect x="42" y="28" width="8" height="6" rx="2" fill="none" stroke="#7fc4a0" strokeWidth="1.5" />
          <line x1="38" y1="31" x2="42" y2="31" stroke="#7fc4a0" strokeWidth="1.5" />
          {/* Eyes */}
          {isWorking ? (
            <>
              <circle cx="34" cy="31" r="1.5" fill="#0f172a" />
              <circle cx="46" cy="31" r="1.5" fill="#0f172a" />
            </>
          ) : (
            <>
              <path d="M32 32 Q34 30 36 32" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M44 32 Q46 30 48 32" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {/* Smile */}
          <path d="M37 39 Q40 42 43 39" stroke="#9a3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Working hands on holographic tablet / desk */}
          {isWorking ? (
            <g className="hands-typing">
              {/* Desk surface */}
              <rect x="12" y="68" width="56" height="6" rx="3" fill="#334155" />
              {/* Hologram tablet */}
              <rect x="26" y="60" width="28" height="12" rx="2" fill="#2f7d55" opacity="0.9" />
              <line x1="30" y1="64" x2="50" y2="64" stroke="#a5b4fc" strokeWidth="1.5" />
              <line x1="30" y1="68" x2="44" y2="68" stroke="#7fc4a0" strokeWidth="1" />
              {/* Hands */}
              <circle cx="28" cy="64" r="3.5" fill="#fbd38d" />
              <circle cx="52" cy="64" r="3.5" fill="#fbd38d" />
            </g>
          ) : (
            <g className="resting-mug">
              {/* Mug of coffee */}
              <rect x="48" y="58" width="8" height="10" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <path d="M56 61 C59 61 59 66 56 66" stroke="#94a3b8" strokeWidth="1" fill="none" />
              {/* Steam */}
              <path d="M50 54 Q52 50 50 48" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
              <path d="M54 55 Q56 51 54 49" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
              {/* Resting arm */}
              <circle cx="48" cy="64" r="3" fill="#fbd38d" />
            </g>
          )}
        </svg>
      );

    case "explorer":
      // Explorer QA (Headphones, sporty tech hoodie, Playwright tester)
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Chair */}
          <rect x="20" y="24" width="40" height="48" rx="7" fill="#1e293b" />
          <rect x="36" y="72" width="8" height="14" fill="#475569" />
          <ellipse cx="40" cy="86" rx="20" ry="4" fill="#334155" />

          {/* Hoodie Body */}
          <path d="M22 50 Q40 46 58 50 L61 74 Q40 76 19 74 Z" fill="#0284c7" />
          {/* Playwright icon on chest */}
          <polygon points="40,54 44,61 36,61" fill="#7fc4a0" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="13" ry="14" fill="#fcd34d" />
          {/* Hair (Messy cool hair) */}
          <path
            d="M27 26 C28 15 36 12 44 14 C52 16 54 22 53 26 C50 24 45 23 40 25 C34 27 30 30 27 26 Z"
            fill="#78350f"
          />
          {/* Large Over-ear Headphones */}
          <path d="M25 28 C25 17 55 17 55 28" stroke="#0ea5e9" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <rect x="23" y="25" width="5" height="10" rx="2" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
          <rect x="52" y="25" width="5" height="10" rx="2" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />

          {/* Eyes */}
          {isWorking ? (
            <>
              <circle cx="35" cy="31" r="1.5" fill="#0f172a" />
              <circle cx="45" cy="31" r="1.5" fill="#0f172a" />
            </>
          ) : (
            <>
              <path d="M33 32 Q35 30 37 32" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M43 32 Q45 30 47 32" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {/* Mouth */}
          <path d="M38 38 Q40 40 42 38" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Hands and laptop */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="14" y="68" width="52" height="5" rx="2" fill="#334155" />
              {/* Laptop base & screen angle */}
              <polygon points="26,69 54,69 50,60 30,60" fill="#0f172a" />
              <polygon points="30,60 50,60 48,51 32,51" fill="#7fc4a0" opacity="0.85" />
              {/* Fast typing fingers */}
              <circle cx="28" cy="65" r="3" fill="#fcd34d" />
              <circle cx="52" cy="65" r="3" fill="#fcd34d" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <circle cx="30" cy="66" r="3" fill="#fcd34d" />
              <circle cx="50" cy="66" r="3" fill="#fcd34d" />
              <rect x="48" y="58" width="7" height="9" rx="1.5" fill="#7fc4a0" />
            </g>
          )}
        </svg>
      );

    case "telemetry":
      // Telemetry Auditor (DevTools CDP, high-tech diagnostic visor, data coat)
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Chair */}
          <rect x="20" y="24" width="40" height="48" rx="7" fill="#1e1e24" />
          <rect x="36" y="72" width="8" height="14" fill="#6a6860" />
          <ellipse cx="40" cy="86" rx="20" ry="4" fill="#2a2925" />

          {/* Tech Coat */}
          <path d="M22 50 Q40 46 58 50 L61 74 Q40 76 19 74 Z" fill="#b91c1c" />
          {/* Inner data plate */}
          <rect x="34" y="52" width="12" height="18" rx="2" fill="#7f1d1d" />
          <line x1="36" y1="56" x2="44" y2="56" stroke="#fca5a5" strokeWidth="1" />
          <line x1="36" y1="60" x2="42" y2="60" stroke="#f87171" strokeWidth="1" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="13" ry="14" fill="#fed7aa" />
          {/* Sleek buzzcut hair */}
          <path d="M27 26 C28 16 34 13 42 13 C50 13 54 18 53 26 Z" fill="#18181b" />

          {/* Cyber Visor / CDP Glasses */}
          <path
            d="M28 27 L52 27 L50 34 L30 34 Z"
            fill={isWorking ? "#ef4444" : "#4b5563"}
            stroke="#fca5a5"
            strokeWidth="1.2"
          />
          {/* Visor Scan Line */}
          {isWorking && (
            <line x1="31" y1="30.5" x2="49" y2="30.5" stroke="#fef08a" strokeWidth="1.5">
              <animate attributeName="x1" values="31;43;31" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="x2" values="37;49;37" dur="1.2s" repeatCount="indefinite" />
            </line>
          )}

          {/* Mouth */}
          <path d="M37 38 L43 38" stroke="#9a3412" strokeWidth="1.2" strokeLinecap="round" />

          {/* Datapad / Server probe */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="14" y="68" width="52" height="5" rx="2" fill="#334155" />
              <rect x="28" y="56" width="24" height="15" rx="2" fill="#18181b" stroke="#ef4444" strokeWidth="1" />
              <circle cx="32" cy="62" r="1.5" fill="#22c55e" />
              <line x1="36" y1="62" x2="48" y2="62" stroke="#f87171" strokeWidth="1" />
              <circle cx="26" cy="66" r="3" fill="#fed7aa" />
              <circle cx="54" cy="66" r="3" fill="#fed7aa" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="46" y="58" width="9" height="11" rx="2" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
              <path d="M55 62 C58 62 58 67 55 67" stroke="#ef4444" strokeWidth="1" fill="none" />
              <circle cx="46" cy="65" r="3" fill="#fed7aa" />
            </g>
          )}
        </svg>
      );

    case "writer":
      // Spec Writer (Playwright specs dev, cozy green sweater, laptop)
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Chair */}
          <rect x="20" y="24" width="40" height="48" rx="7" fill="#1f2937" />
          <rect x="36" y="72" width="8" height="14" fill="#4b5563" />
          <ellipse cx="40" cy="86" rx="20" ry="4" fill="#374151" />

          {/* Sweater */}
          <path d="M22 50 Q40 46 58 50 L61 74 Q40 76 19 74 Z" fill="#15803d" />
          <path d="M32 50 L40 60 L48 50 Z" fill="#16a34a" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="13" ry="14" fill="#fde68a" />
          {/* Hair (Wavy brown hair) */}
          <path
            d="M26 26 C26 14 36 12 44 13 C52 14 55 20 54 26 C51 24 46 22 40 24 C34 26 29 29 26 26 Z"
            fill="#451a03"
          />
          {/* Glasses */}
          <circle cx="34" cy="30" r="3.5" fill="none" stroke="#059669" strokeWidth="1.2" />
          <circle cx="46" cy="30" r="3.5" fill="none" stroke="#059669" strokeWidth="1.2" />
          <line x1="37.5" y1="30" x2="42.5" y2="30" stroke="#059669" strokeWidth="1.2" />

          {/* Eyes */}
          {isWorking ? (
            <>
              <circle cx="34" cy="30" r="1.5" fill="#1e293b" />
              <circle cx="46" cy="30" r="1.5" fill="#1e293b" />
            </>
          ) : (
            <>
              <path d="M32 31 Q34 29 36 31" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M44 31 Q46 29 48 31" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
            </>
          )}

          {/* Smile */}
          <path d="M37 38 Q40 41 43 38" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Hands and Editor */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="14" y="68" width="52" height="5" rx="2" fill="#334155" />
              <polygon points="26,69 54,69 50,60 30,60" fill="#064e3b" />
              <polygon points="30,60 50,60 48,51 32,51" fill="#4ade80" opacity="0.85" />
              <circle cx="28" cy="65" r="3" fill="#fde68a" />
              <circle cx="52" cy="65" r="3" fill="#fde68a" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="48" y="58" width="7" height="9" rx="1.5" fill="#86efac" />
              <circle cx="30" cy="66" r="3" fill="#fde68a" />
              <circle cx="50" cy="66" r="3" fill="#fde68a" />
            </g>
          )}
        </svg>
      );

    case "opencode":
      // OpenCode (DeepSeek Refactor Specialist with cyber-blue hoodie & neural code badge)
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Gaming / Ergonomic Chair */}
          <rect x="18" y="22" width="44" height="50" rx="8" fill="#0f172a" />
          <rect x="22" y="26" width="36" height="42" rx="6" fill="#1e293b" />
          <rect x="36" y="72" width="8" height="14" fill="#38bdf8" opacity="0.6" />
          <ellipse cx="40" cy="86" rx="22" ry="4" fill="#0f172a" />

          {/* DeepSeek Cyan / Indigo Hoodie */}
          <path d="M22 50 Q40 44 58 50 L62 74 Q40 76 18 74 Z" fill="#0284c7" />
          <path d="M32 50 L40 65 L48 50 Z" fill="#38bdf8" />
          {/* DeepSeek Logo Emblem */}
          <circle cx="40" cy="62" r="3" fill="#ffffff" />
          <path d="M38 62 L42 62" stroke="#0284c7" strokeWidth="1" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="13" ry="14" fill="#fed7aa" />
          {/* Modern tech hair */}
          <path
            d="M26 26 C26 14 36 12 44 13 C52 14 55 20 54 26 C50 22 44 20 38 22 C32 24 28 27 26 26 Z"
            fill="#0f172a"
          />

          {/* Cyber Visor / Glasses */}
          <rect x="29" y="28" width="22" height="6" rx="3" fill="rgba(6, 182, 212, 0.3)" stroke="#06b6d4" strokeWidth="1.2" />

          {/* Eyes */}
          {isWorking ? (
            <>
              <circle cx="34" cy="31" r="1.5" fill="#0369a1" />
              <circle cx="46" cy="31" r="1.5" fill="#0369a1" />
            </>
          ) : (
            <>
              <path d="M32 32 Q34 30 36 32" stroke="#0369a1" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M44 32 Q46 30 48 32" stroke="#0369a1" strokeWidth="1.4" strokeLinecap="round" />
            </>
          )}

          {/* Confident Smile */}
          <path d="M37 38 Q40 41 43 38" stroke="#9a3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Hands and Holographic Code Matrix */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="14" y="68" width="52" height="5" rx="2" fill="#334155" />
              {/* Floating Holographic Patch Window */}
              <rect x="24" y="56" width="32" height="14" rx="2" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />
              <line x1="28" y1="60" x2="48" y2="60" stroke="#7dd3fc" strokeWidth="1" />
              <line x1="28" y1="64" x2="42" y2="64" stroke="#a5f3fc" strokeWidth="1" />
              <circle cx="27" cy="65" r="3" fill="#fed7aa" />
              <circle cx="53" cy="65" r="3" fill="#fed7aa" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="48" y="58" width="8" height="10" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
              <path d="M56 61 C59 61 59 66 56 66" stroke="#38bdf8" strokeWidth="1" fill="none" />
              <circle cx="30" cy="66" r="3" fill="#fed7aa" />
              <circle cx="48" cy="65" r="3" fill="#fed7aa" />
            </g>
          )}
        </svg>
      );

    case "security":
    default:
      // RBAC & Edge Hunter (Security Auditor, badge, shield console)
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 80 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`agent-vector-svg ${isWorking ? "anim-working" : "anim-resting"}`}
        >
          {/* Chair */}
          <rect x="20" y="24" width="40" height="48" rx="7" fill="#1e293b" />
          <rect x="36" y="72" width="8" height="14" fill="#475569" />
          <ellipse cx="40" cy="86" rx="20" ry="4" fill="#334155" />

          {/* Amber / Gold Security Vest */}
          <path d="M22 50 Q40 46 58 50 L61 74 Q40 76 19 74 Z" fill="#b45309" />
          {/* Shield badge */}
          <path d="M40 54 L44 58 L40 64 L36 58 Z" fill="#fef08a" />

          {/* Head */}
          <ellipse cx="40" cy="30" rx="13" ry="14" fill="#fcd34d" />
          {/* Dark crew cut */}
          <path d="M27 26 C28 15 36 12 44 14 C52 16 54 22 53 26 Z" fill="#1c1917" />

          {/* Eyes */}
          {isWorking ? (
            <>
              <circle cx="35" cy="31" r="1.5" fill="#1c1917" />
              <circle cx="45" cy="31" r="1.5" fill="#1c1917" />
            </>
          ) : (
            <>
              <path d="M33 32 Q35 30 37 32" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M43 32 Q45 30 47 32" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {/* Mouth */}
          <path d="M38 38 L42 38" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />

          {/* Hands */}
          {isWorking ? (
            <g className="hands-typing">
              <rect x="14" y="68" width="52" height="5" rx="2" fill="#334155" />
              <rect x="28" y="58" width="24" height="12" rx="2" fill="#78350f" stroke="#fde047" strokeWidth="1" />
              <circle cx="28" cy="65" r="3" fill="#fcd34d" />
              <circle cx="52" cy="65" r="3" fill="#fcd34d" />
            </g>
          ) : (
            <g className="relaxing-pose">
              <rect x="47" y="57" width="9" height="11" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              <path d="M56 61 C59 61 59 66 56 66" stroke="#d97706" strokeWidth="1" fill="none" />
              <circle cx="47" cy="64" r="3" fill="#fcd34d" />
            </g>
          )}
        </svg>
      );
  }
};
