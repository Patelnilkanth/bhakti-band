/* ============================================================
   Bhakti — interactivity

   Designed for an NFC band: every scan opens this page and a
   fresh Satsang Diksha shloka is drawn at random and rendered.

   The verse data lives in `shlokas.js` (auto-generated from
   anirdesh.com/diksha) as the global array `window.SHLOKAS`.
   Each entry has the shape:
     {
       n: <number 1..315>,
       sanskrit:        [<line>, <line>, …],   // Devanagari
       transliteration: [<line>, <line>, …],   // IAST-ish transliteration
       english:         "<English translation>"
     }
   ============================================================ */

(function renderShloka() {
  const sanskritEl = document.getElementById("shlokaSanskrit");
  const translitEl = document.getElementById("shlokaTranslit");
  const englishEl  = document.getElementById("shlokaEnglish");
  const numEl      = document.getElementById("shlokaNum");

  const shlokas = Array.isArray(window.SHLOKAS) ? window.SHLOKAS : [];

  if (!shlokas.length) {
    englishEl.textContent =
      "In happiness and misery, remember that God is by my side.";
    numEl.textContent = "Mahant Swami Maharaj";
    return;
  }

  // Pick a random verse. We try to avoid showing the same verse
  // twice in a row by remembering the last one in sessionStorage
  // (so a re-tap on the NFC band genuinely brings something new).
  const lastN = Number(sessionStorage.getItem("bhakti.lastN") || 0);
  let pick = shlokas[Math.floor(Math.random() * shlokas.length)];
  if (shlokas.length > 1) {
    let guard = 0;
    while (pick.n === lastN && guard++ < 8) {
      pick = shlokas[Math.floor(Math.random() * shlokas.length)];
    }
  }
  sessionStorage.setItem("bhakti.lastN", String(pick.n));

  // Render Sanskrit lines (Devanagari).
  sanskritEl.innerHTML = pick.sanskrit
    .map((ln) => `<span class="line">${escapeHtml(ln)}</span>`)
    .join("");

  // Render transliteration lines.
  translitEl.innerHTML = (pick.transliteration || [])
    .map((ln) => `<span class="line">${escapeHtml(ln)}</span>`)
    .join("");

  // English translation. We strip the trailing "(N)" or "(4-5)" the
  // source page appends, since we already show the verse number in
  // the figcaption.
  const english = String(pick.english || "")
    .replace(/\s*\(\s*\d{1,3}\s*[-–]?\s*\d{0,3}\s*\)\s*$/, "")
    .trim();
  englishEl.textContent = english;

  // Verse number, written naturally.
  numEl.textContent = formatVerseLabel(pick.n);

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatVerseLabel(n) {
    return "Shloka " + n + " of 315";
  }
})();

/* ----------------------------------------------------------
   World Map — Leaflet + OpenStreetMap
   Pin: Mahant Swami Maharaj — Sarangpur, Gujarat, India
   ---------------------------------------------------------- */
const SARANGPUR = {
  lat:  22.2392,
  lng:  71.7825,
  label: "Mahant Swami Maharaj",
  place: "Sarangpur, Gujarat, India",
};

const map = L.map("worldMap", {
  center: [SARANGPUR.lat, SARANGPUR.lng],
  zoom: 3,
  minZoom: 2,
  maxZoom: 7,
  worldCopyJump: true,
  scrollWheelZoom: false,
  zoomControl: true,
  attributionControl: true,
});

// A clean, low-saturation tile layer that fits the cream/saffron palette.
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

const pulsingIcon = L.divIcon({
  className: "bhakti-marker-wrap",
  html: `
    <div class="bhakti-marker">
      <div class="pulse"></div>
      <div class="pulse-2"></div>
      <div class="core"></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

const marker = L.marker([SARANGPUR.lat, SARANGPUR.lng], {
  icon: pulsingIcon,
  title: `${SARANGPUR.label} — ${SARANGPUR.place}`,
  alt: `${SARANGPUR.label} is at ${SARANGPUR.place}`,
}).addTo(map);

marker.bindPopup(
  `<div style="font-family: 'Cormorant Garamond', Georgia, serif;
               text-align:center; padding: 4px 6px; min-width: 180px;">
     <div style="font-size: 1.05rem; font-weight: 600; color:#2a2014;">
       ${SARANGPUR.label}
     </div>
     <div style="font-size: 0.78rem; letter-spacing: 0.14em;
                 text-transform: uppercase; color: #8a7860; margin-top: 4px;">
       ${SARANGPUR.place}
     </div>
   </div>`,
  { closeButton: false, offset: [0, -4] }
);

map.whenReady(() => {
  setTimeout(() => marker.openPopup(), 600);
});

map.on("click", () => map.scrollWheelZoom.enable());
map.on("mouseout", () => map.scrollWheelZoom.disable());
