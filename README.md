# Bhakti

A quiet, single-page site for daily reflection — inspired by the visual
language of [usa.akshardham.org](https://usa.akshardham.org) (cream + saffron
palette, refined serif typography, generous white space).

## What's on the page

1. **Today's Reflection** — a centerpiece quote card showing a single
   reflection that you set in code (see below).
2. **Where He Is** — an interactive world map (Leaflet + OpenStreetMap /
   CARTO light tiles) with a **pulsing blue dot** marking the current location
   of **Mahant Swami Maharaj** at **Sarangpur, Gujarat, India**
   (22.2392° N, 71.7825° E). Clicking the dot opens a small popup.
3. **About Bhakti** — a short closing note.

## Run it

It's a pure static site — just open `index.html` in your browser:

```bash
open index.html
```

Or serve it locally (recommended, so the map tiles load cleanly):

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Edit the reflection

Open `script.js` and edit the `REFLECTION` object near the top of the file:

```js
const REFLECTION = {
  text: "In happiness and misery, remember that God is by my side.",
  author: "Mahant Swami Maharaj",
};
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

## Files

```
index.html    Page structure & content
styles.css    All styling (cream/saffron theme, animations)
script.js     Quote rotation + Leaflet map setup
```

No build step. No framework. Just HTML, CSS, and a sprinkle of JS.
