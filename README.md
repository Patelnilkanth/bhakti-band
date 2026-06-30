# Bhakti Bands

A quiet, single-page site for an NFC band. Every tap of the band opens this
page and surfaces a fresh **Satsang Diksha** shloka — the Sanskrit verse,
its transliteration, and the English translation — drawn at random from all
**315 verses** written by *Pragat Brahmaswarup Mahant Swami Maharaj*.

The visual language is inspired by [usa.akshardham.org][akshardham] — cream
+ saffron palette, Cormorant Garamond serif, generous whitespace — with a
warm, low-glare dark mode for evening scans.

[akshardham]: https://usa.akshardham.org

## What's on the page

1. **A Verse for You** — a centerpiece card with one Satsang Diksha shloka.
   A new verse is picked on every page load (the last one is remembered for
   the session so a re-tap reliably brings something different).
2. **Another verse / Share / Copy** — quick actions under the card.
3. **Where He Is** — an interactive world map (lazy-loaded Leaflet on
   CARTO light tiles) with a **pulsing blue dot** marking the current
   location of **Mahant Swami Maharaj** at **Sarangpur, Gujarat, India**
   (22.2392° N, 71.7825° E).
4. **About Bhakti Bands** — a short closing note.

## Features

- **🌗 Dark mode** — auto-detects `prefers-color-scheme`; click the sun/moon
  in the header to pin a specific theme (stored in `localStorage`).
- **🔁 Another verse button** — re-rolls without reloading.
- **🔗 Share / Copy** — `navigator.share()` with a `navigator.clipboard`
  fallback. Generates a clean text block: Sanskrit + transliteration +
  English + verse citation + link back to the page.
- **📱 PWA / offline** — `manifest.webmanifest` + `sw.js` mean the band
  works without a network connection after the first visit. Installable
  to the home screen on iOS/Android.
- **🏷️ Verse → source link** — the verse number is a direct deep link to
  the same shloka on anirdesh.com (full footnotes, more languages, audio).
- **⚡ Lazy-loaded map** — Leaflet (~150 KB) only downloads when the
  Presence section scrolls into view, keeping the first paint snappy.
- **🪔 Subtle haptic** — a 10ms vibration on supported phones when a new
  verse is revealed.
- **🔖 Open Graph + Twitter Card** — when the URL is shared, link previews
  render correctly.
- **♿ Accessibility** — `lang="sa-Deva"` on Sanskrit, `lang="sa-Latn"` on
  transliteration, focus rings, ARIA labels, and `prefers-reduced-motion`
  respect throughout.

## How the NFC band works

Write the URL of this site (wherever you host it — GitHub Pages, Netlify,
Cloudflare Pages, your own server) to your NFC band. Each tap opens the
URL in the visitor's browser. `script.js` picks a random index from the
315-verse array and renders the verse — so each tap = a new shloka.

```js
const pick = SHLOKAS[Math.floor(Math.random() * SHLOKAS.length)];
```

A short de-dup loop (8 retries) prevents two consecutive taps from
displaying the same verse.

After the first visit, the Service Worker caches the app shell so future
taps work even with no network.

## Run it

Pure static site — no build, no framework:

```bash
# Either open directly:
open index.html

# Or serve locally (recommended — Service Worker requires HTTP, not file://):
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

```
index.html               Page structure & shloka card markup
styles.css               Cream/saffron + dark theme, animations
shlokas.js               All 315 Satsang Diksha shlokas as window.SHLOKAS
shlokas.json             Same data as plain JSON (handy for tooling)
script.js                Verse picker, theme toggle, share/copy, map, SW
manifest.webmanifest     PWA install manifest
sw.js                    Service Worker — offline support
favicon.svg              ॐ on a saffron disc
README.md                You are here
```

## Where the shlokas come from

The verse data was scraped from
[anirdesh.com/diksha](https://www.anirdesh.com/diksha/), which publishes
the original Gujarati text by Mahant Swami Maharaj, the Sanskrit
translation by Mahamahopadhyay Bhadreshdas Swami, transliterations, and
the English translation. The text is reproduced verbatim — full shlokas,
not shortened.

## Customizing the band

### Move the dot
Change the `SARANGPUR` object near the bottom of `script.js`:

```js
const SARANGPUR = {
  lat: 22.2392,
  lng: 71.7825,
  label: "Mahant Swami Maharaj",
  place: "Sarangpur, Gujarat, India",
};
```

### Override the random pick
If you'd like the band to behave like a "verse of the day" instead of
random, replace the `pickVerse()` function in `script.js`:

```js
function pickVerse() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  return SHLOKAS[dayOfYear % SHLOKAS.length];
}
```

---

Made with devotion. *Bhakti Bands — A verse for the seeking heart.*
