/* ============================================================
   Bhakti — interactivity

   Designed for an NFC band: every scan opens this page and a
   fresh Satsang Diksha shloka is drawn at random and rendered.
   Includes:
     • light/dark theme toggle (with localStorage persistence)
     • "Another verse" / share / copy actions
     • lazy-loaded Leaflet map (loads on scroll)
     • Service Worker registration for offline use
     • optional haptic feedback on reveal

   Verse data lives in `shlokas.js` as `window.SHLOKAS`.
   ============================================================ */

(function () {
  "use strict";

  const SHLOKAS = Array.isArray(window.SHLOKAS) ? window.SHLOKAS : [];
  const PREFERS_REDUCED_MOTION =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --------------------------------------------------------------
  // DOM references
  // --------------------------------------------------------------
  const cardEl      = document.getElementById("shlokaCard");
  const sanskritEl  = document.getElementById("shlokaSanskrit");
  const translitEl  = document.getElementById("shlokaTranslit");
  const englishEl   = document.getElementById("shlokaEnglish");
  const numEl       = document.getElementById("shlokaNum");

  const nextBtn        = document.getElementById("nextBtn");
  const shareBtn       = document.getElementById("shareBtn");
  const shareLabel     = document.getElementById("shareBtnLabel");
  const copyBtn        = document.getElementById("copyBtn");
  const copyLabel      = document.getElementById("copyBtnLabel");
  const themeToggle    = document.getElementById("themeToggle");
  const toast          = document.getElementById("toast");

  let currentVerse = null;

  // --------------------------------------------------------------
  // Verse rendering
  // --------------------------------------------------------------
  function pickVerse() {
    if (!SHLOKAS.length) return null;
    const lastN = Number(sessionStorage.getItem("bhakti.lastN") || 0);
    let pick = SHLOKAS[Math.floor(Math.random() * SHLOKAS.length)];
    if (SHLOKAS.length > 1) {
      let guard = 0;
      while (pick.n === lastN && guard++ < 8) {
        pick = SHLOKAS[Math.floor(Math.random() * SHLOKAS.length)];
      }
    }
    sessionStorage.setItem("bhakti.lastN", String(pick.n));
    return pick;
  }

  function renderVerse(pick) {
    if (!pick) {
      englishEl.textContent =
        "In happiness and misery, remember that God is by my side.";
      if (numEl) numEl.textContent = "Mahant Swami Maharaj";
      return;
    }
    currentVerse = pick;

    sanskritEl.innerHTML = pick.sanskrit
      .map((ln) => `<span class="line">${escapeHtml(ln)}</span>`)
      .join("");

    translitEl.innerHTML = (pick.transliteration || [])
      .map((ln) => `<span class="line">${escapeHtml(ln)}</span>`)
      .join("");

    const english = String(pick.english || "")
      .replace(/\s*\(\s*\d{1,3}\s*[-–]?\s*\d{0,3}\s*\)\s*$/, "")
      .trim();
    englishEl.textContent = english;

    if (numEl) {
      numEl.textContent = "Shloka " + pick.n + " of 315";
      numEl.href = sourceUrl(pick.n);
    }

    // Subtle haptic on phones that support it (no-op on iOS Safari).
    if (!PREFERS_REDUCED_MOTION && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch (_) {}
    }
  }

  function showAnother() {
    if (!SHLOKAS.length) return;
    if (PREFERS_REDUCED_MOTION) {
      renderVerse(pickVerse());
      return;
    }
    cardEl.classList.add("is-fading");
    setTimeout(() => {
      renderVerse(pickVerse());
      cardEl.classList.remove("is-fading");
    }, 220);
  }

  // --------------------------------------------------------------
  // Share / copy
  // --------------------------------------------------------------
  function verseAsText(v) {
    const eng = String(v.english || "")
      .replace(/\s*\(\s*\d{1,3}\s*[-–]?\s*\d{0,3}\s*\)\s*$/, "")
      .trim();
    return (
      v.sanskrit.join("\n") + "\n\n" +
      (v.transliteration || []).join("\n") + "\n\n" +
      eng + "\n\n" +
      "— Satsang Diksha, Shloka " + v.n + "\n" +
      sourceUrl(v.n)
    );
  }

  async function shareVerse() {
    if (!currentVerse) return;
    const text = verseAsText(currentVerse);
    const shareData = {
      title: "Bhakti Bands — Satsang Diksha",
      text: text,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
        // fall through to clipboard
      }
    }
    await copyText(text, shareBtn, shareLabel, "Copied!");
  }

  async function copyVerse() {
    if (!currentVerse) return;
    await copyText(verseAsText(currentVerse), copyBtn, copyLabel, "Copied!");
  }

  async function copyText(text, btn, labelEl, msg) {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = legacyCopy(text);
      }
    } catch (_) {
      ok = legacyCopy(text);
    }

    if (ok) {
      showToast(msg);
      if (btn && labelEl) {
        const prev = labelEl.textContent;
        labelEl.textContent = "Copied";
        btn.classList.add("is-confirmed");
        setTimeout(() => {
          labelEl.textContent = prev;
          btn.classList.remove("is-confirmed");
        }, 1400);
      }
    } else {
      showToast("Copy failed");
    }
  }

  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  // --------------------------------------------------------------
  // Toast
  // --------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  // --------------------------------------------------------------
  // Theme toggle (light / dark, with auto-from-system default)
  // --------------------------------------------------------------
  function readStoredTheme() {
    try { return localStorage.getItem("bhakti.theme") || "auto"; } catch (_) { return "auto"; }
  }
  function writeStoredTheme(theme) {
    try {
      if (theme === "auto") localStorage.removeItem("bhakti.theme");
      else localStorage.setItem("bhakti.theme", theme);
    } catch (_) {}
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    if (!themeToggle) return;
    let theme = readStoredTheme();
    applyTheme(theme);
    themeToggle.addEventListener("click", () => {
      // Toggle: figure out what's currently being displayed and flip it.
      const systemDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const current = theme === "auto" ? (systemDark ? "dark" : "light") : theme;
      theme = current === "dark" ? "light" : "dark";
      applyTheme(theme);
      writeStoredTheme(theme);
    });
  }

  // --------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sourceUrl(n) {
    return "https://www.anirdesh.com/diksha/index.php?increment=1&shlok=" + n;
  }

  // --------------------------------------------------------------
  // Init: verse + actions + theme + service worker
  // --------------------------------------------------------------
  renderVerse(pickVerse());
  initTheme();

  if (nextBtn)  nextBtn.addEventListener("click", showAnother);
  if (shareBtn) shareBtn.addEventListener("click", shareVerse);
  if (copyBtn)  copyBtn.addEventListener("click", copyVerse);

  // Hide the Share button entirely if the platform truly can't share or copy.
  if (shareBtn && !navigator.share && !navigator.clipboard && !document.queryCommandSupported) {
    shareBtn.style.display = "none";
  }

  // --------------------------------------------------------------
  // Service Worker — enables offline mode for the band
  // --------------------------------------------------------------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        /* SW is a progressive enhancement — silently ignore failures. */
      });
    });
  }

  // --------------------------------------------------------------
  // Map — lazy-loaded Leaflet
  // --------------------------------------------------------------
  initLazyMap();

  function initLazyMap() {
    const mapEl = document.getElementById("worldMap");
    if (!mapEl) return;

    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      loadLeaflet()
        .then(() => initMap(mapEl))
        .catch(() => {
          mapEl.innerHTML =
            '<div class="map-placeholder" style="font-style:italic">' +
            'Map unavailable — Mahant Swami Maharaj is in Sarangpur, Gujarat.</div>';
        });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: "200px" }
      );
      io.observe(mapEl);
    } else {
      // Old browsers — just load immediately.
      load();
    }
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      css.crossOrigin = "";
      document.head.appendChild(css);

      const js = document.createElement("script");
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      js.crossOrigin = "";
      js.async = true;
      js.onload = () => resolve();
      js.onerror = () => reject(new Error("Failed to load Leaflet"));
      document.head.appendChild(js);
    });
  }

  function initMap(mapEl) {
    const SARANGPUR = {
      lat: 22.2392,
      lng: 71.7825,
      label: "Mahant Swami Maharaj",
      place: "Sarangpur, Gujarat, India",
    };

    // Clear the placeholder before Leaflet takes over.
    mapEl.innerHTML = "";

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
      html:
        '<div class="bhakti-marker">' +
        '<div class="pulse"></div>' +
        '<div class="pulse-2"></div>' +
        '<div class="core"></div>' +
        "</div>",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10],
    });

    const marker = L.marker([SARANGPUR.lat, SARANGPUR.lng], {
      icon: pulsingIcon,
      title: SARANGPUR.label + " — " + SARANGPUR.place,
      alt: SARANGPUR.label + " is at " + SARANGPUR.place,
    }).addTo(map);

    marker.bindPopup(
      '<div style="font-family: \'Cormorant Garamond\', Georgia, serif;' +
      ' text-align:center; padding: 4px 6px; min-width: 180px;">' +
      '<div style="font-size: 1.05rem; font-weight: 600; color:#2a2014;">' +
      SARANGPUR.label + "</div>" +
      '<div style="font-size: 0.78rem; letter-spacing: 0.14em;' +
      " text-transform: uppercase; color: #8a7860; margin-top: 4px;\">" +
      SARANGPUR.place + "</div></div>",
      { closeButton: false, offset: [0, -4] }
    );

    map.whenReady(() => {
      setTimeout(() => marker.openPopup(), 600);
    });

    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());
  }
})();
