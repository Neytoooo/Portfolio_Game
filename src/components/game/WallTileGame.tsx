import { useState, useEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  Trophy,
  ArrowLeft,
  Zap,
  AlertCircle,
  Brain,
  Timer,
  Play,
  Unlock,
} from "lucide-react";
import { soundManager } from "../../utils/audio";

interface WallTileGameProps {
  onBackToDoor: () => void;
  onSetActiveTile?: (tileId: number | null) => void;
  onRegisterTileClickHandler?: (handler: (tileId: number) => void) => void;
  onGameWin?: () => void;
  isGameSolved?: boolean;
}

export default function WallTileGame({
  onBackToDoor,
  onSetActiveTile,
  onRegisterTileClickHandler,
  onGameWin,
  isGameSolved = false,
}: WallTileGameProps) {
  const [gameMode, setGameMode] = useState<"sequence" | "speed">("sequence");

  // Mode Séquence states
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [, setActiveTile] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [hasWon, setHasWon] = useState(isGameSolved);
  const [hasFailed, setHasFailed] = useState(false);

  // Mode Speed / Reflex states
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTarget, setSpeedTarget] = useState<number | null>(null);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(15);
  const [isSpeedRunning, setIsSpeedRunning] = useState(false);
  const [speedHighScore, setSpeedHighScore] = useState(0);

  const speedTimerRef = useRef<number | null>(null);

  // Sync internal activeTile with 3D canvas on the wall
  const updateActiveTile = useCallback(
    (tileId: number | null) => {
      setActiveTile(tileId);
      if (onSetActiveTile) {
        onSetActiveTile(tileId);
      }
    },
    [onSetActiveTile]
  );

  // --- MODE SEQUENCE LOGIC ---
  const startSequenceLevel = useCallback(
    (lvl: number) => {
      setLevel(lvl);
      setHasWon(false);
      setHasFailed(false);
      setPlayerStep(0);
      setIsShowingSequence(true);

      const len = lvl + 2; // lvl 1: 3, lvl 2: 4, lvl 3: 5
      const newSeq: number[] = [];
      for (let i = 0; i < len; i++) {
        newSeq.push(Math.floor(Math.random() * 9));
      }
      setSequence(newSeq);

      // Playback sequence on the 3D wall tiles
      newSeq.forEach((tileIdx, i) => {
        setTimeout(() => {
          updateActiveTile(tileIdx);
          soundManager.playTileTone(tileIdx);
          setTimeout(() => updateActiveTile(null), 380);

          if (i === newSeq.length - 1) {
            setTimeout(() => {
              setIsShowingSequence(false);
            }, 450);
          }
        }, (i + 1) * 650);
      });
    },
    [updateActiveTile]
  );

  // --- MODE SPEED LOGIC ---
  const pickNextSpeedTarget = useCallback(() => {
    const next = Math.floor(Math.random() * 9);
    setSpeedTarget(next);
    updateActiveTile(next);
  }, [updateActiveTile]);

  const startSpeedGame = useCallback(() => {
    setIsSpeedRunning(true);
    setSpeedScore(0);
    setSpeedTimeLeft(15);
    pickNextSpeedTarget();

    if (speedTimerRef.current) window.clearInterval(speedTimerRef.current);
    speedTimerRef.current = window.setInterval(() => {
      setSpeedTimeLeft((t) => {
        if (t <= 1) {
          if (speedTimerRef.current) window.clearInterval(speedTimerRef.current);
          setIsSpeedRunning(false);
          updateActiveTile(null);
          soundManager.playSuccessFanfare();
          if (onGameWin) {
            onGameWin();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [pickNextSpeedTarget, updateActiveTile, onGameWin]);

  // Handle direct click on a 3D wall tile
  const handleTileClick = useCallback(
    (tileId: number) => {
      if (gameMode === "sequence") {
        if (isShowingSequence || hasWon || hasFailed) return;

        updateActiveTile(tileId);
        soundManager.playTileTone(tileId);
        setTimeout(() => updateActiveTile(null), 250);

        if (sequence[playerStep] === tileId) {
          const nextStep = playerStep + 1;
          setPlayerStep(nextStep);

          if (nextStep === sequence.length) {
            if (level < 3) {
              soundManager.playBeep(880, 0.12);
              setTimeout(() => {
                startSequenceLevel(level + 1);
              }, 800);
            } else {
              setHasWon(true);
              soundManager.playSuccessFanfare();
              if (onGameWin) {
                onGameWin();
              }
            }
          }
        } else {
          setHasFailed(true);
          soundManager.playErrorTone();
        }
      } else if (gameMode === "speed") {
        if (!isSpeedRunning) return;

        if (tileId === speedTarget) {
          soundManager.playTileTone(tileId);
          setSpeedScore((s) => s + 10);
          pickNextSpeedTarget();
        } else {
          soundManager.playBeep(200, 0.08, "sawtooth");
          setSpeedScore((s) => Math.max(0, s - 5));
        }
      }
    },
    [
      gameMode,
      isShowingSequence,
      hasWon,
      hasFailed,
      sequence,
      playerStep,
      level,
      isSpeedRunning,
      speedTarget,
      updateActiveTile,
      startSequenceLevel,
      pickNextSpeedTarget,
      onGameWin,
    ]
  );

  // Register the click handler with the parent so 3D raycasting triggers it
  useEffect(() => {
    if (onRegisterTileClickHandler) {
      onRegisterTileClickHandler(handleTileClick);
    }
  }, [onRegisterTileClickHandler, handleTileClick]);

  useEffect(() => {
    if (gameMode === "sequence") {
      startSequenceLevel(1);
    } else {
      updateActiveTile(null);
    }
    return () => {
      if (speedTimerRef.current) window.clearInterval(speedTimerRef.current);
      updateActiveTile(null);
    };
  }, [gameMode, startSequenceLevel, updateActiveTile]);

  useEffect(() => {
    if (!isSpeedRunning && speedScore > speedHighScore) {
      setSpeedHighScore(speedScore);
    }
  }, [isSpeedRunning, speedScore, speedHighScore]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Floating Transparent HUD Header */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-4xl mx-auto pointer-events-auto">
        {/* Back to door button */}
        <button
          onClick={onBackToDoor}
          className="px-3.5 py-2 rounded-2xl glass-panel hover:bg-white/10 text-white transition-all flex items-center gap-2 text-xs font-mono cursor-pointer active:scale-95 shadow-lg border border-white/15"
        >
          <ArrowLeft size={15} className="text-cyan-400" />
          <span className="hidden sm:inline">Regarder la porte</span>
          <span className="sm:hidden">Porte</span>
        </button>

        {/* Central HUD Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-4 py-1.5 rounded-2xl glass-panel border border-white/15 shadow-lg">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playBeep(500, 0.04);
                setGameMode("sequence");
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                gameMode === "sequence"
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Brain size={13} />
              <span>Mémoire</span>
            </button>

            <button
              onClick={() => {
                soundManager.playBeep(550, 0.04);
                setGameMode("speed");
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                gameMode === "speed"
                  ? "bg-purple-500 text-black font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Timer size={13} />
              <span>Réflexe</span>
            </button>
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* Stats display */}
          {gameMode === "sequence" ? (
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-300">
              <span>
                Niveau : <strong className="text-cyan-400">{level}/3</strong>
              </span>
              <span>
                Étape : <strong className="text-purple-400">{playerStep}/{sequence.length}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-300">
              <span>
                Temps : <strong className="text-amber-400">{speedTimeLeft}s</strong>
              </span>
              <span>
                Score : <strong className="text-cyan-400">{speedScore}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {gameMode === "sequence" ? (
          <button
            onClick={() => startSequenceLevel(level)}
            className="px-3.5 py-2 rounded-2xl glass-panel text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md hover:text-white border border-white/15"
          >
            <RotateCcw size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Rejouer</span>
          </button>
        ) : (
          <button
            onClick={startSpeedGame}
            disabled={isSpeedRunning}
            className="px-4 py-2 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            <Play size={14} />
            <span>{isSpeedRunning ? "En cours..." : "Démarrer"}</span>
          </button>
        )}
      </div>

      {/* Floating Instructions Banner (Directly pointing to the 3D wall tiles) */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="px-6 py-2.5 rounded-full bg-black/75 border border-cyan-400/40 text-center backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] flex items-center gap-2.5 text-xs sm:text-sm font-mono">
          <Zap size={16} className="text-cyan-400 animate-pulse" />

          {hasWon || isGameSolved ? (
            <span className="text-emerald-300 font-bold flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <Unlock size={15} className="text-cyan-400 animate-bounce" />
              🎉 Succès ! Les 9 carreaux du mur s'ouvrent en retrait !
            </span>
          ) : hasFailed ? (
            <div className="flex items-center gap-3">
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={15} />
                Erreur de carreau !
              </span>
              <button
                onClick={() => startSequenceLevel(level)}
                className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs transition cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          ) : isShowingSequence ? (
            <span className="text-cyan-300">
              👀 Observez bien la séquence lumineuse sur les 9 carreaux du mur...
            </span>
          ) : gameMode === "sequence" ? (
            <span className="text-white">
              👉 À vous ! Cliquez sur les{" "}
              <strong className="text-cyan-400">9 carreaux du mur</strong> ({playerStep}/{sequence.length})
            </span>
          ) : isSpeedRunning ? (
            <span className="text-amber-300 font-bold animate-pulse">
              ⚡ Cliquez vite sur le carreau allumé sur le mur !
            </span>
          ) : (
            <span className="text-slate-300">
              Prêt ? Cliquez sur <strong>Démarrer (15s)</strong> puis touchez les carreaux du mur !
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
