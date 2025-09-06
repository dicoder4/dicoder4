import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// --- IST helpers ---
function istHM() {
  const d = new Date();
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hh, mm] = f.format(d).split(":").map(Number);
  return { hh, mm, total: hh * 60 + mm };
}
function istTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

// --- Decide period by minute-of-day ---
function getPeriod() {
  const { total } = istHM();
  // minute marks
  const m = total;
  if (m >= 360 && m < 480) return "yoga";                // 06:00–07:59
  if (m >= 480 && m < 720) return "morning-coding";      // 08:00–11:59
  if (m >= 720 && m < 990) return "afternoon";           // 12:00–16:29
  if (m >= 990 && m < 1020) return "coffee";             // 16:30–16:59
  if (m >= 1020 && m < 1140) return "sunset-work";       // 17:00–18:59
  if (m >= 1140 && m < 1440) return "bed-work";          // 19:00–23:59
  return "sleep";                                        // 00:00–05:59
}

const period = getPeriod();
const timeStr = istTime();
const tzStr = "GMT+05:30";

const artMap = {
  "yoga": "banner-yoga.png",
  "morning-coding": "banner-morning-coding.png",
  "afternoon": "banner-afternoon.png",
  "coffee": "banner-coffee.png",
  "sunset-work": "banner-sunset-work.png",
  "bed-work": "banner-bed-work.png",
  "sleep": "banner-sleep.png",
};

const imgPath = path.join(process.cwd(), "art", artMap[period]);

// Inline PNG so GitHub renders it
const imgBuf = fs.readFileSync(imgPath);
const dataUri = `data:image/png;base64,${imgBuf.toString("base64")}`;

// --- SVG output with timezone + update note ---
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <image href="${dataUri}" x="0" y="0" width="1200" height="600" preserveAspectRatio="xMidYMid slice"/>

  <!-- time/zone badge -->
  <rect x="860" y="18" width="320" height="62" rx="12" fill="#0b1220" opacity="0.78"/>
  <text x="1020" y="56" text-anchor="middle"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        font-size="24" fill="#10b981">${timeStr} IST (${tzStr})</text>

  <!-- footer update notice -->
  <text x="600" y="580" text-anchor="middle"
        font-family="Inter, Segoe UI, Roboto, Arial"
        font-size="18" fill="#6ee7b7">⏱ Updates every few minutes · ${period.replace("-", " ").toUpperCase()}</text>
</svg>`;

fs.writeFileSync(path.join(outDir, "banner.svg"), svg, "utf8");
console.log(`Banner generated for ${period} → ${artMap[period]}`);
