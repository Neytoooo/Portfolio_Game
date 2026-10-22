import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createTileTexture, createTileBumpTexture } from "./TileTexture";
import { soundManager } from "../../utils/audio";

interface TileRoomCanvasProps {
  scrollProgress: number; // 0 to 1
  isDoorOpen: boolean;
  onDoorClick: () => void;
  onDoorbellRing: () => void;
  doorRattleCount?: number;
  isGameSolved?: boolean;
  isInSecretRoom?: boolean;
  isLookingAtRightWall?: boolean;
  activeTile?: number | null;
  onWallTileClick?: (tileIndex: number) => void;
  onEnterSecretRoom?: () => void;
  isSecretRoomLit?: boolean;
  onToggleSecretRoomLight?: () => void;
}

// Procedural animated cyberpunk terminal screen texture for the secret PC
function createTerminalTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const lines = [
    "MATTIS KOHEN // POSTE SECRET [ACCÈS TOTAL OBTENU]",
    "root@studio-mk:~# status --deep",
    "> KERNEL: Linux 6.8.0-cyber x86_64 • ONLINE",
    "> SÉCURITÉ: Barreaux contournés via passage mural !",
    "> STATUT: Alternance Full Stack & 3D Web 2026",
    "> STACK: React • Three.js • Node.js • TypeScript",
    "> LOCALISATION: Studio Mattis Kohen • Paris / Remote",
    "root@studio-mk:~# ./launch_portfolio_secrets.sh",
    "[+] Dossier secret déverrouillé avec succès.",
    "[+] Téléchargement CV disponible sur le terminal.",
    "[+] Contact direct : mattis.kohen@gmail.com",
    "> BIENVENUE DANS L'AUTRE PIÈCE. EXPLORATION AUTORISÉE.",
  ];

  const update = (time: number) => {
    ctx.fillStyle = "#07090e";
    ctx.fillRect(0, 0, 1024, 512);

    // Top window bar
    ctx.fillStyle = "#131822";
    ctx.fillRect(0, 0, 1024, 40);

    // Window dots
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(22, 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(44, 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(66, 20, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 17px 'JetBrains Mono', monospace";
    ctx.fillText("bash - station-mk@dark-room: ~/secret-core", 90, 26);

    // Subtle scanline overlay
    ctx.fillStyle = "rgba(6, 182, 212, 0.04)";
    for (let y = 40; y < 512; y += 4) {
      ctx.fillRect(0, y, 1024, 2);
    }

    // Terminal text lines
    ctx.font = "18px 'JetBrains Mono', monospace";
    lines.forEach((line, i) => {
      if (i === 0) {
        ctx.fillStyle = "#38bdf8";
      } else if (line.startsWith(">")) {
        ctx.fillStyle = "#34d399";
      } else if (line.startsWith("[+]")) {
        ctx.fillStyle = "#c084fc";
      } else {
        ctx.fillStyle = "#94a3b8";
      }
      ctx.fillText(line, 24, 76 + i * 32);
    });

    // Blinking cursor
    if (Math.floor(time * 2.2) % 2 === 0) {
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(
        24 + ctx.measureText(lines[lines.length - 1]).width + 8,
        76 + (lines.length - 1) * 32 - 16,
        12,
        20
      );
    }

    texture.needsUpdate = true;
  };

  update(0);
  return { texture, update };
}

export default function TileRoomCanvas({
  scrollProgress,
  isDoorOpen,
  onDoorClick,
  onDoorbellRing,
  doorRattleCount = 0,
  isGameSolved = false,
  isInSecretRoom = false,
  isLookingAtRightWall = false,
  activeTile = null,
  onWallTileClick,
  onEnterSecretRoom,
  isSecretRoomLit = false,
  onToggleSecretRoomLight,
}: TileRoomCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  const doorOpenRef = useRef(isDoorOpen);
  doorOpenRef.current = isDoorOpen;

  const onDoorClickRef = useRef(onDoorClick);
  onDoorClickRef.current = onDoorClick;

  const onDoorbellRingRef = useRef(onDoorbellRing);
  onDoorbellRingRef.current = onDoorbellRing;

  const doorRattleCountRef = useRef(doorRattleCount);
  doorRattleCountRef.current = doorRattleCount;

  const isGameSolvedRef = useRef(isGameSolved);
  isGameSolvedRef.current = isGameSolved;

  const isInSecretRoomRef = useRef(isInSecretRoom);
  isInSecretRoomRef.current = isInSecretRoom;

  const isLookingAtRightWallRef = useRef(isLookingAtRightWall);
  isLookingAtRightWallRef.current = isLookingAtRightWall;

  const activeTileRef = useRef(activeTile);
  activeTileRef.current = activeTile;

  const onWallTileClickRef = useRef(onWallTileClick);
  onWallTileClickRef.current = onWallTileClick;

  const onEnterSecretRoomRef = useRef(onEnterSecretRoom);
  onEnterSecretRoomRef.current = onEnterSecretRoom;

  const isSecretRoomLitRef = useRef(isSecretRoomLit);
  isSecretRoomLitRef.current = isSecretRoomLit;

  const onToggleSecretRoomLightRef = useRef(onToggleSecretRoomLight);
  onToggleSecretRoomLightRef.current = onToggleSecretRoomLight;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#181a1f");
    scene.fog = new THREE.FogExp2("#181a1f", 0.016);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(0, -0.2, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- 2. Shared Procedural Tile Textures ---
    const tileTexture = createTileTexture();
    const bumpTexture = createTileBumpTexture();

    const makeTileMaterial = (repeatX: number, repeatY: number) => {
      const tex = tileTexture.clone();
      tex.repeat.set(repeatX, repeatY);
      tex.needsUpdate = true;

      const bump = bumpTexture.clone();
      bump.repeat.set(repeatX, repeatY);
      bump.needsUpdate = true;

      return new THREE.MeshStandardMaterial({
        map: tex,
        bumpMap: bump,
        bumpScale: 0.02,
        roughness: 0.65,
        metalness: 0.12,
      });
    };

    // --- 3. Room Geometry (Width: 10, Height: 6, Length: 90 from Z=+10 to Z=-80) ---
    const roomWidth = 10;
    const roomHeight = 6;
    const roomLength = 90;
    const roomCenterZ = -35;

    // Floor (Y = -3)
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floorMat = makeTileMaterial(10, 90);
    floorMat.roughness = 0.45;
    floorMat.metalness = 0.18;
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -roomHeight / 2, roomCenterZ);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling (Y = +3)
    const ceilGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceilMat = makeTileMaterial(10, 90);
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, roomHeight / 2, roomCenterZ);
    scene.add(ceiling);

    // Left Wall (X = -5)
    const wallLeftGeo = new THREE.PlaneGeometry(roomLength, roomHeight);
    const wallLeftMat = makeTileMaterial(90, 6);
    const wallLeft = new THREE.Mesh(wallLeftGeo, wallLeftMat);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.set(-roomWidth / 2, 0, roomCenterZ);
    wallLeft.receiveShadow = true;
    scene.add(wallLeft);

    // Right Wall (X = +5)
    const wallRightGeo = new THREE.PlaneGeometry(roomLength, roomHeight);
    const wallRightMat = makeTileMaterial(90, 6);
    const wallRight = new THREE.Mesh(wallRightGeo, wallRightMat);
    wallRight.rotation.y = -Math.PI / 2;
    wallRight.position.set(roomWidth / 2, 0, roomCenterZ);
    wallRight.receiveShadow = true;
    scene.add(wallRight);

    // Front Wall at entrance (Z = +10)
    const frontWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const frontWallMat = makeTileMaterial(10, 6);
    const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, 0, 10);
    scene.add(frontWall);

    // --- Back Wall Geometry at Z = -80.0 ---
    // 1. Left back wall section (X: -5.0 to -1.2, width 3.8, height 6.0)
    const backWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 6.0), makeTileMaterial(3.8, 6.0));
    backWallLeft.position.set(-3.1, 0, -80.0);
    backWallLeft.receiveShadow = true;
    scene.add(backWallLeft);

    // 2. Lintel wall above door (X: -1.2 to +1.2, width 2.4, height 1.6, Y: +1.4 to +3.0)
    const backWallTop = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), makeTileMaterial(2.4, 1.6));
    backWallTop.position.set(0, 2.2, -80.0);
    backWallTop.receiveShadow = true;
    scene.add(backWallTop);

    // 3. Wall strip between door and the 3x3 passage & Simon (X: +1.2 to +2.0, width 0.8, height 6.0, Y: -3.0 to +3.0)
    const backWallStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 6.0), makeTileMaterial(0.8, 6.0));
    backWallStrip.position.set(1.6, 0, -80.0);
    backWallStrip.receiveShadow = true;
    scene.add(backWallStrip);

    // --- 4. Baseboards & Floor Guides ---
    const trimMat = new THREE.MeshStandardMaterial({
      color: "#181a1e",
      roughness: 0.3,
      metalness: 0.7,
    });
    const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, roomLength), trimMat);
    leftTrim.position.set(-roomWidth / 2 + 0.06, -roomHeight / 2 + 0.12, roomCenterZ);
    scene.add(leftTrim);

    const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, roomLength), trimMat);
    rightTrim.position.set(roomWidth / 2 - 0.06, -roomHeight / 2 + 0.12, roomCenterZ);
    scene.add(rightTrim);

    const trackMat = new THREE.MeshBasicMaterial({
      color: "#06b6d4",
      transparent: true,
      opacity: 0.35,
    });
    const leftTrack = new THREE.Mesh(new THREE.PlaneGeometry(0.04, roomLength), trackMat);
    leftTrack.rotation.x = -Math.PI / 2;
    leftTrack.position.set(-roomWidth / 2 + 0.2, -roomHeight / 2 + 0.01, roomCenterZ);
    scene.add(leftTrack);

    const rightTrack = new THREE.Mesh(new THREE.PlaneGeometry(0.04, roomLength), trackMat);
    rightTrack.rotation.x = -Math.PI / 2;
    rightTrack.position.set(roomWidth / 2 - 0.2, -roomHeight / 2 + 0.01, roomCenterZ);
    scene.add(rightTrack);

    // --- 5. Ceiling Light Fixtures & Spotlights ---
    const lightPositionsZ = [4, -10, -24, -38, -52, -66, -76];
    lightPositionsZ.forEach((z) => {
      const fixtureMat = new THREE.MeshStandardMaterial({
        color: "#111215",
        roughness: 0.4,
        metalness: 0.8,
      });
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.08, 0.4), fixtureMat);
      fixture.position.set(0, roomHeight / 2 - 0.04, z);
      scene.add(fixture);

      const tube = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.03, 0.25),
        new THREE.MeshBasicMaterial({ color: "#f8fafc" })
      );
      tube.position.set(0, roomHeight / 2 - 0.09, z);
      scene.add(tube);

      const light = new THREE.PointLight(
        z === -76 ? "#a5f3fc" : "#f1f5f9",
        z === -76 ? 3.5 : 2.2,
        18,
        1.5
      );
      light.position.set(0, roomHeight / 2 - 0.4, z);
      scene.add(light);
    });

    const ambientLight = new THREE.AmbientLight("#474d56", 1.2);
    scene.add(ambientLight);

    // --- 6. AU FOND DE LA SALLE: LA PORTE (At Z = -79.6) ---
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, -79.6);

    const doorWidth = 2.4;
    const doorHeight = 4.4;
    const doorDepth = 0.16;

    const frameMat = new THREE.MeshStandardMaterial({
      color: "#1a1d22",
      roughness: 0.35,
      metalness: 0.75,
    });
    const leftPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, doorHeight + 0.18, doorDepth),
      frameMat
    );
    leftPost.position.set(-doorWidth / 2 - 0.09, -roomHeight / 2 + (doorHeight + 0.18) / 2, 0);
    doorGroup.add(leftPost);

    const rightPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, doorHeight + 0.18, doorDepth),
      frameMat
    );
    rightPost.position.set(doorWidth / 2 + 0.09, -roomHeight / 2 + (doorHeight + 0.18) / 2, 0);
    doorGroup.add(rightPost);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 0.36, 0.18, doorDepth), frameMat);
    lintel.position.set(0, -roomHeight / 2 + doorHeight + 0.09, 0);
    doorGroup.add(lintel);

    // Studio Sign
    const signCanvas = document.createElement("canvas");
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext("2d")!;
    sCtx.fillStyle = "#0c0e12";
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = "#38bdf8";
    sCtx.lineWidth = 4;
    sCtx.strokeRect(6, 6, 500, 116);
    sCtx.fillStyle = "#38bdf8";
    sCtx.font = "bold 32px 'JetBrains Mono', monospace";
    sCtx.textAlign = "center";
    sCtx.textBaseline = "middle";
    sCtx.fillText("01 • STUDIO MATTIS KOHEN", 256, 50);
    sCtx.font = "20px 'JetBrains Mono', monospace";
    sCtx.fillStyle = "#94a3b8";
    sCtx.fillText("ENTRÉE / CONTACT", 256, 88);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), signMat);
    signMesh.position.set(0, -roomHeight / 2 + doorHeight + 0.45, 0.09);
    doorGroup.add(signMesh);

    // Door Leaf Pivot & Door Mesh
    const doorLeafPivot = new THREE.Group();
    doorLeafPivot.position.set(-doorWidth / 2, 0, 0);

    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: "#282b32",
      roughness: 0.5,
      metalness: 0.25,
    });
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 0.08), doorLeafMat);
    doorLeaf.position.set(doorWidth / 2, -roomHeight / 2 + doorHeight / 2, 0);
    doorLeaf.castShadow = true;
    doorLeaf.receiveShadow = true;
    doorLeafPivot.add(doorLeaf);

    const panelMat = new THREE.MeshStandardMaterial({
      color: "#1e2026",
      roughness: 0.4,
      metalness: 0.35,
    });
    [-0.9, 0.9].forEach((yOff) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(doorWidth * 0.75, doorHeight * 0.38, 0.02),
        panelMat
      );
      panel.position.set(doorWidth / 2, -roomHeight / 2 + doorHeight / 2 + yOff, 0.05);
      doorLeafPivot.add(panel);
    });

    const handleMat = new THREE.MeshStandardMaterial({
      color: "#cbd5e1",
      roughness: 0.15,
      metalness: 0.95,
    });
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.02), handleMat);
    plate.position.set(doorWidth - 0.25, -roomHeight / 2 + doorHeight * 0.48, 0.06);
    doorLeafPivot.add(plate);

    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22), handleMat);
    lever.rotation.z = Math.PI / 2;
    lever.position.set(doorWidth - 0.25 - 0.08, -roomHeight / 2 + doorHeight * 0.48, 0.1);
    doorLeafPivot.add(lever);

    doorGroup.add(doorLeafPivot);

    const beam = new THREE.Mesh(
      new THREE.PlaneGeometry(doorWidth * 1.6, 6),
      new THREE.MeshBasicMaterial({
        color: "#38bdf8",
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, -roomHeight / 2 + 0.02, 3);
    doorGroup.add(beam);

    scene.add(doorGroup);

    // --- 6.1. PRISON BARS RIGHT INSIDE THE DOORWAY (Z = -80.08) ---
    const prisonBarsGroup = new THREE.Group();
    prisonBarsGroup.position.set(0, -roomHeight / 2 + doorHeight / 2, -80.08);

    const barMat = new THREE.MeshStandardMaterial({
      color: "#13161c",
      roughness: 0.25,
      metalness: 0.92,
    });

    const barPositionsX = [-0.92, -0.55, -0.18, 0.18, 0.55, 0.92];
    const barGeo = new THREE.CylinderGeometry(0.026, 0.026, doorHeight, 16);
    barPositionsX.forEach((xPos) => {
      const vBar = new THREE.Mesh(barGeo, barMat);
      vBar.position.set(xPos, 0, 0);
      vBar.castShadow = true;
      prisonBarsGroup.add(vBar);
    });

    const crossbarGeo = new THREE.CylinderGeometry(0.024, 0.024, 2.25, 16);
    [-1.1, 0.6].forEach((yPos) => {
      const hBar = new THREE.Mesh(crossbarGeo, barMat);
      hBar.rotation.z = Math.PI / 2;
      hBar.position.set(0, yPos, 0.01);
      prisonBarsGroup.add(hBar);
    });

    const barFrameMat = new THREE.MeshStandardMaterial({
      color: "#0f1116",
      roughness: 0.35,
      metalness: 0.88,
    });
    const hBarTop = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 0.06), barFrameMat);
    hBarTop.position.set(0, doorHeight / 2 - 0.03, 0);
    prisonBarsGroup.add(hBarTop);

    const hBarBot = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 0.06), barFrameMat);
    hBarBot.position.set(0, -doorHeight / 2 + 0.03, 0);
    prisonBarsGroup.add(hBarBot);

    scene.add(prisonBarsGroup);

    // --- 6.2. SECRET DARK ROOM ---
    const secretRoomGroup = new THREE.Group();
    const darkWallMat = new THREE.MeshStandardMaterial({
      color: "#090b10",
      roughness: 0.88,
      metalness: 0.15,
    });

    const sFloorGeo = new THREE.PlaneGeometry(8.5, 7.5);
    const sFloor = new THREE.Mesh(sFloorGeo, darkWallMat);
    sFloor.rotation.x = -Math.PI / 2;
    sFloor.position.set(1.0, -roomHeight / 2, -83.75);
    sFloor.receiveShadow = true;
    secretRoomGroup.add(sFloor);

    const sCeilGeo = new THREE.PlaneGeometry(8.5, 7.5);
    const sCeil = new THREE.Mesh(sCeilGeo, darkWallMat);
    sCeil.rotation.x = Math.PI / 2;
    sCeil.position.set(1.0, 2.4, -83.75);
    secretRoomGroup.add(sCeil);

    const sWallL = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 5.4), darkWallMat);
    sWallL.rotation.y = Math.PI / 2;
    sWallL.position.set(-3.2, -0.3, -83.75);
    secretRoomGroup.add(sWallL);

    const sWallR = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 5.4), darkWallMat);
    sWallR.rotation.y = -Math.PI / 2;
    sWallR.position.set(5.2, -0.3, -83.75);
    secretRoomGroup.add(sWallR);

    const sWallB = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 5.4), darkWallMat);
    sWallB.position.set(1.0, -0.3, -87.5);
    secretRoomGroup.add(sWallB);

    // Neon floor guide track from passage entrance to PC desk
    const guideTrackGeo = new THREE.PlaneGeometry(0.06, 4.5);
    const guideTrackMat = new THREE.MeshBasicMaterial({ color: "#06b6d4", transparent: true, opacity: 0.45 });
    const guideTrack = new THREE.Mesh(guideTrackGeo, guideTrackMat);
    guideTrack.rotation.x = -Math.PI / 2;
    guideTrack.rotation.z = Math.PI / 4.2;
    guideTrack.position.set(2.0, -roomHeight / 2 + 0.015, -82.2);
    secretRoomGroup.add(guideTrack);

    // Secret Room Ceiling Light (Starts OFF, user turns it ON via light switch!)
    const secretRoomCeilingLight = new THREE.PointLight("#f8fafc", 0, 16, 1.2);
    secretRoomCeilingLight.position.set(1.0, 2.2, -84.0);
    secretRoomGroup.add(secretRoomCeilingLight);

    // --- Workstation inside Secret Room ---
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, -84.2);

    const deskTopMat = new THREE.MeshStandardMaterial({
      color: "#181a20",
      roughness: 0.35,
      metalness: 0.5,
    });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.95), deskTopMat);
    deskTop.position.set(0, -1.65, 0);
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    const legGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.3, 16);
    [
      [-0.92, 0.4],
      [0.92, 0.4],
      [-0.92, -0.4],
      [0.92, -0.4],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(lx, -2.32, lz);
      deskGroup.add(leg);
    });

    const pcTower = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.52, 0.48),
      new THREE.MeshStandardMaterial({ color: "#111318", roughness: 0.3, metalness: 0.7 })
    );
    pcTower.position.set(0.78, -1.36, 0.05);
    deskGroup.add(pcTower);

    const fanGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.42, 0.02),
      new THREE.MeshBasicMaterial({ color: "#06b6d4" })
    );
    fanGlow.position.set(0.65, -1.36, 0.28);
    deskGroup.add(fanGlow);

    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.02, 0.2),
      new THREE.MeshStandardMaterial({
        color: "#1e222a",
        roughness: 0.4,
        metalness: 0.6,
        emissive: "#06b6d4",
        emissiveIntensity: 0.3,
      })
    );
    kb.position.set(0, -1.61, 0.22);
    deskGroup.add(kb);

    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.38),
      new THREE.MeshBasicMaterial({ color: "#0f172a" })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0.08, -1.618, 0.22);
    deskGroup.add(pad);

    const chairMat = new THREE.MeshStandardMaterial({
      color: "#1f242e",
      roughness: 0.6,
      metalness: 0.3,
    });
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.52), chairMat);
    chairSeat.position.set(0, -2.05, 0.95);
    deskGroup.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.08), chairMat);
    chairBack.position.set(0, -1.68, 1.18);
    deskGroup.add(chairBack);

    const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16), frameMat);
    monStand.position.set(0, -1.45, -0.15);
    deskGroup.add(monStand);

    const monFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.76, 0.04),
      new THREE.MeshStandardMaterial({ color: "#0f1115", roughness: 0.3, metalness: 0.8 })
    );
    monFrame.position.set(0, -1.15, -0.15);
    deskGroup.add(monFrame);

    const { texture: termTexture, update: updateTerminal } = createTerminalTexture();
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.42, 0.71),
      new THREE.MeshBasicMaterial({ map: termTexture })
    );
    screenMesh.position.set(0, -1.15, -0.125);
    deskGroup.add(screenMesh);

    // Screen Blue/Cyan Glow PointLight
    const screenGlowLight = new THREE.PointLight("#38bdf8", 3.8, 9.5, 1.4);
    screenGlowLight.position.set(0, -1.15, 0.6);
    deskGroup.add(screenGlowLight);

    // --- INTERACTIVE LIGHT SWITCH ON DESK ---
    // User requirement: "il fait noir ici , trouve un moyen d'allumer la lumiere"
    const lightSwitchGroup = new THREE.Group();
    lightSwitchGroup.position.set(-0.85, -1.5, 0.15);

    const switchBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.16, 0.05),
      new THREE.MeshStandardMaterial({ color: "#222730", roughness: 0.4, metalness: 0.8 })
    );
    lightSwitchGroup.add(switchBase);

    // Switch rocker lever
    const switchLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.03),
      new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.2, metalness: 0.9 })
    );
    switchLever.position.set(0, 0, 0.03);
    lightSwitchGroup.add(switchLever);

    // Little glowing indicator LED (Red when dark, Green when lit!)
    const switchLedMat = new THREE.MeshBasicMaterial({ color: "#ef4444" });
    const switchLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 16), switchLedMat);
    switchLed.position.set(0, 0.055, 0.035);
    lightSwitchGroup.add(switchLed);

    // Subtle local glow so the switch is discoverable in the dark!
    const switchBeaconLight = new THREE.PointLight("#ef4444", 0.6, 1.5);
    switchBeaconLight.position.set(0, 0, 0.1);
    lightSwitchGroup.add(switchBeaconLight);

    deskGroup.add(lightSwitchGroup);
    secretRoomGroup.add(deskGroup);
    scene.add(secretRoomGroup);

    // --- 6.3. LA SONNETTE SUR LA DROITE DE LA PORTE (Mounted on wall strip at X = 1.65, Z = -79.9) ---
    const doorbellGroup = new THREE.Group();
    doorbellGroup.position.set(1.65, -0.4, -79.9);

    const bellPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.45, 0.04),
      new THREE.MeshStandardMaterial({ color: "#181a1f", roughness: 0.35, metalness: 0.85 })
    );
    doorbellGroup.add(bellPlate);

    const bellRingMat = new THREE.MeshBasicMaterial({ color: "#242b35" });
    const bellRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 16, 32), bellRingMat);
    bellRing.position.set(0, 0, 0.025);
    doorbellGroup.add(bellRing);

    const bellBtnMat = new THREE.MeshStandardMaterial({
      color: "#38bdf8",
      roughness: 0.2,
      metalness: 0.8,
      emissive: "#0284c7",
      emissiveIntensity: 0.1,
    });
    const bellBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 32), bellBtnMat);
    bellBtn.rotation.x = Math.PI / 2;
    bellBtn.position.set(0, 0, 0.03);
    doorbellGroup.add(bellBtn);

    const bellLight = new THREE.PointLight("#06b6d4", 0, 4);
    bellLight.position.set(0, 0, 0.2);
    doorbellGroup.add(bellLight);

    scene.add(doorbellGroup);

    // --- 6.4. LE JEU SIMON AU-DESSUS DE LA PORTE (X: 2.0 to 5.0, Y: 0.0 to 3.0, Z = -79.95) ---
    // User requirement:
    // "je veux que le simon soit au dessus de la porte qu'on viens de creer avec le meme disgn que tout a lheure"
    // 3 rows x 3 columns on the wall right above the passage!
    const simonGridGroup = new THREE.Group();
    simonGridGroup.position.set(0, 0, -79.95);

    const SIMON_COLORS = [
      "#06b6d4", // 0: Cyan (top-left)
      "#38bdf8", // 1: Sky (top-mid)
      "#a855f7", // 2: Purple (top-right)
      "#10b981", // 3: Emerald (mid-left)
      "#f59e0b", // 4: Amber (mid-mid)
      "#f43f5e", // 5: Rose (mid-right)
      "#60a5fa", // 6: Blue (bot-left)
      "#8b5cf6", // 7: Violet (bot-mid)
      "#14b8a6", // 8: Teal (bot-right)
    ];

    const simonTileMeshes: THREE.Mesh[] = [];
    const simonColCenters = [2.5, 3.5, 4.5];
    const simonRowCenters = [2.5, 1.5, 0.5]; // Top row: 2.5, Mid: 1.5, Bot: 0.5

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const tileIdx = r * 3 + c;
        const sGeo = new THREE.BoxGeometry(0.94, 0.94, 0.04);
        const sMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#181b22"),
          roughness: 0.35,
          metalness: 0.6,
          emissive: new THREE.Color(0, 0, 0),
          emissiveIntensity: 0,
        });

        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.set(simonColCenters[c], simonRowCenters[r], 0.02);
        sMesh.userData = { tileIndex: tileIdx, color: SIMON_COLORS[tileIdx] };

        simonGridGroup.add(sMesh);
        simonTileMeshes.push(sMesh);
      }
    }

    // Dynamic point light centered right on the Simon game
    const simonGridLight = new THREE.PointLight("#06b6d4", 0, 6);
    simonGridLight.position.set(3.5, 1.5, 0.5);
    simonGridGroup.add(simonGridLight);

    scene.add(simonGridGroup);

    // --- 6.5. LES 9 CARREAUX DU MUR RETRACTABLES EN BAS (X: 2.0 to 5.0, Y: -3.0 to 0.0, Z = -80.0) ---
    // User requirement:
    // "JE VEUX QUE LES CARREAUX DU MUUUUUUUUR MUR MUR se retire pour que je puisse passer dans l'autre piece"
    // Touching the floor at Y = -3.0! When retracted, leaves the 3m x 3m open passage to walk through!
    const wallCubesGroup = new THREE.Group();
    wallCubesGroup.position.set(0, 0, -80.0);

    const wallCubeMeshes: THREE.Mesh[] = [];
    const cubeTargetZ = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const cubeSlideTriggered = [false, false, false, false, false, false, false, false, false];

    const colCenters = [2.5, 3.5, 4.5];
    const rowCenters = [-0.5, -1.5, -2.5]; // Bottom row at -2.5 rests right on floor at -3.0!

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const tileIdx = r * 3 + c;
        const cGeo = new THREE.BoxGeometry(0.98, 0.98, 0.35);
        const cMat = makeTileMaterial(1, 1);
        cMat.transparent = true;

        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(colCenters[c], rowCenters[r], -0.175);
        cMesh.userData = { tileIndex: tileIdx };
        cMesh.castShadow = true;
        cMesh.receiveShadow = true;

        wallCubesGroup.add(cMesh);
        wallCubeMeshes.push(cMesh);
      }
    }

    // Glowing perimeter outline frame around the passage
    const portalBorderMat = new THREE.MeshBasicMaterial({ color: "#06b6d4", transparent: true, opacity: 0 });
    const portalBorderTop = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.04, 0.04), portalBorderMat);
    portalBorderTop.position.set(3.5, 0.0, 0.02);
    wallCubesGroup.add(portalBorderTop);

    const portalBorderLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.0, 0.04), portalBorderMat);
    portalBorderLeft.position.set(1.98, -1.5, 0.02);
    wallCubesGroup.add(portalBorderLeft);

    // Invisible clickable volume inside the passage
    const passageZoneGeo = new THREE.BoxGeometry(3.0, 3.0, 1.5);
    const passageZoneMat = new THREE.MeshBasicMaterial({ visible: false });
    const passageZoneMesh = new THREE.Mesh(passageZoneGeo, passageZoneMat);
    passageZoneMesh.position.set(3.5, -1.5, -0.75);
    wallCubesGroup.add(passageZoneMesh);

    scene.add(wallCubesGroup);

    // --- 7. Holographic 3D Floating Sculptures along the stations ---
    const icoGroup = new THREE.Group();
    icoGroup.position.set(0, -0.2, -20);
    const icoMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshStandardMaterial({
        color: "#06b6d4",
        wireframe: true,
        emissive: "#0891b2",
        emissiveIntensity: 0.35,
      })
    );
    icoGroup.add(icoMesh);
    scene.add(icoGroup);

    const matrixGroup = new THREE.Group();
    matrixGroup.position.set(0, -0.2, -38);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: "#a855f7",
      wireframe: true,
      emissive: "#7e22ce",
      emissiveIntensity: 0.35,
    });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7 + i * 0.3, 0.015, 8, 32), cubeMat);
      ring.rotation.x = i * 0.5;
      ring.rotation.y = i * 0.8;
      matrixGroup.add(ring);
    }
    scene.add(matrixGroup);

    const crystalGroup = new THREE.Group();
    crystalGroup.position.set(0, -0.2, -54);
    const crystalMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9),
      new THREE.MeshStandardMaterial({
        color: "#10b981",
        wireframe: true,
        emissive: "#059669",
        emissiveIntensity: 0.35,
      })
    );
    crystalGroup.add(crystalMesh);
    scene.add(crystalGroup);

    // --- 8. Mouse / Pointer Parallax Tracking & Raycasting ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    let hoveredSimonTileIdx: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseVec.x = mouse.targetX;
      mouseVec.y = mouse.targetY;
      raycaster.setFromCamera(mouseVec, camera);

      let isHovering = false;

      // Inside secret room: hover over light switch
      if (isInSecretRoomRef.current) {
        const switchHits = raycaster.intersectObjects([switchBase, switchLever], true);
        if (switchHits.length > 0) isHovering = true;
      } else if (progressRef.current > 0.7) {
        // In corridor: check Simon tiles above door
        if (isLookingAtRightWallRef.current) {
          const simonHits = raycaster.intersectObjects(simonTileMeshes, false);
          if (simonHits.length > 0) {
            hoveredSimonTileIdx = (simonHits[0].object as THREE.Mesh).userData.tileIndex;
            isHovering = true;
          } else {
            hoveredSimonTileIdx = null;
          }
        }

        // Check passage click
        if (isGameSolvedRef.current) {
          const passageHits = raycaster.intersectObjects([passageZoneMesh, ...wallCubeMeshes], true);
          if (passageHits.length > 0) isHovering = true;
        }

        if (!isHovering) {
          const doorHits = raycaster.intersectObjects([doorGroup, doorbellGroup], true);
          if (doorHits.length > 0) isHovering = true;
        }
      }

      const target = e.target as HTMLElement | null;
      if (!target?.closest("button, a, input, select, textarea")) {
        document.body.style.cursor = isHovering ? "pointer" : "default";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, select, textarea, .glass-panel")) {
        return;
      }

      mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      // 1. If inside secret room: click light switch on desk!
      if (isInSecretRoomRef.current) {
        const switchHits = raycaster.intersectObjects([switchBase, switchLever], true);
        if (switchHits.length > 0) {
          onToggleSecretRoomLightRef.current?.();
          return;
        }
        return;
      }

      if (progressRef.current > 0.7) {
        // 2. If looking at the Simon game above the door: click Simon tiles!
        if (isLookingAtRightWallRef.current) {
          const simonHits = raycaster.intersectObjects(simonTileMeshes, false);
          if (simonHits.length > 0) {
            const hitMesh = simonHits[0].object as THREE.Mesh;
            const idx = hitMesh.userData.tileIndex;
            if (idx !== undefined) {
              onWallTileClickRef.current?.(idx);
            }
            return;
          }
        }

        // 3. If wall is open, clicking the passage steps into the secret room!
        if (isGameSolvedRef.current) {
          const passageHits = raycaster.intersectObjects([passageZoneMesh, ...wallCubeMeshes], true);
          if (passageHits.length > 0) {
            onEnterSecretRoomRef.current?.();
            return;
          }
        }

        // 4. Door and Doorbell clicks
        const doorIntersects = raycaster.intersectObjects([doorGroup, doorbellGroup], true);
        if (doorIntersects.length > 0) {
          let isDoorbell = false;
          let curr: THREE.Object3D | null = doorIntersects[0].object;
          while (curr) {
            if (curr === doorbellGroup) {
              isDoorbell = true;
              break;
            }
            curr = curr.parent;
          }

          if (isDoorbell) {
            onDoorbellRingRef.current();
          } else {
            onDoorClickRef.current();
          }
          return;
        }
      }
    };
    window.addEventListener("click", handleClick);

    // --- 9. Resize Handling ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // --- 10. Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const minZ = 5.0;
    const maxZ = -74.0;
    let currentCameraX = 0;
    let currentCameraY = -0.2;
    let currentCameraZ = minZ;

    let currentLookX = 0;
    let currentLookY = -0.2;
    let currentLookZ = -20;

    let lastRattleCount = doorRattleCountRef.current;
    let rattleStartTime = -1;
    let winStartTime = -1;
    let lastTermUpdate = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (elapsed - lastTermUpdate > 0.04) {
        updateTerminal(elapsed);
        lastTermUpdate = elapsed;
      }

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const inSecret = isInSecretRoomRef.current;
      const isSimonActive = isLookingAtRightWallRef.current;

      if (inSecret) {
        // --- INSIDE THE SECRET ROOM VIEW ---
        const targetCamX = 0.5 + mouse.x * 0.35;
        const targetCamY = -1.55 + mouse.y * 0.25;
        const targetCamZ = -82.6;

        const targetLkX = 0.0 + mouse.x * 0.6;
        const targetLkY = -1.25 + mouse.y * 0.35;
        const targetLkZ = -84.6;

        currentCameraX += (targetCamX - currentCameraX) * 0.06;
        currentCameraY += (targetCamY - currentCameraY) * 0.06;
        currentCameraZ += (targetCamZ - currentCameraZ) * 0.06;

        currentLookX += (targetLkX - currentLookX) * 0.06;
        currentLookY += (targetLkY - currentLookY) * 0.06;
        currentLookZ += (targetLkZ - currentLookZ) * 0.06;

        camera.position.set(currentCameraX, currentCameraY, currentCameraZ);
        camera.lookAt(currentLookX, currentLookY, currentLookZ);
      } else {
        // --- CORRIDOR NAVIGATION VIEW ---
        const targetZ = minZ + progressRef.current * (maxZ - minZ);
        currentCameraZ += (targetZ - currentCameraZ) * 0.08;

        const speed = Math.abs(targetZ - currentCameraZ);
        const headBob = Math.sin(elapsed * 6) * speed * 0.08;

        const targetCamX = mouse.x * 0.45;
        const targetCamY = -0.2 + mouse.y * 0.25 + headBob;

        currentCameraX += (targetCamX - currentCameraX) * 0.08;
        currentCameraY += (targetCamY - currentCameraY) * 0.08;

        // Look direction:
        // When Simon is active, camera frames the Simon grid above the door (X = 3.5, Y = 1.3, Z = -80.0)
        // Otherwise straight ahead
        const targetLkX = isSimonActive
          ? 3.2
          : isGameSolvedRef.current && progressRef.current > 0.85
          ? 1.6
          : mouse.x * 0.6;
        const targetLkY = isSimonActive
          ? 1.2
          : isGameSolvedRef.current && progressRef.current > 0.85
          ? -0.8
          : -0.2;
        const targetLkZ = isSimonActive ? -80.0 : Math.max(currentCameraZ - 20, -80);

        currentLookX += (targetLkX - currentLookX) * 0.06;
        currentLookY += (targetLkY - currentLookY) * 0.06;
        currentLookZ += (targetLkZ - currentLookZ) * 0.06;

        camera.position.set(currentCameraX, currentCameraY, currentCameraZ);
        camera.lookAt(currentLookX, currentLookY + mouse.y * 0.3, currentLookZ);
      }

      // Rotate floating sculptures
      icoGroup.rotation.y = elapsed * 0.5;
      icoGroup.rotation.x = Math.sin(elapsed * 0.7) * 0.2;
      icoGroup.position.y = -0.2 + Math.sin(elapsed * 1.5) * 0.12;

      matrixGroup.rotation.y = elapsed * 0.4;
      matrixGroup.rotation.z = Math.cos(elapsed * 0.5) * 0.2;
      matrixGroup.position.y = -0.2 + Math.sin(elapsed * 1.6 + 1) * 0.12;

      crystalGroup.rotation.y = elapsed * 0.6;
      crystalGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.3;
      crystalGroup.position.y = -0.2 + Math.sin(elapsed * 1.7 + 2) * 0.12;

      // Check Door Rattle
      if (doorRattleCountRef.current > lastRattleCount) {
        lastRattleCount = doorRattleCountRef.current;
        rattleStartTime = elapsed;
      }

      let rattleOffset = 0;
      let rattleAngle = 0;
      if (rattleStartTime > 0 && elapsed - rattleStartTime < 0.35) {
        const rNorm = (elapsed - rattleStartTime) / 0.35;
        const decay = 1 - rNorm;
        rattleOffset = Math.sin(rNorm * 50) * 0.03 * decay;
        rattleAngle = Math.sin(rNorm * 45) * 0.04 * decay;
      }

      // Door opening rotation
      const targetDoorAngle = doorOpenRef.current ? -Math.PI / 2.15 : 0;
      doorLeafPivot.rotation.y = THREE.MathUtils.lerp(
        doorLeafPivot.rotation.y,
        targetDoorAngle + rattleAngle,
        0.06
      );
      doorLeafPivot.position.x = -doorWidth / 2 + rattleOffset;

      // Light beam opacity
      const beamTargetOpacity = doorOpenRef.current ? 0.65 : 0.12;
      beam.material.opacity = THREE.MathUtils.lerp(beam.material.opacity, beamTargetOpacity, 0.05);

      // Doorbell visuals
      const isDoorOpenNow = doorOpenRef.current;
      if (isDoorOpenNow) {
        bellLight.intensity = THREE.MathUtils.lerp(
          bellLight.intensity,
          1.8 + Math.sin(elapsed * 4) * 0.4,
          0.1
        );
        bellBtnMat.emissiveIntensity = 0.9;
        bellRingMat.color.set("#06b6d4");
      } else {
        bellLight.intensity = THREE.MathUtils.lerp(bellLight.intensity, 0, 0.1);
        bellBtnMat.emissiveIntensity = 0.05;
        bellRingMat.color.set("#242b35");
      }

      // --- SIMON GAME TILES VISUAL STATE (Above door) ---
      const activeIdx = activeTileRef.current;
      simonTileMeshes.forEach((mesh, idx) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const col = SIMON_COLORS[idx];
        if (activeIdx === idx) {
          mat.color.set(col);
          mat.emissive.set(col);
          mat.emissiveIntensity = 2.4;
        } else if (hoveredSimonTileIdx === idx && isSimonActive) {
          mat.color.set(col);
          mat.emissive.set(col);
          mat.emissiveIntensity = 0.6;
        } else {
          mat.color.set("#181b22");
          mat.emissive.set("#000000");
          mat.emissiveIntensity = 0;
        }
      });

      if (activeIdx !== null && activeIdx >= 0 && activeIdx < 9) {
        simonGridLight.color.set(SIMON_COLORS[activeIdx]);
        simonGridLight.intensity = THREE.MathUtils.lerp(simonGridLight.intensity, 3.5, 0.2);
      } else {
        simonGridLight.intensity = THREE.MathUtils.lerp(simonGridLight.intensity, 0, 0.2);
      }

      // --- SECRET ROOM LIGHTING & SWITCH VISUALS ---
      const isLit = isSecretRoomLitRef.current;
      const targetRoomIntensity = isLit ? 3.5 : 0.0;
      secretRoomCeilingLight.intensity = THREE.MathUtils.lerp(
        secretRoomCeilingLight.intensity,
        targetRoomIntensity,
        0.1
      );

      // Switch LED & Beacon
      switchLedMat.color.set(isLit ? "#10b981" : "#ef4444");
      switchBeaconLight.color.set(isLit ? "#10b981" : "#ef4444");
      switchBeaconLight.intensity = isLit ? 0.3 : 0.8;
      switchLever.rotation.x = isLit ? 0.25 : -0.25;

      // --- RETRACTING OF THE 9 WALL TILES BELOW (X: 2.0 to 5.0, Y: -3.0 to 0.0) ---
      if (isGameSolvedRef.current) {
        if (winStartTime < 0) {
          winStartTime = elapsed;
        }

        portalBorderMat.opacity = THREE.MathUtils.lerp(portalBorderMat.opacity, 0.85, 0.05);

        for (let i = 0; i < 9; i++) {
          const cubeDelay = i * 0.16; // 160ms staggered
          if (elapsed - winStartTime >= cubeDelay) {
            cubeTargetZ[i] = -3.8;
            if (!cubeSlideTriggered[i]) {
              cubeSlideTriggered[i] = true;
              soundManager.playCubeSlide(i);
            }
          }
        }
      }

      wallCubeMeshes.forEach((mesh, idx) => {
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, cubeTargetZ[idx] - 0.175, 0.08);

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (isGameSolvedRef.current) {
          const distanceMoved = Math.abs(mesh.position.z - (-0.175));
          if (distanceMoved > 0.5) {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.0, 0.06);
            if (mat.opacity < 0.05) mesh.visible = false;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      document.body.style.cursor = "default";

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}