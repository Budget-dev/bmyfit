import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcPath = "C:/Users/Hi/.gemini/antigravity-ide/brain/431d5422-795e-48f3-800c-2c472b0b66ed/.user_uploaded/media_1792998528057.png";
const destDir = "d:/Download/bmyfit-enterprise-starter/bmyfit-enterprise-starter/public/images";

const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

console.log(`Protecting coach face & skin while styling background (${width}x${height})...`);

const outData = Buffer.from(data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const isCoachSilhouette = x >= 180 && x <= 525 && y >= 65;

    let isRedGraphic = false;
    if (isCoachSilhouette) {
      // ONLY pure crimson red (from letter S in background): g < 32 && b < 32 && r > 110
      // Coach Naveen's skin has g > 65, hair has r < 60, shirt has g > 45.
      if (r > 110 && g < 32 && b < 32) {
        isRedGraphic = true;
      }
    } else {
      // Background areas (left, right, top):
      if ((r > 80 && g < 45 && b < 45) || (r > 65 && g < 75 && b < 75 && r > g * 1.35)) {
        isRedGraphic = true;
      }
    }

    if (isRedGraphic) {
      const intensity = Math.min(1, r / 180);
      outData[idx] = Math.round(2 * intensity);
      outData[idx + 1] = Math.min(255, Math.round(230 * intensity));
      outData[idx + 2] = Math.min(255, Math.round(110 * intensity));
    } else {
      outData[idx] = r;
      outData[idx + 1] = g;
      outData[idx + 2] = b;
    }
  }
}

// SVG Lighting and Branding Overlay:
const svgOverlay = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Dark Forest Vignette -->
    <radialGradient id="forestVignette" cx="62%" cy="40%" r="68%">
      <stop offset="45%" stop-color="#021811" stop-opacity="0" />
      <stop offset="80%" stop-color="#021811" stop-opacity="0.48" />
      <stop offset="100%" stop-color="#010e0a" stop-opacity="0.92" />
    </radialGradient>

    <!-- Bottom Dark Gradient for Title readability -->
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="60%" stop-color="#021811" stop-opacity="0" />
      <stop offset="82%" stop-color="#021811" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#010c08" stop-opacity="0.98" />
    </linearGradient>

    <!-- Left emerald atmospheric haze -->
    <radialGradient id="emeraldHaze" cx="12%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#00e676" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#00c853" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Lighting Overlays -->
  <rect width="${width}" height="${height}" fill="url(#forestVignette)" />
  <rect width="${width}" height="${height}" fill="url(#emeraldHaze)" />
  <rect width="${width}" height="${height}" fill="url(#bottomFade)" />

  <!-- Blaze Gym & Coach Naveen Credentials Card at Bottom Left -->
  <g transform="translate(20, ${height - 68})">
    <!-- Pill Badge -->
    <rect width="215" height="22" rx="11" fill="#00e676" fill-opacity="0.22" stroke="#00e676" stroke-width="1.2" />
    <circle cx="12" cy="11" r="3.5" fill="#00e676" />
    <text x="22" y="15" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="800" fill="#00e676" letter-spacing="1.2">BLAZE GYM · OWNER &amp; COACH</text>
    
    <!-- Coach Naveen Title -->
    <text x="2" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="0.5">COACH NAVEEN</text>
    
    <!-- Subtitle -->
    <text x="2" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="600" fill="#a7f3d0" letter-spacing="0.3">Certified Fitness Coach &amp; Sports Nutritionist</text>
  </g>
</svg>
`);

// Composite and write final images
const finalJpg = await sharp(outData, { raw: { width, height, channels } })
  .composite([{ input: svgOverlay, top: 0, left: 0 }])
  .jpeg({ quality: 95 })
  .toBuffer();

fs.writeFileSync(path.join(destDir, "coach-naveen.jpg"), finalJpg);
fs.writeFileSync(path.join(destDir, "coach-portrait.jpg"), finalJpg);

// Square Avatar
const avatarSvg = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="avVig" cx="50%" cy="45%" r="55%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#021811" stop-opacity="0.65" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#avVig)" />
</svg>
`);

const cleanAvatar = await sharp(outData, { raw: { width, height, channels } })
  .composite([{ input: avatarSvg, top: 0, left: 0 }])
  .jpeg({ quality: 95 })
  .toBuffer();

fs.writeFileSync(path.join(destDir, "coach-naveen-avatar.jpg"), cleanAvatar);

console.log("Protected Coach Naveen portraits generated successfully!");
