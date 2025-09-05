import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function istHour() {
  return Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false
  }).format(new Date()));
}
function istTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(new Date());
}

const hour = istHour();
const period = hour >= 5 && hour < 12 ? "morning" : hour < 18 ? "sunset" : "night";
const artMap = { morning: "banner-morning.png", sunset: "banner-sunset.png", night: "banner-night.png" };
const imgPath = path.join(process.cwd(), "art", artMap[period]);

// IMPORTANT: inline PNG so GitHub renders it
const imgBuf = fs.readFileSync(imgPath);
const dataUri = `data:image/png;base64,${imgBuf.toString("base64")}`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <image href="${dataUri}" x="0" y="0" width="1200" height="600" preserveAspectRatio="xMidYMid slice"/>
  <!-- small label (optional) -->
  <rect x="940" y="20" width="240" height="54" rx="10" fill="#0b1220" opacity="0.75"/>
  <text x="1060" y="56" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        font-size="24" fill="#10b981" text-anchor="middle">${istTime()} IST</text>
</svg>`;

fs.writeFileSync(path.join(outDir, "banner.svg"), svg, "utf8");
console.log(`Banner generated for ${period} (inlined).`);
