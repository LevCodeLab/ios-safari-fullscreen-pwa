# Field Guide: Fixing iOS Safari 100vh Blank Space & Edge-to-Edge Bleed

## 1. Why iOS Safari Leaves Ugly Blank Gaps by Default

Out of the box, mobile Safari refuses to render web apps edge-to-edge and hits you with three classic traps:

1. **Notch & Home-Bar Letterboxing**:
   - Without explicit viewport hints, WebKit boxes your page between the Dynamic Island and the bottom home indicator, leaving dead margins above and below.

2. **The `100vh` Trap**:
   - On iOS Safari, `100vh` equals the viewport height **only when the floating URL bar is collapsed**.
   - On initial page load (when the URL bar is expanded), `100vh` is taller than the actual visible screen, shoving your bottom CTA buttons and tab bars underneath Safari's chrome.

3. **The `body { overflow: hidden }` Trap**:
   - Many desktop devs lock `html, body { height: 100%; overflow: hidden }` and scroll an inner `<div className="scroll-area">`.
   - **This completely breaks Safari's floating URL bar**: WebKit only collapses the floating address bar and blurs page content behind it when the **document (`window` / `body`)** itself scrolls.

---

## 2. The 4-Part Fix

```text
+----------------------------------------------+
|  Dynamic Island / Notch                      | <-- env(safe-area-inset-top)
|  [Sticky Curved Top Window Flush to Glass]   |
|                                              |
|  Natural Document Scroll Cards               |
|                                              |
|  [Floating Obsidian Navbar Capsule]          | <-- fixed + env(safe-area-inset-bottom)
|  ~~~~~~~~ Content Glides & Blurs ~~~~~~~~~~~ |
|  [ Safari Translucent Floating URL Bar ]     |
+----------------------------------------------+
```

### Step 1: HTML `<head>` Directives

Put these exact tags into `index.html`:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
/>
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#0A0A0D" />
```

### Step 2: Document Root & Natural Body Scrolling

Never lock `body` with `overflow: hidden`. Let the document scroll naturally:

```css
html {
  width: 100%;
  min-height: 100%;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  background-color: #0a0a0d;
}

body {
  width: 100%;
  min-height: 100%;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  background-color: #0a0a0d;
  color: #ffffff;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0;
  padding: 0;
}
```

### Step 3: Bottom Scroll Clearance Formula

Because your bottom navbar and Safari's address bar float above the document, add calculated bottom padding on the main content wrapper so the last card is never trapped:

```css
.workspaceScrollArea {
  padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 96px);
}
```

Where `96px = 56px (navbar height) + 40px (breathing room)`.

### Step 4: `--vh` Fallback Listener for In-App WebViews

Older iOS WebViews (social apps, embedded WebKit) sometimes misreport `dvh`. Sync `--vh` from `window.innerHeight`:

```ts
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);
```

---

## 3. Sticky Top Curved Window Pattern

If you want a pinned top header card while workspace items slide cleanly underneath its curved bottom border:

1. Give the top container `position: sticky; top: 0; z-index: 50; touch-action: pan-y;` and curved bottom corners (`border-bottom-left-radius: 36px; border-bottom-right-radius: 36px;`).
2. Keep the scrolling list at `position: relative; z-index: 10;`.
3. `touch-action: pan-y` makes vertical swipes directly over the sticky header still scroll the page smoothly.
