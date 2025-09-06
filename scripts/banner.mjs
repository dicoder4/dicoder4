import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const statePath = path.join(outDir, "banner_state.json");
const LAYOUT_VERSION = 3; // bump when you change badge layout/text

// ---- IST helpers ----
function istHM() {
  const d = new Date();
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const [hh, mm] = f.format(d).split(":").map(Number);
  return { hh, mm, total: hh * 60 + mm };
}

// format minutes since midnight to h:mm(am/pm)
function fmt(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  const ampm = h24 < 12 ? "am" : "pm";
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

// ---- Slots (inclusive start, exclusive end) ----
const SLOTS = [
  { key: "sleep",         start:   0, end: 360,  label: () => `${fmt(0)}–${fmt(359)}` },          // 00:00–05:59
  { key: "yoga",          start: 360, end: 480,  label: () => `${fmt(360)}–${fmt(479)}` },         // 06:00–07:59
  { key: "morning-coding",start: 480, end: 720,  label: () => `${fmt(480)}–${fmt(719)}` },         // 08:00–11:59
  { key: "afternoon",     start: 720, end: 990,  label: () => `${fmt(720)}–${fmt(989)}` },         // 12:00–16:29
  { key: "coffee",        start: 990, end: 1020, label: () => `${fmt(990)}–${fmt(1019)}` },        // 16:30–16:59
  { key: "sunset-work",   start: 1020,end: 1140, label: () => `${fmt(1020)}–${fmt(1139)}` },       // 17:00–18:59
  { key: "night-work",    start: 1140,end: 1320, label: () => `${fmt(1140)}–${fmt(1319)}` },       // 19:00–21:59
  { key: "bed-work",      start: 1320,end: 1440, label: () => `${fmt(1320)}–${fmt(1439)}` },       // 22:00–23:59
];

function currentSlot() {
  const { total } = istHM();
  return SLOTS.find(s => total >= s.start && total < s.end) || SLOTS[0];
}

const slot = currentSlot();

// --- Read last state: skip writing if same slot + same layout (keeps commits minimal) ---
let last = null;
try { last = JSON.parse(fs.readFileSync(statePath, "utf8")); } catch {}
if (last && last.key === slot.key && last.layoutVersion === LAYOUT_VERSION) {
  console.log(`No change: still "${slot.key}" (layout v${LAYOUT_VERSION}). Skipping banner update.`);
  process.exit(0);
}

// Map slot -> image file name
const artMap = {
  "sleep":           "banner-sleep.png",
  "yoga":            "banner-yoga.png",
  "morning-coding":  "banner-morning-coding.png",
  "afternoon":       "banner-afternoon.png",
  "coffee":          "banner-coffee.png",
  "sunset-work":     "banner-sunset-work.png",
  "night-work":      "banner-night-work.png",
  "bed-work":        "banner-bed-work.png",
};

const imgPath = path.join(process.cwd(), "art", artMap[slot.key]);
if (!fs.existsSync(imgPath)) {
  console.error(`ERROR: Missing image for slot "${slot.key}": ${imgPath}`);
  process.exit(1);
}

// Inline PNG so GitHub renders it
const imgBuf = fs.readFileSync(imgPath);
const dataUri = `data:image/png;base64,${imgBuf.toString("base64")}`;

const slotLabel = slot.label();
const tzLabel = "IST (GMT+05:30)";

// --- SVG with combined badge + soft shadow + fun footer ---
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
  </defs>

  <image href="${dataUri}" x="0" y="0" width="1200" height="600" preserveAspectRatio="xMidYMid slice"/>

  <!-- Combined slot + timezone badge -->
  <g transform="translate(24,24)" filter="url(#softShadow)">
    <rect width="420" height="96" rx="18" fill="#0b1220" opacity="0.88"/>
    <text x="24" y="46"
          font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          font-size="28" fill="#34d399">${slotLabel}</text>
    <text x="24" y="76"
          font-family="Inter, Segoe UI, Roboto, Arial"
          font-size="15" fill="#a7f3d0">${tzLabel} • auto-switching banner</text>
  </g>

  <!-- Footer vibe line -->
  <text x="600" y="580" text-anchor="middle"
        font-family="Inter, Segoe UI, Roboto, Arial"
        font-size="18" fill="#6ee7b7">⏱ Watch me change as your day rolls by</text>
</svg>`;

fs.writeFileSync(path.join(outDir, "banner.svg"), svg, "utf8");
fs.writeFileSync(statePath, JSON.stringify({ key: slot.key, slotLabel, layoutVersion: LAYOUT_VERSION }, null, 2), "utf8");

console.log(`Updated slot: ${last?.key ?? "(none)"} → ${slot.key} (${slotLabel}), layout v${LAYOUT_VERSION}.`);
