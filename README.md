# ✦ Crystal Healing Meditation App

A fully-featured, offline-capable meditation app built with pure HTML, CSS, and vanilla JavaScript — no build tools, no dependencies, no server needed.

**[Live Demo →](https://yourusername.github.io/crystal-healing)**

---

## Features

- **4 Daily Sessions** — Morning, Strength, Healing, Evening (fully editable)
- **Weekly Crystal Focus** — 7-day schedule with per-day edit
- **Commute Kit** — Quick practice for travel
- **Session Timer** — Animated ring countdown for each session
- **21× Affirmation Cycling** — Auto-cycles through all affirmations with count tracking
- **Text-to-Speech** — Web Speech API (built into all modern browsers, free)
- **Voice Settings** — Choose voice, speed, pitch
- **Custom Audio Upload** — Upload your own MP3/WAV recordings
- **5 Ambient Sounds** — Generated in real-time via Web Audio API (Singing Bowls, Rain, Forest, Ocean, OM) — no audio files needed
- **Add / Edit / Delete Sessions** — Full CRUD for all sessions
- **Weekly Focus Editor** — Edit each day's crystals and intention
- **Particle Ambient Background** — Floating crystal particle animation
- **Dark / Light Mode**
- **Export / Import** — Save your sessions as JSON, import on another device
- **Mobile-first responsive** — Works perfectly on phone browsers
- **PWA-ready** — Can be saved to home screen (add manifest.json)

---

## Deploy to GitHub Pages (5 minutes)

### Step 1 — Create Repository

1. Go to [github.com](https://github.com) → **New repository**
2. Name it `crystal-healing` (or anything you like)
3. Set to **Public**
4. Click **Create repository**

### Step 2 — Upload Files

**Option A: GitHub Web UI**
1. Click **uploading an existing file**
2. Drag the entire folder contents:
   ```
   index.html
   css/style.css
   js/data.js
   js/audio.js
   js/player.js
   js/editor.js
   js/app.js
   ```
3. Commit changes

**Option B: Git CLI**
```bash
cd crystal-healing
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/crystal-healing.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. In your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `root`
4. Click **Save**
5. Your site will be live at: `https://yourusername.github.io/crystal-healing`

### Step 4 — Use on Mobile

1. Open the URL on your phone
2. In Safari (iOS): tap Share → **Add to Home Screen**
3. In Chrome (Android): tap Menu → **Add to Home Screen**

The app will open like a native app with no browser UI.

---

## Add More Sessions

1. Open the app → **Sessions** tab
2. Click **+ Add New Session**
3. Fill in name, duration, crystals, affirmations
4. Click **Save** — it's stored locally on your device
5. To back up: **Settings** → **Export Sessions JSON**
6. To restore on a new device: **Settings** → **Import Sessions JSON**

---

## Customize for Mobile PWA

Add a `manifest.json` file:

```json
{
  "name": "Crystal Healing",
  "short_name": "Crystals",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#0d0e1a",
  "theme_color": "#9b72d0",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add to `<head>` in index.html:
```html
<link rel="manifest" href="manifest.json" />
<meta name="theme-color" content="#9b72d0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Crystal Healing" />
```

---

## Tech Stack

| Feature | Technology |
|---|---|
| UI | Vanilla HTML/CSS/JS |
| Fonts | Google Fonts (Cormorant Garamond + Inter) |
| TTS Voice | Web Speech API (browser built-in) |
| Ambient Sounds | Web Audio API (generated, no files) |
| Data Storage | localStorage |
| Particles | Canvas 2D API |
| Hosting | GitHub Pages (free) |

---

## License

MIT — use, modify, share freely.
