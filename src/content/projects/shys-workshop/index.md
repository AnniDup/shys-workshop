---
# Standard
title: Shy's Workshop
summary: This site. The build, its workflow and its changelog, logged here as it grows.
domain: digital
kind: site
status: development
version: 0.10.0
started: 2026-09-26
# released: 2026-01-01    # required once maintained or unmaintained
updated: 2026-09-26
draft: false

# AI usage: level is none, assisted, co-built or generated.
# Models are required unless level is none.
ai:
  level: co-built
  models: [Claude Opus 5.5]
  # notes: What the AI helped with

# Links shown on the project page:
links:
  - { label: GitHub repository, url: https://github.com/AnniDup/shys-workshop, type: repo }

# Card image for lists (3:4 portrait):
# thumbnail:
#   src: ./images/thumbnail.jpg
#   alt: Describe what the image shows

# Images for the project page:
# images:
#   - src: ./images/overview.jpg
#     alt: Describe what the image shows
#     caption: Optional short caption

# Digital
platforms: [Web]
stack: [Astro, TypeScript, GitHub Actions, GitHub Pages]
---

A ground-up rebuild of my project site, built framework first: design tokens, a strict content schema and a checked release pipeline before any content.

Work happens on `dev`. Every push is type-checked and built on GitHub, and releases go to `main` through a pull request, which deploys to GitHub Pages.
