const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:/Users/Hi/.gemini/antigravity-ide/brain/c69f3507-04f0-4a17-83f1-04cdc06cf75f';
const outputDir = path.resolve('./public/images');

const goals = [
  {
    key: 'lose-fat',
    sourceImage: path.join(brainDir, 'goal_card_lose_fat_1792955426834.jpg'),
    outputFile: 'goal-card-lose-fat.png',
    title: 'Lose Body Fat',
    subtitle: 'Reduce fat & keep muscle.',
    iconSvg: `
      <circle cx="36" cy="36" r="35" fill="#ffffff" />
      <g transform="translate(36, 36) scale(1.6) translate(-12, -12)">
        <path fill="#ff5722" d="M12 22.5c-4.4 0-8-3.4-8-7.5 0-4.2 4.8-9.2 7.3-11.3.4-.3 1-.3 1.4 0 2.5 2.1 7.3 7.1 7.3 11.3 0 4.1-3.6 7.5-8 7.5z" />
        <path fill="#ffb74d" d="M12 20c-2.2 0-4-1.7-4-3.8 0-2.1 2.4-4.6 3.6-5.7.2-.2.6-.2.8 0 1.2 1.1 3.6 3.6 3.6 5.7 0 2.1-1.8 3.8-4 3.8z" />
      </g>
    `
  },
  {
    key: 'build-strength',
    sourceImage: path.join(brainDir, 'goal_card_build_strength_1792955451186.jpg'),
    outputFile: 'goal-card-build-strength.png',
    title: 'Build Strength',
    subtitle: 'Get stronger & lift better.',
    iconSvg: `
      <circle cx="36" cy="36" r="35" fill="#ffffff" />
      <g transform="translate(36, 36) scale(1.75) translate(-12, -12)">
        <rect x="2.5" y="8" width="2.5" height="8" rx="0.8" fill="#111827" />
        <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="#111827" />
        <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="#111827" stroke-width="2.2" stroke-linecap="round" />
        <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="#111827" />
        <rect x="19" y="8" width="2.5" height="8" rx="0.8" fill="#111827" />
      </g>
    `
  },
  {
    key: 'improve-fitness',
    sourceImage: path.join(brainDir, 'goal_card_improve_fitness_1792955474737.jpg'),
    outputFile: 'goal-card-improve-fitness.png',
    title: 'Improve Fitness',
    subtitle: 'Increase stamina & energy.',
    iconSvg: `
      <circle cx="36" cy="36" r="35" fill="#ffffff" />
      <g transform="translate(36, 36) scale(1.65) translate(-12, -12)">
        <rect x="3" y="12" width="3.5" height="9" rx="0.8" fill="#057a44" />
        <rect x="10" y="7" width="3.5" height="14" rx="0.8" fill="#057a44" />
        <rect x="17" y="3" width="3.5" height="18" rx="0.8" fill="#057a44" />
      </g>
    `
  },
  {
    key: 'build-consistency',
    sourceImage: path.join(brainDir, 'goal_card_build_consistency_1792955498196.jpg'),
    outputFile: 'goal-card-build-consistency.png',
    title: 'Build Consistency',
    subtitle: 'Sustainable routine plan.',
    iconSvg: `
      <circle cx="36" cy="36" r="35" fill="#ffffff" />
      <g transform="translate(36, 36) scale(1.7) translate(-12, -12)">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#057a44" stroke-width="2.2" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="#057a44" stroke-width="2.2" />
        <circle cx="12" cy="12" r="2" fill="#057a44" />
      </g>
    `
  }
];

async function generateCards() {
  const width = 932;
  const height = 332;

  for (const g of goals) {
    console.log(`Processing ${g.key}...`);
    // Copy raw model photo to public/images/model-[key].jpg
    const modelTarget = path.join(outputDir, `model-${g.key}.jpg`);
    if (fs.existsSync(g.sourceImage)) {
      fs.copyFileSync(g.sourceImage, modelTarget);
      console.log(`Copied raw model to ${modelTarget}`);
    }

    // Resize source photo to 932x332 covering the right side
    const resizedBg = await sharp(g.sourceImage)
      .resize({
        width: width,
        height: height,
        fit: 'cover',
        position: 'right'
      })
      .toBuffer();

    // SVG Overlay containing:
    // 1. Dark vignette / gradient on the left: solid black on left fading to transparent at right
    // 2. SELECTED GOAL pill (top-left)
    // 3. Circular icon with shadow
    // 4. Title typography (42px bold Inter/system font)
    // 5. Subtitle typography (22px medium)
    // 6. Top-right neon checkmark badge
    const svgOverlay = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#050a08" stop-opacity="1.0" />
            <stop offset="42%" stop-color="#050a08" stop-opacity="1.0" />
            <stop offset="56%" stop-color="#050a08" stop-opacity="0.85" />
            <stop offset="72%" stop-color="#050a08" stop-opacity="0.35" />
            <stop offset="88%" stop-color="#050a08" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="bottomShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="60%" stop-color="#000000" stop-opacity="0.0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
          </linearGradient>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
          </filter>
        </defs>

        <!-- Dark left gradient overlay for maximum readability -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#leftFade)" />
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bottomShadow)" />

        <!-- SELECTED GOAL Pill (Top Left) -->
        <g transform="translate(38, 32)">
          <rect x="0" y="0" width="260" height="46" rx="23" fill="#031f13" fill-opacity="0.85" stroke="#00c853" stroke-width="2.5" />
          <!-- Checkmark in circle -->
          <circle cx="28" cy="23" r="16" fill="#00e676" />
          <path d="M21 23l4.5 4.5 9-9" fill="none" stroke="#022a18" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Text -->
          <text x="60" y="29.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="900" fill="#ffffff" letter-spacing="2">SELECTED GOAL</text>
        </g>

        <!-- White Circle Icon -->
        <g transform="translate(38, 102)" filter="url(#cardShadow)">
          ${g.iconSvg}
        </g>

        <!-- Goal Title & Subtitle -->
        <g transform="translate(38, 232)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
            ${g.title.replace(/&/g, '&amp;')}
          </text>
          <text x="0" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="23" font-weight="500" fill="#e5e7eb" letter-spacing="0">
            ${g.subtitle.replace(/&/g, '&amp;')}
          </text>
        </g>

        <!-- Top Right Neon Checkmark Badge -->
        <g transform="translate(${width - 80}, 28)" filter="url(#cardShadow)">
          <circle cx="28" cy="28" r="28" fill="#00e676" />
          <path d="M16 28l8 8 16-16" fill="none" stroke="#022a18" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      </svg>
    `;

    // Composite overlay onto background image
    const finalBuffer = await sharp(resizedBg)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0
        }
      ])
      .png({ quality: 90, compressionLevel: 8 })
      .toBuffer();

    const outPath = path.join(outputDir, g.outputFile);
    fs.writeFileSync(outPath, finalBuffer);
    console.log(`Saved composite card to ${outPath}`);
  }

  // Also copy goal-card-2x.png to goal-card-muscle-gain.png if needed
  const muscleCard = path.join(outputDir, 'goal-card-2x.png');
  const muscleTarget = path.join(outputDir, 'goal-card-muscle-gain.png');
  if (fs.existsSync(muscleCard)) {
    fs.copyFileSync(muscleCard, muscleTarget);
    console.log(`Copied ${muscleCard} to ${muscleTarget}`);
  }

  console.log('All goal cards generated successfully!');
}

generateCards().catch(console.error);
