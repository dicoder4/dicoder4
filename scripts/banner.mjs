import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function nowIST() {
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(new Date());
  return timeFmt;
}

function periodIST() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false
  }).format(new Date()));
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "sunset";
  return "night";
}

const artMap = {
  morning: "banner-morning.png",
  sunset: "banner-sunset.png",
  night: "banner-night.png"
};

const period = periodIST();
const time = nowIST();
const bg = artMap[period];

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
  <image href="../art/${bg}" x="0" y="0" width="1200" height="600" preserveAspectRatio="xMidYMid slice"/>
  <rect x="950" y="20" width="230" height="60" rx="10" fill="#111827" opacity="0.7"/>
  <text x="1065" y="58" font-family="monospace" font-size="26" fill="#10b981" text-anchor="middle">${time} IST</text>
</svg>`;

fs.writeFileSync(path.join(outDir, "banner.svg"), svg, "utf8");
console.log(`Banner generated for ${period} → ${bg}`);
