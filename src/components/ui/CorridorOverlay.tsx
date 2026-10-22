import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Check,
  Download,
  Eye,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  Cpu,
  DoorOpen,
  PanelLeft,
  Maximize2,
  Radio,
  X,
  Lightbulb,
  LightbulbOff,
} from "lucide-react";
import { GithubIcon } from "./GithubIcon";
import { PORTFOLIO_DATA, type ProjectItem } from "../../data/portfolioData";
import { soundManager } from "../../utils/audio";
import WallTileGame from "../game/WallTileGame";

export interface StrangerNotice {
  text: string;
  subtext?: string;
  type?: "stranger" | "warning" | "success";
}

interface CorridorOverlayProps {
  progress: number;
  onOpenModal: (project: ProjectItem) => void;
  onNavigateTo: (targetProgress: number) => void;
  isLookingAtRightWall?: boolean;
  onLookAtDoor?: () => void;
  onSetActiveWallTile?: (tileId: number | null) => void;
  onRegisterWallTileClickHandler?: (handler: (tileId: number) => void) => void;
  strangerNotice?: StrangerNotice | null;
  onDismissNotice?: () => void;
  onGameWin?: () => void;
  isGameSolved?: boolean;
  isDoorOpen?: boolean;
  isDoorUnlocked?: boolean;
  isInSecretRoom?: boolean;
  onEnterSecretRoom?: () => void;
  onExitSecretRoom?: () => void;
  isSecretRoomLit?: boolean;
  onToggleSecretRoomLight?: () => void;
}

