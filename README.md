# Bhakti

A quiet, single-page site for an NFC band. Every tap of the band opens this
page and surfaces a fresh **Satsang Diksha** shloka — the Sanskrit verse,
its transliteration, and the English translation — drawn at random from all
**315 verses** written by *Pragat Brahmaswarup Mahant Swami Maharaj*.

The visual language is inspired by [usa.akshardham.org][akshardham] — cream
+ saffron palette, Cormorant Garamond serif, generous whitespace.

[akshardham]: https://usa.akshardham.org

## What's on the page

1. **A Verse for You** — a centerpiece card that shows one Satsang Diksha
   shloka. A new verse is picked on every page load (the previous verse is
   remembered for the session so a re-tap of the band reliably brings
   something different).
2. **Where He Is** — an interactive world map (Leaflet + OpenStreetMap /
   CARTO light tiles) with a **pulsing blue dot** marking the current
   location of **Mahant Swami Maharaj** at **Sarangpur, Gujarat, India**
   (22.2392° N, 71.7825° E). Clicking the dot opens a small popup.
3. **About Bhakti** — a short closing note.

## How the NFC band works

Write the URL of this site (wherever you host it — GitHub Pages, Netlify,
Cloudflare Pages, your own server, etc.) to your NFC band. Each tap opens
the URL in the visitor's browser. `script.js` picks a random index from
the 315-verse array and renders the verse — so each tap = a new shloka.

```js
const pick = shlokas[Math.floor(Math.random() * shlokas.length)];
```

A short de-dup loop (8 retries) makes sure two consecutive taps don't
display the same verse.

## Run it

Pure static site — no build, no framework:

```bash
# Either open directly:
open index.html

# Or serve locally (recommended, so map tiles + relative scripts load cleanly):
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

```
index.html      Page structure & shloka card markup
styles.css      Cream/saffron theme, shloka typography, animations
shlokas.js      All 315 Satsang Diksha shlokas, as window.SHLOKAS
script.js       Random verse picker + Leaflet map setup
shlokas.json    Same data as shlokas.js but in plain JSON (handy for tooling)
```

## Where the shlokas come from

The verse data was scraped from
[anirdesh.com/diksha](https://www.anirdesh.com/diksha/), which publishes
the original Gujarati text by Mahant Swami Maharaj, the Sanskrit translation
by Mahamahopadhyay Bhadreshdas Swami, the transliterations, and the
English translation. The text is reproduced verbatim — full shlokas, not
shortened.

If you'd like to refresh the data:

```bash
# The parser lives outside the repo (cursor agent-tools); regenerate by
# re-fetching the source pages and re-running parse_shlokas.py.
```

## Move the dot

To pin the marker somewhere else, change the `SARANGPUR` object in
`script.js`:

```js
const SARANGPUR = {
  lat: 22.2392,
  lng: 71.7825,
  label: "Mahant Swami Maharaj",
  place: "Sarangpur, Gujarat, India",
};
```

---

Made with devotion. *Bhakti — A verse for the seeking heart.*
