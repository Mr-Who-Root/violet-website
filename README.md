# Violet website

The public website for Violet, the red/blue team and incident-response
platform. Violet is deploying soon; this site describes the product and its
launch plan.

Live at: https://mr-who-root.github.io/violet-website/

## Structure

| Path | Contents |
| --- | --- |
| `index.html` | The site: a single page with anchored sections |
| `404.html` | Not-found page |
| `assets/css/site.css` | Styles, built on the Violet design tokens |
| `assets/js/site.js` | Theme toggle, mobile menu, role tabs |
| `assets/motion/` | The Violet motion library, copied unchanged |
| `assets/favicon.svg` | The Vertex mark |

Plain HTML, CSS, and JavaScript. No build step and no dependencies beyond
Google Fonts.

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
- Copy follows the Violet brand guide: plain, specific, sentence case, no hype
  words, no emoji, no exclamation marks.
- Design follows the Violet design system: dark-first with a light theme, flat
  violet used sparingly, no gradients or glassmorphism, color only where it
  carries meaning, monospace for data.
- Product illustrations are labeled as examples and use reserved documentation
  IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24). No invented
  customers, logos, testimonials, or metrics.
- The page has a Content Security Policy. Keep scripts and styles in files; if
  the inline theme script changes, update its hash in the policy on both pages.
