# Production portfolio entry archive

This directory preserves the public entry shell that was live before the standalone “Good things are coming” landing page was restored on 2026-09-04.

The completed React portfolio implementation itself remains intact at `src/site/`. This archived HTML file is deliberately outside Vite's configured inputs and outside `public/`, so it is versioned in Git but is not included in the Cloudflare deployment.

To relaunch the portfolio later, restore this `index.html` at the repository root, point `src/App.jsx` back to `./site/App.jsx`, restore the portfolio stylesheet imports in `src/main.jsx`, restore the responsive-media step and public-directory behavior in the build, and restore the staged route and sitemap entries. The full pre-switch state is also available in Git at commit `65015095fa6d05fd70529548b93ea9f27081cd72`.
