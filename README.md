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
| `assets/js/site.js` | Mobile menu and module tabs |
| `assets/js/art.js` | Generative illustration drawn on canvas |
| `assets/motion/` | The Violet motion library, copied unchanged |
| `assets/favicon.svg` | The Vertex mark |

Plain HTML, CSS, and JavaScript. No build step and no dependencies beyond
Google Fonts.

## Design direction

A light page in one violet, modeled on the structure of tines.com: large light
sans headlines, a serif for body and emphasis, uppercase mono labels and pill
buttons, one big rounded violet block, colored module tabs that open product
previews, and violet cards.

The illustration is Violet's own: blooms and guilloche rosettes (the fine
line-work of security printing) drawn by `art.js` in the brand's red, violet,
and blue. It is seeded, so it renders the same on every load. Product previews
use the app's dark tokens from the Violet design system.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## Deploy

GitHub Pages serves the `main` branch root. Pushing to `main` publishes the
site within a minute or two.

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