export default function CorridorOverlay({
  progress,
  onOpenModal,
  onNavigateTo,
  isLookingAtRightWall = false,
  onLookAtDoor,
  onSetActiveWallTile,
  onRegisterWallTileClickHandler,
  strangerNotice = null,
  onDismissNotice,
  onGameWin,
  isGameSolved = false,
  isDoorOpen: _isDoorOpen = false,
  isDoorUnlocked: _isDoorUnlocked = false,
  isInSecretRoom = false,
  onEnterSecretRoom,
  onExitSecretRoom,
  isSecretRoomLit = false,
  onToggleSecretRoomLight,
}: CorridorOverlayProps) {
  // Discreet card docking toggle: "center" or "left"
  const [cardPosition, setCardPosition] = useState<"center" | "left">("center");

  // Filter for projects
  const [projectFilter, setProjectFilter] = useState<"all" | "saas" | "3d" | "fullstack">("all");
  // Tab for parcours
  const [parcoursTab, setParcoursTab] = useState<"education" | "experience" | "tech">("education");
  // Email copy state
  const [emailCopied, setEmailCopied] = useState(false);

  const toggleCardPosition = () => {
    soundManager.playBeep(cardPosition === "center" ? 520 : 620, 0.04);
    setCardPosition((prev) => (prev === "center" ? "left" : "center"));
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.profile.email);
    setEmailCopied(true);
    soundManager.playBeep(750, 0.08);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  // Helper to determine visibility & opacity of sections based on progress
  const getSectionStyle = (min: number, max: number, peakMin = min + 0.04, peakMax = max - 0.04) => {
    if (progress < min || progress > max) {
      return {
        opacity: 0,
        pointerEvents: "none" as const,
        visibility: "hidden" as const,
        transform: "scale(0.96) translateY(15px)",
      };
    }
    let opacity = 1;
    if (progress < peakMin) {
      opacity = (progress - min) / (peakMin - min);
    } else if (progress > peakMax) {
      opacity = (max - progress) / (max - peakMax);
    }
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      pointerEvents: "auto" as const,
      visibility: "visible" as const,
      transform: "scale(1) translateY(0)",
      transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
    };
  };

  const filteredProjects = PORTFOLIO_DATA.projects.filter((p) => {
    if (projectFilter === "all") return true;
    return p.category === projectFilter;
  });

  // Dynamic alignment based on cardPosition
  const sectionAlignmentClass =
    cardPosition === "left"
      ? "justify-start pl-4 sm:pl-10 lg:pl-16"
      : "justify-center";

  // Discreet Dock Toggle Button Component
  const DiscreetDockButton = () => (
    <button
      type="button"
      onClick={toggleCardPosition}
      title={
        cardPosition === "center"
          ? "Déplacer la carte sur la gauche (Dégager la vue)"
          : "Recentrer la carte"
      }
      className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-mono z-20 group shadow-md"
    >
      {cardPosition === "center" ? (
        <>
          <PanelLeft size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="hidden sm:inline">Mettre à gauche</span>
        </>
      ) : (
        <>
          <Maximize2 size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="hidden sm:inline">Recentrer</span>
        </>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* ========================================================
          MYSTERIOUS STRANGER / SYSTEM NOTIFICATION BANNER (BOTTOM RIGHT)
      ======================================================== */}
      {strangerNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[92%] sm:w-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3.5 ${
              strangerNotice.type === "success"
                ? "bg-[#091518]/94 border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.35)]"
                : strangerNotice.type === "warning"
                ? "bg-[#180e14]/94 border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.35)]"
                : "bg-[#12131c]/94 border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.35)]"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                strangerNotice.type === "success"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : strangerNotice.type === "warning"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-purple-500/20 text-purple-300 border-purple-500/40"
              }`}
            >
              <Radio size={18} className="animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 pr-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full ${
                    strangerNotice.type === "success"
                      ? "bg-cyan-400/20 text-cyan-300"
                      : strangerNotice.type === "warning"
                      ? "bg-rose-400/20 text-rose-300"
                      : "bg-purple-400/20 text-purple-300"
                  }`}
                >
                  {strangerNotice.type === "success"
                    ? "TRANSMISSION // ACCÈS"
                    : strangerNotice.type === "warning"
                    ? "INTERCEPTION // CANAL INCONNU"
                    : "SYSTÈME // SÉCURITÉ"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                {strangerNotice.text}
              </p>

              {strangerNotice.subtext && (
                <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  {strangerNotice.subtext}
                </p>
              )}
            </div>

            {onDismissNotice && (
              <button
                onClick={onDismissNotice}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          STATION 01: ENTRÉE / HERO (Progress 0.00 to 0.18)
      ======================================================== */}
      <section
        style={getSectionStyle(-0.05, 0.18, 0.0, 0.14)}
        className={`absolute inset-0 flex items-center ${sectionAlignmentClass} p-4 sm:p-6 pointer-events-none transition-all duration-300`}
      >
        <div
          className={`glass-panel p-6 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden w-full text-center pointer-events-auto transition-all duration-300 ${
            cardPosition === "left" ? "max-w-md lg:max-w-lg text-left" : "max-w-3xl"
          }`}
        >
          {/* Discreet Left Dock Button */}
          <DiscreetDockButton />

          {/* Subtle top light accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400" />

          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{PORTFOLIO_DATA.profile.availability}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {PORTFOLIO_DATA.profile.firstName}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
              {PORTFOLIO_DATA.profile.lastName}
            </span>
          </h1>

          <div
            className={`mt-3 flex items-center gap-2 text-base sm:text-xl font-semibold text-slate-300 ${
              cardPosition === "left" ? "justify-start" : "justify-center"
            }`}
          >
            <span className="text-cyan-400 font-mono">&gt;</span>
            <h2>{PORTFOLIO_DATA.profile.role}</h2>
          </div>

          {/* Description */}
          <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {PORTFOLIO_DATA.profile.bio}
          </p>

          {/* Quick Stack Badges */}
          <div
            className={`mt-6 flex flex-wrap gap-1.5 ${
              cardPosition === "left" ? "justify-start" : "justify-center"
            }`}
          >
            {PORTFOLIO_DATA.profile.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            className={`mt-8 flex flex-wrap items-center gap-2.5 ${
              cardPosition === "left" ? "justify-start" : "justify-center"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                soundManager.playBeep(600, 0.05);
                onNavigateTo(0.30);
              }}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Explorer les projets</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playBeep(700, 0.05);
                onNavigateTo(0.98);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <DoorOpen size={14} className="text-cyan-400" />
              <span>Aller à la porte</span>
            </button>

            <a
              href={PORTFOLIO_DATA.profile.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={13} />
              <span>CV</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          STATION 02: PROJETS PHARES (Progress 0.19 to 0.42)
      ======================================================== */}
      <section
        style={getSectionStyle(0.19, 0.42, 0.23, 0.38)}
        className={`absolute inset-0 flex items-center ${sectionAlignmentClass} p-4 sm:p-6 pointer-events-none transition-all duration-300`}
      >
        <div
          className={`glass-panel p-6 sm:p-8 rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] pointer-events-auto relative transition-all duration-300 ${
            cardPosition === "left" ? "max-w-xl lg:max-w-2xl" : "max-w-5xl"
          }`}
        >
          {/* Discreet Left Dock Button */}
          <DiscreetDockButton />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 pr-28 sm:pr-32">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono mb-1.5">
                <Sparkles size={12} />
                <span>Station 02 • Galerie</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Projets <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Phares</span>
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "saas", "3d", "fullstack"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundManager.playBeep(550, 0.04);
                    setProjectFilter(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    projectFilter === cat
                      ? "bg-cyan-500 text-black font-semibold shadow-md"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat === "all" ? "Tous" : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div
            className={`grid gap-4 ${
              cardPosition === "left"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {p.statusText}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {p.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mb-2">
                    {p.subtitle}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                    {p.tech.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400">
                        +{p.tech.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => onOpenModal(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      Détails
                    </button>
                    {p.preview && (
                      <a
                        href={p.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all ml-auto cursor-pointer"
                        title="Voir en ligne"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                        title="Dépôt GitHub"
                      >
                        <GithubIcon size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          STATION 03: ARSENAL TECHNIQUE (Progress 0.43 to 0.66)
      ======================================================== */}
      <section
        style={getSectionStyle(0.43, 0.66, 0.47, 0.62)}
        className={`absolute inset-0 flex items-center ${sectionAlignmentClass} p-4 sm:p-6 pointer-events-none transition-all duration-300`}
      >
        <div
          className={`glass-panel p-6 sm:p-8 rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] pointer-events-auto relative transition-all duration-300 ${
            cardPosition === "left" ? "max-w-xl lg:max-w-2xl" : "max-w-5xl"
          }`}
        >
          {/* Discreet Left Dock Button */}
          <DiscreetDockButton />

          <div className="text-center max-w-xl mx-auto mb-6 pr-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono mb-2">
              <Layers size={12} />
              <span>Station 03 • Compétences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Arsenal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400">Technique</span>
            </h2>
          </div>

          <div
            className={`grid gap-4 ${
              cardPosition === "left" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {PORTFOLIO_DATA.skillGroups.map((group) => (
              <div
                key={group.title}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${group.color}`}
                />
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{group.title}</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                        skill.highlight
                          ? "bg-white/10 text-white border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          STATION 04: PARCOURS & EXPÉRIENCES (Progress 0.67 to 0.86)
      ======================================================== */}
      <section
        style={getSectionStyle(0.67, 0.86, 0.70, 0.83)}
        className={`absolute inset-0 flex items-center ${sectionAlignmentClass} p-4 sm:p-6 pointer-events-none transition-all duration-300`}
      >
        <div
          className={`glass-panel p-6 sm:p-8 rounded-3xl w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] pointer-events-auto relative transition-all duration-300 ${
            cardPosition === "left" ? "max-w-xl lg:max-w-2xl" : "max-w-4xl"
          }`}
        >
          {/* Discreet Left Dock Button */}
          <DiscreetDockButton />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 pr-28 sm:pr-32">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono mb-1.5">
                <Briefcase size={12} />
                <span>Station 04 • Cursus</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Parcours</span>
              </h2>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playBeep(500, 0.04);
                  setParcoursTab("education");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  parcoursTab === "education"
                    ? "bg-emerald-500 text-black font-semibold"
                    : "bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <GraduationCap size={14} />
                <span>Formations</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playBeep(550, 0.04);
                  setParcoursTab("experience");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  parcoursTab === "experience"
                    ? "bg-cyan-500 text-black font-semibold"
                    : "bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <Briefcase size={14} />
                <span>Expériences</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playBeep(600, 0.04);
                  setParcoursTab("tech");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  parcoursTab === "tech"
                    ? "bg-purple-500 text-black font-semibold"
                    : "bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <Cpu size={14} />
                <span>Veille</span>
              </button>
            </div>
          </div>

          {/* Formations Tab */}
          {parcoursTab === "education" && (
            <div className="space-y-3">
              {PORTFOLIO_DATA.education.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {item.period}
                    </span>
                    {item.current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        En cours (Alternance)
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <div className="text-xs text-slate-300 font-medium mb-2">{item.school}</div>
                  <p className="text-xs text-slate-400 mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expériences Tab */}
          {parcoursTab === "experience" && (
            <div className="space-y-3">
              {PORTFOLIO_DATA.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {exp.period}
                    </span>
                    <span className="text-xs font-bold text-white">{exp.company}</span>
                  </div>
                  <h4 className="text-base font-bold text-cyan-300 mb-1">{exp.role}</h4>
                  <p className="text-xs text-slate-300 mb-2">{exp.desc}</p>
                  <ul className="space-y-1 mb-3">
                    {exp.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1">
                    {exp.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Veille Tech Tab */}
          {parcoursTab === "tech" && (
            <div className="space-y-3">
              {PORTFOLIO_DATA.techWatch.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors"
                >
                  <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block mb-1.5">
                    {item.tag}
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          STATION 05: AU FOND DE LA SALLE — LA PORTE, SONNETTE & PASSAGE SECRET DU MUR
          (Progress 0.87 to 1.00)
      ======================================================== */}
      <section
        style={getSectionStyle(0.87, 1.05, 0.89, 1.05)}
        className={`absolute inset-0 flex items-center ${
          isLookingAtRightWall ? "justify-center" : sectionAlignmentClass
        } p-4 sm:p-6 pointer-events-none transition-all duration-300`}
      >
        {/* If camera is turned to the Simon game above the door, display WallTileGame */}
        {isLookingAtRightWall ? (
          <WallTileGame
            onBackToDoor={onLookAtDoor || (() => {})}
            onSetActiveTile={onSetActiveWallTile}
            onRegisterTileClickHandler={onRegisterWallTileClickHandler}
            onGameWin={onGameWin}
            isGameSolved={isGameSolved}
          />
        ) : isInSecretRoom ? (
          /* ========================================================
             INSIDE THE SECRET ROOM: NO CARD BLOCKING THE VIEW!
             (User requested card to disappear so room is explored in darkness)
          ======================================================== */
          <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={onToggleSecretRoomLight}
              title="Allumer / Éteindre l'éclairage de la pièce"
              className="px-3.5 py-2.5 rounded-2xl glass-panel text-white hover:border-amber-400/50 text-xs font-mono transition-all flex items-center gap-2 shadow-xl cursor-pointer active:scale-95 border border-white/15"
            >
              {isSecretRoomLit ? (
                <LightbulbOff size={15} className="text-amber-400" />
              ) : (
                <Lightbulb size={15} className="text-amber-400 animate-pulse" />
              )}
              <span>{isSecretRoomLit ? "Éteindre lumière" : "Interrupteur lumière"}</span>
            </button>

            <button
              type="button"
              onClick={onExitSecretRoom}
              className="px-3.5 py-2.5 rounded-2xl glass-panel text-slate-300 hover:text-white hover:border-purple-400/50 text-xs font-mono transition-all flex items-center gap-2 shadow-xl cursor-pointer active:scale-95 border border-white/15"
            >
              <ArrowRight size={14} className="rotate-180 text-purple-400" />
              <span>Revenir au couloir</span>
            </button>

            <a
              href={PORTFOLIO_DATA.profile.cvPath}
              download="Mattis_Kohen_CV_2026.pdf"
              className="px-3.5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
            >
              <Download size={14} />
              <span>CV</span>
            </a>
          </div>
        ) : (
          /* ========================================================
             CORRIDOR STATION 05 CARD (In front of Door & Wall)
             (Spoiler hints removed: user discovers interactions naturally)
          ======================================================== */
          <div
            className={`glass-panel p-6 sm:p-10 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative overflow-hidden w-full pointer-events-auto transition-all duration-300 ${
              cardPosition === "left" ? "max-w-md lg:max-w-lg text-left" : "max-w-2xl text-center"
            }`}
          >
            {/* Discreet Left Dock Button */}
            <DiscreetDockButton />

            {/* Top light beam */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400" />

            {/* Lintel indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
              <DoorOpen size={14} />
              <span>Station 05 • Au fond de la salle</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prêt à collaborer sur vos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                futurs projets
              </span>{" "}
              ?
            </h2>

            <p
              className={`mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg ${
                cardPosition === "left" ? "text-left" : "mx-auto"
              }`}
            >
              Vous êtes devant la porte du studio. Explorez les éléments du décor pour percer les secrets dissimulés...
            </p>

            {/* BIG ACTION BUTTON: WHEN THE 9 WALL TILES ARE OPEN */}
            {isGameSolved && (
              <div className="my-5 p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
                <div className="text-left">
                  <p className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    LES CARREAUX DU MUR SONT OUVERTS !
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Le passage secret est dégagé. Franchissez le mur pour accéder au bureau noir !
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onEnterSecretRoom}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-white text-black font-bold text-xs font-mono transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <span>Passer dans la pièce</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Direct Contact CTAs */}
            <div
              className={`mt-5 flex flex-wrap items-center gap-2.5 ${
                cardPosition === "left" ? "justify-start" : "justify-center"
              }`}
            >
              <a
                href={`mailto:${PORTFOLIO_DATA.profile.email}?subject=Opportunité%20Alternance%20Full%20Stack`}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail size={15} className="text-cyan-400" />
                <span>Envoyer un email</span>
              </a>

              <button
                type="button"
                onClick={copyEmail}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {emailCopied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 font-mono">Email copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-400" />
                    <span className="font-mono">{PORTFOLIO_DATA.profile.email}</span>
                  </>
                )}
              </button>

              <a
                href={`tel:${PORTFOLIO_DATA.profile.phone}`}
                className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs transition-all flex items-center gap-1.5 font-mono cursor-pointer"
              >
                <Phone size={13} className="text-emerald-400" />
                <span>{PORTFOLIO_DATA.profile.phoneDisplay}</span>
              </a>
            </div>

            {/* Social and CV footer links */}
            <div
              className={`mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono ${
                cardPosition === "left" ? "justify-start" : "justify-center"
              }`}
            >
              <a
                href={PORTFOLIO_DATA.profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <GithubIcon size={14} />
                <span>GitHub @{PORTFOLIO_DATA.profile.githubUser}</span>
              </a>

              <span className="text-slate-600">•</span>

              <a
                href={PORTFOLIO_DATA.profile.cvPath}
                download="Mattis_Kohen_CV_2026.pdf"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
              >
                <Download size={13} />
                <span>Télécharger CV 2026.pdf</span>
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
