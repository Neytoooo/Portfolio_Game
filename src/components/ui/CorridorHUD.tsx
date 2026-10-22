import { useState } from "react";
import { Volume2, VolumeX, Download, Compass, ChevronDown } from "lucide-react";
import { soundManager } from "../../utils/audio";
import { PORTFOLIO_DATA } from "../../data/portfolioData";

interface CorridorHUDProps {
  progress: number;
  onNavigateTo: (targetProgress: number) => void;
  isLookingAtRightWall?: boolean;
}

const STATIONS = [
  { label: "01. Entrée", target: 0.0, range: [0.0, 0.18] },
  { label: "02. Projets", target: 0.30, range: [0.19, 0.42] },
  { label: "03. Compétences", target: 0.54, range: [0.43, 0.66] },
  { label: "04. Parcours", target: 0.77, range: [0.67, 0.86] },
  { label: "05. La Porte", target: 0.98, range: [0.87, 1.0] },
];

export default function CorridorHUD({
  progress,
  onNavigateTo,
  isLookingAtRightWall = false,
}: CorridorHUDProps) {
  const [isAudioActive, setIsAudioActive] = useState(!soundManager.getIsMuted());

  const toggleAudio = () => {
    const active = soundManager.toggleMute();
    setIsAudioActive(active);
  };

  // Calculate simulated corridor depth in meters:
  // Starts at +5m (entrance) to -74m (door at -80m)
  const currentDepthMeters = (5 - progress * 79).toFixed(1);

  return (
    <>
      {/* Top Floating Glass Navigation Bar */}
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Brand Monogram */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-extrabold text-black text-sm tracking-wider">
            MK
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">
              {PORTFOLIO_DATA.profile.firstName} {PORTFOLIO_DATA.profile.lastName}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
              CORRIDOR ARCHIVE • 3D
            </span>
          </div>
        </div>

        {/* Center: Station Navigation Pills (Hidden when looking at right wall / playing game) */}
        {!isLookingAtRightWall && (
          <nav className="pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-panel shadow-lg transition-opacity duration-300">
            {STATIONS.map((st) => {
              const isActive = progress >= st.range[0] && progress <= st.range[1];
              return (
                <button
                  key={st.label}
                  onClick={() => {
                    soundManager.playBeep(600, 0.05);
                    onNavigateTo(st.target);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Sound & CV Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={toggleAudio}
            title={isAudioActive ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
            className={`p-2.5 rounded-2xl glass-panel text-xs transition-all cursor-pointer flex items-center gap-2 ${
              isAudioActive
                ? "text-cyan-400 border-cyan-400/40 bg-cyan-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden lg:inline text-[11px] font-mono">
              {isAudioActive ? "Audio ON" : "Audio OFF"}
            </span>
          </button>

          {/* Quick CV Download */}
          <a
            href={PORTFOLIO_DATA.profile.cvPath}
            download="Mattis_Kohen_CV_2026.pdf"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-panel hover:border-cyan-400/40 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-lg"
          >
            <Download size={14} className="text-cyan-400" />
            <span>CV</span>
          </a>
        </div>
      </header>

      {/* Right Architectural Depth HUD */}
      <aside className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-end gap-2 pointer-events-none">
        <div className="px-3 py-2 rounded-2xl glass-panel flex flex-col items-end font-mono text-[10px] text-slate-400 border border-white/10 shadow-xl">
          <div className="flex items-center gap-1.5 text-cyan-300 mb-1">
            <Compass size={12} className="animate-spin" />
            <span className="font-bold">COORDONNÉES</span>
          </div>
          <div>
            DEPTH <span className="text-white font-bold">{currentDepthMeters}m</span>
          </div>
          <div>
            PROG <span className="text-cyan-400 font-bold">{(progress * 100).toFixed(0)}%</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-1">GRID: CARREAUX 1x1M</div>
        </div>

        {/* Vertical Track indicator */}
        <div className="w-1.5 h-36 rounded-full bg-white/10 relative overflow-hidden mr-2">
          <div
            className="w-full bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full transition-all duration-150"
            style={{ height: `${Math.min(100, Math.max(4, progress * 100))}%` }}
          />
        </div>
      </aside>

      {/* Initial Bottom Scroll Indicator (fades out after user scrolls past 0.05) */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500 ${
          progress < 0.08 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="px-4 py-2 rounded-full glass-panel border border-white/15 flex items-center gap-2 text-xs font-mono text-slate-300 shadow-xl">
          <span>Scrollez pour avancer dans la pièce</span>
          <ChevronDown size={14} className="text-cyan-400 animate-bounce" />
        </div>
      </div>
    </>
  );
}
