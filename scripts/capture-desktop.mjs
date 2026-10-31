import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("./screenshots");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const routes = [
  { name: "home", path: "/" },
  { name: "goal", path: "/goal" },
  { name: "details-step1", path: "/details" },
  { name: "details-step2", path: "/details?step=2" },
  { name: "calculating", path: "/calculating" },
  { name: "result", path: "/result" },
  { name: "plan", path: "/plan" },
  { name: "checkout", path: "/checkout" },
  { name: "contact", path: "/contact" },
  { name: "about", path: "/about" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Inject session storage draft data so funnels and results render
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "bmyfit_draft_details_v1",
      JSON.stringify({
        gender: "male",
        age: 26,
        heightCm: 175,
        weightKg: 72,
        waistIn: 32,
        neckIn: 15,
        hipIn: 38,
      })
    );
    sessionStorage.setItem(
      "bmyfit_local_assessment",
      JSON.stringify({
        id: "asm_demo_desktop",
        gender: "male",
        age: 26,
        heightCm: 175,
        weightKg: 72,
        waistIn: 32,
        neckIn: 15,
        hipIn: 38,
        goal: "fat-loss",
        activityLevel: "sedentary",
        dietPreference: "vegetarian",
        bmi: 23.5,
        bmiCategory: "normal",
        bodyFatPercent: 18.4,
        bodyFatCategory: "fitness",
        createdAt: new Date().toISOString(),
      })
    );
  });

  for (const route of routes) {
    try {
      console.log(`Navigating to ${route.name} (${route.path})...`);
      await page.goto(`http://localhost:5173${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(2000);
      const filePath = path.join(OUT_DIR, `${route.name}-desktop.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Error capturing ${route.name}:`, err.message);
    }
  }

  await browser.close();
  console.log("Finished capturing screenshots!");
}

main().catch(console.error);

