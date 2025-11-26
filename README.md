# Toilet Paper Pack Generator

Interactive 3D generator for toilet paper packs.  
You can configure roll dimensions and pack layout, visualize the pack in 3D, control the camera, and export a PNG for technical documentation.

Live demo (after you enable GitHub Pages):

> https://c_kupenov-art.github.io/tp-pack-generator/

---

## Features

- **Inputs**
  - Roll diameter (mm)
  - Core diameter (mm)
  - Roll height (mm)
  - Rows (X direction)
  - Rolls per row (Y direction)
  - Layers (Z direction)

- **Calculated automatically**
  - Total rolls per pack
  - Pack outer dimensions (width × depth × height)
  - Pack footprint (top view)

- **3D viewer**
  - Rolls rendered as cylinders with inner core
  - Transparent bounding box representing the pack
  - Mouse controls via OrbitControls (rotate, zoom, pan)
  - Extra sliders:
    - Pack rotation around X and Y
    - Camera angle X, camera angle Y
    - Camera distance (zoom)
    - Camera pan X, pan Y

- **Export**
  - Export the current 3D view as a **PNG** (for technical requirements / documentation)

---

## How to run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
3. No build step and no server required — it's pure HTML + CSS + JavaScript.

---

## How to host with GitHub Pages

1. Make sure the repo is named (for example):

   ```text
   tp-pack-generator
   ```

2. Push these files to the `main` branch of your GitHub repo.

3. In GitHub, go to:

   **Settings → Pages → Build and deployment**

   - Source: **Deploy from branch**
   - Branch: **main**
   - Folder: **/** (root)

4. Save. After a short moment, GitHub will give you a URL like:

   ```text
   https://c_kupenov-art.github.io/tp-pack-generator/
   ```

5. Open that URL — your toilet paper pack generator is hosted publicly.

---

## Tech stack

- **three.js** (CDN) for 3D rendering
- **OrbitControls** for mouse camera control
- Vanilla **HTML / CSS / JavaScript** (no frameworks, no build tools)

---

## Notes

- All dimensions are in **millimetres** internally.
- Pack dimensions assume **tight packing**: rolls touch each other without gaps.
- You can adjust the camera and pack orientation manually and then export a PNG snapshot of the exact view you need.
