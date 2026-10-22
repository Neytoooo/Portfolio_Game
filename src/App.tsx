import { useState, useEffect, useRef, useCallback } from "react";
import TileRoomCanvas from "./components/3d/TileRoomCanvas";
import CorridorHUD from "./components/ui/CorridorHUD";
import CorridorOverlay, { type StrangerNotice } from "./components/ui/CorridorOverlay";
import ProjectModal from "./components/ui/ProjectModal";
import type { ProjectItem } from "./data/portfolioData";
import { soundManager } from "./utils/audio";
import { ChevronUp, ChevronDown } from "lucide-react";

const STATIONS = [0.0, 0.30, 0.54, 0.77, 0.98];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Door unlocking mechanism & states
  const [doorAttempts, setDoorAttempts] = useState(0);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [doorRattleCount, setDoorRattleCount] = useState(0);

  // Mystery Stranger transmission / alert notification
  const [strangerNotice, setStrangerNotice] = useState<StrangerNotice | null>(null);
  const strangerNoticeTimeoutRef = useRef<number | null>(null);

  // Secret Passage state: when true, the 9 wall tiles recede into the wall!
  const [isGameSolved, setIsGameSolved] = useState(false);

  // Simon Game state & view above the passage
  const [isLookingAtRightWall, setIsLookingAtRightWall] = useState(false);
  const [activeWallTile, setActiveWallTile] = useState<number | null>(null);
  const wallTileClickCallbackRef = useRef<((idx: number) => void) | null>(null);

  // Inside the Secret Room state: camera moves into the dark room in front of the PC!
  const [isInSecretRoom, setIsInSecretRoom] = useState(false);
  const [isSecretRoomLit, setIsSecretRoomLit] = useState(false);

  // References for ultra-smooth 60fps interpolation
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // Helper to show floating stranger messages
  const showStrangerNotice = useCallback(
    (
      text: string,
      subtext?: string,
      type: "stranger" | "warning" | "success" = "stranger",
      duration = 6000
    ) => {
      if (strangerNoticeTimeoutRef.current) {
        window.clearTimeout(strangerNoticeTimeoutRef.current);
      }
      setStrangerNotice({ text, subtext, type });
      strangerNoticeTimeoutRef.current = window.setTimeout(() => {
        setStrangerNotice(null);
      }, duration);
    },
    []
  );

  // Enter & Exit Secret Room
  const handleEnterSecretRoom = useCallback(() => {
    soundManager.playStep();
    setIsInSecretRoom(true);
    setIsLookingAtRightWall(false);
    showStrangerNotice(
      "« Inconnu : Il fait noir ici... Trouve un moyen d'allumer la lumière. »",
      "Interrupteur sur le bureau • Cliquez sur le boîtier lumineux rouge",
      "warning",
      8000
    );
  }, [showStrangerNotice]);

  const handleExitSecretRoom = useCallback(() => {
    soundManager.playStep();
    setIsInSecretRoom(false);
  }, []);

  // Secret room desk light switch toggle
  const handleToggleSecretRoomLight = useCallback(() => {
    setIsSecretRoomLit((prev) => {
      const next = !prev;
      if (next) {
        soundManager.playBeep(920, 0.08);
        showStrangerNotice(
          "« Inconnu : Lumière activée ! Terminal secret disponible. »",
          "Éclairage bureau 100% • Accès CV et données débloqué",
          "success",
          6000
        );
      } else {
        soundManager.playBeep(420, 0.08);
      }
      return next;
    });
  }, [showStrangerNotice]);

  // Connect 3D Simon tile clicks to WallTileGame logic
  const handleWallTileClick = useCallback((tileId: number) => {
    if (wallTileClickCallbackRef.current) {
      wallTileClickCallbackRef.current(tileId);
    }
  }, []);

  const registerWallTileClickHandler = useCallback((handler: (tileId: number) => void) => {
    wallTileClickCallbackRef.current = handler;
  }, []);

  // Smooth glide navigation to exact station or target
  const navigateToProgress = useCallback((target: number) => {
    targetProgressRef.current = Math.min(1, Math.max(0, target));
    isNavigatingRef.current = true;
    soundManager.playBeep(650, 0.05);

    // If leaving the door area, exit secret room & Simon puzzle view
    if (target < 0.80) {
      setIsInSecretRoom(false);
      setIsLookingAtRightWall(false);
    }

    // Also sync native window scroll if available
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo({
        top: target * maxScroll,
        behavior: "smooth",
      });
    }
  }, []);

  // Toggle Door: Requires 3 attempts initially with mysterious stranger warnings
  const handleToggleDoor = useCallback(() => {
    // Attempt 1 & 2: Door is locked, shakes/rattles with sound, stranger warning appears
    if (doorAttempts < 2) {
      const next = doorAttempts + 1;
      setDoorAttempts(next);
      setDoorRattleCount((c) => c + 1);
      soundManager.playDoorRattle();

      if (next === 1) {
        showStrangerNotice(
          "« Inconnu : Tu ferais mieux de laisser cette porte tranquille... »",
          "Verrou magnétique lourd actif • Tentative 1/3 enregistrée",
          "warning",
          6000
        );
      } else if (next === 2) {
        showStrangerNotice(
          "« Inconnu : Es-tu vraiment certain de vouloir voir ce qui se cache derrière ? »",
          "Surcharge du verrouillage imminent • Tentative 2/3 enregistrée",
          "warning",
          6000
        );
      }
      return;
    }

    // Attempt 3: Bolt unlocks, door creaks open smoothly!
    if (doorAttempts === 2) {
      setDoorAttempts(3);
      soundManager.playDoorUnlock();
      soundManager.playDoorCreak();
      setIsDoorOpen(true);
      showStrangerNotice(
        "« Inconnu : ... Trop tard. Le verrou cède. Regarde à travers les barreaux. »",
        "Accès autorisé • La sonnette à droite est désormais sous tension !",
        "success",
        7000
      );
      return;
    }

    // If already unlocked (doorAttempts >= 3): toggle open / close
    setIsDoorOpen((prev) => {
      const next = !prev;
      if (next) {
        soundManager.playDoorCreak();
      } else {
        soundManager.playBeep(420, 0.08);
      }
      return next;
    });
  }, [doorAttempts, showStrangerNotice]);

  // Ring Doorbell: only possible when door is unlocked & open!
  // When rang, it triggers the Simon game above the door!
  const handleRingDoorbell = useCallback(() => {
    if (!isDoorOpen) {
      soundManager.playBuzzerLocked();
      showStrangerNotice(
        "⚡ Sonnette hors tension : Vous devez d'abord forcer et ouvrir la porte !",
        "Circuit inactif • Cliquez sur la porte pour déverrouiller le panneau",
        "warning",
        5500
      );
      return;
    }

    // Door is open: ring chime and activate Simon puzzle above the passage!
    soundManager.playDoorbell();
    navigateToProgress(0.98);
    setIsLookingAtRightWall(true);
    showStrangerNotice(
      "« Inconnu : Système Simon enclenché ! Mémorise et reproduis la combinaison au-dessus du passage. »",
      "Matrice 3x3 active au-dessus de la porte • Résolvez pour faire reculer les carreaux du mur",
      "stranger",
      7500
    );
  }, [isDoorOpen, navigateToProgress, showStrangerNotice]);

  // Winning the Simon game unlocks the wall tiles!
  const handleGameWin = useCallback(() => {
    setIsGameSolved(true);
    setIsLookingAtRightWall(false);
    soundManager.playSuccessFanfare();
    showStrangerNotice(
      "« Inconnu : Accès déverrouillé ! Les 9 carreaux du mur se retirent... Vous pouvez maintenant passer dans l'autre pièce ! »",
      "Passage secret ouvert • Cliquez sur 'Passer dans la pièce' ou avancez",
      "success",
      9000
    );
  }, [showStrangerNotice]);

  // Next / Previous station helpers
  const goToNextStation = useCallback(() => {
    if (isInSecretRoom) return;

    // If at station 5 and wall is open, walk into the secret room!
    if (targetProgressRef.current >= 0.95 && isGameSolved) {
      handleEnterSecretRoom();
      return;
    }

    const current = targetProgressRef.current;
    const next = STATIONS.find((s) => s > current + 0.05);
    if (next !== undefined) {
      navigateToProgress(next);
    } else {
      navigateToProgress(1.0);
    }
  }, [isInSecretRoom, isGameSolved, handleEnterSecretRoom, navigateToProgress]);

  const goToPrevStation = useCallback(() => {
    if (isInSecretRoom) {
      handleExitSecretRoom();
      return;
    }

    if (isLookingAtRightWall) {
      setIsLookingAtRightWall(false);
      return;
    }

    const current = targetProgressRef.current;
    const prev = [...STATIONS].reverse().find((s) => s < current - 0.05);
    if (prev !== undefined) {
      navigateToProgress(prev);
    } else {
      navigateToProgress(0.0);
    }
  }, [isInSecretRoom, isLookingAtRightWall, handleExitSecretRoom, navigateToProgress]);

  // Main input controller: Wheel, Touch, Keyboard, and Animation Loop
  useEffect(() => {
    let animId: number;
    let lastStepTime = 0;
    let touchStartY = 0;

    // 1. Wheel listener (handles mouse wheel and trackpad everywhere on the page)
    const handleWheel = (e: WheelEvent) => {
      // If user is inside a scrollable card, let it scroll naturally
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(".overflow-y-auto") &&
        (e.deltaY > 0
          ? target.scrollTop + target.clientHeight < target.scrollHeight
          : target.scrollTop > 0)
      ) {
        return;
      }

      const delta = e.deltaY;
      const sensitivity = 0.00065;
      targetProgressRef.current = Math.min(
        1,
        Math.max(0, targetProgressRef.current + delta * sensitivity)
      );
      isNavigatingRef.current = false;
    };

    // 2. Touch listener (handles mobile swipe)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".overflow-y-auto")) {
        return;
      }
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      targetProgressRef.current = Math.min(
        1,
        Math.max(0, targetProgressRef.current + deltaY * 0.0018)
      );
      isNavigatingRef.current = false;
    };

    // 3. Keyboard arrow navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        targetProgressRef.current = Math.min(1, targetProgressRef.current + 0.06);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        targetProgressRef.current = Math.max(0, targetProgressRef.current - 0.06);
      }
    };

    // 4. Native scrollbar sync (if user drags the browser scrollbar)
    const handleNativeScroll = () => {
      if (isNavigatingRef.current) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 10) {
        const ratio = window.scrollY / maxScroll;
        targetProgressRef.current = Math.min(1, Math.max(0, ratio));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleNativeScroll, { passive: true });

    // 5. High-precision animation loop for buttery smooth camera travel
    const updateLoop = () => {
      animId = requestAnimationFrame(updateLoop);

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0001) {
        const step = diff * 0.12;
        currentProgressRef.current += step;
        setScrollProgress(currentProgressRef.current);

        // Periodic step sound while moving
        const now = Date.now();
        if (Math.abs(diff) > 0.005 && now - lastStepTime > 340) {
          soundManager.playStep();
          lastStepTime = now;
        }

        // If scrolling back away from door, exit secret room & Simon view
        if (currentProgressRef.current < 0.78) {
          if (isInSecretRoom) setIsInSecretRoom(false);
          if (isLookingAtRightWall) setIsLookingAtRightWall(false);
        }
      }
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleNativeScroll);
    };
  }, [isInSecretRoom, isLookingAtRightWall]);

  return (
    <div className="relative min-h-[400vh] bg-[#111215] text-[#f3f4f6]">
      {/* 3D Tiled Corridor Canvas */}
      <TileRoomCanvas
        scrollProgress={scrollProgress}
        isDoorOpen={isDoorOpen}
        onDoorClick={handleToggleDoor}
        onDoorbellRing={handleRingDoorbell}
        doorRattleCount={doorRattleCount}
        isGameSolved={isGameSolved}
        isInSecretRoom={isInSecretRoom}
        isLookingAtRightWall={isLookingAtRightWall}
        activeTile={activeWallTile}
        onWallTileClick={handleWallTileClick}
        onEnterSecretRoom={handleEnterSecretRoom}
        isSecretRoomLit={isSecretRoomLit}
        onToggleSecretRoomLight={handleToggleSecretRoomLight}
      />

      {/* Corridor HUD (Station Jump Bar, Depth Gauge, Audio Toggle) */}
      <CorridorHUD
        progress={scrollProgress}
        onNavigateTo={navigateToProgress}
      />

      {/* Interactive Overlay displaying the old portfolio content & Secret Room Console */}
      <CorridorOverlay
        progress={scrollProgress}
        onOpenModal={(project) => setSelectedProject(project)}
        onNavigateTo={navigateToProgress}
        isLookingAtRightWall={isLookingAtRightWall}
        onLookAtDoor={() => setIsLookingAtRightWall(false)}
        onSetActiveWallTile={setActiveWallTile}
        onRegisterWallTileClickHandler={registerWallTileClickHandler}
        strangerNotice={strangerNotice}
        onDismissNotice={() => setStrangerNotice(null)}
        onGameWin={handleGameWin}
        isGameSolved={isGameSolved}
        isDoorOpen={isDoorOpen}
        isDoorUnlocked={doorAttempts >= 3}
        isInSecretRoom={isInSecretRoom}
        onEnterSecretRoom={handleEnterSecretRoom}
        onExitSecretRoom={handleExitSecretRoom}
        isSecretRoomLit={isSecretRoomLit}
        onToggleSecretRoomLight={handleToggleSecretRoomLight}
      />

      {/* Floating Next / Prev Stepper Controls (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={goToPrevStation}
          disabled={scrollProgress < 0.05}
          title="Reculer dans la pièce"
          className="p-3 rounded-2xl glass-panel text-slate-300 hover:text-white hover:border-cyan-400/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 text-xs font-mono"
        >
          <ChevronUp size={16} />
          <span className="hidden sm:inline">Reculer</span>
        </button>

        <button
          onClick={goToNextStation}
          disabled={scrollProgress > 0.95}
          title="Avancer dans la pièce"
          className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <span>Avancer</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Modal for project full preview & details */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
