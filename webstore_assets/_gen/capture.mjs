// Regenerates the Chrome Web Store assets in ../ from the mock pages in this folder.
// The popup mocks load the real ../../popup.html + ../../popup.js, so they track the shipped UI.
//
//   1. From the repo root:   python3 -m http.server 8765 --bind 127.0.0.1
//   2. In this folder:       npm install --no-save playwright-core
//                            node capture.mjs [name-filter]     e.g. `node capture.mjs cover`
//
// Needs a Chromium-based browser; set BROWSER_PATH if it is not the default below.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.MOCK_BASE || "http://127.0.0.1:8765/webstore_assets/_gen";
const OUT = fileURLToPath(new URL("../", import.meta.url));
const BROWSER_PATH =
  process.env.BROWSER_PATH ||
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";

// width/height = viewport in CSS px, scale = device pixel ratio.
// out = final pixel size; the capture is supersampled and downsized to it with `sips`.
// The format follows the file extension.
const jobs = [
  // Standalone popup, exported at 2x (720px wide) for sharpness.
  { name: "popup_light.png", url: "/popup.html?data=cws", width: 360, height: 480, scheme: "light", scale: 2, fitBody: true },
  { name: "popup_dark.png", url: "/popup.html?data=cws", width: 360, height: 480, scheme: "dark", scale: 2, fitBody: true },
  // Chrome Web Store screenshots: exactly 1280x800, 24-bit PNG.
  { name: "ss_light.png", url: "/scene.html", width: 1280, height: 800, scheme: "light", scale: 1 },
  { name: "ss_dark.png", url: "/scene.html", width: 1280, height: 800, scheme: "dark", scale: 1 },
  // Covers: 1280x800 marquee + 440x280 small promo tile (same HTML, different viewport).
  // 440x280 is slightly taller than 16:10, so the page is opened at 3x that size
  // (the 1280x800 stage scales to fit, the background fills the rest).
  { name: "cover.jpeg", url: "/cover_classic.html", width: 1280, height: 800, scheme: "dark", scale: 2, out: [1280, 800] },
  { name: "cover_440x280.jpeg", url: "/cover_classic.html", width: 1320, height: 840, scheme: "dark", scale: 2, out: [440, 280] },
  { name: "cover2.jpeg", url: "/cover.html", width: 1280, height: 800, scheme: "dark", scale: 2, out: [1280, 800] },
  { name: "cover2_440x280.jpeg", url: "/cover.html", width: 1320, height: 840, scheme: "dark", scale: 2, out: [440, 280] },
  { name: "cover_landing.png", url: "/cover_landing.html", width: 1280, height: 800, scheme: "dark", scale: 2, out: [1280, 800] },
  { name: "cover_landing_440x280.png", url: "/cover_landing.html", width: 1320, height: 840, scheme: "dark", scale: 2, out: [440, 280] },
];

const filter = process.argv[2];
const browser = await chromium.launch({ executablePath: BROWSER_PATH, headless: true });

async function open(job, width, height, scale) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    colorScheme: job.scheme,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.error(`[${job.name}] page error:`, error.message));
  await page.goto(BASE + job.url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "true", null, {
    timeout: 15000,
  });
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  return { context, page };
}

async function shoot(job, width, height, scale, options) {
  const { context, page } = await open(job, width, height, scale);
  await page.screenshot(options);
  await context.close();
}

try {
  for (const job of jobs) {
    if (filter && !job.name.includes(filter)) continue;
    let height = job.height;
    if (job.fitBody) {
      // Measure first, then reopen at the exact size (resizing in place can glitch).
      const probe = await open(job, job.width, height, job.scale);
      height = await probe.page.evaluate(() => document.body.offsetHeight);
      await probe.context.close();
    }

    const target = OUT + job.name;
    const jpeg = /\.jpe?g$/.test(job.name);
    let size = `${job.width * job.scale}x${height * job.scale}`;

    if (!job.out) {
      await shoot(job, job.width, height, job.scale, { path: target, type: "png" });
    } else {
      const [outWidth, outHeight] = job.out;
      size = `${outWidth}x${outHeight}`;
      const hires = fileURLToPath(new URL("./.hires.png", import.meta.url));
      try {
        await shoot(job, job.width, height, job.scale, { path: hires, type: "png" });
        execFileSync("sips", [
          "-s", "format", jpeg ? "jpeg" : "png",
          ...(jpeg ? ["-s", "formatOptions", "92"] : []),
          "-z", String(outHeight), String(outWidth), hires, "--out", target,
        ], { stdio: "ignore" });
      } catch {
        // No `sips` (non-macOS): render straight at the output size instead.
        await shoot(job, outWidth, outHeight, 1, {
          path: target,
          ...(jpeg ? { type: "jpeg", quality: 92 } : { type: "png" }),
        });
      } finally {
        rmSync(hires, { force: true });
      }
    }
    console.log(`${job.name}: ${size}`);
  }
} finally {
  await browser.close();
}
