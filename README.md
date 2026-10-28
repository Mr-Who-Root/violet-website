# Violet website

The public website for Violet, the red/blue team and incident-response
platform. Violet is deploying soon; this site describes the product and its
launch plan.

Live at: https://mr-who-root.github.io/violet-website/

## Structure

| Path | Contents |
| --- | --- |
| `index.html` | The site: one page with anchored sections |
| `404.html` | Not-found page |
| `assets/css/site.css` | Styles and design tokens |
| `assets/js/site.js` | Menus, mobile navigation, and module tabs |
| `assets/js/art.js` | Generative illustration drawn on canvas |
| `assets/motion/` | The Violet motion library, copied unchanged |
| `assets/favicon.svg` | The Vertex mark |
| `tools/stamp.py` | Adds content hashes to asset URLs |

Plain HTML, CSS, and JavaScript. No build step and no dependencies beyond
Google Fonts.

## Design direction

The layout follows tines.com: large light headlines, a serif for body text,
pill buttons, menus that open panels of cards, a feature block, and module tabs
that open product previews.

Colour follows the Violet design system (`DESIGN.md` in the product repo):
the light theme's cool neutrals for the page, the dark theme for the feature
block and the product stage, violet as a flat accent for primary actions and
selection only, and red and blue only for red-team and blue-team context. The
logo is the full-colour Vertex mark from the logo kit.

The illustration is drawn by `art.js` on canvas: circuit-board letterforms
covered in security objects (padlocks, keys, chips, servers, terminals,
targets, bugs, network graphs), a SOC monitor wall, and a radar scope. Packets
move along the traces and cables, the radars sweep, and the monitors update.
Motion runs only while a canvas is on screen and is off under
`prefers-reduced-motion`.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## Deploy

GitHub Pages serves the `main` branch root. Pushing to `main` publishes the
site within a minute or two.

GitHub Pages lets browsers cache CSS and JS for 10 minutes, so every asset URL
carries a content hash. After changing anything under `assets/`, run this
before committing:

```bash
python3 tools/stamp.py
```

## Rules

- This repository is public. Never add source code, credentials, internal
  plans beyond the public launch order, pricing, or patent details.
- Copy follows the Violet brand guide: plain, specific, no hype words, no emoji,
  no exclamation marks. Uppercase applies only to mono labels and buttons, as
  part of the site's visual style.
- Product previews use reserved documentation IP ranges (192.0.2.0/24,
  198.51.100.0/24, 203.0.113.0/24). No invented customers, logos, testimonials,
  or metrics.
- The page has a strict Content Security Policy: scripts and styles come from
  files only, with no inline scripts or `style` attributes.
