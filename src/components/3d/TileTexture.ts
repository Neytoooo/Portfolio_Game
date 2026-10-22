import * as THREE from "three";

/**
 * Generates a high quality procedural tile texture matching the user's specification:
 * "tout gris et ligne gris foncé" (all grey tiles with dark grey grout/grid lines)
 */
export function createTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Base tile fill: Modern architectural studio concrete / stone grey
  ctx.fillStyle = "#8d939c";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle interior tile subtle gradient (slightly lighter in center)
  const gradient = ctx.createRadialGradient(256, 256, 30, 256, 256, 320);
  gradient.addColorStop(0, "#9ea4ad");
  gradient.addColorStop(1, "#838992");
  ctx.fillStyle = gradient;
  ctx.fillRect(4, 4, 504, 504);

  // 2. Micro concrete noise / grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Inner bevel highlight on top & left edges
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(12, 500);
  ctx.lineTo(12, 12);
  ctx.lineTo(500, 12);
  ctx.stroke();

  // 4. Inner bevel shadow on bottom & right edges
  ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(12, 500);
  ctx.lineTo(500, 500);
  ctx.lineTo(500, 12);
  ctx.stroke();

  // 5. Dark grey tile joint / grout line around the perimeter
  // "ligne gris foncé"
  ctx.strokeStyle = "#1d2024";
  ctx.lineWidth = 14;
  ctx.strokeRect(0, 0, 512, 512);

  // Inner border to sharpen joint transition
  ctx.strokeStyle = "#2b2f36";
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 7, 498, 498);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * Roughness bump map matching the tile joint depressions
 */
export function createTileBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // High elevation for the tile surface
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  // Depressed grout line around perimeter
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
