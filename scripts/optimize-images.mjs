import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.resolve("./public/images");

async function optimizeImages() {
  console.log("Starting image optimization in:", IMAGES_DIR);
  const files = fs.readdirSync(IMAGES_DIR);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const stat = fs.statSync(filePath);
    totalBefore += stat.size;

    const ext = path.extname(file).toLowerCase();
    const tempPath = path.join(IMAGES_DIR, `_tmp_${file}`);

    if (ext === ".jpg" || ext === ".jpeg") {
      const isNano = file.includes("-nano");
      const isHero = file.includes("hero");
      const isCoach = file.includes("coach");
      const isGuide = file.includes("measuring");

      let pipeline = sharp(filePath);
      const meta = await pipeline.metadata();

      if (isNano && meta.width && meta.width > 640) {
        pipeline = pipeline.resize({ width: 640 });
      } else if ((isCoach || isGuide) && meta.width && meta.width > 800) {
        pipeline = pipeline.resize({ width: 800 });
      } else if (meta.width && meta.width > 1200) {
        pipeline = pipeline.resize({ width: 1200 });
      }

      await pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(tempPath);
      fs.renameSync(tempPath, filePath);
    } else if (ext === ".png") {
      if (file.includes("hair")) {
        // Keep small png as is
        continue;
      }
      let pipeline = sharp(filePath);
      await pipeline.png({ quality: 85, compressionLevel: 9 }).toFile(tempPath);
      fs.renameSync(tempPath, filePath);
    }

    const newStat = fs.statSync(filePath);
    totalAfter += newStat.size;
    console.log(
      `✓ ${file}: ${(stat.size / 1024).toFixed(1)} KB -> ${(newStat.size / 1024).toFixed(1)} KB (-${(
        ((stat.size - newStat.size) / stat.size) *
        100
      ).toFixed(1)}%)`
    );
  }

  console.log(
    `\nTotal images payload: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(
      totalAfter /
      1024 /
      1024
    ).toFixed(2)} MB (Saved ${(
      ((totalBefore - totalAfter) / totalBefore) *
      100
    ).toFixed(1)}%)`
  );
}

optimizeImages().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
