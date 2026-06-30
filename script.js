/* ============================================================
   Bhakti — interactivity
   - Displays a single reflection chosen in code.
   - Renders a world map with a pulsing blue dot on Sarangpur.
   ============================================================ */

/* ----------------------------------------------------------
   REFLECTION — the one quote shown on the page.
   Edit `text` and `author` to change what visitors see.
   ---------------------------------------------------------- */
const REFLECTION = {
  text: "In happiness and misery, remember that God is by my side.",
  author: "Mahant Swami Maharaj",
};

const quoteTextEl = document.getElementById("quoteText");
const quoteAttrEl = document.getElementById("quoteAttr");

quoteTextEl.textContent = REFLECTION.text;
quoteAttrEl.innerHTML = `&mdash; ${REFLECTION.author}`;

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

// Custom pulsing dot icon
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

// Auto-open the popup once the map is ready
map.whenReady(() => {
  setTimeout(() => marker.openPopup(), 600);
});

// Re-enable scroll-wheel zoom only after explicit click on the map
map.on("click", () => map.scrollWheelZoom.enable());
map.on("mouseout", () => map.scrollWheelZoom.disable());
